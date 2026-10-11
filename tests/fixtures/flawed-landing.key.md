# Answer key: examples/flawed-landing

The answer key for `examples/flawed-landing/index.html` ("Tempo — a focus timer for teams"). It stays out of `examples/` so critics never see it.

Use it to grade a crit run: a good studio finds every blocker, most majors, and attributes each one to its owning role. The severity column applies the studio's own rules (`roles/_contracts.md`): anything that breaks the accessibility floor in `protocol/80-deliver.md` is a blocker. "Also fine" lists the severities a reasonable critic might pick instead.

Detection: **S** means visible in screenshots at 1440 and 390 wide. **M** names the `measure.json` field (from `shoot.mjs --measure`) that should flag it.

## Planted flaws

| # | Flaw | Where | Detect | Owner (also) | Severity | Also fine |
|---|---|---|---|---|---|---|
| 1 | Purple-to-indigo gradient hero, gradient text on the H1, text left and an abstract blob right | hero | S | visual-designer (brand-designer) | major | blocker |
| 2 | "✨ NEW" eyebrow pill in caps above the H1; every section repeats eyebrow label + centered heading + gray subtitle | hero, every section header | S; M `type.uppercaseBlocks` | brand-designer (visual-designer, typographer) | major | minor |
| 3 | Low-contrast text: `#9ca3af` on white (2.53:1) for section subtitles, card body, the long paragraph and "No plans"; also on the stats tint (2.36:1) and faded further in the logo strip (2.05:1) | all section subtitles and body | S; M `contrast.failures` (about 25 per viewport) | visual-designer (interaction-designer: accessibility floor) | blocker | major |
| 4 | Three identical feature cards, each an icon in a tinted circle + title + gray text | Features | S | visual-designer (content-strategist) | major | minor |
| 5 | "Get started" used 3 times (nav, hero, CTA band) plus "Learn more"; the hero's two buttons are equally loud (white solid and dark-indigo solid, same size) | nav, hero, CTA band | S; M `ctas` | interaction-designer (content-strategist) | major | minor |
| 6 | Invented social proof: "Trusted by 10,000+ teams", "4.9★" twice, generic logos (Acme Corp, Globex, Initech, Umbrella, Hooli, Vandelay), a stock testimonial from "Sarah Johnson, VP of Operations, TechCorp" | logo strip, hero rating, stats, testimonial | S | content-strategist (emotion-designer: trust; product-strategist) | major | blocker |
| 7 | Filler copy: "supercharge", "seamless", "unlock", "elevate", "effortlessly", "game-changer", "fast-paced digital landscape" | hero, every section, footer | S | content-strategist (brand-designer) | major | minor |
| 8 | Long measure: the "Why Tempo" paragraph runs about 120 characters per line at 1440 (desktop only; at 390 it is about 40) | Why Tempo | S at 1440; M `measure.offenders` | typographer | major | minor |
| 9 | Too many type sizes: 15 distinct sizes at 1440 (11–60px), 13 at 390 | whole page | M `type.distinctSizes` | typographer | minor | major |
| 10 | Inconsistent radii: 4 (empty state), 6 (toggle buttons), 8 (buttons, toggle), 10 (logo mark), 12 (stats, testimonial), 16 (cards), 24 (glass card, CTA band), plus pills and circles (8 distinct) | whole page | S; M `craft.distinctRadii` | visual-designer | minor | polish |
| 11 | Social icon links are 16×16px tap targets 6px apart, so they also fail the WCAG 2.5.8 spacing exception | footer bottom row | S; M `targets.under24Items` (`spaced: false`), `targets.under44` on mobile | interaction-designer | blocker | major |
| 12 | `*:focus { outline: none; }` with no replacement focus style | global CSS | M `a11y.focusVisibleRule` false, `a11y.outlineNoneCount` | interaction-designer (design-engineer) | blocker | major |
| 13 | No `prefers-reduced-motion` rule; fade-up animation on every section, an infinite floating blob and a pulsing dot | every section, hero | M `a11y.reducedMotionRule` false | interaction-designer (motion-designer) | blocker | major |
| 14 | Stats strip numbers (10,000+ · 2,500,000 · 98.6%) and the 18:42 timer lack tabular numerals | stats strip, hero glass card | S; M `craft.numericWithoutTabular` | typographer | minor | polish |
| 15 | The hero blob is an `<img>` (data-URI SVG) with no `alt` | hero | M `images.missingAlt` | interaction-designer (art-director) | major | blocker |
| 16 | Heading outline skips a level: h1 → h3 (section headings) → h4 (cards) → h5 (footer); there is no h2 | whole page | M `headings.skippedLevels` | interaction-designer (content-strategist) | blocker | major |
| 17 | Footer uses 5+ accent colors: violet, pink, amber and emerald column headings, a green status line, and sky, blue and red social icons | footer | S | visual-designer (brand-designer) | minor | major |
| 18 | Pricing's empty state is just "No plans" in a dashed box, and every "Get started" links to it, a dead end on the conversion path | Pricing | S | interaction-designer (content-strategist, product-strategist) | blocker | major |

Blockers: 3, 11, 12, 13, 16, 18. Majors: 1, 2, 4, 5, 6, 7, 8, 15. Minors: 9, 10, 14, 17.

## Present but not planted (valid findings; don't penalize)

- The mobile menu button (hamburger) has no behavior, so nav links are unreachable at 390.
- Feature cards lift on hover but aren't links (a false affordance).
- `transition: all` on links, buttons, cards and social icons (M `craft.transitionAllCount`).
- More contrast failures beyond #3: the testimonial's amber stars on white (1.66:1), white initials on the pink avatar, and the CTA band's lavender eyebrow (about 3.3:1 at 13px).
- Footer column links are about 17px tall; they pass only through the WCAG spacing exception.
- Three primary-looking solid buttons in the first viewport (M `ctas.primaryLikeCount`) and 18 distinct text colors.
- The sticky translucent nav and the glass card are further generic-SaaS tells.
- The emotional arc is flat: no product truth, no real screens of the timer, no specific team or workflow.

## Scoring a run

- **Recall:** count planted flaws reported at any severity by any role or panel critic (consensus or not). Expect at least 15 of 18 for a standard-depth run with `--measure`.
- **Severity:** a flaw counts as correctly rated if the reported severity is in "Severity" or "Also fine".
- **Ownership:** the owner or an "also" role should raise it; the ledger's consensus should include #3 and #18.
- **Panel score:** an honest studio panel should score this page 3–5 out of 10.
