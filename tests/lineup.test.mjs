import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/lineup.mjs');

function lineup(args, cwd) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'studio-lineup-'));
}

function touch(file, content = 'img') {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function juror(dir, name, block, tag = 'studio-lineup') {
  fs.writeFileSync(path.join(dir, `juror-${name}.md`), `# Juror ${name}\n\nSome prose first.\n\n\`\`\`json ${tag}\n${JSON.stringify(block, null, 2)}\n\`\`\`\n`);
}

/** Map source basenames to the letters the shuffle gave them. */
function lettersBySource(out) {
  const key = JSON.parse(fs.readFileSync(path.join(out, '.key.json'), 'utf8'));
  return Object.fromEntries(Object.entries(key).map(([letter, e]) => [path.basename(e.source, path.extname(e.source)), letter]));
}

test('make copies a blind set and never prints which entry is ours', () => {
  const root = tempDir();
  touch(path.join(root, 'ours-final.png'));
  for (const r of ['r1.png', 'r2.jpg', 'r3.webp', 'notes.txt']) touch(path.join(root, 'refs', r));
  const res = lineup(['make', '--ours', 'ours-final.png', '--refs', 'refs', '--out', 'lineup'], root);
  assert.equal(res.code, 0, res.stderr);
  assert.ok(!res.stdout.includes('ours-final'), 'stdout must not reveal our file');
  const out = JSON.parse(res.stdout);
  assert.equal(out.n, 4);
  assert.ok(out.set.every((p) => path.isAbsolute(p) && fs.existsSync(p)));
  assert.deepEqual(out.set.map((p) => path.basename(p, path.extname(p))).sort(), ['A', 'B', 'C', 'D']);
  const key = JSON.parse(fs.readFileSync(path.join(root, 'lineup', '.key.json'), 'utf8'));
  assert.equal(Object.values(key).filter((e) => e.ours).length, 1);
  const jpg = Object.entries(key).find(([, e]) => e.source.endsWith('r2.jpg'))[0];
  assert.ok(fs.existsSync(path.join(root, 'lineup', 'set', `${jpg}.jpg`)), 'keeps the original extension');
});

test('score unblinds juror rankings and finds what beats us', () => {
  const root = tempDir();
  touch(path.join(root, 'ours.png'));
  for (const r of ['r1', 'r2', 'r3']) touch(path.join(root, 'refs', `${r}.png`));
  assert.equal(lineup(['make', '--ours', 'ours.png', '--refs', 'refs', '--out', 'lineup'], root).code, 0);
  const out = path.join(root, 'lineup');
  const L = lettersBySource(out);

  juror(out, '1', { juror: 'J1', ranking: [L.ours, L.r1, L.r2, L.r3], notes: { [L.ours]: 'calm and exact' }, best_quality: 'type', gap_to_best: 'none' });
  juror(out, '2', { juror: 'J2', ranking: [L.r2, L.ours, L.r1, L.r3] });
  juror(out, '3', { juror: 'J3', ranking: [L.r2, L.r1, L.r3, L.ours] });
  fs.writeFileSync(path.join(out, 'juror-4.md'), 'I forgot the block.');

  const res = lineup(['score', '--dir', 'lineup', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const r = JSON.parse(res.stdout);
  assert.equal(r.n, 3);
  assert.deepEqual(r.ourRanks, [1, 2, 4]);
  assert.equal(r.ourMedianRank, 2);
  assert.equal(r.firstByMajority, false);
  assert.equal(r.beatsUs.letter, L.r2);
  assert.equal(r.beatsUs.count, 2);
  assert.equal(r.skipped.length, 1);
  assert.equal(r.jurors[0].notesOnOurs.ours, 'calm and exact');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out, 'result.json'), 'utf8')).ourRanks, [1, 2, 4]);

  const human = lineup(['score', '--dir', 'lineup'], root);
  assert.match(human.stdout, /median rank 2/);
});

test('several ours entries: every one is scored and the best one leads', () => {
  const root = tempDir();
  touch(path.join(root, 'dir-a', 'desktop-top.png'));
  touch(path.join(root, 'dir-b', 'desktop-top.png'));
  touch(path.join(root, 'dir-c', 'tile.png'));
  for (const r of ['r1', 'r2']) touch(path.join(root, 'refs', `${r}.png`));

  // Default labels disambiguate identical basenames by their folder.
  let res = lineup(['make', '--ours', 'dir-a/desktop-top.png', '--ours', 'dir-b/desktop-top.png', '--refs', 'refs', '--out', 'auto'], root);
  assert.equal(res.code, 0, res.stderr);
  const autoKey = JSON.parse(fs.readFileSync(path.join(root, 'auto', '.key.json'), 'utf8'));
  assert.deepEqual(Object.values(autoKey).filter((e) => e.ours).map((e) => e.label).sort(), ['dir-a/desktop-top', 'dir-b/desktop-top']);

  res = lineup(['make', '--ours', 'dir-a/desktop-top.png', '--ours', 'dir-c/tile.png', '--label', 'alpha', '--label', 'gamma', '--refs', 'refs', '--out', 'lineup'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = path.join(root, 'lineup');
  const key = JSON.parse(fs.readFileSync(path.join(out, '.key.json'), 'utf8'));
  const letterOf = (label) => Object.keys(key).find((l) => key[l].label === label);
  const A = letterOf('alpha');
  const G = letterOf('gamma');
  const L = lettersBySource(out);
  assert.ok(key[A].ours && key[G].ours && !key[L.r1].ours);

  juror(out, '1', { juror: 'J1', ranking: [G, L.r1, A, L.r2] });
  juror(out, '2', { juror: 'J2', ranking: [L.r1, G, A, L.r2] });
  juror(out, '3', { juror: 'J3', ranking: [G, A, L.r1, L.r2] });

  res = lineup(['score', '--dir', 'lineup', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const r = JSON.parse(res.stdout);
  assert.equal(r.oursEntries.length, 2);
  assert.equal(r.bestOurs.label, 'gamma');
  assert.equal(r.bestOurs.medianRank, 1);
  assert.equal(r.ourMedianRank, 1);
  assert.deepEqual(r.ourRanks, [1, 2, 1]);
  assert.equal(r.firstByMajority, true);
  const alpha = r.oursEntries.find((e) => e.label === 'alpha');
  assert.deepEqual(alpha.ranks, [3, 3, 2]);
  assert.equal(alpha.medianRank, 3);
  assert.equal(alpha.firstByMajority, false);
  assert.equal(r.beatsUs.letter, L.r1, 'only references count as beating us');
  assert.equal(r.beatsUs.count, 1);
  assert.deepEqual(r.jurors[1].oursRanks, { gamma: 2, alpha: 3 });

  res = lineup(['make', '--ours', 'dir-a/desktop-top.png', '--label', 'x', '--label', 'y', '--refs', 'refs', '--out', 'bad'], root);
  assert.equal(res.code, 2, 'more labels than ours images is an input error');
});

test('score exits 2 without juror files or key', () => {
  const root = tempDir();
  touch(path.join(root, 'ours.png'));
  touch(path.join(root, 'refs', 'r1.png'));
  assert.equal(lineup(['make', '--ours', 'ours.png', '--refs', 'refs', '--out', 'lineup'], root).code, 0);
  const res = lineup(['score', '--dir', 'lineup'], root);
  assert.equal(res.code, 2);
  assert.match(res.stderr, /no juror-\*\.md files/);
  assert.equal(lineup(['score', '--dir', 'nowhere'], root).code, 2);
  assert.equal(lineup(['make', '--ours', 'missing.png', '--refs', 'refs', '--out', 'x'], root).code, 2);
});

function pairDir(root, name) {
  touch(path.join(root, 'champ.png'));
  touch(path.join(root, 'chall.png'));
  const res = lineup(['pair', '--a', 'champ.png', '--b', 'chall.png', '--out', name, '--a-label', 'champion', '--b-label', 'challenger'], root);
  assert.equal(res.code, 0, res.stderr);
  const printed = JSON.parse(res.stdout);
  const out = path.join(root, name);
  assert.ok(fs.existsSync(printed.X) && fs.existsSync(printed.Y));
  const key = JSON.parse(fs.readFileSync(path.join(out, '.key.json'), 'utf8'));
  const letter = { a: key.X.side === 'a' ? 'X' : 'Y', b: key.X.side === 'b' ? 'X' : 'Y' };
  return { out, letter };
}

function pairScore(root, name) {
  const res = lineup(['pair-score', '--dir', name, '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  return JSON.parse(res.stdout);
}

test('pair-score: majority with a clear margin is a clear win', () => {
  const root = tempDir();
  const { out, letter } = pairDir(root, 'p1');
  juror(out, '1', { juror: 'J1', winner: letter.b, margin: 'clear', why: 'sharper hierarchy' }, 'studio-pair');
  juror(out, '2', { juror: 'J2', winner: letter.b, margin: 'slight', why: 'better rhythm' }, 'studio-pair');
  juror(out, '3', { juror: 'J3', winner: letter.a, margin: 'slight', why: 'calmer' }, 'studio-pair');
  const r = pairScore(root, 'p1');
  assert.equal(r.winner, 'b');
  assert.equal(r.label, 'challenger');
  assert.deepEqual(r.votes, { a: 1, b: 2, same: 0 });
  assert.equal(r.clearWin, true);
});

test('pair-score: a clear ballot against the winner blocks a clear win', () => {
  const root = tempDir();
  const { out, letter } = pairDir(root, 'p2');
  juror(out, '1', { winner: letter.a, margin: 'clear' }, 'studio-pair');
  juror(out, '2', { winner: letter.a, margin: 'slight' }, 'studio-pair');
  juror(out, '3', { winner: letter.b, margin: 'clear' }, 'studio-pair');
  const r = pairScore(root, 'p2');
  assert.equal(r.winner, 'a');
  assert.equal(r.label, 'champion');
  assert.equal(r.clearWin, false);
});

test('pair-score: no strict majority is a tie', () => {
  const root = tempDir();
  const { out, letter } = pairDir(root, 'p3');
  juror(out, '1', { winner: letter.a, margin: 'clear' }, 'studio-pair');
  juror(out, '2', { winner: letter.b, margin: 'slight' }, 'studio-pair');
  juror(out, '3', { winner: 'same', margin: 'none' }, 'studio-pair');
  const r = pairScore(root, 'p3');
  assert.equal(r.winner, 'tie');
  assert.equal(r.label, null);
  assert.equal(r.clearWin, false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'result.json'), 'utf8')).winner, 'tie');
});
