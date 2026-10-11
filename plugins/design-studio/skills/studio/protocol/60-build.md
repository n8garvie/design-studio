# 60 Build

The goal is the real screens, built with the system, by one maker.

## 1. Build

Spawn the `design-engineer` with `TASK: build-screens`.
- INPUTS: `direction.md`, `spec/*.md`, `build/system.html`, `build/BUILD-NOTES.md`, and the target files listed in `brief.md`.
- The engineer builds:
  - the target screens, as `build/index.html` or several screen files, or in the user's codebase
  - `build/states.html`
  - URL-reachable states (`?state=empty|loading|error|partial|success`)
- Record the engineer's name or id in `state.md` under `maker:`.

## 2. Continue the same maker across rounds

The design engineer is the one long-lived thread. Its taste and memory of the build are worth keeping.
- **Claude Code:** continue it with SendMessage to its name or id.
- **Codex:** continue it with `send_input` / `followup_task`.
- **Neither available, or the thread is lost:** spawn a fresh engineer and point it at `build/BUILD-NOTES.md`.

## 3. Minimal prompts to the maker

Every message to the maker carries only the paths of:
- the brief line
- the latest screenshots
- the maker brief, which states problems and targets

It carries no technical opinions. The maker doesn't review its own work; it stops after implementing and recaps briefly.

## 4. Real codebases

When the target is the user's real codebase:
- Note the dev server URL or the file target in `state.md` (`target:`).
- Snapshots in `rounds/NN/snapshot/` are copies of the changed files, listed in BUILD-NOTES, so a regression can be reverted.

Then go to the crit loop.
