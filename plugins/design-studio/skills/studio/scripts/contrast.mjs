#!/usr/bin/env node
// WCAG 2.x contrast checker for colors, pair lists and CSS custom-property token files.
// Zero dependencies. Exports parseColor() and contrastRatio() for tests and other scripts.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HELP = `contrast.mjs — WCAG contrast ratios

Usage:
  node contrast.mjs <fg> <bg> [--use text|large|ui] [--json]
  node contrast.mjs --pairs <file.json> [--json]
  node contrast.mjs --tokens <file.css> [--json]

Colors: #rgb #rgba #rrggbb #rrggbbaa, rgb()/rgba(), hsl()/hsla(),
         oklch(L C H) (L in % or 0-1, H in deg), oklab(L a b), white, black, transparent.
         Quote colors in the shell: node contrast.mjs '#777' '#fff'
         A translucent foreground is composited over the background (noted in output).

Thresholds: AA normal 4.5 · AA large 3 · AAA normal 7 · non-text UI 3.
  <fg> <bg>   exits 1 when AA normal fails (or the --use threshold: large = 3, ui = 3).
  --pairs     JSON array of {name, fg, bg, use?: "text"|"large"|"ui"}; exits 1 if any fail.
  --tokens    checks --X on --X-foreground, --foreground/--muted-foreground on --background
              and --primary-foreground on --primary in every :root/.dark/@media scope
              (simple var(--x) references resolved; shadcn "H S% L%" triples accepted).

Exit codes: 0 pass · 1 a check failed · 2 bad or missing input.`;

export const THRESHOLDS = { text: 4.5, large: 3, ui: 3 };

const NAMED = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  transparent: [0, 0, 0, 0],
};

// ---------- color parsing ----------

/**
 * Parse a CSS color string into {r, g, b, a} (r/g/b 0-255 floats, a 0-1).
 * Adds `outOfGamut: true` when an oklch/oklab color had to be clamped to sRGB.
 * Throws on anything it cannot read.
 */
export function parseColor(input) {
  if (input && typeof input === 'object' && 'r' in input) return input;
  const str = String(input ?? '').trim().toLowerCase();
  if (!str) throw new Error('empty color');
  if (NAMED[str]) return rgba(...NAMED[str]);

  const hex = str.startsWith('#') ? str.slice(1) : /^[0-9a-f]{3,8}$/.test(str) ? str : null;
  if (hex !== null) return parseHex(hex, input);

  const fn = str.match(/^([a-z]+)\((.*)\)$/);
  if (!fn) throw new Error(`unrecognised color "${input}"`);
  const [, name, body] = fn;
  const { parts, alpha } = splitArgs(body, input);
  switch (name) {
    case 'rgb':
    case 'rgba':
      return parseRgb(parts, alpha, input);
    case 'hsl':
    case 'hsla':
      return parseHsl(parts, alpha, input);
    case 'oklch':
      return parseOklch(parts, alpha, input);
    case 'oklab':
      return parseOklab(parts, alpha, input);
    default:
      throw new Error(`unsupported color function "${name}()" in "${input}"`);
  }
}

function rgba(r, g, b, a = 1) {
  return { r, g, b, a };
}

function parseHex(hex, input) {
  if (![3, 4, 6, 8].includes(hex.length) || !/^[0-9a-f]+$/.test(hex)) {
    throw new Error(`bad hex color "${input}"`);
  }
  const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
  const n = (i) => parseInt(full.slice(i, i + 2), 16);
  return rgba(n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1);
}

// Accepts both "a, b, c, d" and "a b c / d".
function splitArgs(body, input) {
  let main = body;
  let alpha = null;
  if (body.includes('/')) {
    const idx = body.lastIndexOf('/');
    main = body.slice(0, idx);
    alpha = body.slice(idx + 1).trim();
  }
  const parts = main.split(/[\s,]+/).filter(Boolean);
  if (alpha === null && parts.length === 4) alpha = parts.pop();
  if (parts.length !== 3) throw new Error(`expected 3 components in "${input}"`);
  return { parts, alpha };
}

function num(token, input) {
  if (token === 'none') return 0;
  const v = parseFloat(token);
  if (!Number.isFinite(v)) throw new Error(`bad number "${token}" in "${input}"`);
  return v;
}

function parseAlpha(token, input) {
  if (token === null || token === undefined) return 1;
  const v = num(token, input);
  return clamp(token.endsWith('%') ? v / 100 : v, 0, 1);
}

function parseHue(token, input) {
  const v = num(token, input);
  if (token.endsWith('turn')) return v * 360;
  if (token.endsWith('grad')) return v * 0.9;
  if (token.endsWith('rad')) return (v * 180) / Math.PI;
  return v; // deg or unitless
}

function parseRgb(parts, alpha, input) {
  const [r, g, b] = parts.map((p) => clamp(p.endsWith('%') ? (num(p, input) / 100) * 255 : num(p, input), 0, 255));
  return rgba(r, g, b, parseAlpha(alpha, input));
}

function parseHsl(parts, alpha, input) {
  const h = (((parseHue(parts[0], input) % 360) + 360) % 360) / 360;
  const s = clamp(num(parts[1], input) / 100, 0, 1);
  const l = clamp(num(parts[2], input) / 100, 0, 1);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return rgba(channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255, parseAlpha(alpha, input));
}

function parseLightness(token, input) {
  const v = num(token, input);
  return clamp(token.endsWith('%') ? v / 100 : v, 0, 1);
}

function parseOklch(parts, alpha, input) {
  const L = parseLightness(parts[0], input);
  const C = Math.max(0, parts[1].endsWith('%') ? (num(parts[1], input) / 100) * 0.4 : num(parts[1], input));
  const H = (parseHue(parts[2], input) * Math.PI) / 180;
  return oklabToSrgb(L, C * Math.cos(H), C * Math.sin(H), parseAlpha(alpha, input));
}

function parseOklab(parts, alpha, input) {
  const L = parseLightness(parts[0], input);
  const ab = (t) => (t.endsWith('%') ? (num(t, input) / 100) * 0.4 : num(t, input));
  return oklabToSrgb(L, ab(parts[1]), ab(parts[2]), parseAlpha(alpha, input));
}

// OKLab -> linear sRGB with Björn Ottosson's matrices, then per-channel clip (what browsers do).
function oklabToSrgb(L, a, b, alpha) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const eps = 2e-3; // tolerate rounding in published values such as oklch(62.8% 0.2577 29.23) for #f00
  const outOfGamut = lin.some((c) => c < -eps || c > 1 + eps);
  const [r, g, bl] = lin.map((c) => encodeSrgb(clamp(c, 0, 1)) * 255);
  const out = rgba(r, g, bl, alpha);
  if (outOfGamut) out.outOfGamut = true;
  return out;
}

// ---------- maths ----------

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function encodeSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function decodeSrgb(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of an opaque {r,g,b}. */
export function luminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => decodeSrgb(v / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Source-over composite of `top` onto `bottom` (bottom treated as opaque). */
export function composite(top, bottom) {
  const a = top.a;
  return rgba(top.r * a + bottom.r * (1 - a), top.g * a + bottom.g * (1 - a), top.b * a + bottom.b * (1 - a), 1);
}

/** Full analysis of a pair: ratio plus the opaque colors actually compared and any notes. */
export function analyzePair(fgInput, bgInput) {
  const notes = [];
  let bg = parseColor(bgInput);
  let fg = parseColor(fgInput);
  if (bg.outOfGamut) notes.push(`background ${bgInput} is outside sRGB; clamped`);
  if (fg.outOfGamut) notes.push(`foreground ${fgInput} is outside sRGB; clamped`);
  if (bg.a < 1) {
    notes.push(`background has alpha ${round(bg.a, 2)}; composited over white`);
    bg = composite(bg, NAMED_RGBA.white);
  }
  if (fg.a < 1) {
    notes.push(`foreground has alpha ${round(fg.a, 2)}; composited over the background`);
    fg = composite(fg, bg);
  }
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return { ratio: (hi + 0.05) / (lo + 0.05), fg: toHex(fg), bg: toHex(bg), notes };
}

const NAMED_RGBA = { white: rgba(255, 255, 255, 1) };

/** WCAG contrast ratio (1-21) between two colors (strings or parsed objects). */
export function contrastRatio(fg, bg) {
  return analyzePair(fg, bg).ratio;
}

export function toHex({ r, g, b, a = 1 }) {
  const h = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ''}`;
}

function round(v, d = 2) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

// Ratios are truncated, not rounded, so 4.499 is never shown as a passing 4.50.
function truncRatio(ratio) {
  return Math.floor(ratio * 100) / 100;
}

function fmtRatio(ratio) {
  return truncRatio(ratio).toFixed(2);
}

export function grade(ratio) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    ui: ratio >= 3,
  };
}

// ---------- token files ----------

/**
 * Parse CSS custom properties, grouped by scope ("<at-rule> <selector>").
 * Returns Map<scope, Map<name, rawValue>> in source order.
 */
export function parseTokens(css) {
  const scopes = new Map();
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const stack = [];
  let buf = '';
  const flushDecls = (text) => {
    const scope = stack.join(' ').trim() || ':root';
    for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) {
      if (!scopes.has(scope)) scopes.set(scope, new Map());
      scopes.get(scope).set(m[1], m[2].trim());
    }
  };
  for (const ch of src) {
    if (ch === '{') {
      // Text since the last ';' is the prelude; anything before it belongs to the parent block.
      const cut = buf.lastIndexOf(';');
      if (cut >= 0) flushDecls(buf.slice(0, cut + 1));
      stack.push(buf.slice(cut + 1).trim().replace(/\s+/g, ' '));
      buf = '';
    } else if (ch === '}') {
      flushDecls(buf);
      stack.pop();
      buf = '';
    } else {
      buf += ch;
    }
  }
  flushDecls(buf);
  return scopes;
}

// Resolve var(--x[, fallback]) a few levels deep and accept shadcn-style bare "H S% L%" triples.
function resolveToken(name, vars, depth = 0) {
  let value = vars.get(name);
  if (value === undefined) return null;
  if (depth > 4) return null;
  value = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (all, ref, fallback) => {
    const resolved = resolveToken(ref, vars, depth + 1);
    return resolved ?? fallback?.trim() ?? all;
  });
  value = value.replace(/\s*!important\s*$/, '').trim();
  if (/^-?[\d.]+(deg)?\s+[\d.]+%\s+[\d.]+%(\s*\/\s*[\d.]+%?)?$/.test(value)) value = `hsl(${value})`;
  return value;
}

/** Build the list of token pairs to check for one scope's resolved variables. */
export function tokenPairs(vars) {
  const pairs = [];
  const seen = new Set();
  const add = (fg, bg) => {
    const key = `${fg}|${bg}`;
    if (seen.has(key) || !vars.has(fg) || !vars.has(bg)) return;
    seen.add(key);
    pairs.push({ name: `${fg} on ${bg}`, fgToken: fg, bgToken: bg, use: 'text' });
  };
  for (const prefix of ['--', '--color-']) {
    add(`${prefix}foreground`, `${prefix}background`);
    add(`${prefix}muted-foreground`, `${prefix}background`);
    add(`${prefix}primary-foreground`, `${prefix}primary`);
  }
  for (const name of vars.keys()) {
    const m = name.match(/^(--.+)-foreground$/);
    if (m) add(name, m[1]);
  }
  return pairs;
}

/** Check every scope in a token file. Dark/@media scopes inherit tokens from the base :root scope. */
export function checkTokens(css) {
  const scopes = parseTokens(css);
  const baseKey = [...scopes.keys()].find((k) => /^(:root|html|@theme)/.test(k)) ?? [...scopes.keys()][0];
  const base = scopes.get(baseKey) ?? new Map();
  const rows = [];
  for (const [scope, own] of scopes) {
    const vars = scope === baseKey ? own : new Map([...base, ...own]);
    for (const pair of tokenPairs(vars)) {
      // In inherited scopes, only report pairs the scope actually overrides.
      if (scope !== baseKey && !own.has(pair.fgToken) && !own.has(pair.bgToken)) continue;
      const fg = resolveToken(pair.fgToken, vars);
      const bg = resolveToken(pair.bgToken, vars);
      rows.push(checkOne({ name: pair.name, fg, bg, use: pair.use, scope }));
    }
  }
  return rows;
}

function checkOne({ name, fg, bg, use = 'text', scope }) {
  const need = THRESHOLDS[use] ?? THRESHOLDS.text;
  const row = { name, scope, fg, bg, use, need };
  try {
    const res = analyzePair(fg, bg);
    Object.assign(row, { ratio: truncRatio(res.ratio), pass: res.ratio >= need, notes: res.notes });
  } catch (err) {
    Object.assign(row, { ratio: null, pass: false, error: err.message });
  }
  return row;
}

export function checkPairs(list) {
  return list.map((p, i) => checkOne({ name: p.name ?? `pair ${i + 1}`, fg: p.fg, bg: p.bg, use: p.use ?? 'text' }));
}

// ---------- output ----------

function table(rows, withScope) {
  const head = [...(withScope ? ['scope'] : []), 'pair', 'fg', 'bg', 'use', 'ratio', 'need', 'result'];
  const body = rows.map((r) => [
    ...(withScope ? [r.scope ?? ''] : []),
    r.name,
    String(r.fg ?? '—'),
    String(r.bg ?? '—'),
    r.use,
    r.ratio === null ? '—' : `${fmtRatio(r.ratio)}:1`,
    String(r.need),
    r.error ? `error: ${r.error}` : r.pass ? 'pass' : 'FAIL',
  ]);
  const widths = head.map((h, i) => Math.min(48, Math.max(h.length, ...body.map((row) => row[i].length))));
  const line = (cells) => cells.map((c, i) => (i === cells.length - 1 ? c : c.padEnd(widths[i]))).join('  ');
  return [line(head), line(widths.map((w) => '-'.repeat(w))), ...body.map(line)].join('\n');
}

function printSingle(fg, bg, use, asJson) {
  const res = analyzePair(fg, bg);
  const g = grade(res.ratio);
  const need = THRESHOLDS[use];
  const pass = res.ratio >= need;
  if (asJson) {
    console.log(JSON.stringify({ fg, bg, fgHex: res.fg, bgHex: res.bg, ratio: truncRatio(res.ratio), ...g, use, pass, notes: res.notes }, null, 2));
  } else {
    const mark = (ok) => (ok ? 'pass' : 'FAIL');
    console.log(`${fg} on ${bg}  →  ${fmtRatio(res.ratio)}:1`);
    console.log(`  AA normal text (4.5)  ${mark(g.aaNormal)}`);
    console.log(`  AA large text  (3)    ${mark(g.aaLarge)}`);
    console.log(`  AAA normal text (7)   ${mark(g.aaaNormal)}`);
    console.log(`  non-text UI    (3)    ${mark(g.ui)}`);
    for (const note of res.notes) console.log(`  note: ${note}`);
    if (use !== 'text') console.log(`  checked as: ${use} (needs ${need}:1) → ${mark(pass)}`);
  }
  return pass ? 0 : 1;
}

function printRows(rows, asJson, withScope) {
  const failed = rows.filter((r) => !r.pass);
  if (asJson) {
    console.log(JSON.stringify({ rows, failed: failed.length, total: rows.length }, null, 2));
  } else {
    console.log(table(rows, withScope));
    for (const r of rows) for (const note of r.notes ?? []) console.log(`note (${r.name}): ${note}`);
    console.log(`\n${rows.length - failed.length}/${rows.length} pass${failed.length ? `, ${failed.length} fail` : ''}`);
  }
  return failed.length ? 1 : 0;
}

function readInput(file) {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) throw new UserError(`file not found: ${abs}`, 2);
  return fs.readFileSync(abs, 'utf8');
}

class UserError extends Error {
  constructor(message, code = 2) {
    super(message);
    this.exitCode = code;
  }
}

export function main(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      pairs: { type: 'string' },
      tokens: { type: 'string' },
      use: { type: 'string', default: 'text' },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help) {
    console.log(HELP);
    return 0;
  }
  if (!THRESHOLDS[values.use]) throw new UserError(`--use must be text, large or ui (got "${values.use}")`);

  if (values.pairs) {
    let list;
    try {
      list = JSON.parse(readInput(values.pairs));
    } catch (err) {
      throw err instanceof UserError ? err : new UserError(`--pairs: invalid JSON (${err.message})`);
    }
    if (!Array.isArray(list)) throw new UserError('--pairs file must contain a JSON array of {name, fg, bg, use?}');
    return printRows(checkPairs(list), values.json, false);
  }

  if (values.tokens) {
    const rows = checkTokens(readInput(values.tokens));
    if (!rows.length) throw new UserError('--tokens: no checkable pairs found (need e.g. --foreground and --background)');
    return printRows(rows, values.json, true);
  }

  if (positionals.length !== 2) {
    console.error('usage: node contrast.mjs <fg> <bg>   (see --help)');
    return 2;
  }
  return printSingle(positionals[0], positionals[1], values.use, values.json);
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
    console.error(`contrast: ${err.message}`);
    process.exitCode = err.exitCode ?? 2;
  }
}
