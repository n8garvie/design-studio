# Imagery and art direction

> Used by: art director (owner), visual designer, brand & marketing designer, emotion designer, design engineer (image delivery). Distilled from: Anshu Chimala's technique 4 on image generation (Lenny's Newsletter) and Mika Reyes's notes on it; world-class-designer by Eric Lammertsma (media.md and the imagery tells in ai-tells.md); Craft by Gustavo Fior (image-outlines, noise, icons); the Critly fork of Craft by kausthubh-coder (real-content, image-loading); Tufte on explanatory graphics; WCAG 2.2 on text alternatives; the desengs.com inspiration corpus (grade, work in use, depth of field, cut-out collage); and studio practice in editorial photography, illustration commissioning and product art direction. Written in our own words; see CREDITS.md.

Principles 1–10 set what images are for and how a set holds together; 11–17 cover icons, screenshots, materials and finish; 18–22 cover generating and sourcing; 23–26 cover slots, delivery, access and themes; 27–28 cover showing work in use and cut-out collage. Principles generalise; Values are defaults to beat, not ceilings. Judge an image in the page, at real size, at both widths, never in a folder of thumbnails.

## 1. Give every image a job: The four jobs (Chimala; studio)

An image earns its place by doing what type and layout cannot: giving the page a material, opening space, setting a mood, or showing a state of the product or its world; if a gradient could replace it, it is the wrong image.

- Write the job beside every slot before choosing the picture: "material: the paper the ledger is printed on", "state: the inbox at zero".
- Add proof as a fifth job on product surfaces: the real product, at a size where the claim can be read.
- Replace any orb, blob, mesh gradient or floating shape standing in for imagery with a real image that does the job, or with nothing.
- Don't add an image to fill a column or balance a grid; a well-set empty column beats a filler picture.

Check: the imagery list in direction.md names a job for every image in the screens; any glow, mesh gradient or abstract 3D blob sitting in an image slot fails.

## 2. Choose one imagery mode per direction: Imagery mode (studio)

The direction picks a primary mode (photography, illustration, rendered 3D, typographic image, live product UI, texture only, or none) and at most one secondary mode, and every slot uses one of them.

- Derive the mode from the subject's world: a bakery wants photographs of crumb and flour; a developer tool wants its own live UI and diagrams; an annual report wants editorial photography or none.
- Add a secondary mode only when it does a different job (photographs set the world, line diagrams explain the mechanism).
- Treat "type is the image" as a full mode: one oversized numeral or word set as the graphic is a decision, not a fallback.
- Don't mix photography, flat illustration and 3D renders on one page; three modes read as three vendors.

Check: line up every image in the screens; more than two modes, or a mode not named in direction.md, fails.

## 3. Use fewer, larger, better images: Restraint (Chimala; studio)

One excellent image at commanding size does more than six small ones, and where images carry the information, the layout steps back for them.

- Give the lead image real scale: full bleed, or at least 40% of the first desktop viewport.
- Let images replace chrome when they already are the content (in a food log where the photos are the entries, drop the extra labels and cards).
- Cut images that repeat the copy beside them ("a person on a laptop" next to "work from anywhere").
- Don't sprinkle spot illustrations over every section; one image moment per screenful is plenty.

Check: in the desktop top shot, a lead image (if any) covers at least 40% of the viewport; no section carries an image whose content only restates its heading. When a page must show many images at once (a wall of example screens, an archive), one is sharp and the rest step back by depth of field, scale or tone, so the eye still finds a lead (desengs: Lightspark).
Values: for a ranked field of images, background items blurred about 4–12px or dimmed to about 60% (studio default).

## 4. Hold the set together: Palette, lens and grade (world-class-designer; studio; desengs corpus)

A page's images read as one family when they share palette, lens, grade and background treatment, so the set, not the single frame, is the unit of art direction.

- Fix palette roles for imagery: one dominant hue family drawn from the color tokens, one accent in at most a fifth of any frame, neutrals tinted toward the page's ink and paper.
- Fix the lens: one focal-length family and one camera height for the set (all eye-level 50mm, all top-down, or all 85mm close details).
- Fix the grade: the same contrast curve, saturation and shadow tint on every image, so a photo and a render can sit side by side.
- Don't accept a frame from another renderer, era or color temperature because it looks good alone.

Check: put every image in one row at equal height; a frame with visibly different color temperature, contrast or rendering style fails.
Values: shadows tinted toward the ink color, never pure #000; saturation within about ±10% across the set; CSS grade only at low values, e.g. `filter: contrast(1.05) saturate(0.9)`. Let type echo the grade: in the desengs corpus a red italic client list sits beside red lips, a whole page is graded to one red so image and type merge, and black-and-white photography takes one hot type color.

## 5. Light the set from one source: Shared light (studio)

Light is the strongest unifier in an image set, so state its direction, quality, temperature and time of day once and hold it in every frame.

- Name the light in the system: "soft window light from upper left, late morning, about 5000K" or "single hard key from the right, deep shadow".
- Agree with the interface: if UI shadows fall down and to the right, image shadows don't fall up and to the left.
- Pick quality from the mood: soft, wrapped light for calm and care; hard, directional light for confidence and drama.
- Don't put rim light, glow and lens flare on every subject; that is the default look of generated images.

Check: shadows in every image fall the same way at similar softness, and agree with the UI shadow recipe.

## 6. Crop with intent at every width: Crop and framing (photography practice)

A crop decides what an image says, so plan where the subject sits, where type goes and what each breakpoint keeps.

- Crop into the subject for intimacy and scale (hands and material filling the frame); pull back for context and place.
- Reserve the type's space inside the frame: "subject in the right third, left two thirds calm".
- Give subjects lead room in the direction they face or move, toward the content, not off the page.
- Art-direct the mobile crop as its own composition (4:5 or 1:1, subject re-placed), not the desktop frame squeezed.
- Don't center every subject; it is the generated default and it flattens rhythm.

Check: in the 390px shot the subject is whole and not under text; no face, product or key detail is cut at either width.
Values: `object-position` set per image to the focal point; separate mobile crops through `<picture>` sources.

## 7. Show things at their true scale: Scale honesty (studio)

Objects should keep believable sizes relative to each other, to people and to the interface, because false scale reads as fake before anyone can say why.

- Keep products at a size the viewer maps to life; a phone in a hand is hand-sized.
- Keep UI shown inside images either legible at its real size or deliberately abstract, never half-legible.
- Don't float a giant product over a tiny landscape for drama unless the direction is openly surreal.

Check: text inside product images is readable at 100% or clearly not meant to be read; objects in a series occupy similar shares of their frames.

## 8. Direct photographs instead of searching for them: Subject, light, moment (photography practice)

A directed photograph shows a specific subject doing a specific thing in a real place, and it replaces stock cliché with evidence of the subject's world.

- Brief every photograph with subject, action, place, light, crop and the one detail that makes it true (flour on the cuff, the scuffed corner of the case).
- Prefer hands, materials, objects and environments to posed faces; when people appear, cast specific individuals doing the real task, never a checklist of faces smiling at a screen.
- Replace the clichés (team high-fiving, handshake, laptop smile, lightbulb, chess piece, glowing brain, headset agent) with the work, the place and the result.
- Don't use photographs of people as invented customers, staff or testimonials.

Check: no image matches the cliché list; each photo's subject relates to how the product is actually used, nameable in one phrase.

## 9. Draw in one hand: Illustration system (world-class-designer; studio)

An illustration system fixes one style, one line weight per size, palette roles, one perspective and one level of detail, so any new drawing could come from the same hand.

- Specify the hand: medium (technical pen, cut paper, two-ink risograph, engraving, gouache), line weight at a reference size, corner treatment and texture.
- Assign palette roles: ink (line), fill (one or two flats), accent (one, sparingly), paper (the page background, so drawings sit on it).
- Fix figure rules if people appear: proportion, how faces are treated or omitted, pose language.
- Replace Corporate Memphis figures (outsized limbs, tiny heads, flat purple skin) and isometric people-at-desks packs with a style drawn for this direction, or no illustration.
- Don't scale one drawing across sizes until its strokes diverge; redraw for the second size.

Check: line up every illustration; differing stroke weights at the same display size, extra palette roles or a recognizable stock-pack style fails.
Values: one stroke per display size (e.g. 1.5px up to 240px wide, 2px at 480px and up); 3–4 palette roles.

## 10. Explain before you decorate: Diagram before ornament (Tufte; studio)

The most useful image on a product surface usually shows how something works, so prefer annotated views, exploded diagrams and sequences to mood pictures.

- Draw the mechanism the copy struggles to describe: the data flow, the three states, the before and after.
- Use small multiples for change across time or options: one frame per state, same scale, same crop.
- Don't dress a diagram in gradients, glows or 3D tilt; clarity is its style.

Check: annotations in images and SVGs use the page's type family and color tokens; each diagram uses one stroke weight.

## 11. Use one icon family at one weight: Icons as an alphabet (Craft: icons)

A set of icons is a small alphabet with one voice, so one library, one stroke weight, one grid and one corner style hold across the product.

- Count every icon the product needs before picking a library, and confirm the set covers all of them.
- Match icon weight to text weight: regular icons beside regular and medium text, bold only beside bold labels.
- Pick one style (outline, filled or duotone) and keep it; use the filled twin only to mark a selected state.
- Replace emoji used as icons or bullets, and sparkle, rocket and lightning glyphs, with icons from the family or with no icon.
- Don't put an icon beside every heading or a check mark beside every bullet.

Check: line up every icon on a screen; one with a different stroke, grid, corner or fill style fails; emoji in UI chrome fail.

## 12. Size icons to their text and name them: Optical sizing (Craft: icons; Norman)

Icons carry padding inside their box, so an icon at the text's pixel size looks small; size it relative to the text, align it by eye and give it a name.

- Size inline icons in em so they track their label, and nudge them a pixel where the box centers but the shape does not.
- Use the library's drawn size nearest the target (16, 20, 24) instead of shrinking a 24px drawing to 13px with a hairline stroke.
- Pair icons with labels, except the universal handful (search, close, menu, settings, back).
- Don't use one glyph for two meanings, or two glyphs for one meaning.

Check: inline icons look as tall as the capitals beside them; measure.json `a11y.unnamedControls` is 0.
Values: inline icon `width: 1.15em; height: 1.15em` (range 1.1–1.25em); rendered stroke 1.5–2px.

## 13. Show the product as it is: Honest screenshots (world-class-designer; studio)

Product imagery is the real interface, cropped to the part that proves the claim and shown at true scale, not a device mockup tilted for drama.

- Crop to the one or two regions that make the point and show them at 1:1 or larger, captured at 2x so text stays crisp.
- Fill screenshots with lived-in data (names, amounts and dates that look like a working account), never Jane Doe, lorem ipsum or $12,345.
- Prefer live HTML fragments of the UI to bitmaps where the page can render them; they stay sharp, themed and accessible.
- Replace the floating phone or browser at a 3D angle with a drop shadow by a flat crop, a cut-out component, or a flat device frame at 0° when the device itself matters.
- Don't show a dashboard or feature the product does not have.

Check: no device frame is rotated or tilted; screenshot text is crisp, not upscaled; data inside screenshots passes the real-content test in kb/knowledge/research.md.

## 14. Render materials by their physics: Material truth (studio)

Every material obeys rules (paper is matte and fibrous, glass bends what is behind it, metal mirrors its surroundings, cloth folds and softens light), and a surface either follows them or reads as fake.

- Name the direction's materials in the system and how each behaves in light.
- Photograph or generate a material when CSS cannot render it convincingly (brass, linen, stone); keep CSS for flat, tinted and grained surfaces.
- Keep images and UI surfaces in one material world: a paper direction does not get glossy plastic buttons.
- Replace glassmorphism (frosted blur, white hairline, gradient behind) with a real surface, glass rendered with true refraction in an image, or no card.

Check: UI and image surfaces agree on finish (matte or gloss); frosted-blur cards over gradients fail unless the direction names glass and shows refraction.

## 15. Add grain on purpose: Noise (Craft: noise)

A fine layer of noise breaks up banding, gives flat fills a surface and helps photographs and flat UI sit together, and it should be felt rather than seen.

- Use grain on large flat or graded fills, on dark surfaces prone to banding, and to unify mixed media.
- Keep it monochrome and blend it only with its own surface (isolate the container), so it does not shift with what lies behind.
- Use a pre-rendered tile on large or moving surfaces; a live turbulence filter across a full-screen hero drops frames on phones.
- Don't grain long reading surfaces or small controls.

Check: grain is invisible at arm's length and visible up close; gradients show no banding steps. Check (code): no live noise filter on full-viewport or animated layers.
Values: opacity 0.04–0.10 (start at 0.08), `mix-blend-mode: overlay`, about a 200px tile, `baseFrequency` near 0.8 for film-like grain.

## 16. Give images an inner edge: Image outlines (Craft: image-outlines)

Images don't know what is behind them, so a faint line just inside the edge gives pale images a shape without reading as a frame.

- Tune per theme: black at about 10% on light surfaces, white at about 10% on dark.
- Apply it wherever images meet a similar tone, and always on avatars and logos.
- Don't push it into a visible frame; above about 20% it reads as a border.

Check: in light and dark shots, pale images (white product shots, light skies, logos on white) still show an edge; no image wears a heavy frame.
Values: `outline: 1px solid rgb(0 0 0 / 0.1); outline-offset: -1px;` dark: `rgb(255 255 255 / 0.1)`; usable range 5–20%.

## 17. Make images belong to the page: Integration (world-class-designer)

An image pasted as a rectangle looks borrowed; one that shares the page's background, type, masks and depth looks made for it.

- Shoot or generate on the page's background color when the subject will sit on the page without a frame.
- Set type into the image with a deliberate layer order where the direction allows, instead of a translucent box over it.
- Keep text over images on calm regions, or use a local scrim that follows the text block, never a full dark overlay.
- Don't leave a white image background on a tinted page; match it, cut it out, or go full bleed.

Check: measure.json `contrast` flags elements `overImage`; in the screenshot each sits on a calm region with legible contrast (estimate 4.5:1 for body, 3:1 for large text); no visible box edge where an image meets a same-colored page.

## 18. Write the style prompt once: Prompt anatomy (world-class-designer; Chimala)

A generation prompt is a brief to a photographer or illustrator, and its reusable part, the style stem, is written once and pasted verbatim into every prompt in the set.

- Write the stem in a fixed order: medium and era, light, palette as hex values, lens and camera angle, background, finish and texture.
- Write the per-image line: one subject, its action, and the composition with the space reserved for type.
- Phrase exclusions positively where you can ("plain #F3EDE2 background, nothing else"), then list the hard negatives once: no text, letters, logos, watermarks or UI chrome.
- Set the aspect ratio from the layout slot, not the tool's default square.
- Don't add stunning, cinematic, 8K, hyper-detailed or trending; those words pull toward the generic look.

Check: direction.md records the stem and every per-image line; every prompt in the set contains the identical stem.
Values: stem "<medium, era>, <light>, palette <hex list>, <lens, angle>, <background>, <finish>"; ratios 16:9 or 21:9 hero, 4:5 mobile hero, 4:3 or 3:2 card, 1:1 avatar.

## 19. Generate the set from a reference: Consistency (world-class-designer)

A set holds together when every frame comes from the same stem, the same reference image and, where the tool allows, the same seed.

- Generate the anchor first (usually the hero), choose it in the page, then pass it as the reference for every other frame.
- Generate two or three candidates per slot and choose in the page at real size, never from the raw grid.
- Edit by reference for variations ("same scene, warmer light, second cup removed") rather than rerolling.
- Record tool, stem, subject line, reference and seed per image so a matching frame can be made later.

Check: the imagery list shows one tool, one stem and one reference across generated frames; the line-up test in principle 4 passes.

## 20. Inspect every frame: The frame check (Chimala; studio)

Generated images fail in predictable places, so each frame is inspected at 100% and in the page at desktop and mobile widths before it is accepted.

- Look for broken anatomy (hands, teeth, eyes), pseudo-text and invented logos, bent straight lines on buildings and products, doubled objects, impossible reflections and disagreeing shadows.
- Look for the generated finish: airbrushed skin, gloss on everything, teal-and-orange grade, blurred background behind every subject, a dead-center symmetrical subject.
- Reject a flawed frame rather than hiding the flaw with a crop that ruins the composition.
- Don't accept any frame with legible-looking gibberish text; it is the fastest tell there is.

Check: zoomed crops of each image show no pseudo-text, extra fingers, bent architecture or doubled objects.

## 21. Generate only with what the host provides: Tools and honesty (Chimala; studio)

Generation happens only through a tool the host actually has or a key the user actually supplied, and generated pictures never pose as documentary evidence.

- Use built-in image generation where the host has it (Codex does); elsewhere generate only through a route the user set up, such as their own key in a gitignored `.env.agents` or the Codex CLI on their own subscription.
- Never invent, guess or hardcode a key, never write one into product code or committed files, and never stall waiting for one; switch to a sourcing brief (principle 22).
- Don't generate photoreal real people, real brands or their marks, or text-heavy images.
- Don't present generated pictures as customers, staff, offices, reviews or product results.

Check: direction.md states the route used (built-in, user key, or none); no generated image appears as a customer, team or testimonial portrait.

## 22. Specify exactly what to source when you can't generate: Sourcing brief (world-class-designer; studio)

Without generation, art direction becomes a brief precise enough that a photographer, an illustrator or the user can deliver a matching set, with placeholders holding the layout meanwhile.

- Brief each slot: job, subject, action, light, lens, crop and ratio per breakpoint, palette notes and what to avoid.
- Ask the user for their own photography once, early, naming the slots it should fill.
- Use alternatives that need no source: SVG illustration drawn for the direction, CSS grain and texture, a typographic image, live product UI.
- Hold empty slots with a sized placeholder in a palette neutral, labeled with the intended image; never a stock photo "for now".
- Don't treat gradient orbs, blurred blobs or glows as a fallback; leave the space empty instead.

Check: every image slot holds an accepted image, a direction-made SVG, live UI, or a labeled placeholder at its final ratio; no stock-pack art or cliché photo.

## 23. Fix the ratios and plan for the missing image: Image slots (Critly: real-content)

Every slot has a fixed aspect ratio, a crop rule and a plan for no image, so real uploads of any shape keep the grid intact.

- Give each slot a ratio and let images crop to it around a focal point, so a panorama and a portrait both fit.
- Plan the missing case: initials or a monogram for avatars, a tinted placeholder with the item's name for cards.
- Test uploads of every shape: panorama, square, tall portrait, tiny, broken and none.
- Don't let image height follow the file; a grid of mixed heights is the most common broken real-data screen.

Check: in the stress state (`?state=stress`) card images align at one height per row and missing images show the planned fallback, never a broken-image icon or blank gap.
Values: `aspect-ratio: 4 / 3; object-fit: cover;` with a background color standing in until load.

## 24. Budget the bytes and the arrival: Delivery (Critly: image-loading; world-class-designer)

Images are the heaviest and latest things on most pages, so each has a byte budget, reserved space and a planned way of appearing.

- Keep the hero under about 400 KB and others under about 150 KB; serve AVIF or WebP with a fallback, stop at 2x density, and size with srcset to the slot.
- Reserve every image's space with dimensions or aspect-ratio, so nothing shifts on load.
- Load the hero first and show it at once (high fetch priority, never lazy, never faded in from invisible); lazy-load below the fold behind a placeholder color, then fade in.
- Use SVG for icons, diagrams and flat illustration; keep video loops 3–6 seconds, muted, with a still poster that doubles as the reduced-motion fallback.

Check: no layout jump between early and settled screenshots. Check (code): the hero has `fetchpriority="high"` and no `loading="lazy"`; every `<img>` has dimensions; files meet the budgets.
Values: hero ≤ ~400 KB, others ≤ ~150 KB, a 5-second 720p loop ≤ ~2 MB; below-fold fade about 240ms over the image's average color.

## 25. Write alt text that does a job: Text alternatives (WCAG; studio)

Alt text conveys what the image contributes in that spot, so the same picture can need different alt text in different places, and decorative images get none.

- Describe what matters to the task: "Invoice with the overdue amount, $1,240, highlighted", not "screenshot of the app".
- Give decorative images (textures, mood images that repeat the copy) an empty alt so screen readers skip them.
- For an image inside a link or button, name the destination or action, not the picture.
- For charts and diagrams, put the takeaway in the alt and the data in nearby text or a table.
- Don't start with "image of", stuff keywords, or put essential words only inside an image.

Check: measure.json `images.missingAlt` is 0; `images.emptyAlt` matches the slots the imagery list marks decorative; the imagery list records alt text per slot.

## 26. Carry images into dark mode: Theme-aware imagery (studio)

Images made for a light page glare on a dark one, so the system says how each image behaves in the dark theme.

- Give illustrations and diagrams theme variants, or draw them on transparent grounds with ink mapped to tokens.
- Swap white-background product shots for versions on the dark surface color, or cut them out.
- Flip the inner outline to white at about 10%, and dim large photos slightly on dark surfaces.
- Don't leave bright white rectangles floating on a dark page.

Check: the dark screenshot shows no white image rectangles and no illustration whose ink vanishes into the background.
Values: photo dim on dark about `filter: brightness(0.9)`; illustration ink through `currentColor` or color tokens.

## 27. Show the work in use: Context over mockup (desengs corpus)

Work proves itself in the hands and places it was made for: a site open on a laptop someone is using, an identity printed on the team's T-shirt, a typeface on a bag, a hair clip and a wine label.

- Photograph or render the work in its real context, with a person or object that gives it scale and use.
- Let the context carry the brand (the identity on a uniform, the product in the room it was made for) instead of adding a caption to explain it.
- Keep the work legible in the frame: the screen or print large enough that its type and layout read at the displayed size.
- Don't float flat mockups, angled devices or generic coffee-cup desks where the real use can be shown.

Check: case-study and hero images show the work in use or in place with a person or real setting; the work inside the frame is readable at display size; no tilted device mockup.

## 28. Cut objects out to curate them: Cut-out collage (desengs corpus)

Objects photographed and cut from their background (props, product, sculpture) can be arranged on the page like a curator's table, which suits culture, craft and portfolio subjects that are about things.

- Cut out real objects cleanly, with a soft contact shadow or none, and place them at varied scales and positions with generous space between them.
- Mix cut-outs with one or two framed photographs, so the page has both objects and places.
- Keep the type quiet and let the objects lead: a grey name, a typewriter-set list, a paragraph statement.
- Don't cut out people or crop through objects in ways that leave halos; a ragged mask reads as clip-art.

Check: cut-out edges show no halo or fringe at 2x in the screenshot; objects keep consistent light direction and contact shadows; the composition leaves clear space around each object.
Values: contact shadow at about 10–20% opacity with a 20–40px blur under each object (studio default); the cut-out set shares one grade (principle 4).

## When these conflict

Legibility beats atmosphere: the text over an image wins over the image's drama. Honesty beats polish: a real, well-cropped screenshot beats a prettier fake. The set beats the single frame: reject a beautiful image that breaks the system. Nothing beats something generic: an empty, well-set space is better than a cliché, a blob or a stock pack. Byte budgets beat resolution above 2x. Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
