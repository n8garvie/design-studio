# 70 Crit loop

Each round:
1. Capture the work.
2. Critique it with fresh eyes: role lenses, the scoring panel, and a blind lineup against the references.
3. Tally the results.
4. Let the team challenge each other.
5. Rule.
6. Hand the maker problems and targets.
7. Apply.

Repeat until the stop rule in SKILL.md holds, a cap is reached, or the work plateaus.

## A round, step by step

### 1. Open the round
```
node SCRIPTS/session.mjs round --session SESSION --next
```
From here, R means the new round folder.

### 2. Snapshot
Copy the current build into `R/snapshot/`:
- a prototype: `build/`
- a real codebase: the changed files listed in BUILD-NOTES

### 3. Capture
```
node SCRIPTS/shoot.mjs <target> --out R/shots --viewports desktop,mobile --tiles 2 \
  --grayscale --measure --critic-copy R/critic-view [--dark] [--state empty=?state=empty ...]
```
- Add `--dark` when the design has a dark theme.
- From round 2 onward, add `--state` for the states the work touches.
- If capture fails, follow "Screenshots fail" in SKILL.md.

### 4. Wave 1: independent critique (all fresh spawns, in parallel, in waves if the host caps them)

| Who | TASK | INPUTS | OUTPUT |
|---|---|---|---|
| Each roster role | `crit` | `criticFiles`, `R/shots/measure.json`, `brief.md`, `discover/reference-brief.md`, `define.md` | `R/crit/<role>.md` |
| Studio critics: 1 at quick, 3 otherwise | `panel` | `criticFiles`, `brief.md`, `discover/reference-brief.md`. **Nothing else.** | `R/panel/P<k>.md` |
| Jurors: 1 at quick, 3 otherwise, only when references exist | `lineup` | the lineup set paths only | `R/lineup/juror-J<k>.md` |

Before spawning the jurors, build their lineup:
```
node SCRIPTS/lineup.mjs make --ours R/shots/desktop-top.png --refs SESSION/references --out R/lineup
```

- Use the same card wording every round. Never include `SETTLED`, scores, round numbers or history for panel critics or jurors.
- At deep depth, you may field two instances of a role whose lens dominates the brief (e.g. `typographer#a`, `#b`) to reduce noise.

### 5. Barrier and scoring
```
node SCRIPTS/session.mjs check --session SESSION --expect-glob 'rounds/NN/crit/*.md' --count <roles>
node SCRIPTS/session.mjs check --session SESSION --expect-glob 'rounds/NN/panel/*.md' --count <panel>
node SCRIPTS/lineup.mjs score --dir R/lineup            # when references exist
node SCRIPTS/tally.mjs --round R [--prev <previous round>]
```
Read `R/ledger.md`. Don't read the critique files in full unless a conflict needs it.

### 6. Wave 2: cross-critique (the team critiques each other's critiques)

Who takes part depends on depth:
- **quick:** skip this wave.
- **standard:** only the roles named in the ledger's "Conflicts to rule on", plus the owners of consensus findings that touch another lane.
- **deep:** every roster role.

`TASK: cross-crit`. INPUTS are `R/ledger.md` and `R/crit/*.md`. OUTPUT is `R/crosscrit/<role>.md`. When the wave is done, re-run `tally.mjs` so the ledger includes the responses.

Cross-critique is peer review between people who have seen the work's history. It informs your rulings. It never changes the panel score.

### 7. Stop check
Apply the stop rule from SKILL.md:
- panel median and spread
- lineup rank
- open blockers and majors
- the accessibility floor in `measure.json`

If it holds, go to Deliver.

Plateau or RETHINK: follow SKILL.md.
- **RETHINK: structure:** the next maker brief is a recomposition brief, not a list of fixes.
- **RETHINK: direction:** return to Develop with this direction marked as failed.

### 8. Rulings
Write `R/rulings.md` from `KB/templates/rulings.md`. It has three lists:
- **Accepted:** blockers, then majors, then the panel's top gaps, then consensus findings, then cheap minors. Cap it at about 12 items. Each item gets an owner and a target.
  - Structure comes before polish.
  - Protect every KEEP item.
  - Never accept a fix that adds a section, card or element unless a blocker requires it. An added element is the next round's tell.
- **Rejected:** each with the ladder rung that decided it.
- **Deferred.**

Append the rulings and any dissent to `decisions.md`.

### 9. Patches
Patches give the engineer exact values where an accepted item needs lane precision: copy, type steps, tokens, curves.
- **standard:** only for those items.
- **deep:** always.

Each owner gets `TASK: patch`, writing to `R/patches/<role>.md`. Run them in parallel.

### 10. Maker brief
Write `R/maker-brief.md` from `KB/templates/maker-brief.md`. It contains:
- the brief line
- the latest screenshot paths
- the accepted items, as problem → target, with patch references
- the KEEP list
- these standing rules: don't add sections, don't decorate around tells, structure before polish

It contains no code and no technical opinions.

### 11. Apply
Continue the design engineer (see `60-build.md`) with `TASK: apply`. INPUTS are `R/maker-brief.md` and `R/patches/*`. Wait for its return block.

### 12. Next round
Update `state.md`: `round:` and one note line. Then start the next round at step 1.

Regression check: if the next round's panel median drops by 2 or more, restore `R/snapshot/` and rule again, choosing differently.

## Crit mode: critique only

Run one round, steps 1–8, with the user's work as the target:
- **A file or URL:** capture it.
- **Only images supplied:** copy them into `R/critic-view/` and skip `measure.json`. Roles note "no measurements".

Then, instead of patching and applying:
- Write `report.md` from `KB/templates/report.md`, in crit-mode form:
  - the verdict and panel score
  - the lineup rank
  - a ranked fix list: blockers → majors → panel gaps → consensus. Each item has an owner, a target and the principle behind it.
  - what works (KEEP)
  - the disagreements and how you ruled on each
- Offer to continue in make mode. The studio can apply the fixes (spec any missing sections, then the design engineer works in the user's code) and keep critiquing until the bar is met.
