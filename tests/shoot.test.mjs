import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/shoot.mjs');
const { resolvePlaywright, launchBrowser, findChromeExecutable, withSuffix, summarize, compactJson } = await import(SCRIPT);

const playwright = resolvePlaywright();
const NO_PLAYWRIGHT = playwright ? false : 'Playwright is not resolvable here';

// A small page with planted problems.
const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Planted</title>
<style>
  body { margin: 0; font: 16px/1.5 Arial, sans-serif; color: #111; background: #fff; }
  a:focus { outline: none; }
  .faint { color: #aaaaaa; }
  .tiny { display: inline-block; width: 16px; height: 16px; background: #333; }
  .stat { font-size: 32px; }
  .spacer { height: 1600px; }
</style></head>
<body>
<main>
  <h1>Title</h1>
  <h3>Skipped a level</h3>
  <p class="faint" id="faint">This light gray sentence is planted to fail the contrast check on white.</p>
  <span class="stat">1,234,567</span>
  <a class="tiny" href="#" aria-label="tiny"></a>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'/%3E">
  <div class="spacer"></div>
</main>
</body></html>`;

function shoot(args, env = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, ...env }, timeout: 120000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function tempPage() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-shoot-'));
  fs.writeFileSync(path.join(dir, 'index.html'), PAGE);
  return dir;
}

test('helpers: state suffixes, compact JSON and summary flags', () => {
  assert.equal(withSuffix('file:///a/index.html', '?state=empty'), 'file:///a/index.html?state=empty');
  assert.equal(withSuffix('http://x.test/p?a=1#top', '?state=error'), 'http://x.test/p?a=1&state=error#top');
  assert.equal(withSuffix('http://x.test/p', '#loading'), 'http://x.test/p#loading');
  assert.equal(withSuffix('http://x.test/p', '/settings'), 'http://x.test/p/settings');

  assert.equal(compactJson({ a: [1, 2], b: 'x' }), '{"a":[1,2],"b":"x"}');
  assert.ok(compactJson({ long: 'y'.repeat(120), n: 1 }).includes('\n  "n": 1'));

  const flags = summarize({
    type: { distinctSizes: 14 },
    contrast: { failCount: 6, minRatio: 2.4 },
    targets: { under24: 3, under24Items: [{ w: 16, h: 16 }] },
    a11y: { focusVisibleRule: false, reducedMotionRule: false, motionElements: 4, outlineNoneCount: 0 },
    headings: { skippedLevels: ['h1→h3'], h1Count: 1 },
  });
  assert.ok(flags.includes('14 distinct font sizes (studio default ≤ 7)'));
  assert.ok(flags.includes('6 contrast failures (min 2.4:1)'));
  assert.ok(flags.some((f) => f.startsWith('3 targets under 24px')));
  assert.ok(flags.includes('no :focus-visible rule'));
  assert.ok(flags.some((f) => f.startsWith('no prefers-reduced-motion rule')));
  assert.ok(flags.includes('heading levels skip h1→h3'));
});

test('bad input exits 2 with a one-line message', () => {
  const missing = shoot([path.join(os.tmpdir(), 'no-such-page-xyz.html'), '--out', os.tmpdir()]);
  assert.equal(missing.code, 2);
  assert.match(missing.stderr, /target not found/);
  assert.equal(missing.stderr.trim().split('\n').length, 1);
  assert.equal(shoot([tempPage()]).code, 2, '--out is required');
  assert.equal(shoot([tempPage(), '--out', os.tmpdir(), '--viewports', 'watch']).code, 2);
});

test('shoots a page with --measure and catches the planted problems', { skip: NO_PLAYWRIGHT, timeout: 120000 }, (t) => {
  const dir = tempPage();
  const out = path.join(dir, 'shots');
  const critic = path.join(dir, 'critic-view');
  const res = shoot([path.join(dir, 'index.html'), '--out', out, '--viewports', 'desktop,mobile', '--tiles', '1', '--grayscale', '--measure', '--critic-copy', critic]);
  if (res.code === 3) return t.skip(`no browser could launch: ${res.stderr.trim()}`);
  assert.equal(res.code, 0, res.stderr);
  const result = JSON.parse(res.stdout);

  for (const name of ['desktop-top.png', 'desktop-tile-1.png', 'desktop-gray-top.png', 'mobile-top.png', 'mobile-tile-1.png']) {
    const file = path.join(fs.realpathSync(out), name);
    assert.ok(result.shots.map((s) => fs.realpathSync(s)).includes(file), name);
    const png = fs.readFileSync(file);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.deepEqual([w, h], name.startsWith('desktop') ? [1440, 900] : [390, 844], `${name} is one viewport at scale 1`);
  }

  // Critic copies: one random 6-hex folder, neutral names, absolute paths.
  assert.equal(result.criticFiles.length, result.shots.length);
  for (const file of result.criticFiles) {
    assert.ok(path.isAbsolute(file) && fs.existsSync(file));
    assert.match(path.basename(path.dirname(file)), /^[0-9a-f]{6}$/);
    assert.match(path.basename(file), /^(desktop|mobile)-(top|tile-\d|gray-top)\.png$/);
  }

  assert.ok(result.aria && fs.readFileSync(result.aria, 'utf8').includes('heading "Title"'));
  const measure = JSON.parse(fs.readFileSync(result.measure, 'utf8'));
  const d = measure.viewports.desktop;
  for (const key of ['page', 'type', 'measure', 'headings', 'color', 'contrast', 'targets', 'ctas', 'images', 'a11y', 'craft', 'summary']) {
    assert.ok(d[key] !== undefined, `desktop.${key}`);
  }
  assert.equal(d.page.viewport.width, 1440);
  assert.equal(d.page.lang, 'en');

  const failure = d.contrast.failures.find((f) => f.selector.includes('#faint'));
  assert.ok(failure, 'planted contrast failure detected');
  assert.equal(failure.fg, '#aaaaaa');
  assert.equal(failure.bg, '#ffffff');
  assert.ok(failure.ratio < 4.5 && failure.ratio > 2);
  assert.equal(failure.required, 4.5);

  assert.deepEqual(d.headings.skippedLevels, ['h1→h3']);
  assert.ok(d.targets.under24 >= 1, 'the 16px link is under 24px');
  assert.ok(d.targets.under24Items.some((x) => x.w === 16 && x.h === 16));
  assert.ok(measure.viewports.mobile.targets.under44 >= 1);
  assert.equal(d.images.missingAlt, 1);
  assert.equal(d.a11y.focusVisibleRule, false);
  assert.equal(d.craft.numericWithoutTabularCount, 1);
  assert.ok(d.type.sizes['16px'] > 0);
  assert.ok(measure.summary.some((f) => /contrast failure/.test(f)));
  assert.ok(measure.summary.includes('heading levels skip h1→h3'));
});

test('launchBrowser returns a working browser for other scripts', { skip: NO_PLAYWRIGHT, timeout: 60000 }, async (t) => {
  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    return t.skip(`no browser could launch: ${err.message}`);
  }
  try {
    const page = await browser.newPage();
    await page.setContent('<p>ok</p>');
    assert.equal(await page.textContent('p'), 'ok');
  } finally {
    await browser.close();
  }
});

test('without Playwright, falls back to the headless Chrome CLI (top shots only)', { skip: findChromeExecutable() ? false : 'no Chrome/Chromium executable', timeout: 120000 }, () => {
  const dir = tempPage();
  const res = shoot([path.join(dir, 'index.html'), '--out', path.join(dir, 'cli'), '--viewports', 'mobile', '--measure'], { STUDIO_PLAYWRIGHT_PATH: 'none' });
  if (res.code === 3) return;
  assert.equal(res.code, 0, res.stderr);
  const result = JSON.parse(res.stdout);
  assert.equal(result.shots.length, 1);
  assert.match(result.shots[0], /mobile-top\.png$/);
  assert.equal(result.measure, null);
  assert.ok(result.warnings.some((w) => /Playwright not found/.test(w)));
});
