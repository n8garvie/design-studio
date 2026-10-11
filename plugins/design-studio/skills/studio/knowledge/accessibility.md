# Accessibility and legibility

> Used by: all roles; owned by interaction designer and visual designer. Distilled from: W3C WCAG 2.2 and its Understanding documents; W3C, Making Content Usable for People with Cognitive and Learning Disabilities (COGA); Microsoft Inclusive Design toolkit; Critly by Kausthubh, after Craft by Gustavo Fior (focus rings, hit areas, reduced motion, input details, toasts); Norman; Johnson. Written in our own words; see CREDITS.md.

This file is rung 1 of the studio ladder: nothing outranks it, including brand and explicit user taste. WCAG 2.2 AA is the floor, not the goal; studio defaults sit above it, and they are defaults to beat, not ceilings. A failed Check here is a blocking finding however good the rest looks. Judge in context, never mechanically: a page can pass every criterion and still be hard to use. Interaction states live in `kb/knowledge/interaction.md`, motion values in `kb/knowledge/motion-sound.md`, words in `kb/knowledge/content.md`.

## 1. Hold text contrast: Contrast minimum (WCAG 1.4.3)

Text needs 4.5:1 against its background, or 3:1 when large (24px regular, or about 18.7px bold, and up).

- Check every text tone: muted, placeholder, captions, text on accent fills, text on images.
- Define two accent tones when one can't do both jobs: a fill tone whose label passes 4.5:1, and a text tone that passes on the surface.
- Put a scrim or solid backing under text on photos, sized for the worst pixel, not the average.
- Don't ship the generic muted gray: #9ca3af on white is 2.5:1. Use #6b7280 (4.8:1) as the lightest muted text on white, or darker.

Check: measure.json contrast failures list zero text items; spot-check placeholders, button labels and text on imagery in screenshots. Ratios are never rounded up: 4.49:1 fails.
Values: white on blue needs #2563eb or darker (5.2:1; #3b82f6 is 3.7:1); white on orange needs about #c2410c (5.2:1; #ea580c is 3.6:1).

## 2. Make controls and graphics visible: Non-text contrast (WCAG 1.4.11)

Boundaries that identify a control, the cues that show its state, and graphics needed to understand content need 3:1 against adjacent colors.

- Give input borders, checkbox and radio outlines, toggle tracks and slider rails 3:1 against the surface, unless a fill already identifies the control.
- Make checked, selected and on states differ from off by 3:1 or by a non-color cue.
- Give meaningful icons, chart lines and data marks 3:1 against their background.
- Don't draw inputs with the hairline #e5e7eb on white (1.2:1); use a 3:1 border, or a tinted fill with a 3:1 bottom edge.

Check: measure.json contrast failures list no non-text items where measured; in a grayscale view of the screenshot, every input, toggle and checkbox is findable at a glance.
Values: on white, borders #8a8a8a or darker (3.4:1); #949494 is 3.0:1 and fails on off-white. Disabled controls are exempt, but their label must stay legible and carry a visible reason.

## 3. Never carry meaning by color alone: Use of color (WCAG 1.4.1; 1.3.3)

Color can reinforce meaning but never be its only carrier, and instructions can't rely on color, shape, size or position alone.

- Pair every status color with an icon, a word or a shape: an error gets an icon and text, not only a red border.
- Underline links in running text, or give them 3:1 against the surrounding text plus an underline on hover and focus.
- Label chart series directly, or add markers and patterns.
- Don't write "click the green button" or "fields in red are required"; name the control and mark required fields in text.

Check: in a grayscale view of the screenshots, errors, selected states, required fields, links in body text and chart series stay identifiable.

## 4. Hold the legibility floor: Size, weight and measure (Studio)

Passing contrast is not enough if the text is too small, too thin or too wide to read.

- Set body text at 16px or more on the web, and nothing below 12px.
- Set input text at 16px or more, so iOS Safari doesn't zoom on focus.
- Keep body weight at 400 or more below 18px; thin weights at small sizes lose their strokes.
- Don't bake text into images (WCAG 1.4.5); live text scales, translates and reads aloud.

Check: measure.json type sizes show body at 16px or more, nothing under 12px and inputs at 16px or more; line lengths fall within 45 to 75 characters; no text appears inside images except logos.
Values: body 16 to 18px, line-height 1.5; small text 12px minimum; measure 45 to 75ch (studio default).

## 5. Show focus, always: Focus visible (WCAG 2.4.7; 2.4.13 as studio target)

A keyboard user must always be able to see which element has focus.

- Never remove the focus ring; style :focus-visible instead, so mouse clicks don't draw it and keyboard focus always does.
- Draw it with outline, not box-shadow; forced-colors modes drop shadows. If you want a shadow ring, keep a 2px transparent outline beside it.
- Make it at least 2px, offset 2px, with 3:1 against both the control and the page.
- Don't keep the browser's default blue on a palette with no blue, and never `outline: none` without a replacement; use a ring in a focus token.

Check: the system sheet's focus-visible row shows a ring on every component, at least 2px and 3:1 against adjacent colors. Check (code): no `outline: none` or `outline: 0` without a :focus-visible replacement.
Values: `:focus-visible{outline:2px solid var(--focus);outline-offset:2px}`

## 6. Keep focus in view: Focus not obscured (WCAG 2.4.11)

A focused element must not be hidden behind sticky headers, footers, cookie banners or chat launchers.

- Reserve scroll space for sticky bars: scroll-padding-top equal to the header height plus air.
- Keep banners and launchers off focusable content, or put their dismiss control first in the tab order.
- Treat the stricter rule, no part of the focused element hidden, as the studio default.
- Don't let a sticky bottom CTA bar cover the last fields of a form.

Check: screenshots with sticky elements show no control hidden beneath them. Check (code): `scroll-padding-top` (and bottom where needed) matches sticky bar heights.
Values: `html{scroll-padding-top:calc(var(--header-h) + 8px)}`

## 7. Size targets for fingers: Target size (WCAG 2.5.8)

Pointer targets need at least 24×24 CSS px, or enough spacing that a 24px circle centred on each touches no other target.

- Treat 24×24 as the floor for anything clickable and 44×44 as the studio default on touch.
- Extend the hit area past small icons with padding or a pseudo-element; the look stays, the target grows.
- Make adjacent targets meet through internal padding, not gaps, so there are no dead zones.
- Don't lean on the inline or spacing exceptions to justify a small primary action.

Check: measure.json tap targets list nothing under 24×24; touch primaries under 44×44 are findings; a dense toolbar passes only if target centres sit 24px or more apart.
Values: floor 24×24; desktop icon button 32×32; touch 44×44 (studio default; Apple uses 44pt, Material 48dp).

## 8. Reflow at 320 pixels: Reflow and orientation (WCAG 1.4.10; 1.3.4)

At 320 CSS px wide (equal to 1280px at 400% zoom) content must work without sideways scrolling, and layouts must not lock to one orientation.

- Design 320px as a real breakpoint, not a squeezed desktop.
- Let tables, code and maps scroll inside their own container; the page itself never scrolls sideways.
- Wrap or collapse toolbars and navigation instead of clipping them.
- Don't disable zoom (`maximum-scale=1`, `user-scalable=no`), and don't lock orientation unless it's essential.

Check: a 320px-wide screenshot shows no horizontal scrollbar, clipped text or overlapping elements. Check (code): the viewport meta allows zoom.

## 9. Survive bigger text and wider spacing: Resize text and text spacing (WCAG 1.4.4; 1.4.12)

Text must scale to 200% and tolerate user spacing overrides without losing content or function.

- Size type in rem, and let containers grow with their content.
- Avoid fixed heights on anything holding text: buttons, cards, chips, table cells.
- Leave room for overrides: line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em must not clip anything.
- Don't truncate essential text to make a layout fit; wrap it, or truncate only where the full text is reachable.

Check: a screenshot at 200% text or zoom shows no clipped or overlapping text. Check (code): no fixed pixel heights on text containers; font sizes in rem.

## 10. Survive user overrides: Forced colors and color schemes (Studio; Critly)

People run high-contrast modes, dark mode and their own styles, and the design must hold up under each.

- Carry boundaries with real borders or transparent outlines; forced colors strips shadows and background images.
- Make icons inherit text color (`fill: currentColor`) so they repaint in system colors.
- Meet every contrast pair in both color schemes; dark mode is its own palette, not an inversion.
- Don't set long text in pure white on pure black; off-white on near-black glares less (studio default).

Check: the system sheet shows light and dark versions of every token pair, both passing; measure.json contrast failures are clean in both themes. Check (code): in forced colors, control edges and focus rings remain.

## 11. Move only with consent: Motion, flashing and auto-play (WCAG 2.2.2; 2.3.1; 2.3.3 as studio floor)

Motion can cause nausea and distraction, so it must follow the user's setting, never flash, and never run on without a way to stop it.

- Honor prefers-reduced-motion: swap travel (translate, scale, parallax, zoom) for a short fade that keeps the meaning.
- Give anything that moves, scrolls or auto-updates for more than 5 seconds a visible pause or stop control.
- Never flash more than three times in any one second.
- Don't set reduced-motion durations to 0; code waiting on a transition can stall. Use 1ms, or a 150ms fade.

Check: screenshots of carousels, background video and tickers show a visible pause control. Check (code): a prefers-reduced-motion block swaps movement for opacity.
Values: reduced motion = opacity fade around 150ms; no translate, scale or parallax.

## 12. Build real structure: Headings, landmarks and titles (WCAG 1.3.1; 2.4.1; 2.4.2; 2.4.6)

Structure that exists only visually is invisible to assistive technology; headings, landmarks and the page title must be in the markup.

- Give each page one h1 that states its purpose, and a unique, descriptive title.
- Nest headings without skipping levels; style any level at any size, since visual size and heading level are independent.
- Wrap regions in landmarks (header, nav, main, aside, footer) and name each nav when there are several.
- Don't fake headings with bold paragraphs, or pick heading tags for their size.

Check: measure.json headings outline shows one h1, no skipped levels, and reads as a table of contents; the accessibility tree summary lists banner, navigation, main and contentinfo.

## 13. Match visual, reading and focus order: Meaningful sequence (WCAG 1.3.2; 2.4.3)

The order people hear and tab through content must match the order they see it.

- Write the source in reading order and let layout follow it.
- Use grid placement and flex order sparingly, and never so the visual order contradicts the source.
- Place menus and dialogs in the tab order where they appear, and return focus to the trigger on close.
- Don't patch order with positive tabindex values; fix the source.

Check: the accessibility tree summary order matches the screenshot's reading order, top to bottom and start to end. Check (code): no tabindex above 0.

## 14. Label every input visibly: Labels and input purpose (WCAG 3.3.2; 2.5.3; 1.3.5)

Every field needs a persistent visible label whose text is also the start of its accessible name, and personal-data fields declare their purpose.

- Show a visible label above or beside each field; placeholders hold examples, never the label.
- Start the accessible name with the visible label text, so voice users can say what they see.
- Add autocomplete tokens to name, email, address, phone and payment fields, and pick type and inputmode so the right keyboard appears.
- Don't use floating labels that shrink below 12px, or placeholder text that vanishes as people type.

Check: screenshots show a visible label on every field in both empty and filled states; measure.json accessible-name gaps list no form fields, and names contain the visible label.

## 15. Name every control: Name, role and value (WCAG 4.1.2; 2.4.4)

Every control must expose a name, a role and its current state to assistive technology, and every link must say where it goes.

- Use native elements first: button for actions, a with href for navigation, input, select, details, dialog.
- Name icon-only buttons by their action and object: "Close dialog", "Delete invoice 204".
- Expose state: aria-expanded on disclosures, aria-pressed on toggles, aria-current on the current page.
- Don't ship "Learn more", "Click here" or "Read more" as the whole link text; name the destination.

Check: measure.json accessible-name gaps list zero controls; CTA labels contain no bare "Learn more", "Click here" or "Read more"; the accessibility tree shows buttons as buttons and links as links.

## 16. Make every path keyboard-complete: Keyboard, no trap, no surprise (WCAG 2.1.1; 2.1.2; 2.4.1; 3.2.1; 3.2.2)

Everything a pointer can do, a keyboard can do, in a sensible order, without getting stuck or surprised.

- Make a skip link to main content the first focusable element.
- Hold focus inside an open modal on purpose, close it with Escape, and return focus to its trigger.
- Never change context on focus or on a selection alone; a select that navigates on change needs a Go button.
- Don't build controls from divs; if you must, give them a role, tabindex 0 and the full key handling of their pattern.

Check: a screenshot of the first tab stop shows a visible skip link; the accessibility tree lists every interactive element seen in the screenshot. Check (code): custom widgets handle Enter, Space, arrows and Escape.

## 17. Say what went wrong and how to fix it: Error identification and suggestion (WCAG 3.3.1; 3.3.3; 3.3.4)

Errors must be named in text at the field and come with a fix; legal, financial and data-changing submissions must be reversible, reviewable or confirmed.

- Show the error as text plus icon beside the field, linked to it as its description.
- On submit, move focus to the first error, or to a summary that links to each field.
- Keep everything the user typed.
- Don't use "Invalid input" or a red border alone; say what's needed: "Enter a date after 1 March".

Check: the state board's error state shows text and icon at each failing field, values retained, and a linked summary on long forms; the copy names the fix.

## 18. Announce changes without stealing focus: Status messages (WCAG 4.1.3)

Status changes (saved, results updated, item added, region failed) must reach screen readers without moving focus.

- Announce routine status politely (role status) and urgent failures assertively (role alert).
- Render the live region before any message arrives; a region added together with its content stays silent.
- Keep toasts long enough to read, pause them on hover and focus, and never put an error that needs action in a timed toast.
- Don't announce every keystroke; announce the result ("12 results") once input settles.

Check: on the state board, no timed toast is the only place an error appears. Check (code): live regions exist at load.
Values: toast 4s plain, 8s with an action (studio default, after Critly).

## 19. Keep hover and focus content under control: Content on hover or focus (WCAG 1.4.13)

Tooltips, popovers and hover cards must be dismissable, hoverable and persistent.

- Close them with Escape, without moving the pointer or focus.
- Let the pointer travel onto the popup without it vanishing.
- Keep it open until the user moves away, dismisses it, or it stops being relevant.
- Don't put essential information or actions only in a tooltip; touch and keyboard users may never see it.

Check: hover-state screenshots show tooltips that don't cover their trigger or needed content; no essential instruction exists only in a hover state.

## 20. Offer a no-drag path: Dragging and pointer gestures (WCAG 2.5.7; 2.5.1; 2.5.2)

Anything done by dragging, or by a multi-finger or path gesture, must also work with a single tap or click.

- Give sortable lists "Move up" and "Move down" actions or a "Move to" menu.
- Give sliders a number field or stepper, and maps zoom buttons.
- Fire actions on release, not press, so a slip can be cancelled by moving away.
- Don't make swipe the only way to delete, archive or navigate.

Check: screenshots of sortable lists, sliders, maps and carousels show a visible single-pointer alternative (buttons, fields, arrows).

## 21. Keep help and navigation where they were: Consistent help and navigation (WCAG 3.2.6; 3.2.3; 3.2.4)

Help, navigation and repeated components must sit in the same place and order, under the same names, across pages.

- Put contact, chat and help links in the same relative position on every page that has them.
- Keep navigation order identical across pages.
- Give the same function the same name and icon everywhere.
- Don't move help into a different menu during checkout, the moment people need it most.

Check: across sibling screenshots, help and navigation hold the same position and order; measure.json CTA labels name the same function identically.

## 22. Never test memory: Authentication, re-entry and time limits (WCAG 3.3.8; 3.3.7; 2.2.1)

Getting in and getting through must not depend on remembering, transcribing or solving, re-typing what was already given, or racing a clock.

- Allow paste and password managers everywhere; offer passkeys, email links or one-time codes with autocomplete="one-time-code".
- Accept a whole code pasted into the first box, even when it's drawn as separate boxes.
- Fill in, or offer to reuse, anything entered earlier in the same process ("Same as shipping").
- Don't use puzzle or transcription CAPTCHAs; warn before a session times out and give at least 20 seconds to extend with one action.

Check: sign-in screenshots show one password-manager-friendly form, no transcription challenge, and a passkey or link option where relevant; checkout offers "Same as shipping". Check (code): no paste blocking.

## 23. Give every non-text thing a text twin: Alternatives, captions and transcripts (WCAG 1.1.1; 1.2.1; 1.2.2; 1.2.5)

Images, meaningful icons, charts, audio and video need text equivalents that carry the same meaning.

- Write alt text for what the image means in context, not a general description; decorative images get alt="".
- Give charts a text takeaway plus the data as a table or description.
- Caption prerecorded video with speech, provide transcripts for audio, and describe visuals that carry meaning.
- Don't write "image of", file names or keyword lists as alt; don't ship auto-captions unedited.

Check: measure.json images without alt lists zero content images; video screenshots show a captions control; charts carry a visible or linked text summary.

## 24. Declare the language: Language of page and parts (WCAG 3.1.1; 3.1.2)

The page language, and any passage in another language, must be declared so speech, hyphenation and translation work.

- Set lang on the html element to the language of the content.
- Mark quotes, names and phrases in other languages with their own lang.
- Set dir="rtl" for right-to-left content and build with logical properties (margin-inline-start, not margin-left).
- Don't leave a template's lang="en" on a page written in another language.

Check: the accessibility tree summary or page metadata reports a language that matches the visible copy. Check (code): lang on html and on foreign passages.

## 25. Read the accessibility tree: A cheap structural check (Studio)

The accessibility tree is the page as assistive technology receives it, and its summary exposes most structural faults in seconds.

- Read it as a screen reader would: landmarks, then headings, then controls with names, roles and states.
- Expect one main, a nav, named buttons and links, labelled fields, and images that are either named or hidden.
- Compare it with the screenshot: everything visible and meaningful appears, in the same order, and decoration doesn't.
- Don't add ARIA to patch what a native element already does; extra ARIA more often adds errors than removes them.

Check: measure.json accessibility tree summary shows landmarks, a sensible heading outline, zero unnamed controls and zero unnamed content images, in the screenshot's visual order.

## 26. Design for the situation, not only the diagnosis: Inclusive design (Microsoft Inclusive Design)

Disability is a mismatch between a person and a design, and it can be permanent, temporary or situational: one arm, a broken wrist, a baby held in one arm.

- Design for one thumb: on phones, put primary actions within reach at the bottom.
- Leave contrast headroom for sunlight, glare and cheap screens.
- Assume sound off and attention split: captions, visible status, resumable flows.
- Don't assume a fast network, a new device or a quiet room; test the slowest plausible case.

Check: 390px screenshots put the primary action in the lower half; body text contrast in measure.json clears 4.5:1 with room to spare (studio target 7:1 on long-read surfaces).

## 27. Design for cognition: Cognitive accessibility (W3C COGA)

People with cognitive and learning disabilities, and anyone tired, stressed or distracted, need predictable, focused and forgiving interfaces.

- Keep one task per screen, with clear steps and a visible way back.
- Make things work the same way everywhere, with familiar patterns and icons paired with words.
- Support memory: show progress, keep earlier answers visible, never require recall.
- Don't use time pressure, surprise changes or interruptions that steal focus; let people undo.

Check: screenshots show one primary task per screen, step indicators in text on multi-step flows, labelled icons, and no countdowns.

## 28. Write so everyone can read it: Plain language (Studio; W3C COGA)

Plain language lets people find what they need, understand it and act on it the first time they read it.

- Use common words, short sentences and the active voice; put the point first.
- Define unavoidable terms at first use, and spell out abbreviations.
- Write instructions as numbered steps, one action each.
- Don't use idioms, metaphors or jokes in instructions and errors; they fail in translation and under stress.

Check: copy in screenshots averages under about 20 words per sentence, one idea each; errors and help contain no unexplained jargon or abbreviations.
Values: sentences 20 words or fewer on average; paragraphs 4 sentences or fewer (studio default).

## When these conflict

- Brand vs contrast: contrast wins. Keep the brand another way: darken the accent for text, use the bright tone as a fill with dark text on it, or carry identity in shape and type.
- Density vs target size: keep the 24px floor; earn density with tighter type and padding inside targets, not smaller targets.
- Minimal look vs signifiers: keep the signifier (visible label, link underline, 3:1 border) and make it quieter, never absent.
- Motion vs reduced motion: the reduced version keeps the meaning as a fade or color change, never a blank cut.
- One person's need vs another's: choose the option that excludes fewer people, and offer a setting where both are valid.

Then defer to the studio ladder:

1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
