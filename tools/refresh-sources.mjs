#!/usr/bin/env node
// Maintainer tool: refresh the snapshots of desengs.com (inspiration galleries and resource feed)
// and designengineer.tools that live in sources/. Run it when you update this repo, never at
// skill runtime. Node >= 18, zero dependencies.
//
//   node tools/refresh-sources.mjs --dry-run   # fetch and diff, write nothing
//   node tools/refresh-sources.mjs            # update sources/*.json and write sources/NEW-ITEMS.md
//   node tools/refresh-sources.mjs --json     # print the summary as JSON (combine with --dry-run)
//
// Other flags: --force (write even if the item count dropped sharply), --concurrency N, --help.
//
// Fetching uses the global fetch and falls back to spawning curl when fetch fails, which is what
// happens behind HTTP proxies that Node's fetch ignores. Parsing keys on URL patterns
// (/inspiration/<date>-<slug>, /minimum/<date>-<slug>), JSON-LD and plain tags, never on class names.
// Curated fields in the snapshots (category, notes, purpose, indexed, inToolbox) are preserved.

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = path.join(root, 'sources');
const FILES = {
  desengs: path.join(sourcesDir, 'desengs-inspiration.json'),
  tools: path.join(sourcesDir, 'designengineer-tools.json'),
  newItems: path.join(sourcesDir, 'NEW-ITEMS.md'),
};
const DESENGS = 'https://desengs.com';
const TOOLS_URL = 'https://designengineer.tools/';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 design-studio-refresh';
const TIMEOUT_MS = 30_000;
const GALLERIES = [
  { collection: 'inspiration', index: '/inspiration/' },
  { collection: 'portfolios', index: '/inspiration/portfolios/' },
  { collection: 'og', index: '/inspiration/og/' },
  { collection: 'minimum', index: '/minimum/' },
];
const ENTRY_RE = /(?:https?:\/\/(?:www\.)?desengs\.com)?\/((?:inspiration\/(?:(?:portfolios|og)\/)?|minimum\/)\d{4}-\d{2}-\d{2}-[a-z0-9-]+)\/?(?=["'#?<\s])/g;

// ---------- arguments ----------

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
if (flag('--help') || flag('-h')) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 16).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const DRY = flag('--dry-run');
const JSON_OUT = flag('--json');
const FORCE = flag('--force');
const ci = argv.indexOf('--concurrency');
const CONCURRENCY = ci >= 0 ? Math.max(1, Number(argv[ci + 1]) || 6) : 6;
const log = (...a) => { if (!JSON_OUT) console.log(...a); };
const warn = (...a) => console.error(...a);

// ---------- network ----------

let useCurl = false;
let curlNoticeShown = false;

function curl(url) {
  return new Promise((resolve, reject) => {
    execFile('curl', ['-sSL', '--fail', '--compressed', '-m', String(TIMEOUT_MS / 1000), '-A', UA, url],
      { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout, stderr) => (err ? reject(new Error(`curl ${url}: ${(stderr || err.message).trim()}`)) : resolve(stdout)));
  });
}

async function get(url, attempt = 1) {
  if (!useCurl) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return await res.text();
      if (res.status === 404 || res.status === 410) throw Object.assign(new Error(`HTTP ${res.status} ${url}`), { final: true });
      // Other HTTP errors (403 from bot walls, 5xx): let curl try once.
    } catch (err) {
      if (err.final) throw err;
      useCurl = true; // network-level failure, e.g. a proxy that fetch does not honour
      if (!curlNoticeShown) { curlNoticeShown = true; log(`fetch failed (${err.cause?.code || err.message}); using curl from here on`); }
    }
  }
  try {
    return await curl(url);
  } catch (err) {
    if (attempt < 2) return get(url, attempt + 1);
    throw err;
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---------- tiny HTML helpers ----------

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…', bull: '•', copy: '©', reg: '®', trade: '™', middot: '·', eacute: 'é', egrave: 'è', agrave: 'à', ocirc: 'ô', uuml: 'ü', ouml: 'ö', auml: 'ä', oslash: 'ø', Oslash: 'Ø' };
const decode = (s) => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => NAMED[n] ?? m);
const stripTags = (s) => decode(String(s).replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const withoutScripts = (html) => html.replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
const metaContent = (html, key) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '') : '';
};
const absolute = (u, base = DESENGS) => { try { return new URL(u, base).href; } catch { return ''; } };

function jsonLd(html) {
  const out = [];
  for (const [, body] of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(body);
      for (const node of [data, ...(Array.isArray(data) ? data : []), ...(data['@graph'] ?? [])]) {
        if (node && typeof node === 'object' && !Array.isArray(node)) out.push(node);
      }
    } catch { /* ignore malformed blocks */ }
  }
  return out;
}

// Stable id for an external URL: host without www, path without trailing slash, plus query.
function urlId(u) {
  try {
    const url = new URL(u);
    const p = url.pathname.replace(/\/+$/, '');
    return `${url.hostname.replace(/^www\./, '').toLowerCase()}${p}${url.search}`;
  } catch { return String(u); }
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function shortDate(s) { // "Oct 04, 26" -> "2026-10-04"
  const m = String(s).match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{2,4})/);
  if (!m || !MONTHS[m[1].toLowerCase()]) return '';
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${y}-${String(MONTHS[m[1].toLowerCase()]).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

// ---------- desengs: galleries ----------

const collectionOf = (id) => (id.startsWith('minimum/') ? 'minimum' : id.startsWith('inspiration/portfolios/') ? 'portfolios' : id.startsWith('inspiration/og/') ? 'og' : 'inspiration');
const idsIn = (text) => new Set([...text.matchAll(ENTRY_RE)].map((m) => m[1]));

async function discoverEntryIds() {
  const ids = new Set();
  const counts = {};
  for (const g of GALLERIES) {
    const html = await get(DESENGS + g.index);
    const found = [...idsIn(html)].filter((id) => collectionOf(id) === g.collection);
    if (!found.length) throw new Error(`No entries found on ${DESENGS}${g.index}; the page structure may have changed.`);
    counts[g.collection] = found.length;
    found.forEach((id) => ids.add(id));
  }
  // The sitemap is a second, independent source. A failure here is not fatal.
  let sitemapCount = 0;
  try {
    const index = await get(`${DESENGS}/sitemap-index.xml`);
    const maps = [...index.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => /\.xml$/.test(u));
    for (const map of maps.length ? maps : [`${DESENGS}/sitemap-0.xml`]) {
      const xml = await get(map);
      for (const id of idsIn(xml)) { ids.add(id); sitemapCount++; }
    }
  } catch (err) {
    warn(`warn: sitemap not read (${err.message}); using the gallery index pages only`);
  }
  return { ids: [...ids].sort(), counts, sitemapCount };
}

async function fetchEntry(id) {
  const page = `${DESENGS}/${id}/`;
  const html = await get(page);
  const cw = jsonLd(html).find((n) => n['@type'] === 'CreativeWork' || n.about) ?? {};
  const body = withoutScripts(html);
  const h1 = stripTags(body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
  const external = [...body.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]).find((u) => !/desengs\.com/i.test(u)) ?? '';
  let image = typeof cw.image === 'string' ? cw.image : cw.image?.url ?? '';
  if (!image) image = metaContent(html, 'og:image');
  if (!image || /\/og\.png$/.test(image)) {
    const img = body.match(/<img\b[^>]*src=["'](\/images\/[^"']+)["']/i)?.[1];
    if (img) image = absolute(img);
  }
  const keywords = Array.isArray(cw.keywords) ? cw.keywords : String(cw.keywords ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    id,
    collection: collectionOf(id),
    title: decode(cw.about?.name ?? '') || h1 || id.split('/').pop(),
    url: cw.about?.url || external,
    page,
    date: String(cw.datePublished ?? '').slice(0, 10) || id.split('/').pop().slice(0, 10),
    tags: keywords.map(decode),
    image: absolute(image),
  };
}

// ---------- desengs: resource feed on the home page ----------

async function fetchResources() {
  const html = await get(`${DESENGS}/`);
  const body = withoutScripts(html);
  // Filter buttons pair a colour swatch with a label; items reuse the swatch colour.
  const kinds = {};
  for (const m of body.matchAll(/background:\s*(#[0-9a-f]{3,8})[^>]*>(?:\s|<\/div>|<!--[\s\S]*?-->)*<span>([^<]{2,20})<\/span>/gi)) {
    kinds[m[1].toLowerCase()] = m[2].trim();
  }
  const items = [];
  for (const [, li] of body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const a = li.match(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!a || /desengs\.com/i.test(a[1])) continue;
    const [name, ...rest] = stripTags(a[2]).split('•');
    const color = li.match(/background:\s*(#[0-9a-f]{3,8})/i)?.[1]?.toLowerCase();
    items.push({
      id: urlId(a[1]),
      title: name.trim(),
      url: a[1],
      kind: kinds[color] ?? '',
      date: shortDate(stripTags(li).match(/[A-Z][a-z]{2} \d{1,2}, \d{2,4}/)?.[0] ?? ''),
      description: rest.join('•').trim(),
    });
  }
  if (!items.length) { // fallback: the JSON-LD item list
    const list = jsonLd(html).find((n) => n.mainEntity?.itemListElement)?.mainEntity.itemListElement ?? [];
    for (const el of list) items.push({ id: urlId(el.url), title: decode(el.name), url: el.url, kind: '', date: '', description: '' });
  }
  if (!items.length) throw new Error('No resources found on desengs.com; the page structure may have changed.');
  const seen = new Set();
  return items.filter((it) => (seen.has(it.id) ? false : seen.add(it.id))).sort((a, b) => a.id.localeCompare(b.id));
}

// ---------- designengineer.tools ----------

async function fetchTools() {
  const html = withoutScripts(await get(TOOLS_URL));
  const main = html.split(/<footer\b/i)[0];
  const tokens = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>|<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const items = [];
  const categories = [];
  let category = '';
  for (const t of tokens) {
    if (t[1] !== undefined) { category = stripTags(t[1]); if (category) categories.push(category); continue; }
    if (!category) continue;
    const name = stripTags(t[3]);
    if (!name || /designengineer\.tools/i.test(t[2])) continue;
    items.push({ id: urlId(t[2]), name, url: t[2], category });
  }
  if (!items.length) throw new Error('No tools found on designengineer.tools; the page structure may have changed.');
  const curator = stripTags(html.match(/Curated by([\s\S]{0,400}?)<\/a>/i)?.[1] ?? '') || '';
  const seen = new Set();
  return {
    curator,
    categories,
    items: items.filter((it) => (seen.has(it.id) ? false : seen.add(it.id))).sort((a, b) => a.id.localeCompare(b.id)),
  };
}

// ---------- snapshots ----------

const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
const byId = (list = []) => new Map(list.map((x) => [x.id, x]));

function diff(oldList = [], newList = []) {
  const oldIds = byId(oldList);
  const newIds = byId(newList);
  return {
    added: newList.filter((x) => !oldIds.has(x.id)),
    removed: oldList.filter((x) => !newIds.has(x.id)),
  };
}

function guardShrink(label, oldList = [], newList = []) {
  if (oldList.length >= 20 && newList.length < oldList.length * 0.7 && !FORCE) {
    throw new Error(`${label}: ${newList.length} items now vs ${oldList.length} in the snapshot. That looks like a parsing failure; rerun with --force if it is real.`);
  }
}

const countBy = (list, key) => list.reduce((acc, x) => ((acc[x[key]] = (acc[x[key]] ?? 0) + 1), acc), {});

// ---------- NEW-ITEMS.md ----------

function newItemsMarkdown({ capturedAt, prev, entries, resources, tools }) {
  const L = [];
  L.push('# New items from desengs.com and designengineer.tools', '');
  L.push(`Generated by \`node tools/refresh-sources.mjs\` at ${capturedAt}. Previous snapshot: ${prev.desengs || 'none'} (desengs), ${prev.tools || 'none'} (tools).`, '');
  L.push('How to review (see AGENTS.md):', '');
  L.push('1. Open each new site and its screenshot. Judge it against the principles in `plugins/design-studio/skills/studio/knowledge/inspiration.md`.');
  L.push('2. Add the worthwhile ones to the reference index there, one line each: `name — url — what to learn from it (the mechanism, not the look)`. Fold any new taste lesson into the principles.');
  L.push('3. Add useful new tools to the toolbox in `knowledge/design-engineering.md`.');
  L.push('4. Fill `category` and `notes` (entries) or `purpose` (tools) for the new items in the snapshots, set `indexed` / `inToolbox` when you list them, and commit snapshots and knowledge together.', '');

  L.push(`## desengs galleries: ${entries.added.length} new, ${entries.removed.length} removed`, '');
  if (!entries.added.length) L.push('No new entries.', '');
  for (const col of ['inspiration', 'portfolios', 'og', 'minimum']) {
    const list = entries.added.filter((e) => e.collection === col);
    if (!list.length) continue;
    L.push(`### ${col} (${list.length})`, '');
    for (const e of list.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))) {
      L.push(`- **${e.title}** (${e.date}) — ${e.url || 'no site link found'}`);
      L.push(`  - Page: ${e.page}`);
      L.push(`  - Image: ${e.image || 'none found'}`);
      if (e.tags?.length) L.push(`  - Tags: ${e.tags.join(', ')}`);
    }
    L.push('');
  }
  if (entries.removed.length) {
    L.push('### Removed from desengs (consider dropping them from the reference index)', '');
    for (const e of entries.removed) L.push(`- ${e.title} — ${e.url} (${e.id})${e.indexed ? ' — listed in inspiration.md' : ''}`);
    L.push('');
  }

  L.push(`## desengs resources: ${resources.added.length} new, ${resources.removed.length} removed`, '');
  if (!resources.added.length) L.push('No new resources.', '');
  for (const r of resources.added) L.push(`- **${r.title}** [${r.kind || 'unknown kind'}] (${r.date || 'no date'}) — ${r.url}${r.description ? ` — ${r.description}` : ''}`);
  if (resources.added.length) L.push('');
  for (const r of resources.removed) L.push(`- Removed: ${r.title} — ${r.url}`);
  if (resources.removed.length) L.push('');

  L.push(`## designengineer.tools: ${tools.added.length} new, ${tools.removed.length} removed, ${tools.moved.length} moved`, '');
  if (!tools.added.length) L.push('No new tools.', '');
  for (const t of tools.added) L.push(`- **${t.name}** [${t.category}] — ${t.url}`);
  if (tools.added.length) L.push('');
  for (const t of tools.removed) L.push(`- Removed: ${t.name} [${t.category}] — ${t.url}${t.inToolbox ? ' — listed in design-engineering.md' : ''}`);
  for (const t of tools.moved) L.push(`- Moved: ${t.name} from ${t.from} to ${t.category}`);
  return `${L.join('\n').trimEnd()}\n`;
}

// ---------- main ----------

async function main() {
  const capturedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const oldDesengs = readJson(FILES.desengs);
  const oldTools = readJson(FILES.tools);
  if (!oldDesengs) log('No desengs snapshot yet: every entry counts as new and every entry page will be fetched.');

  log('Reading desengs.com galleries…');
  const { ids, counts, sitemapCount } = await discoverEntryIds();
  const oldEntries = byId(oldDesengs?.items);
  const missing = ids.filter((id) => !oldEntries.has(id));
  log(`  ${ids.length} entries found (${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}; sitemap ${sitemapCount}); fetching ${missing.length} new entry page(s)`);
  const fetched = byId(await mapLimit(missing, CONCURRENCY, async (id) => {
    try { return await fetchEntry(id); }
    catch (err) {
      warn(`warn: ${id}: ${err.message}`);
      return { id, collection: collectionOf(id), title: id.split('/').pop(), url: '', page: `${DESENGS}/${id}/`, date: id.split('/').pop().slice(0, 10), tags: [], image: '' };
    }
  }));
  const entries = ids.map((id) => {
    const old = oldEntries.get(id);
    if (old) return old; // entry pages are immutable in practice; keep the curated record
    const e = fetched.get(id);
    return { id: e.id, collection: e.collection, title: e.title, url: e.url, page: e.page, date: e.date, tags: e.tags, image: e.image, category: '', notes: '', indexed: false };
  });
  guardShrink('desengs galleries', oldDesengs?.items, entries);

  log('Reading the desengs.com resource feed…');
  const scrapedResources = await fetchResources();
  const oldResources = byId(oldDesengs?.resources);
  const resources = scrapedResources.map((r) => ({ ...r, notes: oldResources.get(r.id)?.notes ?? '' }));
  guardShrink('desengs resources', oldDesengs?.resources, resources);

  log('Reading designengineer.tools…');
  const scrapedTools = await fetchTools();
  const oldToolMap = byId(oldTools?.items);
  const tools = scrapedTools.items.map((t) => {
    const old = oldToolMap.get(t.id);
    return { id: t.id, name: t.name, url: t.url, category: t.category, purpose: old?.purpose ?? '', inToolbox: old?.inToolbox ?? false };
  });
  guardShrink('designengineer.tools', oldTools?.items, tools);

  const entryDiff = diff(oldDesengs?.items, entries);
  const resourceDiff = diff(oldDesengs?.resources, resources);
  const toolDiff = diff(oldTools?.items, tools);
  toolDiff.moved = tools.filter((t) => oldToolMap.has(t.id) && oldToolMap.get(t.id).category !== t.category)
    .map((t) => ({ ...t, from: oldToolMap.get(t.id).category }));

  const desengsSnapshot = {
    source: `${DESENGS}/inspiration/`,
    site: `${DESENGS}/`,
    curator: oldDesengs?.curator ?? 'Maze Heart',
    capturedAt,
    note: 'Snapshot for maintainers; the studio never fetches these at runtime. Curated fields: category, notes, indexed (entries) and notes (resources). Refresh with node tools/refresh-sources.mjs.',
    categories: oldDesengs?.categories ?? {},
    counts: { ...countBy(entries, 'collection'), total: entries.length, resources: resources.length },
    items: entries.sort((a, b) => a.id.localeCompare(b.id)),
    resources,
  };
  const toolsSnapshot = {
    source: TOOLS_URL,
    curator: scrapedTools.curator || oldTools?.curator || '',
    capturedAt,
    note: 'Snapshot for maintainers; the studio never fetches this at runtime. Curated fields: purpose, inToolbox. Refresh with node tools/refresh-sources.mjs.',
    categories: scrapedTools.categories,
    counts: { total: tools.length, ...countBy(tools, 'category') },
    items: tools,
  };

  const summary = {
    capturedAt,
    dryRun: DRY,
    transport: useCurl ? 'curl' : 'fetch',
    desengs: {
      counts: desengsSnapshot.counts,
      new: entryDiff.added.map((e) => ({ id: e.id, collection: e.collection, title: e.title, url: e.url, date: e.date, image: e.image })),
      removed: entryDiff.removed.map((e) => e.id),
    },
    resources: { count: resources.length, new: resourceDiff.added.map((r) => ({ id: r.id, title: r.title, kind: r.kind, url: r.url })), removed: resourceDiff.removed.map((r) => r.id) },
    tools: { count: tools.length, new: toolDiff.added.map((t) => ({ id: t.id, name: t.name, category: t.category, url: t.url })), removed: toolDiff.removed.map((t) => t.id), moved: toolDiff.moved.map((t) => ({ id: t.id, from: t.from, to: t.category })) },
    wrote: [],
  };

  if (!DRY) {
    fs.mkdirSync(sourcesDir, { recursive: true });
    fs.writeFileSync(FILES.desengs, `${JSON.stringify(desengsSnapshot, null, 2)}\n`);
    fs.writeFileSync(FILES.tools, `${JSON.stringify(toolsSnapshot, null, 2)}\n`);
    fs.writeFileSync(FILES.newItems, newItemsMarkdown({
      capturedAt,
      prev: { desengs: oldDesengs?.capturedAt, tools: oldTools?.capturedAt },
      entries: entryDiff,
      resources: resourceDiff,
      tools: toolDiff,
    }));
    summary.wrote = Object.values(FILES).map((f) => path.relative(root, f));
  }

  if (JSON_OUT) { console.log(JSON.stringify(summary, null, 2)); return; }
  const c = desengsSnapshot.counts;
  log('');
  log(`desengs galleries   ${c.total} entries (inspiration ${c.inspiration ?? 0}, portfolios ${c.portfolios ?? 0}, og ${c.og ?? 0}, minimum ${c.minimum ?? 0})  new ${entryDiff.added.length}  removed ${entryDiff.removed.length}`);
  for (const e of entryDiff.added) log(`  + [${e.collection}] ${e.title} (${e.date}) ${e.url}`);
  for (const e of entryDiff.removed) log(`  - [${e.collection}] ${e.title} ${e.url}`);
  log(`desengs resources   ${resources.length} items  new ${resourceDiff.added.length}  removed ${resourceDiff.removed.length}`);
  for (const r of resourceDiff.added) log(`  + [${r.kind || '?'}] ${r.title} ${r.url}`);
  for (const r of resourceDiff.removed) log(`  - ${r.title} ${r.url}`);
  log(`designengineer.tools ${tools.length} tools in ${scrapedTools.categories.length} categories  new ${toolDiff.added.length}  removed ${toolDiff.removed.length}  moved ${toolDiff.moved.length}`);
  for (const t of toolDiff.added) log(`  + [${t.category}] ${t.name} ${t.url}`);
  for (const t of toolDiff.removed) log(`  - [${t.category}] ${t.name} ${t.url}`);
  for (const t of toolDiff.moved) log(`  ~ ${t.name}: ${t.from} -> ${t.category}`);
  log('');
  log(DRY ? 'Dry run: nothing written.' : `Wrote ${summary.wrote.join(', ')}.`);
  if (!DRY && (entryDiff.added.length || resourceDiff.added.length || toolDiff.added.length)) log('Next: review sources/NEW-ITEMS.md (see AGENTS.md, "Refreshing the inspiration sources").');
}

main().catch((err) => {
  console.error(`error: ${err.message}`);
  process.exit(1);
});
