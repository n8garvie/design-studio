#!/usr/bin/env node
// Screenshots and measurable facts for the studio's critics.
// Zero dependencies: Playwright is optional and resolved at runtime (see resolvePlaywright),
// with a headless Chrome CLI fallback that captures the top of each viewport only.
// Exports resolvePlaywright() and launchBrowser() for other scripts (gallery.mjs).

import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { skillDir as findSkillDir } from './_shared.mjs';

const HELP = `shoot.mjs — screenshots, measure.json and aria.yml for a page

Usage:
  node shoot.mjs <url|file> --out <dir> [flags]

Flags:
  --viewports desktop,mobile   presets: desktop 1440x900 · laptop 1280x800 · tablet 834x1112 ·
                               mobile 390x844 (touch); also <w>x<h>. Device scale factor 1.
  --tiles N                    after the top shot, up to N more one-viewport tiles (default 3).
                               Never one tall full-page image.
  --dark                       also capture the top in prefers-color-scheme: dark
  --grayscale                  also capture the top in grayscale (hierarchy check)
  --reduced-motion             emulate prefers-reduced-motion: reduce
  --no-freeze                  keep animations, transitions and the caret (default freezes them)
  --wait-for <selector>        wait until the selector is visible (15s cap)
  --wait-ms <n>                settle time after fonts are ready (default 600)
  --state name=<suffix>        repeatable; also capture <target><suffix> (?a=b merges the query,
                               #x sets the hash) as <vp>-state-<name>.png
  --measure                    write measure.json (type, measure, contrast, targets, a11y, craft…)
                               and aria.yml (Playwright aria snapshot)
  --critic-copy <dir>          copy every PNG into <dir>/<random>/ with neutral names (criticFiles)
  --prefix <name>              filename prefix

Output files: <vp>-top.png, <vp>-tile-<k>.png, <vp>-gray-top.png, <vp>-state-<name>.png,
<vp>-dark-top.png. Prints JSON {shots, criticFiles, measure, aria, warnings, consoleErrors, summary}.

Engine: Playwright from the project, the skill dir, the global npm root or STUDIO_PLAYWRIGHT_PATH
(set it to "none" to force the fallback); Chromium from STUDIO_CHROMIUM_PATH, Playwright's own
download, or an installed Chrome/Chromium/Edge. Without Playwright, a headless Chrome CLI captures
the top of each viewport only (no tiles, measure or variants).

Exit codes: 0 ok · 2 bad or missing input / page failed to load · 3 no browser engine.`;

const SKILL_DIR = findSkillDir(import.meta.url);

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 800 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

export const NO_BROWSER_MESSAGE =
  'No browser engine: install Playwright (`npm i -D playwright && npx playwright install chromium`) or set STUDIO_CHROMIUM_PATH, or provide screenshots manually.';

const FREEZE_ID = '__studio_freeze';
const FREEZE_CSS =
  '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;' +
  'transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;' +
  'scroll-behavior:auto!important}';
const LIST_CAP = 25;

class UserError extends Error {
  constructor(message, exitCode = 2) {
    super(message);
    this.exitCode = exitCode;
  }
}

const firstLine = (msg) => String(msg ?? '').split('\n').find((l) => l.trim())?.trim() ?? '';
const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

// ---------- Playwright resolution ----------

const PW_PACKAGES = ['playwright', 'playwright-core', '@playwright/test'];
let cachedPlaywright;

/**
 * Find Playwright without a static import. Order: the project (cwd), the skill dir, the global
 * npm root, then STUDIO_PLAYWRIGHT_PATH. Returns {chromium, source, version} or null.
 * STUDIO_PLAYWRIGHT_PATH=none disables Playwright entirely.
 */
export function resolvePlaywright({ refresh = false } = {}) {
  if (cachedPlaywright !== undefined && !refresh) return cachedPlaywright;
  cachedPlaywright = findPlaywright();
  return cachedPlaywright;
}

function findPlaywright() {
  const override = process.env.STUDIO_PLAYWRIGHT_PATH;
  if (override && /^(none|off|0|false)$/i.test(override.trim())) return null;
  for (const dir of [process.cwd(), SKILL_DIR]) {
    for (const name of PW_PACKAGES) {
      const found = tryRequire(path.join(dir, 'x.js'), name);
      if (found) return found;
    }
  }
  for (const root of globalRoots()) {
    for (const name of PW_PACKAGES) {
      const found = tryRequire(path.join(root, 'x.js'), path.join(root, name));
      if (found) return found;
    }
  }
  if (override) return tryRequire(path.join(process.cwd(), 'x.js'), path.resolve(process.cwd(), override));
  return null;
}

function tryRequire(base, request) {
  try {
    const req = createRequire(base);
    const source = req.resolve(request);
    const mod = req(request);
    const chromium = mod?.chromium ?? mod?.default?.chromium;
    if (!chromium || typeof chromium.launch !== 'function') return null;
    return { chromium, source, version: packageVersion(source) };
  } catch {
    return null;
  }
}

function packageVersion(file) {
  for (let dir = path.dirname(file); dir !== path.dirname(dir); dir = path.dirname(dir)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.name && pkg.version) return pkg.version;
    } catch {
      /* keep walking up */
    }
  }
  return null;
}

// Global node_modules: next to this node binary, NODE_PATH, then `npm root -g` (slower, last).
function* globalRoots() {
  const seen = new Set();
  const fresh = (dir) => dir && !seen.has(dir) && seen.add(dir) && fs.existsSync(dir);
  const prefix = path.dirname(path.dirname(process.execPath));
  const near = process.platform === 'win32' ? path.join(path.dirname(process.execPath), 'node_modules') : path.join(prefix, 'lib', 'node_modules');
  if (fresh(near)) yield near;
  for (const dir of (process.env.NODE_PATH ?? '').split(path.delimiter)) if (fresh(dir)) yield dir;
  try {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const root = execFileSync(npm, ['root', '-g'], { encoding: 'utf8', timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'], shell: process.platform === 'win32' }).trim();
    if (fresh(root)) yield root;
  } catch {
    /* npm missing or slow: fine */
  }
}

// ---------- browser executables ----------

function systemBrowserPaths() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    const apps = [
      'Google Chrome.app/Contents/MacOS/Google Chrome',
      'Chromium.app/Contents/MacOS/Chromium',
      'Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      'Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      'Brave Browser.app/Contents/MacOS/Brave Browser',
    ];
    return apps.flatMap((a) => [path.join('/Applications', a), path.join(home, 'Applications', a)]);
  }
  if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    return roots.flatMap((r) => [
      path.join(r, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(r, 'Chromium', 'Application', 'chrome.exe'),
      path.join(r, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ]);
  }
  const names = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'chrome', 'microsoft-edge', 'brave-browser'];
  const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean);
  return [
    ...names.flatMap((n) => dirs.map((d) => path.join(d, n))),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/opt/google/chrome/chrome',
  ];
}

// Chromium builds Playwright has already downloaded (any revision; useful on version mismatch).
function cachedBrowserPaths() {
  const home = os.homedir();
  const caches = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(home, '.cache', 'ms-playwright'),
    path.join(home, 'Library', 'Caches', 'ms-playwright'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'),
  ].filter((d) => d && d !== '0');
  const inner = [
    'chrome-linux/chrome',
    'chrome-linux64/chrome',
    'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
    'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
    'chrome-mac-x64/Chromium.app/Contents/MacOS/Chromium',
    'chrome-win/chrome.exe',
    'chrome-win64/chrome.exe',
  ];
  const out = [];
  for (const cache of caches) {
    let entries = [];
    try {
      entries = fs.readdirSync(cache).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse();
    } catch {
      continue;
    }
    for (const entry of entries) for (const rel of inner) out.push(path.join(cache, entry, ...rel.split('/')));
  }
  return out;
}

/** An installed Chrome/Chromium executable for the CLI fallback, or null. */
export function findChromeExecutable() {
  const explicit = process.env.STUDIO_CHROMIUM_PATH;
  if (explicit && isFile(explicit)) return explicit;
  return [...systemBrowserPaths(), ...cachedBrowserPaths()].find(isFile) ?? null;
}

function noBrowserError(detail) {
  const err = new UserError(detail ? `${NO_BROWSER_MESSAGE} (${detail})` : NO_BROWSER_MESSAGE, 3);
  err.code = 'STUDIO_NO_BROWSER';
  return err;
}

/**
 * Launch headless Chromium through Playwright and return the Browser.
 * Uses STUDIO_CHROMIUM_PATH when set; when Playwright's own browser is missing, falls back to an
 * installed Chrome/Edge or another downloaded Chromium build. Pushes a note into `opts.warnings`
 * when it falls back. Throws an error with exitCode 3 when nothing launches.
 */
export async function launchBrowser(opts = {}) {
  const { playwright = resolvePlaywright(), warnings = [], ...launchOptions } = opts;
  if (!playwright?.chromium) throw noBrowserError('Playwright not found');
  const { chromium } = playwright;
  const explicit = launchOptions.executablePath ?? process.env.STUDIO_CHROMIUM_PATH;
  const base = { headless: true, ...launchOptions };
  delete base.executablePath;

  const attempts = [
    ...(explicit ? [{ executablePath: explicit, label: explicit }] : []),
    { label: "Playwright's Chromium" },
    { channel: 'chrome', label: 'installed Google Chrome' },
    { channel: 'msedge', label: 'installed Microsoft Edge' },
  ];
  for (const exe of [...new Set([...systemBrowserPaths(), ...cachedBrowserPaths()])]) {
    if (exe !== explicit && isFile(exe)) attempts.push({ executablePath: exe, label: exe });
  }

  let firstError = null;
  for (const [i, { label, ...extra }] of attempts.entries()) {
    try {
      const browser = await chromium.launch({ ...base, ...extra });
      if (i > 0) warnings.push(`${attempts[0].label} could not launch (${firstLine(firstError?.message)}); using ${label}`);
      return browser;
    } catch (err) {
      firstError ??= err;
    }
  }
  throw noBrowserError(firstLine(firstError?.message));
}

// ---------- target and options ----------

function toUrl(target) {
  if (/^(https?|file|about|data):/i.test(target)) return target;
  const abs = path.resolve(process.cwd(), target);
  if (fs.existsSync(abs)) {
    const file = fs.statSync(abs).isDirectory() ? path.join(abs, 'index.html') : abs;
    if (!isFile(file)) throw new UserError(`no index.html in ${abs}`);
    return pathToFileURL(file).href;
  }
  // "localhost:3000/x" or "example.com" without a scheme (but "missing.html" is a missing file).
  const looksLikeFile = /\.(x?html?|svg|php|md|png|jpe?g|webp)$/i.test(target);
  if (!looksLikeFile && /^(localhost|127\.0\.0\.1|\[::1\]|[\w-]+(\.[\w-]+)+)(:\d+)?(\/|$)/i.test(target)) {
    return `${/^(localhost|127\.|\[::1\])/i.test(target) ? 'http' : 'https'}://${target}`;
  }
  throw new UserError(`target not found: ${abs}`);
}

/** target + suffix: "?a=b" merges into the query, "#x" sets the hash, anything else appends. */
export function withSuffix(url, suffix) {
  try {
    const u = new URL(url);
    if (suffix.startsWith('?')) {
      for (const [k, v] of new URLSearchParams(suffix.slice(1))) u.searchParams.set(k, v);
      return u.href;
    }
    if (suffix.startsWith('#')) {
      u.hash = suffix;
      return u.href;
    }
  } catch {
    /* fall through to plain concatenation */
  }
  return url + suffix;
}

function parseViewports(list) {
  const names = String(list).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!names.length) throw new UserError('--viewports needs at least one name');
  return [...new Set(names)].map((name) => {
    if (VIEWPORTS[name]) return { name, ...VIEWPORTS[name] };
    const m = name.match(/^(\d{3,4})x(\d{3,4})$/);
    if (m) return { name, width: Number(m[1]), height: Number(m[2]) };
    throw new UserError(`unknown viewport "${name}" (use ${Object.keys(VIEWPORTS).join(', ')} or <w>x<h>)`);
  });
}

function parseStates(list) {
  return list.map((spec) => {
    const eq = spec.indexOf('=');
    const name = eq > 0 ? spec.slice(0, eq).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') : '';
    const suffix = eq > 0 ? spec.slice(eq + 1) : '';
    if (!name || !suffix) throw new UserError(`--state expects name=<suffix>, e.g. empty=?state=empty (got "${spec}")`);
    return { name, suffix };
  });
}

function intFlag(value, name, fallback) {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new UserError(`--${name} must be a non-negative integer (got "${value}")`);
  return n;
}

// ---------- page helpers ----------

// Inject the freeze stylesheet at DOMContentLoaded on every navigation (idempotent).
function freezeInitScript({ id, css }) {
  const inject = () => {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject, { once: true });
  else inject();
}

async function loadPage(page, url, opts, warn) {
  let response = null;
  try {
    response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  } catch (err) {
    if (/timeout/i.test(err.message)) warn(`load event did not fire within 45s for ${url}; capturing anyway`);
    else throw new UserError(`could not load ${url}: ${firstLine(err.message).replace(/^page\.goto:\s*/, '')}`);
  }
  const status = response?.status?.();
  if (status && status >= 400) warn(`HTTP ${status} for ${url}`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => warn('network did not go idle within 15s'));
  await page
    .evaluate(() => Promise.race([document.fonts ? document.fonts.ready.then(() => true) : true, new Promise((r) => setTimeout(r, 10000))]))
    .catch(() => {});
  if (opts.freeze) await page.evaluate(freezeInitScript, { id: FREEZE_ID, css: FREEZE_CSS }).catch(() => {});
  if (opts.waitFor) {
    await page.waitForSelector(opts.waitFor, { state: 'visible', timeout: 15000 }).catch(() => warn(`--wait-for "${opts.waitFor}" not visible within 15s`));
  }
  if (opts.waitMs) await page.waitForTimeout(opts.waitMs);
}

// Wait for images that just scrolled into view (lazy loading), then two frames.
function settleViewport() {
  return new Promise((resolve) => {
    const pending = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return !img.complete && r.bottom > 0 && r.top < innerHeight;
    });
    const frames = () => requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    if (!pending.length) return frames();
    let left = pending.length;
    const done = () => --left <= 0 && frames();
    for (const img of pending) {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
    setTimeout(frames, 3000);
  });
}

const viewportTop = (page) =>
  page.evaluate(() => ({
    top: window.visualViewport ? window.visualViewport.pageTop : window.scrollY,
    docHeight: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0),
  }));

async function scrollTo(page, y, vp) {
  await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y);
  // A mobile page that overflows sideways is zoomed out: its layout viewport stops scrolling early,
  // so move the visual viewport the rest of the way with the wheel (it scrolls the visual one first).
  let { top, docHeight } = await viewportTop(page);
  const room = y > top ? top + vp.height < docHeight - 1 : top > 0;
  if (Math.abs(top - y) > 2 && room) {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    await page.mouse.wheel(0, y - top);
    for (let i = 0, last = NaN; i < 20 && top !== last; i++) {
      await page.waitForTimeout(50);
      last = top;
      ({ top } = await viewportTop(page));
    }
  }
  await page.evaluate(settleViewport).catch(() => {});
}

async function snap(page, file, opts) {
  await page.screenshot({ path: file, type: 'png', animations: opts.freeze ? 'disabled' : 'allow', caret: 'hide', scale: 'css', timeout: 30000 });
  return file;
}

// ---------- capture with Playwright ----------

async function captureViewport(browser, vp, ctx) {
  const { url, opts, warn, addError, name } = ctx;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: Boolean(vp.isMobile),
    hasTouch: Boolean(vp.hasTouch),
    colorScheme: 'light',
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference',
  });
  if (opts.freeze) await context.addInitScript(freezeInitScript, { id: FREEZE_ID, css: FREEZE_CSS });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') addError(msg.text());
  });
  page.on('pageerror', (err) => addError(err?.message ?? String(err)));

  const shots = [];
  const result = { shots, measure: null, aria: null };
  try {
    await loadPage(page, url, opts, warn);

    await scrollTo(page, 0, vp);
    shots.push(await snap(page, name(`${vp.name}-top.png`), opts));

    // Tiles: one viewport at a time; stop when less than 15% of a viewport of new content remains.
    // (Use the preset height: on mobile, overflowing pages report a zoomed-out innerHeight.)
    const vh = vp.height;
    for (let k = 1; k <= opts.tiles; k++) {
      const docHeight = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0));
      if (docHeight - k * vh < vh * 0.15) break;
      await scrollTo(page, k * vh, vp);
      shots.push(await snap(page, name(`${vp.name}-tile-${k}.png`), opts));
    }
    await scrollTo(page, 0, vp);

    if (opts.measure) {
      const args = { viewport: vp.name, width: vp.width, height: vp.height, mobile: Boolean(vp.hasTouch), freezeId: FREEZE_ID, cap: LIST_CAP };
      result.measure = await page.evaluate(collectMeasure, args);
      if (opts.ariaWanted) {
        try {
          const locator = page.locator('body');
          if (typeof locator.ariaSnapshot !== 'function') throw new Error('needs Playwright 1.49 or newer');
          result.aria = await locator.ariaSnapshot({ timeout: 15000 });
        } catch (err) {
          warn(`aria snapshot skipped: ${firstLine(err.message)}`);
        }
      }
    }

    if (opts.grayscale) {
      await page.evaluate(() => {
        const s = document.createElement('style');
        s.id = '__studio_gray';
        s.textContent = 'html{filter:grayscale(1)!important}';
        document.documentElement.appendChild(s);
      });
      await scrollTo(page, 0, vp);
      shots.push(await snap(page, name(`${vp.name}-gray-top.png`), opts));
      await page.evaluate(() => document.getElementById('__studio_gray')?.remove());
    }

    for (const state of opts.states) {
      await page.goto('about:blank').catch(() => {});
      await loadPage(page, withSuffix(url, state.suffix), opts, warn);
      await scrollTo(page, 0, vp);
      shots.push(await snap(page, name(`${vp.name}-state-${state.name}.png`), opts));
    }

    if (opts.dark) {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto('about:blank').catch(() => {});
      await loadPage(page, url, opts, warn);
      await scrollTo(page, 0, vp);
      const file = await snap(page, name(`${vp.name}-dark-top.png`), opts);
      if (fs.readFileSync(file).equals(fs.readFileSync(shots[0]))) {
        fs.rmSync(file);
        warn(`--dark: ${vp.name} looks identical in dark mode (no prefers-color-scheme styles); dark shot not kept`);
      } else {
        shots.push(file);
      }
    }
  } finally {
    await context.close().catch(() => {});
  }
  return result;
}

// ---------- capture with the Chrome CLI (no Playwright) ----------

function cliCapture(exe, url, viewports, name, warn) {
  const shots = [];
  for (const vp of viewports) {
    const file = name(`${vp.name}-top.png`);
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-chrome-'));
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profile}`,
      `--window-size=${vp.width},${vp.height}`,
      '--force-device-scale-factor=1',
      '--virtual-time-budget=5000',
      `--screenshot=${file}`,
      url,
    ];
    if (typeof process.getuid === 'function' && process.getuid() === 0) args.unshift('--no-sandbox');
    fs.rmSync(file, { force: true });
    const res = spawnSync(exe, args, { timeout: 90000, stdio: ['ignore', 'pipe', 'pipe'] });
    fs.rmSync(profile, { recursive: true, force: true });
    if (isFile(file) && fs.statSync(file).size > 0) shots.push(file);
    else warn(`headless Chrome failed for ${vp.name}: ${firstLine(res.error?.message ?? res.stderr?.toString()) || `exit ${res.status}`}`);
  }
  return shots;
}

// ---------- main capture ----------

/** Capture a target. Returns the same object the CLI prints. */
export async function shoot(target, options) {
  const opts = {
    viewports: 'desktop,mobile',
    tiles: 3,
    waitMs: 600,
    freeze: true,
    states: [],
    ...options,
  };
  if (!opts.out) throw new UserError('--out <dir> is required');
  const url = toUrl(target);
  const viewports = parseViewports(opts.viewports);
  const out = path.resolve(process.cwd(), opts.out);
  fs.mkdirSync(out, { recursive: true });

  const prefix = opts.prefix ? (/[-_.]$/.test(opts.prefix) ? opts.prefix : `${opts.prefix}-`) : '';
  const name = (file) => path.join(out, prefix + file);
  const warnings = [];
  const warn = (msg) => {
    if (!warnings.includes(msg)) warnings.push(msg);
  };
  const consoleErrors = [];
  const addError = (msg) => {
    const text = String(msg).slice(0, 300);
    if (consoleErrors.length < LIST_CAP && !consoleErrors.includes(text)) consoleErrors.push(text);
  };

  const shots = [];
  const measures = {};
  const arias = {};
  let engine;

  const playwright = resolvePlaywright();
  if (playwright) {
    const browser = await launchBrowser({ playwright, warnings });
    engine = `playwright ${playwright.version ?? '?'} · chromium ${browser.version()}`;
    try {
      for (const vp of viewports) {
        const res = await captureViewport(browser, vp, { url, opts: { ...opts, ariaWanted: true }, warn, addError, name });
        shots.push(...res.shots);
        if (res.measure) measures[vp.name] = res.measure;
        if (res.aria) arias[vp.name] = res.aria;
      }
    } finally {
      await browser.close().catch(() => {});
    }
  } else {
    const exe = findChromeExecutable();
    if (!exe) throw noBrowserError();
    engine = `chrome-cli ${exe}`;
    const skipped = [opts.tiles > 0 && 'tiles', opts.measure && 'measure', opts.dark && 'dark', opts.grayscale && 'grayscale', opts.states.length && 'states'].filter(Boolean);
    warn(`Playwright not found: captured the top of each viewport with headless Chrome only${skipped.length ? ` (skipped ${skipped.join(', ')})` : ''}. Install Playwright for full capture.`);
    shots.push(...cliCapture(exe, url, viewports, name, warn));
    if (!shots.length) throw noBrowserError('headless Chrome produced no screenshots');
  }

  let measurePath = null;
  let ariaPath = null;
  let summary = [];
  if (Object.keys(measures).length) {
    for (const m of Object.values(measures)) m.page.consoleErrors = consoleErrors.length;
    for (const [vpName, m] of Object.entries(measures)) m.summary = summarize(m, vpName);
    summary = mergeSummaries(measures);
    measurePath = name('measure.json');
    fs.writeFileSync(
      measurePath,
      compactJson({ target: url, capturedAt: new Date().toISOString(), engine, summary, viewports: measures, consoleErrors }) + '\n',
    );
  }
  if (Object.keys(arias).length) {
    ariaPath = name('aria.yml');
    fs.writeFileSync(ariaPath, ariaDocument(arias, url));
  }

  let criticFiles = [];
  if (opts.criticCopy) criticFiles = copyForCritics(shots, path.resolve(process.cwd(), opts.criticCopy), prefix);

  return { shots, criticFiles, measure: measurePath, aria: ariaPath, warnings, consoleErrors, summary, engine };
}

function ariaDocument(arias, url) {
  const entries = Object.entries(arias);
  const same = entries.every(([, yml]) => yml === entries[0][1]);
  if (same) return `# aria snapshot of ${url}\n# viewports: ${entries.map(([n]) => n).join(', ')}\n${entries[0][1].trimEnd()}\n`;
  return entries.map(([n, yml]) => `# aria snapshot of ${url}\n# viewport: ${n}\n${yml.trimEnd()}\n`).join('---\n');
}

/** Copy PNGs into <dir>/<6-hex>/ with neutral names (no prefix, round numbers or slugs). */
function copyForCritics(shots, dir, prefix) {
  let folder;
  do folder = path.join(dir, crypto.randomBytes(3).toString('hex'));
  while (fs.existsSync(folder));
  fs.mkdirSync(folder, { recursive: true });
  return shots.map((file) => {
    let base = path.basename(file);
    if (prefix && base.startsWith(prefix)) base = base.slice(prefix.length);
    const dest = path.join(folder, base);
    fs.copyFileSync(file, dest);
    return dest;
  });
}

// ---------- summary ----------

const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

/** Plain-English flags for one viewport's measurements. */
export function summarize(m, vpName = '') {
  const flags = [];
  const t = m.type ?? {};
  if (t.distinctSizes > 7) flags.push(`${t.distinctSizes} distinct font sizes (studio default ≤ 7)`);
  if (t.smallestTextPx && t.smallestTextPx < 12) flags.push(`smallest text ${t.smallestTextPx}px`);
  if (t.bodyLineHeight && (t.bodyLineHeight.ratio < 1.3 || t.bodyLineHeight.ratio > 1.9)) {
    const lh = t.bodyLineHeight.normal ? `normal (≈${t.bodyLineHeight.ratio})` : t.bodyLineHeight.ratio;
    flags.push(`body text line-height ${lh} at ${t.bodyLineHeight.px}px`);
  }
  const c = m.contrast ?? {};
  if (c.failCount) flags.push(`${plural(c.failCount, 'contrast failure')} (min ${c.minRatio}:1)`);
  if (c.overImage) flags.push(`${plural(c.overImage, 'text element')} over images (contrast not computed)`);
  const ms = m.measure ?? {};
  if (ms.offenderCount) flags.push(`${plural(ms.offenderCount, 'text block')} outside 30–80 characters per line (max ${ms.max})`);
  const h = m.headings ?? {};
  if (h.skippedLevels?.length) flags.push(`heading levels skip ${h.skippedLevels.join(', ')}`);
  if (h.h1Count === 0) flags.push('no h1');
  else if (h.h1Count > 1) flags.push(`${h.h1Count} h1 elements`);
  const tg = m.targets ?? {};
  if (tg.under24) {
    const small = [...(tg.under24Items ?? [])].sort((x, y) => x.w * x.h - y.w * y.h)[0];
    const notes = [small && `smallest ${small.w}×${small.h}`, tg.under24Spaced && `${tg.under24Spaced} ${tg.under24Spaced === 1 ? 'meets' : 'meet'} the WCAG spacing exception`].filter(Boolean);
    flags.push(`${plural(tg.under24, 'target')} under 24px${notes.length ? ` (${notes.join('; ')})` : ''}`);
  }
  if (tg.under44) flags.push(`${plural(tg.under44, 'touch target')} under 44px`);
  const a = m.a11y ?? {};
  if (a.focusVisibleRule === false) {
    flags.push(a.outlineNoneCount ? `no :focus-visible rule; outline removed in ${plural(a.outlineNoneCount, 'rule')}` : 'no :focus-visible rule');
  }
  if (a.reducedMotionRule === false && a.motionElements > 0) flags.push(`no prefers-reduced-motion rule (${plural(a.motionElements, 'element')} animate)`);
  if (a.unnamedControlCount) flags.push(`${plural(a.unnamedControlCount, 'control')} without an accessible name`);
  if (a.placeholderOnlyCount) flags.push(`${plural(a.placeholderOnlyCount, 'input')} labelled only by placeholder`);
  if (a.landmarks && !a.landmarks.main) flags.push('no <main> landmark');
  const img = m.images ?? {};
  if (img.missingAlt) flags.push(`${plural(img.missingAlt, 'image')} without alt`);
  const ct = m.ctas ?? {};
  if (ct.primaryLikeCount >= 2) flags.push(`${ct.primaryLikeCount} primary-looking buttons in the first viewport`);
  for (const l of (ct.labels ?? []).filter((x) => x.count >= 3).slice(0, 3)) flags.push(`"${l.label}" used ${l.count} times`);
  const col = m.color ?? {};
  if (col.distinctTextColors > 6) flags.push(`${col.distinctTextColors} distinct text colors`);
  const cr = m.craft ?? {};
  if (cr.distinctRadii > 3) flags.push(`${cr.distinctRadii} distinct corner radii`);
  if (cr.distinctShadows > 3) flags.push(`${cr.distinctShadows} distinct shadows`);
  if (cr.transitionAllCount) flags.push(`${plural(cr.transitionAllCount, 'element')} use transition: all`);
  if (cr.numericWithoutTabularCount) flags.push(`${plural(cr.numericWithoutTabularCount, 'numeric element')} without tabular-nums`);
  if (cr.headingsWithoutBalanceCount) flags.push(`${plural(cr.headingsWithoutBalanceCount, 'h1–h3 heading')} without text-wrap: balance/pretty`);
  const p = m.page ?? {};
  if (p.horizontalOverflow) flags.push(`horizontal overflow: page is ${p.docWidth}px wide in a ${p.viewport?.width}px viewport`);
  if (p.consoleErrors) flags.push(`${plural(p.consoleErrors, 'console error')}`);
  if (m.errors?.length) flags.push(`measure incomplete: ${m.errors.length} section(s) failed`);
  void vpName;
  return flags;
}

// Flags shared by every viewport appear once; the rest are prefixed with their viewport.
function mergeSummaries(measures) {
  const entries = Object.entries(measures);
  const out = [];
  for (const [vp, m] of entries) {
    for (const flag of m.summary) {
      const everywhere = entries.every(([, other]) => other.summary.includes(flag));
      const line = everywhere || entries.length === 1 ? flag : `${vp}: ${flag}`;
      if (!out.includes(line)) out.push(line);
    }
  }
  return out;
}

/** JSON with short objects and arrays kept on one line, so measure.json stays readable. */
export function compactJson(value, indent = '') {
  const flat = JSON.stringify(value);
  if (flat === undefined) return 'null';
  if (value === null || typeof value !== 'object' || flat.length + indent.length <= 100) return flat;
  const next = `${indent}  `;
  if (Array.isArray(value)) return `[\n${value.map((v) => next + compactJson(v, next)).join(',\n')}\n${indent}]`;
  const body = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${next}${JSON.stringify(k)}: ${compactJson(v, next)}`);
  return `{\n${body.join(',\n')}\n${indent}}`;
}

// ---------- in-page measurement ----------
// Runs inside the page via page.evaluate, so it must be self-contained (no outer references).

function collectMeasure({ viewport, width, height, mobile, freezeId, cap }) {
  const CAP = cap || 25;
  const errors = [];
  const section = (label, fn) => {
    try {
      return fn();
    } catch (err) {
      errors.push(`${label}: ${err && err.message}`);
      return null;
    }
  };
  // The preset size, not innerWidth/innerHeight: mobile Chrome zooms out on overflowing pages.
  const vw = width || window.innerWidth;
  const vh = height || window.innerHeight;
  const root = document.documentElement;
  const docWidth = Math.max(root.scrollWidth, document.body ? document.body.scrollWidth : 0);
  const docHeight = Math.max(root.scrollHeight, document.body ? document.body.scrollHeight : 0);
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const median = (xs) => {
    const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    if (!s.length) return null;
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  const collapse = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const snippet = (s, n = 60) => {
    const t = collapse(s);
    return t.length > n ? `${t.slice(0, n - 1)}…` : t;
  };
  const top = (map, n = CAP) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

  // ----- colors -----
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  const parseColor = (str) => {
    if (!str) return null;
    if (colorCache.has(str)) return colorCache.get(str);
    let c = null;
    const m = str.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/);
    if (m) {
      const a = m[4] === undefined ? 1 : Number(m[4]) / (m[5] ? 100 : 1);
      c = { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
    } else if (str === 'transparent') {
      c = { r: 0, g: 0, b: 0, a: 0 };
    } else {
      // oklch()/oklab()/lab()/color(): let the canvas convert to sRGB (gamut-clipped).
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = str;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      c = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    }
    colorCache.set(str, c);
    return c;
  };
  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const hex = (c) =>
    `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}${c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : ''}`;
  const COLOR_RE = /(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\([^()]*\)|#[0-9a-fA-F]{3,8}\b|\btransparent\b/g;
  const gradientStops = (img) => (img.match(COLOR_RE) || []).map(parseColor).filter(Boolean);
  const canvasColor = (() => {
    const probe = document.createElement('div');
    probe.style.cssText = 'background-color:Canvas;position:absolute;width:0;height:0';
    root.appendChild(probe);
    const c = parseColor(getComputedStyle(probe).backgroundColor);
    probe.remove();
    return c && c.a >= 0.99 ? c : { r: 255, g: 255, b: 255, a: 1 };
  })();

  // ----- element helpers -----
  const styles = new Map();
  const styleOf = (el) => {
    let s = styles.get(el);
    if (!s) styles.set(el, (s = getComputedStyle(el)));
    return s;
  };
  const parentOf = (el) => el.parentElement || (el.getRootNode && el.getRootNode().host) || null;
  const rendered = (el, opacity = true) => {
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ opacityProperty: opacity, visibilityProperty: true })) return false;
    } else {
      const cs = styleOf(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false; // empty or visually-hidden (sr-only)
    const x = r.left + window.scrollX;
    const y = r.top + window.scrollY;
    return x + r.width > 0 && x < docWidth && y + r.height > 0;
  };
  const selectorOf = (el) => {
    const parts = [];
    for (let node = el; node && node.nodeType === 1 && parts.length < 4; node = node.parentElement) {
      const tag = node.tagName.toLowerCase();
      if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) {
        parts.unshift(`${tag}#${node.id}`);
        break;
      }
      const classes = [...node.classList].filter((c) => /^[A-Za-z_-][\w-]*$/.test(c) && c.length <= 24).slice(0, 2);
      parts.unshift(tag + classes.map((c) => `.${c}`).join(''));
      if (tag === 'body') break;
    }
    return parts.join(' > ');
  };
  const ownText = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    return collapse(t);
  };
  const px = (v) => parseFloat(v) || 0;
  const isClipText = (cs) => cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text';

  // Effective background behind an element: a list of possible opaque colors (several when a
  // gradient is involved), or {image: true} when a url() background image comes first.
  const bgCache = new Map();
  const bgOf = (el) => {
    if (!el || el.nodeType !== 1) return { colors: [canvasColor], image: false, gradient: false };
    if (bgCache.has(el)) return bgCache.get(el);
    const cs = styleOf(el);
    const clip = isClipText(cs);
    const img = clip ? 'none' : cs.backgroundImage;
    const color = clip ? null : parseColor(cs.backgroundColor);
    const hasImg = img && img !== 'none';
    let result;
    if (hasImg && /url\(|image-set\(|element\(|paint\(/.test(img)) {
      result = { colors: [], image: true, gradient: false };
    } else {
      let base = null;
      let gradient = false;
      if (color && color.a >= 0.999) base = [color];
      else {
        const below = bgOf(parentOf(el));
        if (below.image) result = { colors: [], image: true, gradient: false };
        else {
          base = color && color.a > 0 ? below.colors.map((b) => over(color, b)) : below.colors;
          gradient = below.gradient;
        }
      }
      if (!result) {
        let colors = base;
        if (hasImg) {
          const stops = gradientStops(img);
          if (stops.length) {
            gradient = true;
            const seen = new Set();
            colors = stops
              .flatMap((s) => colors.map((b) => over(s, b)))
              .filter((c) => {
                const k = hex(c);
                return !seen.has(k) && seen.add(k);
              })
              .slice(0, 16);
          }
        }
        result = { colors, image: false, gradient };
      }
    }
    bgCache.set(el, result);
    return result;
  };
  const opacityCache = new Map();
  const opacityOf = (el) => {
    if (!el || el.nodeType !== 1) return 1;
    if (opacityCache.has(el)) return opacityCache.get(el);
    const o = (parseFloat(styleOf(el).opacity) || 0) * opacityOf(parentOf(el));
    opacityCache.set(el, o);
    return o;
  };
  // Foreground candidates: the text fill color, or a gradient's stops for background-clip:text.
  const fgOf = (el, cs) => {
    const fill = parseColor(cs.webkitTextFillColor);
    if (isClipText(cs) && fill && fill.a === 0) {
      const stops = gradientStops(cs.backgroundImage || '');
      if (stops.length) return { colors: stops, gradientText: true };
    }
    return { colors: [fill && cs.webkitTextFillColor !== cs.color ? fill : parseColor(cs.color)], gradientText: false };
  };
  const accName = (el) => {
    const by = el.getAttribute('aria-labelledby');
    if (by) {
      const t = collapse(by.split(/\s+/).map((id) => (document.getElementById(id) || {}).textContent || '').join(' '));
      if (t) return t;
    }
    const label = collapse(el.getAttribute('aria-label'));
    if (label) return label;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (['submit', 'reset', 'button'].includes(type)) return collapse(el.value) || (type === 'button' ? '' : type);
      if (type === 'image') return collapse(el.getAttribute('alt'));
      const fromLabels = collapse([...(el.labels || [])].map((l) => l.innerText || l.textContent).join(' '));
      if (fromLabels) return fromLabels;
      return collapse(el.getAttribute('title'));
    }
    const text = collapse(el.innerText || el.textContent);
    if (text) return text;
    const inner = el.querySelector('img[alt]:not([alt=""]), [aria-label], svg title');
    if (inner) return collapse(inner.getAttribute('alt') || inner.getAttribute('aria-label') || inner.textContent);
    return collapse(el.getAttribute('title'));
  };

  // ----- walk the document once -----
  const all = document.body ? [...document.body.querySelectorAll('*')] : [];
  const ELEMENT_CAP = 12000;
  const truncated = all.length > ELEMENT_CAP;
  const elements = truncated ? all.slice(0, ELEMENT_CAP) : all;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE', 'OPTION', 'OPTGROUP', 'HEAD', 'META', 'LINK', 'BR', 'WBR']);
  const visible = [];
  const texts = [];
  for (const el of elements) {
    if (SKIP.has(el.tagName) || el.closest('svg')) continue;
    if (!rendered(el)) continue;
    visible.push(el);
    const text = ownText(el);
    if (text) texts.push({ el, cs: styleOf(el), text });
  }

  const page = {
    url: location.href,
    title: document.title,
    lang: root.getAttribute('lang') || null,
    viewport: { name: viewport, width: vw, height: vh },
    docHeight,
    docWidth,
    horizontalOverflow: docWidth > vw + 1,
    consoleErrors: 0,
  };
  if (page.horizontalOverflow) {
    // The outermost elements that stick out past the right edge.
    const sticking = new Set(visible.filter((el) => el.getBoundingClientRect().right > vw + 1));
    page.overflowing = [...sticking]
      .filter((el) => !sticking.has(el.parentElement))
      .slice(0, 5)
      .map((el) => ({ selector: selectorOf(el), right: Math.round(el.getBoundingClientRect().right) }));
  }
  if (truncated) page.elementsTruncatedAt = ELEMENT_CAP;

  // ----- type -----
  let bodyText = null;
  const type = section('type', () => {
    const sizes = new Map();
    const families = new Map();
    const stacks = new Map();
    const weights = new Set();
    const lh = new Map();
    const tr = new Map();
    const lhWeighted = new Map(); // size -> [{ratio, n, normal}] for the char-weighted body figure
    let uppercase = 0;
    let smallest = Infinity;
    let total = 0;
    for (const { cs, text } of texts) {
      const size = px(cs.fontSize);
      if (!size) continue;
      const n = text.length;
      total += n;
      const key = round(size, 1);
      sizes.set(key, (sizes.get(key) || 0) + n);
      const family = (cs.fontFamily.split(',')[0] || '').trim().replace(/^["']|["']$/g, '');
      families.set(family, (families.get(family) || 0) + n);
      if (!stacks.has(family)) stacks.set(family, cs.fontFamily);
      weights.add(Number(cs.fontWeight) || cs.fontWeight);
      const ratio = cs.lineHeight === 'normal' ? 1.2 : px(cs.lineHeight) / size; // "normal" ≈ 1.2
      if (!lh.has(key)) lh.set(key, []);
      lh.get(key).push(ratio);
      if (!lhWeighted.has(key)) lhWeighted.set(key, []);
      lhWeighted.get(key).push({ ratio, n, normal: cs.lineHeight === 'normal' });
      if (!tr.has(key)) tr.set(key, []);
      tr.get(key).push(cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing) / size);
      const letters = text.replace(/[^\p{L}]/gu, '');
      if (cs.textTransform === 'uppercase' || (letters.length >= 4 && letters === letters.toUpperCase() && letters !== letters.toLowerCase())) uppercase++;
      if (text.replace(/\s/g, '').length >= 2) smallest = Math.min(smallest, size);
    }
    const bySize = [...sizes.keys()].sort((a, b) => b - a);
    const perSize = (map, digits) => Object.fromEntries(bySize.map((s) => [`${s}px`, round(median(map.get(s)), digits)]));
    const [bodyPx] = top(sizes, 1)[0] || [];
    if (bodyPx) {
      // Body text = the size with the most characters; its line-height is the char-weighted median.
      const rows = lhWeighted.get(bodyPx).sort((a, b) => a.ratio - b.ratio);
      const half = rows.reduce((sum, r) => sum + r.n, 0) / 2;
      let acc = 0;
      const mid = rows.find((r) => (acc += r.n) >= half) || rows[rows.length - 1];
      bodyText = { px: bodyPx, ratio: round(mid.ratio, 2) };
      if (mid.normal) bodyText.normal = true;
    }
    return {
      families: top(families, 6).map(([family, chars]) => ({ family, chars, share: round(chars / (total || 1), 2), stack: snippet(stacks.get(family), 80) })),
      sizes: Object.fromEntries(bySize.map((s) => [`${s}px`, sizes.get(s)])),
      distinctSizes: sizes.size,
      weights: [...weights].sort((a, b) => Number(a) - Number(b)),
      lineHeightRatios: perSize(lh, 2),
      tracking: perSize(tr, 3),
      uppercaseBlocks: uppercase,
      smallestTextPx: Number.isFinite(smallest) ? round(smallest, 1) : null,
      bodyLineHeight: bodyText,
      chars: total,
    };
  });

  // ----- measure (characters per line) -----
  const measure = section('measure', () => {
    const rows = [];
    for (const el of document.querySelectorAll('p, li, dd, blockquote')) {
      if (!rendered(el) || el.querySelector('p, li, dd, blockquote')) continue;
      const text = collapse(el.textContent);
      if (text.length < 80) continue;
      const cs = styleOf(el);
      const size = px(cs.fontSize);
      const lineHeight = cs.lineHeight === 'normal' ? size * 1.2 : px(cs.lineHeight);
      const r = el.getBoundingClientRect();
      const height = r.height - px(cs.paddingTop) - px(cs.paddingBottom) - px(cs.borderTopWidth) - px(cs.borderBottomWidth);
      const lines = Math.max(1, Math.round(height / (lineHeight || size * 1.2)));
      // Several lines: full-line capacity from the content width and the average glyph width
      // (the plain text/lines estimate undercounts because the last line is partial).
      let cpl = Math.round(text.length / lines);
      if (lines >= 2) {
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const glyph = ctx.measureText(text).width / text.length + (cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing));
        const width = r.width - px(cs.paddingLeft) - px(cs.paddingRight) - px(cs.borderLeftWidth) - px(cs.borderRightWidth);
        if (glyph > 0 && width > 0) cpl = Math.round(width / glyph);
      }
      rows.push({ el, cpl, lines, text });
    }
    const offenders = rows.filter((r) => r.cpl > 80 || r.cpl < 30).sort((a, b) => Math.abs(b.cpl - 55) - Math.abs(a.cpl - 55));
    return {
      checked: rows.length,
      median: median(rows.map((r) => r.cpl)),
      max: rows.length ? Math.max(...rows.map((r) => r.cpl)) : null,
      offenderCount: offenders.length,
      offenders: offenders.slice(0, CAP).map((r) => ({ selector: selectorOf(r.el), cpl: r.cpl, lines: r.lines, text: snippet(r.text) })),
    };
  });

  // ----- headings -----
  const headings = section('headings', () => {
    const list = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')].filter((el) => rendered(el, false));
    const outline = list.map((el) => ({
      level: /^H[1-6]$/.test(el.tagName) ? Number(el.tagName[1]) : Number(el.getAttribute('aria-level')) || 2,
      text: snippet(el.textContent),
      px: round(px(styleOf(el).fontSize), 1),
    }));
    const skipped = [];
    outline.forEach((h, i) => {
      const label = i > 0 && h.level > outline[i - 1].level + 1 ? `h${outline[i - 1].level}→h${h.level}` : null;
      if (label && !skipped.includes(label)) skipped.push(label);
    });
    return { h1Count: outline.filter((h) => h.level === 1).length, skippedLevels: skipped, outline: outline.slice(0, CAP) };
  });

  // ----- color -----
  const color = section('color', () => {
    const textColors = new Map();
    for (const { cs, text } of texts) {
      const c = parseColor(cs.color);
      if (!c) continue;
      const k = hex(c);
      const entry = textColors.get(k) || { color: k, count: 0, chars: 0 };
      entry.count++;
      entry.chars += text.length;
      textColors.set(k, entry);
    }
    const backgrounds = new Set();
    for (const el of visible) {
      const c = parseColor(styleOf(el).backgroundColor);
      if (c && c.a > 0) backgrounds.add(hex(c));
    }
    return {
      distinctTextColors: textColors.size,
      distinctBackgrounds: backgrounds.size,
      topTextColors: [...textColors.values()].sort((a, b) => b.chars - a.chars).slice(0, 8),
      backgrounds: [...backgrounds].slice(0, 12),
    };
  });

  // ----- contrast -----
  const contrastSection = section('contrast', () => {
    const failures = [];
    let checked = 0;
    let overImage = 0;
    let overGradient = 0;
    let minRatio = Infinity;
    for (const { el, cs, text } of texts) {
      if (el.closest(':disabled, [aria-disabled="true"]')) continue;
      const fg = fgOf(el, cs);
      const alpha = opacityOf(el);
      if (fg.colors.every((c) => !c || c.a * alpha < 0.05)) continue;
      const bg = bgOf(el);
      if (bg.image) {
        overImage++;
        continue;
      }
      let worst = null;
      for (const f of fg.colors) {
        if (!f) continue;
        for (const b of bg.colors) {
          const shown = over({ ...f, a: f.a * alpha }, b);
          const ratio = contrast(shown, b);
          if (!worst || ratio < worst.ratio) worst = { ratio, fg: shown, bg: b };
        }
      }
      if (!worst) continue;
      checked++;
      if (bg.gradient || fg.gradientText) overGradient++;
      minRatio = Math.min(minRatio, worst.ratio);
      const size = px(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const required = large ? 3 : 4.5;
      if (worst.ratio < required) {
        const row = { selector: selectorOf(el), text: snippet(text, 50), fg: hex(worst.fg), bg: hex(worst.bg), ratio: Math.floor(worst.ratio * 100) / 100, required, px: round(size, 1) };
        if (bg.gradient || fg.gradientText) row.gradient = true;
        failures.push(row);
      }
    }
    failures.sort((a, b) => a.ratio - b.ratio);
    return {
      checked,
      failCount: failures.length,
      minRatio: Number.isFinite(minRatio) ? Math.floor(minRatio * 100) / 100 : null,
      overImage,
      overGradient,
      failures: failures.slice(0, CAP),
    };
  });

  // ----- targets -----
  const TARGET_SEL = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
  const targets = section('targets', () => {
    // Skip controls nested in another control (a button inside a link); focusable containers don't count.
    const CONTROL = 'a[href], button, summary, [role="button"], [role="link"]';
    const found = [...document.querySelectorAll(TARGET_SEL)].filter((el) => !el.parentElement || !el.parentElement.closest(CONTROL));
    const items = [];
    let inlineExempt = 0;
    for (const el of found.slice(0, 1500)) {
      if (!rendered(el)) continue;
      const cs = styleOf(el);
      let r = el.getBoundingClientRect();
      const wrapping = el.labels && [...el.labels].find((l) => l.contains(el));
      if (wrapping) r = wrapping.getBoundingClientRect();
      // WCAG 2.5.8 inline exception: a link inside a sentence.
      if (cs.display === 'inline') {
        let block = el.parentElement;
        while (block && styleOf(block).display === 'inline') block = block.parentElement;
        if (block && collapse(block.textContent).length > collapse(el.textContent).length + 10) {
          inlineExempt++;
          continue;
        }
      }
      items.push({ el, r, cx: r.left + r.width / 2, cy: r.top + r.height / 2, small24: r.width < 23.5 || r.height < 23.5, small44: mobile && (r.width < 43.5 || r.height < 43.5) });
    }
    // Spacing exception: a 24px circle on the target's center touches no other target or circle.
    const spaced = (t) =>
      items.every((o) => {
        if (o === t) return true;
        if (o.small24) return Math.hypot(o.cx - t.cx, o.cy - t.cy) >= 24;
        const dx = Math.max(o.r.left - t.cx, 0, t.cx - o.r.right);
        const dy = Math.max(o.r.top - t.cy, 0, t.cy - o.r.bottom);
        return Math.hypot(dx, dy) >= 12;
      });
    const describe = (t) => ({ selector: selectorOf(t.el), label: snippet(accName(t.el), 40), w: Math.round(t.r.width), h: Math.round(t.r.height) });
    const under24 = items.filter((t) => t.small24).map((t) => ({ ...describe(t), spaced: spaced(t) }));
    const under44 = items.filter((t) => t.small44 && !t.small24).map(describe);
    return {
      total: items.length,
      under24: under24.length,
      under24Spaced: under24.filter((t) => t.spaced).length,
      under44: mobile ? under44.length + under24.length : null, // all under 44; under44Items lists the 24-44 ones
      inlineExempt,
      under24Items: under24.slice(0, CAP),
      under44Items: mobile ? under44.slice(0, CAP) : undefined,
    };
  });

  // ----- CTAs -----
  const ctas = section('ctas', () => {
    const labels = new Map();
    const primaryLike = [];
    for (const el of document.querySelectorAll('a[href], button, [role="button"], input[type="submit"], input[type="button"]')) {
      if (!rendered(el)) continue;
      const label = snippet(accName(el), 50);
      if (label) {
        const key = label.toLowerCase();
        const entry = labels.get(key) || { label, count: 0 };
        entry.count++;
        labels.set(key, entry);
      }
      const r = el.getBoundingClientRect();
      if (r.top + window.scrollY >= vh) continue;
      const cs = styleOf(el);
      const buttonish = el.tagName !== 'A' || el.getAttribute('role') === 'button' || (cs.display !== 'inline' && px(cs.paddingLeft) + px(cs.paddingRight) >= 16);
      if (!buttonish) continue;
      const bgImg = cs.backgroundImage !== 'none' && !/url\(/.test(cs.backgroundImage);
      const fill = parseColor(cs.backgroundColor);
      const behind = bgOf(parentOf(el));
      const ref = behind.colors[0];
      const distinct = fill && fill.a >= 0.5 && (!ref || Math.hypot(fill.r - ref.r, fill.g - ref.g, fill.b - ref.b) > 40);
      if (bgImg || distinct) primaryLike.push(label || selectorOf(el));
    }
    const list = [...labels.values()].sort((a, b) => b.count - a.count);
    return { distinct: list.length, labels: list.slice(0, CAP), primaryLikeCount: primaryLike.length, primaryLike: primaryLike.slice(0, 10) };
  });

  // ----- images -----
  const images = section('images', () => {
    const imgs = [...document.images];
    const decorative = (img) => img.getAttribute('aria-hidden') === 'true' || ['presentation', 'none'].includes(img.getAttribute('role'));
    const missing = imgs.filter((img) => !img.hasAttribute('alt') && !decorative(img));
    const src = (img) => {
      const s = img.currentSrc || img.getAttribute('src') || '';
      return s.startsWith('data:') ? `${s.slice(0, 30)}…` : snippet(s, 80);
    };
    return {
      total: imgs.length,
      missingAlt: missing.length,
      emptyAlt: imgs.filter((img) => img.getAttribute('alt') === '').length,
      missingAltItems: missing.slice(0, CAP).map((img) => ({ selector: selectorOf(img), src: src(img) })),
    };
  });

  // ----- accessibility -----
  const a11y = section('a11y', () => {
    const unnamed = [];
    let placeholderOnly = 0;
    for (const el of document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]')) {
      if (!rendered(el, false)) continue;
      if (accName(el)) continue;
      if (el.getAttribute('placeholder')) {
        placeholderOnly++;
        continue;
      }
      unnamed.push({ selector: selectorOf(el), html: snippet(el.outerHTML, 80) });
    }
    const has = (sel) => Boolean(document.querySelector(sel));
    let focusStyle = false;
    let focusRules = 0;
    let outlineNone = 0;
    let outlineNoneOnFocus = 0;
    let reducedMotion = false;
    let unreadableSheets = 0;
    const outlineOff = (st) => /^(none|0|0px)\b/.test(st.outline || '') || st.outlineStyle === 'none' || st.outlineWidth === '0px' || st.outlineWidth === '0';
    const replacement = (st) => Boolean(st.boxShadow || st.borderColor || st.borderBottomColor || st.backgroundColor || st.textDecoration || st.textDecorationLine || st.color);
    const walk = (rules) => {
      for (const rule of rules) {
        const cond = rule.conditionText || (rule.media && rule.media.mediaText) || '';
        if (/prefers-reduced-motion/.test(cond)) reducedMotion = true;
        if (rule.selectorText !== undefined && rule.style) {
          const sel = rule.selectorText;
          const off = outlineOff(rule.style);
          if (off) outlineNone++;
          if (/:focus(?!-within)/.test(sel)) {
            focusRules++;
            if (off) outlineNoneOnFocus++;
            if (!off || replacement(rule.style)) focusStyle = true;
          }
        }
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode && /^__studio/.test(sheet.ownerNode.id || '')) continue;
      if (sheet.media && /prefers-reduced-motion/.test(sheet.media.mediaText)) reducedMotion = true;
      try {
        walk(sheet.cssRules);
      } catch {
        unreadableSheets++;
      }
    }
    return {
      unnamedControlCount: unnamed.length,
      unnamedControls: unnamed.slice(0, CAP),
      placeholderOnlyCount: placeholderOnly,
      landmarks: {
        header: has('header, [role="banner"]'),
        nav: has('nav, [role="navigation"]'),
        main: has('main, [role="main"]'),
        footer: has('footer, [role="contentinfo"]'),
      },
      focusVisibleRule: focusStyle,
      focusRules,
      reducedMotionRule: reducedMotion,
      outlineNoneCount: outlineNone,
      outlineNoneOnFocus,
      unreadableSheets,
      motionElements: 0,
    };
  });

  // ----- craft -----
  const craft = section('craft', () => {
    const radii = new Map();
    const shadows = new Map();
    const spacings = new Map();
    const numeric = [];
    const unbalanced = [];
    const REPLACED = new Set(['IMG', 'VIDEO', 'CANVAS', 'IFRAME', 'PICTURE']);
    for (const el of visible) {
      const cs = styleOf(el);
      const r = el.getBoundingClientRect();
      const corners = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
      if (corners.some((c) => px(c) > 0)) {
        const bgc = parseColor(cs.backgroundColor);
        const paints = (bgc && bgc.a > 0) || cs.backgroundImage !== 'none' || px(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none' || REPLACED.has(el.tagName);
        if (paints) {
          const half = Math.min(r.width, r.height) / 2;
          const norm = corners.map((c) => (c.endsWith('%') ? (px(c) >= 50 ? 'full' : c) : px(c) >= half - 0.5 ? 'full' : `${round(px(c), 1)}px`));
          const key = norm.every((v) => v === norm[0]) ? norm[0] : norm.join(' ');
          radii.set(key, (radii.get(key) || 0) + 1);
        }
      }
      if (cs.boxShadow && cs.boxShadow !== 'none') shadows.set(cs.boxShadow, (shadows.get(cs.boxShadow) || 0) + 1);
      const parent = el.parentElement;
      const pw = parent ? parent.clientWidth - px(styleOf(parent).paddingLeft) - px(styleOf(parent).paddingRight) : 0;
      const ml = px(cs.marginLeft);
      const mr = px(cs.marginRight);
      const centered = ml > 0 && Math.abs(ml - mr) < 1 && Math.abs(r.width + ml + mr - pw) < 2; // margin: auto
      const props = [cs.marginTop, cs.marginBottom, cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft, cs.rowGap, cs.columnGap];
      if (!centered) props.push(cs.marginLeft, cs.marginRight);
      for (const v of props) {
        const n = Math.round(parseFloat(v));
        if (n) spacings.set(n, (spacings.get(n) || 0) + 1);
      }
    }
    for (const { el, cs, text } of texts) {
      const digits = (text.match(/\d/g) || []).length;
      const solid = text.replace(/\s/g, '').length;
      if (digits >= 3 && digits / solid >= 0.5) {
        const tabular = /tabular-nums/.test(cs.fontVariantNumeric) || /["']tnum["']/.test(cs.fontFeatureSettings) || /mono|courier|consolas|menlo/i.test(cs.fontFamily);
        if (!tabular) numeric.push({ selector: selectorOf(el), text: snippet(text, 30) });
      }
    }
    for (const el of document.querySelectorAll('h1, h2, h3')) {
      if (!rendered(el, false)) continue;
      const cs = styleOf(el);
      const wrap = `${cs.textWrapStyle || ''} ${cs.textWrap || ''}`;
      if (!/balance|pretty/.test(wrap)) unbalanced.push({ level: Number(el.tagName[1]), text: snippet(el.textContent, 40) });
    }
    return {
      distinctRadii: radii.size,
      radii: top(radii, 12).map(([value, count]) => ({ value, count })),
      distinctShadows: shadows.size,
      shadows: top(shadows, 8).map(([value, count]) => ({ value: snippet(value, 90), count })),
      distinctSpacings: top(spacings, 15).map(([n, count]) => ({ px: n, count })),
      spacingCount: spacings.size,
      transitionAllCount: 0,
      numericWithoutTabularCount: numeric.length,
      numericWithoutTabular: numeric.slice(0, CAP),
      headingsWithoutBalanceCount: unbalanced.length,
      headingsWithoutBalance: unbalanced.slice(0, CAP),
    };
  });

  // ----- motion: read real durations with the freeze stylesheet switched off -----
  section('motion', () => {
    const freeze = document.getElementById(freezeId);
    if (freeze && freeze.sheet) freeze.sheet.disabled = true;
    let transitionAll = 0;
    let moving = 0;
    try {
      for (const el of visible) {
        const cs = getComputedStyle(el);
        const durations = (s) => s.split(',').map((d) => parseFloat(d) || 0);
        const transitions = durations(cs.transitionDuration);
        const animated = cs.animationName && cs.animationName !== 'none' && durations(cs.animationDuration).some((d) => d > 0);
        if (animated || transitions.some((d) => d > 0)) moving++;
        const propsList = cs.transitionProperty.split(',').map((p) => p.trim());
        if (propsList.some((p, i) => p === 'all' && (transitions[i % transitions.length] || 0) > 0)) transitionAll++;
      }
    } finally {
      if (freeze && freeze.sheet) freeze.sheet.disabled = false;
    }
    if (craft) craft.transitionAllCount = transitionAll;
    if (a11y) a11y.motionElements = moving;
  });

  return { page, type, measure, headings, color, contrast: contrastSection, targets, ctas, images, a11y, craft, errors: errors.length ? errors : undefined };
}

// ---------- CLI ----------

function parseCli(config) {
  try {
    return parseArgs(config);
  } catch (err) {
    throw new UserError(firstLine(err.message));
  }
}

export async function main(argv = process.argv.slice(2)) {
  const { values, positionals } = parseCli({
    args: argv,
    allowPositionals: true,
    options: {
      out: { type: 'string' },
      viewports: { type: 'string', default: 'desktop,mobile' },
      tiles: { type: 'string' },
      dark: { type: 'boolean', default: false },
      grayscale: { type: 'boolean', default: false },
      'reduced-motion': { type: 'boolean', default: false },
      'no-freeze': { type: 'boolean', default: false },
      'wait-for': { type: 'string' },
      'wait-ms': { type: 'string' },
      state: { type: 'string', multiple: true, default: [] },
      measure: { type: 'boolean', default: false },
      'critic-copy': { type: 'string' },
      prefix: { type: 'string' },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help) {
    console.log(HELP);
    return 0;
  }
  if (positionals.length !== 1) throw new UserError(`expected one target (url or file), got ${positionals.length}; see --help`);
  if (!values.out) throw new UserError('--out <dir> is required');
  const result = await shoot(positionals[0], {
    out: values.out,
    viewports: values.viewports,
    tiles: intFlag(values.tiles, 'tiles', 3),
    dark: values.dark,
    grayscale: values.grayscale,
    reducedMotion: values['reduced-motion'],
    freeze: !values['no-freeze'],
    waitFor: values['wait-for'],
    waitMs: intFlag(values['wait-ms'], 'wait-ms', 600),
    states: parseStates(values.state),
    measure: values.measure,
    criticCopy: values['critic-copy'],
    prefix: values.prefix,
  });
  console.log(JSON.stringify(result, null, 2));
  return 0;
}

function isMain() {
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (err) => {
      console.error(`shoot: ${err.exitCode ? err.message : firstLine(err?.message ?? err)}`);
      if (process.env.STUDIO_DEBUG && err?.stack) console.error(err.stack);
      process.exitCode = err.exitCode ?? 1;
    },
  );
}
