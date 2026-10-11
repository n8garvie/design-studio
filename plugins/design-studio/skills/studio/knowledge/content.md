# Content design and UX writing

> Used by: content strategist (owner), brand & marketing designer (voice), interaction designer. Distilled from: Anthropic's frontend-design skill (writing in design); the Critly fork of Craft by kausthubh-coder (microcopy, real-content, empty-states, destructive-actions, toasts), itself built on Craft by Gustavo Fior; world-class-designer by Eric Lammertsma (copy rewrite rules, invented proof); Mika Reyes (the coffee test); Vmobify (copy tells and mechanics); design-craft by Zach Landes (copy handback); design-director by jose-nogueira1 (the plain formula); open-design state coverage (error anatomy, ideas only); Gustavo Fior, "Incremental Complexity"; GOV.UK and plain-language practice; WCAG. Written in our own words; see CREDITS.md.

Most of what people read in an interface is words, so the words are the design, not a layer added at the end. Principles generalise; Values are defaults to beat, not ceilings. Judge every line against the reader's moment and the stated voice, and never apply a rule mechanically: a legal confirmation and a game's victory screen need different words from the same principles.

## 1. Write the words before the layout: Copy is the design (frontend-design; Vmobify)

Words are design content with a job (helping someone understand and act), so they deserve the same intent and economy as spacing and color, and they come before the boxes that hold them.

- Ask what each screen must say and to whom before drawing it; let the copy decide the layout's proportions.
- Give each written element exactly one job: name, explain, instruct, reassure or prompt an action.
- Write real copy from the first style tile on; a layout tuned around placeholder text breaks on the real words.
- Don't ship lorem ipsum, "Your Company", "Feature One" or "Lorem headline here" in any artifact a critic sees.

Check: no placeholder or lorem strings in any screenshot or in measure.json text; every element's job can be named in a few words.

## 2. Write from the user's side of the screen: Reader's vocabulary (frontend-design; Vmobify)

Name things by what users understand, not by how the system is built, and answer the question the reader has at that exact spot, not the one the team wants answered.

- Say "Notifications", not "Webhook config"; "Your files are safe", not "Data persisted to S3".
- Describe what something is or does in plain terms instead of selling it.
- Address the reader as "you"; let the product say "we" only when people truly act ("We'll email you when it ships"), and never use "my" and "your" for the same area.
- Don't expose internal codes, model names, status enums or error numbers in user-facing copy; log them, and offer a copyable reference only when support needs it.

Check: no system jargon, enum values (PENDING_REVIEW) or raw codes in screenshots; "my" and "your" aren't mixed in labels.

## 3. Cut any word that could describe any product: Specificity (world-class-designer)

A word that fits every product says nothing about this one, so name the object, the number, the time saved, the thing the reader gets.

- Swap abstractions for specifics: "Send invoices in 2 clicks and get paid in 3 days on average" only if the 3 days is real; otherwise "Send an invoice from any timesheet".
- Read each sentence with a competitor's name in place of ours; if it still works, rewrite it.
- Drop filler adjectives (powerful, modern, intuitive, beautiful, smart) and let a concrete noun carry the meaning.
- Don't write tricolons of abstractions ("faster, smarter, better").

Check: swap the product name for a rival's in the H1 and subhead; if both read true, the copy fails.

## 4. Show real proof or none: No invented proof (world-class-designer)

Invented social proof is both a tell and a liability, so use real numbers, real customers and real quotes, or leave the space out.

- Use only figures, logos, quotes and ratings the user has supplied or that are verifiably public.
- Replace a missing proof section with the product itself: a real screenshot, a live demo, a concrete example, a plain guarantee.
- Mark every claim that needs a source in the copy deck so the user can confirm it.
- Don't invent "Trusted by 10,000+ teams", "99.9% uptime", "4.9 stars", stock-photo testimonials, or logos of companies that are not customers.

Check: every number, logo, rating and testimonial in the screens traces to the brief or a user-supplied source listed in direction.md; otherwise it fails.

## 5. Say it the way you'd say it across a table: The coffee test (Mika Reyes; design-craft)

If you would not say a line to a customer over coffee, it does not ship; four lines carry the most weight and get tested out loud: the H1, the primary button, the empty state and the error.

- Read those four lines aloud; rewrite any that sound like an ad, a robot or a lawyer.
- In delivery, hand the user every visible string as `Where | Current | Why it matters | Rewrite (user)`, the four lines first and the Rewrite column left blank, so they write what only they can write.
- Apply the user's rewrites verbatim, then check each against the built screen and report any the layout forced to change.
- Don't treat a model-drafted line as final because it is grammatical; a draft is final once someone who knows the customer has read it aloud.

Check: the copy deck flags the four lines and shows their status (approved, rewritten or open); none reads as ad copy aloud. The handback format is in `kb/roles/_contracts.md` (copy-handback).

## 6. Lead with what it is and what it does: The plain formula (design-director; world-class-designer)

A first screen should say what the thing is, what it does for whom, give one reassurance and one proof point, and offer one call to action.

- Write the H1 as a short, specific claim or plain description; put the real sentence of explanation under it.
- Never let the subtitle restate the headline in other words.
- Make the reassurance concrete ("Cancel anytime from Settings", "No card needed for the trial") and the proof real.
- Don't open with "Welcome to [Product]", "The future of [category]" or a rhetorical question.

Check: measure.json H1 is a statement under about 10 words; the subhead adds information the H1 lacks; one primary CTA per view.
Values: H1 about 3–10 words, under 60 characters; subhead 1–2 sentences, under 25 words (studio default).

## 7. Put the words that matter first: Front-loading (studio default)

Readers scan the left edge and the first words of each line, so put the information-carrying words first in headings, links, buttons, list items and notifications.

- Start with the subject or the outcome: "Payment failed: card expired", not "Unfortunately, there was a problem processing your payment".
- Start list items and links with distinct words so they can be told apart by their first two.
- Put conditions after the instruction only when the instruction is safe without them; otherwise lead with the condition ("To keep your history, export it before you delete").
- Don't open lines with filler ("Please note that", "In order to", "You can").

Check: the first two words of each heading, link, button and notification carry meaning; sibling items don't begin with the same words.

## 8. Write for scanning, not reading: Scannability (studio default; IA)

People scan before they read, so structure text into headed chunks with one idea each, and make the headings say something.

- Write headings as statements or the reader's question ("Pay in 3 installments"), not vague labels ("Flexible options").
- Keep one idea per paragraph and use lists for three or more parallel items.
- Bold a key term sparingly, never whole sentences; use numerals for numbers.
- Don't add labels that repeat what the content already says ("Features" above a feature list) or eyebrows above every heading.

Check: measure.json headings outline reads as a summary of the page on its own; paragraphs in UI surfaces stay within about 3 sentences.
Values: UI paragraphs 1–3 sentences; body measure 45–75 characters.

## 9. Use plain language: Plain language (GOV.UK; studio default)

Plain language lets the reader understand on the first read: common words, short sentences, active voice and one instruction at a time.

- Prefer common words ("use", "start", "help") to formal ones ("utilize", "commence", "facilitate").
- Write in active voice with the actor named: "We sent the code to your phone", not "The code has been sent".
- Keep sentences short and one instruction per sentence; use contractions where the voice allows.
- Don't hedge or soften with "simply", "just", "easily" or "please"; they add words and make people who are stuck feel slow.

Check: no sentence over about 25 words in UI copy; no passive constructions in instructions or errors; none of the hedge words above.
Values: average sentence 15–20 words or fewer; reading level around grade 8 for general audiences (studio default).

## 10. Make every action say what happens: Verb plus object (frontend-design; Critly: microcopy)

A button is a promise, so its label names the action and its object, and still makes sense if it is the only thing someone reads.

- Write verb plus object: "Save changes", "Delete project", "Send invoice", "Download for Mac".
- Make secondary actions say what they do too ("Keep editing", not "Cancel" when cancel would be ambiguous).
- Use the ellipsis character on actions that need more input before they run ("Rename…").
- Don't use "Submit", "OK", "Yes", "Continue" without context, "Click here", or the "Get started" plus "Learn more" pair that could sit on any site.

Check: every measure.json CTA label is a verb phrase naming an outcome; none is in the banned list above; dialogs never offer Yes and No.
Values: buttons 1–3 words, under about 24 characters; verb first.

## 11. Keep one name per action and per thing: Consistent naming (frontend-design; Critly: microcopy)

An action keeps its name through the whole flow and an object keeps its name across the product, because vocabulary is how people learn their way around.

- Echo the verb through the flow: the "Publish" button leads to a "Published" toast and a "Published" status.
- Use the glossary's preferred term everywhere, from navigation to error messages and emails.
- Match the button to the dialog heading: "Delete project?" pairs with "Delete project".
- Don't call it Remove on the button and deleted in the dialog, or a project in one place and a workspace in another.

Check: trace each primary action across screens and states; the verb and object stay identical in button, heading, toast and status.

## 12. Label things with nouns, in sentence case: Labels and capitalization (Critly: microcopy; frontend-design)

Labels name the thing ("Project name"), not ask a question about it, and sentence case everywhere reads like speech and ends the arguments about which words get capitals.

- Write field labels as nouns and keep them visible above the field; placeholders are examples, not labels.
- Use sentence case for headings, buttons, labels, menu items and tabs; capitalize only proper nouns and brand marks.
- Put format hints where people need them before typing ("DD/MM/YYYY", "At least 12 characters").
- Don't use Title Case Buttons, tracked all-caps labels or placeholder-only fields.

Check: no title case or all-caps strings in screenshots outside brand marks; every input has a visible label not just placeholder text.

## 13. Errors say what happened and how to fix it: Error messages (frontend-design; Critly: microcopy; open-design state coverage)

An error answers three things in order: what happened, why if it is knowable, and what the reader can do now, in the interface's voice, without apology or blame.

- Be exact: "Your card was declined. Use another card or contact your bank", not "Something went wrong".
- Put field errors next to the field, telling the fix ("Enter a date in the future"), and keep everything the person typed.
- Offer the recovery as an action: "Try again", "Use another card", "Contact support" with a copyable reference after repeated failure.
- Don't write "Oops", "Sorry", "Please", "Invalid", "Error 402", exclamation marks, or anything that blames the reader for a rule they could not see.

Check: every error in the state board names what happened and the next step, sits beside its cause, and contains none of the words above.
Values: field errors one sentence, under about 80 characters; page errors a heading plus up to 2 sentences and an action.

## 14. Empty screens invite the next action: Empty states (frontend-design; Critly: empty-states)

An empty screen says why it is empty, what goes here, and offers one clear next action, and it speaks differently for first use, no results and cleared work.

- First use: name the thing and its value in one line, then the action that creates the first one ("No invoices yet. Invoices you send appear here with their status." plus "Create invoice").
- No results: echo the query, suggest a fix, and say if a filter hid matches with a button to clear it.
- Cleared: say the work is done and stop; this is the one empty state that has earned a little delight.
- Don't write "No data", "Nothing here", sad-face illustrations, or jokes on first use that stand between the person and the button.

Check: each empty state in the state board has a heading, one line of explanation and one action (none for cleared); the no-results state repeats the query.
Values: heading under about 6 words; body one sentence.

## 15. Say what is happening while people wait: Loading and progress (studio default; Critly: microcopy)

Waiting copy tells people the system is working, on what, and for how long, and it changes as the wait gets longer.

- Use a present-participle status with the ellipsis character: "Saving…", "Uploading 3 of 12 files…".
- Show no text under about 300ms, a skeleton or quiet indicator up to about 2s, a labeled status beyond that, and determinate progress with a cancel action past about 10s.
- After about 15s, add one line that the job is still running and what the person can do meanwhile.
- Don't use cute loading lines that rotate ("Reticulating splines") in serious products, or leave "Loading…" running forever.

Check: loading states in the state board name the object being loaded; long operations show progress and a cancel action.

## 16. Confirm only what cannot be undone, and name it: Destructive actions (Critly: destructive-actions)

If an action can be undone, do it and offer Undo; save the confirmation dialog for what cannot come back, and make that dialog say exactly what will be lost.

- Undo copy leads with what happened: "Deleted 'Q3 plan'" with an "Undo" action.
- Irreversible dialogs name the object and the consequences: "Delete 'Spring catalog'? This permanently deletes 38 pages, 4 forms and the shop.example domain."
- Repeat the verb on the destructive button ("Delete project") and keep the safe button plain ("Cancel"); require typing the name only for rare, catastrophic actions.
- Don't ask "Are you sure?" with Yes and No, or confirm every routine delete until people click through by habit.

Check: confirmation dialogs name the object and what goes with it; the destructive button repeats the heading's verb; routine deletes show Undo instead of a dialog.
Values: undo window about 5s; deleted items kept in Trash for 30 days (Critly default).

## 17. Lead success and notifications with what happened: Confirmations and notifications (Critly: toasts; frontend-design)

A success message or notification says what changed, in the action's own verb, and offers at most one next step; anything visible where the person is looking needs no toast at all.

- Write "March payroll.csv is ready" with "Download", not "Success!".
- Use the past tense of the action's verb: Publish becomes "Published", Invite becomes "Invitation sent to ana@example.com".
- Write notifications so the first words identify the subject ("Ana commented on Q3 plan"), and send them only for things the person would want to know now.
- Don't toast what already shows in place (a filled star, a "Copied" label on the button), and never put an error that needs action in a timed toast.

Check: success copy names the object and uses the action's verb; no generic "Success!" or "Done!"; error toasts don't disappear on a timer.
Values: plain toasts about 4s; toasts with an action about 8s; one action at most.

## 18. Teach by doing, one idea per step: Onboarding (Fior; studio default)

Onboarding should get people to their first real result quickly, explaining only what the next step needs, with a visible way to skip.

- Ask only for what the first result needs; defer everything else to the moment it matters.
- Write each step as one instruction tied to the person's own work ("Add your first client"), not a feature tour.
- Show progress in plain numbers ("Step 2 of 3") and always offer "Skip for now".
- Don't open with a carousel of benefits or a welcome paragraph standing between the person and the product.

Check: each onboarding screen has one instruction, one primary action and a skip; step counts are stated.

## 19. Help text supplements; it never carries the essentials: Tooltips and helper text (world-class-designer; studio default)

Anything a person needs to complete the task belongs on the screen in plain view; tooltips and helper text only add detail for those who want it.

- Put requirements and formats before input, in helper text under the label.
- Use tooltips to name icon-only controls and to define a term once, in one short sentence.
- Make tooltip content reachable by keyboard focus, and never the only place a fact lives on touch devices.
- Don't add tooltips to self-evident controls, or captions that describe what the image already shows.

Check: no essential instruction appears only in a tooltip; tooltip text is one sentence; helper text sits under its label before the field.

## 20. Hold the voice, flex the tone: Voice and tone system (studio default)

Voice is the product's constant personality; tone is how that voice adjusts to the reader's moment, warmer in onboarding, plainer in errors, gravest at loss.

- Define 3–4 voice attributes as pairs of "this, not that" (direct, not curt; warm, not cute), each with a real line in the voice and one that misses.
- Map tone by moment: first run, success, empty, error, destructive, billing, outage. Turn warmth and wit down as stakes go up.
- Write mechanics into the voice: person (you, rarely we), contractions, punctuation (periods, no exclamation marks), numerals, case.
- Don't let brand voice override clarity in errors, payments, security or deletion.

Check: sample lines from five different states read as one writer; errors and destructive copy carry no jokes, puns or exclamation marks.

## 21. Hunt the copy tells: Generated-copy patterns (Vmobify; world-class-designer; design-director; Mika Reyes)

Readers now recognize machine-flavored copy on sight, so remove its fingerprints and replace each with the specific, plain version.

- Replace the register words (seamless, effortless, unlock, elevate, supercharge, empower, revolutionize, next-generation, all-in-one, delve) with what the product does, in the reader's words.
- Replace constructions: "It's not X, it's Y", tricolons, "Whether you're a X or a Y", punchy negation lists ("No X. No Y. No Z."), throat-clearing openers, rhetorical-question headings, em-dash flourishes.
- Vary sentence length on purpose; perfectly even rhythm is itself a tell.
- Don't leave lists at three items because three sounds right; use as many as are real.

Check: no register word or construction above in any screenshot; exclamation marks and em dashes absent from UI copy; list lengths vary with content.

## 22. Format numbers, dates and units for the reader: Numbers and formatting (Critly: microcopy; studio default)

Numbers are content, so format them by locale, pluralize them properly, and give zero its own sentence.

- Use numerals in UI copy, locale-aware thousands separators, and real plural rules: never "1 files"; zero reads "No files selected".
- Show relative times for recent events ("5 min ago") and absolute dates for anything older than about a week, with the year only when it isn't the current one; add a time zone when people span zones.
- Put a non-breaking space between number and unit ("12 GB", "5 min"), none before % in English, an en dash for ranges ("Mon–Fri") and × for dimensions.
- Don't abbreviate to "1.2K" where the exact value matters, and name the currency code when a symbol is ambiguous ("$40 USD" for a mixed audience).

Check: no "1 items" or "0 results" phrasing; numbers in a column share format and precision; units separated consistently. Check (code): Intl.NumberFormat, PluralRules, DateTimeFormat and RelativeTimeFormat, never string concatenation.

## 23. Write so nobody is left out: Inclusive language (studio default)

Words should include every reader the product serves, describe people by what is relevant, and avoid metaphors that exclude or wound.

- Use "they" for unknown people and gender-neutral terms ("everyone", not "guys"; "staffing", not "manpower").
- Use "allowlist" and "blocklist", "primary" and "replica"; avoid ableist idioms ("sanity check" becomes "quick check", "crippled" becomes "limited").
- Ask for "Full name" rather than first and last when names need not be split, and ask for gender only when required, with a self-describe option.
- Don't write "simply", "easy" or "obviously" about tasks that may not be easy for this reader.

Check: no gendered defaults, ableist idioms or loaded technical terms in visible copy; forms don't force binary or Western name structures without need.

## 24. Build strings that survive translation and real data: Localization readiness (Critly: microcopy, real-content)

Every string will meet longer languages, other word orders and awkward real data, so write whole sentences with placeholders and leave room to grow.

- Keep each sentence in one string with named placeholders ("Delete {projectName}?"); never glue fragments ("Delete " + noun), since word order changes between languages.
- Leave room for growth and give every text box a plan (truncate, clamp or wrap); test with a 40-character name and a missing one.
- Keep text out of images, avoid idioms, puns and culture-bound references in functional copy, and give translators the purpose of each string.
- Don't hard-code date order, plural rules or left-to-right assumptions in copy.

Check: the state board shows long-string and missing-value variants without overflow. Check (code): no string concatenation for sentences; strings live in one keyed table.
Values: allow about 30% growth for strings over 70 characters and 2–3x for labels under 10 characters (W3C figures via Critly).

## 25. Make copy work without sight: Accessible text (WCAG; studio default)

Copy has to work when heard through a screen reader or read out of context, so link text, accessible names and alt text all need real words.

- Make link text meaningful on its own ("Download the 2025 report"), not "Read more" repeated five times.
- Start every control's accessible name with its visible label so voice users can say what they see.
- Write alt text for what an image communicates in context; leave decorative images with empty alt.
- Don't rely on "see the red items" or "click the icon on the right"; name things, not their color or position.

Check: measure.json headings outline and link labels make sense read alone; icon-only controls have accessible names. Check (code): accessible names contain the visible label text.

## 26. Ship a copy deck, one line per string: The copy deck (studio default)

Every user-visible string lives in one deck: one line per string with its location, state, purpose, final words and maximum length, so writers, designers and the design engineer work from the same source.

- Give each line a stable key, the exact location and state, the job the string does, the final string and its max length in characters.
- Include every state: default, hover tooltip, focus name, disabled reason, loading, error, empty, success, plus emails and notifications.
- Flag lines that carry proof claims or that pass through the coffee test, and record their approval status.
- Mark a string only the user can supply (a real figure, a customer quote) as `TODO(user)`; never leave TBD, lorem or "copy coming" in the deck that goes to build.

Check: every visible string in the screens appears in the deck within its max length; no line is blank, lorem or TBD, and `TODO(user)` appears only on proof the user must supply.
Values: `key | location | state | purpose | string | max chars | flag`, for example `invoices.empty.action | Invoices, first use | empty | start the first invoice | Create invoice | 20 | coffee`.

## When these conflict

Clarity beats brevity, and brevity beats cleverness. True and specific beats persuasive. One consistent term beats an elegant variation. The reader's next action beats the brand's voice, and in errors, payments, security and deletion, plain wins over personality every time. When the user rewrites a line, their words win over ours. Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
