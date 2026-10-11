# Design research

> Used by: UX researcher (owner), product strategist, interaction designer, content strategist. Distilled from: Jakob Nielsen's ten usability heuristics and severity ratings, and Nielsen and Landauer on small-sample testing; the cognitive walkthrough (Wharton, Rieman, Lewis and Polson) and Spencer's streamlined version; hierarchical task analysis (Annett and Duncan) and the keystroke-level model (Card, Moran and Newell); Steve Krug, Don't Make Me Think and Rocket Surgery Made Easy (the trunk test, small tests often); first-click testing (Bailey) and the five-second test (Perfetti); tree testing from information architecture practice; Cooper on personas and Gothelf on proto-personas and assumptions (Lean UX); Microsoft Inclusive Design (the persona spectrum); Gustavo Fior, "Incremental Complexity" (playing user); the Critly fork of Craft by kausthubh-coder (real-content, empty-states); the open-design state coverage rules by nexu-io (Apache-2.0; ideas only); Brignull on deceptive patterns; W3C on text growth in translation. Written in our own words; see CREDITS.md.

This is research done inside a critique: thought experiments run on screenshots, measure.json and the brief by someone playing the user on purpose. It sharpens judgment and never replaces watching real people (Fior), so every principle ends in a checkable finding or a test to hand back. Principles 1–3 set the evidence rules; 4–10 cast people and break tasks down; 11–17 are the inspection methods; 18–22 stress-test; 23–26 hand back tests, questions and guards. Values are defaults to beat, not ceilings; judge in context; never apply mechanically.

## 1. Start from the decision, not the method: Research question first (studio)

Research earns its cost only when its answer can change a decision, so name the decision and the question before choosing a method or walking a screen.

- Write each question as "we need to know X to decide Y", and drop any question whose answer would change nothing.
- Pick the method from the question: comprehension wants a five-second test, findability a first-click or tree test, friction a walkthrough, robustness a stress pass.
- Scope to the 2–4 key tasks that carry the job (from @product-strategist's screen jobs), not to every screen.
- Don't run a method because it is familiar; a heuristic sweep can't tell you whether anyone wants the product.

Check: every question in the discover file and the Research spec names the decision it informs; a question with no decision is cut.

## 2. Say what a critique can know: Evidence and confidence (studio)

A critique from screenshots can observe layout, words, states and measured values, can predict behavior from principles, and cannot know what real people want, understand or do; every finding says which of the three it is.

- Mark observed and measured facts `high`: what is on screen, measure.json values, a missing state.
- Mark predictions reasoned from a named principle `med`: a label a first-timer will likely misread, a target likely missed.
- Mark claims about desire, vocabulary, frequency, trust and willingness to pay `low`, label them ASSUMPTION, and attach a test (#23).
- Write findings as observation, persona and step, consequence, principle: "At step 3 the rushed persona sees 'Continue' and 'Save' at equal weight and may save a draft believing it was sent (heuristic 1)."
- Don't write "users will hate this" or "users expect"; you have watched no users.

Check: every finding's confidence matches its kind; no `high` finding rests on a prediction; every `low` one names a test.

## 3. Write every assumption down and rank it: Assumption map (Gothelf; studio)

Every design rests on beliefs nobody has tested; listing them and ranking them by risk shows which to test first and which can ride.

- List assumptions about the person (who, situation, vocabulary), the problem (it hurts enough), the solution (they find, understand and trust it) and the business (they pay, return, invite).
- Rank each by how costly it would be if wrong and how little evidence supports it; the costly, unsupported ones go first.
- Phrase each so a test could prove it false: "first-time freelancers find 'New invoice' without a tour", not "the UI is intuitive".
- Don't let an assumption harden into fact by repetition across rounds; it stays labeled until a real test or the user settles it.

Check: the Research spec lists assumptions ranked by risk, each falsifiable, each with a test or a "settled by user" note.

## 4. Cast specific people in specific moments: Personas with context (Cooper; Gothelf)

A persona is useful when it fixes a person, a moment and a goal tightly enough to predict what they do on the next screen; demographics alone predict nothing.

- Write who, what just happened, where they are, which device and hand, what they already know, and what would make them quit.
- Keep @product-strategist's end goal for the primary persona and ground the rest in the brief, the user and any data; a persona built on guesses is a proto-persona, labeled ASSUMPTION part by part.
- Replace stock bios ("Sarah, 34, loves coffee") with the situation: "Ama, between client calls, on her phone, must send a corrected invoice before 5pm".
- Don't invent quotes or a backstory to make a persona feel real; specifics of the moment do that.

Check: each persona row names a moment, a device, a state of mind and a quit trigger; an age, hobby or photo without a moment is cut.

## 5. Walk the flow in more than one mood: States of mind (Norman: affect; studio)

The same screen works for a calm reader and fails a rushed or anxious one, because stress narrows attention, so each key task is walked at least three times in different states.

- Rushed or tired: read only headings, the first two words of each label and the buttons; skip paragraphs; miss anything off the focal path; take the most prominent action.
- Anxious (money, health, data, anything irreversible): read everything near the commit button; look for the total, the recipient and what can be undone; stall at anything vague.
- Interrupted: leave mid-task and return after a refresh, a day or a device switch; look for your place and your input.
- Don't walk only as a calm, curious person with time; nobody uses a product that way when it matters.

Check: walkthrough tables cover rushed, anxious and interrupted passes; on the anxious pass, the commit screenshot shows total, recipient and undo or consequence in one viewport.

## 6. Walk it as a newcomer and as an expert: Both ends of experience (Fior; Cooper)

A first-timer has no vocabulary and little patience to learn one, and an expert has no patience for teaching; a design serves both only if someone plays each on purpose.

- As a first-timer, set aside every concept the team knows, read each label literally, list every term you could not define, and count what you must learn before the first useful result.
- As an expert on the hundredth visit, count unneeded clicks, undismissable teaching, and missing shortcuts, bulk actions and remembered settings.
- Confirm the escape hatch: an experienced person can skip setup and reach full power at once (Fior).
- Don't average the two into a design that slows experts and still strands newcomers.

Check: every term on first-run screenshots is in the task's own language or explained in place; return-visit screenshots show recents or remembered state and no first-run hints.

## 7. Walk it with other bodies and situations: Persona spectrum (Microsoft Inclusive Design)

Ability is often situational (a design that works for someone with one arm also works for a parent holding a baby), so walk the key tasks with permanent, temporary and situational limits.

- Low vision: walk at 200% text and at 320px wide; under a magnifier only a small window shows, so feedback far from the focus point is missed.
- One-handed: on a 390px phone held in one hand, the primary action belongs in the lower half within thumb reach; top corners and two-finger gestures are hard.
- Keyboard and screen reader: every step reachable by Tab and Enter in reading order, every control named.
- Situational: glare (low contrast vanishes), a noisy room (sound-only cues lost), a slow connection, a second language (idioms fail).
- Don't file these in an accessibility appendix; walk them as personas in the same tables (floor: `kb/knowledge/accessibility.md`).

Check: 200% and 320px screenshots keep the key task possible with no horizontal scroll; at 390px the primary action sits in the lower half or stays pinned; measure.json tap targets are 44px or more on touch and `a11y.unnamedControls` is 0.

## 8. Break the task down before judging it: Task analysis (Annett and Duncan: HTA)

A task is a goal broken into subgoals, steps and actions, with plans saying in what order and when; drawing that tree exposes extra steps, hidden decisions and information people must carry.

- Write the goal, then 3–7 subgoals, then the actions under each, with the plan ("do 2 only for a new client").
- For each step, note what information the person needs and where it comes from: on screen, memory, or somewhere else (an email, a paper bill).
- Flag every step whose information is off-screen; that is where people copy, switch tabs and make errors.
- Compare the tree with the screens: steps that exist only because of how the system is built are excise (`kb/knowledge/interaction.md` #4).
- Don't analyze the design's flow instead of the person's task; start from what they are trying to get done.

Check: each key task in the Research spec has a step list with information sources; every "from elsewhere" step is fixed in the screens or filed as a finding.

## 9. Price the path in seconds: Keystroke-level estimate (Card, Moran, Newell)

For skilled routine use, a task's time can be estimated by adding standard times for each point, keystroke, hand move and mental decision, which turns "feels long" into a number two designs can be compared on.

- Count the operators along the correct path: pointing, keystrokes, moves between mouse and keyboard, and a mental preparation before each decision.
- Compare alternatives on the same task and keep the cheaper one unless it costs first-timers clarity.
- Watch decisions more than clicks: removing one choice often saves more than removing one click.
- Don't use it for first use, which is dominated by searching and learning; walk that with #11.

Check: walkthrough totals list steps, decisions and estimated seconds per key task beside the target from the success criteria.
Values: KLM estimates: point about 1.1s; keystroke about 0.2–0.3s; hand between mouse and keyboard about 0.4s; mental preparation about 1.35s; button press about 0.1s.

## 10. Map the journey beyond the screen: Journey map (studio)

People meet a product as a sequence that starts before the first screen and continues in email, notifications, waits and the next visit, and most friction hides in the seams between them.

- Lay out stages from the trigger (what made them come) to the second visit, with what they do, think and feel, and the touchpoint at each.
- Include the off-screen parts: the confirmation email, the wait for approval, the notification, the receipt, the reminder.
- Find the seams: a promise one touchpoint makes and the next breaks (the email says "one click to finish" and the link lands on a login); hand the feeling line to @emotion-designer.
- Don't map only the screens you were asked to design; the seam just outside them often decides the task.

Check: the journey map runs from trigger to second visit, names each off-screen touchpoint, and gives every pain point an owner role.

## 11. Ask four questions at every step: Cognitive walkthrough (Wharton, Rieman, Lewis, Polson)

A cognitive walkthrough tests whether a first-time person can learn a task by exploring, by asking the same four questions at each step of the correct path.

- Fix the persona, the task, the screens and the correct action sequence first; the walkthrough judges that path.
- At each step ask: will they try to do this (do they know the step is needed)? will they notice the control? will they connect it with what they want? after acting, will they see they made progress?
- For every "no", write a failure story: who, which step, what they do instead, and what it costs them.
- On long flows, use the two-question version (do they know what to do; do they know it worked) and keep all four for the riskiest steps (Spencer).
- Don't answer "yes" because you know the product; answer as the persona with only what that screenshot shows.

Check: each key task has a table with one row per step and four answers; every "no" is a finding with its step and screenshot; a first-time pass with no "no" at all gets walked again.

## 12. Predict the first click: First-click test (Bailey)

People whose first click on a task is right usually finish it, and people who start wrong mostly don't, so the first click on each key screen gets its own check.

- Write each task in the user's words ("send the corrected invoice to Kofi"), then look at the screen as the persona and name the first click.
- List the competitors: anything whose label or position matches the task's words as well as the right target.
- Make the right target the strongest match for the task's words and the most prominent candidate in its region, at both widths (on mobile it often hides behind a menu).
- Don't accept "they would find it eventually"; the first click is the measure.

Check: for each key task and screen, the correct target is in the first viewport at 1280px and 390px, its label shares a word with the task, and no other control matches the task equally.

## 13. Give it five seconds: Five-second test (Perfetti)

What someone recalls after five seconds on a screen is what the screen actually communicates; the rest is what the team hopes it says.

- Look at the first screenshot for five seconds, look away, and write what it is, who it is for, what you can do, and the one thing you remember.
- Compare those with the job story and the emotional target; every gap is a hierarchy or copy finding.
- Use it on landing, first-run and any screen people meet cold; it says nothing about deep work screens.
- Don't run it on a screen you have already studied; use a fresh critic or the critics' first-impression lines.

Check: from the first screenshot alone a critic names what it is, for whom and the next step; the critics' first impressions share at least two words with the brief's target.

## 14. Get oriented anywhere, from labels alone: Trunk test and tree test (Krug; IA practice)

Dropped onto any inner page, a person should know where they are and where to go; given only the navigation labels, they should pick the path to what they want.

- Trunk test: on a random inner screenshot, find the product's name, the page's name, the main sections, the options at this level, the you-are-here marker and search.
- Tree test as a thought experiment: write the navigation as a bare text tree and, for each key task, choose the path a first-timer would take before looking at the screens.
- Flag labels two tasks could both claim, and categories named after the org chart instead of the user's goal.
- Don't let icons or position carry navigation alone; the test is whether the words predict the contents.

Check: any inner screenshot passes all six trunk-test items; for each key task, the label path a first-timer would choose reaches the right screen.

## 15. Sweep the first five heuristics: Usability heuristics 1–5 (Nielsen)

Ten broad heuristics catch most problems an inspection can find; sweep one heuristic at a time across every key screen and state, not the whole list per screen.

- Status: the product always shows what it is doing and what just happened, promptly and near the action.
- Real-world match: words, icons and order come from the person's world, not the database or the org chart.
- Control and freedom: every step has a visible way out (back, cancel, undo) that costs nothing.
- Consistency: one word and one look per thing across the product, with platform conventions kept.
- Error prevention: remove the chance of the error, or check before commit, rather than explain afterwards.

Check: each violation is a finding naming the heuristic number, the screen and the state.

## 16. Sweep the second five: Usability heuristics 6–10 (Nielsen)

The second half of the sweep covers memory, speed, focus, recovery and help.

- Recognition over recall: options, objects and needed facts stay visible or one step away; nobody carries data between screens in their head.
- Flexibility and efficiency: experts get accelerators (shortcuts, bulk actions, saved defaults) that newcomers never have to see.
- Focused design: every extra element competes with the ones that matter, so each screen shows what this moment needs.
- Error recovery: errors say in plain words what went wrong and exactly how to fix it, beside the problem, with input kept.
- Help: the best help is none needed; otherwise it is short, shaped like the task, findable and next to it.

Check: each violation names the heuristic number, the screen and the state, and takes its severity from #17.

## 17. Rate problems by frequency, impact and persistence: Severity (Nielsen)

A problem's severity combines how many people hit it, how hard it stops them, and whether it bites once or every time; rating it keeps the studio fixing what matters first.

- Rate frequency (one persona or all), impact (a pause or a dead end) and persistence (learned once or met every visit).
- Raise severity on the key task path, on anything touching money, data or irreversible actions, and on anything below the accessibility floor.
- Merge duplicates found by different methods into one finding carrying all the evidence.
- Don't inflate polish into majors to win attention; the tally weights severity.

Check: every finding's severity follows the mapping below, and its evidence states frequency, impact and persistence.
Values: Nielsen 4 (catastrophe) → `blocker`; 3 (major) → `major`; 2 (minor) → `minor`; 1 (cosmetic) → `polish`; 0 is not a problem, so don't file it.

## 18. Keep a dataset of awkward real content: Real content (Critly: real-content)

Mockups hold short names, square photos and a dozen tidy items; real accounts have long names, no names, no photos, nothing or thousands, so every design is tested against a standing set of awkward records.

- Keep names over 40 characters, a missing name (fall back to email), a single name, diacritics, a right-to-left name, CJK and an emoji.
- Keep the longest real title, a 200-character title, a string with no break points (a URL, a long compound word), empty optional fields, and images of every shape and none (panorama, tall portrait, tiny, broken link).
- Give each text box a plan from the dataset: truncate what can be read in full elsewhere, clamp previews, wrap anything that must be read whole.
- Don't judge a layout on the data it was drawn with; judge it on the worst record it will get.

Check: on the stress board (`?state=stress`) long names truncate with the full text reachable, missing names show the fallback, images keep one height per row, and no text overlaps or escapes its box.
Values: "Dr. Oluwaseun Abernathy-Castellanos Montgomery" (46 chars); no name → "kofi.mensah+invoices@ashanti-studio.co"; "Zoë Ångström-Łukasiewicz"; "محمد عبد الرحمن"; "陈静怡"; "Rechtsschutzversicherungsgesellschaften".

## 19. Test zero, one and a thousand: Quantity edges (Critly: real-content; studio)

Every list, count and total hides three designs: none, exactly one, and more than the layout imagined.

- Test 0 (an empty state the same height as the list it replaces), 1 (singular grammar, a lone card that doesn't stretch), the screenful, and 1,000+ (pagination, abbreviated counts).
- Test numbers and dates at their extremes: the largest realistic amount, zero, negative, a foreign currency, a value that changes while visible; just now, years ago, in the future, another time zone.
- Test badges and chips past their width: 99+, 40 tags, a 12-digit reference number.
- Don't accept "1 items", "0 results found for ''" or a count that wraps under its label.

Check: the stress board shows 0, 1 and 1,000+ versions of each list or count; grammar is right for 1; large numbers carry separators and tabular figures; no count wraps or clips.
Values: counts 0, 1, 2, 12, 999, 1,000, 1,284, 10,000+; money $0.00, $1,284,560.75, −$42.10, ¥128,000; badge cap 99+.

## 20. Let the words grow and change direction: Translation and long words (Critly: real-content; W3C)

Text leaves English longer and sometimes right to left, so every layout is walked with grown strings before it is called done.

- Grow long strings by about 30% and short labels by two to three times, then repeat at 200% text, since the two compound.
- Pseudo-localize to find clipping: wrap strings in markers and add accents so hard-coded and clipped text shows at once.
- Put a long compound word in the narrowest column, and mirror one screen right to left (directional icons flip; numbers and brand marks don't).
- Don't fix button widths, or build sentences from fragments that can't reorder in other languages.

Check: on the stress board, buttons and tabs fit grown labels with no clipping and no ellipsis on actions; the RTL screenshot mirrors layout and directional icons; nothing overflows at 200% text.
Values: strings over about 70 characters grow about 30%; labels under 10 characters can grow 200–300% (W3C, citing IBM); pseudo-locale sample "[Ŝéñð ïñṽöïçé ·····]".

## 21. Break each surface its own way: Edge matrix (open-design: state coverage; studio)

Each surface type fails in its own characteristic way, so the stress pass uses a matrix of scenarios per surface instead of one generic checklist.

- Load tables, dashboards and charts with 10,000+ rows, a column of nulls, sort and filter together, and charts of one point, all zeros, a negative and an outlier 100 times the rest.
- Fill lists, cards and feeds with a 200-character title, missing image and avatar, no secondary action, one item and mixed item types; search with one character, symbols only, a typo, zero results under an active filter, and 1,000+ results.
- Submit forms with every optional field empty, every required one at maximum length, pasted values with spaces and formatting, autofill in the wrong field, and a double click on submit.
- Break flows and checkout with the back button mid-flow, a refresh on the last step, an expired session, a declined card, a rejected coupon and an address with no postcode.
- Strip detail and marketing pages of all optional metadata, feed them RTL content with LTR embeds, and view them at 320px and 2560px with fonts and scripts failing to load; don't stop at the surfaces designed first.

Check: the Research spec has an edge-matrix row for each surface type in scope, each with a matching stress or state screenshot in which the layout holds.

## 22. Make it fail on purpose: Failure and interruption paths (open-design: state coverage; Norman)

The flows people remember are the ones that went wrong, so each key task is walked through its likely failures and judged on what is kept and what is offered.

- Walk the network failing mid-save, a response slower than 15 seconds, a timeout, a declined payment, a permissions error and an expired session.
- Walk leaving and returning: refresh, back button, closing a tab with unsaved work, switching device, coming back the next day.
- At each failure, check the cause is named in plain words, the input is kept, and one way forward is offered; after repeated failures, retries back off and support replaces another retry.
- Don't accept a flow that restarts from step one after any error.

Check: the state board shows each failure with input intact, a named cause and one action; refresh and return screenshots resume at the same step with input kept.
Values: open-design defaults: a "taking longer than expected" note at about 15s; retries at about 2s, 4s and 8s; after 3 failures, support with a copyable error ID.

## 23. Propose the cheapest test that would change the decision: Test ladder (Nielsen; Krug)

When a critique reaches the edge of what it can know, the useful move is a named, cheap, real test, not a louder opinion.

- Start at the bottom: ask the user who knows, then check what already exists (support tickets, search logs, analytics, sales calls, competitors' reviews).
- Next test screenshots with real people: a five-second, first-click or tree test with about five people per distinct user group.
- Then test the build: three to five people doing the key tasks aloud; fix and test again rather than test more people once (Krug).
- Use A/B tests only with real traffic, a metric tied to the job and a guard metric for harm.
- Write each test as question, method, who and how to recruit, which result changes which decision, and cost in hours.

Check: every `low`-confidence finding and every top-ranked assumption in the Research spec carries a test in this form.
Values: about five people per user group surface roughly 85% of the problems a test of that design can find (Nielsen and Landauer); a five-second or first-click round takes under an hour; a hallway round about half a day.

## 24. Hand back the questions only users can answer: Research questions (studio)

Some questions are settled faster by asking the user than by any design argument, and some only real users can settle; the studio hands both back plainly instead of guessing.

- Ask the user, at most three per discover file, what only they know: who the users really are, what they call things, what is true about the product, what data exists.
- Mark "test with real users" on whatever needs behavior or preference: whether people find it, understand it, trust it, would pay.
- Rank questions by the decision they change, and state what the studio will assume meanwhile.
- Phrase questions so the answer is usable ("Do your clients pay by card, transfer or both, and in roughly what share?", not "tell us about payments"), and never ask what the brief, references or screens already answer.

Check: the discover file holds at most three user questions, each with its decision and interim assumption; the Research spec lists the real-user questions with tests.

## 25. Never invent evidence: Honest research (studio)

Fabricated research is worse than none, because it gives a guess the authority of a finding and hides the question nobody asked.

- Never write quotes, participants, percentages, task times or scores as if they came from users; report a thought experiment as one.
- Never present a proto-persona, a synthetic interview or a model's opinion as user research; keep the user's own words from the brief exact and attributed.
- When screens show statistics, testimonials or ratings, ask where they come from; unsourced proof is a finding (`kb/knowledge/content.md` #4).
- Don't let confident tone stand in for evidence.

Check: no finding cites users, studies or numbers without a source in the brief; every persona part and claim resting on a guess is labeled ASSUMPTION.

## 26. Run the regret test: Dark-pattern guards (Brignull)

If a person told exactly what a screen did would feel tricked, the design is deceptive whatever the metric says, and research is where that test is run on purpose (`kb/knowledge/product.md` #23).

- Walk every commercial and consent step as someone reading their statement a month later: were price, renewal, fees and data use visible before commit?
- Compare paths: cancelling, declining and opting out take no more steps than signing up, accepting and opting in.
- Check defaults and pressure: consent and add-ons start unchecked; urgency, scarcity, social proof and countdowns are real and sourced; declines use neutral words.
- Don't count a conversion won through confusion (an accidental upgrade, a failed cancel) as success; it is a defect in the metric.

Check: consent and add-on boxes are unchecked in the screenshots; decline links use neutral copy; the cancel path has no more steps than sign-up; no countdown, "only 2 left" or viewer count without a source.

## When these conflict

Within research: evidence beats opinion, and a cheap real test beats a long argument. On paths walked once, the anxious and first-time personas outrank the expert; on paths walked every day, the expert wins. The worst real record beats the prettiest sample. The user's words beat the team's vocabulary. Honesty beats conversion every time. Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
