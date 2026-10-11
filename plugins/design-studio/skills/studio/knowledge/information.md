# Information design and architecture

> Used by: content strategist (IA owner), visual designer (data display), interaction designer, product strategist. Distilled from: Edward Tufte (The Visual Display of Quantitative Information, Envisioning Information, Beautiful Evidence); Rosenfeld, Morville and Arango (Information Architecture, 4th ed.); Pirolli and Card (information foraging); Cleveland and McGill (graphical perception); Kevin Lynch (The Image of the City); Craft by Gustavo Fior (living-charts, curve-smoothing, tabular-numbers) and his essay "Incremental Complexity"; the Critly fork of Craft by kausthubh-coder (density, real-content). Written in our own words; see CREDITS.md.

Principles 1–10 cover structure: how content is modeled, organized, labeled, navigated and searched. Principles 11–23 cover data display, and 24–27 cover dashboards and tables. Principles generalise; Values are defaults to beat, not ceilings. Judge in the context of the stated direction and never apply a rule mechanically: a dense trading screen and a calm onboarding flow obey the same laws at different settings.

## 1. Map the territory before drawing pages: Context, content, users (IA)

An information architecture lives where business context, the real content and the users' tasks overlap, and it has to serve four ways of looking: known-item lookup, exploration, exhaustive research and re-finding.

- Write down the goal, the content inventory (what exists, what will exist, volume, rate of change) and the top three audiences with their primary task before any layout. Size it honestly: the structure must survive the 10x case.
- Give lookup search and an exact scheme, exploration browsable groups with previews, research complete lists with totals ("All 214 reports"), re-finding recents and stable URLs.
- Give every top task a short path where each step has one obviously right label; certainty per click matters more than click count.
- Don't ship the canonical SaaS sitemap (Product, Solutions, Pricing, Resources, Company) because everyone has it; derive the top level from the inventory and the tasks.

Check: direction.md lists content types with real counts and the top tasks; each top task is reachable through visible labels in 3 steps or fewer with no step where two labels could plausibly be right; list views state their total.

## 2. Organize with one scheme per level and a balanced tree: Organization schemes and structures (IA)

Exact schemes (alphabetical, chronological, geographic) serve lookup, ambiguous schemes (topic, task, audience, metaphor) serve browsing, and a hierarchy works when its buckets are exclusive and its depth is shallow.

- Use chronological for activity and logs, alphabetical for long lists of known names, task schemes ("Send money", "Pay a bill") for apps people arrive at with a job; use audience schemes only when audiences need truly different content and can tell which one they are.
- Keep each navigation level to one scheme; a list mixing two topics, an audience and a task hides its logic and makes every item harder to predict.
- Prefer broad and shallow to narrow and deep: scanning a longer visible list beats guessing through extra levels. Miller's seven concerns memory, not a menu you can see.
- Add a database model (items tagged by attributes) once content outgrows a tree; allow an item in two places only where users genuinely disagree on its home.
- Don't create catch-all buckets (More, Other, Misc, a Resources menu of unrelated things); they mean the scheme failed.

Check: each nav level's labels answer the same kind of question; no catch-all label; depth from home to any content is 3 levels or fewer.
Values: 5–9 top-level items as a studio default; long lists grouped into labeled sets of about 4–8.

## 3. Model the content before the pages: Content model (IA)

A content model names each content type, its attributes and its relationships, so templates, filters, search and navigation follow from the data instead of from one showcase mockup.

- List types (Project, Invoice, Person) with their attributes, which are required, and realistic length ranges.
- Turn relationships into navigation: if an invoice belongs to a client, the client lists its invoices and the invoice links back.
- Give each type one template with a fixed attribute order and a planned fallback for every optional attribute; feed every label, unit and empty value into the copy deck.
- Don't design the hero screen and improvise the other 40 from it.

Check: repeated objects show the same attributes in the same order; a missing attribute shows a planned fallback ("No due date", initials, a dash glyph in a table), never a blank gap, "null" or "undefined".

## 4. Label in the user's words, as a system: Labeling systems and scent (IA; Pirolli and Card)

A label is a promise about what lies behind it, so draw labels from the users' vocabulary, keep siblings parallel, and make the destination keep the promise.

- Source labels from support tickets, search logs, interview words and card sorts, not from team names, database tables or codenames.
- Make siblings parallel in syntax (all nouns or all verb phrases), granularity (Billing, Team, Notifications are peers; "Change your card" is not) and length.
- Repeat the clicked words as the destination's H1 or its key noun; write link text that names the destination ("March invoices"), never a bare "Learn more" or "Click here".
- Don't use clever or branded nav labels ("The Lab", "Launchpad") that need explaining; cleverness spends the scent people follow. Keep icon-only labels to the universal handful (search, close, menu, settings), each with an accessible name.

Check: measure.json CTA and nav labels form parallel sets; each nav label's key noun appears in the destination H1 (headings outline); no bare "Learn more" or "Click here".
Values: primary nav labels 1–2 words, about 16 characters at most (studio default).

## 5. Give every concept one word: Controlled vocabulary (IA)

A controlled vocabulary picks one preferred term per concept and maps its synonyms to it, so the interface speaks with one word while search still understands all of them.

- Keep a glossary: preferred term, the variants that map to it (a synonym ring), and terms banned from the UI.
- Use the preferred term everywhere: navigation, headings, buttons, errors, notifications, emails, docs.
- Feed the variants to search so "bill", "receipt" and "invoice" all find Invoices while the UI only says Invoice.
- Don't let one object be a project in the sidebar, a workspace in settings and a space in the email; two names make people believe in two things.

Check: read every visible string; more than one term for the same object fails. direction.md carries the glossary with preferred and banned terms.

## 6. Give each navigation layer one job: Navigation systems (IA)

Global navigation moves between areas, local navigation moves within one, contextual links move sideways to related things, and supplemental routes (index, sitemap, command menu) serve experts and the lost.

- Keep global navigation identical in content and position on every screen; make local navigation visibly subordinate and scoped to its area.
- Place contextual links inline beside the content they relate to, not in a generic "Related" dump.
- Add a command menu or index once a product has more than a few dozen destinations.
- Don't repeat one destination in global, local and footer under three different labels.

Check: global nav has the same items in the same place across screenshots; local nav is quieter than global; each destination carries one label everywhere.

## 7. Always answer "where am I?": Wayfinding (IA; Lynch)

People need to know where they are, what is here, where they can go and how to get back, without holding any of it in memory.

- Mark the current location with more than color: weight, an indicator bar, and aria-current.
- Use breadcrumbs that follow the hierarchy, not the click history, once structures reach 3 levels; always offer an explicit way up.
- Give each screen a unique H1 and each area a recognizable treatment and stable landmarks, the way a city has districts and landmarks.
- Don't move persistent elements between screens; moving landmarks erase the map.

Check: in every screenshot the current nav item has a non-color cue; H1s are unique per screen in measure.json; screens 3 levels deep show a breadcrumb or up link.

## 8. Design search and filtering as one system: Search systems and facets (IA; Ranganathan)

Search is a box, query handling, results, refinement and recovery, and faceted filters let people narrow by independent attributes instead of forcing one tree.

- Put search where people expect it, wide enough for a typical query; tolerate typos, plurals and synonyms; show recent searches on focus and pin best bets for common queries.
- Show results with what helps choosing: title, type, a snippet with the match highlighted, date or owner, and the total count.
- Derive facets from attributes people choose by (status, owner, date, price), show counts per value, show active filters as removable chips beside the count, and order facets by use.
- Write the no-results state to recover: echo the query, offer a correction, name the filter that hid matches and offer to remove it.
- Don't add search to a 12-page site, and don't make people pick a category before they can filter.

Check: results show the query and a count; facet values carry counts and active filters are removable; the no-results state repeats the query and offers a next step.
Values: search input at least 27ch wide (studio default).

## 9. Reveal complexity where it is needed: Incremental complexity (Fior)

Show the simple path first and surface advanced options in the context where they matter, with an escape hatch for experts.

- Start new users on one common use case with sensible defaults already chosen.
- Reveal advanced settings beside the thing they modify, at the moment they matter, not on a distant "Advanced" page.
- Give experts a direct route: shortcuts, a command menu, import, templates.
- Don't hide everything on screen 1 and dump it on screen 2; complexity should be contextual, not merely postponed.

Check: the first-run screen shows one primary path and about 3 secondary options at most; advanced controls sit next to the content they affect.

## 10. Plan for the data you will actually get: Real data (Critly: real-content)

Every list, chart and table must survive zero, one and thousands of items, missing values, outliers and long labels.

- Keep a worst-case set per content type: a name over 40 characters, a missing name, 0, 1 and 1,000+ items, no image, another language.
- Give every text container one plan: truncate (single line, readable in full elsewhere), clamp (previews, 2–3 lines) or wrap (anything read in full).
- Draw missing values as gaps, not zeros; mark the partial current period ("This week so far") with a label or dashed segment; clip outliers with a note rather than let one spike flatten the rest.
- Don't judge any screen from the happy-path mock alone.

Check: the state board shows each list and chart at 0, 1 and many, with a long label and a missing value; nothing overflows or reads "undefined"; missing data is never drawn as zero.

## 11. Show the data, and erase ink that does not: Data-ink ratio (Tufte)

Most of the ink in a graphic should present data, so erase non-data ink and redundant data ink until removing more would hurt reading.

- Make data marks the strongest element; axes, ticks, grids and labels recede.
- Remove chart borders, filled plot backgrounds and heavy gridlines; lighten what remains or run white lines through bars instead.
- Label values directly or keep an axis, rarely both; where the direction suits it, use range frames whose axis spans only the data.
- Title the chart with the finding or a precise question ("Signups up 12% after the pricing change"), not a category ("Analytics").
- Don't confuse erasing with minimalism as a style: stop when the next deletion costs comprehension.

Check: no chart combines a border box, a filled background and dark gridlines; gridlines are visibly lighter than data marks; titles state a finding or question.
Values: gridlines 1px at roughly 10–15% contrast; axis text at caption size in the muted color; no frame around the plot.

## 12. Answer "compared to what?": Show comparisons (Tufte)

A number without a reference is unreadable, so every key figure carries its comparison: last period, target, peer or normal range.

- Pair each headline number with a signed delta and the baseline it is measured against.
- Put compared things side by side, on the same scale, within one eye span.
- Don't show a percentage change without its base; "+300%" on 3 signups is noise dressed as news.

Check: every headline number has a visible comparison (delta, target, sparkline or range) and a unit; compared series share an axis.
Values: deltas written like `+12.4% vs March`, signed, one decimal, baseline named.

## 13. Cut chartjunk: Chartjunk (Tufte)

Chartjunk is decoration competing with data: 3D, perspective, moiré hatching, heavy grids, gradients, glows, and charts shaped like objects.

- Never use 3D bars, 3D pies or perspective; depth distorts every comparison.
- Replace the generic AI area chart (brand-gradient fill, glowing stroke, floating tooltip card) with one 1.5–2px stroke and a flat fill of about 10–15% or none.
- Replace hatching with flat value steps; keep patterns subtle and only as redundancy for color-blind readers.
- Don't play bars-grow-from-zero load animations; animate only real data changes (principle 23).

Check: no 3D, drop shadows, gradients, glows or decorative icons inside a plot area.

## 14. Keep the lie factor near 1: Graphical integrity (Tufte)

The visual size of an effect must match its size in the data; the lie factor (effect shown divided by effect in the data) belongs between 0.95 and 1.05.

- Start bars and areas at zero; a truncated bar axis multiplies differences. Line charts may use a non-zero baseline when variation is the story, with the axis clearly labeled.
- Encode a one-dimensional quantity with one dimension; scaled icons and circles grow by area and overstate.
- Keep axis intervals even, mark any break, and show enough history to judge whether a change is unusual.
- Adjust long money series for inflation and normalize by population or base when groups differ in size.

Check: bar and area value axes start at 0; no pictogram or bubble encodes a single value by width; ticks are evenly spaced or breaks are marked.

## 15. Choose the encoding by the comparison: Graphical perception (Cleveland and McGill; Tufte)

People judge position on a common scale most accurately, then length, then angle and slope, then area, then color intensity, so put the key comparison on the most accurate channel.

- Compare magnitudes with sorted bars or dots on one axis; show change over time with lines; show part-to-whole with a stacked bar or a table.
- Use a table for small data sets: around 20 numbers or fewer, a table usually beats a chart (Tufte).
- Don't use pies beyond 2–3 slices, donuts as KPI decoration, or radar charts for anything people must compare precisely.

Check: chart type matches the stated question (trend: line; rank or magnitude: sorted bars; part-to-whole: stacked bar or table; distribution: histogram or dot plot); no pie has more than 3 slices.

## 16. Put the words on the data: Annotation and direct labels (Tufte)

Words, numbers and marks belong together, so label series where they end, annotate events where they happen, and explain the graphic on the graphic.

- Replace legends with direct labels at line ends or beside bars, set in or next to the series color.
- Annotate the outlier, the change point, the launch, the target line, with a few words in place.
- State units and period in the title or axis ("Weekly active users, thousands"); set every label horizontally.
- Don't make the eye shuttle between a legend and the plot to decode color.

Check: multi-series charts carry direct labels or a legend inside the plot's eye span; no rotated text; charts whose story depends on an event show it annotated.

## 17. Repeat one frame many times: Small multiples (Tufte)

A grid of small charts with identical design and scale, changing only the data, lets the eye compare many slices at once.

- Use small multiples instead of a spaghetti chart of 6 or more series, or a dropdown that hides every slice but one.
- Share axes and scales across panels and label the axis once per row or column.
- Order panels by something meaningful (size, region, time); highlight the panel of interest and grey the rest.
- Don't vary chart type, scale or dimensions between panels.

Check: panels share identical tick values and sizes; no single line chart shows more than about 5 colored series.

## 18. Reward the glance and the study: Micro and macro readings (Tufte)

A good display shows the overall pattern at arm's length and rich detail up close; to clarify, add detail rather than remove it.

- Design the macro shape first (trend, clusters, gaps), then layer micro detail that does not disturb it; experts want finer resolution, not chunkier summaries.
- Make exact values reachable through labels, hover, focus or a table view.
- Don't flatten a distribution into three big numbers for professionals who need the spread.

Check: at full screenshot size the overall pattern reads without the labels; exact values are reachable in place or through a visible table toggle.

## 19. Separate layers by visual weight: Layering and separation (Tufte; Albers)

Give data, reference and scaffolding distinct visual weights so they read as separate planes; clutter comes from layers at equal volume.

- Set data at full strength, reference lines (target, average) at middle weight, grids and axes faintest.
- Separate with value and hue, not with boxes and borders.
- Watch for one plus one equals three: two heavy adjacent lines create a third shape between them, so thin or drop one.
- Don't give everything the same mid-grey; three contrast tiers is the minimum.

Check: a chart shows three distinguishable contrast tiers; no doubled rules or borders sit side by side.

## 20. Spend bright color in small doses: Color as information (Tufte; Imhof)

Strong, saturated color works in small areas against muted fields; large areas of bright color fight each other and the data.

- Draw default series in a neutral and give the accent to the one series that matters.
- Use sequential palettes for ordered data, diverging palettes around a meaningful midpoint, distinct hues only for unordered categories, about six at most.
- Never rely on color alone: pair it with labels, position, a sign or an icon, and test for color-vision deficiency.
- Don't use the whole brand palette because it exists, or red against green as the only bad-good signal.

Check: at most about 6 categorical hues; the highlighted series is the only saturated one; status always has a non-color cue.
Values: data marks at least 3:1 against the background (WCAG non-text contrast).

## 21. Make graphics word-sized: Sparklines (Tufte)

A sparkline is a small, intense, simple line set inside text or a table cell, showing the shape of a series exactly where its number is read.

- Size it to the text: about one line high and 4–8em wide.
- Drop axes and grids; mark the last value with a small dot and print that value beside the line.
- Share one scale down a column when values are comparable; say so when they are independent.
- Don't stamp a sparkline on every KPI card as decoration; it has to show history the reader uses.

Check: sparklines sit inline at text height with no axes, an end-point marker and a numeric value beside them.
Values: height 1–1.25em; width 4–8em; stroke 1–1.5px; end dot 2–3px.

## 22. Smooth without inventing data: Monotone curves (Craft: curve-smoothing)

Smoothing is a claim about the values between points, so use a curve that never swings above or below the points it joins.

- Use monotone cubic interpolation for any line where readers infer in-between values (dashboards, sparklines, tooltips); use straight segments for sparse data.
- Never let a bounded series (percentages, counts, uptime) dip below its floor or above its ceiling because of the curve.
- Keep Catmull-Rom and similar curves for decorative lines that carry no values; keep data dots visible while designing to catch overshoot.

Check: smoothed lines stay within the plotted minimum and maximum and never cross 0 or 100 on bounded data. Check (code): data lines use monotone or linear curves (d3 curveMonotoneX).

## 23. Animate the change, not the chart: Living charts (Craft: living-charts)

Live data should tween from the old value to the new so readers see a change rather than a jump, and each tween should finish before the next update lands.

- Ease each update over about 900ms with an ease-out curve, always shorter than the update interval.
- Count numbers toward their new value with tabular figures so digits don't shift sideways.
- Fix the y-axis range while data streams, and slide rows to their new rank in live ranked lists so the eye can follow who overtook whom.
- Honor reduced motion by rendering the target value directly.

Check: across a sequence of screenshots, numbers keep their width and the axis range is constant. Check (code): tween duration is below the update interval; reduced motion skips the tween.
Values: 900ms, `cubic-bezier(0.33, 1, 0.68, 1)`; `font-variant-numeric: tabular-nums`.

## 24. Build dashboards around questions: Dashboard density (studio default; Tufte; Critly: density)

A dashboard is one screen that answers what someone checks again and again; its density should rise with how often and how long it is used.

- Write the top three questions it answers and order the screen by them; lead with a short row of headline numbers with comparisons, then the charts that explain them, then the detail table.
- Use compact density for all-day tools and comfortable density for occasional ones, stepping type, padding, gaps and icons down together, never padding alone.
- Size widgets by importance and title each with what it shows and its period.
- Don't build the generic AI dashboard: four identical KPI cards with icons in tinted circles, a gradient area chart, a donut and "Recent activity". Build the product's own questions instead.

Check: about 5 headline numbers at most, each with a comparison; widget sizes vary with importance; every widget states its period; compact rows keep targets of at least 24px.
Values: rows 32px compact, 40px regular, 48px comfortable; text 13px compact, 14px regular; coarse pointers get comfortable.

## 25. Align columns by data type, in tabular figures: Table alignment and tabular numerals (Tufte; Craft: tabular-numbers)

Alignment makes a table scannable down its columns: text left, numbers right on a shared decimal in equal-width digits, headers aligned like their data.

- Left-align text, right-align numbers, and align each header the same way as its column; center only short fixed-width values such as status icons.
- Use the same number of decimals within a column; put units in the header ("Amount, USD") unless cells mix units.
- Set tables, counters, prices and live metrics in tabular figures and running text in proportional ones; don't switch the table to a monospace face, which changes the voice. Confirm the font has the tnum feature.
- Don't center columns by default; a centered column has two ragged edges.

Check: numeric columns and their headers are right-aligned; decimals and same-place digits line up vertically (a 1 takes the slot of an 8); live numbers keep their width between screenshots.
Values: `font-variant-numeric: tabular-nums lining-nums`.

## 26. Make rows easy to follow: Table scannability (Tufte; studio default)

People scan down a column, then across a row, so support both with the least ink that works.

- Separate rows with faint hairlines or spacing; drop vertical rules and full cell grids. Use faint zebra stripes only on wide tables where the eye can lose its row.
- Put the identifying attribute first, keep it visible on horizontal scroll, and give it a truncation plan.
- Keep the header visible on long tables, distinguished by weight or color, in sentence case rather than tracked capitals.
- Don't truncate the column people decide with; truncate secondary text and keep the full value reachable.

Check: no table draws both vertical and horizontal cell borders; headers are not all caps; long tables keep the header visible in scrolled screenshots.
Values: 1px row rules at a faint tint; 8–12px horizontal cell padding.

## 27. Sort by the task and show the sort: Sorting (studio default; IA)

Default order is a design decision, so sort by what the reader most often needs and make the current sort visible and changeable.

- Default to the task's order: newest first for activity, largest first for ranking, soonest first for due work; alphabetical only when people look items up by name.
- Show the sort indicator on the active column only and make the whole header cell the target.
- Sort numbers numerically and dates chronologically, never as strings; break ties stably.
- Preserve sort, filters and scroll position when people come back.

Check: the active sort column shows its direction; the default order matches the stated primary task. Check (code): `aria-sort` sits on the active header.

## When these conflict

Integrity beats beauty: never trade a truthful scale or baseline for a prettier chart. The reader's vocabulary beats the organization's. Findability beats cleverness in labels. Density follows frequency of use, not taste. When a reader needs exact values, a table beats a chart; when they need the shape, the chart wins. Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
