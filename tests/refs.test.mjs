import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS = path.resolve(here, '../plugins/design-studio/skills/studio/scripts');
const REFS = path.join(SCRIPTS, 'refs.mjs');
const { classify, distinctFrames, domainsIn, slugify, upgradeSrc } = await import(REFS);
const NO_FFMPEG = spawnSync('ffmpeg', ['-version']).status === 0 ? false : 'ffmpeg is not installed';
const { resolvePlaywright } = await import(path.join(SCRIPTS, 'shoot.mjs'));
const NO_PLAYWRIGHT = resolvePlaywright() ? false : 'Playwright is not resolvable here';

// A valid 1x1 PNG.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

function refs(args, cwd) {
  const r = spawnSync(process.execPath, [REFS, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function makeSession() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-refs-'));
  const session = path.join(root, '.design-studio', 'sessions', '2026-10-13-refs');
  fs.mkdirSync(session, { recursive: true });
  return { root, session };
}

test('classify sorts sources into image, folder, site, board and post', () => {
  const { root } = makeSession();
  fs.writeFileSync(path.join(root, 'shot.png'), PNG);
  fs.writeFileSync(path.join(root, 'loop.gif'), 'gif');
  fs.writeFileSync(path.join(root, 'page.html'), '<p>x</p>');
  const cwd = process.cwd();
  process.chdir(root);
  try {
    assert.equal(classify('shot.png'), 'image');
    assert.equal(classify('loop.gif'), 'image', 'rendered to PNG later');
    assert.equal(classify('page.html'), 'site');
    assert.equal(classify('.'), 'folder');
    fs.writeFileSync(path.join(root, 'export.mp4'), 'mp4');
    assert.equal(classify('export.mp4'), 'video');
  } finally {
    process.chdir(cwd);
  }
  assert.equal(classify('https://www.cosmos.so/n8garvie/dark-ui-system'), 'board');
  assert.equal(classify('https://www.are.na/someone/dark-ui'), 'board');
  for (const u of ['https://a1.gallery', 'https://sections.wtf', 'https://recent.design', 'https://before.click']) assert.equal(classify(u), 'board', u);
  assert.equal(classify('https://www.threads.com/share/BAZ7xynLr8/'), 'post');
  assert.equal(classify('https://x.com/someone/status/1'), 'post');
  assert.equal(classify('https://linear.app'), 'site');
  assert.equal(classify('https://cdn.example.com/a/b.webp'), 'image');
  assert.equal(classify('https://linear.app', 'board'), 'board', '--as wins');
  assert.equal(classify('https://cdn.example.com/board-export.mp4'), 'video');
});

test('helpers: post domains, slugs and the Cosmos upgrade', () => {
  const text = 'Here’s where I look:\n→ recent.design — daily\n→ before.click — App Store shots\n→ a1.gallery — sites\n→ sections.wtf — sections\nSee threads.com/@x and recent.design again.';
  assert.deepEqual(domainsIn(text, 'threads.com'), ['https://recent.design', 'https://before.click', 'https://a1.gallery', 'https://sections.wtf']);
  assert.equal(slugify('https://www.cosmos.so/n8garvie/dark-ui-system'), 'cosmos-so-n8garvie-dark-ui-system');
  assert.equal(slugify('!!!'), 'ref');
  assert.equal(upgradeSrc('https://cdn.cosmos.so/abc?format=webp&w=400'), 'https://cdn.cosmos.so/abc?format=webp&w=1600');
  assert.equal(upgradeSrc('https://img.example.com/a.png?w=400'), 'https://img.example.com/a.png?w=400', 'other hosts untouched');
});

test('add copies image files, records them, and pick makes lineup anchors', () => {
  const { root, session } = makeSession();
  fs.writeFileSync(path.join(root, 'ref.png'), PNG);
  const res = refs(['add', '--session', session, '--note', 'the type scale', 'ref.png'], root);
  assert.equal(res.code, 0, res.stderr);
  assert.match(res.stdout, /^ref-01\s+image\s+ref-01\.png/);
  const dir = path.join(session, 'references');
  assert.ok(fs.existsSync(path.join(dir, 'ref-01.png')));
  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  assert.deepEqual([index[0].id, index[0].kind, index[0].note], ['ref-01', 'image', 'the type scale']);
  assert.match(fs.readFileSync(path.join(dir, 'sources.md'), 'utf8'), /\*\*ref-01\*\* \(image\).*\n  - loves: the type scale/);

  // A tile from a board becomes a top-level anchor.
  const board = path.join(dir, 'boards', 'demo');
  fs.mkdirSync(board, { recursive: true });
  fs.writeFileSync(path.join(board, '03.png'), PNG);
  const picked = refs(['pick', '--session', session, 'boards/demo/03.png'], root);
  assert.equal(picked.code, 0, picked.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'ref-02.png')), 'next free id');
  assert.match(picked.stdout, /ref-02\s+anchor/);

  const listed = refs(['list', '--session', session], root);
  assert.match(listed.stdout, /ref-01\s+image/);
  assert.match(listed.stdout, /ref-02\s+anchor/);
});

test('bad input exits 2 with one line', () => {
  const { root, session } = makeSession();
  assert.equal(refs(['add', '--session', session], root).code, 2, 'no sources');
  assert.equal(refs(['add', 'x.png'], root).code, 2, 'no session');
  assert.equal(refs(['add', '--session', session, 'missing.png'], root).code, 2, 'missing file');
  assert.equal(refs(['pick', '--session', session, 'nope.png'], root).code, 2);
  assert.equal(refs(['frobnicate', '--session', session], root).code, 2);
  assert.equal(refs(['add', '--session', session, '--max', '0', 'x.png'], root).code, 2);
});

// A local board: canvases and a video poster stand in for gallery tiles, plus chrome to ignore.
const BOARD = `<!doctype html><html><head><meta charset="utf-8"><title>Demo board</title>
<style>body{margin:0;font:14px system-ui}main{display:grid;grid-template-columns:repeat(4,240px);gap:16px;padding:16px}canvas{width:240px;height:180px}header img{width:32px;height:32px}</style></head>
<body><header><img alt="logo" src="data:image/png;base64,${PNG.toString('base64')}"></header>
<main>${Array.from({ length: 6 }, (_, i) => `<a href="https://example.com/item-${i + 1}"><canvas id="c${i}" width="240" height="180" aria-label="Tile ${i + 1}"></canvas></a>`).join('')}</main>
<script>for (let i = 0; i < 6; i++) { const c = document.getElementById('c' + i).getContext('2d'); c.fillStyle = 'hsl(' + i * 60 + ' 70% 50%)'; c.fillRect(0, 0, 240, 180); c.fillStyle = '#fff'; c.font = '48px sans-serif'; c.fillText(String(i + 1), 100, 110); }</script>
</body></html>`;

test('add --as board saves each tile, captions and links, and a contact sheet', { skip: NO_PLAYWRIGHT, timeout: 180000 }, (t) => {
  const { root, session } = makeSession();
  fs.writeFileSync(path.join(root, 'board.html'), BOARD);
  const res = refs(['add', '--session', session, '--as', 'board', '--max', '4', 'board.html'], root);
  if (res.code === 3) return t.skip(`no browser could launch: ${res.stderr.trim()}`);
  assert.equal(res.code, 0, res.stderr);
  const index = JSON.parse(fs.readFileSync(path.join(session, 'references', 'index.json'), 'utf8'));
  const board = index[0];
  assert.equal(board.kind, 'board');
  assert.equal(board.title, 'Demo board');
  assert.equal(board.items.length, 4, '--max caps the tiles; the header logo is skipped');
  assert.deepEqual(board.items.map((it) => it.alt), ['Tile 1', 'Tile 2', 'Tile 3', 'Tile 4'], 'reading order');
  assert.equal(board.items[0].link, 'https://example.com/item-1');
  for (const it of board.items) assert.ok(fs.statSync(it.file).size > 500, `${it.file} is a real image`);
  assert.ok(fs.existsSync(path.join(board.path, 'sheet.png')));
  assert.ok(!fs.existsSync(path.join(board.path, '.sheet.html')), 'sheet scaffolding removed');
});

test('a private or unavailable board exits 2 and leaves nothing behind', { skip: NO_PLAYWRIGHT, timeout: 120000 }, (t) => {
  const { root, session } = makeSession();
  fs.writeFileSync(path.join(root, 'private.html'), '<!doctype html><title>This page isn\'t available / Cosmos</title><p>This page isn\'t available. The link may be broken, or the board may be private.</p>');
  const res = refs(['add', '--session', session, '--as', 'board', 'private.html'], root);
  if (res.code === 3) return t.skip(`no browser could launch: ${res.stderr.trim()}`);
  assert.equal(res.code, 2, res.stdout);
  assert.match(res.stderr, /not readable.*private/);
  assert.deepEqual(fs.readdirSync(path.join(session, 'references', 'boards')), [], 'partial board removed');
});

test('distinctFrames keeps changes and collapses holds and loops', () => {
  const f = (v) => Buffer.alloc(16, v);
  // A, A, B, B (with noise), C, A again (a loop), B again.
  const frames = [f(10), f(11), f(120), f(124), f(240), f(12), f(121)];
  assert.deepEqual(distinctFrames(frames, 10), [0, 2, 4]);
  assert.deepEqual(distinctFrames(frames, 10, 2), [0, 2], 'max caps the count');
});

test('add takes a video and keeps one tile per distinct frame', { skip: NO_FFMPEG || NO_PLAYWRIGHT, timeout: 180000 }, (t) => {
  const { root, session } = makeSession();
  // Three solid shots, then the first again: a looping share export in miniature.
  const video = path.join(root, 'board-export.mp4');
  const src = ['red', 'navy', 'white', 'red'].map((c) => `color=c=${c}:s=180x320:d=1:r=6`);
  const r = spawnSync('ffmpeg', ['-v', 'error', ...src.flatMap((s) => ['-f', 'lavfi', '-i', s]), '-filter_complex', 'concat=n=4:v=1:a=0', '-pix_fmt', 'yuv420p', video]);
  assert.equal(r.status, 0, String(r.stderr));
  const res = refs(['add', '--session', session, 'board-export.mp4'], root);
  if (res.code === 3) return t.skip(`no browser could launch: ${res.stderr.trim()}`);
  assert.equal(res.code, 0, res.stderr);
  const [entry] = JSON.parse(fs.readFileSync(path.join(session, 'references', 'index.json'), 'utf8'));
  assert.equal(entry.kind, 'video');
  assert.equal(entry.items.length, 3, 'the loop back to red adds nothing');
  for (const it of entry.items) assert.ok(fs.existsSync(it.file));
  assert.ok(fs.existsSync(path.join(entry.path, 'sheet.png')));
});
