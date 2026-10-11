import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/gallery.mjs');
const { imageSize, scoreHistory } = await import(SCRIPT);

function gallery(args, cwd) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

/** A fake PNG: signature + IHDR header with the given size (enough for size sniffing). */
function png(file, w = 1440, h = 900) {
  const buf = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12, 'ascii');
  buf.writeUInt32BE(w, 16);
  buf.writeUInt32BE(h, 20);
  return write(file, buf);
}

function makeSession(root) {
  const s = path.join(root, '.design-studio', 'sessions', '2026-10-11-tempo');
  write(path.join(s, 'brief.md'), '# Brief: Tempo landing\n\n**What it is and the one job:** A focus timer for teams.\n**For whom:** Small product teams.\n');
  write(path.join(s, 'state.md'), '# Session state\n\nphase: deliver\nmode: make\ndepth: standard\n');
  png(path.join(s, 'references', 'moodboard one.png'), 1200, 800);
  png(path.join(s, 'references', 'ref-01', 'desktop-top.png'));
  png(path.join(s, 'references', 'ref-01', 'mobile-top.png'), 390, 844);
  png(path.join(s, 'references', 'ref-01', 'desktop-dark-top.png'));
  png(path.join(s, 'develop', 'shots', 'paper', 'desktop-top.png'));
  png(path.join(s, 'develop', 'shots', 'paper', 'mobile-top.png'), 390, 844);
  write(path.join(s, 'develop', 'tiles', 'paper', 'index.html'), '<!doctype html>');
  write(path.join(s, 'develop', 'shots', 'night', 'desktop-top.png'), 'not really a png');
  png(path.join(s, 'build', 'shots', 'system', 'desktop-top.png'));
  png(path.join(s, 'build', 'shots', 'system', 'desktop-tile-1.png'));
  for (const [n, score] of [['01', 5], ['02', 7]]) {
    png(path.join(s, 'rounds', n, 'shots', 'desktop-top.png'));
    png(path.join(s, 'rounds', n, 'shots', 'mobile-top.png'), 390, 844);
    write(path.join(s, 'rounds', n, 'ledger.json'), JSON.stringify({
      studio: { score, spread: 1, n: 3, source: 'panel' },
      delta: n === '02' ? 2 : null,
      lineup: { ourMedianRank: n === '02' ? 2 : 4, size: 4, n: 3 },
      counts: { severity: { blocker: 0, major: 1, minor: 2, polish: 0 } },
    }));
    write(path.join(s, 'rounds', n, 'ledger.md'), '# Ledger');
  }
  write(path.join(s, 'rounds', '02', 'rulings.md'), '# Rulings');
  png(path.join(s, 'deliver', 'states', 'desktop-state-empty.png'));
  png(path.join(s, 'deliver', 'states', 'mobile-state-empty.png'), 390, 844);
  write(path.join(s, 'report.md'), '# Studio report: Tempo\n\n**Verdict:** SHIP · **Mode:** make\n');
  write(path.join(s, 'overnight', 'champion.json'), JSON.stringify({ champion: 'rounds/02', since_step: 3, score: 7, history: [{ step: 0, score: 5 }, { step: 3, score: 7 }] }));
  return s;
}

test('build writes a self-contained gallery that links every section relatively', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-gallery-'));
  const s = makeSession(root);
  const res = gallery(['build', '--session', path.relative(root, s), '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.equal(out.gallery, path.join(s, 'gallery.html'));
  assert.equal(out.rounds, 2);
  assert.equal(out.references, 3, 'loose image + ref-01 desktop and mobile; dark variant skipped');
  assert.equal(out.directions, 2);

  const html = fs.readFileSync(out.gallery, 'utf8');
  for (const ref of [
    'references/moodboard%20one.png',
    'references/ref-01/desktop-top.png',
    'references/ref-01/mobile-top.png',
    'develop/shots/paper/desktop-top.png',
    'develop/shots/paper/mobile-top.png',
    'develop/shots/night/desktop-top.png',
    'develop/tiles/paper/index.html',
    'build/shots/system/desktop-tile-1.png',
    'rounds/02/shots/desktop-top.png',
    'rounds/01/shots/mobile-top.png',
    'rounds/02/ledger.md',
    'rounds/02/rulings.md',
    'deliver/states/mobile-state-empty.png',
    'report.md',
  ]) assert.ok(html.includes(`"${ref}"`), `links ${ref}`);
  assert.ok(!html.includes('desktop-dark-top.png'), 'dark variants stay out of the reference grid');
  assert.ok(!html.includes(root), 'no absolute paths');
  assert.ok(!/<link[^>]+stylesheet|<script/i.test(html), 'self-contained: inline CSS, no scripts');
  assert.ok(html.indexOf('id="round-02"') < html.indexOf('id="round-01"'), 'rounds newest first');
  assert.match(html, /<h1>Tempo landing<\/h1>/);
  assert.match(html, /A focus timer for teams\./);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /tabular-nums/);
  assert.match(html, /outline-offset: -1px/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /target="_blank" rel="noopener"/);
  assert.match(html, /width="1440" height="900"/, 'image sizes come from the PNG header');
  assert.match(html, /Champion/);
  assert.match(html, /5 → 7/, 'score trail');
  assert.ok(!/linear-gradient|radial-gradient/.test(html), 'no gradients');
});

test('build works on an empty session and fails cleanly on a missing one', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-gallery-'));
  const s = path.join(root, '2026-10-11-blank');
  fs.mkdirSync(s);
  const res = gallery(['build', '--session', s], root);
  assert.equal(res.code, 0, res.stderr);
  assert.equal(res.stdout.split('\n')[0], path.join(s, 'gallery.html'));
  assert.match(fs.readFileSync(path.join(s, 'gallery.html'), 'utf8'), /Nothing to show yet/);
  assert.equal(gallery(['build', '--session', 'nope'], root).code, 2);
  assert.equal(gallery(['build'], root).code, 2);
});

test('board lays items out in equal columns with labels above', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-gallery-'));
  const a = png(path.join(root, 'shots', 'paper', 'desktop-top.png'));
  const b = png(path.join(root, 'shots', 'signal', 'desktop-top.png'));
  const c = png(path.join(root, 'other.png'), 800, 600);
  const res = gallery(['board', '--items', a, b, c, '--labels', 'Paper,Signal', '--out', 'out/board.html', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.equal(out.board, path.join(root, 'out', 'board.html'));
  assert.equal(out.png, null);
  const html = fs.readFileSync(out.board, 'utf8');
  assert.match(html, /--cols: 3/);
  assert.ok(html.includes('"../shots/paper/desktop-top.png"'), 'relative to the board file');
  assert.ok(html.indexOf('Paper') < html.indexOf('../shots/paper/desktop-top.png'), 'label above image');
  assert.match(html, /<span class="num">3<\/span>other</, 'missing labels fall back to the file name');
  assert.equal(gallery(['board', '--items', a, '--labels', 'x,y', '--out', 'b.html'], root).code, 2);
  assert.equal(gallery(['board', '--items', a, '--out', 'b.png'], root).code, 2);
});

test('board --png renders when a browser is available, else warns and keeps the HTML', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-gallery-'));
  const a = png(path.join(root, 'a.png'));
  const b = png(path.join(root, 'b.png'));
  const res = gallery(['board', '--items', a, b, '--out', 'board.html', '--png', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.ok(fs.existsSync(out.board));
  if (out.png) {
    assert.equal(fs.readFileSync(out.png).readUInt32BE(0), 0x89504e47, 'a real PNG');
  } else {
    assert.ok(out.warnings.length > 0 && /--png skipped/.test(res.stderr), 'explains why there is no PNG');
  }
});

test('imageSize reads PNG headers and shrugs at junk; scoreHistory dedupes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-gallery-'));
  assert.deepEqual(imageSize(png(path.join(root, 'x.png'), 390, 844)), { w: 390, h: 844 });
  assert.equal(imageSize(write(path.join(root, 'junk.png'), 'hello')), null);
  assert.equal(imageSize(path.join(root, 'missing.png')), null);
  assert.deepEqual(scoreHistory({ score: 8, history: [{ score: 6 }, { score: 6 }, 7] }), [6, 7, 8]);
  assert.deepEqual(scoreHistory(null, [{ score: 5 }, { score: 5 }, { score: 6 }]), [5, 6]);
});
