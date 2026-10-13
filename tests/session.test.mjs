import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(here, '../plugins/design-studio/skills/studio');
const SCRIPT = path.join(SKILL, 'scripts/session.mjs');

function session(args, cwd, script = SCRIPT) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function json(res) {
  assert.equal(res.code, 0, res.stderr);
  return JSON.parse(res.stdout);
}

// The reference gate: rounds need at least one reference image on disk.
const addRef = (sessionDir, name = 'ref-01.png') => {
  fs.mkdirSync(path.join(sessionDir, 'references'), { recursive: true });
  fs.writeFileSync(path.join(sessionDir, 'references', name), 'png');
};

const tempRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'studio-session-'));
const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

test('init creates the session folders, kb snapshot, bin copy, state.md and config', () => {
  const root = tempRoot();
  const out = json(session(['init', '--slug', 'Pricing Page', '--mode', 'crit', '--depth', 'quick', '--root', root], os.tmpdir()));
  const studio = path.join(fs.realpathSync(root), '.design-studio');
  assert.equal(fs.realpathSync(out.session), path.join(studio, 'sessions', `${today()}-pricing-page`));
  assert.equal(out.created, true);
  assert.equal(out.resumed, false);
  assert.match(out.version, /^\d+\.\d+\.\d+\+[0-9a-f]{8}$/);

  for (const sub of ['references', 'discover', 'develop/cards', 'develop/tiles', 'develop/shots', 'develop/reactions', 'develop/lineup', 'spec', 'build', 'rounds', 'deliver', 'overnight/pairs']) {
    assert.ok(fs.statSync(path.join(out.session, sub)).isDirectory(), sub);
  }

  // kb: roles/ knowledge/ protocol/ templates/ + VERSION, never SKILL.md or scripts/.
  for (const folder of ['roles', 'knowledge', 'protocol', 'templates']) {
    assert.ok(fs.statSync(path.join(out.kb, folder)).isDirectory(), folder);
    assert.deepEqual(fs.readdirSync(path.join(out.kb, folder)).sort(), fs.readdirSync(path.join(SKILL, folder)).sort());
  }
  assert.equal(fs.readFileSync(path.join(out.kb, 'VERSION'), 'utf8').trim(), out.version);
  assert.ok(!fs.existsSync(path.join(out.kb, 'SKILL.md')));
  assert.ok(!fs.existsSync(path.join(out.kb, 'scripts')));

  // bin: every script, copied together so relative imports work.
  const scripts = fs.readdirSync(path.join(SKILL, 'scripts')).filter((f) => f.endsWith('.mjs')).sort();
  assert.deepEqual(fs.readdirSync(out.bin).filter((f) => f.endsWith('.mjs')).sort(), scripts);
  assert.ok(fs.existsSync(path.join(out.bin, 'VERSION')));

  const state = fs.readFileSync(path.join(out.session, 'state.md'), 'utf8');
  assert.match(state, /mode: crit/);
  assert.match(state, /depth: quick/);
  assert.doesNotMatch(state, /\{\{/);

  assert.equal(fs.realpathSync(out.config), path.join(studio, 'config.json'));
  assert.equal(JSON.parse(fs.readFileSync(out.config, 'utf8')).profile, 'quality');
  assert.ok(!fs.existsSync(path.join(root, '.gitignore')), 'no .gitignore without --gitignore');
});

test('init suffixes a taken slug, --resume reuses it, and the kb is only recopied when stale', () => {
  const root = tempRoot();
  const first = json(session(['init', '--slug', 'onboarding', '--gitignore'], root));
  assert.equal(first.kbUpdated, true);
  fs.writeFileSync(path.join(first.kb, 'roles', 'marker.txt'), 'kept');

  const second = json(session(['init', '--slug', 'onboarding'], root));
  assert.equal(path.basename(second.session), `${today()}-onboarding-2`);
  assert.equal(second.kbUpdated, false, 'same VERSION: no recopy');
  assert.ok(fs.existsSync(path.join(first.kb, 'roles', 'marker.txt')));

  const resumed = json(session(['init', '--slug', 'onboarding', '--resume'], root));
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.created, false);
  assert.equal(resumed.session, second.session);

  fs.writeFileSync(path.join(first.kb, 'VERSION'), 'stale\n');
  assert.equal(json(session(['init', '--slug', 'onboarding', '--resume'], root)).kbUpdated, true);
  assert.ok(!fs.existsSync(path.join(first.kb, 'roles', 'marker.txt')), 'stale kb is replaced');

  assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /^\.design-studio\/$/m);
});

test('round --next increments and round prints the latest', () => {
  const root = tempRoot();
  const { session: dir } = json(session(['init', '--slug', 'r'], root));
  assert.equal(json(session(['round', '--session', dir])).n, 0);
  addRef(dir);
  const r1 = json(session(['round', '--session', dir, '--next']));
  assert.equal(r1.round, 'rounds/01');
  assert.equal(r1.n, 1);
  for (const sub of ['shots', 'critic-view', 'crit', 'panel', 'crosscrit', 'lineup', 'snapshot']) {
    assert.ok(fs.statSync(path.join(r1.path, sub)).isDirectory(), sub);
  }
  assert.equal(json(session(['round', '--session', dir, '--next'])).round, 'rounds/02');
  const latest = json(session(['round', '--session', dir]));
  assert.equal(latest.round, 'rounds/02');
  assert.ok(path.isAbsolute(latest.path));
});

test('check is a barrier: exit 0 only when every file exists and is big enough', () => {
  const root = tempRoot();
  const { session: dir } = json(session(['init', '--slug', 'barrier'], root));
  const big = 'x'.repeat(300);
  fs.writeFileSync(path.join(dir, 'brief.md'), big);
  fs.writeFileSync(path.join(dir, 'define.md'), 'tiny');

  assert.equal(session(['check', '--session', dir, '--expect', 'brief.md']).code, 0);
  const missing = session(['check', '--session', dir, '--expect', 'brief.md', 'direction.md']);
  assert.equal(missing.code, 2);
  assert.match(missing.stdout, /missing\s+.*direction\.md/);
  const small = session(['check', '--session', dir, '--expect', 'define.md']);
  assert.equal(small.code, 2);
  assert.match(small.stdout, /too small/);
  assert.equal(session(['check', '--session', dir, '--expect', 'define.md', '--min-bytes', '4']).code, 0);

  const crit = path.join(dir, 'rounds', '03', 'crit');
  fs.mkdirSync(crit, { recursive: true });
  for (const n of [1, 2]) fs.writeFileSync(path.join(crit, `role-${n}.md`), big);
  const few = session(['check', '--session', dir, '--expect-glob', 'rounds/03/crit/*.md', '--count', '3', '--json']);
  assert.equal(few.code, 2);
  assert.equal(JSON.parse(few.stdout).globs[0].found, 2);
  fs.writeFileSync(path.join(crit, 'role-3.md'), big);
  assert.equal(session(['check', '--session', dir, '--expect-glob', 'rounds/03/crit/*.md', '--count', '3']).code, 0);
});

test('status and latest report the session', () => {
  const root = tempRoot();
  const { session: dir } = json(session(['init', '--slug', 'status-check', '--depth', 'deep'], root));
  const status = json(session(['status', '--session', dir, '--json']));
  assert.equal(status.depth, 'deep');
  assert.ok(status.phase, 'phase parsed from state.md');
  assert.equal(fs.realpathSync(session(['latest', '--root', root]).stdout.trim()), fs.realpathSync(dir));
  assert.equal(session(['latest', '--root', tempRoot()]).code, 2);
});

test('the .design-studio/bin copy runs on its own and never clobbers the kb', () => {
  const root = tempRoot();
  const first = json(session(['init', '--slug', 'bin'], root));
  const binSession = path.join(first.bin, 'session.mjs');
  fs.writeFileSync(path.join(first.kb, 'roles', 'marker.txt'), 'kept');

  const again = json(session(['init', '--slug', 'bin', '--resume'], root, binSession));
  assert.equal(again.session, first.session);
  assert.equal(again.version, first.version, 'version read from the kb snapshot');
  assert.ok(fs.existsSync(path.join(first.kb, 'roles', 'marker.txt')), 'kb not recopied onto itself');
  assert.match(fs.readFileSync(path.join(first.session, 'state.md'), 'utf8'), /slug: bin/);
  addRef(first.session);
  assert.equal(json(session(['round', '--session', first.session, '--next'], root, binSession)).round, 'rounds/01');

  const contrast = spawnSync(process.execPath, [path.join(first.bin, 'contrast.mjs'), '#000', '#fff'], { encoding: 'utf8' });
  assert.equal(contrast.status, 0, contrast.stderr);

  // From the bin copy, a fresh project gets its kb from the snapshot.
  fs.rmSync(path.join(first.kb, 'roles', 'marker.txt'));
  const other = tempRoot();
  const copied = json(session(['init', '--slug', 'elsewhere', '--root', other], root, binSession));
  assert.equal(copied.version, first.version);
  assert.ok(fs.existsSync(path.join(copied.kb, 'templates', 'state.md')));
  assert.ok(fs.existsSync(path.join(copied.bin, 'shoot.mjs')));
});

test('round --next and state keep state.md current', () => {
  const root = tempRoot();
  addRef(json(session(['init', '--slug', 'st', '--mode', 'crit'], root)).session);
  json(session(['round', '--session', 'latest', '--next'], root));
  const res = session(['state', '--session', 'latest', '--set', 'phase=report', '--set', 'roster=visual-designer, typographer', '--set', 'newkey=x', '--note', 'rulings written'], root);
  assert.equal(res.code, 0, res.stderr);
  const state = res.stdout;
  assert.match(state, /^phase: report$/m);
  assert.match(state, /^round: 1$/m);
  assert.match(state, /^roster: visual-designer, typographer$/m);
  assert.match(state, /^newkey: x$/m);
  assert.match(state, /round 1 opened\n- .* rulings written/);
  assert.ok(state.indexOf('newkey') < state.indexOf('## notes'), 'new keys go above the notes');
  assert.equal(session(['state', '--session', 'latest'], root).code, 2, 'nothing to set');
  assert.equal(session(['state', '--session', 'latest', '--set', 'nokey'], root).code, 2, 'bad pair');
});

test('the reference gate blocks rounds until a reference image exists', () => {
  const root = tempRoot();
  const { session: dir } = json(session(['init', '--slug', 'gate', '--mode', 'crit'], root));
  const closed = session(['refs', '--session', dir], root);
  assert.equal(closed.code, 2);
  assert.match(closed.stdout, /reference gate closed/);
  const blocked = session(['round', '--session', dir, '--next'], root);
  assert.equal(blocked.code, 2, 'no round without references');
  assert.match(blocked.stderr, /reference gate/);
  assert.ok(!fs.existsSync(path.join(dir, 'rounds', '01')), 'nothing created');

  fs.writeFileSync(path.join(dir, 'references', 'sources.md'), 'notes only');
  assert.equal(session(['refs', '--session', dir], root).code, 2, 'notes alone do not open the gate');
  fs.mkdirSync(path.join(dir, 'references', 'ref-01'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'references', 'ref-01', 'desktop-top.png'), 'png');
  const open = json(session(['refs', '--session', dir, '--json'], root));
  assert.deepEqual([open.ok, open.count], [true, 1], 'a captured URL counts');
  assert.equal(json(session(['round', '--session', dir, '--next'], root)).round, 'rounds/01');
});
