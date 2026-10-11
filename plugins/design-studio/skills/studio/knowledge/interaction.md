# Interaction

> Used by: interaction designer (owner), product strategist, content strategist, design engineer; UX researcher (guest). Distilled from: About Face (Cooper, Reimann, Cronin, Noessel), Designing Interfaces (Tidwell, Brewer, Valencia), Microinteractions (Saffer), Gustavo Fior ("Incremental Complexity"; Craft), Critly (Kausthubh's fork of Craft: interaction states, focus rings, input details, empty states, command menu, overlays, toasts, destructive actions, responsiveness, instant navigation, layout shift), world-class-designer (Lammertsma: the states pass), Hayes, ibelick ("Anatomy of AI Input", via the desengs.com reading list). Written in our own words; see CREDITS.md.

Read each principle, then its Check line: the Check is how critics will judge the work, so design to it. Values are defaults to beat, not ceilings. Judge in context: a sovereign tool used all day and a flow used once a year want different answers from the same principle. Never apply a rule mechanically; when one fights the stated direction, find the version of the rule that serves the direction. Motion values live in `kb/knowledge/motion-sound.md`, words in `kb/knowledge/content.md`, the legal floor in `kb/knowledge/accessibility.md`.

## 1. Design for the goal, not the task: Goal-directed design (About Face)

Tasks are the steps today's technology happens to demand; goals are the end state the person wants, and a design is judged by how directly it gets them there.

- Write the user's end goal in one line before drawing a screen ("know whether I can afford the trip", not "open the budget tab").
- Design the shortest path from entry to goal first, then make every extra step justify itself in writing.
- Put the answer to the goal on the first screen when you can; when you can't, make the next action the most visible thing.
- Don't mirror the database, the API or the org chart in navigation and forms; mirror the goal.

Check: from the screen inventory, count steps from entry to goal on the primary flow; each step names the decision it serves. The primary action is inside the first viewport in the 1280px and 390px screenshots.
Values: a frequent goal in 3 screens or fewer; every additional step carries a written reason.

## 2. Match behavior to posture: Sovereign, transient, daemonic, auxiliary (About Face)

How long people stay and how much attention they give sets a product's density, chrome and pace.

- Sovereign (open all day with full attention: editors, trackers, consoles): design for the intermediate, compact and quiet, maximum work area, every command on the keyboard, no ceremony.
- Transient (in, one job, out: a picker, a share sheet, a calculator): self-explanatory, large clear controls, opens instantly, remembers where it was left.
- Daemonic (works unseen: sync, backup, agents) stays silent until a human is needed, then shows one status and one action; auxiliary (lives beside other work: a chat pane, an inspector, a player) keeps a small, glanceable footprint with quick, transient interactions.
- Don't give a sovereign tool landing-page scale, or a transient tool a dense toolbar that needs learning.

Check: direction.md names the posture and the screenshots agree. A sovereign screen with 48px+ rows and display-size headings fails; a transient screen with targets under 32px or body under 16px fails (measure.json type sizes and tap targets).
Values: sovereign rows 32–40px, body 13–14px, UI motion 150ms or none; transient targets 44px+, body 16px+.

## 3. Prefer idioms to metaphors: Idiomatic design (About Face)

People learn an idiom once (a link, a tab, a drag handle, Cmd+K) and reuse it everywhere, while a metaphor has to be decoded on every screen and breaks at its edges.

- Reach for the learned idiom before inventing a control; invent only when the new control is plainly better on speed, keyboard, touch and clarity.
- Replace skeuomorphic knobs, dials and paper notebooks with the idiom that does the job (field, slider with a typed value, list); if the direction demands one, give it a typed fallback and full keyboard support.
- Keep a metaphor local (one signature control), never global (the whole app as a desk).
- Don't spend novelty on interaction patterns casually; novel behavior taxes every new user, not just the first visit.

Check: every control in the screenshots reads as what it is within a second, or shows a visible typed alternative; at most one novel control per screen (novelty budget in `kb/knowledge/product.md`).

## 4. Cut excise and remember for the user: Excise; respect time and memory (About Face)

Excise is work the tool demands that does not move the person toward the goal, and the cure is a product that remembers so people don't have to.

- Remove confirmations of undoable actions, splash screens, forced tours, "Saved!" dialogs and configuration before first value; merge screens whose only job is to lead to another screen.
- Restore the last state on return: scroll position, filters, open tab, drafts, last-used options and window size.
- Show recents and frequents first, prefill what is known, and put choices on screen instead of asking for recall.
- Never ask the same question twice, and never make people carry information between screens; carry it for them.

Check: count non-goal steps on the primary flow (dialogs, interstitials, tour steps, confirmations of reversible actions); target zero, each survivor with a reason. The return-visit screenshot shows restored state; forms show known values prefilled.

## 5. Make complexity contextual, not merely delayed: Incremental complexity (Fior; Tidwell: progressive disclosure)

The user's cognitive space is sacred: every visible option is a decision that costs attention, so reveal power where and when it becomes relevant, not all at once and not all later.

- Start from the simple use case working on sensible defaults; reveal advanced controls next to the thing they modify, at the moment someone reaches for it.
- Don't hide everything on screen one and dump it on screen two; disclosure follows the task's own shape.
- Give experts an escape hatch: skip onboarding, import, paste a config, a keyboard path, an "all settings" view.
- Cut what most people never use rather than hiding it; hidden complexity is still complexity, and someone still pays for it.

Check: count visible interactive choices on the first screen (measure.json CTA labels plus controls); in the expanded-state screenshot, advanced controls sit adjacent to their trigger; an expert path is visible or one keystroke away.
Values: first screen holds 1 primary and at most 2–3 secondary actions; disclosure one level deep (studio default; a second level usually hides things people need).

## 6. Inform without interrupting: Rich modeless feedback; modality (About Face; Critly: toasts, overlays)

Status belongs on the object and in the periphery, and a modal that stops the world must earn it by asking something only the user can answer now.

- Show state where the eye already is: the button that reads "Saved", the row that dims while syncing, the count inside the field; toast only what happened out of sight, leading with what happened ("Q4 report.pdf is ready") and carrying one action at most.
- Never put an error that needs action in a timed toast; keep it beside what failed or in a banner that stays until fixed.
- Prefer modeless surfaces (inline expansion, popover, side sheet, a new view with Back); when modal, move focus in, keep Tab inside, make the background inert, close on Escape and return focus to the trigger.
- Let backdrop clicks close only cheap-to-reopen layers (menus, pickers, previews), never one holding typed input or a destructive choice; never stack modals.

Check: action screenshots show confirmation at the point of action; no informational modal exists in the flow; the overlay-open screenshot shows a focus ring inside the layer and the after-close screenshot shows it back on the trigger.
Values: toast 4s plain, 8s with an action; 3 visible in a stack with an 8px peek; hover or focus pauses timers; `overscroll-behavior: contain` on overlay scrollers.

## 7. Offer undo instead of asking: Undo and recoverability (About Face; Critly: destructive actions)

A warning asks people to predict their mistake; undo lets them notice it afterwards, which is when people actually notice.

- Do reversible actions at once and offer Undo; back it with a soft delete and a place where deleted things live, and hold side effects (emails, webhooks) until the undo window closes.
- Confirm only what cannot come back: name the object, say what goes with it, repeat the verb on the button ("Delete project"), and start focus on Cancel.
- Reserve type-to-confirm for the rare and catastrophic; keep red for the one button that destroys, and keep trash icons neutral until hover.
- Give editors multilevel undo and a visible history; one level of undo is not recoverability.

Check: every destructive control in the flow shows either an undo toast in its after-screenshot or a specific confirmation; measure.json CTA labels contain no "Are you sure?", "OK" or "Yes" on destructive actions.
Values: undo window 5s; Trash keeps items 30 days; type-to-confirm only at account or project level.

## 8. Prevent the error before you report it: Error prevention (About Face; Saffer)

The best error message is the one the design made unnecessary.

- Constrain choices to valid ones where the set is known (date pickers, steppers with limits), and accept every reasonable format where people type.
- Show requirements before the user acts (password rules, file size limits, character counts), not after they fail.
- Keep impossible actions enabled and explain on press, then focus the missing field; if you must disable, put the reason in visible text beside the control.
- Default to the safe option, and separate destructive from harmless actions by position and by more than color.

Check: requirements are visible in the untouched-form screenshot; any disabled control has adjacent reason text; destructive and primary actions sit at least one spacing step apart and differ in shape, label or position as well as color.

## 9. Choose the navigation model, then keep people oriented: Navigation and wayfinding (Tidwell)

The shape of movement between screens is a decision the nav bar only renders, and every screen must answer where am I, where can I go and how do I get back.

- Pick per area: hub and spoke (one home, tasks return to it; mobile and task tools), fully connected (global nav for peer sections), multilevel tree, step by step (wizard), pyramid (next and previous plus up to the index), or flat (one workspace with panels, for sovereign tools).
- Mark the current location by more than color (weight, indicator, shape) and make the page title match the label that led there.
- Use breadcrumbs only for hierarchies three or more levels deep, give every deep screen an escape hatch home, and give every meaningful state a URL so Back, refresh and sharing work.
- Don't default to a sidebar listing every feature; the model comes from the task.

Check: the flow map in direction.md names one model per area and the screens agree; the active nav item is identifiable in a greyscale screenshot; H1 matches the clicked label (measure.json headings outline); breadcrumbs appear at depth 3 or more and nowhere shallower.

## 10. Give the work center stage: Layout of screen elements (Tidwell)

The thing people came to work on takes the largest, most central area, and a stable frame around it lets the eye stop searching.

- Keep one dominant content area and a visual framework (nav, title, actions) in the same place on every screen.
- Use a card stack (module tabs) for 3–7 peer panels people switch between, never for two items or ordered steps; use accordions or collapsible panels when several sections may be open at once.
- For making things, use canvas plus palette: tools at the edges, an inspector that follows selection; an infinite canvas also needs zoom to fit, a zoom readout and keyboard pan and zoom.
- Don't let chrome, banners or marketing modules outrank the work in a product screen.

Check: in each product screenshot the largest region is the work, not chrome; frame positions are identical across the screen inventory; tab groups hold 3–7 items.
Values: work area 60% or more of a sovereign desktop viewport (studio default).

## 11. Show the list and its detail together: Lists and the two-panel selector (Tidwell)

When people move through many items and inspect each, keep list and selection visible side by side, and choose list mechanics by whether people browse, compare or return.

- On wide screens: list left, detail right, selection highlighted, arrow keys move the selection; on narrow screens: a one-window drill-down whose Back restores list position. Use a list inlay when details are short and a thumbnail grid when items are visual.
- Use infinite, virtualized lists for feeds people browse; use pagination or "Load more" with a count for results people compare or return to, and never infinite scroll above a footer people need.
- Let people add where they look (a new-item row at the top or end), show the sort on its column, and keep numbers right-aligned in tabular figures.
- Don't open a modal per item to inspect a list, and don't hide row actions behind hover alone.

Check: the selected row is highlighted and matches the detail title; the 390px screenshot drills down with a Back control; the list shows its count and sort; row actions are visible in the focus-visible screenshot.

## 12. Let people narrow instead of hunt: Faceted search and dynamic queries (Tidwell; studio)

Search plus filters that update as they change lets people see each choice's effect before committing to it.

- Show facets with counts; hide zero-count options or show them disabled with "0".
- Show applied filters as removable chips above results with "Clear all", and update results and the count live for fast data instead of asking for "Apply".
- On no results, echo the query, say which filter hid matches and turn removing it into one button.
- Don't reset filters on Back or on refresh; keep them in the URL.

Check: the search screenshot shows facet counts, applied chips and a result count; the no-results screenshot echoes the query and offers a one-click way out.

## 13. Use a wizard only for rare, ordered tasks: Wizard (Tidwell; About Face)

A wizard trades speed for guidance, which helps a first-timer on a branching, high-stakes task and slows everyone else down.

- Use it for rare, unfamiliar, order-dependent work (setup, migration, a claim), never for frequent tasks.
- Show the steps and the current one, let Back keep every answer, and save progress so people can leave and resume.
- End with a review step listing every answer with edit links, then a completion screen saying what happened and what comes next.
- Give experts a single-page form or an import as the escape hatch.

Check: step indicator visible; 5 steps or fewer; a review step exists; the Back screenshot shows earlier inputs intact; the completion screenshot names the result and the next action.

## 14. Edit where the content lives: Edit in place and direct manipulation (Tidwell; About Face)

Changing a thing where it sits keeps context and removes a round trip through a form.

- Make editable text look editable on hover and focus; click or Enter starts editing, Enter or blur commits, Escape cancels.
- Show save state beside the edit ("Saving…", "Saved") and keep undo available.
- Give every drag a visible handle, a drop indicator and a keyboard or menu alternative ("Move up", "Move to…").
- Don't make hover the only way to discover an edit; touch has no hover.

Check: hover and focus-visible screenshots of an editable field show an affordance; reorderable lists show handles and a non-drag alternative in a menu.

## 15. Put actions next to what they act on: Actions and commands (Tidwell; Hayes)

An action belongs at the point of attention: beside its object, at the end of the reading path, named for its effect.

- Keep one solid primary per view, secondary actions quieter, and destructive actions as quiet text that turns red on hover.
- Name buttons verb plus object, and make menu items smart: "Delete 3 files"; an ellipsis ("Rename…") when more input follows.
- Place the finishing action (Save, Send, Done) where the flow ends; keep button order identical across the product.
- Group related actions, and show bulk actions in a bar that appears with a selection rather than as permanent toolbar clutter.

Check: measure.json CTA labels are verb-led and specific (no "Submit", "OK", "Click here", "Learn more" without an object); exactly one primary-styled button per view; the primary sits at the end of the reading order.

## 16. Give intermediates accelerators: Perpetual intermediates; command palette (About Face; Critly: command menu)

Most people never stay beginners and never become experts, so design for the middle and let shortcuts carry people further.

- Put every command behind one shortcut (Cmd/Ctrl+K) that opens instantly with no animation, places the cursor in the input and closes on the same keys.
- Match loosely on titles and keyword aliases and show which alias matched; with an empty query, list recent commands first, then those for the current screen.
- Show each command's shortcut beside it, and in tooltips and menus, so the product teaches its own keys.
- Never hijack browser or OS shortcuts; allow single-key shortcuts only outside text fields.

Check: the palette screenshot shows recents, shortcuts on rows and a selected first result; tooltips and menus in screenshots show shortcuts. Check (code): no open or close transition on the palette.

## 17. Make every path work from the keyboard: Keyboard and focus order (Critly: focus rings; WCAG)

Keyboard users, power users and screen-reader users travel the same route, and it must be complete and visible.

- Make Tab order follow visual reading order; arrows move within composite widgets (menus, tabs, grids, listboxes); Enter activates, Space toggles, Escape backs out one layer.
- Style `:focus-visible`, never remove it, and draw it with an outline rather than box-shadow alone so forced-colors mode keeps it.
- Keep focused elements clear of sticky headers, and add a skip link to main content.
- After a delete, close or route change, put focus somewhere sensible, never on the page body.

Check: the focus-visible state board shows a ring on every interactive element type at 3:1 against its background; measure.json accessibility tree shows no accessible-name gaps.
Values: `outline: 2px solid var(--focus); outline-offset: 2px`; `scroll-padding-top` = sticky header height + 8px.

## 18. Make the target bigger than the icon: Hit areas (Craft; Critly: hit areas)

What responds to the pointer need not match what is drawn, so small marks can sit inside generous targets.

- Make desktop icon buttons 32px with a 16px icon centered; aim for 44px on touch.
- Extend tiny controls with an invisible pseudo-element instead of enlarging the mark, without overlapping a neighbor's target.
- Remove dead gaps between adjacent targets: breathing room comes from padding inside each item, not margins between them.
- Never ship an interactive target under 24px.

Check: measure.json tap targets show none below 24×24 and touch primaries at 44×44 or more; menus show no gap between items in the hover screenshots.
Values: 24px floor (WCAG 2.5.8), 32px desktop icon buttons, 44px touch (48dp on Android); `::after { inset: -8px }` turns a 14px control into a 30px target.

## 19. Labels above, one column, fields sized to the answer: Form layout (Tidwell; studio)

A form reads top to bottom like a conversation, and its layout should keep each question attached to its answer.

- Put labels above fields: fastest to scan, safe under translation and at narrow widths; use left-aligned labels only for long settings pages people scan.
- Never use the placeholder as the label; it vanishes when typing starts and rarely meets contrast.
- Use one column, group related fields under a heading, and size each field to its expected answer (postcode short, address long).
- Mark the minority ("(optional)" when most fields are required), ask only what you need, and keep the submit button directly after the last field, aligned with the fields.

Check: every field in the screenshot has a persistent visible label; the label-to-field gap is smaller than the field-to-next-label gap; forms are single column at 390px and on desktop when under 8 fields.
Values: label to field 4–8px; field to next label 16–24px; field height 40–48px; input text 16px minimum.

## 20. Validate when the person is done, and fix in place: Validation timing and error placement (Critly: input details; About Face)

Errors that appear while someone is still typing scold them for not having finished, and errors far from their field send people hunting.

- Check a field on blur; once an error shows, re-check on every keystroke and clear it the moment the value is valid.
- Keep submit enabled until the request starts; on submit, validate everything, summarize at the top with links on long forms, and move focus to the first invalid field.
- Put each message directly under its field in a line reserved in advance, saying what happened and what to do, with everything typed preserved.
- Don't validate on the first keystroke, clear the form on error or show a modal for a field problem.

Check: a mid-typing screenshot shows no error; the blurred-invalid screenshot shows the message under its field, input intact and no layout shift against the untouched state; submit is never disabled in the untouched form.
Values: message 4–8px under the field; style with `:user-invalid`; submit-only validation is the alternative for long forms (GOV.UK).

## 21. Tell the browser what each field is: Input formats and autofill (Critly: input details; Tidwell: forgiving format, good defaults)

Most of what makes a form fast on a phone is invisible: the right keyboard, autofill and paste.

- Set `type`, `inputmode` and `autocomplete` on every field; use `inputmode="numeric"` for codes and card numbers and `autocomplete="one-time-code"` for sign-in codes.
- Accept forgiving formats (spaces in card numbers, any phone punctuation, "3pm" or "15:00") and normalize them yourself; show the expected format as a hint, not a rigid mask.
- Never block paste, and wrap fields in a form so Enter submits.
- Prefill good defaults and smart guesses (country from locale, today's date) and keep them one click from changing.

Check: measure.json input font sizes are 16px or more; format hints are visible in the untouched screenshot. Check (code): every input has `autocomplete` and a fitting `type` or `inputmode`; nothing prevents paste.
Values: input `font-size: 16px` minimum, which stops iOS zoom (never disable zoom instead).

## 22. Specify every key moment as a microinteraction: Trigger, rules, feedback, loops and modes (Saffer)

Each small moment (a toggle, a save, a like, a password check) is a complete design, and if nobody writes its rules the component library does.

- Trigger: bring the data forward, so the control shows its live state before it's touched (unread count, sync status, current value), and make it look like what it does.
- Rules: don't start from zero (use last values, context and the current selection), make errors impossible inside the rules (a slider cannot pass its limits, a submit cannot double-fire), and write the edge cases down.
- Feedback: answer every rule where the eye already is, scaled to the moment's importance, and spend care on the details others overlook (caret, cursor, scrollbar, the loading second).
- Loops and modes: design the hundredth use as well as the first (long loops that remember across sessions and stop teaching what's learned), and avoid modes; when one is needed, make it spring-loaded or unmistakable, with one obvious exit.

Check: direction.md lists each key moment with all four parts; the state board shows feedback for each rule; triggers carry their current state in screenshots; first-run hints are gone from the return-visit screenshot.

## 23. Design every state, not just the mockup: The state matrix (studio; Critly: interaction states)

A control meets people in nine states and a screen in more, and anything not designed is designed by the browser.

- Component states: default, hover, active (pressed), focus-visible, disabled, loading, error, empty, success; screen states add partial (some data missing) and offline (cached, actions queued).
- Hover changes color, never size, and lives inside `@media (hover: hover)`; pressed scales slightly (`kb/knowledge/motion-sound.md`).
- Disabled carries a visible reason; loading keeps the label's width, stays focusable with `aria-busy` and ignores repeat presses rather than disabling.
- Success says what happened and what's next, then gets out of the way.

Check: system.html shows all nine states for every core component, and the state board shows empty, loading, error, partial and success for every target screen in the direction's own voice; no element changes dimensions between the default and hover screenshots.
Values: hover fill shifts about 15% in lightness; pressed `scale(0.97)` for 100ms; disabled 40% opacity plus reason text; focus 2px outline at 2px offset.

## 24. Treat empty, partial and failed screens as real screens: Empty, partial, offline and error states (Critly: empty states; world-class-designer)

Empty, partial and failed screens are seen often, sometimes before the happy path, and they are where a direction usually collapses into a grey spinner and a red banner.

- Write the three empties differently: first use names the thing, says what it's for and offers one action (no jokes between people and the button); no results echoes the query and offers to remove the filter that hid matches; cleared says so and stops, which is where a little delight is earned.
- For partial data, show what loaded and label what's missing in place ("Price unavailable"); for stale data, keep the old content and show "Updated 2 min ago"; offline, show cached content with a quiet status line and mark queued actions as pending.
- For system failure, fail the smallest region: one panel, not the page; say what happened, keep the user's work and offer Retry.
- Keep empty and error states the same height as the content they replace, so nothing jumps when data arrives.

Check: each empty screenshot answers why it's empty, what goes here and what to do next (cleared needs no button); the partial screenshot shows real and missing data side by side with missing values labeled; error screenshots keep the surrounding page alive.
Values: retry at once, then back off 2s, 4s, 8s; after 3 failures offer support with a copyable error ID (studio default).

## 25. Answer on the next frame, then finish the work: Performance is design (Craft; Critly: performance is design, responsiveness, instant navigation, layout shift)

What you show during a wait decides how long it feels, so acknowledgment is immediate even when results are not.

- Change visible state first (pressed, optimistic result, "Saving…"), then do the work; roll back with a message if it fails; never debounce the echo of typed text.
- Match the wait: under 100ms show the result; under 1s hold the layout and show nothing; past 1s a skeleton shaped like the content; past 10s determinate progress, an estimate and Cancel.
- Start loading on intent (hover, press, keyboard focus), delay spinners so fast loads never flash, and land late content in space reserved for it.
- Never stretch a loading state to look smooth; the best loading state is the one deleted by caching, prefetching or rendering on the server.

Check: loading screenshots show skeletons matching the final layout, not a spinner in a void; loaded and loading screenshots align with no shift; the optimistic screenshot shows the result before confirmation. Check (code): interaction to next paint stays under 100ms on a throttled mid-range profile.
Values: show nothing for the first 150–300ms (hold the space); once an indicator appears, keep it at least 300ms so it never flashes; prefetch after 65ms of hover; INP 200ms is the failure line, not the goal; layout shift (CLS) 0.1 or less.

## 26. Keep the prompt live while the model works: AI input anatomy (desengs: ibelick, "Anatomy of AI Input")

An AI prompt input is a stack of layers (the field, a context bar, tool triggers, attachments, an assist layer, message controls and states), and every layer must leave the person able to type, correct or stop at any moment.

- Grow the field with its text up to a fixed maximum height, then scroll inside it, without pushing the layout or jumping the page; Enter sends and Shift+Enter adds a line (configurable).
- Keep typing possible in every state (loading, streaming, error), turn send into stop the moment a request starts, and never steal focus when a response starts or ends.
- Keep the context bar (model, mode, memory) quieter than the field and limited to what people change often; move the rest to slash commands or a menu, all reachable from the keyboard.
- Show attachments as uploading, uploaded, failed or removable with stated limits, preview them optimistically, and put generation errors with a retry in the conversation, not in a toast.

Check: streaming and error screenshots show an enabled input with a stop control during streaming and an inline error with a retry; measure.json input font size is 16px or more on mobile. Check (code): the field is never disabled while a response streams; growth causes no layout shift; every context-bar control has a keyboard path.
Values: field grows from one line to about 8–12 lines before scrolling (studio default); send-to-stop swap with no delay; input font 16px or more on touch.

## When these conflict

Protect the user's work first (undo, preserved input, fail the smallest region), then the shortest path to the goal, then predictability (idioms, stable placement), then speed for frequent use, then guidance for rare use. When incremental complexity fights expert speed, keep the default simple and add an escape hatch rather than exposing everything. When undo and confirmation are both possible, choose undo. When posture and brand expression disagree, posture wins inside the product and brand wins on marketing surfaces.

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
