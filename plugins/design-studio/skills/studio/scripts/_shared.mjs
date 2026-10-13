// Small helpers shared by the studio scripts (lineup, tally, gallery, overnight).
// Zero dependencies; Node >= 18.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * The reference gate: reference images under <session>/references (captured URLs land in
 * subfolders). Only IMAGE_EXTS count, the formats the lineup reads. Relative paths, sorted.
 */
export function referenceImages(session) {
  const root = path.join(session, 'references');
  const out = [];
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase())) out.push(path.relative(root, full));
    }
  };
  walk(root);
  return out.sort();
}

/** An error meant for the user: printed as one line, exits with `code`. */
export function userError(message, code = 2) {
  const err = new Error(message);
  err.exitCode = code;
  return err;
}

/**
 * Parse `sub --flag value --list a b c --bool` style argv.
 * Flags take every following token up to the next `--flag`; one value becomes a
 * string, several become an array. Names in `booleans` (plus help and json)
 * never take values. `--flag=value` also works. Repeating a flag accumulates.
 */
export function parseArgs(argv, { booleans = [] } = {}) {
  const bools = new Set(['help', 'json', ...booleans]);
  const flags = {};
  const positionals = [];
  const set = (key, value) => {
    if (!(key in flags)) flags[key] = value;
    else flags[key] = [].concat(flags[key], value);
  };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === '-h') { flags.help = true; continue; }
    if (!tok.startsWith('--') || tok === '--') { positionals.push(tok); continue; }
    let key = tok.slice(2);
    const eq = key.indexOf('=');
    if (eq !== -1) { set(key.slice(0, eq), key.slice(eq + 1)); continue; }
    if (bools.has(key)) { flags[key] = true; continue; }
    const values = [];
    while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) values.push(argv[++i]);
    set(key, values.length === 0 ? true : values.length === 1 ? values[0] : values);
  }
  return { positionals, flags };
}

/** Read a single-valued string flag; throws a user error when malformed. */
export function str(flags, name, { required = false } = {}) {
  const v = flags[name];
  if (v === undefined) {
    if (required) throw userError(`--${name} is required`);
    return undefined;
  }
  if (v === true) throw userError(`--${name} needs a value`);
  if (Array.isArray(v)) throw userError(`--${name} takes one value, got ${v.length}`);
  return v;
}

/** Read a numeric flag with a default and an optional minimum. */
export function num(flags, name, fallback, { min = -Infinity, integer = false } = {}) {
  const raw = str(flags, name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) {
    throw userError(`--${name} must be ${integer ? 'an integer' : 'a number'}${min > -Infinity ? ` >= ${min}` : ''}, got "${raw}"`);
  }
  return n;
}

/** Read a multi-valued flag as an array; `split` also splits on commas. */
export function list(flags, name, { split = false } = {}) {
  const v = flags[name];
  if (v === undefined || v === true) return [];
  const arr = [].concat(v);
  return split ? arr.flatMap((s) => s.split(',')).map((s) => s.trim()).filter(Boolean) : arr;
}

export const abs = (p) => path.resolve(process.cwd(), p);

export function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return null; }
}

export function readJson(file) {
  const text = readText(file);
  if (text === null) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

export function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

export function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

/** Files in `dir` (not recursive) whose name passes `test`, sorted naturally. */
export function filesIn(dir, test = () => true) {
  let names;
  try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  return names
    .filter((d) => d.isFile() && !d.name.startsWith('.') && test(d.name))
    .map((d) => d.name)
    .sort(naturalCompare)
    .map((name) => path.join(dir, name));
}

export const naturalCompare = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

/**
 * Extract every fenced block whose info string contains `tag`, e.g.
 * ```json studio-findings ... ```. Returns [{data, error, line}] where `data`
 * is the parsed JSON (or null) and `line` is the 1-based opening line.
 */
export function readBlocks(text, tag) {
  const lines = String(text).split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (!open) continue;
    const fence = open[1];
    const info = open[2].trim().split(/\s+/);
    const body = [];
    let j = i + 1;
    const close = new RegExp(`^\\s{0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`);
    while (j < lines.length && !close.test(lines[j])) body.push(lines[j++]);
    if (info.includes(tag)) {
      const parsed = parseJsonLenient(body.join('\n'));
      blocks.push({ ...parsed, line: i + 1 });
    }
    i = j;
  }
  return blocks;
}

/** JSON.parse that forgives trailing commas, which models sometimes emit. */
export function parseJsonLenient(text) {
  try { return { data: JSON.parse(text), error: null }; } catch (err) {
    try { return { data: JSON.parse(text.replace(/,(\s*[}\]])/g, '$1')), error: null }; } catch {
      return { data: null, error: err.message };
    }
  }
}

export function median(nums) {
  const xs = nums.filter((n) => typeof n === 'number' && Number.isFinite(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

export function mean(nums) {
  const xs = nums.filter((n) => typeof n === 'number' && Number.isFinite(n));
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export const round = (n, digits = 2) => (n === null || n === undefined ? null : Number(n.toFixed(digits)));

/** Format a score: integers stay bare, others get one decimal. */
export function fmtScore(n) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function printJson(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

/**
 * The skill dir for a script at `metaUrl` (pass `import.meta.url`): normally the
 * parent of scripts/. When the script runs from the project copy at
 * `<root>/.design-studio/bin/`, the kb snapshot next to it stands in for the
 * skill dir (it holds the same roles/ knowledge/ protocol/ templates/).
 */
export function skillDir(metaUrl) {
  const here = path.dirname(fileURLToPath(metaUrl));
  if (isBinCopy(here)) return path.resolve(here, '..', 'kb');
  return path.resolve(here, '..');
}

/** True when `dir` is a project copy of the scripts: `<root>/.design-studio/bin`. */
export function isBinCopy(dir) {
  return path.basename(dir) === 'bin' && path.basename(path.dirname(dir)) === '.design-studio';
}

/** True when the module at `metaUrl` is the script node was asked to run. */
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(fileURLToPath(metaUrl)) === fs.realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

/** Run an async CLI main: user errors print one line; exit codes follow the studio convention. */
export function run(main) {
  Promise.resolve()
    .then(() => main(process.argv.slice(2)))
    .then((code) => { process.exitCode = typeof code === 'number' ? code : 0; })
    .catch((err) => {
      if (err && err.exitCode) {
        process.stderr.write(`error: ${err.message}\n`);
        process.exitCode = err.exitCode;
      } else {
        process.stderr.write(`error: ${err && err.message ? err.message : err}\n`);
        if (process.env.STUDIO_DEBUG && err && err.stack) process.stderr.write(err.stack + '\n');
        process.exitCode = 1;
      }
    });
}
