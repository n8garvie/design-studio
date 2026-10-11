import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/tally.mjs');

function tally(args, cwd) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

const block = (tag, data) => `Notes from the critic.\n\n\`\`\`json ${tag}\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;

// Three role critics, three panel critics, one cross-crit file and one broken file.
function makeRound(dir, { panel = true } = {}) {
  write(path.join(dir, 'crit', 'typographer-a.md'), block('studio-findings', {
    role: 'typographer',
    instance: 'a',
    scores: { lens: 6, overall: 6, rubric: { measure: 3, scale: 5 } },
    verdict: 'POLISH',
    findings: [
      { id: 'TYP-01', severity: 'blocker', title: 'Body measure runs about 120 characters per line', where: 'Why Tempo paragraph', confidence: 'high' },
      { id: 'TYP-02', severity: 'major', title: 'Headline is too small for the hero', where: 'Hero headline', target: 'Increase to 72px, larger than the blob', touches: ['visual-designer'] },
    ],
    keep: ['The timer card mock'],
    tells: ['Gradient text on the headline'],
  }));
  write(path.join(dir, 'crit', 'visual-designer.md'), block('studio-findings', {
    role: 'visual-designer',
    scores: { lens: 8, overall: 7 },
    verdict: 'POLISH',
    findings: [
      { id: 'VIS-01', severity: 'major', title: 'Gradient headline fights the blob', where: 'the hero headline', target: 'Reduce the headline, smaller and solid ink' },
      { id: 'VIS-02', severity: 'minor', title: 'Radii are inconsistent', where: 'feature cards' },
    ],
    keep: ['the timer card mock.'],
    tells: ['Purple gradient hero'],
  }));
  write(path.join(dir, 'crit', 'content-strategist.md'), block('studio-findings', {
    role: 'Content Strategist',
    scores: { lens: 6, overall: 5 },
    verdict: 'RETHINK-structure',
    findings: [
      { id: 'CON-01', severity: 'minor', title: 'Filler words: seamless, unlock, elevate', where: 'hero subtitle' },
      { id: 'CON-02', severity: 'major', title: 'Card copy is interchangeable', where: 'Feature cards' },
    ],
    tells: ['purple gradient hero'],
  }));
  write(path.join(dir, 'crit', 'broken.md'), '```json studio-findings\n{"role": "emotion-designer", oops}\n```\n');
  write(path.join(dir, 'crosscrit', 'visual-designer.md'), block('studio-crosscrit', {
    role: 'visual-designer',
    responses: [
      { to: 'TYP-01', stance: 'AGREE', reason: 'yes' },
      { to: 'TYP-02', stance: 'CHALLENGE', reason: 'A bigger headline makes the gradient louder', counter: 'Keep size, remove the gradient' },
    ],
  }));
  if (!panel) return;
  write(path.join(dir, 'panel', 'p1.md'), block('studio-score', {
    critic: 'P1', score: 7, desktop: 7, mobile: 6, verdict: 'POLISH', intent_match: 'partial',
    gaps: [{ gap: 'Pricing empty state is a dead end with no next step', where: 'pricing section', fix: 'Show plans' }],
    keep: ['The timer card mock'],
  }));
  write(path.join(dir, 'panel', 'p2.md'), block('studio-score', {
    critic: 'P2', score: 4, desktop: 5, mobile: 4, verdict: 'RETHINK-direction', intent_match: 'weak',
    gaps: [{ gap: 'Footer accents are noisy', where: 'footer' }],
    tells: ['Eyebrow pill on every section'],
  }));
  write(path.join(dir, 'panel', 'p3.md'), block('studio-score', {
    critic: 'P3', score: 6, desktop: 6, mobile: 5, verdict: 'POLISH', intent_match: 'partial',
    gaps: [
      { gap: 'Hero has no focal point', where: 'hero', fix: 'One CTA' },
      { gap: 'Pricing empty state is a dead end', where: 'pricing', fix: 'Show plans' },
    ],
  }));
}

test('tally builds a ledger with caps, panel median, consensus and conflicts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tally-'));
  const round = path.join(root, 'rounds', '03');
  makeRound(round);
  write(path.join(round, 'lineup', 'result.json'), JSON.stringify({ ourMedianRank: 2, n: 3, size: 5, firstByMajority: false }));

  const res = tally(['--round', 'rounds/03'], root);
  assert.equal(res.code, 0, res.stderr);
  const lines = res.stdout.trim().split('\n');
  assert.ok(lines.length <= 5, 'summary is at most 5 lines');
  assert.equal(lines[0], path.join(round, 'ledger.md'));

  const l = JSON.parse(fs.readFileSync(path.join(round, 'ledger.json'), 'utf8'));
  assert.equal(l.round, 'rounds/03');
  assert.deepEqual([l.studio.score, l.studio.spread, l.studio.n, l.studio.source], [6, 3, 3, 'panel']);

  const lane = (critic) => l.lanes.find((x) => x.critic === critic);
  assert.deepEqual([lane('typographer[a]').raw, lane('typographer[a]').capped], [6, 5], 'blocker caps lens at 5');
  assert.deepEqual([lane('visual-designer').raw, lane('visual-designer').capped], [8, 7], 'major caps lens at 7');
  assert.ok(lane('content-strategist'), 'role names are slugged');

  assert.deepEqual(l.counts.severity, { blocker: 1, major: 3, minor: 2, polish: 0 });
  assert.equal(l.counts.verdicts.POLISH, 2);

  const headline = l.consensus.find((c) => c.ids.includes('TYP-02'));
  assert.ok(headline && headline.ids.includes('VIS-01'), 'hero headline findings agree');
  const cards = l.consensus.find((c) => c.ids.includes('CON-02'));
  assert.ok(cards && cards.ids.includes('VIS-02'), 'feature card findings agree');
  assert.equal(cards.severity, 'major');
  assert.ok(!l.consensus.some((c) => c.ids.includes('CON-01')), 'hero subtitle is a different place');

  const challenge = l.conflicts.find((c) => c.kind === 'crosscrit');
  assert.equal(challenge.to, 'TYP-02');
  assert.equal(challenge.finding.critic, 'typographer[a]');
  assert.equal(l.conflicts.filter((c) => c.kind === 'crosscrit').length, 1, 'AGREE is not a conflict');
  const touches = l.conflicts.find((c) => c.kind === 'touches');
  assert.deepEqual([touches.a.id, touches.b.id], ['TYP-02', 'VIS-01'], 'bigger vs smaller at the same place');

  assert.deepEqual(l.keep, ['The timer card mock'], 'keep is deduped case-insensitively');
  assert.equal(l.tells.filter((t) => /purple gradient hero/i.test(t)).length, 1);

  assert.equal(l.panelGaps[0].critics.length, 2, 'shared pricing gap leads');
  assert.match(l.panelGaps[0].gap, /Pricing/);
  assert.ok(l.panelGaps.some((g) => g.gap === 'Hero has no focal point'), 'median critique gaps are kept');
  assert.ok(!l.panelGaps.some((g) => /Footer/.test(g.gap)), 'lone gaps from non-median critics are dropped');

  assert.deepEqual(l.lineup, { ourMedianRank: 2, n: 3, firstByMajority: false, size: 5, best: null, oursCount: 1 });
  assert.ok(l.warnings.some((w) => w.includes('broken.md')), 'unparseable files are reported');

  const md = fs.readFileSync(path.join(round, 'ledger.md'), 'utf8');
  assert.ok(md.split('\n').length <= 62, 'ledger.md stays compact');
  assert.match(md, /\*\*Studio 6\*\* \(panel median/);
  assert.match(md, /\| typographer\[a\] \| 6→5 \|/);
  assert.match(md, /\| visual-designer \| 8→7 \|/);
  for (const h of ['## Critics', '## Panel gaps', '## Consensus', '## Conflicts to rule on', '## Keep', '## Tells seen']) assert.ok(md.includes(h), h);
});

test('without panel files the studio score falls back to role overall scores', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tally-'));
  const dir = path.join(root, '.design-studio', 'sessions', '2026-10-11-tempo', 'build', 'system-crit');
  makeRound(dir, { panel: false });
  const res = tally(['--round', dir, '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const l = JSON.parse(res.stdout);
  assert.equal(l.studio.source, 'roles');
  assert.equal(l.studio.score, 6, 'median of 6, 7, 5');
  assert.equal(l.round, 'build/system-crit', 'arbitrary dirs are labelled relative to the session');
  assert.deepEqual(l.panelGaps, []);
  assert.equal(l.lineup, null);
});

test('plateau needs this delta and the previous delta both under 1.0', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tally-'));
  const round = path.join(root, 'rounds', '04');
  makeRound(round);
  const prev = (name, data) => { write(path.join(root, name, 'ledger.json'), JSON.stringify(data)); return path.join(root, name); };

  let l = JSON.parse(tally(['--round', round, '--prev', prev('flat', { studio: { score: 5.5, source: 'panel' }, delta: 0.5 }), '--json'], root).stdout);
  assert.equal(l.delta, 0.5);
  assert.equal(l.plateau, true);

  l = JSON.parse(tally(['--round', round, '--prev', prev('jump', { studio: { score: 5.5, source: 'panel' }, delta: 2 }), '--json'], root).stdout);
  assert.equal(l.plateau, false, 'previous round still moved');

  l = JSON.parse(tally(['--round', round, '--prev', path.join(prev('first', { studio: { score: 4, source: 'panel' }, delta: null }), 'ledger.json'), '--json'], root).stdout);
  assert.equal(l.delta, 2);
  assert.equal(l.plateau, false, 'no previous delta yet');
});

test('exit 2 and a list of failures when nothing parses', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tally-'));
  write(path.join(root, 'r', 'crit', 'bad.md'), 'No block here.');
  const res = tally(['--round', 'r'], root);
  assert.equal(res.code, 2);
  assert.match(res.stderr, /bad\.md/);
  assert.equal(tally(['--round', 'missing'], root).code, 2);
  assert.equal(tally([], root).code, 2);
});
