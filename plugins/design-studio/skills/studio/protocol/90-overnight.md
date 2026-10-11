# 90 Overnight step: champion and challenger

Use this when the request is `overnight-step` (sent by `scripts/overnight.mjs`), or when the user asks for a long, cheap, unattended improvement loop.

Each invocation runs in a fresh process and does **one** step, then exits. All state lives on disk. Never ask the user anything. Never edit outside SESSION, and outside the build target the user approved for overnight work.

## Why it works on cheaper models

Cheap models are poor at absolute scores but reliable at **pairwise** judgments: "which of these two is better?" So each step:
1. makes a challenger from the current champion
2. has a panel of cheap jurors compare the two blind
3. keeps the challenger only if it **clearly** wins

Because a challenger replaces the champion only after a clear win, the loop never ships a regression. Every N steps, a strong-model panel scores the champion on the absolute scale, so the history shows real progress.

## Setup (first step only)

If `overnight/champion.json` doesn't exist:
1. Pick the round with the best panel median as the champion.
2. Write:
   ```json
   {"champion":"rounds/NN","since_step":0,"score":<median>,"history":[]}
   ```
3. Create an empty `overnight/tried.md`.

Overnight work should run on the session prototype in `build/`, or on a separate git branch or worktree that the user named. Never run it on the user's working tree.

## One step

1. **Read** `state.md`, `overnight/champion.json`, `overnight/next.json` (a diverge hint, if present) and `overnight/tried.md`. Read the profile from `.design-studio/config.json`; it is usually `overnight`.
2. **Open a round.** Restore the champion snapshot into `build/` if the build has drifted from it.
3. **Find what to improve.** This is cheap critique: the profile's role model, 2–3 roles chosen for the champion's weakest lanes in its last ledger, and one cheap panel critic.
   - Capture the champion and run `crit` and `panel` as in `70-crit-loop.md`, steps 3–5.
   - Rule on the top 3–5 accepted items that are **not already listed in `tried.md`**.
   - **If `next.json` says `diverge`:** the brief is instead a divergent variation. Roll a new seed on the open axes, keep the fixed axes and the KEEP list, and change the structure or material, not the color.
4. **Make the challenger.** The design engineer applies the maker brief. Use the profile's maker model, and continue the maker thread if the host allows it. Then capture the challenger.
5. **Judge it blind**, comparing champion against challenger on desktop and on mobile:
   ```
   node SCRIPTS/lineup.mjs pair --a <champion desktop-top> --b <challenger desktop-top> --out overnight/pairs/<step>-desktop
   node SCRIPTS/lineup.mjs pair --a <champion mobile-top>  --b <challenger mobile-top>  --out overnight/pairs/<step>-mobile
   ```
   - Spawn `panel` jurors (from the profile, usually 3) with `TASK: pair` for each pair.
   - Then run `lineup.mjs pair-score`.
   - The challenger **wins** only if it clearly wins desktop and does not clearly lose mobile.
6. **Update.**
   - **If it wins:** it becomes the champion. Update `champion.json` (`champion`, `since_step`, append to `history`).
   - **Either way:** append the attempted items to `tried.md` with their outcome.
7. **Absolute check, every N steps** (`absolute_every` in the profile). Run a full panel on the champion with the strong model (`absolute_panel_model`), plus a lineup against the references if they exist. Record the median and rank in `champion.json`.
   - If the full stop rule from SKILL.md holds, write `"done": true`. The driver will stop.
8. **Finish.** Write three lines to stdout: the step result, the champion, and the last absolute score. Then exit.

## Morning

`overnight.mjs` builds the gallery. When the user returns, show them:
- a comparison board of the original, the champion, and the best absolute-scored champions
- the score history
- what was tried and what stuck

Then let them pick and lock the version they want, port it if needed, and run Deliver.
