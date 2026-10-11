#!/usr/bin/env node
// Blind lineups and pairwise comparisons.
// Jurors see letters (A, B, C… or X/Y), never sources; the key stays in <out>/.key.json.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  IMAGE_EXTS, abs, filesIn, isDir, isFile, list, mean, median, naturalCompare, parseArgs, printJson,
  readBlocks, readJson, readText, round, run, isMain, str, userError, writeJson,
} from './_shared.mjs';

const HELP = `Usage: node lineup.mjs <command> [flags]

Blind lineup (ours among references):
  make --ours <png> [--ours <png>…] [--label <name>…] --refs <dir|png...> --out <dir>
      Copies every image into <out>/set/ as A.png, B.png, … in random order and
      writes <out>/.key.json. A --refs folder contributes its images plus one shot
      per subfolder (a captured URL: desktop-top preferred). Repeat --ours for
      several candidates (e.g. one tile per direction); --label names them in
      the same order (default: basename).
      Prints {set, n}. Never reveals which entries are ours.
  score --dir <out> [--json]
      Reads <out>/juror-*.md (a \`\`\`json studio-lineup block each:
      {"juror","ranking":["C","A",…],"notes":{},"best_quality","gap_to_best"}),
      unblinds, writes <out>/result.json and prints a summary. Reports every ours
      entry (oursEntries) and bestOurs; ourMedianRank, ourRanks and
      firstByMajority describe the best ours entry. Exit 2 if no jurors.

Blind pair (champion vs challenger):
  pair --a <png> --b <png> --out <dir> [--a-label champion] [--b-label challenger]
      Copies the two images as <out>/X.png and <out>/Y.png in random order.
  pair-score --dir <out> [--json]
      Reads <out>/juror-*.md (\`\`\`json studio-pair: {"juror","winner":"X"|"Y"|"same",
      "margin":"none"|"slight"|"clear","why"}). A side wins with a strict majority
      of all ballots; it is a clear win when at least one winning ballot says
      "clear" and no ballot for the other side does. Writes <out>/result.json.

Images: png, jpg, jpeg, webp. Paths may be relative; output paths are absolute.`;

const KEY_FILE = '.key.json';

/** Bijective base-26 letters: 0 → A, 25 → Z, 26 → AA. */
export function letterFor(i) {
  let s = '';
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** Fisher–Yates with crypto randomness. */
function shuffle(items) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const isImage = (name) => IMAGE_EXTS.has(path.extname(name).toLowerCase());

function requireImage(p, flag) {
  const file = abs(p);
  if (!isFile(file)) throw userError(`${flag}: no such file: ${file}`);
  if (!isImage(file)) throw userError(`${flag}: not a png/jpg/jpeg/webp image: ${file}`);
  return file;
}

/**
 * One shot per captured reference folder (shoot.mjs writes references/ref-01/desktop-top.png,
 * mobile-top.png, …): the widest top shot, else the first top shot, else the first image.
 */
function representative(dir) {
  const all = filesIn(dir, isImage);
  const named = (re) => all.find((f) => re.test(path.basename(f)));
  return named(/(^|[-_])desktop-top\./i) ?? named(/(^|[-_])laptop-top\./i) ?? named(/(^|[-_])tablet-top\./i)
    ?? named(/-top\./i) ?? all[0] ?? null;
}

function subdirsOf(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => path.join(dir, d.name))
      .sort(naturalCompare);
  } catch {
    return [];
  }
}

function collectRefs(args, exclude) {
  const seen = new Set(exclude);
  const refs = [];
  for (const arg of args) {
    const p = abs(arg);
    const candidates = isDir(p)
      ? [...filesIn(p, isImage), ...subdirsOf(p).map(representative).filter(Boolean)]
      : [requireImage(p, '--refs')];
    for (const file of candidates) {
      const real = fs.realpathSync(file);
      if (seen.has(real)) continue;
      seen.add(real);
      refs.push(file);
    }
  }
  return refs;
}

/**
 * Labels for our candidates: explicit --label values in order, else the file's
 * basename; colliding basenames (desktop-top.png from two directions) get
 * their parent folder prepended, then a counter.
 */
function oursLabels(files, given) {
  if (given.length > files.length) throw userError(`got ${given.length} --label values for ${files.length} --ours images`);
  const base = (f) => path.basename(f, path.extname(f));
  const defaults = files.map(base);
  const labels = files.map((f, i) => given[i] ?? (defaults.filter((d) => d === defaults[i]).length > 1
    ? `${path.basename(path.dirname(f))}/${defaults[i]}` : defaults[i]));
  const seen = {};
  return labels.map((l) => {
    seen[l] = (seen[l] ?? 0) + 1;
    return seen[l] > 1 ? `${l}#${seen[l]}` : l;
  });
}

function jurorFiles(dir) {
  return filesIn(dir, (name) => /^juror-.*\.md$/i.test(name));
}

function readKey(dir) {
  const key = readJson(path.join(dir, KEY_FILE));
  if (!key || typeof key !== 'object') throw userError(`no readable ${KEY_FILE} in ${dir}; run make/pair first`);
  return key;
}

/** First valid block per juror file; files without one are reported as skipped. */
function readBallots(dir, tag) {
  const files = jurorFiles(dir);
  if (!files.length) throw userError(`no juror-*.md files in ${dir}`);
  const ballots = [];
  const skipped = [];
  for (const file of files) {
    const blocks = readBlocks(readText(file) ?? '', tag);
    const block = blocks.find((b) => b.data && typeof b.data === 'object');
    if (block) ballots.push({ file, data: block.data });
    else skipped.push({ file, reason: blocks.length ? `invalid JSON in ${tag} block: ${blocks[0].error}` : `no \`\`\`json ${tag} block` });
  }
  return { ballots, skipped };
}

function cmdMake(flags) {
  const oursArgs = list(flags, 'ours');
  if (!oursArgs.length) throw userError('--ours is required (repeat it for several candidates)');
  const ours = oursArgs.map((p) => requireImage(p, '--ours'));
  const oursReal = ours.map((f) => fs.realpathSync(f));
  if (new Set(oursReal).size !== ours.length) throw userError('the same --ours image was given twice');
  const labels = oursLabels(ours, list(flags, 'label'));
  const out = abs(str(flags, 'out', { required: true }));
  const refArgs = list(flags, 'refs');
  if (!refArgs.length) throw userError('--refs needs at least one directory or image');
  const refs = collectRefs(refArgs, oursReal);
  if (!refs.length) throw userError('no reference images found in --refs (png, jpg, jpeg, webp)');

  const setDir = path.join(out, 'set');
  fs.rmSync(setDir, { recursive: true, force: true });
  fs.rmSync(path.join(out, 'result.json'), { force: true });
  fs.mkdirSync(setDir, { recursive: true });
  if (jurorFiles(out).length) process.stderr.write(`warning: ${out} already has juror-*.md files from an earlier set; they will not match the new key\n`);

  const entries = shuffle([
    ...ours.map((source, i) => ({ source, ours: true, label: labels[i] })),
    ...refs.map((source) => ({ source, ours: false, label: path.basename(source) })),
  ]);
  const key = {};
  const set = entries.map((entry, i) => {
    const letter = letterFor(i);
    const dest = path.join(setDir, letter + path.extname(entry.source).toLowerCase());
    fs.copyFileSync(entry.source, dest);
    key[letter] = entry;
    return dest;
  });
  writeJson(path.join(out, KEY_FILE), key);
  printJson({ set, n: set.length });
  return 0;
}

const byRank = (a, b) => (a.medianRank ?? Infinity) - (b.medianRank ?? Infinity)
  || (a.meanRank ?? Infinity) - (b.meanRank ?? Infinity)
  || b.firstVotes - a.firstVotes;

function cmdScore(flags) {
  const dir = abs(str(flags, 'dir', { required: true }));
  const key = readKey(dir);
  const letters = Object.keys(key);
  const oursLetters = letters.filter((l) => key[l].ours);
  if (!oursLetters.length) throw userError(`${KEY_FILE} in ${dir} marks no entry as ours`);
  const { ballots, skipped } = readBallots(dir, 'studio-lineup');

  const ranks = Object.fromEntries(letters.map((l) => [l, []]));
  const jurors = [];
  for (const { file, data } of ballots) {
    const order = Array.isArray(data.ranking) ? data.ranking.map((l) => String(l).trim().toUpperCase()) : [];
    const ranking = order.filter((l, i) => key[l] && order.indexOf(l) === i);
    if (!ranking.length) {
      skipped.push({ file, reason: 'ranking is missing or names no letters from the set' });
      continue;
    }
    ranking.forEach((l, i) => ranks[l].push(i + 1));
    jurors.push({ juror: data.juror ?? path.basename(file, '.md'), file, ranking, data });
  }
  if (!jurors.length) {
    for (const s of skipped) process.stderr.write(`skipped ${s.file}: ${s.reason}\n`);
    throw userError(`no valid studio-lineup blocks in ${dir}`);
  }

  const ranking = letters
    .map((letter) => ({
      letter,
      label: key[letter].label ?? path.basename(key[letter].source),
      source: key[letter].source,
      ours: !!key[letter].ours,
      ranks: ranks[letter],
      medianRank: median(ranks[letter]),
      meanRank: round(mean(ranks[letter])),
      firstVotes: ranks[letter].filter((r) => r === 1).length,
    }))
    .sort(byRank);
  const oursEntries = ranking.filter((e) => e.ours).map((e) => ({ ...e, firstByMajority: e.firstVotes > jurors.length / 2 }));
  const best = oursEntries[0];

  const result = {
    n: jurors.length,
    size: letters.length,
    oursCount: oursEntries.length,
    bestOurs: { letter: best.letter, label: best.label, medianRank: best.medianRank, meanRank: best.meanRank },
    // ourMedianRank, ourRanks and firstByMajority describe the best of our entries.
    ourMedianRank: best.medianRank,
    ourMeanRank: best.meanRank,
    ourRanks: best.ranks,
    firstByMajority: best.firstByMajority,
    oursEntries,
    beatsUs: mostOftenAhead(jurors, key, ranking, best.letter),
    ranking,
    jurors: jurors.map(({ juror, file, ranking: order, data }) => {
      const notes = data.notes && typeof data.notes === 'object' ? data.notes : {};
      const pos = order.indexOf(best.letter);
      return {
        juror,
        file,
        ranking: order,
        ourRank: pos === -1 ? null : pos + 1,
        oursRanks: Object.fromEntries(oursEntries.map((e) => [e.label, order.includes(e.letter) ? order.indexOf(e.letter) + 1 : null])),
        notesOnOurs: Object.fromEntries(oursEntries.filter((e) => notes[e.letter]).map((e) => [e.label, notes[e.letter]])),
        best_quality: data.best_quality ?? null,
        gap_to_best: data.gap_to_best ?? null,
      };
    }),
    skipped,
  };
  writeJson(path.join(dir, 'result.json'), result);

  if (flags.json) printJson(result);
  else {
    const b = result.beatsUs;
    const plural = result.n === 1 ? '' : 's';
    console.log(`Lineup of ${result.size}, ${result.n} juror${plural}. Best of ours: ${best.label}, median rank ${best.medianRank ?? '–'} (ranks ${best.ranks.join(', ') || 'none'}), first by majority: ${best.firstByMajority ? 'yes' : 'no'}`);
    if (oursEntries.length > 1) console.log(`All ours: ${oursEntries.map((e) => `${e.label} ${e.medianRank ?? '–'}`).join(' · ')}`);
    console.log(b ? `Most often ahead of ${best.label}: ${b.letter} = ${b.source} (${b.count} of ${b.of} jurors)` : `No reference ranked ahead of ${best.label}.`);
    for (const s of skipped) console.log(`Skipped ${s.file}: ${s.reason}`);
    console.log(`Result: ${path.join(dir, 'result.json')}`);
  }
  return 0;
}

/** The reference (not one of ours) ranked above `target` by the most jurors; ties go to the better median rank. */
function mostOftenAhead(jurors, key, ranking, target) {
  const counts = {};
  let of = 0;
  for (const { ranking: order } of jurors) {
    const pos = order.indexOf(target);
    if (pos === -1) continue;
    of++;
    for (const l of order.slice(0, pos)) if (!key[l].ours) counts[l] = (counts[l] ?? 0) + 1;
  }
  const order = ranking.map((e) => e.letter);
  const best = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b))[0];
  return best ? { letter: best, source: key[best].source, count: counts[best], of } : null;
}

function cmdPair(flags) {
  const a = requireImage(str(flags, 'a', { required: true }), '--a');
  const b = requireImage(str(flags, 'b', { required: true }), '--b');
  const out = abs(str(flags, 'out', { required: true }));
  const labels = { a: str(flags, 'a-label') ?? 'a', b: str(flags, 'b-label') ?? 'b' };
  const sources = { a, b };

  fs.mkdirSync(out, { recursive: true });
  for (const name of fs.readdirSync(out)) if (/^[XY]\.(png|jpe?g|webp)$/i.test(name)) fs.rmSync(path.join(out, name));
  fs.rmSync(path.join(out, 'result.json'), { force: true });
  if (jurorFiles(out).length) process.stderr.write(`warning: ${out} already has juror-*.md files from an earlier pair; they will not match the new key\n`);

  const [first, second] = shuffle(['a', 'b']);
  const key = {};
  const result = {};
  for (const [letter, side] of [['X', first], ['Y', second]]) {
    const dest = path.join(out, letter + path.extname(sources[side]).toLowerCase());
    fs.copyFileSync(sources[side], dest);
    key[letter] = { source: sources[side], side, label: labels[side] };
    result[letter] = dest;
  }
  writeJson(path.join(out, KEY_FILE), key);
  printJson(result);
  return 0;
}

function cmdPairScore(flags) {
  const dir = abs(str(flags, 'dir', { required: true }));
  const key = readKey(dir);
  if (!key.X || !key.Y) throw userError(`${KEY_FILE} in ${dir} is not a pair key (needs X and Y)`);
  const { ballots, skipped } = readBallots(dir, 'studio-pair');

  const votes = { a: 0, b: 0, same: 0 };
  const jurors = [];
  for (const { file, data } of ballots) {
    const pick = String(data.winner ?? '').trim().toUpperCase();
    const vote = pick === 'X' || pick === 'Y' ? key[pick].side : pick === 'SAME' ? 'same' : null;
    if (!vote) {
      skipped.push({ file, reason: `winner must be "X", "Y" or "same", got ${JSON.stringify(data.winner)}` });
      continue;
    }
    const margin = ['none', 'slight', 'clear'].includes(data.margin) ? data.margin : 'none';
    votes[vote] += 1;
    jurors.push({ juror: data.juror ?? path.basename(file, '.md'), file, vote, margin, why: data.why ?? null });
  }
  if (!jurors.length) {
    for (const s of skipped) process.stderr.write(`skipped ${s.file}: ${s.reason}\n`);
    throw userError(`no valid studio-pair blocks in ${dir}`);
  }

  const n = jurors.length;
  const winner = votes.a > n / 2 ? 'a' : votes.b > n / 2 ? 'b' : 'tie';
  const clearFor = (side) => jurors.some((j) => j.vote === side && j.margin === 'clear');
  const loser = winner === 'a' ? 'b' : 'a';
  const clearWin = winner !== 'tie' && clearFor(winner) && !clearFor(loser);
  const entryFor = (side) => (key.X.side === side ? key.X : key.Y);
  const labelOf = (side) => entryFor(side).label;
  const result = {
    winner,
    label: winner === 'tie' ? null : labelOf(winner),
    votes,
    clearWin,
    n,
    sides: {
      a: { label: labelOf('a'), source: entryFor('a').source },
      b: { label: labelOf('b'), source: entryFor('b').source },
    },
    jurors,
    skipped,
  };
  writeJson(path.join(dir, 'result.json'), result);

  if (flags.json) printJson(result);
  else {
    const tally = `${labelOf('a')} ${votes.a}, ${labelOf('b')} ${votes.b}, same ${votes.same}`;
    console.log(winner === 'tie'
      ? `Tie (${tally}) across ${n} juror${n === 1 ? '' : 's'}.`
      : `${result.label} wins${clearWin ? ' clearly' : ''} (${tally}) across ${n} juror${n === 1 ? '' : 's'}.`);
    for (const s of skipped) console.log(`Skipped ${s.file}: ${s.reason}`);
    console.log(`Result: ${path.join(dir, 'result.json')}`);
  }
  return 0;
}

const COMMANDS = { make: cmdMake, score: cmdScore, pair: cmdPair, 'pair-score': cmdPairScore };

export async function main(argv) {
  const { positionals, flags } = parseArgs(argv);
  const command = COMMANDS[positionals[0]];
  if (flags.help || !command) {
    if (!flags.help && positionals[0]) process.stderr.write(`error: unknown command "${positionals[0]}"\n\n`);
    console.log(HELP);
    return flags.help ? 0 : 2;
  }
  return command(flags);
}

if (isMain(import.meta.url)) run(main);
