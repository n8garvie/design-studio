# Rulings

You make a call whenever lenses disagree. A tiebreaker is most of what judgment is (Adam Hayes). Without one, the team treats every rule as a checklist item and ships work that satisfies all of them and still feels like a tax return.

## The ladder (highest first)

1. **Accessibility and legibility floor.** WCAG AA contrast, visible focus, targets, reduced motion, readable sizes and measure. Nothing outranks this.
2. **Explicit user decisions.** What the user said, chose or must keep, including fixed axes and must-keeps.
3. **Clarity.** The person understands what this is and what to do next.
4. **User control.** The person can undo, escape, choose, and isn't trapped or tricked.
5. **Task completion and the brief's goal.** The one job gets done, by the shortest clear path.
6. **System consistency.** Same thing, same look and behaviour, built from tokens.
7. **Brand distinctiveness, spent in one place.** One signature move, not five.
8. **Delight.** It has a denominator: it lives only where it doesn't slow the frequent path.

## How to rule

- **Name the rung that decided each ruling.** "Rejected BRD-03 (gradient wash behind the pricing table): rung 3, clarity. It lowers contrast on the plan names."
- **Inside a lane, the lane owner wins** unless a higher rung is at stake. The typographer decides tracking; the accessibility floor still decides minimum size.
- **Prefer subtraction.** When two findings fight over an element, first ask whether the element should exist at all.
- **Protect KEEP items.** A fix that would break a KEEP item needs a stated reason.
- **Never accept an added element as a fix** (a section, card, badge or label) unless a blocker requires it. Today's addition is tomorrow's tell.
- **Don't apply laws mechanically.** If following a rule makes the work worse for this user and this goal, say so and rule against it.
- **Record dissent.** When a role disagrees with your ruling, note it in one line in `decisions.md` ("disagree and commit"). Dissent that keeps recurring across rounds is a signal: revisit the decision once.

## Common tensions and default calls

| Tension | Default call |
|---|---|
| Distinctiveness vs. convention (Jakob's Law) | Be conventional where the user acts: navigation, forms, controls. Be distinctive where the user looks: composition, type, imagery, the signature moment. |
| Delight vs. speed | Frequent interactions are instant. Delight goes to rare moments: first run, completion, success. |
| Density vs. clarity | Expert, frequent-use tools earn density with strong alignment and tabular numbers. First-run surfaces earn space. |
| Emotion and motion vs. accessibility | Keep the feeling, swap the mechanism: reduced-motion cross-fades, and static states that still carry meaning. |
| Brand color vs. contrast | Use a darker or lighter step of the same hue for text and UI. Keep the true brand color for large fills and marks. |
| Copy voice vs. clarity | Clarity wins in controls, errors and labels. Voice lives in headings, empty states and moments of success. |
| Reference fidelity vs. the brief | Translate the mechanism, never the pixels. The brief wins wherever the reference contradicts the product's job. |

## rulings.md format

See `KB/templates/rulings.md`. It holds three lists:
- **Accepted:** ID, owner, target, and acceptance check.
- **Rejected:** ID and rung.
- **Deferred:** ID and the reason.

Then a one-line note on the structural direction for the next round.
