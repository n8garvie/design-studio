# Studio contracts

Every role reads this file after its own role brief. It defines how each task works, the file formats the studio's scripts parse, and the reply you send to the Head of Studio.

## Ground rules for every task

1. **Write only to your OUTPUT path.** The design engineer is the only role that edits product files. Everyone else writes their own output file and nothing more.
2. **Read your INPUTS. Don't go looking for other files.**
   - Critics and jurors open only the screenshot paths they were given, plus the brief files named in INPUTS.
   - Never open source code, earlier rounds, or other critics' files unless INPUTS lists them.
3. **Respect SETTLED.** Decisions logged in `decisions.md` are closed. You may disagree once, briefly, in a `DISSENT:` line. You may not re-litigate.
4. **Use evidence or say you can't.**
   - Cite what you can see (location in the screenshot) or measure (values from `measure.json`).
   - If something can't be known from your inputs, say "can't tell from the screenshots" instead of guessing.
5. **Name problems and targets, not implementation.**
   - Say what is wrong, where, why it matters (the principle), and what good looks like (target values, tokens or copy).
   - Never write code for the engineer.
6. **Use the anchored scale.**

   | Score | Meaning |
   |---|---|
   | 1–2 | Broken or raw template |
   | 3–4 | Competent generic: the template look, nothing memorable |
   | 5–6 | A direction is visible but execution is uneven, and tells remain |
   | 7 | Distinctive and coherent; a senior would still change several details |
   | 8 | Distinctive and coherent, details mostly right; one or two things left |
   | 9 | Studio-grade: nothing to remove, every detail intentional, a clear point of view |
   | 10 | Reference quality: designers would study it |

   - A 9 is rare. When torn between two scores, give the lower one.
   - Never grade effort or improvement; you can see neither.
7. **Be bold, specific and short.**
   - At most 10 findings. Put the three that would change the outcome most first.
   - Respect the stated direction. Never propose the generic layout as the fix for an unconventional direction; propose the better version of what it is attempting.
   - Always say what works (KEEP), so it survives the next round.

### Severity

| Severity | Meaning |
|---|---|
| `blocker` | Breaks the user's task, the accessibility floor, or the brief. Fix before anything else. |
| `major` | Clearly below the bar; a senior designer would not ship it. |
| `minor` | A noticeable detail. |
| `polish` | A refinement on the way from 8 to 10. |

## The return block

When you finish a task, reply with exactly these five lines and nothing else:

```
STATUS: done | partial | blocked
FILE: <absolute path you wrote>
HEADLINE: <one line: the single most important thing>
TOP: <up to 3 items with severity, separated by " ; ">
NEEDS: <none | the one thing you need from the Head>
```

---

## Tasks

### `discover`
Write about your lane, not solutions.
- What the brief, the references and any existing product reveal.
- The problems and opportunities you see.
- The constraints you must honour.
- The questions only the user can answer (at most 3).

Keep it to 40–80 lines.

### `reference-read` (visual designer and brand designer)
Read each reference image on six axes:
- palette (name the colors and give approximate hex)
- composition
- focus
- density
- light and material
- type voice

Then write:
- **Resolution:** how to reconcile references that disagree. Never average two palettes into mud; pick a dominant source and say why.
- **Translation:** the *mechanism* each reference teaches, not its pixels ("translate, do not transplant").
- **Match:** the concrete craft level we must reach (spacing discipline, type finesse, image quality, restraint).
- **Elevate:** where we will deliberately go beyond the references, and the one signature move.
- **Rules:** 3–5 testable rules a critic can pass or fail from a screenshot. Example: "Exactly one accent color, used only on the primary action and the current selection."

### `pitch` (direction card)
Use your STANCE and SEED. Read the seed row as a coherent world, not a checklist. Let it push you where you wouldn't go alone, and never put the string itself into the design. Write a card with these headings:

```
# <Direction name>
Aesthetic statement: <one sentence about feeling and identity, not features>
Emotional target: <what someone feels in the first three seconds>
Stance and seed reading: <how the stance and seed shaped this>
Fixed axes honoured: <from define.md>
Open axes moved: <at least two, each visible at thumbnail size>
Signature move: <exactly one>
Palette: <4–6 named colors with hex or oklch, and the role of each>
Type: <families, the scale idea, and one detail that makes it>
Layout logic: <the organising idea, plus an ASCII wireframe of the key screen>
Motion character: <one orchestrated moment; what never animates>
Imagery: <what images do here, or why there are none>
We will not: <3–5 specific defaults this direction refuses>
Risk: <what could go wrong, and how we'd know>
```

### `react` (to all directions)
For each direction tile (screenshots plus card):
- one line each of what is strongest and what is weakest *in your lane*
- a stance: `AGREE` (ship this direction), `CHALLENGE`, `BUILD` (what to steal from it) or `CONFLICT` (it breaks your lane's floor)

Then rank the directions from your lane's point of view and say what to combine. Fewer than 60 lines.

### `spec` (your section of the design language)
Write your section exactly as your role brief's "Your spec section" describes. Use real values and tokens (CSS custom properties) that the engineer can render on the system sheet. No lorem ipsum, and no placeholders unless they are marked `TODO(user)`.

### `build-tile`, `build-system`, `build-screens`, `apply` (design engineer only)
See `KB/roles/design-engineer.md`.

### `crit` (role critic, a fresh spawn each round)
INPUTS hold neutral screenshots, `measure.json`, `brief.md` and the reference brief. Critique through your lane:
1. **First impression** in 3–8 words, written before analysis.
2. **Zoom out:** structure, hierarchy, rhythm.
3. **Zoom in:** your lane's details, using your rubric and your knowledge files' Check lines.
4. **Hunt for tells** in your lane.
5. **Subtract mentally:** what in your lane could go?

End the file with exactly one fenced block, labelled as shown:

````
```json studio-findings
{
  "role": "<slug>", "instance": "<a|b|...|>",
  "scores": { "lens": 0, "overall": 0, "rubric": { "<criterion>": 0 } },
  "verdict": "SHIP | POLISH | RETHINK-structure | RETHINK-direction",
  "findings": [
    { "id": "<ROLE3>-01", "severity": "blocker|major|minor|polish", "title": "<short>",
      "where": "<screen, region or selector>", "evidence": "<what you see or measured>",
      "principle": "<named rule (source)>", "target": "<what good looks like: values, tokens or copy>",
      "confidence": "high|med|low", "touches": ["<other role slugs affected>"] }
  ],
  "keep": ["<what works and must survive>"],
  "tells": ["<generated-looking patterns seen in your lane, with location>"]
}
```
````

- `lens` is your lane's quality. `overall` is your honest whole-page score; it is advisory only, because the panel decides.
- ID prefixes:

  | Prefix | Role |
  |---|---|
  | `VIS` | visual designer |
  | `TYP` | typographer |
  | `CON` | content strategist |
  | `IXD` | interaction designer |
  | `PRD` | product strategist |
  | `BRD` | brand designer |
  | `EMO` | emotion designer |
  | `ART` | art director |
  | `MOT` | motion designer |
  | `UXR` | UX researcher |

### `panel` (studio critic)
See `KB/roles/critic.md`. End with one fenced block labelled `json studio-score`:

````
```json studio-score
{"critic":"P1","score":0,"desktop":0,"mobile":0,"verdict":"SHIP|POLISH|RETHINK-structure|RETHINK-direction",
 "intent_match":"strong|partial|weak","first_impression":"<3-8 words>",
 "gaps":[{"gap":"<what>","where":"<where>","fix":"<target>"}],
 "keep":["..."],"tells":["..."],"a11y":["..."]}
```
````

### `cross-crit`
INPUTS hold the round's `ledger.md` and the peers' findings files. For each peer finding that touches your lane, or that you have real grounds to dispute, respond once. Always give a principle. A `CHALLENGE` or `CONFLICT` must include a counter-proposal. Stay silent where you have nothing to add. End with:

````
```json studio-crosscrit
{"role":"<slug>","responses":[{"to":"<finding id>","stance":"AGREE|CHALLENGE|BUILD|CONFLICT","reason":"<principle-based>","counter":"<alternative target, if any>"}]}
```
````

### `debate` (the roles on both sides of a conflict)
INPUTS name one conflict: the finding, both roles' `cross-crit` responses, and, from exchange 2, the other side's previous reply. You are arguing with a colleague, not scoring them. Write a short reply (at most 15 lines) that:
1. States your position in one line.
2. Argues from a named principle and evidence you can see or measure, and says which rung of the ruling ladder is at stake.
3. Answers the other side's strongest point directly.
4. Says what would change your mind.
5. Proposes a target both lanes could accept, if you can find one.

Concede when you are wrong. A colleague who is right in their lane, or who stands on a higher rung, wins. Never re-open anything in SETTLED, never argue for the sake of it, and never pad. End the file with exactly one fenced block:

````
```json studio-debate
{"role":"<slug>","conflict":"<finding id>","exchange":1,"position":"HOLD | CONCEDE | COMPROMISE","proposal":"<the target you would accept, or empty>","rung":"<ladder rung at stake>"}
```
````

The Head reads these blocks; no script parses them.

### `patch` (owner of an accepted finding)
For each finding the Head assigned you in `rulings.md`, write the exact target the engineer needs. Examples:
- final copy strings
- token values
- type scale steps
- state definitions
- the motion curve and duration

Write it as a table: `ID | target | acceptance check`. No code.

### `lineup` (juror)
INPUTS list the images in a lineup folder (A, B, C…). Open each one. You don't know who made which, and it doesn't matter.

Rank them by craft and taste: polish, intentionality, restraint, typographic finesse, spacing discipline, and how memorable each is. Ignore subject matter and differences in content.

For each image, write one line on what puts it where it is. For the top image, name what makes it best. End with:

````
```json studio-lineup
{"juror":"<J1>","ranking":["C","A","D","B"],"notes":{"A":"...","B":"..."},"best_quality":"<what the best does that others don't>","gap_to_best":"<for each lower image, the main gap, keyed by letter>"}
```
````

### `pair` (juror)
INPUTS give you X and Y. Which is the better piece of design, by craft and taste? Same rules as `lineup`. End with:

````
```json studio-pair
{"juror":"<J1>","winner":"X|Y|same","margin":"none|slight|clear","why":"<one or two lines>"}
```
````

### `cut` (deliver)
Walk your lane top to bottom. For each element, ask: what would be lost if this were gone? Write a table:

`element | where | lost if removed | verdict: cut / keep / replace-with-plainer`

Cut anything that adds no information, no action and no state. "It would look emptier" is not a reason to keep something.

### `tells` (deliver)
Using `KB/knowledge/ai-tells.md` and your lane's tells, write a table:

`tell | where | smallest fix`

Fixing a tell means removing or replacing it, never decorating around it.

### `states` (deliver; interaction designer, with the content strategist and UX researcher)
Check every state the work touches, against these lists:
- the 9-state matrix: default, hover, active, focus-visible, disabled, loading, error, empty, success
- partial and offline states
- long text, the narrowest viewport, enlarged text, and dark mode

For each state, report whether it is designed, unstyled or missing, with evidence from the state screenshots.

### `copy-handback` (content strategist)
Extract every user-visible string into `deliver/copy-handback.md` as:

`Where | Current | Why it matters | Rewrite (user)`

- Put first the four lines only the user can truly write: the H1, the primary button, the empty state and the error.
- Leave the Rewrite column blank for the user.
- Flag lines that fail the coffee test: you wouldn't say it to a customer over coffee.
