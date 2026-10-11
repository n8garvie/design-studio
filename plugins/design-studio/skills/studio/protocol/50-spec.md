# 50 Spec

The goal is one design language with one owner per section, rendered as a system sheet that everyone can see and critique before screens exist.

## 1. Owners write their sections, in parallel

Every roster role gets `TASK: spec`.
- INPUTS: `brief.md`, `define.md`, `discover/reference-brief.md`, the chosen card and tile shots, `decisions.md`, and their own discover file.
- OUTPUT: `spec/<role>.md`.

| Role | Section |
|---|---|
| Product strategist | Job statement, primary goal, success criteria, scope (in, out, later), anti-goal |
| Content strategist | IA and section order, navigation labels, the full copy deck, microcopy for every state |
| Interaction designer | Flows, screen inventory, the state matrix, microinteractions, keyboard and focus order, error prevention and recovery |
| Visual designer | Color tokens (light and dark, semantic pairs), spacing scale, grid, radius and shadow recipes, imagery direction, iconography, greyscale hierarchy |
| Typographer | Families, scale, line heights, measure, tracking table, numerals, wrap rules |
| Brand designer | Signature move, identity notes, narrative and section order for marketing surfaces |
| Emotion designer | Emotional target and arc, peak and end, trust points, delight budget, personality |
| Guests (if invited) | Art director: image system and image list. Motion designer: motion tokens and choreography. UX researcher: personas, walkthroughs, stress dataset. |

## 2. Assemble `direction.md` (you)

Use `KB/templates/direction.md`.
- Each section keeps its owner's content. You resolve overlaps with the ladder and note each ruling in `decisions.md`.
- Consolidate every token into one `:root` / dark-theme block draft.
- Check every text and UI color pair. If a pair fails, the visual designer supplies a darker or lighter step of the same hue, never grey.

  ```
  node SCRIPTS/contrast.mjs --pairs SESSION/spec/pairs.json
  ```

## 3. Render the system sheet

Spawn the `design-engineer` with `TASK: build-system`.
- INPUTS: `direction.md` and `spec/*.md`.
- OUTPUT: `build/system.html`.

Then capture it:

```
node SCRIPTS/shoot.mjs SESSION/build/system.html --out SESSION/build/shots/system --viewports desktop --tiles 3 --measure --critic-copy SESSION/build/critic-view
```

## 4. One system critique, before any screens

1. Spawn the visual designer, typographer and interaction designer, plus the motion designer if invited, each with `TASK: crit`.
   - INPUTS: the system `criticFiles`, `measure.json` and `direction.md`.
   - OUTPUT: `build/system-crit/crit/<role>.md`.
2. Tally it:

   ```
   node SCRIPTS/tally.mjs --round SESSION/build/system-crit
   ```
3. Rule on the findings, then hand the accepted items to the engineer as an `apply` task.

There is no panel here. The system sheet is a tool, not the product.

Update `state.md`: phase build.
