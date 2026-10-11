# Emotional design

> Used by: emotion designer (owner), brand designer, interaction designer, content strategist. Distilled from: Emotional Design and The Design of Everyday Things (Norman); Designing for Emotion (Walter); Microinteractions (Saffer); Laws of UX (Yablonski); Hayes; Kahneman's peak-end research; Lindgaard et al. on first impressions; Maister on the psychology of waiting; Craft by Gustavo Fior (novelty budget, performance is design, interface SFX) and the Critly fork (product feel, destructive actions, empty states); NumberFlow (Maxwell Barvian); Anshu Chimala and Willis Wee on what makes AI-assisted work feel personal. Written in our own words; see CREDITS.md.

Use this to decide how a product should feel moment to moment, where it may be expressive and where it must stay calm. Feelings are produced by concrete levers (sequence, copy, timing, scale, colour temperature, sound), so every finding names the lever. Motion and sound mechanics and their values live in `kb/knowledge/motion-sound.md`, the laws in `kb/knowledge/ux-laws.md`. Principles generalise; Values are defaults to beat, not ceilings. Judge in context; never apply mechanically.

## 1. Decide what the first three seconds feel like: Emotional target (Lindgaard; studio)

People judge a screen's appeal within a fraction of a second, and that verdict colours everything after, so the first screen must deliver a named feeling before a word is read.

- Write the target as three feeling words, in the user's own words when they gave any, plus one comparison from life ("like opening a well-made field notebook"), and name the anti-feeling.
- Choose the levers that deliver it: the hero subject, colour temperature, type scale, density, and the first motion if any.
- Set it with @brand-designer once per project; every screen inherits it.
- Do not write "modern and clean"; it names no feeling and produces the default page.

Check: look at the first screenshot for three seconds (or at thumbnail size) and write three words; at least two should match the target in the brief.

## 2. Design all three levels: Visceral, behavioural, reflective (Norman)

People respond at three levels at once: the visceral (immediate look, sound and feel), the behavioural (the pleasure and control of use) and the reflective (what it means to them and what they tell others).

- Visceral: form, colour, material and sound, judged instantly.
- Behavioural: does it do the job, do I feel in control, does it answer me, judged across the flow.
- Reflective: self-image, memory and story, judged afterwards.
- Do not let visceral beauty paper over behavioural failure; the reflective verdict remembers the failure.

Check: the critique scores the first screenshot (visceral), the state board and flow (behavioural), and the end screen plus narrative (reflective) separately.

## 3. Climb the needs in order: Hierarchy of user needs (Walter)

An interface must be functional, then reliable, then usable, and only then pleasurable; pleasure on a broken base reads as an insult.

- Functional: the job can be done. Reliable: it behaves the same way every time, with honest states. Usable: easy to learn, hard to get wrong.
- Pleasurable: personality, surprise and delight, built on the three layers beneath.
- Design the error, empty and loading states before any celebration.
- Do not add delight to cover a reliability problem.

Check: the state board is complete before any expressive moment is critiqued; a missing state outranks every delight finding.

## 4. Design for the mood people arrive in: Affect and attention (Norman)

Positive affect broadens thinking and makes people tolerant and exploratory; anxiety narrows attention and makes small obstacles feel large.

- On tense screens (money, health, deadlines, deletion): fewer choices, larger targets, plain copy, no surprises, no decorative motion.
- On relaxed screens (browsing, creating, learning): room to explore, personality, discovery.
- Read the persona's state of mind from the job story and set it per screen.
- Do not put playful copy or motion on a screen people reach under stress.

Check: on payment, delete and error screens, a critic counts 2 or fewer competing actions and finds no decorative motion or jokes.

## 5. Write the product's personality down: Design persona (Walter)

A product with a written personality behaves consistently; one without it borrows the average.

- Describe the product as a person: a personality image, three to five traits written as "this, not that", its voice, a visual lexicon, and how it engages.
- Map each trait to levers: type, colour temperature, motion character, copy rhythm, sound.
- Agree the persona with @brand-designer (identity) and @content-strategist (voice).
- Do not choose traits every product claims (friendly, intuitive, modern).

Check: a blind critic shown the screenshots can name two of the written traits; each trait has a visible consequence.

## 6. Set the feel dials before the numbers: Product feel (Critly: product-feel)

When nobody decides how a product should feel, every value defaults to the middle and the product feels like nothing; three dials decide most of the feel.

- Density: compact or comfortable. Pace: instant or animated. Tone: quiet or expressive.
- Archetypes: a tool open all day is compact, instant, quiet; a calm app visited a few times a day is comfortable, unhurried, quiet; a playful app people choose to open is comfortable, springy, expressive.
- Answer first: who, how often, in what state of mind, and three words for the feel.
- Do not mismatch: a playful spring on a table scanned fifty times a day reads as broken, not fun.

Check: measure.json row heights and type sizes match the density dial; the durations in the motion table match the pace dial (`kb/knowledge/motion-sound.md` #4).
Values: tool about 150ms strong ease-out, 32px rows; calm about 300ms gentler curve, 48px rows; playful spring with overshoot, saved for key moments (Critly).

## 7. Draw the emotional arc of the flow: Emotional journey (studio)

A flow is a sequence of feelings, and designing it means planning where tension rises, where it resolves and where it peaks.

- List the steps; for each, write the user's state, the intended feeling and an intensity from -2 to +2.
- Mark the dips (anxiety, waiting, effort) and make each shallower and shorter; never hide a dip behind decoration.
- Place one peak at the meaningful accomplishment, not at sign-up or on the landing page.
- Do not flatten the arc with even delight everywhere; contrast is what makes the peak land.

Check: direction.md holds the arc table; the screen at the marked peak is visibly the one expressive moment and the dip screens are the calmest in the set.

## 8. Design the peak and the end: Peak-end rule (Kahneman)

People remember an experience by its most intense moment and its ending and largely ignore its length (law and completion rules: `kb/knowledge/ux-laws.md` #10).

- End every flow on a screen that confirms what was achieved, with the real specifics, and offers one next step.
- Fix the worst moment first; a negative peak dominates memory more than any positive one.
- Make the end a resolution: calm, proportional, about the person's result.
- Do not end on a blank screen, a spinner, a generic "Success!" or a silent redirect to the dashboard.

Check: every flow on the state board ends on a screen that names the result with real data ("Invoice 0142 sent to Ada Lovelace, €1,280") and offers one next action.

## 9. Use open loops and visible progress honestly: Zeigarnik and goal-gradient (Yablonski)

Unfinished tasks stay on the mind and effort rises as the goal nears, so visible, real progress pulls people through long work.

- Show where they are and what remains in words ("2 of 5 left: payment, review"), and save progress quietly as they go.
- Break long tasks into milestones that each feel finishable; credit steps genuinely done.
- Make resuming one action from the entry point.
- Do not fabricate progress, add steps to make a bar move, or turn the open loop into streaks, guilt badges or nag counts.

Check: multi-step screens show position and remaining steps in text, matching the real count; partial-state screenshots show a resume action; badges count only items that need attention.
Values: 3 to 5 visible steps per flow (studio default).

## 10. Map the anxiety points and meet each one: Risk and trust (Walter)

Trust is earned at the moments people feel exposed: money, personal data, irreversible actions, public posting, and waits with an uncertain outcome.

- List every anxiety point with its specific fear ("will I be charged today?", "who will see this?").
- Meet each at the point of doubt: what exactly will happen, the total and the recipient, a preview, undo, who can see it.
- Reassure with facts ("Cancel any time in Settings; you keep access until 30 June"), not padlock clip art and badges.
- Do not hide the consequence in small print or behind a link.

Check: on every commit screen, the total or consequence and what happens next sit in the same viewport as the CTA; destructive buttons name their object.

## 11. Give before you ask: Commitment after value (Walter; studio)

Asking for commitment before showing value makes people carry the risk up front, so lower the risk until the product has earned the ask.

- Let people try before creating an account where possible; ask for payment after value has been shown.
- Remove risk with real terms stated plainly: trial length, export, cancellation, refunds.
- Ask for one thing at a time, when it is needed (location when mapping, not at sign-up).
- Do not request permissions, cards or personal details before the person has seen what they get.

Check: the state board shows value (a result, a preview, sample data) before any request for payment or permissions.

## 12. Make waiting shorter and safer to sit through: Psychology of waiting (Maister; Craft: performance-is-design)

Unexplained, uncertain and anxious waits feel longer than explained, occupied ones, so the shape of a wait is designed.

- Show the shape of what is coming instead of a spinner; for long jobs, show progress and what is happening.
- For waits under about 300ms show nothing and hold the space so nothing jumps.
- Tell the truth about duration ("About 2 minutes; you can leave this page").
- Do not add fake delays, and do not rotate jokey loading lines on frequent loads.

Check: loading-state screenshots are shaped like their content; any operation longer than a few seconds shows progress or a time estimate.
Values: under 300ms nothing; 300ms to 1s hold layout and fade; over 1s skeleton or progress (Craft).

## 13. Make mistakes cheap so people dare to explore: Forgiveness (Norman; Critly: destructive-actions)

People explore when errors cost little, and a product that forgives builds confidence that no reassuring copy can (mechanics: `kb/knowledge/interaction.md` #7).

- Let reversible actions happen at once with undo, and keep removed things somewhere they can be found.
- Confirm only the irreversible, naming the object and what goes with it, with the verb on the button.
- Preserve what the person typed through every failure.
- Do not ask "Are you sure?" on every delete; the habit clicks through the one time it matters.

Check: delete actions on the state board show an undo state; irreversible confirmations name the object and use a verb label ("Delete project"), not "OK".

## 14. Give delight a denominator: Novelty budget (Craft: novelty-budget)

Repetition drains meaning, so delight is a small budget, about a tenth of the experience, spent by frequency: the rarer the moment, the more expressive it may be.

- Frequent actions (hover, tab switch, checking a box) spend nothing.
- Occasional actions (opening a dialog, sending) get a short, quiet transition.
- Rare moments (finishing onboarding, inbox zero, a yearly recap) get the budget; once-only moments happen once.
- Do not multiply a 300ms flourish by fifty uses a day; count the cost.

Check: the main working screen has no decorative motion; the expressive moment named in the arc is attached to a rare event.
Values: constant 0ms; occasional 150 to 250ms; rare up to about 600ms (`kb/knowledge/motion-sound.md` #3).

## 15. Earn the surprise and build the anticipation: Surprise and anticipation (Walter)

A pleasant surprise lands only when it is unexpected and fits the moment, while anticipation (knowing something good is coming) adds value before it arrives.

- Put surprises on discovery and success moments: a detail found on the second visit, a recap with a specific number.
- Build anticipation with honest previews: what comes next, what the result will look like.
- Retire or vary a surprise; the second time it is a feature, the tenth it is noise.
- Do not surprise anyone on screens about money, data or errors.

Check: any surprise element in the screenshots sits on a success or discovery screen, never on payment, settings or error screens.

## 16. Let small moments carry the personality: Microinteractions (Saffer)

Personality lives in single-purpose moments (a toggle, a copy button, a counter), each with a trigger, rules, feedback, and loops and modes (full model: `kb/knowledge/interaction.md` #22).

- Choose one overlooked microinteraction and make it the signature moment that fits the persona.
- Do not start from zero: remember the last choice, and bring the data forward into the trigger (the count on the button, the preview in the field).
- Use long loops: reduce instruction as the person learns, and let the moment change over time.
- Do not give every control its own flourish; one signature microinteraction is enough.

Check: the system sheet shows the signature microinteraction in every state; every trigger on the state board has visible feedback.

## 17. Let motion carry meaning: Meaningful motion (NumberFlow)

Motion earns its place when it tells the viewer what changed before they read it: a number that rolls upward says the value rose, and only the digits that changed should move (mechanics: `kb/knowledge/motion-sound.md` #18).

- Ask of each animation what news it carries (direction, origin, cause, magnitude); if none, it is decoration.
- Match the motion's character to the persona: a calm product settles, a playful one may overshoot at its rare moments.
- Keep the meaning when motion is reduced: an instant change or a short fade still shows what changed.
- Do not animate a number for show, or one the person is typing.

Check: changing numbers in the screenshots use tabular figures; the motion table states what each animation communicates. Check (code): reduced motion keeps the state change visible.

## 18. Make sound and haptics quiet confirmations: Interface feedback (Craft: interface-sfx)

A cue is a few milliseconds that says one thing (that worked) about something people can already see; it is never the only carrier of a message (values: `kb/knowledge/motion-sound.md` #23 and #24).

- Shape each cue like its action and like the persona: a crisp tick for a precise tool, a soft rounded tone for a calm one; haptics follow the same rule, on discrete outcomes only.
- Use cues where completion may happen out of sight (send, copy, save, a long job finishing) and keep them at the edge of attention.
- Never cue typing, scrolling, navigation or anything that can fire twice in a second; keep an obvious mute that remembers.
- Do not make sound the joke; if a cue tires you by the tenth repeat, cut it.

Check: if the product uses sound, a mute control appears in the chrome screenshot and the sound table pairs each cue with a visible change.

## 19. Celebrate in proportion: Proportional celebration (studio; Critly: empty-states)

The size of a reaction should match the size of the achievement, and a celebration repeated too often stops meaning anything.

- Routine success: an inline change or a brief toast in the past tense of the action ("Published").
- First-ever or milestone success: the expressive moment, once.
- Cleared states (inbox zero, all done): a mark and one short line, with no button.
- Do not fire confetti for saving a form.

Check: routine success states in the screenshots are inline or toast-sized; any full-screen celebration matches a milestone named in the arc table.

## 20. Make failure feel recoverable: Emotional handling of errors (Walter; Norman)

An error is a negative peak in the making, and how it is handled decides whether trust drops or grows (wording: `kb/knowledge/content.md` #13).

- Take the blame for the system; say what happened, what is safe, and the one way forward.
- Keep everything the person entered.
- Keep colour and tone calm: no red wall, no exclamation marks.
- Do not joke when something was lost (money, data, time); humour belongs to low stakes only.

Check: the error-state screenshot shows preserved input, a plain cause and one fix action, with no exclamation marks, "Oops" or jokes.

## 21. Give it soul through specifics: Detail, point of view and voice (Chimala; Wee)

Generated work is bland because it takes the most probable option at every step; soul is the opposite, made of choices only someone who knows the subject would make.

- Specific details: real objects, names, places, numbers and habits from the subject's world (the actual tools on the desk, not "a laptop").
- Point of view: opinionated choices and visible omissions, things the product deliberately does not do.
- Human voice: sentences a particular person could have written, with concrete verbs and no filler.
- Do not fake soul with exclamation marks, emoji, quirky 404 jokes or a mascot pasted on a generic layout.

Check: a critic lists at least three details in the screenshots that could only belong to this product; one or none is a finding.

## 22. Design the story people will tell: Reflective level (Norman)

The reflective level is what people say about the product afterwards, so give them something worth showing and a self-image worth having.

- Make the outcome tangible: a result, a receipt, a recap, an artefact that can be kept or shared.
- Let the end screen reflect the person's achievement, not the product's.
- Keep claims modest enough that the experience exceeds them.
- Do not ask for a share, a rating or an upgrade before the person has enjoyed the result.

Check: the end screen shows an artefact or number that belongs to the user; any share or rating prompt follows it rather than replacing it.

## 23. Protect the emotional floor: Calm by default (WCAG 2.3.1; Brignull)

Some feelings must never be designed in: fear, shame, false urgency and sensory overload (floor detail: `kb/knowledge/accessibility.md` #11).

- Honour reduced motion, never flash more than three times a second, and never autoplay sound.
- Never use confirmshaming, fake countdowns or guilt nudges to move a metric.
- Keep the visual temperature of stressful screens low.
- Do not use fear as a conversion lever.

Check: no copy shames a decline and no countdown lacks a real date. Check (code): a reduced-motion path exists and nothing flashes more than three times per second.

## When these conflict

Within emotion: calm beats delight on any screen involving money, data or irreversible actions; fixing the worst moment beats adding a peak; the end beats the middle when effort is limited; specific beats charming; one earned peak beats even sprinkled delight. Then defer to the studio ladder:

1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
