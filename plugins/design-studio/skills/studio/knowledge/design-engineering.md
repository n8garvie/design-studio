# Design engineering

> Used by: design engineer (owner), interaction designer, visual designer, motion designer, critic. Distilled from: the desengs.com reading list (Kathryn Gonzalez, Vercel's design engineering team, M.A. Baytaş, Andy Zhang, Marcel Wichmann, floguo, designengineer.xyz, Maggie Appleton, Brad Frost, Rauno Freiberg, Emil Kowalski, Jakub Krehel, Benji Taylor, Geoff Teehan, Raphael Salaja, ibelick, Chris Burnell, Yep! Type, ref.tools, Tim Wilson, Juliette of shedsgns) and designengineer.tools, curated by James Warner. Written in our own words; see CREDITS.md.

This file covers the decisions made in code that decide whether an interface feels right. Principles generalise, so reason from them; Values are defaults to beat, not ceilings. Motion tokens live in `kb/knowledge/motion-sound.md`, type in `kb/knowledge/typography.md` and the accessibility floor in `kb/knowledge/accessibility.md`; this file is about how and when to apply them. The toolbox lists instruments, not requirements: prefer the platform and the project's stack, and add a dependency only when the project allows it.

## 1. Design in the final medium: Material understanding (Gonzalez; floguo; Vercel)

Treat code and pixels as one material, and decide motion, keyboard, touch and states where people will meet them.

- Prototype in code anything that moves, responds to input or depends on real data; static frames cannot show it.
- Build the states (empty, loading, error, partial, success) as real branches of the components, not as extra mockups.
- Weigh implementation cost against experience impact out loud; an effect that is not the focus may not be worth its cost.
- Don't hand off or approve a screen you have not seen running in a browser at real widths.

Check: the state board renders every state with the same components as the main screen. Check (code): states are branches of one component, not separate static pages.

## 2. Own the outcome, not the artifact: Outcome ownership (Gonzalez; Vercel; Zhang)

The job is what ships and how it feels in use; matching the comp is only a step on the way.

- Look for the fix across copy, design and code; a three-word change can beat a new component.
- Treat papercuts, bug reports and real data as design input, not as noise.
- Raise a wrong spec with the role that owns it (tag `@role` in the finding) and propose the target instead of building around it.
- Don't stop at "matches the spec" when using it shows the spec is wrong.

Check (code): the build notes record at least one decision made because of how something felt in use, with the before and after values.

## 3. Feel it before you argue about it: Build to learn (Freiberg; Krehel; Kowalski)

Feel can only be judged in the medium, so try variants quickly, live with them, and keep the one that still feels right after repeated use.

- Build two or three variants of an interaction and compare them side by side, at full speed and slowed to 0.25x.
- Use an interaction twenty times, not twice, before calling it done; sluggishness and annoyance show up with repetition.
- Explain why the winner works in one sentence (a curve, a threshold, a metaphor) so the reason survives into the tokens.
- Don't keep a flourish because it impressed you the first time.

Check (code): the build log names the variants tried and the reason one won, and the shipped tokens match the winner.

## 4. Use AI to go faster, never to decide: The human filter (Krehel; Juliette, shedsgns; designengineer.xyz; Wilson)

Agents make the first version cheap; judging what to keep, cut and refine is the part that stays human, and skipping it is how generic work ships.

- Treat the first generated result as a draft to question, never as the answer.
- Understand every change an agent makes; ask it to explain anything you could not have written yourself.
- Start every agent task as if it has no context: give it the codebase rules, the tokens and the target values.
- Don't hand over decisions about hierarchy, rhythm, restraint or what not to build.

Check: in critique, the screen shows no generated default the brief did not ask for (critics use `kb/knowledge/ai-tells.md`; the builder does not read it while building).

## 5. Remove what the generator adds: Subtract first (ref.tools; Teehan)

Agents and templates add belt and braces: extra copy, icons, borders, wrappers and states nobody asked for, and every one becomes upkeep.

- After each generated pass, ask of every element whether it is needed, and delete before polishing.
- Merge duplicate utilities and re-implemented components: one button, one card recipe, one input.
- Treat each new control as a small mortgage: a place in the hierarchy, states, copy and maintenance.
- Don't polish an element you have not decided to keep.

Check: no element in the screenshot lacks a job (an icon on every heading, helper text that repeats the label, a border inside a border); measure.json shows one style per component type.

## 6. Escape prototype gravity: Variants before grafting (ref.tools)

The first version built inside the real codebase tends to become the one that gets refined, so explore away from it first.

- Explore three or four directions in throwaway surfaces (style tiles, standalone HTML, a design tool) before touching product code.
- Choose the direction, then build it into the system.
- Keep exploration code out of the product until a direction is chosen.
- Don't refine the first thing that rendered just because it already exists.

Check: the Develop phase shows two or three style tiles that differ in more than colour, and the build follows the chosen tile, not the first draft.

## 7. Fix the constraint, not the symptom: No design whack-a-mole (ref.tools; Alexander)

When feedback arrives, check first whether it changes the constraints; spot fixes pile up into a patchwork that favours interactions at random.

- Keep a papercut log: fix obvious bugs now and batch the rest into one coherent pass.
- Restate the constraints (content, states, sizes, frequency of use) and redesign the region when one of them changes.
- Answer "make X more prominent" by deciding what becomes quieter.
- Don't add an affordance per complaint.

Check: across crit rounds, the number of distinct emphasis treatments on a screen does not grow, and fixes reuse existing tokens.

## 8. Build the system before the screens: Showcase first (ref.tools; Frost; Gonzalez)

A component library reviewed on its own page is the handshake between look and behaviour, and it keeps screens consistent.

- Build each component with every state on `system.html` before composing screens.
- Keep presentation apart from logic so a component can be reviewed without the app.
- Expose real variants for what the design needs instead of forking components inside screens.
- Don't style inside a screen; if a screen needs a new look, the component needs a variant.

Check: the system sheet shows every component in default, hover, active, focus-visible, disabled, loading, error, empty and success, and no screen contains a component missing from the sheet.

## 9. Use the platform first: Native before custom (Burnell; Interfaces cheat sheet; Freiberg: web interface guidelines)

Native elements carry behaviour people rely on (middle-click, the context menu, Enter to submit, focus order, autofill) that custom rebuilds forget.

- Use `<a>` for navigation and `<button>` for actions; wrap inputs in a `<form>` so Enter submits, and let each label focus its input.
- Reach for `<dialog>`, the `popover` attribute, exclusive `<details name>` groups and `loading="lazy"` before JavaScript, and check their accessibility gaps.
- Give inputs the right `type`, `inputmode` and `autocomplete`, and never block paste.
- Don't build a div that behaves like a link or a button.

Check (code): no click handlers on non-interactive elements; every input has a label and a correct type; menus and dialogs close on Escape and return focus.

## 10. Decide each motion by trigger and frequency: None, transition or keyframes (Kowalski; Freiberg; Krehel)

Whether to animate depends on how often people see it and what started it; the right answer for daily, keyboard-driven actions is usually no animation.

- Give keyboard-initiated and high-frequency actions (command menus, list navigation, hover on trivial rows) an instant change.
- Use transitions or springs for interactions, because they retarget mid-flight; keep keyframes for one-off sequences.
- Grow elements from their trigger (`transform-origin` at the trigger) and make exits shorter and quieter than entrances.
- Don't animate on page load unless it is the one intended moment, and never write `transition: all`.

Check (code): command menus and keyboard-driven list movement have no transition; transitions name their properties; interface durations stay at or under 300ms.
Values: use the duration and easing tokens in `kb/knowledge/motion-sound.md` (0ms for hover and keyboard toggles, 100–300ms for interface changes); press `scale(0.97)`; first tooltip after 400–700ms, neighbours instantly.

## 11. Respond during the gesture: Fluid input (Freiberg)

Gestures feel direct when the interface moves with the finger from the first pixel and commits at the moment that matches the action's weight.

- Apply the gesture's delta immediately (drag, pinch, swipe) and animate only past the threshold.
- Trigger light actions mid-gesture once elements reach their logical place; commit destructive ones only on release, whatever the distance.
- Keep the momentum and direction of a throw when the gesture ends.
- Keep a drag alive when the finger slips off a small target, and show what the finger covers.

Check (code): drag and swipe handlers update on pointer move; destructive gestures commit on pointer up; an animation interrupted mid-flight reverses from its current position.

## 12. Keep spatial continuity: Never teleport (Taylor, Family Values)

People stay oriented when elements travel instead of disappearing and reappearing, and when movement matches where things live.

- Move a persisting element to its new place rather than fading one copy out and another in.
- Match direction to position: a tab on the left slides in from the left, and a sheet leaves the way it came.
- Morph labels that change meaning in place (Continue to Confirm) so the change is noticed, and keep unchanged words still.
- Don't duplicate a component that is already on screen during a transition.

Check (code): persisting elements move with a shared-layout or FLIP transition rather than a cross-fade between two copies, and the direction of travel follows the source position.

## 13. Reveal complexity in context: Trays, not pages (Taylor, Family Values; Teixeira)

Short, transient tasks feel lighter and safer when they open from their trigger over the current context than when they replace the page.

- Put confirmations, warnings and short multi-step flows in sheets or trays anchored to their trigger, with the context still visible.
- Give each step one piece of content or one action, and let step heights differ so progress is felt.
- Use time as an axis: show what is relevant now and reveal the rest when it becomes relevant.
- Don't send people to a full page for a two-step decision.

Check: a transient flow in the screenshots keeps the originating content visible, and each step shows one primary action.

## 14. Place delight where frequency is low: Delight-impact curve (Taylor; Freiberg; Kowalski)

Surprise wears out with repetition, so the payoff from delight rises as an interaction gets rarer.

- Rank interactions by frequency and spend surprise on the rare ones: first run, finishing a security task, an empty state.
- Keep frequent paths fast and quiet, and give them small useful details instead (a sliding comma, a steady counter).
- Hide easter eggs in plain sight where meeting them again will not annoy.
- Don't put a celebration on an action people take every day.

Check: the motion spec lists every animated interaction with its frequency, and no high-frequency interaction animates for longer than 200ms.

## 15. Polish evenly: No dirty bathroom (Taylor, Family Values)

People judge a product by its least cared-for corner, so settings, empty states, errors, the 404 and the share card get the same care as the hero.

- List the rare surfaces and give each a pass against the same rubric.
- Give rare moments a lower intensity of delight rather than none.
- Build them from the same components and tokens; rare screens drift first.
- Don't ship default framework pages or unstyled system emails.

Check: screenshots of the empty, error, 404 and settings states score within one point of the main screen on the rubric.

## 16. Finish with optical details: Details that make interfaces feel better (Krehel; Interfaces cheat sheet)

Interfaces feel better through many small corrections that compound; each one is cheap once it is part of the system.

- Nest radii concentrically (outer equals inner plus padding) and align icons optically, trimming padding on the icon side of a button.
- Use layered shadows instead of borders on raised surfaces, and a 1px inset outline at about 10% opacity on images.
- Balance headings, pretty-wrap short paragraphs, and use tabular figures wherever numbers change.
- Don't change font weight on hover or selection; it shifts the layout.

Check: nested corners look parallel in the screenshot and image edges hold on similar backgrounds. Check (code): `text-wrap` and `tabular-nums` are set where they apply.
Values: `box-shadow: 0 0 0 1px rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06), 0 2px 4px rgb(0 0 0 / .04)`; images `outline: 1px solid rgb(0 0 0 / .1); outline-offset: -1px`.

## 17. Choose a UI face by its metrics: Cap-centred metrics (Yep! Type)

A UI font is easy to build with when its cap height sits centred in the line box and its x-height is tall, because labels then centre with one padding value.

- Test centring by tightening line-height on a large capital H: the box should meet the cap height and the baseline at the same moment.
- Prefer an x-height of 70–75% of the cap height for labels, so a word reads as a block and centres optically.
- Where supported, trim the box with `text-box: trim-both cap alphabetic`, with a fallback (Firefox lacked it in mid-2026).
- Don't hand-nudge padding per button size to fake centring.

Check: button labels look vertically centred at every size in the screenshot. Check (code): one vertical padding token per control size and no asymmetric padding hacks.
Values: x-height to cap height 0.70–0.75 (Inter and SF Pro sit near 0.75, per Yep! Type).

## 18. Never take the input away: Live input (ibelick; Interfaces cheat sheet)

Inputs stay usable in every state, because people correct, retype and change their minds while the system works.

- Keep typing possible while loading, streaming and after an error.
- Keep submit enabled until a request starts, then turn send into stop; validate on submit and move focus to the first invalid field.
- Show errors next to what failed (the field, the generation) with a retry, not in a toast.
- Don't let the input jump, steal focus or block paste.

Check: loading and error screenshots show an enabled input and an inline error with a retry action. Check (code): no `disabled` on the text field while streaming; invalid fields carry `aria-invalid` and `aria-describedby`.

## 19. Make every target honest: Input hygiene (Freiberg: web interface guidelines; Interfaces cheat sheet)

Pointer and touch behaviour should match what people see: no dead zones, no sticky hovers, no decorations that swallow clicks.

- Remove dead zones between list items by extending padding so the whole row responds.
- Put decorative layers under `pointer-events: none`, and hover styles inside `@media (hover: hover)`.
- Open menus on pointer down, delay the first tooltip and open its neighbours instantly, and never put a tooltip on a disabled button.
- Don't set inputs below 16px on iOS or autofocus fields on touch devices.

Check: measure.json tap targets are at least 24px (44px on touch) and input text at least 16px. Check (code): hover rules sit inside the hover media query.

## 20. Keep effects cheap: Performance as craft (Freiberg: web interface guidelines; Vercel)

Dropped frames read as broken, so effects are chosen and built for what the device can run.

- Animate `transform` and `opacity`; keep large blur radii off big surfaces.
- Replace blurred shapes that band with radial gradients or a little noise.
- Pause loops and videos off screen; add `will-change` only to fix a measured problem (such as a 1px shift in Safari) and remove it afterwards.
- Disable transitions during theme switches, and write fast-changing values to the DOM directly instead of re-rendering.

Check (code): no animated layout properties, off-screen loops pause, and no global `will-change`.
Values: backdrop blur at or under 20px on large surfaces (studio default); smooth at 4x CPU throttling.

## 21. Tune with instruments, not adjectives: Measure the feel (Kowalski; DialKit; easing.dev)

Feel gets fixed with numbers: expose the values, compare them, and write the winners down.

- Wire the values you are tuning (duration, curve, spring, radius, shadow) to live controls while you iterate.
- Compare candidates side by side and slowed down, and record them.
- Write the winning numbers into tokens and the spec with their reason.
- Don't describe motion or depth as "smooth" or "subtle" in a finding; give the numbers.

Check: findings and spec lines give numeric targets (ms, cubic-bezier, spring stiffness and damping, px, opacity), never adjectives alone.

## Toolbox

From designengineer.tools and the desengs.com resource feed (captured 2026-10-11; snapshot in the repo at `sources/`). Each line reads `tool — url — when to reach for it`. Most libraries here are React; when the build is plain HTML, use them as references for behaviour and values.

Type
- Fonts In Use — https://fontsinuse.com — check what a face says in real use before committing to it.
- Free Faces, Fontshare, UNCUT — https://www.freefaces.gallery, https://www.fontshare.com, https://uncut.wtf — free faces with character when the project has no font budget.
- Butterick's Practical Typography — https://practicaltypography.com — settle a rule of composition (quotes, dashes, spaces).
- kugiri — https://edoardolunardi.github.io/kugiri — split text into the lines the browser already broke, for per-line reveals.
- Torph and Calligraph — https://torph.lochie.me, https://calligraph.raphaelsalaja.com — text that morphs between states (label changes, counters of words).

Colour and gradients
- OKLCH picker and OKLCH.fyi — https://oklch.com, https://oklch.fyi — build palettes in OKLCH with gamut warnings and even lightness steps.
- Color.review — https://color.review — check every text pair for contrast and find a readable neighbour.
- Easing Gradients — https://larsenwork.com/easing-gradients — remove hard edges from gradients and scrims with eased stops.
- Design Tokens Generator — https://design.dev/ai/design-tokens-generator — turn brand colours into semantic CSS variables with dark mode, as a starting point to edit.

Motion and easing
- Easing Graphs and easings.net — https://www.easing.dev, https://easings.net — pick and compare curves with their cubic-bezier values.
- Anime.js easing editor — https://animejs.com/easing-editor — shape a curve or spring visually and export it.
- DialKit — https://joshpuckett.me/dialkit — live sliders and spring editors wired to UI values while tuning (principle 21).
- Transitions.dev — https://transitions.dev — reference implementations of common transitions (menus, modals, badges, number pops).
- interior.dev — https://www.interior.dev — micro-interactions for the half-second after a click.
- morphicons and Morphrig — https://www.morphicons.com, https://morphrig.dev — icon morphs and how point correspondence works.
- Rive, Lottie Creator, Jitter — https://rive.app, https://lottiefiles.com/lottie-creator, https://jitter.video — authored animation that must ship as an asset, with state machines in Rive.

Depth, shape and texture
- shadowLab — https://shadowlab.mocarski.design — design layered shadows and copy them as CSS.
- Corner Radii — https://corner-radii.xyz — compute nested radii.
- ShaderToy and Unicorn Studio — https://www.shadertoy.com, https://www.unicorn.studio — shader backgrounds and effects, built or tuned before shipping one.
- dither-kit — https://www.tripwire.sh/dither-kit — dithered charts when the direction calls for print or bitmap texture.

Icons and SVG
- SVGOMG — https://jakearchibald.github.io/svgomg — clean and minify every exported SVG.
- Interactive SVG Animations — https://www.svg.guide — learn path and stroke animation before hand-writing it.

Components
- shadcn/ui — https://ui.shadcn.com — accessible primitives you own as code, with OKLCH theming.
- The Component Gallery — https://component.gallery — how real design systems name and structure a component and its states.
- NumberFlow — https://number-flow.barvian.me — numbers that roll between values with tabular figures and reduced-motion support.
- Sonner — https://sonner.emilkowal.ski — toasts with good defaults for stacking, swipe and timing.
- cmdk — https://github.com/dip/cmdk — an unstyled command menu with fast filtering and keyboard handling.
- Beautiful UI and AICSS — https://beautifului.dev, https://aicss.dev — patterns for AI conversations: thinking states, tool calls, streaming, approvals.
- loading.dev — https://loading.dev — loading indicators to compare against the skeleton you planned.
- 21st.dev, React Bits, Fancy Components, Motion Primitives — https://21st.dev, https://www.reactbits.dev, https://www.fancycomponents.dev, https://motion-primitives.com — component and effect references; read the code before adopting any of it.

Sound and haptics
- Cuelume and soundcn — https://cuelume.dev, https://soundcn.xyz — short interface sounds, synthesised or curated, for confirmation cues.
- @web-kits/audio — https://audio.raphaelsalaja.com — declarative Web Audio synthesis for custom cues.
- WebHaptics — https://haptics.lochie.me — haptic feedback on the mobile web where supported.

Review, capture and references
- Web Interface Guidelines and Interface Cheat Sheet — https://interfaces.rauno.me, https://interfaces.dev/cheat-sheet — checklists to run before calling a build done.
- rams, UI Skills, Impeccable — https://www.rams.ai, https://www.ui-skills.com, https://impeccable.style — automated reviews and agent rule sets; use them as a second opinion, never instead of the crit loop.
- Agentation — https://www.agentation.com — annotate elements on the page for an agent to fix.
- Screen Studio and Recordly — https://screen.studio, https://recordly.dev — record interactions to review them slowed down.
- UI Camera — https://ui.camera — product shots of the UI for marketing surfaces and share cards.
- Mobbin, 60fps, Design Spells — https://mobbin.com, https://60fps.design, https://designspells.com — how others solved a flow, timed a transition or placed a detail.
- Godly, Curated, Rebrand Gallery, Same Energy, Cosmos, Are.na — https://godly.website, https://www.curated.design, https://www.rebrand.gallery, https://same.energy, https://www.cosmos.so, https://www.are.na — find and keep references; cite each by mechanism (`kb/knowledge/inspiration.md`).

## When these conflict

- The accessibility floor beats feel: an interaction that feels better but breaks keyboard, focus or reduced motion loses.
- Frequency beats delight: if an animation is pleasant once and slow on the hundredth use, cut it from the frequent path.
- The platform beats a custom build unless the custom version is measurably better and keeps native behaviour.
- The system beats the one-off: a screen that needs a new look gets a component variant, not a local override.
- Numbers beat adjectives: a disagreement about feel is settled by comparing recorded variants with stated values.

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
