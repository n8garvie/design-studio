# 10 Intake

The goal is a brief worth designing against, references that set the bar, the right roster, and a plan the user agrees to. Never stall: ask briefly, propose defaults, and move.

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
1. **References.** Images, URLs, Figma frames or named sites, and *what they love* in each. This is the most important input; push for at least three.
2. **Anti-inspirations.** What feels tacky to them, and which competitors they don't want to resemble.
3. **Ambition dial, 1–5.** 1 is a refined convention; 5 is "ideas that sound terrible often work". Recommend 3.
4. **Constraints and must-keeps,** real content available (copy, data, images), and the anti-goal: *what must never happen?*

Use the host's question tool where it exists (see the host adapter in SKILL.md). In auto mode, skip the questions, use what the scan found plus stated defaults, and log each assumption.

## 3. References

- **Save** user images to `SESSION/references/` as `ref-01.png`, `ref-02.png` and so on.
- **URLs:** capture them as references:

  ```
  node SCRIPTS/shoot.mjs <url> --out SESSION/references/ref-0N --viewports desktop,mobile --tiles 1
  ```

  Keep the desktop top shot as `ref-0N.png` for lineups.
- **Figma:** use the host's Figma tools (`get_screenshot`) if they are available.
- **Record** each one in `references/sources.md`: source, what the user loves in it, and what to ignore.
- **No references from the user:** spawn the brand designer and the visual designer, each with a `discover` task that includes a `NOTE` asking them to "propose 3–5 named, real references in or adjacent to this category, each with the mechanism worth borrowing". Capture the ones the user accepts. In auto mode, use the overlap of the two lists.
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

Pick roles by surface type, then trim to the depth limit.

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
