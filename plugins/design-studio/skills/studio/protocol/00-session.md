# 00 Session mechanics

Read this once, at the start of every session.

## Layout

```
.design-studio/
  kb/                         snapshot of roles/ knowledge/ protocol/ templates/ (+ VERSION)
  config.json                 model profiles (quality | balanced | overnight)
  sessions/<date>-<slug>/
    state.md                  phase, roster, depth, profile, maker id, notes, assumptions
    brief.md  define.md  direction.md  decisions.md  report.md  gallery.html
    references/               user references + sources.md (and captured URL shots)
    discover/                 <role>.md, reference-read-<role>.md, reference-brief.md, current/ (redesign baseline)
    develop/                  cards/ tiles/ shots/ reactions/ lineup/ board.html
    spec/                     <role>.md
    build/                    tiles promoted, system.html, screens, states.html, BUILD-NOTES.md
    rounds/NN/                shots/ critic-view/ crit/ panel/ crosscrit/ lineup/ patches/ snapshot/
                              measure.json aria.yml ledger.md ledger.json rulings.md maker-brief.md
    deliver/                  cut-*.md tells-*.md states-*.md copy-handback.md DESIGN.md
    overnight/                champion.json history.jsonl next.json tried.md overnight.log pairs/
```

## Scripts you run

| Command | Purpose |
|---|---|
| `node SCRIPTS/session.mjs init --slug s --mode m --depth d` | Create the session and refresh the kb snapshot |
| `node SCRIPTS/session.mjs round --session S --next` | Open the next `rounds/NN/` |
| `node SCRIPTS/session.mjs check --session S --expect <rel>... \| --expect-glob '<glob>' --count n` | Barrier: exit 0 only when every output exists |
| `node SCRIPTS/session.mjs status --session S` | Where are we? |
| `node SCRIPTS/shoot.mjs <file\|url> --out <dir> [--measure] [--critic-copy <dir>] ...` | Screenshots, `measure.json`, `aria.yml` |
| `node SCRIPTS/lineup.mjs make\|score\|pair\|pair-score ...` | Blind lineups and pairwise comparisons |
| `node SCRIPTS/tally.mjs --round R [--prev R-1]` | Turn critiques into `ledger.md` |
| `node SCRIPTS/contrast.mjs <fg> <bg> \| --pairs f.json \| --tokens f.css` | Contrast checks |
| `node SCRIPTS/seed.mjs roll --n k \| stances --n k` | Divergence from outside the model |
| `node SCRIPTS/gallery.mjs build --session S \| board --items ... --out f.html [--png]` | Gallery and comparison boards |
| `node SCRIPTS/overnight.mjs --session S --host claude\|codex ...` | Long unattended loop (run by the user) |

Each script prints `--help`. Run only these scripts. Never ask a role to run the barrier for you.

## state.md

Keep it current; it is how a resumed or compacted session finds its place. Fields:
- `phase:`
- `mode:`
- `depth:`
- `profile:`
- `roster:` (slug list, with instances)
- `target:` (what is built and where)
- `maker:` (the design engineer's agent name or id, to continue it)
- `round:`
- `refs:` (count)
- `notes:` (one line per event)
- `assumptions:` (auto mode)

## Hygiene that protects the scores

- Critics, panel critics and jurors get the `criticFiles` from `--critic-copy`. These are neutral file names in a random folder: no round numbers, no slugs.
- Use the same task card template for the same task every round, word for word. A critic prompt that drifts makes scores incomparable.
- Never tell anyone a target score, the previous score, or that a threshold exists.
- Log the configuration with every score in `ledger.md`'s header: host, model profile, panel size. Scores are comparable only within one configuration.
- Keep a snapshot of `build/` in each round (`rounds/NN/snapshot/`), so you can revert a regression (panel median down 2 or more) and build comparison boards.

## Models and cost

- Read `.design-studio/config.json`. The `profile` sets the model for roles, the maker, jurors and panel critics:
  - **quality:** everyone inherits your model (the default).
  - **balanced:** cheaper roles and jurors; the maker and panel inherit.
  - **overnight:** cheap pairwise jurors, plus a strong absolute panel every N steps.
- Cheap models are unreliable at absolute scores but reliable at pairwise comparison. Never use a cheap model as the only panel critic for the stop rule.
- The design engineer is the one long-lived thread. Give it the strongest model the profile allows; taste lives in the maker's weights.
- Resource budget:
  - At most 2 design engineers at once, used only for parallel tiles.
  - One screenshot run at a time; `shoot.mjs` reuses one browser.
