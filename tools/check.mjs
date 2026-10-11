#!/usr/bin/env node
// Repo consistency checks for Design Studio. Run before every commit: `node tools/check.mjs`.
// Exits 1 on errors; prints warnings without failing.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = path.join(root, 'plugins/design-studio');
const skillDir = path.join(plugin, 'skills/studio');
const errors = [];
const warnings = [];
const rel = (p) => path.relative(root, p);

const readJson = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { errors.push(`${rel(p)}: invalid JSON (${e.message})`); return null; }
};
const walk = (dir, ext) => fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const p = path.join(dir, d.name);
      return d.isDirectory() ? walk(p, ext) : p.endsWith(ext) ? [p] : [];
    })
  : [];

// Minimal frontmatter reader: top-level `key: value` pairs, quotes stripped.
function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { fields, body: text.slice(m[0].length) };
}

// 1. Manifests and marketplaces agree.
const claudeManifest = readJson(path.join(plugin, '.claude-plugin/plugin.json'));
const codexManifest = readJson(path.join(plugin, '.codex-plugin/plugin.json'));
if (claudeManifest && codexManifest) {
  for (const key of ['name', 'version']) {
    if (claudeManifest[key] !== codexManifest[key]) {
      errors.push(`manifest ${key} differs: .claude-plugin=${claudeManifest[key]} .codex-plugin=${codexManifest[key]}`);
    }
  }
}
if (fs.existsSync(path.join(plugin, 'plugin.json'))) {
  errors.push('plugins/design-studio/plugin.json exists: a root Agent Plugins manifest makes Codex truncate skill bodies to 8 KB; use .codex-plugin/plugin.json');
}
for (const f of ['hooks/hooks.json', '.mcp.json']) {
  if (fs.existsSync(path.join(plugin, f))) errors.push(`${f} in the plugin: both hosts would load it with different schemas`);
}
for (const mp of ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']) {
  const data = readJson(path.join(root, mp));
  for (const entry of data?.plugins ?? []) {
    const src = typeof entry.source === 'string' ? entry.source : entry.source?.path;
    if (!src?.startsWith('./')) errors.push(`${mp}: source for ${entry.name} must start with ./`);
    else if (!fs.existsSync(path.join(root, src))) errors.push(`${mp}: source ${src} does not exist`);
  }
}

// 2. Skills: portable frontmatter within both hosts' limits.
for (const file of walk(path.join(plugin, 'skills'), 'SKILL.md')) {
  const fm = frontmatter(file);
  if (!fm) { errors.push(`${rel(file)}: missing frontmatter`); continue; }
  const { name, description } = fm.fields;
  if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) errors.push(`${rel(file)}: name must be hyphen-case, at most 64 chars`);
  if (!description) errors.push(`${rel(file)}: description is required`);
  else {
    if (description.length > 1024) errors.push(`${rel(file)}: description is ${description.length} chars (Codex truncates at 1024)`);
    if (/[<>]/.test(description)) errors.push(`${rel(file)}: description must not contain < or >`);
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n').length;
  if (lines > 500) errors.push(`${rel(file)}: ${lines} lines (keep SKILL.md under 500)`);
  if (/\$ARGUMENTS/.test(fm.body)) errors.push(`${rel(file)}: $ARGUMENTS is Claude-only; parse the request in words instead`);
}

// 3. Every role has a Claude Code agent shell, and every shell has a role.
const roles = fs.readdirSync(path.join(skillDir, 'roles')).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.slice(0, -3));
const shells = fs.readdirSync(path.join(plugin, 'agents')).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
for (const r of roles) if (!shells.includes(r)) errors.push(`role ${r} has no agents/${r}.md shell`);
for (const s of shells) {
  if (!roles.includes(s)) errors.push(`agents/${s}.md has no roles/${s}.md`);
  const fm = frontmatter(path.join(plugin, 'agents', `${s}.md`));
  if (fm?.fields.name !== s) errors.push(`agents/${s}.md: name must be "${s}"`);
  if (!fm?.fields.description) errors.push(`agents/${s}.md: description is required`);
  if (fm && !fm.body.includes(`roles/${s}.md`)) errors.push(`agents/${s}.md: body must point at roles/${s}.md`);
}

// 4. Cross-references between portable files resolve.
const portable = ['roles', 'knowledge', 'protocol', 'templates'].flatMap((d) => walk(path.join(skillDir, d), '.md'));
portable.push(path.join(skillDir, 'SKILL.md'));
const refPattern = /\b(?:KB|kb)\/(roles|knowledge|protocol|templates)\/([\w.-]+\.(?:md|json))/g;
for (const file of portable) {
  const text = fs.readFileSync(file, 'utf8');
  for (const [, dir, name] of text.matchAll(refPattern)) {
    if (!fs.existsSync(path.join(skillDir, dir, name))) errors.push(`${rel(file)}: references missing ${dir}/${name}`);
  }
  for (const [, script] of text.matchAll(/SCRIPTS\/([\w-]+\.mjs)/g)) {
    if (!fs.existsSync(path.join(skillDir, 'scripts', script))) errors.push(`${rel(file)}: references missing scripts/${script}`);
  }
  if (file !== path.join(skillDir, 'SKILL.md') && /\$\{CLAUDE_/.test(text)) {
    warnings.push(`${rel(file)}: \${CLAUDE_*} is not expanded in Codex or when read as a file`);
  }
}

// 5. Knowledge files follow the house format.
for (const file of walk(path.join(skillDir, 'knowledge'), '.md')) {
  const text = fs.readFileSync(file, 'utf8');
  if (!/^> Used by:/m.test(text)) errors.push(`${rel(file)}: missing "> Used by:" header`);
  if (!/^## When these conflict/m.test(text)) errors.push(`${rel(file)}: missing "## When these conflict"`);
  const lines = text.split('\n').length;
  if (lines > 480) warnings.push(`${rel(file)}: ${lines} lines; roles read this before every task, keep it dense`);
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`error ${e}`);
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `ok (${warnings.length} warning(s))`);
process.exit(errors.length ? 1 : 0);
