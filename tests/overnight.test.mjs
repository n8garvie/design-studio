import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/overnight.mjs');
const { parseClaudeOutput, shellQuote } = await import(SCRIPT);

function overnight(args, cwd, env = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...env }, timeout: 60_000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function makeSession() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-overnight-'));
  const session = path.join(root, '.design-studio', 'sessions', '2026-10-11-tempo');
  fs.mkdirSync(session, { recursive: true });
  return { root, session };
}

test('--dry-run prints the Claude step command and runs nothing', () => {
  const { root, session } = makeSession();
  const rel = path.relative(root, session);
  const res = overnight(['--session', rel, '--host', 'claude', '--model', 'sonnet', '--dry-run', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.equal(out.cwd, root, 'runs from the project root');
  assert.equal(out.step.cmd, 'claude');
  assert.deepEqual(out.step.args, [
    '-p', `/design-studio:studio overnight-step session=${session}`,
    '--output-format', 'json',
    '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Read,Write,Edit,Glob,Grep,Agent,Bash(node *)',
    '--model', 'sonnet',
  ]);
  assert.deepEqual(out.limits, { steps: 30, hours: 8, maxUsd: 25, plateau: 5, failuresInRow: 2 });
  assert.equal(out.gallery.args[1], 'build');
  assert.ok(!fs.existsSync(path.join(session, 'overnight')), 'nothing written');

  const human = overnight(['--session', rel, '--host', 'claude', '--dry-run'], root);
  assert.equal(human.code, 0, human.stderr);
  assert.ok(human.stdout.includes(`claude -p '/design-studio:studio overnight-step session=${session}' --output-format json --permission-mode acceptEdits --allowedTools 'Read,Write,Edit,Glob,Grep,Agent,Bash(node *)'`), human.stdout);
  assert.match(human.stdout, /gallery\.mjs build --session /);
});

test('--dry-run prints the Codex step command', () => {
  const { root, session } = makeSession();
  const res = overnight(['--session', session, '--host', 'codex', '--steps', '12', '--dry-run', '--json'], root);
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  assert.equal(out.step.cmd, 'codex');
  assert.deepEqual(out.step.args, ['exec', '--full-auto', `$design-studio:studio overnight-step session=${session}`]);
  assert.equal(out.limits.maxUsd, null, 'Codex budgets by steps and hours only');
  assert.equal(out.limits.steps, 12);

  const human = overnight(['--session', session, '--host', 'codex', '--dry-run'], root);
  assert.ok(human.stdout.includes(`codex exec --full-auto '$design-studio:studio overnight-step session=${session}'`), human.stdout);
});

test('bad input exits 2', () => {
  const { root, session } = makeSession();
  assert.equal(overnight(['--session', session, '--host', 'gpt', '--dry-run'], root).code, 2);
  assert.equal(overnight(['--session', path.join(root, 'nope'), '--host', 'claude', '--dry-run'], root).code, 2);
  assert.equal(overnight(['--host', 'claude', '--dry-run'], root).code, 2);
  assert.equal(overnight(['--session', session, '--host', 'claude', '--steps', '0', '--dry-run'], root).code, 2);
});

test('parseClaudeOutput tolerates objects, arrays and noise; shellQuote is shell-safe', () => {
  assert.deepEqual(parseClaudeOutput('{"type":"result","is_error":false,"total_cost_usd":0.42}'), { costUsd: 0.42, isError: false });
  assert.deepEqual(parseClaudeOutput('[{"type":"system"},{"type":"result","is_error":true,"total_cost_usd":1}]'), { costUsd: 1, isError: true });
  assert.deepEqual(parseClaudeOutput('warming up\n{"type":"result","result":"ok"}'), { costUsd: null, isError: null });
  assert.deepEqual(parseClaudeOutput('not json'), { costUsd: null, isError: null });
  assert.equal(shellQuote('--model'), '--model');
  assert.equal(shellQuote("it's"), `'it'\\''s'`);
  assert.equal(shellQuote('$x'), "'$x'");
});

// --- the real loop, against a fake `claude` on PATH ------------------------------

const FAKE_CLAUDE = `#!/usr/bin/env node
// Fake headless Claude for overnight.mjs tests. FAKE_MODE: plateau | fail | done.
const fs = require('fs');
const path = require('path');
const prompt = process.argv[process.argv.indexOf('-p') + 1];
const session = prompt.match(/session=(.*)$/)[1];
const dir = path.join(session, 'overnight');
const countFile = path.join(dir, 'fake-count');
const n = Number(fs.existsSync(countFile) ? fs.readFileSync(countFile, 'utf8') : 0) + 1;
fs.writeFileSync(countFile, String(n));
fs.appendFileSync(path.join(dir, 'fake-cwd'), process.cwd() + '\\n');
const next = path.join(dir, 'next.json');
fs.appendFileSync(path.join(dir, 'fake-next'), (fs.existsSync(next) ? fs.readFileSync(next, 'utf8').replace(/\\s+/g, '') : '-') + '\\n');
const mode = process.env.FAKE_MODE || 'plateau';
if (mode === 'fail') { process.stderr.write('boom'); process.exit(1); }
// Step 2's challenger wins; every other step keeps the champion.
const champ = n >= 2
  ? { champion: 'rounds/02', since_step: 2, score: 7, history: [{ step: 0, score: 6 }, { step: 2, score: 7 }] }
  : { champion: 'rounds/01', since_step: 0, score: 6, history: [{ step: 0, score: 6 }] };
if (mode === 'done') champ.done = true;
fs.writeFileSync(path.join(dir, 'champion.json'), JSON.stringify(champ));
console.log(JSON.stringify({ type: 'result', is_error: false, total_cost_usd: 0.5, result: 'step done' }));
`;

function fakeHost() {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-fake-bin-'));
  fs.writeFileSync(path.join(bin, 'claude'), FAKE_CLAUDE, { mode: 0o755 });
  return { PATH: [bin, path.dirname(process.execPath), process.env.PATH].join(path.delimiter) };
}

const posixOnly = { skip: process.platform === 'win32' ? 'the fake host is a shebang script' : false };

function history(session) {
  return fs.readFileSync(path.join(session, 'overnight', 'history.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
}

test('loop: plateau stop, diverge hint one step early, logs, gallery', posixOnly, () => {
  const { root, session } = makeSession();
  const res = overnight(['--session', session, '--host', 'claude', '--plateau', '3', '--steps', '10', '--json'], root, fakeHost());
  assert.equal(res.code, 0, res.stderr);
  const out = JSON.parse(res.stdout);
  // Step 1 sets up, step 2 wins, steps 3-5 don't: unchanged 3 times → stop after step 5.
  assert.equal(out.steps, 5);
  assert.match(out.stop, /unchanged for 3 steps/);
  assert.equal(out.costUsd, 2.5);
  assert.equal(out.champion, 'rounds/02');
  assert.deepEqual(out.scores, [6, 7]);
  assert.equal(out.gallery, path.join(session, 'gallery.html'));
  assert.ok(fs.existsSync(out.gallery));

  const h = history(session);
  assert.equal(h.length, 5);
  assert.deepEqual(h.map((e) => e.step), [1, 2, 3, 4, 5]);
  assert.deepEqual(h.map((e) => e.changed), [false, true, false, false, false]);
  for (const e of h) {
    for (const k of ['step', 'at', 'costUsd', 'champion', 'changed', 'durationSec']) assert.ok(k in e, `history has ${k}`);
  }
  // The hint is written after step 4 (unchanged for plateau − 1 = 2 steps), so step 5 sees it.
  const seen = fs.readFileSync(path.join(session, 'overnight', 'fake-next'), 'utf8').trim().split('\n');
  assert.equal(seen.length, 5);
  assert.ok(seen.slice(0, 4).every((s) => !s.includes('"diverge":true')), seen.join(' | '));
  assert.match(seen[4], /"diverge":true/);
  assert.ok(fs.readFileSync(path.join(session, 'overnight', 'fake-cwd'), 'utf8').startsWith(fs.realpathSync(root)), 'host runs from the project root');
  const log = fs.readFileSync(path.join(session, 'overnight', 'overnight.log'), 'utf8');
  assert.match(log, /stop: champion unchanged/);
  assert.match(log, /Score history: 6 → 7/);
  assert.ok(fs.existsSync(path.join(session, 'overnight', 'steps', '001.log')));

  // A second run continues the step numbering and clears the stale hint first.
  const again = overnight(['--session', session, '--host', 'claude', '--steps', '1', '--json'], root, fakeHost());
  assert.equal(again.code, 0, again.stderr);
  assert.equal(history(session).at(-1).step, 6);
  const last = fs.readFileSync(path.join(session, 'overnight', 'fake-next'), 'utf8').trim().split('\n').at(-1);
  assert.match(last, /"diverge":false/);
});

test('loop: stops on cost, on two failures in a row, and on done', posixOnly, () => {
  let { root, session } = makeSession();
  let res = overnight(['--session', session, '--host', 'claude', '--max-usd', '1', '--json'], root, fakeHost());
  assert.equal(res.code, 0, res.stderr);
  let out = JSON.parse(res.stdout);
  assert.equal(out.steps, 2);
  assert.match(out.stop, /max-usd/);

  ({ root, session } = makeSession());
  res = overnight(['--session', session, '--host', 'claude', '--json'], root, { ...fakeHost(), FAKE_MODE: 'fail' });
  assert.equal(res.code, 1);
  out = JSON.parse(res.stdout);
  assert.equal(out.steps, 2);
  assert.equal(out.failed, 2);
  assert.match(out.stop, /failed twice/);
  assert.match(fs.readFileSync(path.join(session, 'overnight', 'steps', '002.log'), 'utf8'), /boom/);

  ({ root, session } = makeSession());
  res = overnight(['--session', session, '--host', 'claude', '--json'], root, { ...fakeHost(), FAKE_MODE: 'done' });
  assert.equal(res.code, 0, res.stderr);
  out = JSON.parse(res.stdout);
  assert.equal(out.steps, 1);
  assert.match(out.stop, /done/);
});

test('loop: a missing host CLI stops at once with exit 2', posixOnly, () => {
  const { root, session } = makeSession();
  const res = overnight(['--session', session, '--host', 'codex', '--json'], root, { PATH: path.dirname(process.execPath) });
  assert.equal(res.code, 2);
  const out = JSON.parse(res.stdout);
  assert.equal(out.steps, 1);
  assert.match(out.stop, /codex not found/);
});
