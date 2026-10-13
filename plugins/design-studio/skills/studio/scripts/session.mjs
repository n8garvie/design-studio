#!/usr/bin/env node
// Session bookkeeping for the studio: folders, knowledge-base snapshot, rounds and file barriers.
// Zero dependencies.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { referenceImages, skillDir as findSkillDir } from './_shared.mjs';

const HELP = `session.mjs — studio session folders and barriers

Usage:
  node session.mjs init --slug <slug> [--mode make|crit] [--depth quick|standard|deep]
                        [--root <dir>] [--resume] [--gitignore]
  node session.mjs round --session <dir> [--next]
  node session.mjs check --session <dir> --expect <relpath>... [--min-bytes 200]
                         [--expect-glob '<pattern>' [--count N]] [--json]
  node session.mjs refs --session <dir> [--json]
  node session.mjs state --session <dir> [--set key=value]... [--note "text"]
  node session.mjs status --session <dir> [--json]
  node session.mjs latest [--root <dir>] [--json]

init     creates .design-studio/sessions/<YYYY-MM-DD>-<slug>/ (adds -2, -3… if taken; --resume
         reuses the newest session with that slug), snapshots roles/ knowledge/ protocol/
         templates/ into .design-studio/kb/ and the scripts into .design-studio/bin/ when missing
         or out of date, writes state.md and .design-studio/config.json (if missing).
         Prints JSON {session, kb, bin, created, resumed, version}.
         From a terminal: node .design-studio/bin/<script>.mjs … works like the skill's copy.
refs     the reference gate: exits 0 when references/ holds at least one PNG, JPEG or WebP
         image (captured URLs included; the formats the lineup reads), else exits 2. Nothing starts without it.
round    --next refuses (exit 2) until the reference gate passes; then it creates rounds/NN/ with its subfolders and records round and phase in state.md;
         without it prints the latest round (JSON).
state    updates state.md: --set replaces a field (phase=deliver, roster="a, b", maker=id),
         --note appends a dated line under ## notes. Use it at every phase change.
check    exits 0 when every expected file exists and has at least --min-bytes bytes, else lists
         the problems and exits 2. --expect-glob patterns support * ? and **; --count N (default 1).
status   mode, depth, phase, latest round, latest ledger summary and overnight champion.
latest   the most recently active session dir.

--session accepts a path, a session folder name, or "latest".
Exit codes: 0 ok · 2 missing inputs or files.`;

// From the project copy (.design-studio/bin/) the kb snapshot stands in for the skill dir.
const SKILL_DIR = findSkillDir(import.meta.url);
const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const KB_FOLDERS = ['roles', 'knowledge', 'protocol', 'templates'];
const SESSION_DIRS = [
  'references',
  'discover',
  'develop/cards',
  'develop/tiles',
  'develop/shots',
  'develop/reactions',
  'develop/lineup',
  'spec',
  'build',
  'rounds',
  'deliver',
  'overnight/pairs',
];
const ROUND_DIRS = ['shots', 'critic-view', 'crit', 'panel', 'crosscrit', 'lineup', 'snapshot'];
const MODES = ['make', 'crit'];
const DEPTHS = ['quick', 'standard', 'deep'];

class UserError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.exitCode = exitCode;
  }
}

// ---------- helpers ----------

function studioDir(root) {
  return path.join(root, '.design-studio');
}

function sessionsDir(root) {
  return path.join(studioDir(root), 'sessions');
}

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '');
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function listDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

// All files under `dir` (relative paths, sorted), skipping dotfiles.
function walkFiles(dir, base = dir) {
  let out = [];
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkFiles(full, base));
    else if (e.isFile()) out.push(path.relative(base, full));
  }
  return out.sort();
}

// ---------- kb snapshot ----------

export function pluginVersion(skillDir = SKILL_DIR) {
  for (const host of ['.claude-plugin', '.codex-plugin']) {
    const manifest = readJson(path.join(skillDir, '..', '..', host, 'plugin.json'));
    if (manifest?.version) return String(manifest.version);
  }
  // A kb snapshot (when running from .design-studio/bin/) carries the version in its VERSION file.
  const snapshot = readText(path.join(skillDir, 'VERSION'));
  if (snapshot) return snapshot.trim().split('+')[0];
  return '0.0.0';
}

/** "<plugin version>+<8-hex hash>" of the given files (relative to `base`). */
function contentVersion(skillDir, base, rels) {
  const hash = crypto.createHash('sha256');
  for (const rel of rels) {
    hash.update(`${rel.split(path.sep).join('/')}\0`);
    hash.update(fs.readFileSync(path.join(base, rel)));
    hash.update('\0');
  }
  return `${pluginVersion(skillDir)}+${hash.digest('hex').slice(0, 8)}`;
}

function kbFiles(skillDir) {
  return KB_FOLDERS.flatMap((folder) => walkFiles(path.join(skillDir, folder)).map((rel) => path.join(folder, rel)));
}

/** "<plugin version>+<8-hex hash of the kb folders' contents>". */
export function kbVersion(skillDir = SKILL_DIR) {
  return contentVersion(skillDir, skillDir, kbFiles(skillDir));
}

// Compare real paths so a symlinked --root can never make the kb copy onto itself.
const realOrResolved = (p) => {
  try {
    return fs.realpathSync(p);
  } catch {
    return path.resolve(p);
  }
};
const samePath = (a, b) => realOrResolved(a) === realOrResolved(b);

/** Copy the skill's kb folders into <root>/.design-studio/kb when missing or stale. */
export function syncKb(root, skillDir = SKILL_DIR) {
  const kb = path.join(studioDir(root), 'kb');
  // Running from this project's own bin/: the kb is the source, never copy it onto itself.
  if (samePath(kb, skillDir)) return { kb, version: readText(path.join(kb, 'VERSION'))?.trim() ?? kbVersion(skillDir), updated: false };
  const version = kbVersion(skillDir);
  if (readText(path.join(kb, 'VERSION'))?.trim() === version) return { kb, version, updated: false };

  fs.rmSync(kb, { recursive: true, force: true });
  for (const rel of kbFiles(skillDir)) {
    fs.mkdirSync(path.dirname(path.join(kb, rel)), { recursive: true });
    fs.copyFileSync(path.join(skillDir, rel), path.join(kb, rel));
  }
  fs.writeFileSync(path.join(kb, 'VERSION'), `${version}\n`);
  return { kb, version, updated: true };
}

/**
 * Copy the scripts (*.mjs, which import each other relatively) into <root>/.design-studio/bin
 * when missing or stale, so `node .design-studio/bin/<script>.mjs` works from a terminal.
 */
export function syncBin(root, scriptsDir = SCRIPTS_DIR, skillDir = SKILL_DIR) {
  const bin = path.join(studioDir(root), 'bin');
  const scripts = () => fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.mjs')).sort();
  if (samePath(bin, scriptsDir)) return { bin, updated: false };
  const version = contentVersion(skillDir, scriptsDir, scripts());
  if (readText(path.join(bin, 'VERSION'))?.trim() === version) return { bin, version, updated: false };

  fs.mkdirSync(bin, { recursive: true });
  for (const stale of fs.readdirSync(bin).filter((f) => f.endsWith('.mjs'))) fs.rmSync(path.join(bin, stale));
  for (const file of scripts()) fs.copyFileSync(path.join(scriptsDir, file), path.join(bin, file));
  fs.writeFileSync(path.join(bin, 'VERSION'), `${version}\n`);
  return { bin, version, updated: true };
}

// ---------- session resolution ----------

// Session folder names are <YYYY-MM-DD>-<slug>[-N]. Returns the newest existing one for a slug.
function findExistingSession(root, slug) {
  const re = new RegExp(`^(\\d{4}-\\d{2}-\\d{2})-${slug}(?:-(\\d+))?$`); // slug is [a-z0-9-] only
  const matches = listDirs(sessionsDir(root))
    .map((name) => ({ name, m: name.match(re) }))
    .filter((x) => x.m)
    .sort((a, b) => a.m[1].localeCompare(b.m[1]) || Number(a.m[2] ?? 1) - Number(b.m[2] ?? 1));
  return matches.length ? path.join(sessionsDir(root), matches.at(-1).name) : null;
}

function nextFreeSessionDir(root, base) {
  let dir = path.join(sessionsDir(root), base);
  for (let n = 2; fs.existsSync(dir); n++) dir = path.join(sessionsDir(root), `${base}-${n}`);
  return dir;
}

function sessionActivity(dir) {
  let t = 0;
  for (const f of [dir, path.join(dir, 'state.md')]) {
    try {
      t = Math.max(t, fs.statSync(f).mtimeMs);
    } catch {
      /* missing state.md is fine */
    }
  }
  return t;
}

export function latestSession(root) {
  const dirs = listDirs(sessionsDir(root)).map((name) => path.join(sessionsDir(root), name));
  if (!dirs.length) return null;
  return dirs
    .map((dir) => ({ dir, t: sessionActivity(dir) }))
    .sort((a, b) => b.t - a.t || b.dir.localeCompare(a.dir))[0].dir;
}

function resolveSession(arg) {
  if (!arg) throw new UserError('--session <dir> is required');
  const cwd = process.cwd();
  if (arg === 'latest') {
    const found = latestSession(cwd);
    if (!found) throw new UserError(`no sessions under ${sessionsDir(cwd)}`);
    return found;
  }
  for (const candidate of [path.resolve(cwd, arg), path.join(sessionsDir(cwd), arg)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  throw new UserError(`session not found: ${path.resolve(cwd, arg)}`);
}

// ---------- init ----------

function renderState(vars) {
  const template = path.join(SKILL_DIR, 'templates', 'state.md');
  if (fs.existsSync(template)) {
    return fs.readFileSync(template, 'utf8').replace(/\{\{\s*(slug|mode|depth|date|session)\s*\}\}/g, (_, k) => vars[k]);
  }
  return [
    `# Studio session: ${vars.slug}`,
    '',
    `session: ${vars.session}`,
    `slug: ${vars.slug}`,
    `mode: ${vars.mode}`,
    `depth: ${vars.depth}`,
    `date: ${vars.date}`,
    'phase: brief',
    'round: 0',
    '',
  ].join('\n');
}

function ensureGitignore(root) {
  const file = path.join(root, '.gitignore');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const present = existing.split(/\r?\n/).some((l) => /^\/?\.design-studio\/?\s*$/.test(l.trim()));
  if (present) return false;
  const sep = existing && !existing.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(file, `${existing}${sep}.design-studio/\n`);
  return true;
}

export function init({ slug, mode = 'make', depth = 'standard', root = process.cwd(), resume = false, gitignore = false }) {
  const cleanSlug = slugify(slug);
  if (!cleanSlug) throw new UserError('--slug is required (letters, digits and dashes)');
  if (!MODES.includes(mode)) throw new UserError(`--mode must be one of ${MODES.join(', ')}`);
  if (!DEPTHS.includes(depth)) throw new UserError(`--depth must be one of ${DEPTHS.join(', ')}`);
  root = path.resolve(root);
  if (!fs.existsSync(root)) throw new UserError(`root not found: ${root}`);

  const date = today();
  const existing = resume ? findExistingSession(root, cleanSlug) : null;
  const session = existing ?? nextFreeSessionDir(root, `${date}-${cleanSlug}`);
  const created = !existing;

  for (const sub of SESSION_DIRS) fs.mkdirSync(path.join(session, sub), { recursive: true });

  const { kb, version, updated } = syncKb(root);
  const { bin, updated: binUpdated } = syncBin(root);

  const stateFile = path.join(session, 'state.md');
  if (!fs.existsSync(stateFile)) {
    const rel = path.relative(root, session).split(path.sep).join('/');
    fs.writeFileSync(stateFile, renderState({ slug: cleanSlug, mode, depth, date, session: rel }));
  }

  const config = path.join(studioDir(root), 'config.json');
  const configTemplate = path.join(SKILL_DIR, 'templates', 'config.json');
  if (!fs.existsSync(config) && fs.existsSync(configTemplate)) fs.copyFileSync(configTemplate, config);

  const gitignoreUpdated = gitignore ? ensureGitignore(root) : false;
  return {
    session,
    kb,
    bin,
    created,
    resumed: Boolean(existing),
    version,
    kbUpdated: updated,
    binUpdated,
    config: fs.existsSync(config) ? config : null,
    gitignoreUpdated,
  };
}

// ---------- rounds ----------

function rounds(session) {
  return listDirs(path.join(session, 'rounds'))
    .filter((name) => /^\d+$/.test(name))
    .map((name) => ({ name, n: Number(name) }))
    .sort((a, b) => a.n - b.n);
}

function roundInfo(session, entry) {
  if (!entry) return { round: null, path: null, n: 0 };
  return { round: `rounds/${entry.name}`, path: path.join(session, 'rounds', entry.name), n: entry.n };
}

export function latestRound(session) {
  return roundInfo(session, rounds(session).at(-1));
}

export { referenceImages };

function requireReferences(session) {
  if (referenceImages(session).length) return;
  throw new UserError(
    `reference gate: no reference images in ${path.join(session, 'references')}. `
    + 'Ask the user for references (images, URLs, Figma frames or named sites), save or capture them there, then retry.',
  );
}

export function nextRound(session) {
  requireReferences(session);
  const n = (rounds(session).at(-1)?.n ?? 0) + 1;
  const name = String(n).padStart(2, '0');
  for (const sub of ROUND_DIRS) fs.mkdirSync(path.join(session, 'rounds', name, sub), { recursive: true });
  updateState(session, { set: { phase: 'crit', round: String(n) }, note: `round ${n} opened` });
  return roundInfo(session, { name, n });
}

// ---------- state.md ----------

/** Replace `key: value` lines in state.md (adding missing keys before ## notes) and append a note. */
export function updateState(session, { set = {}, note = '' } = {}) {
  const file = path.join(session, 'state.md');
  if (!fs.existsSync(file)) return null;
  let text = fs.readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(set)) {
    const re = new RegExp(`^(${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}):.*$`, 'm');
    if (re.test(text)) text = text.replace(re, () => `${key}: ${value}`);
    else if (/^## notes/m.test(text)) text = text.replace(/^## notes/m, () => `${key}: ${value}\n\n## notes`);
    else text += `\n${key}: ${value}\n`;
  }
  if (note) {
    const line = `- ${new Date().toISOString().slice(0, 16).replace('T', ' ')} ${note.replace(/\s+/g, ' ').trim()}`;
    if (/^## notes\s*$/m.test(text)) {
      // Append after the last line of the notes section.
      const parts = text.split(/^(?=## )/m);
      const i = parts.findIndex((p) => p.startsWith('## notes'));
      parts[i] = parts[i].replace(/\s*$/, '') + `\n${line}\n\n`;
      text = parts.join('');
    } else text += `\n## notes\n${line}\n`;
  }
  fs.writeFileSync(file, text.replace(/\n{3,}/g, '\n\n'));
  return file;
}

// ---------- check (barrier) ----------

function globToRegExp(pattern) {
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*' && pattern[i + 1] === '*') {
      // "**/" matches zero or more directories; a trailing "**" matches anything.
      const slash = pattern[i + 2] === '/';
      re += slash ? '(?:.*/)?' : '.*';
      i += slash ? 2 : 1;
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export function globFiles(base, pattern) {
  if (path.isAbsolute(pattern)) pattern = path.relative(base, pattern);
  pattern = pattern.split(path.sep).join('/');
  const parts = pattern.split('/');
  const firstWild = parts.findIndex((p) => /[*?]/.test(p));
  if (firstWild === -1) {
    const abs = path.join(base, pattern);
    return fileSize(abs) === null ? [] : [abs];
  }
  // Walk only from the static prefix of the pattern.
  const re = globToRegExp(pattern);
  return walkFiles(path.join(base, ...parts.slice(0, firstWild)), base)
    .map((rel) => rel.split(path.sep).join('/'))
    .filter((rel) => re.test(rel))
    .map((rel) => path.join(base, rel));
}

function fileSize(file) {
  try {
    const st = fs.statSync(file);
    return st.isFile() ? st.size : null;
  } catch {
    return null;
  }
}

export function check(session, { expect = [], globs = [], count = 1, minBytes = 200 }) {
  const missing = [];
  const small = [];
  for (const rel of expect) {
    const abs = path.resolve(session, rel);
    const size = fileSize(abs);
    if (size === null) missing.push(abs);
    else if (size < minBytes) small.push({ path: abs, bytes: size });
  }
  const globResults = globs.map((pattern) => {
    const files = globFiles(session, pattern);
    const ok = files.filter((f) => fileSize(f) >= minBytes);
    for (const f of files) if (fileSize(f) < minBytes) small.push({ path: f, bytes: fileSize(f) });
    return { pattern, found: ok.length, need: count, ok: ok.length >= count };
  });
  const ok = !missing.length && !small.length && globResults.every((g) => g.ok);
  return { ok, session, minBytes, checked: expect.length, missing, small, globs: globResults };
}

// ---------- status ----------

function stateField(text, key) {
  const m = text.match(new RegExp(`^\\s*[-*]?\\s*\\**${key}\\**\\s*:\\s*\\**\\s*(.+?)\\s*$`, 'im'));
  return m ? m[1].replace(/\*+$/, '').trim() : null;
}

function ledgerSummary(session) {
  for (const entry of rounds(session).reverse()) {
    const dir = path.join(session, 'rounds', entry.name);
    const json = readJson(path.join(dir, 'ledger.json'));
    if (json) {
      const studio = json.studio ?? {};
      return {
        round: `rounds/${entry.name}`,
        score: studio.score ?? null,
        spread: studio.spread ?? null,
        n: studio.n ?? null,
        source: studio.source ?? null,
        delta: json.delta ?? null,
        plateau: json.plateau ?? null,
        severity: json.counts?.severity ?? json.counts ?? null,
        lineupRank: json.lineup?.ourMedianRank ?? null,
        ledger: path.join(dir, fs.existsSync(path.join(dir, 'ledger.md')) ? 'ledger.md' : 'ledger.json'),
      };
    }
    if (fs.existsSync(path.join(dir, 'ledger.md'))) return { round: `rounds/${entry.name}`, ledger: path.join(dir, 'ledger.md') };
  }
  return null;
}

export function status(session) {
  const state = fs.existsSync(path.join(session, 'state.md')) ? fs.readFileSync(path.join(session, 'state.md'), 'utf8') : '';
  const champion = readJson(path.join(session, 'overnight', 'champion.json'));
  return {
    session,
    mode: stateField(state, 'mode'),
    depth: stateField(state, 'depth'),
    phase: stateField(state, 'phase'),
    round: latestRound(session),
    ledger: ledgerSummary(session),
    champion: champion ? { champion: champion.champion ?? null, score: champion.score ?? null, since_step: champion.since_step ?? null } : null,
  };
}

function printStatus(s) {
  const lines = [
    `session  ${s.session}`,
    `mode     ${s.mode ?? '?'} · depth ${s.depth ?? '?'} · phase ${s.phase ?? '?'}`,
    `round    ${s.round.round ?? 'none yet'}`,
  ];
  if (s.ledger) {
    const l = s.ledger;
    const parts = [];
    if (l.score !== undefined && l.score !== null) parts.push(`studio ${l.score}${l.spread !== null ? ` (spread ${l.spread}, n ${l.n})` : ''}`);
    if (l.delta !== undefined && l.delta !== null) parts.push(`delta ${l.delta > 0 ? '+' : ''}${l.delta}`);
    if (l.plateau) parts.push('PLATEAU');
    if (l.lineupRank !== undefined && l.lineupRank !== null) parts.push(`lineup rank ${l.lineupRank}`);
    if (l.severity && typeof l.severity === 'object') {
      parts.push(Object.entries(l.severity).map(([k, v]) => `${k} ${v}`).join(' '));
    }
    lines.push(`ledger   ${l.round}${parts.length ? ': ' + parts.join(' · ') : ''}`);
    lines.push(`         ${l.ledger}`);
  }
  if (s.champion) lines.push(`champion ${s.champion.champion ?? '?'}${s.champion.score !== null ? ` (score ${s.champion.score})` : ''}`);
  console.log(lines.join('\n'));
}

// ---------- CLI ----------

function intOption(value, name, fallback) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new UserError(`--${name} must be a non-negative integer`);
  return n;
}

export function main(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      slug: { type: 'string' },
      mode: { type: 'string', default: 'make' },
      depth: { type: 'string', default: 'standard' },
      root: { type: 'string' },
      resume: { type: 'boolean', default: false },
      gitignore: { type: 'boolean', default: false },
      session: { type: 'string' },
      next: { type: 'boolean', default: false },
      set: { type: 'string', multiple: true, default: [] },
      note: { type: 'string' },
      expect: { type: 'string', multiple: true, default: [] },
      'expect-glob': { type: 'string', multiple: true, default: [] },
      count: { type: 'string' },
      'min-bytes': { type: 'string' },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const [cmd, ...rest] = positionals;
  if (values.help || !cmd) {
    console.log(HELP);
    return values.help ? 0 : 2;
  }
  const root = path.resolve(process.cwd(), values.root ?? '.');

  switch (cmd) {
    case 'init': {
      const res = init({ slug: values.slug, mode: values.mode, depth: values.depth, root, resume: values.resume, gitignore: values.gitignore });
      console.log(JSON.stringify(res, null, 2));
      return 0;
    }
    case 'round': {
      const session = resolveSession(values.session);
      console.log(JSON.stringify(values.next ? nextRound(session) : latestRound(session), null, 2));
      return 0;
    }
    case 'refs': {
      const session = resolveSession(values.session);
      const images = referenceImages(session);
      const res = { ok: images.length > 0, count: images.length, images: images.map((rel) => path.join(session, 'references', rel)) };
      if (values.json) console.log(JSON.stringify(res, null, 2));
      else console.log(res.ok ? `reference gate open: ${images.length} reference image(s)` : `reference gate closed: no images in ${path.join(session, 'references')}`);
      return res.ok ? 0 : 2;
    }
    case 'state': {
      const session = resolveSession(values.session);
      const set = {};
      for (const pair of values.set) {
        const eq = pair.indexOf('=');
        if (eq < 1) throw new UserError(`--set needs key=value, got "${pair}"`);
        set[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
      }
      if (!Object.keys(set).length && !values.note) throw new UserError('state needs --set key=value or --note "text"');
      const file = updateState(session, { set, note: values.note ?? '' });
      if (!file) throw new UserError(`no state.md in ${session}`);
      console.log(fs.readFileSync(file, 'utf8'));
      return 0;
    }
    case 'check': {
      const session = resolveSession(values.session);
      // "--expect a.md b.md" style: extra positionals are more expected paths.
      const expect = [...values.expect, ...rest];
      const globs = values['expect-glob'];
      if (!expect.length && !globs.length) throw new UserError('check needs --expect <relpath>... or --expect-glob <pattern>');
      const res = check(session, {
        expect,
        globs,
        count: intOption(values.count, 'count', 1),
        minBytes: intOption(values['min-bytes'], 'min-bytes', 200),
      });
      if (values.json) console.log(JSON.stringify(res, null, 2));
      else printCheck(res);
      return res.ok ? 0 : 2;
    }
    case 'status': {
      const res = status(resolveSession(values.session));
      if (values.json) console.log(JSON.stringify(res, null, 2));
      else printStatus(res);
      return 0;
    }
    case 'latest': {
      const found = latestSession(root);
      if (!found) throw new UserError(`no sessions under ${sessionsDir(root)}`);
      console.log(values.json ? JSON.stringify({ session: found }) : found);
      return 0;
    }
    default:
      throw new UserError(`unknown subcommand "${cmd}" (init, refs, round, state, check, status, latest)`);
  }
}

function printCheck(res) {
  if (res.ok) {
    const n = res.checked + res.globs.reduce((s, g) => s + g.found, 0);
    console.log(`ok: ${n} file${n === 1 ? '' : 's'} present (≥ ${res.minBytes} bytes)`);
    return;
  }
  for (const f of res.missing) console.log(`missing    ${f}`);
  for (const f of res.small) console.log(`too small  ${f.path} (${f.bytes} bytes < ${res.minBytes})`);
  for (const g of res.globs.filter((x) => !x.ok)) console.log(`too few    ${g.pattern}: ${g.found} of ${g.need}`);
}

function isMain() {
  try {
    return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isMain()) {
  try {
    process.exitCode = main();
  } catch (err) {
    console.error(`session: ${err.message}`);
    process.exitCode = err.exitCode ?? 2;
  }
}
