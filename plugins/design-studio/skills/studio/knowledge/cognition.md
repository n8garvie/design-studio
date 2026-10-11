# Cognition

> Used by: interaction designer, product strategist, content strategist; UX researcher (guest). Distilled from: Don Norman, The Design of Everyday Things (revised ed.); Jeff Johnson, Designing with the Mind in Mind (2nd ed.); human time constants as summarized by Card, Robertson and Mackinlay and by Nielsen; Cowan (2001). Written in our own words; see CREDITS.md.

How people perceive, act and fail sets limits that taste can't override. Use Norman for the action loop (can I see what to do; can I tell what happened) and Johnson for the limits of perception, attention and memory. `kb/knowledge/ux-laws.md` names the laws; this file explains why they hold. Values are defaults to beat, not ceilings; judge in context; never apply mechanically.

## 1. Make every action findable: Discoverability (Norman)

People should be able to work out, from the surface alone, what they can do and where to do it.

- Show the main actions on the surface; tuck only secondary ones away, behind a labelled control.
- Make hidden gestures (swipe, long-press, right-click, hover-reveal) shortcuts to actions that are also visible somewhere.
- Give empty and first-run states a visible first move.
- Don't hide two row actions behind hover or a kebab menu; show them as quiet visible icons with labels, or a labelled overflow.

Check: for each task in the brief, the rest-state screenshot shows a visible control that starts it; any action reachable only on hover or by gesture is a finding (compare rest and hover screenshots).

## 2. Signal what can be done: Signifiers over affordances (Norman)

An affordance is what an object allows; a signifier is the perceivable cue that announces it, and on a screen signifiers are all people get.

- Make clickable things look clickable: buttons have a fill or boundary; links differ from body text by more than color.
- Make inert things look inert: no button-shaped labels, no underlined non-links, no pointer cursor on static cards.
- Treat cursor, hover and pressed states as signifiers, not decoration.
- Don't strip signifiers for minimalism; the generic borderless text "button" floating in whitespace becomes a control with a clear edge or an action color and a verb.

Check: each interactive element in screenshots has at least one rest-state cue (fill, border, underline, chevron, position); badges and tags look distinct from buttons; measure.json accessibility tree roles agree with how elements look.

## 3. Map controls to their effects: Natural mapping (Norman)

Controls should be arranged so their relationship to what they change is obvious from layout alone.

- Put controls next to, or in the same arrangement as, the things they change.
- Match direction: up increases, right advances, a slider's position mirrors its value.
- Keep the order of controls the same as the order of what they affect.
- When no natural mapping exists, follow the platform standard rather than inventing one.

Check: in screenshots each control sits adjacent to or aligned with its target; toolbars acting on a selection attach to that selection; a distant control names its target in its label.

## 4. Make wrong actions hard: Constraints and forcing functions (Norman)

Physical, logical, semantic and cultural constraints narrow what can be done until the right action is the obvious one.

- Use inputs that can't hold wrong values: date pickers for dates, steppers for small counts, segmented controls for closed sets.
- Use forcing functions (interlocks, lock-ins, lockouts) only where stakes justify them: type-to-confirm for deleting an organization, never for archiving a note.
- Lean on cultural constraints: conventional positions for confirm and cancel, red reserved for destruction.
- Don't constrain silently; a disabled control with no visible reason reads as a bug. Explain, or keep it enabled and explain on press.

Check: screenshots show inputs whose form restricts the value (pickers, masks, segmented controls); every lockout or disabled control states its reason in visible text.

## 5. Close every loop: Feedback (Norman)

Every action needs an immediate, informative response, proportionate to what's at stake.

- Respond at the place of action: the button presses, the row updates, the field says saved.
- Make feedback specific: what happened, to which object.
- Prioritize: routine success can be quiet; failure and irreversible outcomes must be unmissable.
- Don't over-feed. Toasts for every save, confetti for a field edit and constant chimes teach people to ignore all feedback.

Check: the state board shows pressed, saving, saved and failed for each key action at the control's location; routine changes already visible in place don't also raise a global toast.

## 6. Teach the model through the surface: Conceptual model (Norman)

People act from a simplified story of how the system works, built only from what the design shows them, the system image.

- Decide the conceptual model first: the objects, their relationships and the verbs, in the user's terms.
- Make the system image express it: one object, one name, one visual form everywhere, with its state visible.
- Show cause and effect: where an archived item goes, who can see what you shared.
- Don't let the implementation leak in ("Sync job failed: 409"); translate into the user's objects and verbs.

Check: across screenshots one object keeps one name and one visual form; the brief's core objects can be listed from the screens alone; copy contains no implementation terms.

## 7. Show what to do next: Gulf of execution (Norman)

The gulf of execution is the distance between what someone wants and knowing how to make the system do it.

- Show the next step: one visually primary action per state, so the screen says what comes next (feedforward).
- Label actions with outcomes: "Send invoice", not "Submit"; "Delete 3 files", not "OK".
- Preview results before commitment: the crop before applying, the email before sending, the total before paying.
- Don't make users translate their goal into your vocabulary or switch modes first.

Check: measure.json CTA labels are verb plus object; each state on the state board has one primary action; destructive and payment buttons name the object or the amount.

## 8. Show what happened: Gulf of evaluation (Norman)

The gulf of evaluation is the distance between what the system did and the user understanding it.

- Show current state persistently: what's selected, what's filtered, which mode, saved or unsaved.
- Make changes visible where they happened, and announce changes that happen out of view.
- Phrase status as the user's outcome ("Your site is live at …"), not the system's process ("Deploy complete").
- Don't rely on a two-second toast alone for state the user will need later.

Check: from any single screenshot, a viewer can tell what's selected, what's filtered and whether work is saved; success states name the outcome.

## 9. Support every stage of action: Seven stages of action (Norman)

Action runs goal, then plan, specify and perform (execution), then perceive, interpret and compare (evaluation), and any stage can break.

- Walk each key task through the stages and ask what helps at each one.
- Invest where failures cluster: specify (which control?) and interpret (what did that do?).
- Offer goal-level shortcuts for experts (command menu, templates) and step-level guidance for newcomers.
- Don't polish only the perform moment; a perfect button inside an unclear task fails at plan.

Check: the critique of the primary task names the stage where it breaks, with the screenshot where it happens.

## 10. Design against slips: Slips and mode errors (Norman)

Slips are right intentions carried out wrongly (capture, wrong target, mode errors), and they grow with skill, speed and distraction.

- Make dangerous actions distinct from frequent ones in position, shape and label; never adjacent and alike.
- Avoid modes; where one is needed, make it loud and persistent (an editing bar, a framed canvas, a changed cursor).
- Make every frequent action undoable.
- Don't put Delete beside Save in the same style; separate destruction by space and treatment.

Check: in screenshots, destructive buttons are not adjacent to frequent ones with the same treatment; any mode (editing, selecting, recording) is visible at a glance.
Values: at least 16px or a divider between destructive and frequent actions (studio default).

## 11. Design for mistakes: Mistakes and memory lapses (Norman)

Mistakes are wrong goals or plans, usually from a misleading model, and memory lapses skip steps; treat both as design defects, not user faults.

- Expose what people need to choose the right plan: consequences, current values, what will change.
- Catch lapses with summaries, checklists and reminders before commit.
- Write errors that diagnose: what went wrong, likely why, how to recover.
- Don't blame. Ask why until the cause sits in the design; "You entered an invalid date" becomes "Use a date after 1 March".

Check: review and confirm screens list consequences in plain language; error copy has a cause and a remedy; no copy implies user fault.

## 12. Put knowledge in the world: Recognition over recall (Norman; Johnson)

Recognizing what is shown is far easier than recalling it, so the interface should carry the knowledge.

- Show options instead of requiring typed commands; show recent and suggested items.
- Keep labels visible: no placeholder-only fields, no icon-only toolbars for rare actions.
- Show examples and formats where input happens.
- Don't make users remember codes, names or states from earlier screens; display them.

Check: every field and rare action in screenshots has a visible text label; focused search shows recent or suggested items; measure.json accessible names match the visible labels.

## 13. Expect expectation: Perception is biased (Johnson)

People see what experience, context and their current goal lead them to expect, and miss what they don't.

- Keep positions stable; a control that moves between screens gets missed or mis-hit.
- Make important changes loud enough to beat change blindness; a subtle swap goes unseen.
- Test labels against the goal people hold at that moment, not in isolation.
- Don't put a destructive action where a frequent one usually lives, such as "Cancel plan" where "Save" sits on sibling screens.

Check: on sibling screens, primary actions, navigation and titles hold the same positions; changes triggered by an action appear in the area being looked at.

## 14. Let vision do the grouping: Gestalt principles (Johnson)

Vision organizes a scene before reading starts, by proximity, similarity, continuity, closure, symmetry, figure and ground, and common fate.

- Use alignment and continuity so lists and flows read as lines.
- Give overlays a clear figure and ground: a scrim or a real elevation step, not a borderless panel on a similar surface.
- Use common fate: things that move or change together read as one.
- Don't let accidental alignments or rhythms imply groups that don't exist. Proximity, similarity and enclosure live in `kb/knowledge/ux-laws.md`.

Check: a squint at the screenshot shows the intended groups and no others; overlays separate from the page by scrim or clear contrast; grouped items share an edge.

## 15. Structure, don't narrate: Structure over prose (Johnson)

People scan structured information far faster than prose, so lists, tables, headings and consistent formats beat paragraphs.

- Turn sequences into numbered steps and comparisons into tables.
- Build a visual hierarchy that reads as an outline without the body text.
- Format data consistently (dates, numbers, units) so the eye can compare.
- Don't bury facts in sentences; a paragraph hiding a price, a date and a condition becomes a three-row list.

Check: measure.json headings outline reads as a meaningful summary of the page; no paragraph in screenshots carries more than two scannable facts (numbers, dates, options).

## 16. Write for scanners: Reading is unnatural (Johnson)

Reading is a learned skill that degrades fast under poor conditions, and most people scan for words that match their goal.

- Cut text until every sentence earns its place.
- Lead each heading, label and link with the word people scan for.
- Keep reading conditions good: comfortable size, moderate measure, sentence case, solid contrast, plain backgrounds.
- Don't set more than a short label in all caps, center paragraphs, or run text over busy imagery.

Check: measure.json type sizes show body at 16px or more and line lengths within 45 to 75 characters; screenshots show no centered paragraphs over three lines and no text on uncontrolled imagery.
Values: body 16 to 18px; line-height 1.5; measure 45 to 75ch (studio default).

## 17. Encode with lightness, not hue alone: Limits of color vision (Johnson)

Vision is tuned to edges and contrast, not absolute color; it struggles with pale, small or separated patches, and about 8% of men have a color vision deficiency.

- Separate states by lightness contrast plus a second cue: icon, text, shape or position.
- Make color differences larger on small marks; thin lines and dots need darker, stronger colors.
- Avoid red and green as the only pair; prefer blue and orange, and label directly.
- Don't use pale tints to carry meaning that matters (a light-yellow highlight, faint category fills).

Check: view the screenshot in grayscale: every state and series stays distinguishable; measure.json contrast failures list no indicator or chart mark under 3:1.

## 18. Put feedback where the eyes are: Peripheral vision is poor (Johnson)

Only a small central patch of vision sees detail; the periphery sees motion and rough shapes, so messages away from the point of focus go unseen.

- Show errors and results next to the control that caused them.
- Reserve peripheral motion (pulse, shake, slide-in) for things that warrant an interruption.
- Use the periphery only for coarse signals: a large color shift, a progress bar.
- Don't put the only error message at the top of a long form or in a corner toast.

Check: in error and success screenshots the message sits within about one field height of the triggering control; no corner toast is the only carrier of an error.

## 19. Serve the goal, not the screen: Attention follows goals (Johnson)

Attention is scarce and steered by the current goal; people ignore what seems unrelated and lose their place when interrupted.

- Shape each screen around the task step, with labels that match what people are hunting for (information scent).
- Remove what doesn't serve the current step from the main path.
- Design for interruption: autosave, mark where the user was, restore partly finished work.
- Don't count on people noticing something unrelated to their task, such as a feature announcement on a payment screen.

Check: the dominant elements in each screenshot relate to that step's goal; re-entry screens show resume state; nav and link labels contain words from the brief's tasks.

## 20. Make learning cheap and safe: Learning from experience (Johnson)

People learn by doing and generalize from what they see, so consistency and low-risk exploration make learning fast.

- Keep it consistent: same action, same place, same name, same result.
- Make exploration safe: undo, preview, drafts, sample data.
- Help people graduate: show keyboard shortcuts beside menu items and in tooltips.
- Don't punish experiments with irreversible results or lost work.

Check: menus and tooltips in screenshots show shortcuts where they exist; the state board shows Undo after destructive actions.

## 21. Speak in task language: Familiar vocabulary (Johnson)

Words from the user's task are understood instantly; words from the implementation force translation.

- Name things with the user's words, taken from research, support tickets or the brief.
- Use one term per concept, everywhere.
- Explain unavoidable technical terms inline at first use.
- Don't let engineering nouns (instance, entity, payload, sync) reach the interface unless your users say them.

Check: measure.json headings and CTA labels use the brief's vocabulary; no concept appears under two names across screenshots.

## 22. Meet the time constants: Human timing limits (Johnson; Card; Nielsen)

Perception sets fixed deadlines: about 0.1s feels instantaneous and causal, about 1s keeps a train of thought, about 10s is the limit of attention on a wait.

- Within 0.1s, show direct feedback for presses, typing, dragging and hover.
- Past about 1s, show that work is happening and keep the rest of the interface usable.
- Past about 10s, show determinate progress, an estimate and a way to cancel or leave.
- Don't animate longer than the moment needs; frequent interactions should land within 100 to 200ms.

Check: the state board covers instant feedback, a short loading state and a long-running state with progress and cancel. Check (code): frequent-interaction transitions at or under 200ms.
Values: `--dur-instant:100ms; --dur-fast:150ms; --dur-base:200ms; --dur-enter:250ms` (studio default).

## 23. Be responsive when you can't be fast: Responsiveness (Johnson)

Responsiveness means keeping people informed and in control while work happens, and it matters more than raw speed.

- Acknowledge input immediately, even when processing is deferred.
- Let people keep working while slow work runs, and give their input priority over background tasks.
- Load in the shape of the result, and show the first useful thing first.
- Don't block the whole screen with a spinner when one region is loading.

Check: loading screenshots show only the affected region in a loading state and the rest usable; skeleton dimensions match the loaded layout.

## 24. Respect motor limits: Fitts and the steering law (Johnson)

Pointing time grows with distance and shrinks with target size, and moving along a narrow path (cascading menus, thin sliders) slows as the path narrows.

- Size and place targets for the input: larger on touch, near the current focus, on screen edges for a pointer (edges stop the cursor).
- Avoid narrow tunnels: cascading submenus need forgiving hover intent or click to open.
- Make sliders and drag handles thick enough to grab, with a keyboard or typed alternative.
- Don't place small, frequently used targets far apart.

Check: measure.json tap targets are at least 24×24 everywhere and 44×44 for touch primaries; screenshots show no hover menus nested more than one level deep.

## 25. Respect decision limits: Hick's Law as a human limit (Johnson; Hick)

Choice time rises with the number of equally likely options, but practice and stable positions flatten the cost.

- Reduce options where people are new or the choice is rare.
- For frequent choices, keep positions stable so experts choose by location, not by reading.
- Group and order options by likelihood, so the common choice comes first.
- Don't auto-reorder menus by recent use; it breaks learned positions. Pin recent items in a separate section instead.

Check: menus and pickers in screenshots show grouping with the most common option first; the same menu in two screenshots keeps the same order.

## When these conflict

- Discoverability vs low cognitive load: show the primary and frequent actions; disclose rare ones behind a labelled control, never behind hover or a gesture alone.
- Feedback vs calm: proportion beats completeness; quiet confirmation in place for routine actions, loud only for failure and the irreversible.
- Familiar vocabulary vs precision: use the user's word, and make it precise in help text, not the reverse.
- Constraints vs freedom: constrain values, not paths; people must always be able to go back and recover.
- Novelty vs expectation: break an expectation only where the gain is visible in the first use, and teach it there.

Then defer to the studio ladder:

1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
