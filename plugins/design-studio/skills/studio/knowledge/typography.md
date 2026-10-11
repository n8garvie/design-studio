# Typography

> Used by: typographer (owner), visual designer, content strategist, design engineer. Distilled from: The Elements of Typographic Style (Bringhurst), Craft by Gustavo Fior and its Critly fork, Anthropic's frontend-design skill, NumberFlow (Maxwell Barvian), Refactoring UI, open-design craft rules. Written in our own words; see CREDITS.md.

Read this before choosing a face or a size. Principles generalise, so reason from them when a case is not covered; Values are defaults to beat, not ceilings, and every number must be checked against the actual face, since metrics differ between families. Judge in context and never apply a rule mechanically: type serves the reader first.

## 1. Read the text before choosing type: Honor the content (Bringhurst)

Typography exists to reveal the text (its tone, structure and reader), not to perform over it.

- Read the real copy before choosing faces; note its voice, its longest and shortest strings, its numbers and its languages.
- Give the type as many levels of structure as the content has, and no more.
- Set real content in every specimen, tile and screen, including the awkward cases: long names, compound words, seven-digit numbers, a heading that runs to three lines.
- Don't dress thin content in type effects; if the words are weak, flag it to the content strategist.

Check: screenshots use real copy at real length; every visual level maps to a level in measure.json's headings outline, with no skipped levels.

## 2. Choose faces for the subject and the job: Deliberate selection (Bringhurst; frontend-design)

Choose a face whose history, construction and voice suit the subject and that has the features the job needs, not the family you would use for anything.

- Shortlist from the subject's world (a grotesk from engineering signage, a transitional serif for finance, a humanist sans for care) and test each on the real headline and a real paragraph.
- Verify features before committing: weight range, true italics, small caps, oldstyle and tabular figures, case-sensitive forms, the languages needed, an optical-size axis.
- Prefer families with a text cut for reading and a display cut (or opsz axis) for large sizes.
- Don't default to Inter, Roboto, Poppins or bare system-ui because they are safe; write a one-line reason beside each face. System UI is valid only when native feel is the brief, and then it still gets a stated reason.

Check: the direction names each face with a reason tied to the subject; screenshots show no faux bold or slanted-roman italics. Check (code): the loaded files contain every OpenType feature the spec uses.

## 3. Use one or two families, clearly distinct: Pairing (frontend-design; Bringhurst)

One family across a large scale is often enough; a second must differ clearly in role and texture while agreeing in proportion.

- Add a second family only for a role the first cannot play: a display voice, or a text face for long reading.
- Pair by kinship of construction and contrast of voice: similar x-heights and proportions, different texture (a serif with a grotesk).
- Give each family fixed roles (display, text, data) and never swap them mid-page.
- Don't pair two similar sans-serifs (they read as a mistake), and don't add a monospace to look technical; mono is for code.

Check: each screenshot uses at most two families, plus mono only where code appears, and each family appears only in its declared roles.

## 4. Start from a readable body: Body size first (studio default)

The body size is the unit everything else is built from, so set it for the reader and device before choosing any heading.

- Set reading text at 16–18px; dense product UI can use 14px for controls and tables, not for paragraphs.
- Raise body size for faces with small x-heights and for casual or older readers; shrinking is never the fix for a long line.
- Keep captions and metadata at 12px or more; 11px only for non-essential labels in a face drawn for small sizes.
- Don't set body text in weights under 400 on screen; carry hierarchy with tone instead.

Check: measure.json reports reading paragraphs at 16px or more, nothing essential under 12px, and no body text under weight 400.

## 5. Hold the measure: 45 to 75 characters (Bringhurst)

A comfortable single-column measure runs 45 to 75 characters including spaces, with about 66 as the classic ideal; multi-column text wants about 40 to 50.

- Constrain text by measure, not by layout width: max-inline-size in ch, calibrated to the face.
- Calibrate ch per font: a zero is wider than the average letter, so 65ch in a wide UI sans can hold about 85 characters, while 55ch lands near 70.
- When a measure must run long, add leading; when type gets larger in a narrow column, shorten the measure.
- Don't let paragraphs span a wide hero or a 1440px container; let backgrounds bleed, not text.

Check: measure.json line lengths for body paragraphs fall between 45 and 75 characters; flag anything above 80, or below 35 outside captions and labels.
Values: max-inline-size 55–65ch, tuned per face; multi-column 40–50 characters.

## 6. Set leading for face, size and measure: Line height (Bringhurst; open-design)

Leading depends on x-height, size and line length: longer lines and larger x-heights need more, display sizes need less.

- Start body at 1.5 and adjust: 1.6–1.7 for long measures, large x-heights, serif text or light on dark; 1.4 for short measures and UI.
- Tighten as size grows (headings 1.1–1.25, display 0.95–1.1) and check that stacked descenders and ascenders don't collide.
- Give CJK text more: about 1.3–1.4 at display sizes and 1.7–1.8 for body, because its glyphs fill the em box; never inherit Latin display leading onto a CJK block.
- Use unitless values or rem on a 4px grid so text keeps its rhythm and fallbacks keep the same box.

Check: in screenshots multi-line headings hold together as one block and paragraphs have even air; measure.json line-height to size ratios sit near 1.4–1.7 for body and under 1.25 for Latin display.
Values: body 1.5, UI 20px on 14px, headings 1.2, display 1.0–1.1; viewport-scale display in caps or condensed faces 0.85–1.0, checked for colliding accents (desengs corpus).

## 7. Build a scale with few sizes: Modular scale (Bringhurst; Critly: type-scale)

Sizes related by a ratio give the page a structure the eye can feel, and a few clearly different sizes beat many near-duplicates.

- Choose the ratio from the character: 1.2–1.25 for product UI, 1.333–1.5 for editorial and marketing, a single large jump for display-led pages.
- Use about 5–7 steps named by job (caption, body, subhead, title, display); a button label is body size at a heavier weight, not a new size.
- Round to rem values; adjacent steps must be visibly different (never 15 and 16px). A hand-tuned scale is fine if every step is a visible jump.
- Don't add a size for one component; extend the scale or use weight and tone.

Check: measure.json shows 7 or fewer distinct sizes per page (2–3 per component) and no two sizes under 24px within 2px of each other. On a display-led first screen, measure.json shows at most three sizes above the fold and the largest is at least six times the smallest.
Values: product UI 12 14 16 20 24 (32) px; editorial at 1.333: 16 21 28 38 50 67 px; display-led pages use two registers, display 72–320px clamped to the viewport over captions at 11–14px, with ratios of 8–20 common in the desengs corpus (`kb/knowledge/inspiration.md` principle 4).

## 8. Store sizes as complete sets: Type tokens (Critly: type-scale)

A size isn't finished until it carries its line-height, tracking and weight; storing them together stops headings getting body leading.

- Define each step as a set: family role, size, line-height, letter-spacing, weight.
- Keep sizes and line-heights in rem so a user's font-size preference scales the whole system in proportion.
- Let components pick a step, never set a raw font-size.

Check: the system sheet's specimen shows size, line-height, tracking and weight for every step, and screens use only those combinations. Check (code): no raw font-size in components.
Values: --type-title-size: 1.25rem; --type-title-leading: 1.75rem; --type-title-tracking: -0.01em; --type-title-weight: 600.

## 9. Make hierarchy with restraint: Fewest signals (Bringhurst; open-design)

Adjacent levels should differ by as few attributes as possible; stacking bigger, bolder, colored and capitalized at once cancels itself out.

- Change one or two attributes between adjacent levels; make weights jump, not step through every value from 400 to 800.
- Work with about three weights per family: read (400–450), emphasize (500–550), announce (600); 700 and up rarely earns its place.
- Use italic for emphasis in running text and weight for interface emphasis; underline means link on the web.
- Don't set bold display type in a face that wasn't drawn for it; many display cuts look best at regular or medium.

Check: in the screenshot each heading level differs from the next by one or two attributes; measure.json shows three weights or fewer per family.

## 10. Track by size, in em: Letter spacing (Critly: letter-spacing)

Faces are spaced for text sizes, so large sizes want tighter tracking, small text slightly looser, and body text none.

- Tighten display: about −0.01em from 18–20px and −0.02em from 24px, more for very large sizes only if the face allows it.
- Check for an optical-size axis first; a face that already switches to a tighter display design may need little or no extra tracking.
- Write tracking in em so it scales with size and survives a change of face; set CJK at zero.
- Don't add negative tracking to body text or positive tracking to lowercase headlines.

Check: large headlines in the screenshot read as words, not rows of letters, and small text never touches. Check (code): letter-spacing in em, matching the tracking table.
Values: 11–12px +0.01em · 14–16px 0 · 20px −0.01em · 24–40px −0.02em · 48px+ −0.02 to −0.03em · grotesks at 64px and up as far as −0.05em when the face holds it (desengs corpus) · caps +0.05 to +0.1em.

## 11. Letterspace capitals and small caps: Caps need air (Bringhurst)

Capitals are drawn to sit beside lowercase, so runs of caps and small caps need added space, while lowercase almost never does.

- Track every run of caps or small caps by roughly 5–10% of the size; the smaller the label, the more it needs.
- Use true small caps (smcp, and c2sc for caps-to-small-caps) for acronyms in running text, not scaled-down capitals with thin strokes.
- Turn on case-sensitive forms with caps so hyphens, brackets and colons sit at cap height.
- Don't letterspace lowercase for style; it breaks word shapes.

Check: caps runs in the screenshot look evenly open; acronyms in paragraphs don't shout at full cap height; no faux small caps.
Values: font-variant-caps: all-small-caps; letter-spacing 0.06em; font-feature-settings "case".

## 12. Use caps and eyebrows only when they carry information: Label restraint (frontend-design)

Tracked all-caps labels over every section, and eyebrows that restate their heading, are among the commonest tells of generated pages.

- Set labels in sentence case by default, in a quieter tone or one step smaller, at normal tracking.
- Use caps only for short functional strings where the convention helps (a status, a key name, a dense table header), and track them.
- Keep an eyebrow only when it adds what the heading lacks (a category, a date, a step in a real sequence).

Check: more than one or two all-caps strings per screen outside table headers is a finding; every eyebrow passes the "what would be lost" test.

## 13. Let the whole line carry emphasis: No single accented word (frontend-design; desengs corpus)

Coloring, italicizing or bolding one word of a headline for stress is a default treatment; the replacement is a headline whose scale, weight, measure and breaks are themselves the design. The exception is a second voice with a job: the strongest references set one word apart when it is the name or the brand's own term, or when the contrast holds a consistent role across the page.

- Treat display type as an active element: set it large, break lines by sense, and let the face's character carry the voice.
- If one idea needs stress, rewrite so the stressed words land at the end of a line or alone on one.
- Reserve a second family or italic for a structural role (a pull quote, a standfirst, connecting words, marginal notes, the name or the brand's own term), held the same way everywhere, never for an adjective you want to stress.
- Contrast by style or family (italic, serif, mono), never by color, gradient text, highlighted-word chips or outlined text.

Check: no headline in the screenshot has a single word in a different color, weight or style from the rest of its line, unless the brief asked for it or the word is the name, the brand's own term or a role repeated consistently (see `kb/knowledge/inspiration.md` principle 7); a word set apart by color or gradient fails either way.

## 14. Pick numerals for the context: Figure styles (Bringhurst; Craft: tabular-numbers)

Figures come as oldstyle or lining, each proportional or tabular, and each context wants a specific pair.

- Use oldstyle proportional figures in running text when the face has them, lining figures with caps and in interface chrome.
- Use tabular lining figures wherever numbers change or stack: tables, prices, timers, counters, charts; you rarely need a monospace face for this.
- Use a slashed or dotted zero where 0 and O can be confused (codes, IDs); if tnum changes nothing, the face lacks it and the face must change.

Check: numbers in table columns align by place in the screenshot, and prose figures in a text face sit with the lowercase. Check (code): font-variant-numeric set per context.
Values: prose oldstyle-nums; UI lining-nums; data tabular-nums lining-nums; codes slashed-zero.

## 15. Keep changing numbers steady and meaningful: Numerals in motion (NumberFlow; Craft: tabular-numbers)

A value that updates should never shift its neighbours, and any animation of its digits should say something true about the change.

- Set tabular figures on live numbers so their width holds as digits change.
- Spin digits by meaning (up for an increase, down for a decrease) or per digit when there is no trend; with reduced motion, swap instantly.
- Format with the locale (separators, currency position, compact 1.2K) rather than hand-built strings.
- Set units, currency and suffixes (/mo, %, ms) quieter than the number: smaller, regular weight, muted tone, a hair of space.

Check: in sequential screenshots a changing number holds its box, and units read as subordinate to the value.
Values: tabular-nums; suffix 0.75em, weight 400, muted, margin-inline-start 0.0625em; line-height about 0.85 inside rolling digits.

## 16. Set data for comparison: Tables and figures (studio default)

Data typography exists so numbers can be compared; alignment, consistency and quiet structure matter more than style.

- Right-align numeric columns (decimal-align where precision varies), left-align text columns, and align each header with its data.
- Use one number format per column: the same decimal places, units in the header rather than every cell, a true minus or parentheses for negatives.
- Keep data at body size or one step smaller in regular weight; mark totals with a rule or weight, not color.
- Don't center numbers, mix proportional and tabular figures in a column, or bold every cell.

Check: in table screenshots digits line up by place across rows, header alignment matches its column, and each column uses one format.

## 17. Break lines on purpose: Balance and pretty (Critly: text-wrapping)

Browsers break greedily; short text should be balanced into even lines, and paragraphs should never end on a lone word.

- Set text-wrap: balance on headings, card titles, toasts and empty-state copy (browsers balance only short blocks, around six lines).
- Set text-wrap: pretty on paragraphs and list items, as progressive enhancement.
- Break display lines by sense when the breaks carry meaning, and keep units, initials and short references together with non-breaking spaces.
- Don't hard-code breaks with br in responsive headlines; the break that works at 1440px strands a word at 390px.

Check: no heading in any screenshot ends with a one-word line, and multi-line headings have roughly even lines. Check (code): balance on headings, pretty on paragraphs.

## 18. Shape the text block: Rag, justification and widows (Bringhurst)

Ragged right is the screen default and its edge should ripple gently; justification needs a long measure and disciplined hyphenation, and no paragraph should end or break on a stranded fragment.

- Prefer ragged right; justify only measures of about 60 characters or more, with hyphens: auto and a correct lang attribute.
- Hyphenate with discipline: at least two letters left behind, three carried forward, and no more than two or three hyphenated lines in a row; never hyphenate headings, names or links.
- Fix a sawtooth rag or a runt (a one-word last line) by adjusting measure or wording with the content strategist before forcing breaks; keep a heading with at least two lines of its text across column or card breaks.
- Don't justify narrow or reflowing columns, and don't center paragraphs longer than two or three lines.

Check: screenshots show no rivers in justified text, no runts in key paragraphs, no heading stranded at a column bottom, no centered body paragraphs. Check (code): hyphenate-limit-chars: 6 2 3.

## 19. Use real punctuation: Correct glyphs (Bringhurst)

Typewriter substitutes (straight quotes, double hyphens, three periods, an x for times) mark a page as unfinished; each has a proper glyph.

- Use curly quotes and apostrophes (‘ ’ “ ”), keeping primes (′ ″) for feet, inches, minutes and seconds; an apostrophe before a year points the same way as one inside a word (’90s).
- Use an en dash for ranges (9–5, pp. 12–18), one consistent dash convention for breaks, a true minus (−) for negatives and the multiplication sign (×) for dimensions.
- Use the ellipsis glyph (…), and non-breaking spaces between numbers and units, after short abbreviations and inside dates.
- The content strategist owns the words; the typographer owns the glyphs.

Check: zoom screenshots on quotes, apostrophes, ranges, prices and dimensions; any straight quote, hyphen used as a range or three-dot ellipsis is a finding.

## 20. Align for the eye: Optical edges and icon sizing (Bringhurst; Craft: optical-alignment; Critly: icons)

Mathematical alignment leaves punctuation, round letters and icons looking off; the eye wants the visible edges and visual centers to align.

- Hang opening quotes and bullets into the margin so first letters line up with the text below (hanging-punctuation: first, with a small negative text-indent elsewhere).
- At display sizes, pull headlines left by their side bearing when they sit over left-aligned text; round letters and diagonals need it most.
- Size inline icons at 1.1–1.25em of their text, match stroke weight to text weight, and center by visual mass rather than the box (a 1px nudge is common).
- Don't trust the box; if it looks a pixel off, it is.

Check: a pull quote's first letter aligns with the paragraph edge below, large headlines align optically with body text, and icons read as tall as the adjacent capitals.
Values: text-indent −0.42em for an opening double quote (tune per face); icons 1.15em.

## 21. Use variable fonts and optical sizes: Size-specific design (studio default; Craft: optical-alignment)

Letterforms drawn for 12px look clumsy at 48px and the reverse; optical-size axes and display cuts redraw type for the size it is set at.

- Prefer a variable font with an opsz axis, or separate text and display cuts, and leave font-optical-sizing: auto on.
- Use intermediate weights (450, 550) to tune hierarchy and dark-mode rendering precisely.
- Load one variable file instead of several static weights once you use three or more.
- Don't animate weight or width on hover; it reflows text. Animate color or the underline instead.

Check: where the face has opsz, display lines show finer detail and tighter fit than body text. Check (code): font-optical-sizing is not disabled and one file per family loads.

## 22. Load fonts without hiding or shifting text: Font loading (Critly: font-loading)

Text should appear at once in a fallback sized like the web font, so the swap changes letterforms without moving lines.

- Use font-display: swap with a metric-matched fallback (size-adjust and the ascent, descent and line-gap overrides, generated by a tool), or optional with a preload for non-critical faces.
- Self-host WOFF2, subset by unicode-range, preload only the one or two files the first screen needs (with crossorigin), and budget about two families and 100 KB on first load.
- Don't load fonts through CSS @import, and don't accept invisible text while fonts load.

Check: a cold-load screenshot shows text rather than blank space, and measure.json shows no font-related layout shift where shift is measured. Check (code): preload, font-display and the matched fallback are present.

## 23. Adjust type for dark backgrounds: Light on dark (Critly: font-smoothing, dark-mode)

Light text on dark surfaces renders heavier and blooms on macOS, so dark themes need honest smoothing, softer whites and slightly more air.

- Set grayscale antialiasing on the body (-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale) and recheck that light weights don't turn wispy.
- Use off-white text near OKLCH L 0.93–0.95, never #fff on #000 for reading.
- Add a touch of leading (about +0.05) and tracking (about +0.01em) to small text, and drop weight by a grade where large blocks still look heavy.
- Don't set body text under 400 on dark.

Check: light and dark screenshots of the same screen look the same weight, and body text on dark is off-white.

## 24. Scale fluidly within limits: Responsive type (Critly: responsive)

Display sizes can follow the available space, but between a fixed minimum and maximum and never in a way that breaks zoom.

- Use clamp(min, rem + vw or cqi, max) for display and heading steps; keep body fixed.
- Always keep a rem term in the middle value so browser zoom and user font settings still scale the text.
- Compress the ratio on small screens rather than shrinking every step: display may drop from 64px to 36px while body stays 16px; prefer container units for type inside reusable components.
- Don't size text in vw alone, and don't let display type grow so large that one word fills a line at 390px.

Check: screenshots at 390, 768, 1280 and 1440px show headings in two or three lines without runts and body never under 16px. Check (code): clamp middle terms contain rem.
Values: h1 clamp(2.25rem, 1.5rem + 3vw, 4rem); body 1rem fixed.

## 25. Hunt the typographic tells: Defaults read as generated (frontend-design; open-design)

Generated pages share a typographic signature; builders apply the replacements, critics hunt the patterns (with `kb/knowledge/ai-tells.md`).

- One default sans for everything: a face chosen for the subject (principle 2).
- Huge bold heading over a grey subtitle, repeated every section: vary roles and scale (a long-measure paragraph, a giant numeral, a quiet list).
- Untracked caps, wide tracking on everything, or negative tracking on body: tracking by size and case (principles 10 and 11).
- Monospace for small data labels, meta strings joined with middle dots, arrows appended to every link: meta in the text face at a quieter tone, and arrows only for real forward navigation.
- Centered paragraphs, long measures, runts, straight quotes: left-aligned, measured, pretty-wrapped text with real punctuation.

Check: run each screenshot against this list; any tell present without a brief that asked for it is a finding, with its replacement named.

## 26. Choose UI faces by their metrics: Cap-centered metrics (desengs: Yep! Type, "Inter alternatives")

A UI face is easy to build with when its cap height sits centered in the line box and its x-height is tall, because then one padding value centers every label and icon.

- Test centering at a large size: tighten line-height on a capital H until the box meets the cap height and the baseline at the same moment; if the two edges don't meet together, keep the face for display or print.
- Prefer an x-height of 70–75% of the cap height for interface labels, so a word reads as a block and looks centered when its capital is.
- Trim the line box with `text-box: trim-both cap alphabetic` where supported, with untrimmed fallbacks that still look centered (Firefox lacked support in mid-2026).
- Don't hand-tune asymmetric padding per button size to fake centering; change the face or trim the box.

Check: button and chip labels look vertically centered at every size in the screenshot and align with the icon beside them. Check (code): one vertical padding token per control size, no asymmetric padding nudges.
Values: x-height to cap height 0.70–0.75 (Inter and SF sit near 0.75, per Yep! Type); below about 0.70 labels sit low.

## When these conflict

- Legibility beats voice: a characterful face that fails at body size moves to display only.
- The reader's measure beats the layout's width; the column narrows, not the type.
- Real content beats specimen beauty: type that only works with ideal copy doesn't work.
- The scale beats one-off fixes: extend the scale or use weight and tone instead of a new size.
- When in doubt, choose the quieter setting and let the content lead.

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
