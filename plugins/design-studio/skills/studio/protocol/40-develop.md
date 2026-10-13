# 40 Develop

The goal is genuinely different directions, made visible as quick HTML style tiles, judged against the references, and chosen by the user's taste.

## 1. Divergence from outside the model

```
node SCRIPTS/seed.mjs roll --n <directions> --neighbors 0 --json
node SCRIPTS/seed.mjs stances --n <instances> --json
```

Assign each pitch one seed row and one stance. At standard depth, use 2–3 pitches:
- `visual-designer#a`: the seed's world, as refiner or outsider
- `brand-designer#a`: provocateur or outsider
- a third role suited to the brief, e.g. `emotion-designer`, `typographer`, or `art-director` for image-led work

At deep depth, add instances with different stances. At least one direction must be deliberately risky: a different structure or material, not a different color.

At quick depth, use one pitch: the visual designer, or the brand designer for marketing.

## 2. Pitch, in parallel

`TASK: pitch`
- INPUTS: `brief.md`, `define.md`, `discover/reference-brief.md`, and the pitcher's own discover file.
- `STANCE` and `SEED` go on the card.
- OUTPUT: `develop/cards/<role>-<instance>.md`.

## 3. Divergence check (you)

Before building anything, compare the cards:
- Each card must move **at least two open axes** that a stranger would notice in a thumbnail. A frame, a background tint or a shadow style alone doesn't count.
- No two cards may share both layout logic and palette logic.
- Every card must honour the fixed axes.

If two cards are too close, re-roll the seed for one and re-pitch it. Log rejected cards and why.

## 4. Build tiles

Spawn the `design-engineer`, two at most in parallel, with `TASK: build-tile`.
- One tile per card.
- OUTPUT: `develop/tiles/<id>/index.html`.

Then capture each tile:

```
node SCRIPTS/shoot.mjs SESSION/develop/tiles/<id>/index.html --out SESSION/develop/shots/<id> \
  --viewports desktop,mobile --tiles 1 --grayscale --critic-copy SESSION/develop/critic-view
```

## 5. Judge, in parallel

- **Lineup.** Build one blind lineup containing every tile's `desktop-top.png` and the references:

  ```
  node SCRIPTS/lineup.mjs make --ours <tile-1.png> --ours <tile-2.png> ... --refs SESSION/references --out SESSION/develop/lineup
  ```

  If `make` accepts only one `--ours`, run one lineup per tile.
  - Spawn jurors (1 at quick, 3 otherwise) with `TASK: lineup`, whose INPUTS are the set paths only.
  - Then `lineup.mjs score`.
- **Reactions.** Every roster role gets `TASK: react`.
  - INPUTS: all cards, plus every tile's `criticFiles`.
  - OUTPUT: `develop/reactions/<role>.md`.

## 6. Recommend, then checkpoint B

1. Build the board:

   ```
   node SCRIPTS/gallery.mjs board --items <tile desktop shots> --labels <names> --out SESSION/develop/board.html --png
   ```
2. Write a recommendation of five lines or fewer. Pick one direction, or a named merge ("A's layout logic with B's type and palette"). Cite the lineup and the reactions.
3. Ask the user to pick, merge or steer. Capture their reaction verbatim; their taste is the input that makes the work theirs.
4. In auto mode, pick by lineup rank first and reactions second, and log why.

## 7. Record

- `decisions.md`: the chosen direction, why (in the user's words where possible), what to steal from the others, and the rejected directions, kept for later.
- `brief.md`: the final aesthetic statement.
- `state.md`: phase spec.
