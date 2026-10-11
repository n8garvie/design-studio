import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/contrast.mjs');
const { contrastRatio, parseColor, checkTokens } = await import(SCRIPT);

function run(args, cwd = os.tmpdir()) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'studio-contrast-'));
const near = (actual, expected, tol, msg) => assert.ok(Math.abs(actual - expected) <= tol, `${msg ?? ''} expected ${expected} ± ${tol}, got ${actual}`);

test('known WCAG ratios', () => {
  near(contrastRatio('#777', '#fff'), 4.48, 0.01, '#777 on #fff');
  assert.equal(contrastRatio('#000', '#fff'), 21);
  assert.equal(contrastRatio('#fff', '#000'), 21, 'order does not matter');
  assert.equal(contrastRatio('white', 'white'), 1);
  near(contrastRatio('#9ca3af', '#ffffff'), 2.54, 0.01, 'tailwind gray-400 on white');
});

test('parses hex, rgb, hsl and named colors', () => {
  assert.deepEqual(parseColor('#f00'), { r: 255, g: 0, b: 0, a: 1 });
  assert.deepEqual(parseColor('#00ff0080'), { r: 0, g: 255, b: 0, a: 128 / 255 });
  assert.deepEqual(parseColor('rgb(10 20 30 / 50%)'), { r: 10, g: 20, b: 30, a: 0.5 });
  assert.deepEqual(parseColor('rgba(10, 20, 30, 0.25)'), { r: 10, g: 20, b: 30, a: 0.25 });
  const red = parseColor('hsl(0 100% 50%)');
  assert.deepEqual([red.r, red.g, red.b].map(Math.round), [255, 0, 0]);
  assert.equal(parseColor('transparent').a, 0);
  assert.throws(() => parseColor('not-a-color'));
});

test('oklch parsing is sane', () => {
  const white = parseColor('oklch(1 0 0)');
  const black = parseColor('oklch(0% 0 0)');
  assert.deepEqual([white.r, white.g, white.b].map(Math.round), [255, 255, 255]);
  assert.deepEqual([black.r, black.g, black.b].map(Math.round), [0, 0, 0]);
  // Published OKLCH value of sRGB red.
  const red = parseColor('oklch(62.8% 0.2577 29.23)');
  near(red.r, 255, 1.5, 'red.r');
  near(red.g, 0, 1.5, 'red.g');
  near(red.b, 0, 1.5, 'red.b');
  assert.ok(!red.outOfGamut, 'red is inside sRGB');
  // L as a percentage and as 0-1 mean the same thing.
  assert.deepEqual(parseColor('oklch(50% 0.1 200)'), parseColor('oklch(0.5 0.1 200deg)'));
  // A very saturated green is outside sRGB: clamped and flagged.
  const wide = parseColor('oklch(0.7 0.4 150)');
  assert.equal(wide.outOfGamut, true);
  for (const ch of [wide.r, wide.g, wide.b]) assert.ok(ch >= 0 && ch <= 255);
  near(contrastRatio('oklch(0 0 0)', 'oklch(1 0 0)'), 21, 0.01);
});

test('a translucent foreground is composited over the background', () => {
  // 50% black on white is mid grey, far below 21:1.
  const ratio = contrastRatio('#00000080', '#fff');
  assert.ok(ratio > 3 && ratio < 5, `got ${ratio}`);
});

test('single pair CLI exits 1 when AA normal fails, unless --use large', () => {
  assert.equal(run(['#000', '#fff']).code, 0);
  const fail = run(['#777', '#fff']);
  assert.equal(fail.code, 1);
  assert.match(fail.stdout, /4\.4\d:1/);
  assert.match(fail.stdout, /AA normal.*FAIL/);
  assert.equal(run(['#777', '#fff', '--use', 'large']).code, 0);
  assert.equal(run(['#777']).code, 2, 'missing bg is a usage error');
});

test('--pairs exits 1 when any pair fails and 0 when all pass', () => {
  const dir = tempDir();
  const bad = path.join(dir, 'bad.json');
  fs.writeFileSync(bad, JSON.stringify([
    { name: 'body', fg: '#111', bg: '#fff' },
    { name: 'subtle', fg: '#9ca3af', bg: '#ffffff' },
    { name: 'heading', fg: '#777', bg: '#fff', use: 'large' },
  ]));
  const res = run(['--pairs', bad, '--json']);
  assert.equal(res.code, 1, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.equal(out.total, 3);
  assert.equal(out.failed, 1);
  assert.equal(out.rows.find((r) => r.name === 'subtle').pass, false);
  assert.equal(out.rows.find((r) => r.name === 'heading').pass, true, 'large text needs only 3:1');

  const good = path.join(dir, 'good.json');
  fs.writeFileSync(good, JSON.stringify([{ name: 'body', fg: '#111', bg: '#fff' }, { name: 'ring', fg: '#767676', bg: '#fff', use: 'ui' }]));
  assert.equal(run(['--pairs', good]).code, 0);
  assert.equal(run(['--pairs', path.join(dir, 'missing.json')]).code, 2);
});

test('--tokens checks shadcn-style pairs and resolves var() references', () => {
  const css = `
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --muted-foreground: 215.4 16.3% 66.9%;
      --primary: oklch(0.55 0.2 290);
      --primary-foreground: var(--background);
      --card: #ffffff;
      --card-foreground: var(--foreground);
    }`;
  const rows = checkTokens(css);
  const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.equal(byName['--foreground on --background'].pass, true);
  assert.equal(byName['--muted-foreground on --background'].pass, false);
  assert.ok(byName['--primary-foreground on --primary'], 'var() resolved');
  assert.equal(byName['--card-foreground on --card'].pass, true);

  const dir = tempDir();
  fs.writeFileSync(path.join(dir, 'tokens.css'), css);
  assert.equal(run(['--tokens', 'tokens.css'], dir).code, 1);
});
