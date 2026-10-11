# Direction: <name>

> The design language. One owner per section. Settled once Spec is ruled on; changes go through decisions.md.

**Aesthetic statement:** <one sentence> · **Emotional target:** <...> · **Signature move:** <one>

## Product (owner: product-strategist)
Job, primary goal, success criteria, scope (in / out / later), anti-goal.

## Content (owner: content-strategist)
IA and section order (with each section's job), navigation labels, copy deck (link spec/content-strategist.md), voice rules.

## Interaction (owner: interaction-designer)
Flows, screen inventory, state matrix, microinteractions, keyboard and focus order, error prevention and recovery.

## Visual (owner: visual-designer)
Color tokens (light and dark, semantic pairs, contrast ratios), spacing scale, grid, radius and shadow recipes, imagery direction, iconography.

## Type (owner: typographer)
Families and fallbacks, scale (ratio, rem), line heights, measure, tracking table, numerals, wrap rules.

## Brand (owner: brand-designer)
Identity notes, narrative and section order for marketing surfaces, how the signature move shows up.

## Emotion (owner: emotion-designer)
Arc, peak and end, trust and anxiety points with mitigations, delight budget, personality.

## Guests (if invited)
Art director: image system and list · Motion designer: motion tokens and choreography · UX researcher: personas, walkthroughs, stress dataset.

## Tokens (consolidated)
```css
:root {
  /* color, type, space, radius, shadow, motion */
}
@media (prefers-color-scheme: dark) { :root { } }
```

## We will not
- <specific defaults this direction refuses>
