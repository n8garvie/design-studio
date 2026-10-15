# Design Studio

A design studio in a skill, for **Claude Code** and **Codex**.

A Head of Studio runs a team of designer agents: visual designer, typographer, content strategist, interaction designer, product strategist, brand and marketing designer, and emotion designer, plus a guest art director, motion designer and UX researcher when the brief calls for them. They study your visual references and explore genuinely different directions as quick HTML prototypes. Then they build a design system and screens, critique each other's work from screenshots, and keep going until the work clears a studio-grade bar, or tell you honestly why it didn't.

```
INTAKE ─► DISCOVER ─► DEFINE ─► DEVELOP ──────────► SPEC ─────────► BUILD ─► CRIT LOOP ───────────────────────► DELIVER
brief,     reference   principles  seeded directions  each role writes  screens  screenshots → role critics,      cut, AI tells,
refs,      brief,      non-goals,  as HTML tiles,     its section;      and      fresh panel (the gate), blind     states, a11y,
roster     lens notes  the bar     blind lineup vs    system sheet      states   lineup vs refs → tally → team     copy handback,
                                   refs, you pick     rendered + crit            debates → rulings → maker applies  final gate
```

For diagrams of the phases, one crit round and how the agents pass work to each other, open [`docs/how-it-works.html`](docs/how-it-works.html) in a browser.

## Why it works

- **Your references set the bar, and nothing starts without them.** The studio asks for references before it does anything else, in every mode, `auto` included, and waits until you give at least one. If you have none, it proposes candidates for you to accept. The team reads them into a written brief: what to match, where to go further, and 3–5 rules a critic can check. Each round, jurors rank our screenshot blind among your references. "Done" means ranking first.
- **Fresh eyes do the scoring.** Panel critics see only screenshots and the brief: no code, no history, no target score. They score against an anchored scale (3–4 = competent generic, 9 = studio-grade), and the median is the gate. This is the critic loop from Anshu Chimala's [How to turn your AI into a world-class designer](https://www.lennysnewsletter.com/p/how-to-turn-your-ai-into-a-world).
- **The team critiques each other.** Every role critiques every round, whatever the depth. Each reviews the work through its own lens with measured evidence (contrast, measure, tap targets, type scale) and a cited principle. Then the roles challenge each other's findings and argue the real disagreements out, answering each other directly, and the Head of Studio rules using a fixed ladder: accessibility → your decisions → clarity → user control → task completion → consistency → distinctiveness → delight.
- **Divergence comes from outside the model.** Random seed strings and divergent stances (refiner, provocateur, outsider, minimalist) let several instances of the same role explore ground a single designer never would.
- **Principles, not specs.** The knowledge base distils Refactoring UI, Müller-Brockmann, Bringhurst, Albers, About Face, Tidwell, Saffer, Johnson, Yablonski, Norman, Tufte and Rosenfeld/Morville. Each principle uses [Adam Hayes's](https://adamhayes.xyz/blog/the-ux-laws-in-my-claude-md/) shape (the law named, one sentence, four imperatives) plus a line a critic can check.
- **One maker, many critics.** Only the design engineer writes code, and roles hand it problems and targets rather than prescriptions. Taste lives in the maker's weights and the critics' fresh eyes, so the orchestrator stays lean.

## Install

**Claude Code**

```
/plugin marketplace add n8garvie/design-studio
/plugin install design-studio@design-studio
```

**Codex** (CLI 0.122+)

```
codex plugin marketplace add n8garvie/design-studio
codex plugin add design-studio@design-studio
```

Start a new session after installing.

**Other Agent Skills hosts.** Copy `plugins/design-studio/skills/studio` and `plugins/design-studio/skills/crit` into your skills folder (`.agents/skills/` or `~/.claude/skills/`). Roles then run as general-purpose subagents that read their briefs.

You need Node 18+. For screenshots, Playwright with Chromium must be available to your project (`npm i -D playwright && npx playwright install chromium`), or set `STUDIO_CHROMIUM_PATH`. Without a browser, give the studio screenshots yourself.

## Use

| Claude Code | Codex | What happens |
|---|---|---|
| `/design-studio:studio design a pricing page for Tempo, refs: ./refs/*.png https://linear.app` | `$design-studio:studio …` | Full make mode at standard depth |
| `/design-studio:studio redesign src/app/settings quick, refs: ./refs/settings-*.png` | `$design-studio:studio …` | Quick pass on an existing screen |
| `/design-studio:crit http://localhost:3000 refs: stripe.com/pricing` | `$design-studio:crit …` | One critique round, with a ranked fix list |
| `/design-studio:studio resume` | `$design-studio:studio resume` | Continue the last session |

**References can be almost anything.** The studio collects each into the session for you:
- image files or folders
- websites and local pages (captured on desktop and mobile)
- mood boards and galleries: a Cosmos board, an Are.na channel, or a1.gallery, sections.wtf, recent.design, before.click, Godly and the like. Every tile is saved with its caption and link, plus a contact sheet the team reads at a glance. Then 3–5 tiles are picked as the anchors the blind lineup ranks against.
- a Threads, X or Instagram post: its images, plus a list of the sites it names, for you to choose from.
- a video, such as a screen recording or a board's share export: each distinct frame becomes a tile. This needs ffmpeg.

A private board can't be read: make it public, or export its images to a folder and pass the folder.

Things you can say in the request:
- `quick`, `standard` (the default) or `deep`
- `auto`, to skip checkpoints
- `with the art director`, or `only type and visual`
- `profile balanced`

**Checkpoints.** First, the reference gate: no references, no session. Then you confirm the brief, references and roster. You pick a direction from a comparison board of prototypes. At the end you rewrite the four lines only you can write: the H1, the primary button, the empty state and the error.

**What you get.** Everything lands in `.design-studio/sessions/<date>-<slug>/`:
- the brief and reference brief
- direction cards and HTML style tiles
- `system.html` (tokens, type specimen, components in every state)
- the screens and a state board
- every round's screenshots, critiques, ledger and rulings
- a `gallery.html` that shows it all
- `report.md`
- optionally, a `DESIGN.md` for your repo

### Depth and cost

| | quick | standard | deep |
|---|---|---|---|
| Roles that pitch and write specs | 3–4 | 5–7 | all, plus guests |
| Roles that critique | all | all | all |
| Directions | 1 | 2–3 | 3–4 (one risky) |
| Panel critics and jurors per round | 1 + 1 | 3 + 3 | 3 + 3 |
| Crit rounds (cap) | 1 | 3 | 6 |
| Approx. subagent runs | ~20 | ~70 | ~130 |

For reference, an early quick critique of `examples/flawed-landing` (4 role critics plus 1 panel critic) took 22 turns and about $1.55 on the `quality` profile in Claude Code. Every core role now critiques every round, so expect a quick critique to cost somewhat more. The panel scored it 3/10, and the report caught about 16 of the 18 planted flaws.

Model profiles live in `.design-studio/config.json`:

| Profile | Models |
|---|---|
| `quality` | Everyone inherits your model (the default) |
| `balanced` | Cheaper roles and jurors; the maker and panel stay strong |
| `overnight` | See below |

### Overnight loops on cheaper models

Cheaper models are unreliable at absolute scores but reliable at saying which of two designs is better. Overnight mode uses that. Each step:

1. A challenger is made from the current champion.
2. A panel of cheap jurors compares the two blind.
3. The challenger replaces the champion only when it clearly wins.

Every few steps, a strong panel scores the champion on the absolute scale. Each step runs in a fresh process with all state on disk, so a loop can run for hours without its context filling up.

```
node .design-studio/bin/overnight.mjs --session .design-studio/sessions/<session> --host claude --hours 8 --max-usd 20
node .design-studio/bin/overnight.mjs --session … --host codex --steps 40
```

In the morning, open `gallery.html`: champions side by side, the score history, and what was tried and what stuck.

### Permissions

Roles write files under `.design-studio/`. For long sessions, use acceptEdits or auto mode, or add an allow rule for `.design-studio/**`. In Codex, Chromium may need sandbox approval the first time it takes screenshots.

## The team

| Role | Owns |
|---|---|
| Head of Studio (the skill) | facilitation, rulings, the bar, checkpoints |
| Product strategist | the job, goals, scope, success criteria, the anti-goal |
| Content strategist | IA, labels, the copy deck, voice, microcopy |
| Interaction designer | flows, states, feedback, forms, keyboard, the accessibility floor |
| Visual designer | the look's coherence, grid, color, depth, spacing |
| Typographer | the type system, measure, rhythm, micro-typography |
| Brand and marketing designer | identity, distinctiveness, narrative, the signature move |
| Emotion designer | the emotional arc, peaks and endings, trust, the delight budget |
| Art director (guest) | imagery, illustration, iconography, image generation |
| Motion designer (guest) | motion tokens and choreography |
| UX researcher (guest) | walkthroughs, personas, real-data stress tests |
| Design engineer | builds the tiles, the system sheet and the screens; the only role that writes code |
| Studio critic | screenshot-only scoring on the anchored scale |
| Juror | blind lineups and pairwise rankings |

## Repository

```
.claude-plugin/marketplace.json        Claude Code marketplace
.agents/plugins/marketplace.json       Codex marketplace
plugins/design-studio/
  .claude-plugin/plugin.json           Claude Code manifest
  .codex-plugin/plugin.json            Codex manifest
  agents/                              thin Claude Code agent per role (reads the role brief)
  skills/studio/                       the portable core
    SKILL.md                           Head of Studio
    roles/  knowledge/  protocol/  templates/  scripts/
  skills/crit/SKILL.md                 critique-only entry point
sources/                               snapshots of desengs.com inspiration and designengineer.tools
tools/                                 check.mjs, refresh-sources.mjs (maintainer tools)
tests/                                 node --test
examples/flawed-landing/               a deliberately generic page to test the studio on
```

Maintaining this repo is covered in [AGENTS.md](AGENTS.md). Sources and licences are listed in [CREDITS.md](CREDITS.md).

MIT licensed.
