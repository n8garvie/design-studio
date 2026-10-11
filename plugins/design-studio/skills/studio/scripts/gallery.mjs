#!/usr/bin/env node
// The session gallery (one self-contained gallery.html) and side-by-side comparison boards.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  IMAGE_EXTS, abs, filesIn, fmtScore, isDir, isFile, list, naturalCompare, parseArgs,
  printJson, readJson, readText, run, isMain, str, userError,
} from './_shared.mjs';

const HELP = `Usage: node gallery.mjs <command> [flags]

  build --session <dir> [--json]
      Writes <session>/gallery.html: brief, references, directions
      (develop/shots/*), system sheet, rounds newest first (top shots, studio
      score, lineup rank, ledger and rulings links), overnight champion, and the
      final deliverables. One self-contained file; every link is relative.

  board --items <png...> --labels <a,b,c> --out <file.html> [--title <t>] [--png] [--json]
      Side-by-side comparison board: equal-width columns, label above each
      image. --png also renders <file>.png with Playwright (via shoot.mjs);
      without a browser it writes the HTML only and warns.

Images open full size in a new tab. Paths may be relative; output is absolute.`;

// --- small helpers ------------------------------------------------------------

const isImage = (name) => IMAGE_EXTS.has(path.extname(name).toLowerCase());
const images = (dir) => filesIn(dir, isImage);

function subdirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort(naturalCompare)
      .map((name) => path.join(dir, name));
  } catch {
    return [];
  }
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** A URL-safe path from `fromDir` to `file`, with forward slashes. */
function rel(fromDir, file) {
  const r = path.relative(fromDir, file) || '.';
  return r.split(path.sep).map(encodeURIComponent).join('/');
}

/** Pixel size from the file header (PNG, JPEG, WebP); null when unknown. */
export function imageSize(file) {
  let buf;
  try {
    const fd = fs.openSync(file, 'r');
    buf = Buffer.alloc(256 * 1024);
    buf = buf.subarray(0, fs.readSync(fd, buf, 0, buf.length, 0));
    fs.closeSync(fd);
  } catch {
    return null;
  }
  const ok = (w, h) => (w > 0 && h > 0 ? { w, h } : null);
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) return ok(buf.readUInt32BE(16), buf.readUInt32BE(20));
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    // Walk JPEG segments to the first start-of-frame marker.
    for (let i = 2; i + 9 < buf.length;) {
      if (buf[i] !== 0xff) return null;
      const m = buf[i + 1];
      if (m === 0xff) { i++; continue; }
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return ok(buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5));
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return ok(1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3));
    if (chunk === 'VP8 ') return ok(buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff);
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return ok((b & 0x3fff) + 1, ((b >>> 14) & 0x3fff) + 1);
    }
  }
  return null;
}

/** Inline markdown: escape, then **bold** and `code`. Enough for brief and report lines. */
function inline(md) {
  return esc(md)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

const humanize = (slug) => {
  const s = String(slug).replace(/[-_]+/g, ' ').trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
};

const VIEWPORT_ORDER = ['desktop', 'laptop', 'tablet', 'mobile'];

/** Pick the top shots from a shoot.mjs output folder: the widest viewport, then mobile. */
function topShots(dir) {
  const all = images(dir);
  const top = (vp) => all.find((f) => new RegExp(`(^|[-_])${vp}-top\\.`, 'i').test(path.basename(f)));
  const wide = VIEWPORT_ORDER.slice(0, 3).map(top).find(Boolean);
  const picks = [wide, top('mobile')].filter(Boolean);
  if (picks.length) return picks;
  const tops = all.filter((f) => /-top\./i.test(path.basename(f)) && !/(dark|gray)-top\./i.test(path.basename(f)));
  return (tops.length ? tops : all).slice(0, 2);
}

/** Caption a shot from its file name: "desktop-top.png" → "desktop". */
function shotLabel(file) {
  const base = path.basename(file, path.extname(file));
  const vp = VIEWPORT_ORDER.find((v) => base.includes(v));
  if (vp && /-top$/.test(base) && !/(dark|gray)-top$/.test(base)) return vp;
  return base.replace(/[-_]+/g, ' ');
}

// --- reading the session ---------------------------------------------------------

function readState(session) {
  const out = {};
  for (const line of (readText(path.join(session, 'state.md')) ?? '').split(/\r?\n/)) {
    const m = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (m && !(m[1] in out)) out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

function readBrief(session) {
  const text = readText(path.join(session, 'brief.md'));
  if (text === null) return null;
  const lines = text.split(/\r?\n/);
  const heading = lines.find((l) => /^#\s+/.test(l));
  let title = heading ? heading.replace(/^#\s+/, '').replace(/^brief:\s*/i, '').trim() : '';
  if (/^<.*>$/.test(title)) title = '';
  const rows = [];
  const paras = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('<!--')) continue;
    if (rows.length + paras.length >= 8) break;
    const m = t.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
    if (m) rows.push({ label: m[1].replace(/:$/, ''), value: m[2] });
    else paras.push(t.replace(/^[-*]\s+/, ''));
  }
  return { title, rows, paras };
}

const viewportOf = (file) => {
  const base = path.basename(file, path.extname(file));
  return VIEWPORT_ORDER.find((v) => base === v || base.startsWith(`${v}-`)) ?? null;
};

/**
 * Group shots that differ only by viewport ("desktop-state-empty.png" and
 * "mobile-state-empty.png") so they render side by side, widest first.
 * Returns [{label, files}]; `label` is the shared name, prefixed by `prefix`.
 */
function groupShots(files, prefix = '') {
  const groups = new Map();
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const vp = viewportOf(file);
    const key = vp ? base.slice(vp.length).replace(/^-/, '') || 'top' : base;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(file);
  }
  const rank = (f) => VIEWPORT_ORDER.indexOf(viewportOf(f));
  return [...groups].map(([key, list]) => {
    const name = key === 'top' ? '' : key.replace(/[-_]+/g, ' ');
    return { label: [prefix, name].filter(Boolean).join(' · ') || key, files: list.sort((a, b) => rank(a) - rank(b)) };
  });
}

const notVariant = (f) => !/(dark|gray)-top\./i.test(path.basename(f));

function readReferences(session) {
  const dir = path.join(session, 'references');
  const groups = groupShots(images(dir));
  for (const sub of subdirs(dir)) {
    const all = images(sub).filter(notVariant);
    const tops = all.filter((f) => /-top\./i.test(path.basename(f)));
    groups.push(...groupShots(tops.length ? tops : all, path.basename(sub)));
  }
  return groups;
}

/** Develop lineup rank per direction id, matched by the source path of our entries. */
function directionRanks(session) {
  const r = readJson(path.join(session, 'develop', 'lineup', 'result.json'));
  const out = {};
  const entries = r && Array.isArray(r.oursEntries) ? r.oursEntries : [];
  const shotsDir = path.join(session, 'develop', 'shots') + path.sep;
  for (const e of entries) {
    if (!e || typeof e.source !== 'string' || !e.source.startsWith(shotsDir)) continue;
    const id = e.source.slice(shotsDir.length).split(path.sep)[0];
    if (!(id in out) || (e.medianRank ?? Infinity) < (out[id] ?? Infinity)) out[id] = e.medianRank ?? null;
  }
  return { ranks: out, size: r ? r.size ?? null : null };
}

function readDirections(session) {
  const shots = path.join(session, 'develop', 'shots');
  const { ranks, size } = directionRanks(session);
  const dirs = subdirs(shots).map((dir) => {
    const id = path.basename(dir);
    const tile = path.join(session, 'develop', 'tiles', id, 'index.html');
    return { id, shots: topShots(dir), tile: isFile(tile) ? tile : null, all: dir, rank: ranks[id] ?? null, size };
  }).filter((d) => d.shots.length);
  for (const file of images(shots)) dirs.push({ id: path.basename(file, path.extname(file)), shots: [file], tile: null, all: null, rank: null, size: null });
  return dirs;
}

function readSystem(session) {
  const found = [
    ...images(path.join(session, 'build')).filter((f) => /^system/i.test(path.basename(f))),
    ...images(path.join(session, 'build', 'shots', 'system')),
  ];
  for (const round of subdirs(path.join(session, 'rounds'))) {
    found.push(...images(path.join(round, 'shots')).filter((f) => /system/i.test(path.basename(f))));
  }
  const seen = new Set();
  return groupShots(found.filter((f) => !seen.has(f) && seen.add(f) && notVariant(f)));
}

function readOvernight(session) {
  const dir = path.join(session, 'overnight');
  const champion = readJson(path.join(dir, 'champion.json'));
  const history = (readText(path.join(dir, 'history.jsonl')) ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
  if (!champion && !history.length) return null;
  const cost = history.reduce((sum, h) => sum + (typeof h.costUsd === 'number' ? h.costUsd : 0), 0);
  return { champion, steps: history.length, cost: history.some((h) => typeof h.costUsd === 'number') ? cost : null, scores: scoreHistory(champion, history) };
}

/** The champion's score trail: from champion.json history when present, else from history.jsonl. */
export function scoreHistory(champion, history = []) {
  const fromChampion = champion && Array.isArray(champion.history)
    ? champion.history.map((h) => (typeof h === 'number' ? h : h && typeof h.score === 'number' ? h.score : null)).filter((n) => n !== null)
    : [];
  const trail = fromChampion.length ? fromChampion : history.map((h) => h.score).filter((n) => typeof n === 'number');
  if (champion && typeof champion.score === 'number' && trail[trail.length - 1] !== champion.score) trail.push(champion.score);
  return trail.filter((n, i) => i === 0 || n !== trail[i - 1]);
}

function readRounds(session, championRound) {
  const rounds = subdirs(path.join(session, 'rounds')).reverse().map((dir) => {
    const name = path.basename(dir);
    const ledger = readJson(path.join(dir, 'ledger.json'));
    const lineupResult = readJson(path.join(dir, 'lineup', 'result.json'));
    const studio = ledger && ledger.studio ? ledger.studio : null;
    const lineup = ledger && ledger.lineup ? ledger.lineup
      : lineupResult && lineupResult.ourMedianRank !== undefined ? { ourMedianRank: lineupResult.ourMedianRank, size: lineupResult.size ?? null, n: lineupResult.n ?? null } : null;
    const doc = (f) => (isFile(path.join(dir, f)) ? path.join(dir, f) : null);
    return {
      dir,
      name,
      label: `Round ${name}`,
      shots: topShots(path.join(dir, 'shots')),
      shotsDir: isDir(path.join(dir, 'shots')) ? path.join(dir, 'shots') : null,
      score: studio && typeof studio.score === 'number' ? studio.score : null,
      spread: studio ? studio.spread ?? null : null,
      n: studio ? studio.n ?? null : null,
      source: studio ? studio.source ?? null : null,
      delta: ledger && typeof ledger.delta === 'number' ? ledger.delta : null,
      severity: ledger && ledger.counts ? ledger.counts.severity : null,
      lineup,
      docs: [['ledger.md', doc('ledger.md')], ['rulings.md', doc('rulings.md')], ['maker-brief.md', doc('maker-brief.md')]].filter(([, f]) => f),
      champion: championRound ? path.normalize(path.join(session, championRound)) === dir : false,
    };
  });
  const scored = rounds.filter((r) => r.score !== null);
  const best = scored.reduce((b, r) => (!b || r.score > b.score ? r : b), null);
  if (best && scored.length > 1) best.best = true;
  return rounds;
}

function readFinal(session) {
  const dir = path.join(session, 'deliver');
  const shots = groupShots(images(dir));
  for (const sub of subdirs(dir)) shots.push(...groupShots(images(sub).filter(notVariant), path.basename(sub)));
  const report = path.join(session, 'report.md');
  const text = readText(report);
  const excerpt = text === null ? [] : text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).slice(0, 3);
  const docs = [['report.md', report], ['DESIGN.md', path.join(dir, 'DESIGN.md')], ['copy handback', path.join(dir, 'copy-handback.md')]]
    .filter(([, f]) => isFile(f));
  return { shots, excerpt, docs };
}

// --- rendering --------------------------------------------------------------

const BASE_CSS = `
:root {
  color-scheme: light dark;
  --bg: #f6f6f3;
  --text: #1c1c1a;
  --muted: #5f5f59;
  --rule: #dbdbd5;
  --outline: rgb(0 0 0 / .1);
  --mark: #a63f17;
  --s1: 8px; --s2: 16px; --s3: 24px; --s4: 32px; --s5: 40px; --s6: 48px; --s8: 64px; --s12: 96px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #161615;
    --text: #ebebe7;
    --muted: #a3a39b;
    --rule: #343430;
    --outline: rgb(255 255 255 / .1);
    --mark: #f0895c;
  }
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, p, dl, dd, figure, ul { margin: 0; padding: 0; }
h1 { font-size: 32px; line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; text-wrap: balance; }
h2 { font-size: 20px; line-height: 1.3; font-weight: 600; text-wrap: balance; }
h3 { font-size: 15px; line-height: 1.4; font-weight: 600; }
a { color: inherit; text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; text-decoration-color: var(--rule); }
a:hover { text-decoration-color: currentColor; }
a:focus-visible { outline: 2px solid var(--text); outline-offset: 3px; border-radius: 2px; }
code { font: 13px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.num { font-variant-numeric: tabular-nums; }
.muted { color: var(--muted); }
.small { font-size: 13px; line-height: 1.45; }
figure { min-width: 0; }
figure a { display: block; text-decoration: none; }
figure img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 2px;
  outline: 1px solid var(--outline);
  outline-offset: -1px;
}
figcaption { margin-top: var(--s1); font-size: 13px; line-height: 1.45; color: var(--muted); }
`;

const GALLERY_CSS = `
.page { max-width: 1280px; margin: 0 auto; padding: var(--s8) var(--s4) var(--s12); }
.masthead { display: grid; gap: var(--s2); }
.kicker { font-size: 13px; color: var(--muted); }
.meta { color: var(--muted); }
.figures { display: flex; flex-wrap: wrap; gap: var(--s3) var(--s6); margin-top: var(--s3); }
.figures dt { font-size: 13px; color: var(--muted); }
.figures dd { font-size: 32px; line-height: 1.2; font-weight: 500; }
.figures dd small { font-size: 15px; font-weight: 400; color: var(--muted); }
.toc { display: flex; flex-wrap: wrap; gap: var(--s1) var(--s3); margin-top: var(--s3); }
.toc a { padding: var(--s1) 0; }
section { margin-top: var(--s8); padding-top: var(--s3); border-top: 1px solid var(--rule); scroll-margin-top: var(--s3); }
.section-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--s1) var(--s3); margin-bottom: var(--s4); }
.links { display: flex; flex-wrap: wrap; gap: var(--s1) var(--s2); font-size: 13px; color: var(--muted); }
.brief { display: grid; grid-template-columns: minmax(160px, 240px) minmax(0, 72ch); gap: var(--s1) var(--s4); }
.brief dt { color: var(--muted); }
.prose { max-width: 72ch; display: grid; gap: var(--s1); }
.groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr)); gap: var(--s4) var(--s3); align-items: start; }
.groups.wide { grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); }
.prose + .groups { margin-top: var(--s4); }
.directions { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr)); gap: var(--s6) var(--s4); }
.direction { display: grid; gap: var(--s2); align-content: start; }
.direction-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--s1) var(--s2); }
/* Equal-height rows: each figure grows by its aspect ratio (--r = width / height). */
.pair { display: flex; gap: var(--s2); align-items: flex-start; }
.pair figure { flex: var(--r, 1) 1 0; }
.rounds { display: grid; }
.round { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: var(--s4); padding: var(--s4) 0; border-top: 1px solid var(--rule); }
.round:first-child { border-top: 0; padding-top: 0; }
.round-meta { display: grid; gap: var(--s2); align-content: start; }
.score { font-size: 32px; line-height: 1.1; font-weight: 500; }
.score small { font-size: 15px; font-weight: 400; color: var(--muted); }
.facts { display: grid; grid-template-columns: auto 1fr; gap: 0 var(--s2); font-size: 13px; }
.facts dt { color: var(--muted); }
.mark { color: var(--mark); font-weight: 600; font-size: 13px; }
.empty { color: var(--muted); }
.foot { margin-top: var(--s12); font-size: 13px; color: var(--muted); }
@media (max-width: 760px) {
  .page { padding: var(--s5) var(--s2) var(--s8); }
  .figures { gap: var(--s2) var(--s4); }
  .figures dd, .score { font-size: 20px; }
  .brief { grid-template-columns: 1fr; gap: 0; }
  .brief dd { margin-bottom: var(--s2); }
  .round { grid-template-columns: 1fr; gap: var(--s2); }
  section { margin-top: var(--s6); }
}
`;

/** Aspect ratio for flex rows; screenshots without a readable header get a guess from their name. */
function ratioOf(file) {
  const size = imageSize(file);
  if (size) return Math.round((size.w / size.h) * 1000) / 1000;
  return /mobile/i.test(path.basename(file)) ? 0.462 : 1.6;
}

function figure(file, caption, base, visible = caption) {
  const size = imageSize(file);
  const dims = size ? ` width="${size.w}" height="${size.h}"` : '';
  const href = rel(base, file);
  return `<figure><a href="${href}" target="_blank" rel="noopener"><img src="${href}" alt="${esc(caption)}"${dims} loading="lazy" decoding="async"></a>`
    + `<figcaption>${esc(visible)}</figcaption></figure>`;
}

/** Shots side by side at equal height. `caption` gives alt text; `visible` the shorter caption shown. */
function pair(files, caption, base, visible = caption) {
  // A lone portrait shot would fill the whole column; keep it phone-sized.
  const lone = files.length === 1 && ratioOf(files[0]) < 1 ? '; max-width: 280px' : '';
  return `<div class="pair">${files.map((f) => figure(f, caption(f), base, visible(f)).replace('<figure>', `<figure style="--r: ${ratioOf(f)}${lone}">`)).join('')}</div>`;
}

/** Caption a grouped shot: "ref-01 · mobile", or just the group label for a lone file. */
function groupCaption(group) {
  return (f) => {
    const vp = viewportOf(f);
    return group.files.length > 1 && vp ? `${group.label} · ${vp}` : group.label;
  };
}

/** Visible caption in a group: the full label under the first shot, the viewport under the rest. */
function groupVisible(group) {
  return (f) => (f === group.files[0] ? groupCaption(group)(f) : viewportOf(f) ?? groupCaption(group)(f));
}

function renderGroups(groups, base, wide = false) {
  return `<div class="groups${wide ? ' wide' : ''}">${groups.map((g) => pair(g.files, groupCaption(g), base, groupVisible(g))).join('')}</div>`;
}

const countFiles = (groups) => groups.reduce((n, g) => n + g.files.length, 0);

const docLinks = (docs, base) => (docs.length
  ? `<p class="links">${docs.map(([label, file]) => `<a href="${rel(base, file)}">${esc(label)}</a>`).join('')}</p>`
  : '');

function sectionHead(id, title, aside = '') {
  return `<div class="section-head"><h2 id="${id}-title">${esc(title)}</h2>${aside}</div>`;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const signed = (n) => (n > 0 ? `+${fmtScore(n)}` : n < 0 ? `−${fmtScore(-n)}` : '±0');

function renderBrief(brief, docs, base) {
  if (!brief && !docs.length) return '';
  const rows = brief ? brief.rows.map((r) => `<dt>${inline(r.label)}</dt><dd>${inline(r.value)}</dd>`).join('') : '';
  const paras = brief ? brief.paras.map((p) => `<p>${inline(p)}</p>`).join('') : '';
  return `<section id="brief" aria-labelledby="brief-title">${sectionHead('brief', 'Brief', docLinks(docs, base))}`
    + (rows ? `<dl class="brief">${rows}</dl>` : '')
    + (paras ? `<div class="prose">${paras}</div>` : '')
    + (!rows && !paras ? '<p class="empty">No brief.md yet.</p>' : '')
    + '</section>';
}

function renderReferences(refs, sources, base) {
  if (!refs.length) return '';
  const aside = `<p class="links"><span class="num">${plural(countFiles(refs), 'image')}</span>${sources ? `<a href="${rel(base, sources)}">sources.md</a>` : ''}</p>`;
  return `<section id="references" aria-labelledby="references-title">${sectionHead('references', 'References', aside)}`
    + `${renderGroups(refs, base)}</section>`;
}

function renderDirections(dirs, board, base) {
  if (!dirs.length) return '';
  const boardLinks = board.filter(([, f]) => isFile(f));
  const items = dirs.map((d) => {
    const meta = [
      d.rank !== null ? `<span class="num">lineup ${fmtScore(d.rank)}${d.size ? ` of ${d.size}` : ''}</span>` : '',
      d.tile ? `<a href="${rel(base, d.tile)}">tile</a>` : '',
      d.all ? `<a href="${rel(base, d.all)}/">all shots</a>` : '',
    ].filter(Boolean).join('');
    return `<article class="direction"><div class="direction-head"><h3>${esc(d.id)}</h3>${meta ? `<p class="links">${meta}</p>` : ''}</div>`
      + `${pair(d.shots, (f) => `${d.id} · ${shotLabel(f)}`, base, shotLabel)}</article>`;
  }).join('');
  return `<section id="directions" aria-labelledby="directions-title">${sectionHead('directions', 'Directions', docLinks(boardLinks, base))}`
    + `<div class="directions">${items}</div></section>`;
}

function renderSystem(groups, docs, base) {
  if (!groups.length) return '';
  return `<section id="system" aria-labelledby="system-title">${sectionHead('system', 'System sheet', docLinks(docs, base))}`
    + `${renderGroups(groups, base)}</section>`;
}

function renderRound(r, base) {
  const marks = [r.champion ? 'Champion' : '', r.best ? 'Best score' : ''].filter(Boolean).join(' · ');
  const facts = [];
  if (r.spread !== null) facts.push(['spread', fmtScore(r.spread)]);
  if (r.n !== null) facts.push([r.source === 'roles' ? 'role critics' : 'panel', String(r.n)]);
  if (r.delta !== null) facts.push(['delta', signed(r.delta)]);
  if (r.lineup && r.lineup.ourMedianRank !== null && r.lineup.ourMedianRank !== undefined) {
    facts.push(['lineup', `${fmtScore(r.lineup.ourMedianRank)}${r.lineup.size ? ` of ${r.lineup.size}` : ''}`]);
  }
  if (r.severity) {
    const s = r.severity;
    facts.push(['findings', `${s.blocker ?? 0} blocker · ${s.major ?? 0} major · ${s.minor ?? 0} minor`]);
  }
  const score = r.score === null
    ? '<p class="score muted">–</p>'
    : `<p class="score num">${fmtScore(r.score)}<small>/10${r.source === 'roles' ? ' roles' : ''}</small></p>`;
  const links = [...r.docs];
  if (r.shotsDir) links.push(['all shots', r.shotsDir]);
  const linkHtml = links.length ? `<p class="links">${links.map(([label, f]) => `<a href="${rel(base, f)}${label === 'all shots' ? '/' : ''}">${esc(label)}</a>`).join('')}</p>` : '';
  const shots = r.shots.length ? pair(r.shots, (f) => `${r.label} · ${shotLabel(f)}`, base, shotLabel) : '<p class="empty">No shots.</p>';
  return `<article class="round" id="round-${esc(r.name)}"><div class="round-meta">`
    + `<div><h3>${esc(r.label)}</h3>${marks ? `<p class="mark">${marks}</p>` : ''}</div>${score}`
    + (facts.length ? `<dl class="facts num">${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '')
    + `${linkHtml}</div>${shots}</article>`;
}

function renderRounds(rounds, base) {
  if (!rounds.length) return '';
  const trail = rounds.slice().reverse().filter((r) => r.score !== null).map((r) => fmtScore(r.score));
  const aside = trail.length > 1 ? `<p class="links num">${esc(trail.join(' → '))}</p>` : '';
  return `<section id="rounds" aria-labelledby="rounds-title">${sectionHead('rounds', 'Rounds', aside)}`
    + `<div class="rounds">${rounds.map((r) => renderRound(r, base)).join('')}</div></section>`;
}

function renderOvernight(o, base) {
  if (!o) return '';
  const c = o.champion ?? {};
  const facts = [
    ['champion', c.champion ?? '–'],
    ['score', c.score !== undefined && c.score !== null ? fmtScore(Number(c.score)) : '–'],
    ['steps', String(o.steps)],
    ...(o.cost !== null ? [['cost', `$${o.cost.toFixed(2)}`]] : []),
    ...(o.scores.length > 1 ? [['history', o.scores.map(fmtScore).join(' → ')]] : []),
  ];
  const championLink = c.champion ? `<p class="links"><a href="#round-${esc(path.basename(String(c.champion)))}">champion round</a></p>` : '';
  return `<section id="overnight" aria-labelledby="overnight-title">${sectionHead('overnight', 'Overnight', championLink)}`
    + `<dl class="facts num">${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`;
}

function renderFinal(final, base) {
  if (!final.shots.length && !final.excerpt.length && !final.docs.length) return '';
  return `<section id="final" aria-labelledby="final-title">${sectionHead('final', 'Final', docLinks(final.docs, base))}`
    + (final.excerpt.length ? `<div class="prose">${final.excerpt.map((l) => `<p>${inline(l)}</p>`).join('')}</div>` : '')
    + (final.shots.length ? renderGroups(final.shots, base, true) : '')
    + '</section>';
}

function page(title, description, css, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title)}</title>
<style>${BASE_CSS}${css}</style>
</head>
<body>
${body}
</body>
</html>
`;
}

/** Build <session>/gallery.html. Returns {file, counts}. */
export function buildGallery(sessionDir) {
  const session = path.resolve(sessionDir);
  if (!isDir(session)) throw userError(`session dir not found: ${session}`);
  const name = path.basename(session);
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const slug = dateMatch ? dateMatch[2] : name;

  const state = readState(session);
  const brief = readBrief(session);
  const title = (brief && brief.title) || humanize(state.slug || slug);
  const refs = readReferences(session);
  const directions = readDirections(session);
  const system = readSystem(session);
  const overnight = readOvernight(session);
  const rounds = readRounds(session, overnight && overnight.champion ? overnight.champion.champion : null);
  const final = readFinal(session);

  const docs = ['brief.md', 'define.md', 'direction.md', 'decisions.md', 'report.md']
    .map((f) => [f, path.join(session, f)])
    .filter(([, f]) => isFile(f));
  const latest = rounds.find((r) => r.score !== null);
  const meta = [state.mode, state.depth && `${state.depth} depth`, state.phase && `phase ${state.phase}`, state.profile && `${state.profile} profile`]
    .filter(Boolean).join(' · ');

  const figures = [];
  if (latest) {
    figures.push(['Studio score', `${fmtScore(latest.score)}<small>/10 · ${esc(latest.label.toLowerCase())}</small>`]);
    if (latest.spread !== null) figures.push(['Spread', fmtScore(latest.spread)]);
    if (latest.lineup && latest.lineup.ourMedianRank !== null && latest.lineup.ourMedianRank !== undefined) {
      figures.push(['Lineup rank', `${fmtScore(latest.lineup.ourMedianRank)}${latest.lineup.size ? `<small> of ${latest.lineup.size}</small>` : ''}`]);
    }
  }
  if (rounds.length) figures.push(['Rounds', String(rounds.length)]);
  if (overnight && overnight.champion && overnight.champion.champion) figures.push(['Champion', esc(path.basename(String(overnight.champion.champion)))]);

  const sections = [
    renderBrief(brief, docs, session),
    renderReferences(refs, isFile(path.join(session, 'references', 'sources.md')) ? path.join(session, 'references', 'sources.md') : null, session),
    renderDirections(directions, [['comparison board', path.join(session, 'develop', 'board.html')], ['board.png', path.join(session, 'develop', 'board.png')]], session),
    renderSystem(system, [['system.html', path.join(session, 'build', 'system.html')], ['system crit ledger', path.join(session, 'build', 'system-crit', 'ledger.md')]].filter(([, f]) => isFile(f)), session),
    renderRounds(rounds, session),
    renderOvernight(overnight, session),
    renderFinal(final, session),
  ];
  const ids = ['brief', 'references', 'directions', 'system', 'rounds', 'overnight', 'final'];
  const labels = { brief: 'Brief', references: 'References', directions: 'Directions', system: 'System', rounds: 'Rounds', overnight: 'Overnight', final: 'Final' };
  const present = ids.filter((id, i) => sections[i]);

  const body = `<div class="page">
<header class="masthead">
<p class="kicker">Design Studio · <span class="num">${esc(name)}</span></p>
<h1>${esc(title)}</h1>
${meta ? `<p class="meta">${esc(meta)}</p>` : ''}
${figures.length ? `<dl class="figures num">${figures.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
${present.length ? `<nav class="toc" aria-label="Sections">${present.map((id) => `<a href="#${id}">${labels[id]}</a>`).join('')}</nav>` : ''}
</header>
<main>
${sections.filter(Boolean).join('\n') || '<section><p class="empty">Nothing to show yet. Capture a direction or run a round, then rebuild the gallery.</p></section>'}
</main>
<footer class="foot"><p>Built by gallery.mjs on <span class="num">${new Date().toISOString().slice(0, 16).replace('T', ' ')}</span> UTC. Images open full size in a new tab.</p></footer>
</div>`;

  const file = path.join(session, 'gallery.html');
  fs.writeFileSync(file, page(`${title} · Design Studio`, `Design Studio gallery for ${name}`, GALLERY_CSS, body));
  const roundShots = rounds.reduce((n, r) => n + r.shots.length, 0);
  const dirShots = directions.reduce((n, d) => n + d.shots.length, 0);
  const counts = {
    references: countFiles(refs),
    directions: directions.length,
    system: countFiles(system),
    rounds: rounds.length,
    final: countFiles(final.shots),
    images: countFiles(refs) + dirShots + countFiles(system) + roundShots + countFiles(final.shots),
  };
  return { file, counts };
}

// --- comparison board ----------------------------------------------------------

const BOARD_CSS = `
.board { padding: var(--s6) var(--s6) var(--s8); }
.board h1 { font-size: 20px; margin-bottom: var(--s4); }
.columns { display: grid; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); gap: var(--s6) var(--s4); align-items: start; }
.column h2 { font-size: 15px; margin-bottom: var(--s2); }
.column h2 span { color: var(--muted); font-weight: 400; margin-right: var(--s1); }
@media (max-width: 760px) {
  .board { padding: var(--s4) var(--s2); }
  .columns { grid-template-columns: 1fr; }
}
`;

/** Columns per row: everything in one row up to 4, then balanced rows of at most 4. */
const columnsFor = (n) => (n <= 4 ? n : Math.ceil(n / Math.ceil(n / 4)));

/** Write a comparison board. Returns {file, cols}. */
export function buildBoard({ items, labels = [], out, title = 'Comparison' }) {
  const file = path.resolve(out);
  const base = path.dirname(file);
  const cols = columnsFor(items.length);
  const columns = items.map((item, i) => {
    const label = labels[i] || defaultLabel(item);
    const size = imageSize(item);
    const dims = size ? ` width="${size.w}" height="${size.h}"` : '';
    const href = rel(base, item);
    return `<article class="column"><h2><span class="num">${i + 1}</span>${esc(label)}</h2>`
      + `<figure><a href="${href}" target="_blank" rel="noopener"><img src="${href}" alt="${esc(label)}"${dims}></a></figure></article>`;
  }).join('');
  const body = `<main class="board"><h1>${esc(title)}</h1><div class="columns" style="--cols: ${cols}">${columns}</div></main>`;
  fs.mkdirSync(base, { recursive: true });
  fs.writeFileSync(file, page(title, `Comparison board: ${items.length} items`, BOARD_CSS, body));
  return { file, cols };
}

/** "develop/shots/paper/desktop-top.png" → "paper"; other files → their base name. */
function defaultLabel(file) {
  const base = path.basename(file, path.extname(file));
  return /^(desktop|laptop|tablet|mobile)-(top|tile-\d+)$/i.test(base) ? path.basename(path.dirname(file)) : base;
}

/**
 * Render the board HTML to PNG with the Playwright resolver from shoot.mjs.
 * Never throws: returns {png: null, warning} when no engine is available.
 */
export async function renderBoardPng(htmlFile, pngFile, cols) {
  const skip = (why) => ({ png: null, warning: `--png skipped (${why}); wrote the HTML board only` });
  let shoot;
  try {
    shoot = await import('./shoot.mjs');
  } catch (err) {
    return skip(`could not load shoot.mjs: ${String(err && err.message).split('\n')[0]}`);
  }
  let browser;
  try {
    const pw = typeof shoot.resolvePlaywright === 'function' ? await shoot.resolvePlaywright() : null;
    if (!pw || !pw.chromium) return skip('Playwright not found; install it with `npm i -D playwright && npx playwright install chromium`');
    // shoot.mjs: launchBrowser({playwright, warnings, ...launchOptions}) tries fallbacks and returns a Browser.
    const warnings = [];
    const launched = typeof shoot.launchBrowser === 'function'
      ? await shoot.launchBrowser({ playwright: pw, warnings })
      : await pw.chromium.launch({ headless: true, ...(process.env.STUDIO_CHROMIUM_PATH ? { executablePath: process.env.STUDIO_CHROMIUM_PATH } : {}) });
    browser = launched && typeof launched.newPage === 'function' ? launched : launched && launched.browser;
    if (!browser || typeof browser.newPage !== 'function') return skip('no browser could be launched');
    const page = await browser.newPage({ viewport: { width: cols >= 3 ? 1600 : 1200, height: 800 }, deviceScaleFactor: 1, colorScheme: 'light' });
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
    await page.locator('.board').screenshot({ path: pngFile });
    return { png: pngFile, warning: warnings.length ? warnings.join('; ') : null };
  } catch (err) {
    return skip(String(err && err.message ? err.message : err).split('\n')[0]);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// --- CLI ----------------------------------------------------------------------

async function cmdBuild(flags) {
  const { file, counts } = buildGallery(abs(str(flags, 'session', { required: true })));
  if (flags.json) printJson({ gallery: file, ...counts });
  else {
    console.log(file);
    console.log(`${plural(counts.rounds, 'round')}, ${plural(counts.directions, 'direction')}, ${plural(counts.references, 'reference')}, ${plural(counts.images, 'image')} shown`);
  }
  return 0;
}

async function cmdBoard(flags) {
  const items = list(flags, 'items').map((p) => {
    const file = abs(p);
    if (!isFile(file)) throw userError(`--items: no such file: ${file}`);
    if (!isImage(file)) throw userError(`--items: not a png/jpg/jpeg/webp image: ${file}`);
    return file;
  });
  if (!items.length) throw userError('--items needs at least one image');
  const labels = list(flags, 'labels', { split: true });
  if (labels.length > items.length) throw userError(`got ${labels.length} labels for ${items.length} items`);
  const outArg = str(flags, 'out', { required: true });
  if (!/\.html?$/i.test(outArg)) throw userError(`--out must be an .html file, got ${outArg}`);
  const { file, cols } = buildBoard({ items, labels, out: abs(outArg), title: str(flags, 'title') ?? 'Comparison' });

  let png = null;
  const warnings = [];
  if (flags.png) {
    const r = await renderBoardPng(file, file.replace(/\.html?$/i, '.png'), cols);
    png = r.png;
    if (r.warning) warnings.push(r.warning);
  }
  for (const w of warnings) process.stderr.write(`warning: ${w}\n`);
  if (flags.json) printJson({ board: file, png, items, warnings });
  else console.log([file, png].filter(Boolean).join('\n'));
  return 0;
}

const COMMANDS = { build: cmdBuild, board: cmdBoard };

export async function main(argv) {
  const { positionals, flags } = parseArgs(argv, { booleans: ['png'] });
  const command = COMMANDS[positionals[0]];
  if (flags.help || !command) {
    if (!flags.help && positionals[0]) process.stderr.write(`error: unknown command "${positionals[0]}"\n\n`);
    console.log(HELP);
    return flags.help ? 0 : 2;
  }
  return command(flags);
}

if (isMain(import.meta.url)) run(main);
