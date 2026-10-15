# 10 Intake

The goal is a brief worth designing against, references that set the bar, the right roster, and a plan the user agrees to. Never stall: ask briefly, propose defaults, and move.

You arrive here only after the reference gate in SKILL.md is open: the user has named at least one reference. Intake never skips it and never replaces it with your own picks.

## 1. Look before you ask

Never ask a question you can answer yourself. Scan the project, then tell the user what you found.
- **Stack:** `package.json` (framework, Tailwind, shadcn via `components.json`), CSS files with custom properties, the Tailwind theme, font imports.
- **Design language already present:** `DESIGN.md`, `GUI.md`, brand folders, logos, existing tokens, existing components.
- **The target:** the screen, route or file to redesign, and whether a dev server is running or can be started.
- **Redesign:** if one is running, capture the current state now:

  ```
  node SCRIPTS/shoot.mjs <url|file> --out SESSION/discover/current --measure
  ```

## 2. Ask: at most two rounds of at most four questions

**Round 1, the idea:**
1. What is it, and what is the one thing someone must understand or do here?
2. Who is it for: their sophistication, how often they come, and their state of mind (rushed, anxious, expert, curious)?
3. Three feeling words, in their own words. These feed the emotion designer.
4. Where does the work go: an HTML prototype in the session, or the real codebase (which files)?

**Round 2, taste:**
1. **More references,** if the gate brought fewer than three, and *what they love* in each. This is the most important input.
2. **Anti-inspirations.** What feels tacky to them, and which competitors they don't want to resemble.
3. **Ambition dial, 1–5.** 1 is a refined convention; 5 is "ideas that sound terrible often work". Recommend 3.
4. **Constraints and must-keeps,** real content available (copy, data, images), and the anti-goal: *what must never happen?*

Use the host's question tool where it exists (see the host adapter in SKILL.md). In auto mode, skip these questions, use what the scan found plus stated defaults, and log each assumption. Auto never skips the reference gate.

## 3. References

- **Collect every reference with one command.** Pass each source the user gave, with what they love in it:

  ```
  node SCRIPTS/refs.mjs add --session SESSION --note "<what they love>" <source> [<source>...]
  ```

  It works out what each source is and records it in `references/index.json` and `references/sources.md`:
  - **an image file, image URL or folder of images:** copied. GIF, AVIF and SVG are rendered to PNG.
  - **a website or local page:** captured on desktop and mobile in `references/ref-NN/`.
  - **a mood board or gallery** (Cosmos, Are.na, a1.gallery, sections.wtf, recent.design, before.click, Godly, Savee, Pinterest and similar): every tile saved in `references/boards/<board>/` as its own image, with its caption and link, plus `sheet.png`, a numbered contact sheet of the whole board. `--max` caps the tiles (default 24). Use `--as board` for a gallery the script doesn't recognise.
  - **a video** (a screen recording, or a board's share export such as Cosmos's): its distinct frames as tiles, loops and holds collapsed, plus `sheet.png`. It needs ffmpeg. A share export shows only the items in its reel, cropped and under the platform's overlays. Read the work and ignore the overlay, and if the user wants the whole board, ask for it public or exported as images.
  - **a social post** (Threads, X, Instagram, Bluesky, LinkedIn): its images, plus the sites its text names. Those sites are listed, not captured. Ask the user which to add, then `add` those.
- **A board that won't open** (exit 2): a private Cosmos board, a login wall, or a site that kept failing. Tell the user exactly that, and ask them to make the board public or export its images to a folder. Never substitute your own picks.
- **Pick the anchors.** Boards are for reading, not lineups. Open each board's `sheet.png`, choose the 3–5 tiles that best match what the user said they love and the brief, and copy them up:

  ```
  node SCRIPTS/refs.mjs pick --session SESSION boards/<board>/03.webp boards/<board>/11.png ...
  ```

  The jurors' blind lineup ranks our work against these anchors, plus any single images and captured sites. Show the anchors at Checkpoint A; in auto, log them in `decisions.md` as an assumption.
- **Figma:** use the host's Figma tools (`get_screenshot`) if they are available, then `add` the saved image.
- **Fill in sources.md:** replace each `loves: TODO` with what the user loves in it, and add what to ignore.
- **Gate check:** once every reference is saved or captured, run `node SCRIPTS/session.mjs refs --session SESSION`. Don't continue until it exits 0. If a URL won't capture, ask the user for a screenshot of it.
- **The user wants help finding more:** after the gate, you may spawn the brand designer and the visual designer, each with a `discover` task whose `NOTE` asks them to "propose 3–5 named, real references in or adjacent to this category, each with the mechanism worth borrowing". Add only the ones the user accepts.
- **Calibration:** for a surface that must live inside a host app or a dense professional tool, include one real comparable screen as a calibration reference. Then the bar is "beat the best real example", not an abstract 9.

## 4. Brief

Write `SESSION/brief.md` from `KB/templates/brief.md`, in 25 lines or fewer:
- what it is and the one job
- who it is for
- the emotional target (three words, first three seconds)
- a draft aesthetic statement (finalised in Develop)
- constraints and must-keeps
- the anti-goal
- the ambition level
- the target output
- the reference list
- success criteria

## 5. Roster

Pick roles by surface type, then trim to the depth limit. This list decides who pitches and writes specs. It does not limit critique: every core role critiques every round (see SKILL.md, "Every role gives feedback").

| Surface | Core roles, in priority order | Guests to consider |
|---|---|---|
| Marketing or landing page | brand, visual, content, typographer, emotion, product | art-director |
| Product screen or app UI | interaction, visual, content, typographer, product, emotion | ux-researcher |
| Dashboard or data-dense tool | interaction, visual, typographer, content, product | ux-researcher |
| Onboarding, checkout or multi-step flow | interaction, content, product, emotion, visual, typographer | ux-researcher |
| Component or design system | visual, typographer, interaction | motion-designer |
| Brand surface or identity moment | brand, visual, typographer, emotion | art-director, motion-designer |
| Motion-led moment | interaction, emotion, visual | motion-designer |

## 6. Checkpoint A

Show the user:
- the brief summary
- the references, with what we'll take from each
- the roster
- the depth
- the estimated spawns
- the profile
- the target output

Ask them to confirm or adjust. Then write `state.md` (phase: discover) and move on.
