# 80 Deliver

The goal is to polish by taking away, remove what reads as generated, finish every state, hold the accessibility floor, let the user own the words, and prove the result with a final gate.

Run each pass, then one `apply` by the design engineer, in this order.

## 1. Cut pass (first, always)

AI loves to add and rarely takes away. Restraint reads as expensive.

1. Every roster role gets `TASK: cut`.
   - INPUTS: the latest `critic-view` shots and `measure.json`.
   - OUTPUT: `deliver/cut-<role>.md`.
2. Merge the results into `deliver/cut.md`.
   - Cut whatever adds no information, no action and no state.
   - "It looks emptier" is not a reason to keep something. Remove it, then fix the composition with spacing.
3. Get the decisions:
   - **Not auto:** show the user the merged list and let them mark each item cut, keep or replace. This is checkpoint D, part 1.
   - **Auto:** decide with the same rule.
4. Apply.

## 2. Tells passes (visual, then copy, separately)

1. **Visual tells.** Spawn the visual designer, brand designer, typographer, and the art director if invited, each with `TASK: tells`, writing to `deliver/tells-<role>.md`.
2. **Copy tells.** Then spawn the content strategist and brand designer.
3. **Apply one pattern at a time** when there are several. Each decision should be about one thing.

Fixing a tell means removing or replacing it. A purple gradient with a noise overlay is still a purple gradient.

## 3. States pass

1. Capture every state the work touches:
   ```
   node SCRIPTS/shoot.mjs <target> --out SESSION/deliver/states --state empty=?state=empty --state loading=?state=loading --state error=?state=error --state partial=?state=partial --state success=?state=success --state stress=?state=stress
   ```
   Also cover long text, the narrowest viewport, and dark mode where one exists.
2. Spawn the interaction designer, the content strategist, and the UX researcher if invited, each with `TASK: states`. Each reports every state as designed, unstyled or missing.
3. An unstyled state is an unfinished screen. Apply until each state is designed in the same direction as the rest.

## 4. Accessibility floor

1. From a fresh `measure.json`, every item below must hold:
   - zero text contrast failures
   - no targets under 24px, and 44px for touch where the brief is mobile
   - a `:focus-visible` style
   - a reduced-motion alternative for anything that moves
   - no unnamed controls
   - headings in order
2. Run `node SCRIPTS/contrast.mjs --tokens <the css with :root tokens>`.
3. The interaction designer checks the keyboard path against `aria.yml`.
4. Fix any failing accent with a darker or lighter step of the same hue, never grey.

## 5. Copy handback (checkpoint D, part 2)

1. The content strategist runs `TASK: copy-handback`, writing to `deliver/copy-handback.md`.
2. Ask the user to rewrite, or mark `keep` on, at least the four lines only they can truly write:
   - the H1
   - the primary button
   - the empty state
   - the error
3. Apply their words verbatim, and report anything the layout forced you to change.
4. In auto mode, skip this step and list those four lines in the report under "Lines only you can write".

## 6. Final gate

1. Run one more full round: steps 1–7 of `70-crit-loop.md`, with fresh panel and jurors.
2. If the stop rule holds, ship it. If not, either run one more crit-loop round (if the cap allows) or report honestly.
3. **Regression rule:** if the panel median dropped by 2 or more against the best round, restore that round's snapshot.

## 7. Hand over

- **`DESIGN.md`.** Offer to write the agreed design language into the project root from `KB/templates/DESIGN.md`. It keeps tokens, rules and rationale together, so future work (by people or agents) stays consistent.
  - Auto mode: write it to `SESSION/deliver/DESIGN.md` only.
- **Port.** If the work is a prototype and the user wants it in their stack, the design engineer ports it. Then capture and run one more panel round, because ports lose details. Note what must never be "cleaned up".
- **Close out:**
  ```
  node SCRIPTS/gallery.mjs build --session SESSION
  ```
  Then write `report.md` and finish as described in SKILL.md.
