# Working on Design Studio

This file is for anyone maintaining this repo, human or agent. To *use* the studio, see README.md.

## Layout and what each part is for

- `plugins/design-studio/skills/studio/` is the **portable core**: one Agent Skills folder that works in Claude Code, Codex, and any Agent Skills host.
  - `SKILL.md` is the Head of Studio: orchestration only.
  - `roles/` holds the role briefs, plus `_contracts.md` (task formats and the JSON blocks the scripts parse).
  - `knowledge/` is the distilled canon. Roles read it before every task.
  - `protocol/` has one file per phase. The Head reads each when it enters that phase.
  - `templates/` holds the session files and `config.json`.
  - `scripts/` holds the zero-dependency Node scripts (session, shoot, tally, lineup, contrast, seed, gallery, overnight).
- `plugins/design-studio/agents/` contains Claude Code only: **thin shells** that point a named subagent at `roles/<slug>.md`. Codex plugins can't ship agents, so there the Head spawns generic subagents with the same task card.
- `.claude-plugin/` and `.codex-plugin/` hold the two manifests. Keep `name` and `version` identical in both.

## Rules for changes

1. **Keep the core portable.**
   - Use relative paths from the skill folder.
   - Use `${CLAUDE_SKILL_DIR}` / `${CLAUDE_PLUGIN_ROOT}` only in `SKILL.md` frontmatter or lines, and in agent shells, always with a plain-language fallback.
   - Never use `$ARGUMENTS`.
   - SKILL.md frontmatter keys that matter everywhere: `name` and `description` (≤1024 chars, no `<` or `>`).
2. **Never add a root `plugins/design-studio/plugin.json`.** Codex truncates skill bodies from Agent Plugins manifests to 8 KB. Don't ship `hooks/hooks.json` or `.mcp.json` either; both hosts would load them.
3. **Write knowledge files in the house shape.** Each principle is a named principle, one sentence, four imperatives, a `Check:` line a critic can verify from screenshots or `measure.json`, and an optional `Values:` line. Each file starts with `> Used by:` and ends with `## When these conflict`.
   - Distil in your own words, and cite a source tag on every principle.
   - Never paste text from books or paywalled articles.
4. **Every role in `roles/` needs a shell in `agents/`, and the reverse.** The shell body must point at `roles/<slug>.md`.
5. **Change the JSON blocks only together with the scripts that parse them.** The `studio-findings`, `studio-score`, `studio-crosscrit`, `studio-lineup` and `studio-pair` blocks in `_contracts.md` are parsed by `tally.mjs` and `lineup.mjs`. Update both, plus the tests.
6. **Release.** Bump `version` in both manifests. Users only get updates when the version changes.

## Verify before committing

```
node tools/check.mjs
node --test tests/
claude plugin validate --strict .
claude plugin validate --strict plugins/design-studio
```

Smoke-test the studio on the fixture (needs Playwright and Chromium):

```
claude --plugin-dir plugins/design-studio -p "/design-studio:crit examples/flawed-landing/index.html quick auto" --permission-mode acceptEdits
```

The answer key is in `tests/fixtures/flawed-landing.key.md`. Never put it where critics can read it.

## Refreshing the inspiration sources (do this whenever you update the repo)

desengs.com/inspiration and designengineer.tools update regularly. The studio does **not** fetch them at runtime. Refresh them as part of every repo update:

```
node tools/refresh-sources.mjs --dry-run   # see what's new
node tools/refresh-sources.mjs            # update sources/*.json and write sources/NEW-ITEMS.md
```

Then:
1. Review `sources/NEW-ITEMS.md`, and open the new entries and their images.
2. Add worthwhile entries to the reference index in `skills/studio/knowledge/inspiration.md`, with the mechanism to learn from each, not the look.
3. Fold any new taste lesson into the principles there.
4. Add useful new tools to the toolbox in `knowledge/design-engineering.md`.
5. Commit the snapshots and the knowledge changes together.
