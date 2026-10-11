# Visual systems

> Used by: visual designer (owner), brand designer, typographer, design engineer. Distilled from: Refactoring UI (Wathan & Schoger), Grid Systems in Graphic Design (Müller-Brockmann), Interaction of Color (Albers), shadcn/ui theming, Craft by Gustavo Fior and its Critly fork, Anthropic's frontend-design skill, Graphical, StyleSeed, open-design craft rules. Written in our own words; see CREDITS.md.

Read this before you pick a single value. Principles generalise, so reason from them when a case is not covered; Values are defaults to beat, not ceilings, and a direction that earns a different number should use it. Judge in context and never apply a rule mechanically: a look is a set of decisions that agree with each other.

## 1. Ground the look in the subject: Subject before style (frontend-design)

Distinctive visual choices come from the subject's own world (its materials, tools, vernacular, era and audience), not from a style library.

- Name the subject, the audience and the page's primary job in one line before touching color.
- List three things specific to that world (a ledger's ruled columns, a kiln glaze, a transit map's line weights) and derive palette, texture and layout logic from them.
- Borrow how a reference works, not how it looks; translate each one into written rules about its type, space and color, because a moodboard alone gives a builder nothing to test.
- Don't start from the kit you used last time; if the plan would fit any product in the category, revise the generic part and say what changed.

Check: cover the logo and headline in the screenshot; a stranger should still guess the subject from palette, imagery and layout alone.

## 2. Set the character before the values: Design-language axes (Graphical)

A design language is a handful of axis settings (style, character, color stance, type voice, iconography, shape, motion), and every token should trace back to them.

- Name the character in one word: airy (generous gaps, larger radii, long pauses between sections), quiet (low-chroma neutrals, a neutral primary action, 400/500 weights), bold (heavy display, saturated accent, high contrast) or compact (32px rows, 13–14px UI text, 4–8px radii).
- Fix the color stance on purpose: mono or tinted neutrals, and whether the primary action wears the brand hue or neutral ink.
- Set density, pace and tone from who uses it, how often and in what state of mind; a tool open all day is compact, instant and quiet, a rare emotional flow comfortable and unhurried.
- Don't let character drift between screens; a dense table inside an airy shell needs a stated boundary.

Check: two critics independently name the same character word from the screenshot; if spacing says airy and radius says compact, flag both values.
Values: rows compact 32px, comfortable 48px; radius precise 4–8px, soft 12–16px.

## 3. Spend boldness in one place: Signature move (frontend-design; Critly: novelty-budget)

One memorable element against a calm, disciplined baseline lands harder than many competing effects; roughly 80% proven pattern and 20% distinctive choice is a useful budget.

- Name the signature move in one sentence (an oversized numeral, one full-bleed photograph, a hand-cut grid break) and make it visible in the first screenshot.
- Keep everything around it quiet: neutral surfaces, one accent, one shadow recipe, no decorative gradients.
- Remove one accessory before shipping; if the page does not get worse, it stays removed.

Check: in the hero screenshot the eye lands on the named move first; a second focal point (a rival saturated block, image or display line) is a finding.

## 4. Prove hierarchy without color: Greyscale first (Refactoring UI; StyleSeed)

If a screen reads correctly in greyscale, color can only add meaning; if it needs color to read, color is covering for weak hierarchy and will not save it.

- Lay out the first pass in greys using only space, size, weight and lightness contrast; add the accent last.
- Re-run the test after every palette change; a new accent often flattens what the greys had separated.
- Don't let hue carry meaning alone: pair red and green with an icon, a sign or a word.

Check: in a greyscale version of each key screenshot, the intended entry point and the primary action are still the first two things the eye finds.

## 5. Rank with weight and tone before size: De-emphasize to emphasize (Refactoring UI; open-design)

Size is the bluntest hierarchy tool; weight, tone and space do most of the work for less, and quieting the neighbours beats making the hero louder.

- Use three text tones (the thing, its details, metadata) and two or three weights that jump rather than step, before adding a size.
- When something won't stand out, lower its neighbours: lighter tone, regular weight, smaller icon, no fill.
- Separate visual from document hierarchy (a modest h1 is right when the data is the hero), and balance weight against contrast (a heavy icon gets a softer tone).
- Avoid both failure modes: flat (every level within a step of the next) and noise (several co-primaries); keep three visible levels above the fold.

Check: measure.json shows 2–3 font sizes per card or row; one element per region reads first; the quietest tone still passes 4.5:1.
Values: text oklch(0.205 0 0) #171717 · details oklch(0.439 0 0) #525252 · meta oklch(0.556 0 0) #737373 (4.7:1 on white).

## 6. Label only what the value cannot say: Labels are a last resort (Refactoring UI)

A label is extra text between the eye and the value; well-formatted data usually explains itself.

- Write the value so it carries its meaning: "12 left" beats "Stock: 12", "Joined March 2024" beats "Join date: 03/2024".
- When a label is needed, make it the supporting element (smaller, quieter, or folded into the value); in spec sheets where people scan for labels, keep them quiet but present and align values in a column.
- Don't put an eyebrow above a heading that already names the section.

Check: every label in the screenshot disambiguates something its value cannot; an eyebrow restating its heading is a finding.

## 7. Build space from a scale with real jumps: Spacing system (Refactoring UI; Critly: spacing-scale)

A spacing scale removes guesswork only when neighbouring steps are far enough apart to be a visible choice.

- Allow only scale values; above 16px, adjacent steps differ by at least about 25%, so 48 against 52 is never a decision.
- Choose by grouping level, not by feel: inside a control, between related items, between groups, between sections.
- Don't use one padding everywhere; uniform spacing is a tell, and contrast in density (tight inside, generous between) is the replacement.

Check: in the screenshot, gaps inside a group are about half or less of the gaps between groups. Check (code): every margin, padding and gap is a scale token.
Values: 4 8 12 16 24 32 48 64 96 128 192 256 px; card padding 16–24, between cards 24–32, between sections 64–128.

## 8. Start generous and group with space before lines: Whitespace over borders (Refactoring UI; Critly: whitespace)

Space taken out of a generous layout looks like a decision, space squeezed into a cramped one looks like an afterthought, and borders are the noisiest way to separate anything.

- Begin with more space than seems necessary, then step down the scale until it feels right; don't stretch a 560px form to fill 1440px.
- Group by proximity (label to field 8, field to field 16, section to section 32+) and give headings about twice the space above as below.
- Separate in order: more space, a faint tint on one group, a shadow on surfaces that contain things, then a line; keep lines for inputs, table rows and dense-list dividers.
- Don't box single paragraphs, nest cards in cards, or draw a border that duplicates a gap.

Check: squint at the screenshot; good spacing leaves a few clear clusters, bad spacing a ladder of even stripes; a box in a box in a box, or a heading equidistant from content above and below, is a finding.

## 9. Divide the page into fields and margins: Modular grid (Müller-Brockmann)

A grid divides the type area into fields separated by constant intervals, and the margins around it are part of the composition, so every size and position is a decision the whole page shares.

- Choose columns for the content's variety (12 on desktop gives halves, thirds, quarters and sixths; 4 on mobile) and hold gutters at one scale value.
- Make vertical intervals whole baseline units so neighbouring fields share baselines, and size images and blocks to whole fields.
- Treat margins as a proportion of the type area (generous reads calm, tight reads urgent), use a wide asymmetric margin for hanging heads or captions, and cap content width so text never runs edge to edge.
- Fix elements with a natural width (sidebars, form columns) and let the content area flex, rather than forcing everything into fluid percentages (Refactoring UI).

Check: overlay columns on the screenshot; text and image edges land on column lines; at 1440 and 1920px the content column holds with intentional margins; at 390px side margins are at least 16px.
Values: 12 columns, 24–32px gutters on desktop; 4 columns, 16px gutters, 16–24px margins on mobile.

## 10. Align to a baseline and to few edges: Shared edges (Müller-Brockmann; Critly: alignment)

Order comes from shared baselines down the page and from as few left edges as possible across it; every new edge is one more thing the eye must resolve.

- Put line-heights and vertical spacing on a 4px unit so adjacent columns share baselines.
- Align text to text, not to boxes: a heading above a card lines up with the card's text inset, not its border; give every box in a section the same inset.
- Hang icons and bullets into the margin when there is room, so text continues the heading's edge.
- Don't let near-misses survive; a 14px inset beside a 12px inset is worse than either alone.

Check: draw verticals through the left edges in the screenshot; 2–3 per section is the target, and neighbouring columns' first baselines align.

## 11. Pace the page, then break it once: Rhythm and the deliberate break (Müller-Brockmann)

Repeated field sizes and intervals create rhythm; one planned violation reads as intent, many read as disorder.

- Vary each section's composition (a full-bleed image, a dense two-column table, one sentence in space) over the same grid, and alternate density so a tight section earns the next one's air.
- Break the grid once per screen with a reason (an image past the margin, a numeral across two fields), and let the breaking element still align to something.
- Don't stack identical sections (eyebrow, centered heading, subtitle, three cards); that is repetition without rhythm.

Check: in a thumbnail of the full-page screenshot, sections have different silhouettes and exactly one element visibly leaves the grid.

## 12. Define the palette up front: Shades, not swatches (Refactoring UI; Critly: oklch)

A working palette is 8–10 shades of a tinted grey, 5–10 of the primary and a few of each status hue, defined before screens rather than picked one at a time.

- Build ramps in OKLCH: fix the hue, step lightness evenly, and taper chroma at both ends, because very light and very dark colors cannot hold much chroma in sRGB.
- Choose the base shade (the button fill) first, then the darkest (text on a tint) and lightest (a tinted background), then fill between; gamut-check every step.
- When a light shade looks washed out, rotate its hue slightly toward the nearest bright hue (yellow, cyan, magenta); when a dark one looks dull, toward red, green or blue.
- Interpolate gradients in OKLCH so midpoints don't turn grey; never invent a hex inside a component, extend the ramp instead.

Check: a badge built from the same two steps looks equally contrasted in every hue on the system sheet. Check (code): every color is a ramp step or role token.
Values: L ≈ 0.97 0.93 0.87 0.78 0.68 0.58 0.48 0.39 0.30 0.22; chroma peaks mid-ramp (0.12–0.20), tapering to 0.02–0.05.

## 13. Tint the greys: Saturated neutrals (Refactoring UI; Critly: color-roles)

Pure grey beside a saturated accent looks unrelated; a trace of hue makes neutrals and accent read as one palette.

- Tint neutrals toward the brand hue for coherence, toward blue for cool and precise, toward yellow-orange for warm and human.
- Keep the tint low enough that greys still read as grey; choose pure grey only as a stated decision for a mono, instrument-like character.
- Don't reach for cream and near-black as default warmth; if the brief wants warmth, derive it from the subject's materials.

Check: on the system sheet a neutral swatch beside the accent looks related; a supposedly neutral page that reads blue or beige overall is over-tinted.
Values: neutral chroma 0.005–0.015 at the brand hue; by about 0.03 the greys become a color.

## 14. Give every color a job: Roles, not decoration (Critly: color-roles; open-design)

Neutrals do almost everything, the accent marks what you can do and where you are, and status colors report state and never decorate.

- Use the accent for the primary action and the current selection; links and focus rings spend the same budget.
- Reserve green, amber and red for success, warning and danger; if the brand hue is red or green, move status hues away or pair them with icons.
- Plan pixel shares before CSS: neutrals 70–90%, one accent 5–10%, status 0–5%, effects under 1% (a studio default).
- Don't color headings, decorative icons, or every badge with the accent; a color on sixteen elements means nothing.

Check: count accent uses per screen in the screenshot (about 2 visible, rarely more); any status color used decoratively is a finding.

## 15. Never set grey text on color: Hue-matched foregrounds (Refactoring UI)

Grey text on a colored surface looks dead and often fails contrast; secondary text on color should be a shade of that color.

- Pick a lighter or darker step of the background's own hue for secondary text, adjusting chroma rather than mixing toward grey.
- Use white or near-black at reduced opacity only where the background varies (images, gradients).
- To pass contrast, flip the pairing (dark text on a light tint) or shift lightness before giving up the hue.

Check: secondary text on any colored or dark band in the screenshot shares the band's hue; measure.json lists no contrast failures on colored surfaces.

## 16. See each color with its neighbours: Relative color (Albers)

A color is never seen alone: the same swatch reads lighter, darker, warmer or duller depending on its surround, and two different swatches can look identical.

- Judge every token on the surfaces it will sit on, in both themes, never as an isolated chip.
- Expect simultaneous contrast: a grey on a blue band looks warm, the same grey on orange looks cool; measure first, then correct by eye.
- When a color looks wrong in one place only, change its surround or its quantity before you change the token.

Check: the system sheet shows each brand and status color on page, card and dark surfaces, and critics judge those composites, not the swatch row.

## 17. Control quantity and placement: Color weight (Albers)

The same palette in different proportions makes a different picture; a color's strength depends on how much of it there is and where it sits.

- Give high-chroma colors small areas and low-chroma colors large fields; an accent covering 40% of the screen stops being an accent.
- Place the accent where attention should land (the action, the selection), not at the edges where it drags the eye away.
- Lower chroma as area grows: full-bleed fields near 0.02–0.06, buttons and dots up to 0.15–0.20; never scale a small-area color to a section unchanged.

Check: in the hero screenshot the raw accent covers under about 10% of the area, unless a full-bleed accent field is the named signature move.

## 18. Manage the edges between colors: Vibration and transparency (Albers)

Hues of equal lightness and strong contrast make their shared edge flicker, and overlapping colors read as transparent only when the overlap looks like a believable mix.

- Separate adjacent saturated hues with a lightness step (about 0.15 OKLCH L, a studio default) or a neutral gap.
- Watch saturated text on saturated grounds (red on blue, green on magenta); it vibrates even when the ratio passes.
- Make overlaps of tinted or layered surfaces a mix of their two parents; an arbitrary third color breaks the illusion.

Check: zoom the screenshot wherever two saturated colors touch; a shimmering edge or text that is hard to hold in focus is a finding.

## 19. Pair every surface with its foreground: Semantic tokens (shadcn; Critly: design-tokens)

Components use role names, never raw values, and every surface token ships with the foreground that sits on it, in light and dark.

- Define pairs for background, card, popover, primary, secondary, muted and accent, plus destructive, border, input and ring.
- Name by job (surface-raised, text-muted, radius-control), not value (gray-100, blue-600), and keep the raw ramp as a private layer beneath the roles.
- Treat a value no token covers as a design conversation that adds a token, not a hex code in a component.
- Don't write per-component dark overrides; the roles switch and the components stay untouched.

Check: the system sheet renders every pair as text on its surface with the measured ratio (text 4.5:1, large text and UI edges 3:1). Check (code): no hex, rgb or raw palette class in components.
Values: --background/--foreground, --card, --popover, --primary, --secondary, --muted, --accent (each with -foreground), --destructive, --border, --input, --ring.

## 20. Design dark mode as a second theme: Lighter means closer (Critly: dark-mode; Craft: html-background)

An inverted palette loses its edges and glares; dark mode lifts higher surfaces with lightness, softens both extremes and rechecks every color.

- Avoid pure black and pure white: page near L 0.17, each raised level a step lighter, body text near L 0.945.
- Raise accent lightness and cut its chroma, then re-measure, because a color that passed on white can fail on dark grey.
- Draw edges with a faint inner highlight, set color-scheme, and paint the html background with the page token so scrollbars and overscroll match.

Check: in dark screenshots page, card and menu are distinguishable at a glance, with no #000 field and no #fff body text, and measure.json shows no new contrast failures.
Values: page oklch(0.17 0 0), card 0.205, popover 0.24 (about +0.035 L per level), text 0.945, accent L ≈ 0.72 at about half its light chroma.

## 21. Derive radius from one value and nest it: Concentric corners (shadcn; Craft: nested-border-radius; Critly: squircles)

Radius is personality, so set it once and derive the scale; nested corners share a center, so the inner radius is the outer radius minus the inset.

- Derive steps from one base (0.6×, 0.8×, 1×, 1.4×, 1.8×) so changing the base reshapes the whole system.
- Vary radius by rank: controls small, cards larger, sheets and dialogs larger still, full pills only for tags and toggles; one radius on everything is a kit tell.
- Compute inner = outer − inset, never below zero; a 16px card with 8px padding holds media at 8px.
- On large radii over small objects (avatars, app tiles) consider corner-shape: squircle on inner and outer boxes alike, raising the radius until it looks as soft.

Check: in the screenshot nested curves look parallel with a constant gap, and controls and containers visibly differ in radius.
Values: --radius 0.625rem; corner-shape superellipse(2).

## 22. Build depth from layered light: Shadows lit from above (Refactoring UI; Critly: shadows-not-borders)

Several faint shadows read as one real shadow, one strong blur reads as a filter, and light always comes from above.

- Build the base from three layers: a 1px ring for the edge, a tight contact shadow under the bottom edge, a soft ambient layer; add layers for higher surfaces, keeping the first two identical.
- Give raised elements a lighter top edge and a shadow below, sunken ones (inputs, wells) the reverse.
- In dark mode draw the edge with light (a faint inset ring and top highlight) and keep outer shadows only for separation.
- Don't hang the same soft grey blur (0 4px 12px rgba(0,0,0,.1)) under every card.

Check: shadows in the screenshot are felt rather than seen, consistent in direction, and present only on surfaces that contain things.
Values: 0 0 0 1px rgb(0 0 0/.06), 0 1px 2px -1px rgb(0 0 0/.06), 0 2px 4px rgb(0 0 0/.04); dark adds inset 0 1px 0 and inset 0 0 0 1px at white/.03.

## 23. Frame images and protect text on them: Image edges and overlays (Craft: image-outlines; Refactoring UI)

Images don't know what is behind them, and text over a photo needs steady contrast across every pixel it crosses.

- Draw a 1px inset outline on images and avatars (black at about 10% on light, white at about 10% on dark) so pale edges keep a shape.
- For text on images, add a scrim or gradient overlay, lower the image's contrast, colorize it toward one hue, or use a large-blur text shadow; test over the busiest region.
- Source or generate images as a set (one light direction, palette, lens and grade), crop with intent, and show product screenshots at true scale.

Check: every image in the screenshot has a visible edge on light and dark; text over images passes 4.5:1 at its worst spot; images share light and grade.
Values: outline 1px, offset −1px, 5–20% opacity (10% default).

## 24. Add texture with grain, not glow: Noise (Craft: noise)

A faint layer of noise breaks gradient banding and gives flat color a material feel without adding a decorative object.

- Lay fractal noise over a surface at low opacity in an overlay blend, isolated so it blends only with that surface; tile a small pre-rendered image on large or scrolling surfaces.
- Tie the texture to the subject (paper tooth, film grain, concrete) and keep one kind across the system.
- Don't fill space with glows, halos, blobs and gradient meshes; grain is the replacement when flat feels too flat.

Check: no visible banding in gradients, and grain is felt rather than noticed at 100% zoom. Check (code): isolation on the surface, a tiled image for full-bleed areas.
Values: baseFrequency 0.8, numOctaves 3, opacity 0.08, mix-blend-mode overlay, 200px tile.

## 25. Keep one icon voice: Icons are type (Critly: icons; Craft: optical-alignment)

An icon set is a small alphabet with its own stroke, corners and grid, and mixing sets reads like mixing typefaces mid-sentence.

- Pick one library and one weight (or one duotone treatment), and confirm it covers every icon the product needs before committing.
- Match icon weight to the adjacent text, size inline icons in em, and center them by visual weight: blur to find the mass, then nudge (a play triangle shifts toward its point).
- Don't put an icon beside every heading or a check beside every bullet, and never use emoji as icons.

Check: line up every icon from a screen in one row; one that looks drawn by another hand is a finding; icon-only buttons look centered when blurred.
Values: inline icons 1.1–1.25em; stroke 1.5–2px at 24px.

## 26. Finish with details, not decoration: Finishing touches (Refactoring UI; Craft: html-background; Critly: scroll-fades)

What separates studio-grade from competent is a set of small upgrades to defaults that nobody notices one at a time.

- Upgrade defaults: icons as bullets only where they mean something, quotes set as display elements, links styled to the system.
- Add color where it orients, on straight edges only: a short accent bar on the active nav item, a tinted header band; a colored left border on a rounded card is a tell.
- Paint the html background and set theme-color; fade only the scroll edge that has more content (a mask of about 2–2.5rem).
- Design empty, loading and error states in the same type, color and imagery as the full state.

Check: state screenshots (empty, loading, error, partial) look like the same product; overflowing rows fade on the scrollable side only.

## 27. Hunt the visual slop clusters: Defaults are not choices (frontend-design; Critly: timelessness; open-design)

Generated design clusters around a few looks that appear whatever the subject; builders apply the replacements, critics hunt the patterns, and each look is legitimate only when the brief asks for it.

- SaaS-card kit (identical rounded cards, one radius, one soft grey shadow, gradient washes): vary composition, use a radius ladder, layered shadows and solid fields.
- Cream near #F4F1EA with serif display and terracotta, or near-black with one acid green or vermilion: a palette from the subject's materials.
- Default indigo and violet accents (#6366f1, #4f46e5, #8b5cf6, #7c3aed), two-stop purple-to-blue heroes, gradient text, glass cards, neon glows: solid ink, one light source, real surfaces.
- Broadsheet pastiche and template chrome (hairline rules as decoration, tracked caps eyebrows, #0B0B0B for black, an arrow on every link): decide each one or remove it, asking whether it would still make sense if the trend vanished tomorrow.

Check: run the screenshot against this list and `kb/knowledge/ai-tells.md`; any cluster present without a brief that asked for it is a finding, with its replacement named.

## When these conflict

- Legibility beats palette fidelity: shift a token's lightness rather than accept a failing pair.
- Structure beats surface: when spacing and an effect compete, fix the spacing and drop the effect.
- The signature move outranks system consistency only inside its one place; everywhere else the system wins.
- The user's references set the look; these principles set the floor the references must still clear.
- Between two candidate values, take the one on the scale, then the quieter one.

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
