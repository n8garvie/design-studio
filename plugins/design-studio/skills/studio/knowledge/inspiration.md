# Inspiration and taste

> Used by: visual designer, brand designer, art director, typographer, critic; the design engineer when a direction cites a reference. Distilled from: the desengs.com inspiration galleries curated by Maze Heart (all 107 main-gallery screenshots viewed, plus the portfolio, Minimum and OG collections) and the desengs.com reading list (Geoff Teehan at Lightspark, Emil Kowalski, Raphael Salaja, Rauno Freiberg, Jakub Krehel, Benji Taylor, Juliette of shedsgns, Fabricio Teixeira, Pierrick Calvez, ref.tools). Written in our own words; see CREDITS.md.

Part one names what the references have in common and why it works; part two indexes them so you can propose references when the user has none. Principles generalise, so reason from them. Values describe what the corpus does most often: defaults to beat, not ceilings. A device from this file is right only when the subject earns it (principle 2); never apply one mechanically.

## 1. Borrow the mechanism, never the surface: Reference by mechanism (Kowalski; ref.tools; Teixeira)

A reference teaches why something works; copying how it looks produces pastiche, which jurors score as generic.

- For every reference you cite, write one line on the mechanism (the decision that makes it work) and one on how it translates to this subject.
- Draw references from at least two categories of the index, one of them outside the user's category, and look at what your heroes admire, not only at their peers.
- Analyse instead of labelling: "the wordmark sits on the bottom edge so the empty black above reads as tension", never "clean" or "bold".
- Don't take a reference's palette, typeface and layout together; take one mechanism per reference and rebuild it from the subject.

Check: each reference in direction.md has a mechanism line and a translation line; side by side with the reference, our screen shares an idea but not the palette, face and layout together.

## 2. Earn every device from the subject: Reason before look (desengs corpus; Juliette, shedsgns)

The striking devices in the corpus are motivated: a filmmaker's site uses timecode, a CV becomes a receipt, an obsidian platform renders obsidian rock, a double exposure says "twofold". The same devices without a reason are the generated defaults that jurors punish.

- List the subject's own vocabulary (its tools, documents, materials, rituals) and pick the signature device from it.
- Test each device by asking what it means to someone who knows the subject; if the only answer is "it looks designed", cut it.
- Treat mono labels, hairlines, acid accents, live clocks and tracked caps as earned only when they encode real information about this subject.
- Don't import a device because a reference used it; import the reasoning that produced it.

Check: for each distinctive device in the screenshot, the critic can say in one sentence what in the subject it comes from; a device with no traceable reason is a finding, cross-checked against `kb/knowledge/ai-tells.md`.

## 3. Give the fold one owner: Single dominant element (desengs corpus)

Nearly every reference lets one thing own the first screen (a name, a photograph, the product, a list or a single number) and steps everything else down to caption scale.

- Decide the owner before layout: wordmark, sentence, image, product, index or datum. Choose one.
- Make the owner plainly larger or heavier; the next element is a clear step down, not a rival.
- Park the utilities (nav, contact, clocks, toggles) at the edges and corners in small type.
- Don't split the fold between two equal heroes (text left, image right, same weight) unless the subject really is two-sided.

Check: in an 8px-blurred screenshot one shape dominates, and the second-largest element covers less than a third of its area.
Values: owner spans 40–100% of the viewport width; nav and meta 11–14px.

## 4. Jump the scale and skip the middle: Two registers (desengs corpus; Calvez)

Most references use a display register and a caption register with little in between, where generated pages climb a gentle 1.25 ladder through five or six sizes.

- Size the display type from the composition (often the full viewport width), then set nav, captions and meta at one small size.
- Add a middle size only for running text people must read, and keep it to one.
- Separate caption roles with weight, case and tone before adding another size.
- Don't stack a 24px subhead, a 20px lead and an 18px body on the first screen.

Check: measure.json shows at most three font sizes above the fold, and the largest is at least six times the smallest.
Values: display 72–320px clamped to the viewport; caption 11–14px; one reading size 16–22px. Display-to-caption ratios of 8–20 are common in the corpus.

## 5. Let the type be the image: Typographic hero (desengs corpus)

When the subject has no image worth showing large, a name, a sentence or a list set at display size becomes the picture, and the choice of face does the branding.

- Choose the face for its character at display size (high-contrast didone, ultra-condensed or extended grotesk, monospace, bitmap) and treat it as the brand's most distinctive asset.
- Set a real sentence rather than a slogan: a positioning line, a roster, an index, a definition.
- Use the family's own range (roman and italic, weights) for structure instead of effects.
- Don't decorate display type with gradients, outlines or glows; the setting is the decoration.

Check: with images hidden, the first screen still identifies the brand; the display face is not a default UI sans (Inter, Roboto, system-ui, Arial) unless the brief chose it.

## 6. Set display type as a shape: Tight, cropped, deliberate (desengs corpus; Calvez)

At display size the references treat words as blocks: tight leading and tracking, line breaks chosen by sense and shape, and crops that are plainly intended.

- Set display leading near 0.85–1.0 and track grotesks tighter as they grow; give small caps and labels positive tracking.
- Break lines by meaning and shape (a staggered indent, one word alone on a line), not where the container happens to end.
- If type bleeds off an edge, crop it decisively and keep the word recognisable; never let it overflow by a few pixels.
- Align display type optically to the grid edge (overshoot and side bearing), not to its box.

Check: display lines sit closer than one x-height apart; cropped type loses at least 10% of its cap height; no word is clipped by 1–4px.
Values: display `line-height: 0.85–1`; `letter-spacing: -0.02em` to `-0.05em` at 64px and up; caps labels `+0.04em` to `+0.1em` at 11–13px.

## 7. Speak in a second voice once, with a role: Voice contrast (desengs corpus)

Many references add one contrasting voice (an italic serif in a sans page, a mono kicker, a pixel face, serif marginalia) and give it a fixed job: the name, the brand's own term, connecting words, notes or metadata.

- Give the second voice one structural role and keep it in that role across the page.
- When the contrast lands on a single word, make it the name or the brand's own term, never an adjective you want to stress.
- Contrast by style or family (italic, serif, mono), never by colour fill, gradient or highlight chip.
- Don't put more than two voices on a screen; a third face needs a stated reason.

Check: the screenshot shows at most two families; every contrasting word or phrase is the name, a defined term or a consistent role (connector, marginal note, label), and none is set in a different colour or gradient. The default case is in `kb/knowledge/typography.md` (principle 13).

## 8. Ration colour to one decision: One field, one ink (desengs corpus)

The references rarely show more than one non-neutral colour above the fold: a saturated field with black ink, a monochrome page with one hot accent on one element, or a photograph graded to one hue.

- Write the colour stance in one sentence: the field, the ink, and where (if anywhere) the accent appears.
- Let photography or the product carry the rest of the colour, and keep the chrome neutral around it.
- Use an unexpected pair only when the subject motivates it (periwinkle and oxblood for a woodshop, darkroom red for a studio called darkroom), and say why.
- Don't scatter the accent over buttons, icons, links and badges at once.

Check: leaving out photographs and product imagery, the first screen uses at most two non-neutral hues, and the accent appears on two elements or fewer.
Values: in the corpus, about a third of the main gallery is dark, most of the rest is off-white or paper, and roughly one in twelve is a saturated full-colour field.

## 9. Show the real thing with real content: Specific proof (desengs corpus)

The strongest product pages show the product doing its job with believable data (named people, amounts, timestamps, the reason behind a suggestion), and the strongest studios show their work in use.

- Fill interface mocks with domain-true content: plausible names, prices, dates, states, and an explanation of why the system did something.
- Show work in context (a person using the site, the identity printed on a T-shirt, the typeface on a product) rather than floating flat mockups.
- Put a concrete number, price or date on the first screen when the subject has one.
- Don't use lorem ipsum, "John Doe", round invented metrics or empty dashboards as the hero.

Check: every string inside a product mock is plausible for the domain; where the subject has prices, counts or dates, one appears on the first screen; no device frame floats without context.

## 10. Let the content's own structure be the layout: Index as interface (desengs corpus; Minimum)

Archive-heavy references put the list itself on the homepage: numbered project tables, rosters, contact sheets, receipts, file trees, dated timelines.

- Ask what form the content already has (catalogue, roster, log, ledger, timeline) and design that form, with columns that carry metadata (number, year, client, type, status).
- Give the list typographic care: tabular figures, aligned columns, quiet rules, one caption system.
- Offer a second view (list, grid, visual) when the list is long.
- Don't chop a list into identical cards or a carousel when a table shows more, faster.

Check: when the subject is a set of things (projects, artists, products, posts), a scannable list or table of them appears on the first or second screen and its columns align. Check (code): figures in it use `font-variant-numeric: tabular-nums`.

## 11. Show signs of life only when they are true: Living metadata (desengs corpus)

A local clock with its city, an availability status, an index price with its update time, a live stats strip or an activity feed make a page feel inhabited, but only because the data is real.

- Choose signals that answer a visitor's question: is anyone there, is this current, where are they.
- Label each signal with its source or time: "Index updated 28 Aug, 20:00 UTC", "Currently available", "Paris 18:04".
- Keep them small and at the edges; they are texture, not the hero, unless the datum is the product.
- Don't fake liveness with static "online" dots, invented counters or numbers that never change.

Check: every live-looking value has a visible source, label or timestamp. Check (code): clocks and counters really update, and stop animating under reduced motion.

## 12. Commit to one world and keep a plain way out: Metaphor with an exit (desengs corpus; Freiberg)

The experimental references build a whole world from one metaphor (a desktop, a till receipt, a film editor, a research map, a secret society) and carry it through structure, labels and interaction, while still offering a plain path.

- State the metaphor and why the subject earns it in one line.
- Apply it to at least three layers (structure, labels, interaction) or not at all.
- Provide the plain view: a list toggle beside the 3D spiral, a reading panel beside the canvas, a text index under the desktop.
- Don't let the metaphor hide the primary action; a visitor reaches the work in two moves.

Check: the metaphor shows in three or more elements of the screenshot; a plain list or text view is reachable from the first screen; the primary action is findable without learning the metaphor.

## 13. Direct the photograph, then let it lead: Imagery as identity (desengs corpus)

Where the references use photography, it is directed and graded as a set (film colour, black and white, one hue) and given most of the fold, with type reduced to a frame.

- Use one strong image large instead of several small ones.
- Grade the set to one treatment and let the type colour echo it.
- Show a specific person, place or object with one true detail, and literalise the brand idea when you can.
- Don't use stock-like scenes or decorative 3D blobs where the subject has real things to photograph (see `kb/knowledge/imagery.md`).

Check: the images share one grade; the main image shows something specific to this subject; measure.json reports no contrast failures for text over images.

## 14. Leave space unclaimed: Emptiness as confidence (desengs corpus; Teixeira)

The references routinely leave much of the first screen empty and let one element hold it; generated pages fill every gap with badges, blobs, logo strips and extra copy.

- Choose the empty region on purpose (a quiet half, an empty column, the dark above a bottom-edge wordmark) and protect it.
- Remove elements before reaching for spacing tricks; everything above the fold answers to the owner (principle 3).
- Pace the scroll with pauses: dense, then empty, then dense.
- Don't fill space with decoration to make the page feel finished.

Check: nothing above the fold exists only to fill space (glow, blob, floating badge, decorative logo strip), and one large uninterrupted empty region is visible.
Values: by studio estimate, 40–70% of the first screen carries no content in most of the corpus.

## 15. Show the grid only where it does work: Visible structure (desengs corpus)

Hairlines, cell borders, crosshairs, crop marks and dashed canvas cells appear in many references, always on the real grid or borrowed from the subject (print, a design tool, a form). Used as decoration they become the broadsheet costume.

- Draw a line only on a column or row edge that content actually uses.
- Keep one line weight and one line colour across the page.
- Take the line vocabulary from the subject: crop marks for print, dashed cells for a canvas tool, ruled cells for a museum header.
- Don't add rules between sections, under headings and around cards all at once.

Check: every visible line in the screenshot sits on a content edge and all share one weight; on a subject with nothing tabular, editorial or constructional, rules are a finding.

## 16. Make the action quiet and specific: Restrained calls to action (desengs corpus)

The references usually have one action per screen, labelled with its outcome or with a person, and often set as a text link, an input or a prompt instead of a pair of equal buttons.

- Keep one primary action per screen and make the secondary a text link.
- Label it with the result or the human on the other side: "See if you qualify", "Talk to Aiden", "Start a project".
- When the first step is input (an address, a prompt), make the input the call to action.
- Don't default to "Get started" and "Learn more" as twin hero buttons.

Check: measure.json CTA labels show one primary per screen and none from the generic set (Get started, Learn more, Submit, Click here) unless the brief asked; targets still meet 44px.

## 17. Leave a human mark: Hand and voice (desengs corpus; Juliette, shedsgns)

A hand-drawn scribble, a brush-script mark, a joke in the microcopy or an honest "work in progress" sticker tells the visitor that a person made choices here.

- Add at most one hand-made element per screen and give it a job: point, annotate or sign.
- Write with a point of view: dry, specific, sometimes funny; a definition or a line only this brand would say.
- Show the people when the subject is people (team portraits, the founder on the announcement).
- Don't fake a hand with a script font on every heading, or force jokes into error states.

Check: at least one line on the first screen fails to fit a competitor (the coffee test in `kb/knowledge/content.md`); hand-made elements appear at most once per screen.

## 18. Depart from the category once: Category contrast (desengs corpus)

Many of the strongest product and finance references borrow one convention from another world: serif headlines on crypto, banking, data and devops pages, painted landscapes on AI pages, visible joy on a scooter page.

- Name the category's default look (dark dev-tool gradient, fintech blue, AI purple glow) before you design.
- Depart on one axis (type voice, imagery, colour or tone) and keep the category's legibility conventions.
- Borrow the departure from a neighbouring world with matching values: editorial for trust, nature for calm, industrial for precision.
- Don't depart on every axis at once; the page must still read as a product in its category.

Check: the critic can name the category default and point to the single axis where the design departs; nav, CTA placement and form patterns still follow the category.
Values: about two in five of the main gallery set display type in a serif, including roughly a third of the product and finance entries.

## 19. Make the share card a poster: OG image as poster (desengs OG gallery)

The OG references treat the 1200×630 card as a poster: one image idea and the wordmark or one line, readable as a thumbnail, never a shrunken screenshot of the hero.

- Compose the card on its own, from the brand's signature move.
- Keep text to the name or one line, at a size that survives a 600px-wide preview.
- Use the product only when it reads as an image (a trace waterfall, a node graph).
- Don't ship the framework's default card or a generic gradient behind the logo.

Check: at 600px wide the card's text is legible and it shares the page's palette and type. Check (code): `og:image` points to a 1200×630 asset made for it.

## 20. Limit the details, then perfect each one: Fewer, better details (Teehan, Lightspark)

Every feature, control, state and decoration asks for attention and upkeep; keeping few of them is what makes it possible to make each one excellent.

- List every distinct element on the screen and cut the ones that do not earn their place.
- Spend the time saved on what remains: the type, three words of copy, a transition, two pixels of alignment.
- Let complexity in only when it earns its way: a cockpit may look like a cockpit, a thermostat may not.
- Don't treat minimalism as the goal; a sparse page can still be careless.

Check: count the component types on the first screen (button, card, badge, icon, input styles); more than one style per type, or more than about six types, is a finding.

## 21. Beat the reference by subtracting: Match, then sharpen (Teixeira; ref.tools; Teehan)

To go past a reference the studio usually removes and sharpens rather than adds: fewer elements, one braver decision, better words, finer details.

- Once the work matches the reference's level, list what can go without loss, and remove it.
- Push the one signature decision further (bigger, tighter, more specific) instead of adding a second.
- Rewrite headings and calls to action shorter and more specific; the right words replace interface.
- Don't add effects, sections or motion to look ambitious.

Check: the direction notes say what was removed or sharpened relative to each reference, and the final version has no more elements than the matched one.

## 22. Announce movement and sound, then hand over control: Motion cues (desengs corpus; Kowalski)

In stills, the animated references announce their motion (marquees, scroll cues, live counters, showreel thumbnails, sound and view toggles) and keep controls in reach; big motion is kept for rare moments, never for daily interactions.

- Put motion where it shows change or invites exploration, and keep frequent interactions instant (see `kb/knowledge/motion-sound.md`).
- Show a visible, labelled toggle before any sound plays, and start muted.
- Use marquees only for non-essential text (instructions, announcements), never for content people must read.
- Don't autoplay full-screen video with sound or hide navigation behind an intro sequence.

Check: any sound has a visible toggle on the first screen and marquee text is non-essential. Check (code): reduced motion stops marquees, spins and parallax.

## Reference index (captured 2026-10-11)

Each line reads `name — url — what to learn from it`. The list holds every entry in the desengs.com main inspiration gallery on 2026-10-11 (107), plus 38 chosen from its portfolio archive, Minimum directory and OG gallery. Mechanisms were read from the screenshots desengs published, not from the live sites, which change; open the live site before you show it to a user.

How to use it:
- Propose three references per direction: one from the user's category, one from a neighbouring category and one from outside it (principle 18). Give each the mechanism you are borrowing (principle 1).
- The user's own references outrank this list. Use the index when they have none, or to show a mechanism their references lack.
- The screenshot for an entry is linked from its desengs page. The full snapshot, with tags, dates and image URLs, lives in the repo at `sources/desengs-inspiration.json`. Maintainers refresh it with `tools/refresh-sources.mjs`.

### Portfolios and personal sites (18)

- Ben Mingo — https://benmingo.com — Contact-sheet index: uniform thumbnails labelled with file names, so the work can vary while the frame stays fixed.
- Bleibtgleich — https://bleibtgleich.com — One red does every job (type, rules, mark) on off-white; visible crosshair construction lines and a dry one-line voice.
- Daniel Herzog — https://danielherzog.design — Restraint on dark: a regular-weight two-line headline, one hairline organising the fold, a text link instead of a button.
- Davide Baratta — https://davidebaratta.com — Full-width serif wordmark over an asymmetric work grid with deliberate gaps; micro labels mix two families.
- Gio Pandone — https://giopandone.com — An almost empty page whose grid shows only through the alignment of a few tiny text blocks.
- Hugo Baron — https://nuageboi.fr — One saturated field plus black; a cropped condensed-name marquee, numbered nav and a live local clock turn metadata into texture.
- Hélène del Marmol — https://helenedelmarmol.com — A grey (not black) name lets cut-out object photographs lead; a typewriter-set project list doubles as navigation.
- Jason Bergh — https://jasonbergh.com — Cinema vocabulary for a filmmaker: timecode rulers, frame corners, a runtime clock and a slider/list toggle around an italic serif title.
- KISAWAPFE — https://kisawapfe.com — Name set edge to edge as the masthead and every other line at caption size: two type sizes and one lo-fi image carry the fold.
- Lelism — https://lelism.com — Monospace everything: the numbered project index is the homepage, with coordinate columns at the edges for tabular rhythm.
- Luisa Ruzzenenti — https://luisaruzzenenti.com — Small thumbnails in a sparse grid with empty cells; the pattern of whitespace is the composition.
- M.A. Baytaş — https://baytas.net — The whole practice as a dated table (year gutter, title, type tag), strikethrough for what ended, list/category/visual view switch.
- Mekuwelt — https://mekuwelt.art — Split screen: one loud saturated image half against a silent half holding an almost invisible embossed monogram.
- Miller McCormick — https://millermccormick.com — No hero: the homepage is the body of work as an irregular thumbnail field, with the bio cut to a four-line caption.
- NoGood — https://nogood.studio — A personal site run like a dashboard: ruled columns, a now note, status lights, a system log and a shop sidebar.
- Ofri Cohen — https://ofricolada.com — One tightly kerned display-serif sentence is the hero with the name in italic; mono contact details are the only chrome.
- seb-astian — https://seb-astian.com — Print-form layout with ruled borders, a didone name split by rules, hand doodles and a self-deprecating voice.
- T for Troels — https://tfortroels.com — Strict label and value columns under tiny grey headers, a full-width name between hairlines, one hand-drawn scribble breaking the grid.

### Studios, agencies and collectives (27)

- Adcker — https://adcker.com — A photo set inside parentheses as a word of the stacked headline, annotated by small serif marginalia.
- Anima — https://anima.ai — A scanned object weaves in front of and behind the headline letters (z-layering), with boxed mono annotations as callouts.
- ARTWORLD — https://artworld.agency — The roster is the design: names alternate roman and italic with superscript role codes and a legend, above a heavy wordmark.
- ATIO Studio — https://atio.studio — Wordmark bleeding off the top edge, then projects as five-column metadata rows; a deadpan spec line names the background colour.
- Brikken+Co — https://brikken.co — The logo rendered as a physical material object; faint column lines expose the grid behind a full-width wordmark.
- DEADWATER — https://www.deadwater.fr/en — Ultra-condensed wordmark along the bottom, one framed moving portrait, and a since-2012 badge for heritage.
- Double You Management — https://doubleyoumanagement.net — A hover roster drives the full-bleed image: the active name bright with an italic role, the others dimmed.
- Driftime — https://driftime.com — Client work shown in use by a person on a real laptop instead of a flat mockup, under a heavy caps headline.
- Exe — https://equipo-exe.com — Running serif prose with inline See also chips linking concepts, above documentary team portraits that state the practice.
- fromanother — https://fromanother.love — Indented caps headline with a video clip replacing one word, italic serif side notes and a language switch.
- giallo.studio — https://giallo.studio — One ink on black and a numbered project table (no., name, category, client, description, year) as the homepage.
- Habillage Graphique — https://habillagegraphique.com — Light caps repeated as ruled, offset lines turn the name into a pattern; italic is spent only on the playful (RÉ).
- helloMuller — https://hellomuller.com — One colour, one typeface, one size jump: the wordmark is the hero and the nav sits on a four-column grid under a rule.
- L'Étude — https://letude.group — Three-colour poster logic: a photo panel knocks out the heavy wordmark it overlaps; a dictionary definition is the voice.
- Monolog — https://bymonolog.com — The wordmark mixes letter styles to show range; two short paragraphs name the client's exact problem.
- New Genre — https://newgenre.studio — A single positioning sentence in serif over a time-of-day gradient; no image and one ghost button.
- NOUN — https://nounagency.com — The name spelled down a 4x4 grid alternating letters and work photos, with print crop marks at the intersections.
- Offsite — https://off.site — Classical serif caps headline with a mono kicker; secondary content parked in the corners as small cards.
- Omosa — https://omosa.co — Client campaign photography as the hero with a case-study caption strip (client, services, year) across the fold.
- Posse Agency — https://posse-agency.com — Manifesto set in heavy caps at the same size as the nav, counts in parentheses, one brush-script mark as the only hand-made element.
- SavoirFaire — https://savoirfaire.nyc — A condensed didone wordmark sits on the bottom edge like a horizon, empty black above, an instruction marquee on top.
- Signal-A Studio — https://signal-a.studio — Weight and family contrast inside one justified sentence does the emphasis; live city clocks sit in a ruled six-column nav.
- STAGECREW — https://stagecrew.studio — Asymmetric split: a column of full-bleed work against a mostly empty column holding one indented paragraph.
- Studio Linear — https://studiolinear.com — Condensed caps wordmark with a googly-eyes glyph, a pixel font as second voice, and a bottom bar that routes visitors by intent.
- Unknown, Untitled — https://unknown-untitled.com/en — One family, two sizes: the name cropped at the top edge and a large-set paragraph as the only content.
- Vivien's Creative — https://vivienscreative.com.au — A full-bleed black-and-white photograph carries the emotion; a giant wordmark cropped at the bottom edge and one serif sentence frame it.
- WØRKS — https://works.studio — Light serif caps headline with italic lowercase connectors; the captions repeat the same serif system under portrait work.

### Product, SaaS, AI and developer tools (23)

- Antimetal — https://antimetal.com — Old-style serif in a devops category, a topology burst diagram, and bracket-corner secondary buttons.
- Berd — https://berd.xyz — The app window is the hero, ringed by odd low-poly figurines that set a playful register.
- Dub — https://dub.co — The conventional SaaS hero done precisely: medium-weight headline, real product UI with plausible data, a product tab switcher.
- Figma Weave — https://weave.figma.com — The product's own node graph (model to model) is the hero illustration; split titles name the product and its category.
- Fora — https://fora.so — The product window rises out of a rendered landscape, showing a real creator space rather than an empty dashboard.
- Galaxy — https://getgalaxy.io — A Garamond-style serif for data infrastructure, the last line greyed to shift voice, a fan of fine lines as data flow.
- Giga — https://giga.ai — A calm painted landscape and a serif headline give an AI product a human register; client logos sit on the image foot.
- Humble — https://humbleops.ai — Shows the actual user (a factory operator) instead of abstract AI imagery; editorial three-column hero; accent down to a full stop.
- Hyperiux Vault — https://vault.hyperiux.com — Square geometry everywhere (buttons, bullets) and ASCII texture for a developer effects library.
- Interfere — https://interfere.com — Keyboard-shortcut badges on the nav buttons signal a keyboard-first product; a full issue view with a forecast chart is the proof.
- Jack & Jill — https://jackandjill.ai — A symmetric two-audience split, each with its own CTA, and UI that explains why the agent suggested something.
- Langbase — https://langbase.com — The layout grid drawn as a design-tool canvas (dashed cells, corner handles) while the headline stays modest.
- Maito — https://getmaito.com — Two-tone serif headline (second line lighter) over a product calendar filled with real post titles.
- Melius — https://melius.com — The prompt box is the call to action; a perspective corridor of generated work shows the range of output.
- Neon — https://neon.com — Feature visuals are diagrams of the concept (light paths for scaling, splitting lines for branching); the accent is rationed to logo and CTA.
- Plnty — https://plnty.app — A live activity ticker as social proof, large-set body copy, and a hazard sticker admitting the site is unfinished.
- Ploy — https://ploy.ai — Documentary video in an inset rounded frame keeps the page edge; condensed caps for punch; a founder-photo announcement card.
- Portal — https://useportal.net — An illustrated world gives warmth to a payments tool; the product card shows a real proposal with amounts.
- Pryzm — https://pryzm.design — Outputs shown as named specimens (texture name plus technique): the naming is the taste signal.
- Quo — https://quo.com — Social proof above the headline, product UI filled with believable conversations, one saturated CTA colour used twice.
- Relace — https://relace.ai — Scientific-figure captions (FIG. 002) and an analog landscape behind a code window; square buttons and one orange.
- Rig — https://rig.ai — Chamfered corners as brand geometry, a value-prop marquee, then a problem-first section numbered like a report.
- The Content Architecture — https://contentarchitecture.dev — A terminal-style status line (versions, servers, drift 0) as proof beside a kinetic spiral of repeated words.

### Finance, markets and real assets (9)

- Caso Patrimoine — https://caso-patrimoine.fr — A headline alternating grotesk and serif lines (modern and heritage) above photographs of the actual buildings.
- Griffin — https://griffin.com — Currency glyphs as a pattern band; body copy in two tones so the key sentence reads first.
- GTE — https://gte.xyz — A serif headline on a crypto exchange breaks the category convention; motion-blurred coins imply speed.
- Lightspark — https://lightspark.com — Depth of field ranks many example UIs (sharp near the centre, blurred at the edges) around a small headline.
- Moonbeam — https://moonbeam.network — A cinematic render, a staggered three-line headline and a live network-stats strip as proof.
- Obsidian — https://obsidianos.com — The brand name made literal as material (rendered obsidian rock) framing a realistic adviser dashboard.
- Ornn — https://ornn.com — The product's core number (an index price) is the hero, with a mono timestamp proving it is live.
- Primora — https://primora.xyz — The CTA names a person (Talk to Aiden) with his avatar; a candlestick chart works as category texture.
- Tars AI — https://tars.pro — The brand object (a chrome logo form) is the hero inside a stepped gradient grid, flanked by two short claims.

### Editorial, culture, institutions and services (8)

- Conway World — https://conway.world — Monochrome illustration in the brand colour only; a sans masthead with a serif deck for editorial voice.
- Museo Cappella Sansevero — https://museosansevero.it — A detail crop of the collection's masterpiece; header utilities each in their own ruled cell.
- Museum Department — https://museumdepartment.com — A heavy caps statement and a one-line description that teaches the keyboard search.
- NTGent — https://ntgent.be — A season statement paragraph instead of a slogan; cut-out props and stills collaged asymmetrically.
- .softGlossary — https://softglossary.space — Code-made imagery (ASCII) for a site about web design and code; one italic serif word carries the brand's own term.
- Studio Museum in Harlem — https://studiomuseum.org — One display serif carries the institution's voice; artworks sit on grey like a gallery wall.
- The Swaddle — https://theswaddle.com — A classical masthead parked at the fold line over an empty upper half, inviting the scroll; mono category nav.
- Twofold Therapy — https://twofoldny.com — A double exposure literalises the name; the type stays minimal so the photograph speaks.

### Commerce, type foundries and physical products (12)

- Anuc Home — https://anuchome.com — The logo is built from the page's four columns (arches) and one interior photograph is sliced by the same grid.
- Caractère Bois — https://caractere-bois.fr — An unexpected but motivated colour pair for a woodshop; the identity appears inside the photograph on a T-shirt.
- Claude Type — https://claudetype.com — Typefaces shown on physical products (bag, hair clip, wine label) in arch crops that echo the letterforms.
- Darkroom — https://darkroom.au — A layers panel drawn over the product photograph explains, inside the hero, that the mockup is editable.
- Daylight — https://godaylight.com — Data annotations on a photograph of a real home make the product tangible; an address field is the CTA.
- Flying Papers — https://flyingpapers.com — Products personified as mascot characters; a tone-on-tone headline so the characters lead.
- Infinite Machine — https://infinitemachine.com — A studio product shot with a rider in visible delight; the price sits next to the product name.
- Kaer — https://kaer.co — The brand device (parentheses) scaled up to frame one italic serif line over a dusk photograph.
- Lift Type — https://lift-type.fr — A mascot interrupts the caps headline mid-line; a grid/list toggle for the catalogue.
- SSENSE XX — https://xx.ssense.com — A single glyph (the anniversary numeral) fills the fold; nothing else but a scroll cue.
- Tatsiana Shevarenkova — https://tatsianashevarenkova.com — Catalogue metadata (title, dimensions, price or sold) is the only interface over consistently lit photographs.
- trulytype.com — https://trulytype.com — The type specimen is the hero; one unexpected real object (a spotted frog) makes it memorable.

### Experimental, world-building and motion (10)

- Apossible — https://apossible.com — A research map on an infinite canvas (threads, tagged cards, zoom controls) beside a plain reading panel.
- Cosmos — https://cosmos.so — The product's content orbits the wordmark in 3D; the corners hold utilities (theme toggle, scroll cue).
- Le Mans Classic — https://lemansclassic.richardmille.com — One hot colour on a monochrome motion-blur photograph, framed by four corner captions like a film poster.
- Nrthview — https://nrthview.com — A desktop OS metaphor (folders, menubar, live weather) for a multidisciplinary archive, with instructions in a marquee.
- Pacôme Pertant — https://pacomepertant.com — A 3D spiral of work with a plain list view one click away, an explicit sound toggle and a rotating showreel badge.
- SUB — https://sub.global — The archive as a landscape of hundreds of coded thumbnails, filtered by facets written as plain text lists.
- The Design Society — https://thedesignsociety.fr — Bitmap serif with inline pictograms and seal-like ornaments for a secret-society tone, on a CRT-textured field.
- Tikhon Belousko — https://tikhon.io — The CV as a till receipt: order number, line items, quantities and years in tabular columns.
- VAP — https://vap.studio — The logo as a tactile chrome object with sticker decals; tiny lowercase copy against the loud object.
- Voku.Studio — https://voku.studio — Images arranged as an object (a fanned arc of cards) instead of a grid; one line of nav.

### From the portfolio archive (20)

- 56 — https://56.digital — The whole site is a narrow list of services and dated projects, with most of the page left empty.
- Anton Repponen — https://repponen.com — Figure-numbered captions and a Swiss multi-column nav with sub-labels.
- Cristina Gómez — https://cristinagomezruiz.com — A labelled meta row (location with local time, navigation, theme) above a portrait and a giant light serif name.
- Dan Tase — https://dantase.com — Classical serif statement with an italic connector word; underlined text links instead of buttons.
- darkroom.engineering — https://darkroom.engineering — The photo-lab red light becomes the whole palette, with pixel display type, for a dev studio called darkroom.
- David Fiz — https://davidfiz.com — Thresholded images on a contact sheet with registration marks and zoom, grid and list controls.
- Duties — https://duties.xyz — A status line (currently off-duty, red dot, local time) and the services as plain mono text.
- Edoardo Lunardi — https://edoardolunardi.dev — Small OS-like windows (article, about, experiment) float over a dithered field above a filmstrip of work.
- EST+6 — https://estplus6.com — A full-bleed film photograph with the client's mark overlaid; a footer of city clocks for a two-city studio.
- Garbett — https://garbett.com.au — A wayfinding studio shows its symbols as a colour grid next to a photograph of real signage.
- George Badea — https://georgebadea.com — A bio paragraph with a first-line indent on a coloured field with faint column lines.
- Michaël Bernard — https://michaelbernard.fr — The designer's own type design overlaps the title, showing the work inside the hero.
- Nick Wiesner — https://nwiesner.com — Two portraits are the navigation; the labels sit directly on the photographs.
- Pedro Ajo — https://pedroajo.com — The studio as a CV table (worked with, years, services, capacity) under spaced giant initials.
- Play Grounds Studio — https://play-grounds.studio — A project table with status (completed, in progress) and locations under loosely tumbling initials.
- Redis Agency — https://redis.agency — A pun made physical: a 3D radish replaces a letter of the serif wordmark.
- Sophie Loloi — https://sophieloloi.com — Text colour echoes the photograph: a red italic client list beside red lips.
- This Design — https://this.design — One sentence mixes weights, angle brackets and an italic serif word to perform the studio's three values.
- Tom Parkes — https://tparkes.com — Inline pictograms between the words of a large grey sentence act as punctuation.
- Voyeur Vérité — https://voyeurverite.com — The whole page graded to one hue so image and type merge into a single colour field.

### From the Minimum directory, text-first personal sites (12)

- Benjamin Akar — https://benja.dev — Work listed as receipt lines priced at $0.00.
- bobby giangeruso — https://bobby.so — Year and event in two columns: a résumé as a timeline.
- Experimental Jetset — https://jetset.nl — An entire studio archive as dense multi-column text lists, with no images.
- Gitesh Sarvaiya — https://giteshsarvaiya.co — A README document (contents, rules, sections) as the site.
- Guillermo Rauch — https://rauchg.com — Essays as a table of year, title and view count.
- Karri Saarinen — https://karrisaarinen.com — Numbered notes on building as the centrepiece of a quiet text page.
- Lauri Paronen — https://lauriparonen.com — A justified book paragraph with an ornamental drop cap is the whole homepage.
- Luc Chaissac — https://lucchaissac.com — An acid-yellow field with a large plain introduction and client marks; one colour decision does all the branding.
- Monty Anderson — https://montyanderson.net — Default-browser HTML (serif, blue links, bullets) used on purpose.
- naveen — https://naveen.com — Plain monospace text with numbered entries; nothing is designed except the order.
- Prompt Files — https://prompt-files.com — A file tree drawn in text is the navigation.
- Sasidharan — https://sasi.codes — A career told as a dated message thread.

### From the OG image gallery, share cards (6)

- Aquaduck — https://aquaduck.ai — A giant didone wordmark cropped over a faint engraving: one image idea at poster scale.
- Hermes Agent — https://hermes-agent.nousresearch.com — Classical serif caps on a single saturated blue.
- Jason Jun — https://jasonjun.dev — The name cropped at poster scale, with the job title as a tiny caption.
- SF Compute — https://sfcompute.com — An illustrated local landmark and a friendly serif line make infrastructure feel neighbourly.
- Solidroad — https://solidroad.com — A halftone landscape with the wordmark centred; one image, one mark.
- telemetry.dev — https://telemetry.dev — The share card shows a real trace waterfall from the product beside a two-line headline.

## When these conflict

- The user's references outrank the corpus. The index proposes; the user decides.
- Legibility outranks any device. Cropped type must still read, and mono labels and text over images must pass contrast.
- Clarity outranks metaphor. If the world hides the action, ship the plain view first.
- The subject outranks the trend. A device the subject does not earn loses to the plain decision, however often the corpus uses it.
- If a principle here clashes with a tell in `kb/knowledge/ai-tells.md`, the device stays only with its one-sentence reason (principle 2).

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
