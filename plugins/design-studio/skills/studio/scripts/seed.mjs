#!/usr/bin/env node
// Divergence from outside the model.
//
// Adapted from the "String Seed of Thought" technique (Sakana AI), as described by
// Anshu Chimala in Lenny's Newsletter, and credited to the world-class-designer skill.
// A model asked for "three different directions" converges on its own favourites; a
// random string from crypto, mapped deterministically onto design axes, does not.

import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HELP = `seed.mjs — random design directions and designer stances

Usage:
  node seed.mjs roll [--n 3] [--neighbors 0] [--json]
  node seed.mjs pick --seed <string> [--json]       re-derive the axes from a saved seed string
  node seed.mjs stances --n <N> [--json]            N distinct stances for same-role designers (max 5)

roll draws a 96-character string per direction from crypto.randomBytes and maps disjoint
4-character groups onto nine axes (era, material, palette, type voice, layout, motion,
imagery, density, wildcard). --neighbors k adds k variants per direction that change 1-2 axes.

Let the roll pick even when it feels wrong; read the row as a coherent world, not a checklist; never put the string in the design.`;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const SEED_LENGTH = 96;
const GROUP = 4;

export const AXES = [
  {
    key: 'era',
    label: 'Era / reference period',
    options: [
      '1920s Bauhaus workshop',
      '1950s Swiss International Style',
      '1960s space-age optimism',
      '1970s public-television graphics',
      '1980s Memphis and the first Macintosh',
      '1990s rave flyers and the early web',
      'Victorian broadsheets and type specimen books',
      'mid-century airline and travel posters',
      'Y2K chrome and translucent plastic',
      'near-future civic infrastructure',
    ],
  },
  {
    key: 'material',
    label: 'Material / surface',
    options: [
      'uncoated paper with visible tooth',
      'brushed aluminum and machined edges',
      'frosted glass over color fields',
      'risograph ink with misregistration',
      'matte ceramic and soft daylight',
      'terminal phosphor on black glass',
      'kraft card and rubber-stamped ink',
      'enamel signage, flat and glossy',
      'linen-backed museum labels',
    ],
  },
  {
    key: 'palette',
    label: 'Palette logic',
    options: [
      'one ink on paper',
      'two complementary darks',
      'high-chroma single accent on neutrals',
      'tonal monochrome: five steps of one hue',
      'earth pigments, no pure white',
      'safety colors: black, white and one warning hue',
      'pastel field with one deep anchor',
      'duotone imagery carries all the color',
      'near-black ground, light text, one warm highlight',
    ],
  },
  {
    key: 'type',
    label: 'Type voice',
    options: [
      'grotesk set large and tight',
      'humanist serif, bookish and calm',
      'monospace everywhere, like a field manual',
      'condensed display caps over a quiet text face',
      'geometric sans, airy and precise',
      'high-contrast didone headlines',
      'slab serif, sturdy and municipal',
      'one family, many weights',
      'hand lettering for exactly one moment',
    ],
  },
  {
    key: 'layout',
    label: 'Layout logic',
    options: [
      'editorial columns',
      'single axis',
      'modular grid with one broken cell',
      'list-first',
      'asymmetric split, heavy left',
      'full-bleed bands stacked like chapters',
      'the index or table of contents is the page',
      'centered poster, one thing per screen',
      'main column with margin notes',
    ],
  },
  {
    key: 'motion',
    label: 'Motion character',
    options: [
      'none: everything is still',
      'mechanical: snaps and ticks, no easing',
      'slow dissolves, like film',
      'springy and physical',
      'scroll-linked, paced to reading',
      'one signature motion, used once',
      'letters move, boxes do not',
      'instant, with one satisfying confirmation',
    ],
  },
  {
    key: 'imagery',
    label: 'Imagery mode',
    options: [
      'no images: typography carries the page',
      'documentary photography, uncropped',
      'technical diagrams and exploded views',
      'flat pictograms in the spirit of Otl Aicher',
      'macro texture close-ups',
      'data as image: charts, maps, timelines',
      'objects on seamless backgrounds',
      'found ephemera: tickets, receipts, labels',
      'abstract geometry built from the grid',
    ],
  },
  {
    key: 'density',
    label: 'Density',
    options: [
      'sparse: one idea per screen',
      'airy but structured',
      'medium, newspaper-calm',
      'dense, like a trading terminal',
      'dense, like a reference book',
      'uneven: dense core, empty edges',
    ],
  },
  {
    key: 'wildcard',
    label: 'Wildcard constraint',
    options: [
      'no rounded corners',
      'everything is a list',
      'one color only',
      'type is the image',
      'sound has a role',
      'no icons',
      'one text size besides the headline',
      'every number is the hero',
      'the grid is visible',
      'nothing is centered',
    ],
  },
];

export const STANCES = [
  { key: 'refiner', name: 'Refiner', brief: 'Best-in-class execution of the conventions. Win on craft, not novelty.' },
  { key: 'provocateur', name: 'Provocateur', brief: 'Break one fundamental convention of this kind of product, and state the reason it earns.' },
  { key: 'outsider', name: 'Outsider', brief: 'Transplant one working mechanism from another discipline and make it native here.' },
  { key: 'minimalist', name: 'Minimalist', brief: 'The least that works. Remove until it breaks, then put back one thing.' },
  { key: 'maximalist', name: 'Maximalist', brief: 'Spend the whole novelty budget in one place; keep everything else quiet.' },
];

export const DISCIPLINES = [
  'print editorial',
  'architecture',
  'wayfinding and signage',
  'film title sequences',
  'game UI',
  'industrial and product design',
  'music packaging',
  'cartography',
  'scientific publishing',
  'fashion',
];

/** A uniformly random string over [A-Za-z0-9] (rejection sampling avoids modulo bias). */
export function randomSeed(length = SEED_LENGTH) {
  let out = '';
  while (out.length < length) {
    for (const byte of crypto.randomBytes(length * 2)) {
      if (byte < 248) out += ALPHABET[byte % 62]; // 248 = 4 * 62
      if (out.length === length) break;
    }
  }
  return out;
}

/** Sum of char codes of the 4-char group at `index`. */
function groupValue(seed, index) {
  let sum = 0;
  for (const ch of seed.slice(index * GROUP, index * GROUP + GROUP)) sum += ch.charCodeAt(0);
  return sum;
}

/**
 * Deterministically map a seed string to one option per axis.
 * Axis i reads the disjoint group seed[4i .. 4i+3]: (sum of char codes) mod (number of options).
 */
export function pick(seed) {
  if (typeof seed !== 'string' || seed.length < AXES.length * GROUP) {
    throw new Error(`seed must be a string of at least ${AXES.length * GROUP} characters`);
  }
  const picks = AXES.map((axis, i) => {
    const index = groupValue(seed, i) % axis.options.length;
    return { axis: axis.key, label: axis.label, index, option: axis.options[index], group: seed.slice(i * GROUP, i * GROUP + GROUP) };
  });
  return { seed, picks };
}

/** A variant of `direction` with 1-2 axes moved to a different option (fresh crypto randomness). */
export function neighbor(direction) {
  const count = crypto.randomInt(1, 3);
  const axes = shuffle(AXES.map((_, i) => i)).slice(0, count);
  const picks = direction.picks.map((p) => ({ ...p }));
  const changed = [];
  for (const i of axes) {
    const n = AXES[i].options.length;
    const index = (picks[i].index + crypto.randomInt(1, n)) % n;
    changed.push({ axis: picks[i].axis, from: picks[i].option, to: AXES[i].options[index] });
    Object.assign(picks[i], { index, option: AXES[i].options[index], group: null });
  }
  return { changed, picks };
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function roll(n = 3, neighbors = 0) {
  return Array.from({ length: n }, (_, i) => {
    const dir = pick(randomSeed());
    return { direction: i + 1, ...dir, neighbors: Array.from({ length: neighbors }, () => neighbor(dir)) };
  });
}

export function sampleStances(n) {
  if (n > STANCES.length) throw new Error(`at most ${STANCES.length} distinct stances (asked for ${n})`);
  return shuffle(STANCES)
    .slice(0, n)
    .map((s) => (s.key === 'outsider' ? { ...s, discipline: DISCIPLINES[crypto.randomInt(0, DISCIPLINES.length)] } : { ...s }));
}

// ---------- output ----------

function directionMarkdown(d) {
  const lines = [`### Direction ${d.direction ?? ''}`.trimEnd(), '', `seed: \`${d.seed}\``, ''];
  for (const p of d.picks) lines.push(`- **${p.label}:** ${p.option}`);
  (d.neighbors ?? []).forEach((nb, i) => {
    const moves = nb.changed.map((c) => `${c.axis} → ${c.to}`).join('; ');
    lines.push(`- _Neighbor ${i + 1}:_ ${moves}`);
  });
  return lines.join('\n');
}

function stancesMarkdown(list) {
  return list
    .map((s, i) => `${i + 1}. **${s.name}:** ${s.brief}${s.discipline ? ` Discipline: **${s.discipline}**.` : ''}`)
    .join('\n');
}

function toInt(value, name, min) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min) throw new UsageError(`--${name} must be an integer ≥ ${min}`);
  return n;
}

class UsageError extends Error {}

export function main(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      n: { type: 'string' },
      neighbors: { type: 'string', default: '0' },
      seed: { type: 'string' },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const cmd = positionals[0];
  if (values.help || !cmd) {
    console.log(HELP);
    return values.help ? 0 : 2;
  }

  if (cmd === 'roll') {
    const dirs = roll(toInt(values.n ?? 3, 'n', 1), toInt(values.neighbors, 'neighbors', 0));
    if (values.json) console.log(JSON.stringify({ directions: dirs }, null, 2));
    else console.log(dirs.map(directionMarkdown).join('\n\n'));
    return 0;
  }

  if (cmd === 'pick') {
    if (!values.seed) throw new UsageError('pick needs --seed <string>');
    const dir = pick(values.seed);
    if (values.json) console.log(JSON.stringify(dir, null, 2));
    else console.log(directionMarkdown(dir));
    return 0;
  }

  if (cmd === 'stances') {
    if (values.n === undefined) throw new UsageError('stances needs --n <N>');
    const list = sampleStances(toInt(values.n, 'n', 1));
    if (values.json) console.log(JSON.stringify({ stances: list }, null, 2));
    else console.log(stancesMarkdown(list));
    return 0;
  }

  throw new UsageError(`unknown subcommand "${cmd}" (roll, pick, stances)`);
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
    console.error(`seed: ${err.message}`);
    process.exitCode = 2;
  }
}
