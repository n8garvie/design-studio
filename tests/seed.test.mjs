import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(here, '../plugins/design-studio/skills/studio/scripts/seed.mjs');
const { pick, randomSeed, roll, sampleStances, AXES, STANCES, DISCIPLINES, SEED_LENGTH } = await import(SCRIPT);

const FIXED = 'Qm7xTr2LpZ9aKd4vWc1NbY8eHs3gJu6oFi5yXq0tRn2MwPk7ZaLd9sVe4BcGh1UjTo8NmIr3QxEy6WpKf5AzSl0DvHb2CnJg';

test('pick maps a fixed string deterministically: char-code sum of disjoint 4-char groups mod options', () => {
  assert.equal(FIXED.length, 96);
  const first = pick(FIXED);
  assert.deepEqual(pick(FIXED), first, 'same string, same picks');
  assert.equal(first.picks.length, AXES.length);
  first.picks.forEach((p, i) => {
    const group = FIXED.slice(i * 4, i * 4 + 4);
    const sum = [...group].reduce((s, ch) => s + ch.charCodeAt(0), 0);
    assert.equal(p.group, group);
    assert.equal(p.index, sum % AXES[i].options.length, `axis ${p.axis}`);
    assert.equal(p.option, AXES[i].options[p.index]);
  });
});

test('pick on a uniform string picks the same index arithmetic on every axis', () => {
  const res = pick('A'.repeat(96));
  res.picks.forEach((p, i) => assert.equal(p.index, (65 * 4) % AXES[i].options.length));
  assert.throws(() => pick('short'));
});

test('axes cover the spec with 6-10 options each', () => {
  assert.deepEqual(AXES.map((a) => a.key), ['era', 'material', 'palette', 'type', 'layout', 'motion', 'imagery', 'density', 'wildcard']);
  for (const axis of AXES) assert.ok(axis.options.length >= 6 && axis.options.length <= 10, `${axis.key}: ${axis.options.length}`);
});

test('random seeds are 96 alphanumeric characters', () => {
  const seed = randomSeed();
  assert.equal(seed.length, SEED_LENGTH);
  assert.match(seed, /^[A-Za-z0-9]{96}$/);
  assert.notEqual(randomSeed(), seed);
});

test('roll gives n directions and neighbors that move 1-2 axes', () => {
  const dirs = roll(3, 2);
  assert.equal(dirs.length, 3);
  for (const d of dirs) {
    assert.deepEqual(pick(d.seed).picks, d.picks, 'a roll can be re-derived from its seed');
    assert.equal(d.neighbors.length, 2);
    for (const nb of d.neighbors) {
      const moved = nb.picks.filter((p, i) => p.option !== d.picks[i].option).length;
      assert.ok(moved >= 1 && moved <= 2, `moved ${moved}`);
      assert.equal(nb.changed.length, moved);
    }
  }
});

test('stances are distinct; the outsider gets a discipline', () => {
  const all = sampleStances(STANCES.length);
  assert.equal(new Set(all.map((s) => s.key)).size, STANCES.length);
  const outsider = all.find((s) => s.key === 'outsider');
  assert.ok(DISCIPLINES.includes(outsider.discipline));
  assert.throws(() => sampleStances(STANCES.length + 1));
});

test('CLI: roll --json, stances markdown, and the usage note in --help', () => {
  const r = spawnSync(process.execPath, [SCRIPT, 'roll', '--n', '2', '--neighbors', '1', '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.directions.length, 2);
  assert.equal(out.directions[0].seed.length, 96);

  const md = spawnSync(process.execPath, [SCRIPT, 'roll'], { encoding: 'utf8' });
  assert.equal((md.stdout.match(/### Direction/g) || []).length, 3, 'default n is 3');

  const st = spawnSync(process.execPath, [SCRIPT, 'stances', '--n', '3'], { encoding: 'utf8' });
  assert.equal(st.status, 0);
  assert.equal(st.stdout.trim().split('\n').length, 3);

  const help = spawnSync(process.execPath, [SCRIPT, '--help'], { encoding: 'utf8' });
  assert.match(help.stdout, /Let the roll pick even when it feels wrong/);
});
