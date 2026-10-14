#!/usr/bin/env node
// Collects references into SESSION/references: single images, captured websites, every tile of a
// mood board or gallery (Cosmos, Are.na, a1.gallery, sections.wtf, recent.design, ...) and the images
// of a social post (Threads, X, Instagram), each with its source, caption and link.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import {
  IMAGE_EXTS, abs, isDir, isFile, naturalCompare, readJson, run, isMain, userError, writeJson,
} from './_shared.mjs';
import { launchBrowser, shoot } from './shoot.mjs';

const HELP = `Usage:
  node refs.mjs add --session <dir> [--as auto|site|board|post|image] [--max 24]
                    [--note "what the user loves"] <source>...
  node refs.mjs pick --session <dir> <tile>...
  node refs.mjs list --session <dir> [--json]

add   Collects each source into <session>/references and records it in index.json and sources.md.
      Sources: an image file or folder of images; an image URL; a website or local page
      (captured desktop and mobile, like shoot.mjs); a mood board or gallery (every tile saved
      as its own PNG plus a contact sheet, sheet.png); a social post (its images, plus the
      sites its text names, listed for the user to choose from, never captured on their own).
      --as forces the kind; auto detects it from the host and the page. --max caps tiles per
      board (default 24). GIF, AVIF, SVG and video tiles are rendered to PNG.
      A private or blocked board exits 2 and says so: ask the user to make it public or to
      export its images to a folder.
pick  Copies board or post tiles to references/ref-NN.png: the anchors the blind lineup ranks
      against (choose 3-5; boards alone never enter a lineup).
list  Prints what has been collected.

Exit codes: 0 ok · 2 bad input, nothing collected, or a private board.`;

const BOARD_HOSTS = [
  'cosmos.so', 'are.na', 'a1.gallery', 'sections.wtf', 'recent.design', 'before.click', 'godly.website',
  'curated.design', 'siteinspire.com', 'land-book.com', 'lapa.ninja', 'onepagelove.com', 'minimal.gallery',
  'savee.it', 'pinterest.com', 'dribbble.com', 'behance.net', 'awwwards.com', 'mobbin.com', 'refero.design',
  'saaspo.com', 'httpster.net', 'designspells.com', '60fps.design', 'pageflows.com',
];
const POST_HOSTS = ['threads.com', 'threads.net', 'x.com', 'twitter.com', 'instagram.com', 'bsky.app', 'linkedin.com'];
const RENDER_EXTS = new Set(['.gif', '.avif', '.svg', '.bmp', '.tif', '.tiff', '.heic']);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const onHost = (host, list) => list.some((h) => host === h || host.endsWith(`.${h}`));
const isUrl = (s) => /^https?:\/\//i.test(s);

export function slugify(text, max = 40) {
  const s = String(text).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, max).replace(/-+$/, '') || 'ref';
}

/** What a source is: image, folder, site, board or post. */
export function classify(source, as = 'auto') {
  if (as && as !== 'auto') return as;
  if (!isUrl(source)) {
    const p = abs(source);
    if (isDir(p)) return 'folder';
    const ext = path.extname(p).toLowerCase();
    if (IMAGE_EXTS.has(ext) || RENDER_EXTS.has(ext)) return 'image';
    return 'site';
  }
  const url = new URL(source);
  const host = hostOf(source);
  const ext = path.extname(url.pathname).toLowerCase();
  if (IMAGE_EXTS.has(ext) || RENDER_EXTS.has(ext)) return 'image';
  if (onHost(host, POST_HOSTS)) return 'post';
  if (onHost(host, BOARD_HOSTS)) return 'board';
  return 'site';
}

/** Domain names written in a post's text (recent.design, a1.gallery, ...), deduped, minus the post's own host. */
export function domainsIn(text, exclude = '') {
  const re = /\b((?:[a-z0-9-]+\.)+(?:design|click|gallery|wtf|com|io|app|dev|so|co|net|org|xyz|site|studio|art|ai|me|tools|website|page|fyi))\b(\/[\w\-./%?=&#]*)?/gi;
  const out = [];
  for (const m of String(text).matchAll(re)) {
    const domain = m[1].toLowerCase().replace(/^www\./, '');
    if (domain === exclude || onHost(domain, POST_HOSTS) || /cdninstagram|fbcdn|twimg/.test(domain)) continue;
    const url = `https://${domain}${m[2] ?? ''}`.replace(/[.,)]+$/, '');
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

// ---------- session bookkeeping ----------

function refsDir(session) {
  const dir = path.join(session, 'references');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function loadIndex(dir) {
  const data = readJson(path.join(dir, 'index.json'));
  return Array.isArray(data) ? data : [];
}

function nextRefId(dir, index) {
  const used = new Set(index.map((e) => e.id));
  for (const name of fs.readdirSync(dir)) used.add(name.replace(/\.[^.]+$/, ''));
  for (let n = 1; ; n++) {
    const id = `ref-${String(n).padStart(2, '0')}`;
    if (!used.has(id)) return id;
  }
}

function uniqueDir(parent, slug) {
  let dir = path.join(parent, slug);
  for (let n = 2; fs.existsSync(dir); n++) dir = path.join(parent, `${slug}-${n}`);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function appendSources(dir, entry) {
  const file = path.join(dir, 'sources.md');
  if (!fs.existsSync(file)) fs.writeFileSync(file, '# References\n\nOne line per source: what it is, where it came from, and what the user loves in it.\n\n');
  const rel = path.relative(dir, entry.path) || '.';
  const count = entry.items ? ` · ${entry.items.length} tile${entry.items.length === 1 ? '' : 's'}` : '';
  const links = entry.links?.length ? `\n  - sites named in the post (not captured; ask which to add): ${entry.links.join(', ')}` : '';
  fs.appendFileSync(file, `- **${entry.id}** (${entry.kind}${count}) \`${rel}\` · ${entry.source}${entry.title ? ` · ${entry.title}` : ''}\n  - loves: ${entry.note || 'TODO: ask the user'}${links}\n`);
}

// ---------- capture helpers ----------

async function newPage(browser, { width = 1440, height = 900, scale = 2 } = {}) {
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width, height }, deviceScaleFactor: scale });
  return ctx.newPage();
}

async function settle(page, url) {
  const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch(() => null);
  // Galleries poll and stream video, so they rarely go idle; wait briefly, then until the
  // number of visual elements stops changing (heavy pages hydrate seconds after load).
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  let last = -1;
  for (let i = 0; i < 12; i++) {
    const count = await page.evaluate(() => document.querySelectorAll('img, video, canvas, picture').length).catch(() => 0);
    if (count > 0 && count === last) break;
    last = count;
    await page.waitForTimeout(1000);
  }
  return response;
}

/** Render an image (local file or URL) in the browser and save it as PNG. */
async function renderImage(browser, src, out) {
  const page = await newPage(browser, { width: 1600, height: 1200, scale: 1 });
  try {
    const href = isUrl(src) ? src : pathToFileURL(abs(src)).href;
    await page.setContent(`<body style="margin:0;background:transparent"><img id="i" src="${href.replace(/"/g, '&quot;')}" style="display:block;max-width:3200px"></body>`);
    await page.waitForFunction(() => { const i = document.getElementById('i'); return i.complete; }, null, { timeout: 20000 });
    const ok = await page.evaluate(() => document.getElementById('i').naturalWidth > 0);
    if (!ok) throw userError(`could not decode image: ${src}`);
    await page.locator('#i').screenshot({ path: out, omitBackground: true });
  } finally {
    await page.context().close();
  }
}

/** True when the page says the board is private, gone, or behind a login. */
async function blocked(page, response) {
  const status = response?.status() ?? 200;
  if ([401, 403, 404, 410].includes(status)) return `HTTP ${status}`;
  const title = await page.title().catch(() => '');
  const text = await page.evaluate(() => document.body?.innerText?.slice(0, 2000) ?? '').catch(() => '');
  if (/isn.t available|not available|private|page not found|log in to see|sign in to see|this board is private/i.test(`${title}\n${text}`)
    && !(await page.locator('img').count().catch(() => 0))) return title || 'page not available';
  if (/isn.t available/i.test(title)) return title;
  return null;
}

/**
 * The visual tiles on a board page: large images, videos, canvases and background-image
 * blocks, in reading order, skipping chrome (nav, header, footer, avatars, logos).
 */
function collectTiles({ minW, minH, minArea }) {
  const chrome = 'header, nav, footer, [role=banner], [role=navigation], [role=contentinfo], aside';
  const seen = new Set();
  const out = [];
  const els = [...document.querySelectorAll('img, video, canvas, picture, [style*="background-image"]')];
  for (const el of els) {
    if (el.tagName === 'IMG' && el.closest('picture')) continue;
    if (el.closest(chrome)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < minW || r.height < minH || r.width * r.height < minArea) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
    const img = el.tagName === 'PICTURE' ? el.querySelector('img') : el.tagName === 'IMG' ? el : null;
    const alt = (img?.alt || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
    if (/\b(logo|avatar|profile (picture|photo)|icon)\b/i.test(alt) && r.width < 360) continue;
    const src = img ? (img.currentSrc || img.src) : el.tagName === 'VIDEO' ? (el.currentSrc || el.poster || '') : (style.backgroundImage.match(/url\("?(.*?)"?\)/)?.[1] ?? '');
    const key = src || `${Math.round(r.left)}:${Math.round(r.top + scrollY)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const id = `studio-tile-${out.length}`;
    el.setAttribute('data-studio-tile', id);
    out.push({
      id,
      kind: el.tagName.toLowerCase(),
      src,
      alt,
      link: el.closest('a')?.href ?? '',
      top: r.top + scrollY,
      left: r.left,
      w: Math.round(r.width),
      h: Math.round(r.height),
      naturalW: img?.naturalWidth ?? 0,
    });
  }
  return out.sort((a, b) => a.top - b.top || a.left - b.left);
}

/** Cosmos serves thumbnails at ?w=400; ask its CDN for a larger rendition. */
export function upgradeSrc(src) {
  try {
    const u = new URL(src);
    if (u.hostname === 'cdn.cosmos.so' && u.searchParams.has('w')) u.searchParams.set('w', '1600');
    return u.href;
  } catch {
    return src;
  }
}

/**
 * Download an image through the browser (same network path as the page, proxies included).
 * Returns the saved path, or null when the format is not one the lineup reads.
 */
async function download(fetcher, src, file) {
  const res = await fetcher.goto(src, { timeout: 20000 });
  if (!res || !res.ok()) return null;
  const type = (res.headers()['content-type'] || '').split(';')[0];
  const ext = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' }[type];
  if (!ext) {
    // AVIF, GIF, SVG: the browser decodes it, so render the full image to PNG.
    if (!type.startsWith('image/')) return null;
    await renderImage(fetcher.context().browser(), src, file);
    return file;
  }
  const body = await res.body();
  if (body.length < 4000) return null;
  const target = file.replace(/\.png$/, ext);
  fs.writeFileSync(target, body);
  return target;
}

async function saveTile(page, fetcher, tile, file) {
  // A larger original beats a screenshot of a thumbnail when the format is one we read.
  if (tile.kind === 'img' && /^https?:/.test(tile.src)) {
    try {
      const saved = await download(fetcher, upgradeSrc(tile.src), file);
      if (saved) return saved;
    } catch { /* fall through to a screenshot */ }
  }
  const loc = page.locator(`[data-studio-tile="${tile.id}"]`);
  await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
  // Let scroll-triggered fade-ins finish, or the tile is captured half transparent.
  await page.waitForTimeout(900);
  if (tile.kind === 'video') {
    // A video tile is blank until its first frame decodes.
    await loc.evaluate((v) => new Promise((done) => {
      if (v.readyState >= 2) return done();
      v.muted = true;
      v.play?.().catch(() => {});
      v.addEventListener('loadeddata', () => done(), { once: true });
      setTimeout(done, 6000);
    })).catch(() => {});
  }
  await loc.screenshot({ path: file, timeout: 15000 });
  return file;
}

async function scrollForTiles(page, max) {
  let last = -1;
  for (let i = 0; i < 14; i++) {
    const count = await page.evaluate(() => document.querySelectorAll('img, video, canvas, picture').length);
    if (count >= max * 2 && i > 1) break;
    if (count === last && i > 2) break;
    last = count;
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

/** Lay saved tiles out on one sheet, numbered, so a role can read a whole board in one image. */
async function contactSheet(browser, items, out) {
  if (!items.length) return null;
  // Written next to the tiles and opened from disk: a page set in memory may not load file:// images.
  const html = path.join(path.dirname(out), '.sheet.html');
  const cells = items.map((it, i) => `<figure><img src="${encodeURI(path.relative(path.dirname(out), it.file))}"><figcaption>${i + 1}. ${(it.alt || path.basename(it.file)).replace(/[<&]/g, '').slice(0, 60)}</figcaption></figure>`).join('');
  fs.writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:24px;background:#111;color:#bbb;font:12px/1.3 system-ui}main{columns:4 300px;column-gap:16px}figure{margin:0 0 16px;break-inside:avoid}img{width:100%;display:block;background:#222}figcaption{padding-top:6px}</style><main>${cells}</main>`);
  const page = await newPage(browser, { width: 1440, height: 900, scale: 1 });
  try {
    await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
    await page.screenshot({ path: out, fullPage: true });
    return out;
  } finally {
    await page.context().close();
    fs.rmSync(html, { force: true });
  }
}

/** A server or proxy error page: a 5xx, or a near-empty body that says so. */
async function errorPage(page, response) {
  if ((response?.status() ?? 200) >= 500) return true;
  const text = await page.evaluate(() => (document.body?.innerText ?? '').trim()).catch(() => '');
  const visuals = await page.evaluate(() => document.querySelectorAll('img, video, canvas').length).catch(() => 0);
  // "upstream request failed", "This page couldn't load", a blank hydration failure: nothing
  // visual and almost no text means the load failed, whatever the page says.
  return visuals === 0 && text.length < 300;
}

async function collectBoard(browser, url, dir, { max }) {
  const page = await newPage(browser);
  try {
    let response = await settle(page, url);
    const privateBoard = async () => {
      const why = await blocked(page, response);
      if (why) throw userError(`board not readable (${why}): ${url}. It may be private: ask the user to make it public, or to export its images to a folder and pass that folder.`);
    };
    // A private board is final; anything else that rendered nothing is retried.
    await privateBoard();
    for (let attempt = 1; await errorPage(page, response); attempt++) {
      if (attempt > 2) throw userError(`site failed to load three times (${response?.status() ?? 'no response'}): ${url}. Try again later, or ask the user for screenshots.`);
      await page.waitForTimeout(3000 * attempt);
      response = await settle(page, url);
      await privateBoard();
    }
    await scrollForTiles(page, max);
    // Tiles run as small as ~117x250 (phone screens on before.click) and ~200x120 (Cosmos);
    // avatars, icons and logos stay well under 20,000px².
    const tiles = (await page.evaluate(collectTiles, { minW: 96, minH: 90, minArea: 20000 })).slice(0, max);
    const title = await page.title();
    const items = [];
    const fetcher = await page.context().newPage();
    for (const [i, tile] of tiles.entries()) {
      const file = path.join(dir, `${String(i + 1).padStart(2, '0')}.png`);
      try {
        const saved = await saveTile(page, fetcher, tile, file);
        items.push({ file: saved, alt: tile.alt, link: tile.link, src: tile.src, kind: tile.kind });
      } catch { /* a tile that will not render is skipped */ }
    }
    if (!items.length) {
      // Nothing tile-like (a canvas app, a single hero): keep the page itself as one reference,
      // unless it rendered nothing at all.
      const empty = await page.evaluate(() => (document.body?.innerText ?? '').trim().length < 40 && !document.querySelector('img, video, canvas, svg'));
      if (empty) throw userError(`page rendered nothing to capture: ${url}. Ask the user for screenshots of it.`);
      const file = path.join(dir, 'page.png');
      await page.screenshot({ path: file });
      items.push({ file, alt: title, link: url, src: '', kind: 'page' });
    }
    return { title, items };
  } finally {
    await page.context().close();
  }
}

async function collectPost(browser, url, dir, { max }) {
  const page = await newPage(browser, { width: 1280, height: 1600, scale: 2 });
  try {
    const response = await settle(page, url);
    await page.waitForTimeout(1500);
    const meta = await page.evaluate(() => {
      const get = (p) => document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.content ?? '';
      return { title: get('og:title') || document.title, text: get('og:description') || get('description'), image: get('og:image'), url: get('og:url') || location.href };
    });
    if (!meta.text && !meta.image) {
      const why = await blocked(page, response);
      throw userError(`post not readable (${why || 'no content'}): ${url}. Ask the user for screenshots of it.`);
    }
    const items = [];
    // Only the post's own media: the share image, plus images inside the first post container.
    // Feeds append related posts below (Threads' "Related threads"); their images are not references.
    const imgs = await page.evaluate(() => {
      const post = document.querySelector('article, [role=article], main [data-pressable-container]');
      if (!post) return [];
      return [...post.querySelectorAll('img')]
        .filter((i) => i.naturalWidth >= 400 && !/profile|avatar/i.test(i.alt))
        .map((i) => i.currentSrc || i.src);
    });
    const sources = [...new Set([meta.image, ...imgs].filter(Boolean))].slice(0, Math.min(max, 6));
    for (const [i, src] of sources.entries()) {
      const file = path.join(dir, `${String(i + 1).padStart(2, '0')}.png`);
      try {
        await renderImage(browser, src, file);
        items.push({ file, alt: i === 0 ? meta.title : '', link: meta.url, src, kind: 'img' });
      } catch { /* skip images that will not load */ }
    }
    return { title: meta.text.split('\n')[0].slice(0, 120) || meta.title, items, links: domainsIn(meta.text, hostOf(url)), text: meta.text };
  } finally {
    await page.context().close();
  }
}

// ---------- commands ----------

export async function add(session, sources, { as = 'auto', max = 24, note = '', browserOpts = {} } = {}) {
  if (!isDir(session)) throw userError(`session not found: ${session}`);
  if (!sources.length) throw userError('add needs at least one source (an image, a folder, a URL or a page)');
  const dir = refsDir(session);
  const index = loadIndex(dir);
  const added = [];
  let browser = null;
  const getBrowser = async () => (browser ??= await launchBrowser({ ...browserOpts, warnings: [] }));
  try {
    for (const source of sources) {
      const kind = classify(source, as);
      const base = { source, kind, note, addedAt: new Date().toISOString() };
      let entry;
      if (kind === 'folder') {
        const files = fs.readdirSync(abs(source)).filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()) || RENDER_EXTS.has(path.extname(f).toLowerCase())).sort(naturalCompare);
        if (!files.length) throw userError(`no images in ${abs(source)}`);
        const out = uniqueDir(path.join(dir, 'boards'), slugify(path.basename(abs(source))));
        const items = [];
        for (const [i, f] of files.slice(0, max).entries()) {
          const from = path.join(abs(source), f);
          const ext = path.extname(f).toLowerCase();
          let file = path.join(out, `${String(i + 1).padStart(2, '0')}${IMAGE_EXTS.has(ext) ? ext : '.png'}`);
          if (IMAGE_EXTS.has(ext)) fs.copyFileSync(from, file);
          else await renderImage(await getBrowser(), from, file);
          items.push({ file, alt: f, link: '', src: from, kind: 'img' });
        }
        await contactSheet(await getBrowser(), items, path.join(out, 'sheet.png'));
        entry = { ...base, id: nextRefId(dir, index), path: out, title: path.basename(abs(source)), items };
      } else if (kind === 'image') {
        const id = nextRefId(dir, index);
        const ext = path.extname(isUrl(source) ? new URL(source).pathname : source).toLowerCase();
        let file = path.join(dir, `${id}${IMAGE_EXTS.has(ext) ? ext : '.png'}`);
        if (!isUrl(source) && IMAGE_EXTS.has(ext)) {
          if (!isFile(abs(source))) throw userError(`no such image: ${abs(source)}`);
          fs.copyFileSync(abs(source), file);
        } else {
          file = path.join(dir, `${id}.png`);
          await renderImage(await getBrowser(), source, file);
        }
        entry = { ...base, id, path: file, title: path.basename(source) };
      } else if (kind === 'site') {
        const id = nextRefId(dir, index);
        const out = path.join(dir, id);
        const res = await shoot(source, { out, viewports: 'desktop,mobile', tiles: 1, waitMs: 800, ...browserOpts });
        entry = { ...base, id, path: out, title: source, shots: res.shots };
      } else if (kind === 'board' || kind === 'post') {
        const out = uniqueDir(path.join(dir, kind === 'board' ? 'boards' : 'posts'), slugify(source.replace(/[?#].*$/, '')));
        const url = isUrl(source) ? source : pathToFileURL(abs(source)).href;
        let got;
        try {
          got = kind === 'board'
            ? await collectBoard(await getBrowser(), url, out, { max })
            : await collectPost(await getBrowser(), url, out, { max });
        } catch (err) {
          fs.rmSync(out, { recursive: true, force: true });
          throw err;
        }
        await contactSheet(await getBrowser(), got.items, path.join(out, 'sheet.png'));
        entry = { ...base, id: nextRefId(dir, index), path: out, title: got.title, items: got.items, ...(got.links ? { links: got.links } : {}) };
      } else {
        throw userError(`unknown --as "${kind}" (auto, site, board, post, image)`);
      }
      index.push(entry);
      added.push(entry);
      writeJson(path.join(dir, 'index.json'), index);
      appendSources(dir, entry);
    }
  } finally {
    if (browser) await browser.close();
  }
  return added;
}

/** Copy chosen tiles to top-level ref-NN files: the anchors the blind lineup ranks against. */
export function pick(session, tiles) {
  const dir = refsDir(session);
  if (!tiles.length) throw userError('pick needs at least one tile path');
  const index = loadIndex(dir);
  const picked = [];
  for (const t of tiles) {
    const from = path.isAbsolute(t) ? t : fs.existsSync(abs(t)) ? abs(t) : path.join(dir, t);
    if (!isFile(from) || !IMAGE_EXTS.has(path.extname(from).toLowerCase())) throw userError(`not a reference image: ${t}`);
    const id = nextRefId(dir, index);
    const file = path.join(dir, `${id}${path.extname(from).toLowerCase()}`);
    fs.copyFileSync(from, file);
    const parent = index.find((e) => e.items?.some((it) => it.file === from));
    const item = parent?.items.find((it) => it.file === from);
    const entry = { id, kind: 'anchor', source: parent?.source ?? from, path: file, from, title: item?.alt || parent?.title || '', note: parent?.note ?? '', addedAt: new Date().toISOString() };
    index.push(entry);
    picked.push(entry);
  }
  writeJson(path.join(dir, 'index.json'), index);
  return picked;
}

function describe(entry, dir) {
  const rel = path.relative(dir, entry.path);
  const extra = entry.items ? ` · ${entry.items.length} tiles, sheet ${path.join(rel, 'sheet.png')}` : entry.shots ? ` · ${entry.shots.length} shots` : '';
  const links = entry.links?.length ? `\n    named in the post (not captured): ${entry.links.join(', ')}` : '';
  return `${entry.id}  ${entry.kind.padEnd(6)} ${rel}${extra}  ← ${entry.source}${links}`;
}

export async function main(argv = process.argv.slice(2)) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        session: { type: 'string' },
        as: { type: 'string', default: 'auto' },
        max: { type: 'string', default: '24' },
        note: { type: 'string', default: '' },
        json: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    });
  } catch (err) {
    throw userError(err.message);
  }
  const { values: flags, positionals } = parsed;
  const [cmd, ...sources] = positionals;
  if (flags.help || !cmd) {
    console.log(HELP);
    return flags.help ? 0 : 2;
  }
  if (!flags.session) throw userError('--session <dir> is required');
  const session = abs(flags.session);
  const max = Number(flags.max);
  if (!Number.isInteger(max) || max < 1) throw userError('--max must be a positive integer');
  const dir = path.join(session, 'references');
  if (cmd === 'add') {
    const added = await add(session, sources, { as: flags.as, max, note: flags.note });
    if (flags.json) console.log(JSON.stringify(added, null, 2));
    else for (const e of added) console.log(describe(e, dir));
    return 0;
  }
  if (cmd === 'pick') {
    const picked = pick(session, sources);
    for (const e of picked) console.log(`${e.id}  anchor ${path.relative(dir, e.path)}  ← ${path.relative(dir, e.from)}`);
    return 0;
  }
  if (cmd === 'list') {
    const index = isDir(dir) ? loadIndex(dir) : [];
    if (flags.json) console.log(JSON.stringify(index, null, 2));
    else console.log(index.length ? index.map((e) => describe(e, dir)).join('\n') : 'no references collected yet');
    return 0;
  }
  throw userError(`unknown command "${cmd}" (add, pick, list)`);
}

if (isMain(import.meta.url)) run(main);
