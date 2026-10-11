# UX laws

> Used by: all roles; owned by interaction designer and product strategist. Distilled from: Adam Hayes, "The UX Laws in My CLAUDE.md" (2026; his 20 laws, their law, sentence and four-bullet shape, much of his wording and his implementation steps are adapted with credit, at his invitation: "Copy it."); Jon Yablonski, Laws of UX; Norman, The Design of Everyday Things; Cowan (2001) on working memory. Written in our own words except Hayes's kept phrasing; see CREDITS.md.

A model can reason from a principle; it can only copy from a spec (Hayes). Reason from the named law to the case in front of you, then verify with the Check line. Values are defaults to beat, not ceilings. Judge in context and never apply these mechanically: a screen can satisfy all of them and still feel like a tax return. The goal, in Hayes's words: minimize confusion, reduce effort, prevent mistakes, and help users complete their intended task as quickly as possible. Where we depart from Hayes, the principle says so.

## Routing: which laws to start with

Don't apply all 33 at once (Hick's Law applies to the team too). Start with the row for the surface, then scan the rest.

| Surface | Start with |
|---|---|
| Form | 4, 5, 8, 13, 14, 15, 21, 30 |
| Settings, configuration | 5, 13, 16, 19, 24, 28, 31 |
| Onboarding, first run | 10, 11, 18, 19, 20, 26, 33 |
| Pricing, marketing page | 7, 9, 12, 22, 23, 29, 32 |
| Dashboard, data | 4, 12, 24, 28, 29, 30, 31 |
| Navigation | 3, 9, 16, 26, 28 |
| Search | 1, 6, 21, 26, 30 |
| List, table | 2, 4, 8, 16, 17, 30 |
| Modal, overlay | 1, 7, 8, 14, 25 |
| Checkout, payment | 10, 14, 15, 18, 20, 21, 32 |
| Empty, error, success states | 6, 10, 15, 33 |

## 1. Reduce choices per screen: Hick's Law (Hayes)

The time required to make a decision increases with the number and complexity of available choices.

- Give each screen one clear purpose, and write it down before laying anything out.
- Remove irrelevant or low-priority options; move the long tail to overflow, settings or search.
- Break complicated decisions into smaller steps, and recommend an option when users may struggle to choose.
- Don't hide the path forward to hit a number; show the full set when it's needed, just not at equal weight.

Check: the screen's purpose can be stated in one sentence from the screenshot; measure.json CTA labels show one primary per view, and more than about five peer actions at the same visual weight in one viewport is a finding.
Values: 1 primary action per view; 3 to 5 peer options per decision before grouping or disclosure (studio default).

## 2. Make targets large: Fitts's Law (Hayes)

Large, nearby targets are faster and easier to interact with.

- Make buttons and controls easy to click or tap, with the hit area extending beyond the visible glyph.
- Give interactive elements sufficient spacing, built from padding inside each target so the gaps aren't dead zones.
- Avoid tiny icons as the only interaction target; a 16px icon lives in a 32px desktop or 44px touch button.
- Increase the clickable area around important controls: the whole row, the whole card, label plus checkbox. Fitts alone is not enough; hold the WCAG floor too.

Check: measure.json tap targets show nothing interactive under 24×24 CSS px and touch primaries at 44×44 or more; checkbox and radio labels are part of the target (Check (code) if unclear).
Values: floor 24×24 (WCAG 2.5.8); desktop icon button 32×32; touch 44×44; extend with `.x::after{content:"";position:absolute;inset:-8px}`

## 3. Follow familiar patterns: Jakob's Law (Hayes)

Users expect your product to work like products they already understand.

- Use established interface conventions: links look like links, toggles apply at once, Escape closes, the logo goes home.
- Place navigation, search, settings and account controls where users expect them.
- Use familiar icons and interaction patterns; an icon outside the common set gets a text label.
- Do not invent a new pattern unless it provides a meaningful advantage. Convention binds the interaction grammar, not the look: spend novelty on composition, type and voice, never on how a form submits.

Check: from the screenshot, navigation, search, account and the primary action are findable within five seconds; icon-only controls beyond close, search, menu and settings have visible labels.

## 4. Group related information: Law of Proximity (Hayes)

Elements positioned near one another are perceived as related.

- Place related labels, controls and information together; a label sits closer to its own field than to the one above.
- Use spacing to communicate relationships: space inside a group is at most half the space between groups.
- Separate unrelated groups with additional space; a heading sits nearer the content it introduces than the content above it.
- Do not rely on borders when spacing can establish the hierarchy. The generic default, every section in its own bordered card on a uniform gap, is replaced by a spacing rhythm.

Check: measure gaps in the screenshot: label to field < field to next label; space above a heading is 1.5 to 2 times the space below; evenly spaced stacks with no rhythm are a finding.
Values: within a group 8 to 12px; between groups 32 to 48px; between sections 64 to 128px.

## 5. Break content into chunks: Miller's Law and chunking (Hayes, amended)

Working memory holds only a few meaningful units at once, about four reliably (Cowan), so information must arrive in chunks people can hold.

- Divide long content into small, meaningful groups: phone numbers 3-3-4, codes in fours, settings in five or fewer named sections.
- Break complex forms and tasks into manageable steps, each with one theme.
- Use headings, sections and concise labels so each chunk can be scanned and named.
- Don't use "seven plus or minus two" as a cap on menu items; Miller was describing chunks. Fix the grouping, not the count.

Check: measure.json headings outline shows a heading at least every screenful of long content; forms over about 7 fields are grouped under labels or steps; long numbers and codes in screenshots are visibly chunked.
Values: about 4 chunks held at once; 3 to 5 fields per form group (studio default).

## 6. Respond before attention drifts: Doherty Threshold and time constants (Hayes, amended)

Interfaces feel productive when the system answers faster than the user can wait; Hayes's "400 milliseconds" is folklore (the 1982 Doherty and Thadani paper doesn't contain it), so we use the human time constants: about 0.1s feels instant, 1s keeps the flow of thought, 10s is the limit of attention.

- Acknowledge every user action immediately: a pressed state within 0.1s, even if the result takes longer.
- Show loading, processing or success states when results are not instant; a skeleton shaped like the result beats a centered spinner.
- Use optimistic updates when they are safe, and roll back visibly, with the reason, when they fail.
- Never leave users wondering whether their action registered; a button that does nothing for a second gets clicked twice.

Check: the state board shows pressed, loading, success and failure for the primary action; buttons keep their width when the label swaps for a spinner; skeletons match the final layout. Check (code): submit is guarded against double send; every request has a timeout.
Values: for the first 150 to 300ms show nothing but hold the space (once shown, keep an indicator at least 300ms); to about 2s subtle indicator; 2 to 10s skeleton or labelled progress ("Loading payments…"); 10 to 60s determinate progress with cancel; past 60s stop and offer retry or continue in background.

## 7. Highlight the primary action: Von Restorff Effect (Hayes)

An element that visually differs from surrounding elements receives more attention.

- Give the primary action the strongest visual emphasis: a solid accent fill, the only one in view.
- Use one dominant call to action per section.
- Keep secondary actions visually quieter: neutral fill or outline; tertiary as text.
- Avoid making every button compete for attention. Replace the generic row of gradient primary, filled secondary and accent link with one solid button and quiet text, and pair the difference with a non-color cue (weight, position, label).

Check: in each viewport screenshot exactly one element carries the accent fill; squint at it and the primary survives first; measure.json CTA labels show at most one primary per section.
Values: accent on at most 2 elements per screen (studio default).

## 8. Place key actions nearby: Fitts's Law (Hayes)

Interaction becomes faster when important targets are close to the user's current focus.

- Place actions beside the content they affect: row actions on the row, card actions in the card.
- Keep form submission near the final input, aligned to the form's edge.
- Position frequent actions within easy reach: the thumb zone on phones, edges and corners for a pointer.
- Avoid forcing unnecessary cursor or eye movement; a Save button top-right above a long form is the generic failure.

Check: in screenshots the submit button sits within one group gap of the last field; at 390px width the primary action is in the lower half or pinned to the bottom.

## 9. Put essentials first: Serial Position Effect (Hayes)

People remember the first and last items in a sequence most clearly.

- Put the most important information first, including the first word of every heading, list item and button.
- Place the final action or takeaway at the end.
- Keep lower-priority information in the middle.
- Order navigation and lists according to user importance, not the org chart, and not the alphabet unless users scan alphabetically.

Check: measure.json headings and CTA labels front-load the key word ("Overdue invoices", not "View the list of invoices that are overdue"); the first and last nav items are the two most-used destinations in the brief.

## 10. End flows memorably: Peak-End Rule (Hayes)

Users judge an experience largely by its most intense moment and how it ends.

- Create a clear and satisfying completion state, and spend the flow's novelty budget there, not mid-flow.
- Confirm what the user accomplished, naming the object: "Invoice 204 sent to Dana" beats "Success!".
- Explain what happens next and offer one next action.
- Avoid ending flows on an empty or ambiguous screen. Replace the generic big green check with "All done!" with a specific confirmation in the product's own voice.

Check: the state board's success state names the object and outcome, offers exactly one next step, and looks different from the form it follows.

## 11. Show visible progress: Zeigarnik Effect (Hayes)

Incomplete tasks remain mentally active and encourage users to return.

- Clearly show completed and unfinished steps.
- Save progress whenever possible, and say so: "Draft saved 2 min ago".
- Make it easy to resume interrupted tasks at the exact step and scroll position.
- Use checklists or completion states for multi-step work that serves the user; turning this tension into streaks, guilt badges or nag counters is a dark pattern.

Check: multi-step screens show done, current and to-do in text, not color alone; re-entry screens show a resume or draft affordance.

## 12. Simplify complex interfaces: Law of Prägnanz (Hayes)

People interpret complex or ambiguous designs in the simplest form possible.

- Prefer simple structures and recognizable shapes, aligned to a visible grid.
- Remove unnecessary decoration and visual noise: blobs, glows and dividers that separate nothing.
- Create an obvious visual hierarchy with at most three levels visible at once.
- Make the interface understandable at a glance; the squint test should reveal the layout's skeleton.

Check: blur the screenshot: three or fewer weight levels remain and the main groups read; count distinct left edges in the viewport (fewer is better; flag more than about four).
Values: at most 3 visible hierarchy levels above the fold (studio default).

## 13. Use sensible defaults: Hick's Law (Hayes)

Helpful defaults reduce the number of decisions users must make.

- Preselect the safest and most common option.
- Use existing context to reduce unnecessary input: locale, time zone, the last choice made.
- Never use defaults that create unexpected commitments: no pre-ticked consent, no paid add-on, no auto-renew by default.
- Make every default easy to change in place.

Check: form screenshots show a preselected value wherever one option dominates; no pre-checked consent, upsell or paid option is visible.

## 14. Prevent errors proactively: Error prevention (Hayes, amended; Norman)

The best error message is the one never shown: constraints, clear requirements and undo stop mistakes before they cost anything. Hayes filed this under Postel's Law; prevention is Norman's territory, and Postel now has its own principle (21).

- Explain requirements before submission, beside the field, not after failure.
- Constrain where values are closed: pickers, segmented controls, steppers, input masks.
- Keep unavailable actions enabled and say what's missing on press; if you must disable, show the reason as visible text beside the control. (Hayes said disable; a silent disabled button reads as broken.)
- Do reversible actions immediately and offer Undo; confirm only the irreversible, with a button that repeats the verb ("Delete project") and focus starting on Cancel. (Hayes said warn first.)

Check: constrained fields show format hints before entry; any disabled control has a visible reason within 8px; destructive actions on the state board use an undo toast unless irreversible; confirm buttons never read "OK" or "Yes".
Values: undo window 5s; Trash keeps items 30 days (studio default; mechanics in `kb/knowledge/interaction.md`).

## 15. Make errors recoverable: Error recovery (Hayes, amended)

The interface should handle user mistakes gracefully without creating unnecessary failure.

- Preserve the user's work after an error; a form never clears on a failed submit.
- Explain what went wrong in plain language: what happened, why if known, what to do.
- Tell the user exactly how to fix it, at the field that needs fixing, and move focus to the first error.
- Provide undo, retry, restore or cancel options where appropriate; after three failed retries, offer support and a copyable error reference.

Check: the state board's error state keeps entered values, places the message beside the field and names the fix; copy avoids "invalid", "something went wrong" and "oops".

## 16. Maintain pattern consistency: Law of Similarity (Hayes)

Elements that look similar are perceived as having related purposes.

- Give similar components the same appearance and behavior.
- Use consistent colors, labels, icons, spacing and interaction states.
- Do not use the same visual treatment for different actions; a tag must never look like a button.
- Reuse established components before creating new ones; a new variant needs a reason on the system sheet.

Check: across screenshots, equivalent controls share height, radius, color and label case; measure.json CTA labels use one verb per operation (not "Save", "Update" and "Apply" for the same thing).

## 17. Connect related elements visually: Law of Uniform Connectedness (Hayes)

Visually connected elements are perceived as more closely related.

- Use containers, lines, backgrounds or shared states to show relationships.
- Visually connect controls to the content they affect: the filter bar attached to its table, a line through stepper steps.
- Keep unrelated elements visually separate.
- Use connection deliberately, not decoratively; a connector that links nothing is noise.

Check: in screenshots, every line or shared surface encloses a real group; controls acting on a region touch it or share its surface.

## 18. Reduce task completion time: Parkinson's Law (Hayes)

Tasks tend to expand to consume the time made available for them.

- Minimize the number of steps required.
- Remove unnecessary confirmations and screens.
- Prefill information the user has already provided.
- Offer shortcuts for frequent or repeat actions: keyboard shortcuts beside commands, recent items, duplicate last.

Check: count screens from entry to success in the flow screenshots; any step that only says "Next" or only confirms is a finding unless it guards something irreversible.

## 19. Reveal complexity gradually: Tesler's Law (Hayes)

Every system contains some complexity that cannot be removed, only managed or transferred.

- Show essential controls first.
- Reveal advanced options only when relevant, in context, with a visible way back.
- Let the system handle complexity whenever possible: computed values, inference, smart defaults.
- Do not force users to understand internal technical details. Hiding complexity behind a toggle is not the same as absorbing it.

Check: advanced options appear collapsed behind a labelled disclosure; no internal IDs, enum names or system jargon in visible copy.

## 20. Make completion feel closer: Goal-Gradient Effect (Hayes)

Motivation increases as users perceive themselves getting closer to a goal.

- Show progress throughout multi-step flows.
- Divide long tasks into visible milestones.
- Emphasize progress already made, but only real progress; a fabricated head start is a dark pattern.
- Make the remaining work feel specific and achievable: "2 steps left: payment, review".

Check: progress indicators state position in text ("Step 2 of 4") and the count matches the steps actually shown in the flow screenshots.

## 21. Accept what people give you: Postel's Law (Hayes, amended)

Be liberal in what you accept and strict in what you return: take input in the shapes people naturally type it, then normalize.

- Accept common input formats and variations: spaces in card numbers, dashes in phone numbers, "1k", pasted values with stray whitespace.
- Never block paste, and tell the browser what each field is for (type, inputmode, autocomplete) so it can help.
- Normalize quietly and show the result in one consistent format.
- Don't reject what you could have parsed; "Invalid format" for a phone number with a space is the generic failure.

Check: screenshots of filled fields show tolerant formatting (the stored value shown back cleanly); error copy never rejects a format the field could parse. Check (code): inputs carry autocomplete and inputmode; no paste blocking.

## 22. Let polish earn trust, never cover for flaws: Aesthetic-Usability Effect (Yablonski)

People judge attractive interfaces as easier to use and forgive small friction in them.

- Invest in the polish that reads as care: shared edges, one radius family, an even rhythm, real content.
- Spend that goodwill on hard moments (waiting, errors), never as cover for a broken flow.
- Score usability separately from beauty; attractive prototypes make testers and critics go easy.
- Don't mistake effects for polish. Hover lifts, glows and gradient borders read as generic; precision in the details is what earns trust.

Check: critique the screenshot for detail precision (misaligned edges, mixed radii, off-scale gaps); usability scores are given independently of visual scores.

## 23. Offer fewer, better options: Choice Overload (Yablonski)

When many comparable options appear together, people choose more slowly, feel less sure, and often don't choose at all.

- Curate: show the options that fit this user, with filters and search for the rest.
- When comparison is unavoidable, align attributes in the same order and highlight the differences.
- Mark exactly one recommended option and say why it fits.
- Don't ship a flat wall of equivalents; five pricing tiers at equal weight become three or four with one recommended.

Check: pricing shows at most 4 tiers with exactly one marked recommended; grids past about 9 equivalent items above the fold offer filtering.
Values: pricing 3 to 4 tiers; settings at most 5 named groups (studio default).

## 24. Remove the effort the task doesn't need: Cognitive Load (Yablonski)

A task has its own difficulty that design can't remove; design's job is to remove the extra effort added by layout, wording and inconsistency.

- Cut extraneous load: inconsistent patterns, jargon, decoration, repeated text.
- Offload the work: compute, remember, compare and format for the user.
- Keep one idea per element and one task per view.
- Don't fill space for its own sake. The generic three-icon row of paraphrased benefits adds load and no meaning; replace it with one concrete proof (a real number, a real screen).

Check: every element in the screenshot answers "what does this help the user do?"; measure.json type sizes show at most about 6 distinct sizes.

## 25. Keep people in flow: Flow (Yablonski)

People work best when challenge matches skill, feedback is continuous and nothing interrupts.

- Remove interruptions: no modal on entry, no blocking tour, no mid-task pop-up.
- Match challenge to skill: disclosure for newcomers, shortcuts and density for experts.
- Give continuous, proportionate feedback so users always know where they stand.
- Don't break concentration with motion; frequent interactions (hover, menus, tabs) animate under 200ms or not at all.

Check: first-load screenshots show no overlay, banner or modal covering content. Check (code): transitions on frequent interactions at or under 200ms.
Values: frequent 100 to 200ms; entering UI 200 to 300ms (studio default).

## 26. Match what users already believe: Mental Model (Yablonski)

Users predict how a product works from what they already know, and friction appears wherever the design disagrees.

- Learn the model users bring (research, competitors, physical analogs) before naming or structuring anything.
- Use their words for things and their grouping for navigation.
- Where you must break the model, teach the new one once, at the moment it differs.
- Don't let the database shape the interface; "Entities", "Objects" and "Records" are the system's model, not the user's. See `kb/knowledge/cognition.md` on conceptual models.

Check: measure.json headings and nav labels use the nouns from the brief, not internal terms; no unexplained metaphor appears in screenshots.

## 27. Remove what earns nothing: Occam's Razor (Yablonski)

Among designs that work equally well, choose the one with the fewest parts and assumptions.

- Remove elements one at a time and keep each removal if nothing is lost.
- Prefer one flexible component to three near-duplicates.
- Question every wrapper: a card in a section in a panel needs a reason for each layer.
- Don't read this as minimalism for its own sake; it trims assumptions and parts, not features users need.

Check: count nested containers (border or fill changes) around content in the screenshot; more than two layers is a finding; near-duplicate components doing the same job are flagged.

## 28. Design for the vital few: Pareto Principle (Yablonski)

A minority of features and paths carries most of the use and value.

- Identify the two or three actions that drive the main journey and make them the most prominent and the fastest.
- Polish the screens users see most before the rare ones.
- Demote the long tail to overflow, settings or search; don't delete it.
- Don't give every feature equal billing in navigation; equal weight is a decision not to decide.

Check: the most frequent tasks named in the brief are visible without scrolling or opening menus in the screenshots.

## 29. Win the attention you need: Selective Attention (Yablonski)

People filter out whatever looks irrelevant to their goal, including anything that looks like an ad.

- Put critical information where the eye already is, styled as content, not decoration.
- Reserve the strongest contrast for the one goal-relevant item per view.
- Avoid banner shapes and promo styling for important messages; users skip them.
- Don't fight for attention with badges, red dots and pulses; they train users to ignore signals. Replace them with one well-placed notice that says something specific.

Check: count attention signals per screenshot (badges, dots, saturated alerts, pulsing elements); more than one competing with the primary task is a finding; critical messages sit next to their content.

## 30. Carry context forward: Working Memory (Yablonski)

People hold little in mind and lose it within seconds, so the interface has to hold it for them.

- Avoid asking users to remember information between screens (Hayes); show it again where it's needed.
- Keep applied filters, selections and earlier answers visible as chips, summaries or breadcrumbs.
- Support side-by-side comparison rather than flipping between tabs or pages.
- Don't make users copy a code, ID or total from one screen to type it on another; carry it over or make it copyable.

Check: multi-step screens show a summary of prior choices; filtered views show active filters as visible chips; no screen asks for a value shown only on a previous screen.

## 31. Enclose only what belongs together: Law of Common Region (Yablonski)

Elements inside a shared boundary or background are read as one group.

- Use a shared surface when proximity alone can't separate groups (dense dashboards, mixed content).
- Give regions enough internal padding that content never touches the edge.
- Use the lightest enclosure that works: a tint before a border, a border before a shadow.
- Don't box every section; a page of identical bordered cards destroys the signal. Use spacing, and enclose only the groups that need it.

Check: count bordered or filled containers per viewport; if most content sits in identical cards, flag it; region padding at least 16px.
Values: region padding 16 to 24px; tint `color-mix(in oklch, var(--text) 4%, var(--surface))`

## 32. Frame choices honestly: Cognitive Bias (Yablonski)

Anchoring, defaults, framing and social proof shape every decision whether or not the design intends them.

- Know which bias your layout triggers: the first price seen anchors the rest; the preselected option tends to stay.
- Use anchors and defaults to steer toward the choice that serves the user, and say why.
- State trade-offs concretely: the annual saving in currency, not a "Save 20%" badge alone.
- Never use fake urgency, invented scarcity, made-up user counts or confirmshaming; these are dark patterns and an AI tell (see `kb/knowledge/ai-tells.md`). Show real numbers or none.

Check: screenshots contain no countdowns, "only 2 left", "X people viewing" or shaming decline links ("No thanks, I hate saving"); every figure shown is real or marked as placeholder.

## 33. Teach at the point of action: Paradox of the Active User (Yablonski)

People start using a product at once and skip instructions, even when reading them would save time.

- Put guidance where the action happens: helper text, inline examples, empty-state coaching.
- Make the first action obvious from the empty state.
- Make exploring safe: undo, drafts, sample data.
- Don't front-load a multi-slide tour or a manual; replace it with one contextual hint, shown once, when it matters.

Check: first-use empty states on the state board carry a one-line explanation and one action; no screenshot shows a blocking tour on entry.

## Implementation spine

Hayes's eight steps, kept as he wrote them. He would keep this block if he had to cut everything else. Run it before the laws: state step 1 in one sentence in the task card, and trace every finding to one step.

When creating or revising an interface:

1. Identify the user's primary goal.
2. Design the shortest clear path to that goal.
3. Make the next action visually obvious.
4. Remove anything that distracts from task completion.
5. Provide immediate feedback after every interaction.
6. Prevent errors before they occur.
7. Preserve user work when something goes wrong.
8. Confirm clearly when the goal has been completed.

## When these conflict

Hayes's line stands: when laws appear to conflict, prioritize clarity, accessibility, user control and successful task completion; do not apply them mechanically, and use them to make deliberate decisions based on the user's context and goal. Domain tiebreakers:

- Jakob vs distinctiveness: convention wins for how controls behave; the direction wins for how the surface looks and speaks.
- Hick and Choice Overload vs Pareto and Tesler: reduce what appears at equal weight, never what is reachable.
- Von Restorff vs Similarity: one deliberate exception per view; everything else consistent.
- Parkinson vs error prevention: cut steps, except the confirmation of what can't be undone.
- Flow and time constants vs Peak-End: speed through the middle, ceremony only at the end, and never at the cost of the user's next action.
- Aesthetic-Usability never outranks a usability finding.

Then defer to the studio ladder:

1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
