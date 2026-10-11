# Product thinking

> Used by: product strategist (owner), interaction designer, content strategist, brand designer. Distilled from: About Face (Cooper, Reimann, Cronin, Noessel); Jobs to be Done (Christensen; job stories); Google's HEART framework (Rodden, Hutchinson, Fu); the Kano model; Laws of UX (Yablonski); Hayes; Craft by Gustavo Fior (novelty budget, performance is design, timelessness) and his essay "Incremental Complexity"; Anshu Chimala (Lenny's Newsletter); design-director by Jose Nogueira (intake ideas); Brignull on deceptive patterns. Written in our own words; see CREDITS.md.

Read this before deciding what a screen is for, what goes on it and what gets cut. The general laws live in `kb/knowledge/ux-laws.md` and the mechanics in `kb/knowledge/interaction.md`; this file applies them to the product decision. Principles generalise; Values are defaults to beat, not ceilings. Judge in context and never apply a rule mechanically. When a Check cannot be answered from the screenshots, measure.json and the brief, the brief is missing something: say so in the finding.

## 1. Ask only what you cannot find: Intake (design-director; studio)

Every question costs the user attention, so read the product, the site and the references first, then ask only for what nobody but the user knows.

- Find for yourself: what the product is, its current pages, competitors, existing copy and colors.
- Ask for the one thing a visitor must understand or do, the audience's sophistication, three feeling words in the user's own words, anti-inspirations (what feels tacky, which competitors not to resemble), must-keep elements, and an ambition dial from 1 (safe) to 5 (ideas that sound terrible often work).
- Ask for real content early; designing around lorem ipsum hides the real problem.
- Do not ask more than three questions at once, and propose a default with each.

Check: the brief names the one thing a visitor must understand or do, the audience, the feeling words, the anti-inspirations and the ambition level; any missing field is a finding against the brief, not the design.

## 2. Frame the problem before anyone draws: Problem framing (studio)

A design answers a question, so state the question as a person's problem in a situation, with a cost, before any solution enters the room.

- Write the problem as observed behaviour plus its cost ("finance leads rebuild the same report every Monday; it takes two hours"), never as a missing feature.
- Name today's workaround; the spreadsheet, the email thread or doing nothing is the real competitor.
- Draft three framings, pick one, and record why the others lost.
- Do not accept "build a dashboard" as a brief; ask which decision the dashboard serves and design for that decision.

Check: the brief holds a one-sentence problem with a person, a situation and a cost; the first screen speaks to that problem in the user's words, not in feature names.

## 3. Design for one person's goals: Goal-directed design (Cooper)

Tasks change with technology while goals stay put, so design from what one specific person wants to achieve and to feel.

- Separate end goals (what they want done), experience goals (how they want to feel) and life goals (who they want to be); screens serve end goals first.
- Build the persona from behaviour: context, frequency of use, skill, state of mind, tools at hand; set posture from it (`kb/knowledge/interaction.md` #2).
- Name one primary persona per surface; serve secondary personas only where it costs the primary nothing.
- Refuse the elastic user who stretches to justify any feature someone wants; stock bios ("Sarah, 34, loves coffee") add nothing.

Check: the brief names one primary persona with context, frequency and end goal; each screen's primary CTA label is a step toward that end goal.

## 4. Write the job in the user's situation: Jobs to be Done (Christensen; job stories)

People hire a product to make progress in a specific circumstance, and the circumstance, not the demographic, predicts what they choose.

- Use the job story: When <situation>, I want to <motivation>, so I can <outcome>.
- Note the functional, emotional and social sides of the job; the emotional side feeds the anti-goal and the emotional target.
- Name what the user fires to hire us, and the anxieties and habits that pull them back to the old way.
- Do not write the job as a solution ("I want a kanban board"); a real job survives a change of technology.

Check: the H1 or first-screen statement reads as the outcome half of the job story; the measure.json headings outline carries no internal feature jargon in the H1.
Values: job story of 30 words or fewer; one job per surface.

## 5. Walk the scenario before the screens: Scenarios (Cooper)

A narrative of the persona reaching the goal exposes the steps and states that a screen list hides.

- Write the context scenario first: a short day-in-the-life of the persona getting the job done with the ideal product.
- Derive key path scenarios (the most frequent route, step by step) and validation scenarios (first use, error, empty, interrupted, expert).
- Turn every scenario step into a screen or a state on the state board.
- Do not storyboard only the happy path; the edge cases are where trust is won or lost.

Check: the state board has a screenshot for every scenario step, including empty, loading, error, partial and success.

## 6. Give every screen exactly one job: Single-purpose screens (Hayes; Hick)

A screen with one clear purpose is faster to read and harder to misuse than one serving two masters.

- Write one line per screen: "This screen exists so that <persona> can <one action>."
- Allow one primary action per screen or section; everything else is visibly secondary or one level deeper.
- When two jobs fight for a screen, split the screen or sequence the jobs.
- Do not place two primary-styled buttons side by side, and never let a secondary action wear the accent.

Check: measure.json CTA labels show one primary-styled CTA per viewport; in the screenshot the strongest contrast sits on that CTA or on the content it acts on.

## 7. Decide what success looks like before designing: HEART (Google)

Success criteria turn taste debates into checkable claims: choose from Happiness, Engagement, Adoption, Retention and Task success, then work from goal to signal to metric.

- Pick the one or two HEART categories that matter for this design and ignore the rest on purpose.
- Translate each into something visible in the design: "the primary task takes three steps or fewer", "first value appears on the screen after sign-up".
- Pair each quantity goal with a quality guardrail (sign-ups with activation, conversion with refunds).
- Do not optimise a vanity number, such as time on page for a tool whose job is to save time.

Check: the brief lists 3 to 5 success criteria, each with a number a critic can verify on screenshots (step count, CTA presence, screens to first value).
Values: primary task in 3 steps or fewer; first value within one screen of sign-up (studio defaults).

## 8. Name what must never happen: The anti-goal (studio)

One sentence about the worst outcome for this person guards the design better than ten goals, because it tells everyone what to protect when trade-offs bite.

- Phrase it as "Never make <persona> <lose, risk or feel> <specific thing>": "never let a freelancer send an invoice with the wrong total".
- Derive it from the job's emotional side and the highest-stakes moment: money, data, reputation, time.
- Rank it above every feature request; every critique checks it first.
- Do not write an anti-goal any product could claim ("never be confusing").

Check: for each screen and state, a critic can point to the anti-goal in the brief and confirm no state violates it (for "never lose a draft", the error screenshot shows the input preserved).

## 9. Cut until it hurts, then keep a later list: Subtraction and scope (Chimala)

"AI loves to add more, but it rarely takes away", and restraint is what reads as deliberate, so most of the work of focus is removal.

- For every element ask what would be lost if it went; "nothing" or "it would look emptier" means cut it.
- Keep three lists, in, out and later; later protects good ideas without shipping them now.
- Cut sections that exist only because pages like this usually have them.
- Do not let a feature in because it was cheap to generate; scope follows the job, not the effort.

Check: every element in the screenshot can be named by its job in a few words; nothing on screen appears on the out or later lists; each round's critique names what was cut.

## 10. Put the best real estate on the vital few: Pareto principle (Yablonski)

Most use flows through a small share of the features, so rank them and design unequally on purpose (general law: `kb/knowledge/ux-laws.md` #28).

- Rank features by frequency times importance for the primary persona; the top three get the prime positions.
- Move the long tail one level deeper: menus, settings, a command palette.
- Size sections by rank; a grid of equal feature cards says nothing about what matters.
- Do not give every feature a navigation item.

Check: top-level navigation has 7 items or fewer; the most frequent action is one click from the home screen; feature sections differ in size and their order matches the ranking.

## 11. Make the system carry the complexity: Tesler's law (Yablonski)

Some complexity cannot be removed, only moved, and it should land on the product rather than on the person.

- Infer what you can: location, currency, time zone, the last choice, data already given.
- Set defaults that suit the primary persona and are easy to change.
- Translate the system's model into the user's: people manage notifications, not webhook config.
- Do not ask for anything the system could work out.

Check: count form fields per step; any field the system could infer or default is a finding; labels in the screenshots use the user's vocabulary, not internal names.

## 12. Reveal complexity in context, not merely later: Incremental complexity (Fior)

A newcomer's cognitive space is small and should be treated as sacred; the craft is deciding who sees which complexity, when, and how much of it at once.

- Start with one simple use case, sensible defaults and forgiving errors.
- Surface each advanced option beside the thing it modifies, at the moment it becomes relevant.
- Always give experienced users an escape hatch: import, skip, shortcuts, the full view.
- Do not hide everything on screen one and dump it all on screen two.

Check: the first-run screenshot offers few competing choices (count them); advanced options on later screens sit beside what they change; onboarding shows a visible skip or import path.
Values: 3 or fewer competing choices on a first-run screen (studio default).

## 13. Design for the perpetual intermediate: First run versus repeat use (Cooper)

Most people learn the basics fast and rarely become experts, so first-run help must fade and the repeat experience must be fast.

- First run: teach by doing one real action, not with tours or walls of tips.
- Repeat use: density, remembered state, recent items, shortcuts.
- Remove each learning aid once its action has been done.
- Do not ship a product that is still a tutorial on the fiftieth visit.

Check: the state board has first-run and returning versions of the main screen; the returning one carries none of the instructional copy the first one needed.

## 14. Keep the conventions people already know: Jakob's law (Yablonski)

People spend most of their time in other products and bring those expectations along, so the shared machinery should behave as they expect.

- Keep the logo linking home, search and account where they usually live, native form behaviour, and icons with labels.
- Differentiate in content, imagery, voice and one signature move, not in how a checkbox works.
- Allow a novel interaction only when it is clearly better and learnable in one try.
- Do not invent a navigation model to look different.

Check: nav, search, account and form controls sit in conventional places in the screenshots; any unconventional control carries a visible text label.

## 15. Audit the category before departing from it: Competitive conventions (studio)

Knowing what the category already does tells you which conventions are table stakes, which are clichés, and where the open space is.

- Screenshot three to five direct competitors and two adjacent products; write down what all of them do.
- Sort into table stakes (users would miss them), clichés (everyone does them, nobody needs them) and gaps (nobody does it well).
- Keep the table stakes, break one cliché deliberately, and own one gap.
- Do not copy the category leader's layout; that is how a whole category ends up looking the same.

Check: the brief or define.md has a conventions table; the screens show every listed table stake and none of the listed clichés.

## 16. Sort features by how their absence feels: Kano model

Basic features go unnoticed when present and anger people when missing, performance features please in proportion, and attractive features delight until they become expected.

- Ship every basic before any delighter: error, empty, loading, focus, undo, sensible defaults.
- Find the one performance dimension buyers compare on (speed, price, accuracy) and make it visible.
- Expect delighters to decay into basics as the category catches up.
- Do not spend effort on a celebration while a basic is missing.

Check: the state board covers the basics before any expressive moment is critiqued; a missing basic is logged as a blocker, not a polish item.

## 17. Spend novelty where it is rare: Novelty budget (Craft: novelty-budget)

Novelty is a small budget, roughly a tenth of the experience, and the rarer the moment the more of it that moment may spend.

- Frequent actions (hover, tab switch, checking a box) spend nothing.
- Occasional actions get a short, quiet transition; rare milestones get the expressive moment.
- Novel interactions cost more than novel visuals, because every new user pays to learn them.
- Do not replay a once-only intro on every visit.

Check: the main working screen shows no decorative motion or effects; the one expressive moment is attached to a rare event named in the brief or direction.
Values: about 10% of moments may be expressive (Craft, after Rauno Freiberg).

## 18. Treat speed as a design decision: Performance is design (Craft: performance-is-design)

How fast a product feels depends on what it shows while waiting, so perceived speed is designed, not only engineered (mechanics: `kb/knowledge/interaction.md` #25).

- Under about 300ms show nothing and reserve the space; from 300ms to 1s hold the layout and fade content in; past 1s show a skeleton, progress or honest copy.
- Show the result of an action that usually succeeds at once, then roll back with a message if it fails.
- The best loading state is often the one removed by caching, prefetching or rendering early.
- Do not stretch a loading state to make it feel smooth.

Check: loading-state screenshots are shaped like the content they precede, never a lone spinner in a blank area. Check (code): toggles and likes update optimistically.
Values: 300ms and 1s thresholds (Craft).

## 19. Build on structure, not this year's surface: Timelessness (Craft: timelessness)

Structure (hierarchy, spacing, alignment, rhythm) ages slowly while surface effects date fast, so the product's value must live in the structure.

- Ask of every effect: would this still make sense if the trend around it vanished tomorrow?
- Prefer shapes that function earned over shapes copied from a current product.
- Keep materials honest: text looks like text, buttons look pressable.
- Do not adopt a trend as the reason; a trend is only a reason to examine a technique.

Check: in a greyscale view with effects ignored, the hierarchy and the path to the primary action still read.

## 20. Get people to first value fast: Activation (studio)

Activation is the first moment the product delivers the job's outcome, and every step placed before it costs people.

- Name the activation moment ("the first invoice is sent", "the first map renders").
- Remove or defer every step before it that is not strictly needed: profile, preferences, invites, tours.
- Start with real-looking sample data or a template so the first screen is not empty.
- Do not use a multi-step tooltip tour as onboarding; teach inside the first real action.

Check: count screens from the landing CTA to first value on the state board; no blocking tour appears in first-run screenshots.
Values: 3 screens or fewer to first value; about 60 seconds (studio defaults).

## 21. Present price as an answer, not a puzzle: Pricing pages (studio)

A pricing page exists to help a buyer choose one plan with confidence, so it recommends, explains and removes doubt.

- Offer three or four tiers at most; say in one line who each is for; recommend exactly one, chosen for the primary persona.
- Show price, billing period and the three to five deciding differences without hover; put the full comparison table below.
- State annual savings as an amount, and answer the objections (cancel, export, trial terms) beside the CTA.
- Do not hide self-serve prices behind "Contact sales", show invented "was $99" anchors, or preselect a paid add-on.

Check: at 1280px the first viewport shows each plan's price, period and CTA; exactly one plan is visually recommended; each plan's CTA in measure.json says what happens ("Start 14-day trial").

## 22. Make the next step the obvious step: Conversion basics (Hayes; Von Restorff)

People act when the action is visible, specific and safe, so the primary CTA stands alone, says what happens and sits next to the reassurance that unblocks it.

- Use the plain formula: say what it is, what it does, one reassurance, one proof point, one call to action.
- Label the CTA with a verb and an object ("Create your first invoice") and repeat it at the end of a long page.
- Put proof and reassurance next to the claim or button they support ("No card needed" only when true); ask for the rest after value.
- Do not label every button "Get started" or "Learn more".

Check: measure.json CTA labels contain no repeated generic labels; the first and last viewports each contain the primary CTA.

## 23. Never trick anyone into a decision: Deceptive patterns (Brignull)

A conversion won by deception returns as a refund, a churned customer and a damaged reputation, so the studio does not design one (bias framing: `kb/knowledge/ux-laws.md` #32).

- Ban confirmshaming, roach motels, forced continuity, sneaking into the basket, trick questions, disguised ads, nagging and preselected consent.
- Make cancelling as easy as signing up, and give declines a neutral label.
- Show urgency, scarcity, viewer counts and statistics only when they are real and sourced; streaks and guilt badges that turn an open loop into pressure count as deceptive too.
- Do not make the cheaper or privacy-preserving choice visually harder to find.

Check: decline links use neutral copy; consent boxes are unchecked in the screenshots; no countdown, "only 2 left" or "3 people viewing" without a real source; the cancel path has no more steps than sign-up.

## 24. Be opinionated on purpose: Opinionated defaults (Fior)

No software is neutral, and choosing flexibility is itself an opinion, so pick the defaults deliberately for the primary persona.

- Make the product excellent at three or four things before it is adequate at ten.
- Decide the defaults and ship them preselected; let people change them later.
- Choose what can be customised rather than leaving everything open.
- Do not add a setting to dodge a decision the team should make.

Check: first-run screenshots show no "choose your layout" or preference step before first value; defaults appear preselected.

## 25. Play user before calling it done: Playing user (Fior)

The team knows every concept, so someone must set that context aside and walk every touchpoint as a newcomer would; this is the minimum before real research, never a replacement for it.

- Walk the landing page, sign-up, empty state, first action, error, email and second visit in order, as the persona.
- Read every word as someone who does not know the product's vocabulary.
- Treat each hesitation as a finding with a location.
- Do not rely on knowledge only the team has.

Check: from the first screenshot alone, a critic can say what the product does, for whom, and what to do next; if any of the three is missing, it is a finding.

## When these conflict

Within product thinking: the anti-goal beats any success metric; the job beats any feature request; convention beats novelty on frequent paths, and novelty wins only on rare moments and the signature move; a basic beats a delighter; when in doubt, cut rather than add, and move the idea to later. Then defer to the studio ladder:

1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
