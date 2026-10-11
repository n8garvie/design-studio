# Hosts: Claude Code, Codex, solo

Read this when something about your host is unclear, when spawning fails, or when you need solo mode.

## Claude Code

- **Spawning.**
  - Use the Agent tool with `subagent_type: "design-studio:<role>"`. The plugin ships a thin agent for each role, which reads `KB/roles/<role>.md`.
  - If the type is missing (for example, the skill was installed without the plugin), use `general-purpose` with the same task card.
  - Never fork your conversation into a critic.
  - Launch a whole wave in one message.
- **Background results.** Subagents often run in the background, and their results arrive as notifications. After launching a wave, wait for every notification, then run the `session.mjs check` barrier. Never proceed on partial results unless failure handling in SKILL.md allows it.
- **Continuing the maker.** Spawn the design engineer once, record its name or id in `state.md`, then continue it each round with SendMessage. If that fails, spawn a fresh engineer with `BUILD-NOTES.md`.
- **Models.** Pass `model` on each spawn from the config profile (`inherit`, `opus`, `sonnet`, `haiku` or `fable`). The `quality` profile inherits everywhere.
- **Asking the user.** Use AskUserQuestion. Keep the turn open at checkpoints.
- **Permissions.**
  - The skill pre-approves its own scripts (`allowed-tools`).
  - Roles write files under `.design-studio/`. In default permission mode the user will be asked. Recommend acceptEdits or auto mode for long sessions, or an allow rule for `.design-studio/**`.
- **Headless:** `claude -p "/design-studio:studio ..." --permission-mode acceptEdits`. `scripts/overnight.mjs` drives it for long loops.

## Codex

- **Spawning.**
  - This skill explicitly asks you to delegate to subagents, so do it.
  - Use `spawn_agent` with the task card as the message. Omit `agent_type`; the built-in default agent is right, and the role brief carries the persona.
  - Never pass full history. On v2 set `fork_turns: "none"`; on v1 don't set `fork_context`.
- **Concurrency.**
  - Default limits are small: about 3 children on v2, 6 threads on v1, and on v1 finished agents count until closed.
  - Run waves of 3 (v2) or 5 (v1).
  - Call `close_agent` on finished agents (v1) before the next wave.
  - Users can raise `[agents] max_threads` in `~/.codex/config.toml`.
- **Waiting.** Loop `wait_agent` until every agent in the wave has completed. On v2, results arrive as completion messages. Then run the barrier.
- **Depth.** Children can't spawn children (`max_depth` defaults to 1), and the studio never needs them to.
- **Continuing the maker.** Use `send_input` (v1) or `followup_task` (v2). If neither works, spawn a fresh engineer with `BUILD-NOTES.md`.
- **Models.** Pass `model` and `reasoning_effort` from the config profile's `codex` block.
- **Asking the user.**
  - `request_user_input` works only in Plan mode by default.
  - Elsewhere, ask in plain text, write the pending question and the current phase to `state.md`, and end your turn. The user's reply resumes the session.
- **Images.** Subagents open screenshots with `view_image`.
- **Screenshots and sandbox.** `shoot.mjs` launches Chromium, which may need sandbox approval. If it is blocked, ask the user to approve it, or to provide screenshots. Never let critics guess.
- **Image generation.** Codex can generate images natively. The art director may use it for real imagery when the brief calls for it.
- **Headless:** `codex exec --full-auto '$design-studio:studio ...'`.

## Solo mode (no subagent tool)

You play every role yourself. Independence suffers, so compensate with discipline:
- **Default to quick depth with at most 4 roles,** unless the user insists.
- **Run critiques blind:** write each role's critique file completely, using that role's brief, *before* reading any other critique file. Do the panel critique first, before you write any role critique.
- **Re-read the role brief** before each role's task. Don't carry one role's opinions into the next.
- **Label it honestly:** "solo studio (reduced independence)" in the report header. Scores from solo mode are not comparable with multi-agent scores.
