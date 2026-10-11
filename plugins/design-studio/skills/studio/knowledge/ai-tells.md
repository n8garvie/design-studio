# AI tells: patterns that read as generated

> Used by: every critic, in `crit`, `panel`, `cut` and `tells` tasks. **Not read by the design engineer while building**, because naming the patterns primes them. Distilled from: Anthropic's frontend-design skill (Apache-2.0), world-class-designer by Eric Lammertsma (MIT), Anshu Chimala's techniques via Lenny's Newsletter, Mika Reyes, Vmobify, open-design (Apache-2.0, ideas only), and the studio's own practice. Written in our own words; see CREDITS.md.

A tell is a default, not a choice: it shows up whatever the subject is.
- **Any one tell is survivable. Three together are a verdict.** The page reads as generated, and "competent generic" (3–4) is its ceiling.
- **Every trait here is legitimate when the brief asks for it.** The brief's own words always win. Where the brief leaves an axis open, don't spend that freedom on a default.
- **Fixing a tell means removing it or replacing it with a decision.** Decorating around it doesn't count: a purple gradient with a noise overlay is still a purple gradient.

How to report one: `tell | where | smallest fix`. The smallest fix is usually a deletion.

## 1. The five default looks

Each of these is a whole look, not a single detail. If one turns up without the brief asking for it, it's a direction problem, not a polish problem.

1. **Warm editorial default.** A cream background (around `#F4F1EA`), a high-contrast serif display face, and a terracotta or clay accent (around `#D97757`).
   - *Replace with:* a palette drawn from the subject's own materials and era.
2. **Near-black with one acid accent.** A `#0B0B0B`/`#111` background with a single acid-green or vermilion highlight.
   - *Replace with:* matte darks lit from one source, and the accent used only where the user acts.
3. **Broadsheet costume.** Hairline rules, zero radius and dense newspaper columns on a subject with nothing editorial about it.
   - *Replace with:* the layout logic the content actually has.
4. **The SaaS-card kit.** Content chopped into identical rounded cards, one radius everywhere, the same soft `rgba(0,0,0,.1)` shadow under each, and gradient washes as decoration.
   - *Replace with:* hierarchy from type and spacing, cards only for real objects, and a radius and shadow recipe that varies with elevation.
5. **Template chrome.** It appears whatever the subject:
   - a tracked-out ALL-CAPS eyebrow above every heading
   - `A · B · C` meta strings
   - `WORD — fragment` labels
   - a monospace face for small data labels
   - `→` appended to every link

   *Replace with:* structure that encodes information. Use labels only when they carry information, and numbered markers only for real sequences.

## 2. Layout and composition

| Tell | Replace with |
|---|---|
| Hero with text left, graphic right, vertically centred, two equal buttons | The subject's most characteristic thing, in the form that suits it: a real image, the product itself, a typographic hero, a live demo. One primary action. |
| "Big number, small label, supporting stats, gradient accent" as the default hero | Use it only when the number really is the story |
| Three identical feature cards, each with an icon in a tinted circle | One strong idea per section with real imagery, an annotated product shot, a dense comparison table, or a list. Vary the rhythm between sections. |
| Every section built the same way: eyebrow, centred heading, grey subtitle, grid | Give each section the composition its content needs, and drop the eyebrows |
| Everything centred | One alignment logic, held. Left-aligned text reads faster and looks considered. |
| Uniform padding, uniform card sizes, uniform radius | A spacing scale with contrast (tight inside groups, generous between them), and one element allowed to be big |
| The canonical landing stack: hero, logos, three features, how it works, testimonials, pricing, FAQ, CTA | Order sections by what the audience needs to believe, and cut what doesn't earn belief |
| Always three items, or always four | As many as there really are |
| Symmetry everywhere, perfectly even whitespace | One deliberate asymmetric or surprising moment per screen (the signature move), with a reason |
| Decorative dividers, alternating background stripes, wave section edges | Separate sections with spacing, type scale and imagery |
| Mobile as a squashed desktop (columns stacked forever) | A designed mobile composition: what leads, what collapses, what scrolls sideways, what disappears |

## 3. Color

| Tell | Replace with |
|---|---|
| Purple, indigo, violet or blue-to-purple gradients as the brand (Tailwind `indigo-500` `#6366F1`, `violet-500` `#8B5CF6`, `purple-600` `#9333EA` straight from the box) | A palette chosen from the direction's material and era, committed to one accent |
| Gradient text | Solid ink. Emphasis comes from scale and weight. |
| Glows, blobs, halos, floating orbs filling space | Remove them. Space is allowed to be empty. |
| Glassmorphism cards with nothing worth blurring behind them | Real surfaces with real edges, or no cards at all |
| Neon accents, glowing borders, "cyber" grids on dark mode | Matte darks; surfaces get lighter as they rise; accents at low saturation except where action lives |
| Three or more accent colors competing; pastel rainbow categories | One accent, at most about two visible uses per screen. Categories are told apart by shape and label, not only by hue. |
| Grey text on a colored background | Text in a tint or shade of the background's own hue |
| Shadows with no logic for where the light comes from | One light source, from above. Layered, low-opacity shadows whose strength varies with elevation. |

## 4. Typography

| Tell | Replace with |
|---|---|
| Inter, Roboto, Poppins or the framework default for everything, chosen by nobody | A type system chosen for the direction: a real display face plus a real text face, or one exceptional family across a large scale |
| Huge bold heading, grey subtitle, repeated in every section | A scale with a reason (a modular ratio or an editorial hierarchy) and varied roles |
| Accenting a single word in a headline (color, italic, underline swash) | A whole-line hierarchy. Accent only when the word carries the meaning. |
| Wide tracking on everything, or negative tracking on body text | Tight tracking only on large display sizes, default tracking on body, open tracking on small caps and labels |
| Long lines, centred paragraphs, a lonely last word | A measure of 45–75 characters, left-aligned, with `text-wrap: balance` on headings and `pretty` on paragraphs |
| Too many sizes and weights (10+ distinct sizes) | 5–7 sizes with clear jumps between them |
| Emoji as icons or bullets; sparkle, rocket, lightning and "magic" icons | One icon family at one weight, or no icons |

## 5. Copy

| Tell | Replace with |
|---|---|
| "Seamless", "effortless", "unlock", "elevate", "supercharge", "empower", "revolutionize", "next-generation", "all-in-one", "delve" | The specific thing the product does, in the user's words. If a word could describe any product, cut it. |
| "It's not X, it's Y"; tricolons ("faster, smarter, better"); "Whether you're a … or a …"; punchy negation lists ("No X. No Y. No Z.") | One claim per sentence, with concrete nouns |
| Throat-clearing openers, rhetorical questions as headings, exclamation marks, em-dash flourishes, perfectly even sentence rhythm | Statements. Vary the length. Use periods. |
| Invented proof: "Trusted by 10,000+ teams", "99.9% uptime", "4.9★", logos of non-customers, stock-photo testimonials | Real proof, or none. An empty spot is honest; an invented one is a tell and a liability. |
| Every button says "Get started"; "Get started" next to "Learn more" with no third idea | Buttons that say what happens: "Open the demo", "Download for Mac", "Ask for a quote" |
| Placeholder text, lorem ipsum, AI-written filler kept as final copy | Real copy. Where only the user can write it, mark it `TODO(user)`. |
| Labels that repeat the content ("Features" above the features), subtitles that restate the heading, captions describing the image | Delete them |
| "Please", "simply", "just", "in order to", "oops", "invalid" | Cut. Errors say what happened and how to fix it. |

## 6. Components and interaction

| Tell | Replace with |
|---|---|
| Pill badges above headings ("NEW", "AI-POWERED", with a sparkle) | Remove them |
| Hover-lift and scale on every card | Hover only on interactive elements, revealing information or changing color, inside `@media (hover: hover)` |
| `transition: all` everywhere | Transitions on specific properties, ease-out, short |
| Custom checkboxes, selects, scrollbars and tooltips that work worse than native ones | Native controls styled with `accent-color` and `color-scheme`. Go custom only when it is genuinely better. |
| Toggles for things that aren't on/off; tabs for two items; accordions hiding the important content | The simplest control that fits |
| Avatar stacks, "online" dots, notification badges as decoration | Remove them unless they're real |
| Floating chat bubbles, sticky CTAs everywhere | One clear path to the action |
| Spinner in a void; grey skeletons that don't match the layout | Loading shaped like the content it precedes |
| "No data" empty states; a red wall for errors | An empty state in the product's voice with one next action, and errors that say what happened and what to do |

## 7. Imagery

| Tell | Replace with |
|---|---|
| Abstract 3D blobs, glassy spheres, floating cubes, gradient meshes | Imagery that shows the product or the world of the direction, generated as a set with a style prompt or rendered by the page |
| Isometric people-at-desks packs, flat corporate figures | One illustration style of your own, or photography, or none |
| Screenshots in device frames at a jaunty angle with a drop shadow | The real screenshot, cropped with intent, at true scale |
| Stock photos of diverse teams high-fiving | Product, objects, environments, or type |
| Images that don't match each other (different renderers, light or palette) | A set made with a shared style prompt and reference |
| Gradients and shapes standing in for imagery | If a gradient could replace the image, the image isn't doing a job. Make one that does. |

## 8. Motion

| Tell | Replace with |
|---|---|
| Fade-and-slide-up on every section, in sequence, forever | One orchestrated moment tied to the direction. Most content simply appears. |
| Hover transitions on every card | Instant hover on frequent elements. Motion only where it shows what changed. |
| Bouncy overshoot on a serious product; linear easing on a playful one | Easing that matches the material |
| Animated gradient backgrounds, floating particles, parallax everywhere | Remove them, or keep one and make it excellent |
| Content invisible until a script animates it in | Entrances that fail visible: content is there without JS or motion |
| Ignoring `prefers-reduced-motion` | A reduced-motion alternative that keeps the meaning |

## How to run a tells pass

1. Run the cut pass first (see `_contracts.md`, task `cut`). Many tells disappear with it.
2. Run visual tells and copy tells as separate passes, so you can see what each one changed.
3. When a pattern repeats across the page, handle it as one decision: every instance, one alternative, applied consistently.
4. List each tell as `tell | where | smallest fix`. Never fix one by adding something.

## When these conflict

A tell list is a prompt for judgment, not a ban list. When the brief explicitly asks for one of these looks, the brief wins (rung 2). If you can't tell whether something is a tell or a choice, ask whether it would appear whatever the subject was. If it would, it's a tell. Then defer to the studio ladder:
1. Accessibility and legibility floor
2. Explicit user decisions
3. Clarity
4. User control
5. Task completion
6. System consistency
7. Brand distinctiveness
8. Delight
