# 20 Discover

The goal is to see the problem clearly through every lens, and to turn the references into a written bar the critics can hold work to.

## Wave 1, in parallel

- **Always** (the reference gate guarantees at least one): spawn `visual-designer` and `brand-designer` with `TASK: reference-read`.
  - INPUTS: every reference image in `references/`, plus `references/sources.md` and `brief.md`.
  - OUTPUT: `discover/reference-read-<role>.md`.
- **Every other roster role:** `TASK: discover`.
  - INPUTS: `brief.md`, `references/sources.md`, the reference images, and `discover/current/*` plus `measure.json` for a redesign.
  - OUTPUT: `discover/<role>.md`.
- **Redesign, standard and deep depth:** also spawn one fresh `critic` with `TASK: panel` on the current state.
  - INPUTS: the `criticFiles` from `discover/current`, plus `brief.md`.
  - OUTPUT: `discover/baseline-panel.md`.
  - This is the baseline score.

Barrier: `session.mjs check` on every expected output.

## Merge the reference brief (you write this)

Write `discover/reference-brief.md` from `KB/templates/reference-brief.md`.

1. **Read.** For each reference, keep the sharper of the two reads on each axis: palette, composition, focus, density, light and material, type voice.
2. **Resolution.** Where references disagree, pick the dominant source and say why. Never average them.
3. **Translation.** The mechanism to borrow from each reference, in one line each. Translate; don't transplant.
4. **Match.** The concrete craft level to reach: spacing discipline, type finesse, image quality, restraint.
5. **Elevate.** Where we go beyond the references, and the candidate signature move.
6. **Rules.** 3–5 rules, each testable from a screenshot. If both readers wrote a rule the same way, keep it; otherwise choose.

Critics see this file as text, never the reference images. Critics shown photos as moodboards tend to dismiss them. A written read lets a critic hold the work to the references consistently.

Then update `state.md`: phase define, plus a two-line summary of what Discover found.
