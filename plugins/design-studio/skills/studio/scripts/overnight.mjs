#!/usr/bin/env node
// Driver for long, cheap, unattended champion-vs-challenger loops.
// Each step is one headless host run in a fresh process (fresh context); all state lives on disk.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  abs, fmtScore, isDir, num, parseArgs, referenceImages, printJson, readJson, readText, run, isMain, str, userError, writeJson,
} from './_shared.mjs';
import { buildGallery, scoreHistory } from './gallery.mjs';

const HELP = `Usage: node overnight.mjs --session <dir> --host claude|codex [flags]

Runs one "overnight-step" of the studio skill per fresh headless process until
a stop condition holds, then rebuilds the gallery and prints a summary.

  --steps <n>       max steps this run (default 30)
  --hours <h>       stop starting new steps after h hours (default 8)
  --max-usd <usd>   stop when the summed step cost reaches this (default 25; Claude only)
  --plateau <n>     stop when the champion is unchanged for n steps (default 5)
  --model <id>      model for the host CLI
  --dry-run         print the commands and exit
  --json            final summary as JSON (step lines go to stderr)

Also stops when a step fails twice in a row, or when overnight/champion.json
says "done": true. One step before a plateau stop it writes {"diverge": true}
to overnight/next.json so the next challenger is a divergent variation.
Ctrl-C finishes the logs and exits; press it twice to quit at once.

Writes overnight/history.jsonl (one JSON line per step), overnight/overnight.log
and overnight/steps/<n>.log (the host's output). Runs the host from the project
root (the folder holding .design-studio/).`;

const ALLOWED_TOOLS = 'Read,Write,Edit,Glob,Grep,Agent,Bash(node *)';
const GRACE_MS = 20 * 60 * 1000; // a step still running this long after --hours is stopped
const MAX_CAPTURE = 4 * 1024 * 1024;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

/** The host command for one step, as argv (no shell involved). */
export function stepCommand({ host, session, model }) {
  if (host === 'claude') {
    return {
      cmd: 'claude',
      args: ['-p', `/design-studio:studio overnight-step session=${session}`, '--output-format', 'json',
        '--permission-mode', 'acceptEdits', '--allowedTools', ALLOWED_TOOLS, ...(model ? ['--model', model] : [])],
    };
  }
  return { cmd: 'codex', args: ['exec', '--full-auto', ...(model ? ['--model', model] : []), `$design-studio:studio overnight-step session=${session}`] };
}

/** POSIX-shell quoting for display: bare when safe, else single quotes. */
export function shellQuote(arg) {
  return /^[A-Za-z0-9_\/.,:=@%+-]+$/.test(arg) ? arg : `'${arg.replace(/'/g, `'\\''`)}'`;
}

const shellLine = ({ cmd, args }) => [cmd, ...args].map(shellQuote).join(' ');

/** The project root: the folder that holds .design-studio/, else the cwd. */
function projectRoot(session) {
  for (let d = session; path.dirname(d) !== d; d = path.dirname(d)) {
    if (path.basename(d) === '.design-studio') return path.dirname(d);
  }
  return process.cwd();
}

/**
 * Pull cost and error state out of `claude -p --output-format json` stdout.
 * Tolerates a single result object, an array of messages, or extra lines.
 */
export function parseClaudeOutput(stdout) {
  const candidates = [];
  const text = String(stdout ?? '').trim();
  try { candidates.push(JSON.parse(text)); } catch {
    for (const line of text.split(/\r?\n/).reverse()) {
      try { candidates.push(JSON.parse(line)); break; } catch { /* keep looking */ }
    }
  }
  let result = candidates[0];
  if (Array.isArray(result)) result = result.filter((m) => m && m.type === 'result').pop() ?? result[result.length - 1];
  if (!result || typeof result !== 'object') return { costUsd: null, isError: null };
  const cost = result.total_cost_usd ?? result.cost_usd;
  return { costUsd: typeof cost === 'number' && Number.isFinite(cost) ? cost : null, isError: typeof result.is_error === 'boolean' ? result.is_error : null };
}

function readHistory(file) {
  return (readText(file) ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

const championKey = (c) => (c && c.champion ? `${c.champion}|${c.since_step ?? ''}` : null);

/** Set or clear the diverge hint, keeping any other keys the skill stored in next.json. */
function setDiverge(file, on, extra = {}) {
  const current = readJson(file);
  if (!on && !(current && current.diverge)) return;
  writeJson(file, { ...(current && typeof current === 'object' ? current : {}), diverge: on, ...extra });
}

// --- running one step ------------------------------------------------------------

let activeChild = null;

function runStep(command, { cwd, logFile, killAt, parseCost }) {
  return new Promise((resolve) => {
    let out = '';
    let err = '';
    let timedOut = false;
    const keep = (buf, chunk) => (buf.length > MAX_CAPTURE ? buf : buf + chunk);
    const child = spawn(command.cmd, command.args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    activeChild = child;
    child.stdout.on('data', (d) => { out = keep(out, d.toString()); });
    child.stderr.on('data', (d) => { err = keep(err, d.toString()); });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 10_000).unref();
    }, Math.max(1000, killAt - Date.now()));
    const done = (result) => {
      clearTimeout(timer);
      activeChild = null;
      fs.mkdirSync(path.dirname(logFile), { recursive: true });
      fs.writeFileSync(logFile, `$ ${shellLine(command)}\n\n--- stdout ---\n${out}\n--- stderr ---\n${err}\n`);
      resolve(result);
    };
    child.on('error', (e) => done({
      ok: false, fatal: e.code === 'ENOENT', costUsd: null,
      error: e.code === 'ENOENT' ? `${command.cmd} not found on PATH` : e.message,
    }));
    child.on('close', (code, signal) => {
      const parsed = parseCost ? parseClaudeOutput(out) : { costUsd: null, isError: null };
      const ok = code === 0 && parsed.isError !== true && !timedOut;
      const why = timedOut ? 'stopped: still running after the time limit'
        : signal ? `killed by ${signal}` : code !== 0 ? `exit ${code}` : parsed.isError ? 'host reported is_error' : null;
      done({ ok, fatal: false, costUsd: parsed.costUsd, error: why, exitCode: code });
    });
  });
}

// --- the loop --------------------------------------------------------------------

function options(flags) {
  const host = str(flags, 'host', { required: true });
  if (host !== 'claude' && host !== 'codex') throw userError(`--host must be claude or codex, got "${host}"`);
  const session = abs(str(flags, 'session', { required: true }));
  if (!isDir(session)) throw userError(`session dir not found: ${session}`);
  // Steps never ask the user anything, so a session without references would stop at the gate every step.
  if (!referenceImages(session).length) throw userError(`reference gate closed: no PNG, JPEG or WebP reference in ${path.join(session, 'references')}`);
  return {
    host,
    session,
    model: str(flags, 'model'),
    steps: num(flags, 'steps', 30, { min: 1, integer: true }),
    hours: num(flags, 'hours', 8, { min: 0.01 }),
    maxUsd: num(flags, 'max-usd', 25, { min: 0 }),
    maxUsdGiven: flags['max-usd'] !== undefined,
    plateau: num(flags, 'plateau', 5, { min: 1, integer: true }),
    dryRun: !!flags['dry-run'],
    json: !!flags.json,
  };
}

function galleryCommand(session) {
  return { cmd: 'node', args: [path.join(scriptDir, 'gallery.mjs'), 'build', '--session', session] };
}

function dryRun(o) {
  const cwd = projectRoot(o.session);
  const step = stepCommand(o);
  const gallery = galleryCommand(o.session);
  const limits = { steps: o.steps, hours: o.hours, maxUsd: o.host === 'claude' ? o.maxUsd : null, plateau: o.plateau, failuresInRow: 2 };
  if (o.json) {
    printJson({ dryRun: true, host: o.host, cwd, step: { ...step, shell: shellLine(step) }, gallery: { ...gallery, shell: shellLine(gallery) }, limits });
    return 0;
  }
  console.log([
    'Dry run: nothing is executed.',
    `cwd: ${cwd}`,
    `each step (up to ${o.steps}, a fresh process each):`,
    `  ${shellLine(step)}`,
    'at the end:',
    `  ${shellLine(gallery)}`,
    `stops after ${o.steps} steps, ${o.hours} h${o.host === 'claude' ? `, $${o.maxUsd} spent` : ' (Codex reports no cost)'}, ${o.plateau} steps without a new champion, 2 failed steps in a row, or champion.json "done": true`,
    `logs: ${path.join(o.session, 'overnight')}`,
  ].join('\n'));
  return 0;
}

async function loop(o) {
  const dir = path.join(o.session, 'overnight');
  fs.mkdirSync(dir, { recursive: true });
  const files = {
    champion: path.join(dir, 'champion.json'),
    next: path.join(dir, 'next.json'),
    history: path.join(dir, 'history.jsonl'),
    log: path.join(dir, 'overnight.log'),
  };
  const say = (text) => {
    fs.appendFileSync(files.log, `${new Date().toISOString()} ${text}\n`);
    (o.json ? process.stderr : process.stdout).write(`${text}\n`);
  };

  const cwd = projectRoot(o.session);
  const command = stepCommand(o);
  const started = Date.now();
  const deadline = started + o.hours * 3600 * 1000;
  let step = readHistory(files.history).reduce((max, h) => Math.max(max, Number(h.step) || 0), 0);
  let ran = 0;
  let failed = 0;
  let failsInRow = 0;
  let unchanged = 0;
  let cost = 0;
  let costKnown = false;
  let stop = null;
  let exitCode = 0;
  let interrupted = false;

  const onSignal = (sig) => {
    if (interrupted) process.exit(130);
    interrupted = true;
    say(`${sig}: finishing the current step's logs, then stopping (press again to quit now)`);
    if (activeChild) activeChild.kill(sig);
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  setDiverge(files.next, false); // a hint left by an earlier run would bias the first step
  if (o.host === 'codex' && o.maxUsdGiven) say('note: Codex reports no cost; --max-usd is ignored');
  say(`start: ${o.host}, up to ${o.steps} steps, ${o.hours} h${o.host === 'claude' ? `, $${o.maxUsd}` : ''}, plateau ${o.plateau}; cwd ${cwd}`);
  let prev = readJson(files.champion);

  while (!stop) {
    if (interrupted) { stop = 'interrupted'; exitCode = 130; break; }
    if (ran >= o.steps) { stop = `reached ${o.steps} steps`; break; }
    if (Date.now() >= deadline) { stop = `${o.hours} h elapsed`; break; }
    if (o.host === 'claude' && cost >= o.maxUsd) { stop = `cost $${cost.toFixed(2)} reached --max-usd ${o.maxUsd}`; break; }

    step++;
    ran++;
    const t0 = Date.now();
    const res = await runStep(command, {
      cwd,
      logFile: path.join(dir, 'steps', `${String(step).padStart(3, '0')}.log`),
      killAt: deadline + GRACE_MS,
      parseCost: o.host === 'claude',
    });
    const durationSec = Math.round((Date.now() - t0) / 1000);
    const cur = readJson(files.champion);
    const changed = !!(prev && cur && championKey(prev) !== championKey(cur));
    if (res.costUsd !== null) { cost += res.costUsd; costKnown = true; }

    const entry = {
      step, at: new Date().toISOString(), costUsd: res.costUsd, champion: cur ? cur.champion ?? null : null, changed, durationSec,
      ok: res.ok, score: cur && typeof cur.score === 'number' ? cur.score : null, ...(res.error ? { error: res.error } : {}),
    };
    fs.appendFileSync(files.history, JSON.stringify(entry) + '\n');
    say(`step ${step} (${ran}/${o.steps}) ${res.ok ? 'ok' : `FAILED: ${res.error}`} · ${durationSec}s`
      + `${res.costUsd !== null ? ` · $${res.costUsd.toFixed(2)} (total $${cost.toFixed(2)})` : ''}`
      + ` · champion ${entry.champion ?? '–'}${changed ? ' (new)' : ''}${entry.score !== null ? ` · score ${fmtScore(entry.score)}` : ''}`);

    if (res.fatal) { stop = res.error; exitCode = 2; break; }
    if (!res.ok) {
      failed++;
      failsInRow++;
      if (failsInRow >= 2) { stop = 'the step failed twice in a row'; exitCode = 1; }
    } else {
      failsInRow = 0;
      unchanged = changed ? 0 : unchanged + 1;
      if (changed) setDiverge(files.next, false);
      if (unchanged >= o.plateau) stop = `champion unchanged for ${o.plateau} steps`;
      else if (o.plateau >= 2 && unchanged === o.plateau - 1) {
        setDiverge(files.next, true, { reason: `champion unchanged for ${unchanged} steps`, step });
        say(`diverge hint written to ${files.next}`);
      }
    }
    if (cur && cur.done === true) stop = stop ?? 'champion.json says done';
    if (cur) prev = cur;
  }

  process.off('SIGINT', onSignal);
  process.off('SIGTERM', onSignal);
  say(`stop: ${stop}`);
  return finish(o, { files, stop, exitCode, ran, failed, cost: costKnown ? cost : null, elapsedSec: Math.round((Date.now() - started) / 1000), say });
}

function finish(o, { files, stop, exitCode, ran, failed, cost, elapsedSec, say }) {
  let gallery = null;
  try {
    gallery = buildGallery(o.session).file;
  } catch (err) {
    say(`warning: gallery build failed: ${String(err && err.message).split('\n')[0]}`);
  }
  const champion = readJson(files.champion);
  const scores = scoreHistory(champion, readHistory(files.history));
  const summary = {
    stop,
    steps: ran,
    failed,
    costUsd: cost === null ? null : Math.round(cost * 100) / 100,
    hours: Math.round((elapsedSec / 3600) * 100) / 100,
    champion: champion ? champion.champion ?? null : null,
    score: champion && typeof champion.score === 'number' ? champion.score : null,
    scores,
    gallery,
  };
  const lines = [
    `Overnight stopped: ${stop}`,
    `Steps: ${ran}${failed ? ` (${failed} failed)` : ''} · cost ${summary.costUsd === null ? 'not reported' : `$${summary.costUsd.toFixed(2)}`} · ${summary.hours} h`,
    `Champion: ${summary.champion ?? 'none yet'}${summary.score !== null ? ` · score ${fmtScore(summary.score)}` : ''}`,
    `Score history: ${scores.length ? scores.map(fmtScore).join(' → ') : '–'}`,
    `Gallery: ${gallery ?? 'not built'}`,
  ];
  for (const l of lines) fs.appendFileSync(files.log, `${new Date().toISOString()} ${l}\n`);
  if (o.json) printJson(summary);
  else console.log(lines.join('\n'));
  return exitCode;
}

export async function main(argv) {
  const { flags } = parseArgs(argv, { booleans: ['dry-run'] });
  if (flags.help) { console.log(HELP); return 0; }
  const o = options(flags);
  return o.dryRun ? dryRun(o) : loop(o);
}

if (isMain(import.meta.url)) run(main);
