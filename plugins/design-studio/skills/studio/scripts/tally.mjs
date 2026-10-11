#!/usr/bin/env node
// Turns one round's critique files into a compact ledger (ledger.json + ledger.md).

import fs from 'node:fs';
import path from 'node:path';
import {
  abs, filesIn, fmtScore, isDir, isFile, median, parseArgs, printJson, readBlocks,
  readJson, readText, run, isMain, str, userError, writeJson,
} from './_shared.mjs';

const HELP = `Usage: node tally.mjs --round <dir> [--prev <dir|ledger.json>] [--json]

Reads, inside the round dir:
  crit/*.md       role critiques, one \`\`\`json studio-findings block each
  panel/*.md      studio panel scores, one \`\`\`json studio-score block each (the gate)
  crosscrit/*.md  optional \`\`\`json studio-crosscrit responses
  lineup/result.json  optional, from lineup.mjs score
Any dir with that layout works (e.g. build/system-crit); missing subfolders are fine.
--prev is the previous round (or its ledger.json), for delta and plateau.

Writes <round>/ledger.json and <round>/ledger.md, prints the ledger path and a
short summary (--json prints the ledger). Exit 2 if no file has a valid block.

Rules: a critic with a blocker has their lens score capped at 5, with a major at 7.
Studio score = median of panel scores (fallback: median of role "overall").
Plateau = this delta and the previous delta both < 1.0.`;

const SEVERITIES = ['blocker', 'major', 'minor', 'polish'];
const SEVERITY_CAP = { blocker: 5, major: 7 };

const STOPWORDS = new Set(`a an the and or but of in on at to for with by from into onto over under
is are was were be been being it its this that these those there here as than then so very too
not no all any each every both some more most less our your their his her my we you they them
page site screen section area block part whole overall global everywhere throughout entire
desktop mobile tablet laptop viewport top bottom left right side`.split(/\s+/));

// --- text similarity -------------------------------------------------------

/** Significant words: lowercase, no punctuation, no stopwords, naive plural strip. */
export function tokens(text) {
  const words = String(text ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s-]+/gu, ' ').split(/[\s-]+/);
  const out = new Set();
  for (const w of words) {
    if (!w || STOPWORDS.has(w)) continue;
    out.add(w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
  }
  return out;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared / (a.size + b.size - shared);
}

const SIMILAR = 0.5;

// Opposing directions used to spot contradictory findings ("bigger" vs "smaller").
const OPPOSITES = [
  [['more', 'increase', 'raise', 'add', 'larger', 'bigger', 'grow', 'expand', 'louder', 'stronger', 'heavier', 'bolder', 'emphasize', 'emphasise'],
    ['less', 'fewer', 'decrease', 'reduce', 'lower', 'remove', 'cut', 'drop', 'smaller', 'shrink', 'quieter', 'softer', 'weaker', 'thinner', 'lighter', 'deemphasize', 'deemphasise', 'tone']],
  [['darker', 'darken'], ['lighter', 'lighten', 'brighter', 'brighten']],
  [['wider', 'widen', 'looser', 'loosen', 'airier', 'sparser', 'spacious'], ['narrower', 'narrow', 'tighter', 'tighten', 'denser', 'compress', 'condense']],
];

function directions(text) {
  const words = new Set(String(text ?? '').toLowerCase().split(/[^a-z]+/));
  return OPPOSITES.map(([up, down]) => {
    const u = up.some((w) => words.has(w));
    const d = down.some((w) => words.has(w));
    return u === d ? 0 : u ? 1 : -1;
  });
}

function contradicts(f, g) {
  const a = directions(`${f.title} ${f.target}`);
  const b = directions(`${g.title} ${g.target}`);
  return a.some((v, i) => v !== 0 && v === -b[i]);
}

// --- reading inputs ---------------------------------------------------------

function readDirBlocks(dir, tag, warnings) {
  const out = [];
  for (const file of filesIn(dir, (n) => n.toLowerCase().endsWith('.md'))) {
    const blocks = readBlocks(readText(file) ?? '', tag);
    const block = blocks.find((b) => b.data && typeof b.data === 'object' && !Array.isArray(b.data));
    if (block) out.push({ file, data: block.data });
    else warnings.push({ file, reason: blocks.length ? `invalid JSON in ${tag} block (${blocks[0].error})` : `no \`\`\`json ${tag} block` });
  }
  return out;
}

const asNumber = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null);
const asList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);
const asText = (v) => (v === undefined || v === null ? '' : String(v).trim());
const roleSlug = (v) => asText(v).toLowerCase().replace(/^@/, '').replace(/[\s_&]+/g, '-').replace(/-+/g, '-');

function normalizeCritic({ file, data }) {
  const role = roleSlug(data.role) || path.basename(file, '.md');
  const instance = asText(data.instance);
  const label = instance ? `${role}[${instance}]` : role;
  const findings = asList(data.findings)
    .filter((f) => f && typeof f === 'object')
    .map((f, i) => {
      const severity = asText(f.severity).toLowerCase();
      return {
        id: asText(f.id) || `${label}#${i + 1}`,
        severity: SEVERITIES.includes(severity) ? severity : 'minor',
        title: asText(f.title),
        where: asText(f.where),
        evidence: asText(f.evidence),
        principle: asText(f.principle),
        target: asText(f.target),
        confidence: asText(f.confidence) || null,
        touches: asList(f.touches).map(roleSlug).filter(Boolean),
        critic: label,
        role,
      };
    });
  const scores = data.scores && typeof data.scores === 'object' ? data.scores : {};
  const raw = asNumber(scores.lens);
  const cap = findings.some((f) => f.severity === 'blocker') ? SEVERITY_CAP.blocker
    : findings.some((f) => f.severity === 'major') ? SEVERITY_CAP.major : null;
  const ranked = sortBySeverity(findings);
  return {
    label,
    role,
    instance: instance || null,
    file,
    lens: { raw, capped: raw === null ? null : cap === null ? raw : Math.min(raw, cap), cap },
    overall: asNumber(scores.overall),
    rubric: scores.rubric && typeof scores.rubric === 'object' ? scores.rubric : {},
    verdict: asText(data.verdict) || null,
    findings,
    topFinding: ranked[0] ? { id: ranked[0].id, severity: ranked[0].severity, title: ranked[0].title } : null,
    keep: asList(data.keep).map(asText).filter(Boolean),
    tells: asList(data.tells).map(asText).filter(Boolean),
  };
}

function normalizePanel({ file, data }) {
  return {
    critic: asText(data.critic) || path.basename(file, '.md'),
    file,
    score: asNumber(data.score),
    desktop: asNumber(data.desktop),
    mobile: asNumber(data.mobile),
    verdict: asText(data.verdict) || null,
    intent_match: asText(data.intent_match) || null,
    first_impression: asText(data.first_impression) || null,
    gaps: asList(data.gaps)
      .map((g) => (typeof g === 'string' ? { gap: g } : g))
      .filter((g) => g && typeof g === 'object' && asText(g.gap))
      .map((g) => ({ gap: asText(g.gap), where: asText(g.where), fix: asText(g.fix) })),
    keep: asList(data.keep).map(asText).filter(Boolean),
    tells: asList(data.tells).map(asText).filter(Boolean),
    a11y: asList(data.a11y).map(asText).filter(Boolean),
  };
}

// --- analysis ---------------------------------------------------------------

const severityRank = (s) => SEVERITIES.indexOf(s);

function sortBySeverity(findings) {
  return findings.slice().sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
}

function countBy(items, keyFn) {
  const out = {};
  for (const item of items) {
    const k = keyFn(item);
    if (k) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/**
 * Greedy clustering: each item joins the first cluster whose seed is similar
 * (Jaccard >= 0.5) and comes from a different author; otherwise it seeds a new one.
 * Seeds never chain, so clusters stay tight.
 */
function cluster(items, tokensOf, authorOf) {
  const clusters = [];
  for (const item of items) {
    const t = tokensOf(item);
    const home = t.size
      ? clusters.find((c) => !c.authors.has(authorOf(item)) && jaccard(c.tokens, t) >= SIMILAR)
      : null;
    if (home) {
      home.items.push(item);
      home.authors.add(authorOf(item));
    } else {
      clusters.push({ tokens: t, items: [item], authors: new Set([authorOf(item)]) });
    }
  }
  return clusters;
}

function consensusOf(findings) {
  return cluster(sortBySeverity(findings), (f) => tokens(f.where), (f) => f.critic)
    .filter((c) => c.authors.size >= 2)
    .map((c) => ({
      where: c.items[0].where,
      severity: c.items[0].severity,
      title: c.items[0].title,
      critics: [...c.authors],
      ids: c.items.map((f) => f.id),
      titles: c.items.map((f) => f.title),
      count: c.authors.size,
    }))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || b.count - a.count);
}

function conflictsOf(findings, crosscrit) {
  const byId = new Map();
  for (const f of findings) if (!byId.has(f.id)) byId.set(f.id, f);
  const out = [];
  for (const { data } of crosscrit) {
    const from = roleSlug(data.role) || null;
    for (const r of asList(data.responses)) {
      const stance = asText(r && r.stance).toUpperCase();
      if (stance !== 'CHALLENGE' && stance !== 'CONFLICT') continue;
      const f = byId.get(asText(r.to));
      out.push({
        kind: 'crosscrit',
        from,
        stance,
        to: asText(r.to),
        reason: asText(r.reason),
        counter: asText(r.counter),
        finding: f ? { id: f.id, critic: f.critic, severity: f.severity, title: f.title, where: f.where } : null,
      });
    }
  }
  // A finding that touches another role which raised an opposing finding at the same place.
  const seen = new Set();
  for (const f of findings) {
    for (const g of findings) {
      if (g.critic === f.critic || !f.touches.includes(g.role)) continue;
      if (jaccard(tokens(f.where), tokens(g.where)) < SIMILAR || !contradicts(f, g)) continue;
      const pair = [f.critic + f.id, g.critic + g.id].sort().join('|');
      if (seen.has(pair)) continue;
      seen.add(pair);
      out.push({
        kind: 'touches',
        where: f.where,
        a: { id: f.id, critic: f.critic, title: f.title, target: f.target },
        b: { id: g.id, critic: g.critic, title: g.title, target: g.target },
      });
    }
  }
  return out;
}

/** Union of strings, deduped case- and punctuation-insensitively, first spelling wins. */
function union(lists) {
  const seen = new Map();
  for (const item of lists.flat()) {
    const k = item.toLowerCase().replace(/\s+/g, ' ').replace(/[\s.!;:,]+$/, '');
    if (k && !seen.has(k)) seen.set(k, item);
  }
  return [...seen.values()];
}

function studioScore(panel, critics) {
  const scored = panel.filter((p) => p.score !== null);
  if (scored.length) {
    const scores = scored.map((p) => p.score);
    return {
      score: median(scores),
      spread: Math.max(...scores) - Math.min(...scores),
      n: scored.length,
      source: 'panel',
      desktop: median(scored.map((p) => p.desktop)),
      mobile: median(scored.map((p) => p.mobile)),
      verdicts: countBy(scored, (p) => p.verdict),
      intentMatch: countBy(scored, (p) => p.intent_match),
    };
  }
  const overall = critics.map((c) => c.overall).filter((v) => v !== null);
  return {
    score: median(overall),
    spread: overall.length ? Math.max(...overall) - Math.min(...overall) : null,
    n: overall.length,
    source: overall.length ? 'roles' : null,
  };
}

function panelGapsOf(panel, studioMedian) {
  const scored = panel.filter((p) => p.score !== null);
  if (!scored.length) return [];
  // The critique whose score sits closest to the median (first one on ties).
  const mid = scored.reduce((best, p) => (Math.abs(p.score - studioMedian) < Math.abs(best.score - studioMedian) ? p : best));
  const gaps = panel.flatMap((p) => p.gaps.map((g) => ({ ...g, critic: p.critic })));
  // Seed clusters with the median critique's gaps so they lead.
  gaps.sort((a, b) => (b.critic === mid.critic) - (a.critic === mid.critic));
  return cluster(gaps, (g) => tokens(`${g.where} ${g.gap}`), (g) => g.critic)
    .filter((c) => c.authors.has(mid.critic) || c.authors.size >= 2)
    .map((c) => ({ ...c.items[0], critic: undefined, critics: [...c.authors], shared: c.authors.size >= 2 }))
    .sort((a, b) => b.critics.length - a.critics.length);
}

function readPrev(prevArg, warnings) {
  if (!prevArg) return null;
  const p = abs(prevArg);
  const file = isDir(p) ? path.join(p, 'ledger.json') : p;
  const prev = readJson(file);
  if (!prev) {
    warnings.push({ file, reason: 'previous ledger not found or unreadable; delta and plateau skipped' });
    return null;
  }
  return prev;
}

function readLineup(roundDir) {
  const r = readJson(path.join(roundDir, 'lineup', 'result.json'));
  if (!r || r.ourMedianRank === undefined) return null;
  return {
    ourMedianRank: r.ourMedianRank,
    n: r.n ?? null,
    firstByMajority: !!r.firstByMajority,
    size: r.size ?? null,
    best: r.bestOurs ? r.bestOurs.label : null,
    oursCount: r.oursCount ?? 1,
  };
}

/** "rounds/03" for a session round, else the dir relative to its session, else its name. */
function labelFor(dir) {
  for (let d = dir; path.dirname(d) !== d; d = path.dirname(d)) {
    if (path.basename(path.dirname(d)) === 'sessions') return path.relative(d, dir).split(path.sep).join('/') || path.basename(dir);
  }
  return path.basename(path.dirname(dir)) === 'rounds' ? `rounds/${path.basename(dir)}` : path.basename(dir);
}

export function buildLedger(roundDir, prevArg) {
  const warnings = [];
  const critics = readDirBlocks(path.join(roundDir, 'crit'), 'studio-findings', warnings).map(normalizeCritic);
  const panel = readDirBlocks(path.join(roundDir, 'panel'), 'studio-score', warnings).map(normalizePanel);
  const crosscrit = readDirBlocks(path.join(roundDir, 'crosscrit'), 'studio-crosscrit', warnings);
  if (!critics.length && !panel.length) return { ledger: null, warnings };

  const findings = critics.flatMap((c) => c.findings);
  const studio = studioScore(panel, critics);
  const prev = readPrev(prevArg, warnings);
  const prevScore = prev && prev.studio ? asNumber(prev.studio.score) : null;
  const delta = studio.score !== null && prevScore !== null ? Math.round((studio.score - prevScore) * 100) / 100 : null;
  const prevDelta = prev ? asNumber(prev.delta) : null;
  if (prev && prev.studio && prev.studio.source && studio.source && prev.studio.source !== studio.source) {
    warnings.push({ file: '(prev)', reason: `previous score came from ${prev.studio.source}, this one from ${studio.source}; delta mixes sources` });
  }
  const ledger = {
    round: labelFor(roundDir),
    path: roundDir,
    generatedAt: new Date().toISOString(),
    studio,
    prevScore,
    delta,
    prevDelta,
    plateau: delta !== null && prevDelta !== null && delta < 1 && prevDelta < 1,
    lineup: readLineup(roundDir),
    counts: {
      severity: Object.fromEntries(SEVERITIES.map((s) => [s, findings.filter((f) => f.severity === s).length])),
      verdicts: countBy(critics, (c) => c.verdict),
      findings: findings.length,
      critics: critics.length,
      panel: panel.length,
    },
    lanes: critics.map((c) => ({ critic: c.label, role: c.role, instance: c.instance, raw: c.lens.raw, capped: c.lens.capped, cap: c.lens.cap })),
    critics: critics.map(({ findings: _f, keep: _k, tells: _t, ...c }) => c),
    panel: panel.map(({ gaps: _g, keep: _k, tells: _t, ...p }) => p),
    panelGaps: panelGapsOf(panel, studio.score),
    consensus: consensusOf(findings),
    conflicts: conflictsOf(findings, crosscrit),
    keep: union([...critics.map((c) => c.keep), ...panel.map((p) => p.keep)]),
    tells: union([...critics.map((c) => c.tells), ...panel.map((p) => p.tells)]),
    a11y: union(panel.map((p) => p.a11y)),
    findings,
    warnings: warnings.map((w) => `${path.relative(roundDir, w.file) || w.file}: ${w.reason}`),
  };
  return { ledger, warnings };
}

// --- markdown ---------------------------------------------------------------

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const clip = (s, n = 90) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const signed = (n) => (n === null ? '–' : (n > 0 ? '+' : n < 0 ? '−' : '±') + fmtScore(Math.abs(n)));

function capped(items, max, render) {
  const lines = items.slice(0, max).map(render);
  if (items.length > max) lines.push(`- +${items.length - max} more in ledger.json`);
  return lines.length ? lines : ['- none'];
}

export function renderMarkdown(l) {
  const s = l.studio;
  const sev = l.counts.severity;
  const verdicts = Object.entries(l.counts.verdicts).map(([k, v]) => `${k} ${v}`).join(', ') || 'none';
  const lineup = l.lineup
    ? `lineup rank ${fmtScore(l.lineup.ourMedianRank)}${l.lineup.size ? ` of ${l.lineup.size}` : ''} (${l.lineup.n} jurors${l.lineup.oursCount > 1 && l.lineup.best ? `, best of ours ${l.lineup.best}` : ''}${l.lineup.firstByMajority ? ', first by majority' : ''})`
    : 'no lineup';
  const source = s.source === 'panel' ? 'panel median' : s.source === 'roles' ? 'role median, no panel' : 'no scores';
  const out = [
    `# Ledger: ${l.round}`,
    '',
    `**Studio ${fmtScore(s.score)}** (${source}, n ${s.n}, spread ${fmtScore(s.spread)}) · delta ${signed(l.delta)} · plateau ${l.plateau ? 'yes' : 'no'} · ${lineup}`,
    `Findings: ${sev.blocker} blocker · ${sev.major} major · ${sev.minor} minor · ${sev.polish} polish · role verdicts: ${verdicts}`,
  ];
  if (s.source === 'panel') {
    const intent = Object.entries(s.intentMatch).map(([k, v]) => `${k} ${v}`).join(', ') || '–';
    out.push(`Panel: desktop ${fmtScore(s.desktop)} · mobile ${fmtScore(s.mobile)} · intent match ${intent}`);
  }

  out.push('', '## Critics', '| Critic | Lens raw→capped | Overall | Verdict | Top finding |', '|---|---|---|---|---|');
  for (const c of l.critics.slice(0, 12)) {
    const lens = c.lens.raw === null ? '–' : c.lens.cap !== null && c.lens.raw > c.lens.cap ? `${fmtScore(c.lens.raw)}→${fmtScore(c.lens.capped)}` : fmtScore(c.lens.raw);
    const top = c.topFinding ? `${c.topFinding.severity} ${c.topFinding.id}: ${clip(c.topFinding.title, 60)}` : '–';
    out.push(`| ${cell(c.label)} | ${lens} | ${fmtScore(c.overall)} | ${cell(c.verdict ?? '–')} | ${cell(top)} |`);
  }
  if (!l.critics.length) out.push('| (no role critiques) | | | | |');

  out.push('', '## Panel gaps');
  out.push(...capped(l.panelGaps, 6, (g) => `- ${clip(g.gap)}${g.where ? ` (${clip(g.where, 40)})` : ''}${g.fix ? ` → ${clip(g.fix, 70)}` : ''} · ${g.critics.join(', ')}`));

  out.push('', '## Consensus');
  out.push(...capped(l.consensus, 8, (c) => `- **${c.severity}** ${clip(c.where, 40)}: ${clip(c.title, 70)} · ${c.ids.join(', ')} (${c.count} critics)`));

  out.push('', '## Conflicts to rule on');
  out.push(...capped(l.conflicts, 8, (c) => (c.kind === 'crosscrit'
    ? `- ${c.to}${c.finding ? ` (${c.finding.critic}: ${clip(c.finding.title, 50)})` : ''} ${c.stance} by ${c.from ?? '?'}: ${clip(c.reason, 70)}${c.counter ? ` → ${clip(c.counter, 50)}` : ''}`
    : `- ${c.a.id} (${c.a.critic}) vs ${c.b.id} (${c.b.critic}) at ${clip(c.where, 40)}: "${clip(c.a.title, 40)}" vs "${clip(c.b.title, 40)}"`)));

  out.push('', '## Keep');
  out.push(...capped(l.keep, 5, (k) => `- ${clip(k, 110)}`));
  out.push('', '## Tells seen');
  out.push(...capped(l.tells, 5, (t) => `- ${clip(t, 110)}`));
  return out.join('\n') + '\n';
}

// --- CLI --------------------------------------------------------------------

export async function main(argv) {
  const { flags } = parseArgs(argv);
  if (flags.help) { console.log(HELP); return 0; }
  const roundArg = str(flags, 'round', { required: true });
  const roundDir = abs(roundArg);
  if (!isDir(roundDir)) throw userError(`round dir not found: ${roundDir}`);

  const { ledger, warnings } = buildLedger(roundDir, str(flags, 'prev'));
  if (!ledger) {
    const lines = warnings.map((w) => `  ${w.file}: ${w.reason}`);
    throw userError(`no valid critique blocks in ${path.join(roundDir, 'crit')} or ${path.join(roundDir, 'panel')}${lines.length ? `\n${lines.join('\n')}` : ' (no .md files)'}`);
  }

  const jsonPath = path.join(roundDir, 'ledger.json');
  const mdPath = path.join(roundDir, 'ledger.md');
  writeJson(jsonPath, ledger);
  fs.writeFileSync(mdPath, renderMarkdown(ledger));

  if (flags.json) { printJson(ledger); return 0; }
  const s = ledger.studio;
  const sev = ledger.counts.severity;
  const lines = [
    mdPath,
    `Studio ${fmtScore(s.score)} (${s.source ?? 'none'}, n ${s.n}, spread ${fmtScore(s.spread)}) · delta ${signed(ledger.delta)} · plateau ${ledger.plateau ? 'yes' : 'no'}${ledger.lineup ? ` · lineup ${fmtScore(ledger.lineup.ourMedianRank)}${ledger.lineup.size ? `/${ledger.lineup.size}` : ''}` : ''}`,
    `Findings: ${sev.blocker} blocker, ${sev.major} major, ${sev.minor} minor, ${sev.polish} polish · ${ledger.consensus.length} consensus · ${ledger.conflicts.length} conflicts`,
  ];
  if (ledger.warnings.length) lines.push(`Skipped ${ledger.warnings.length}: ${clip(ledger.warnings.join('; '), 200)}`);
  console.log(lines.join('\n'));
  return 0;
}

if (isMain(import.meta.url)) run(main);
