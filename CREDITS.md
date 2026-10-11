# Credits

Design Studio stands on other people's thinking. Everything in `knowledge/`, `roles/` and `protocol/` is written in our own words unless this page says otherwise. Ideas are credited where they came from, and nothing paywalled is reproduced.

## Articles and people

| Source | What we took | Where |
|---|---|---|
| Adam Hayes, ["The UX Laws in My CLAUDE.md"](https://adamhayes.xyz/blog/the-ux-laws-in-my-claude-md/) (2026) | The rule shape every knowledge file uses: law named → one sentence → four imperatives. His 20 laws, much of their wording (at his invitation: "Copy it."), the 8-step implementation spine, and the conflict tiebreaker that became the top of our rulings ladder. Where we corrected a law (the 400 ms Doherty figure, the Postel attribution, disabling vs explaining, warning vs undo), the file says so. | `knowledge/ux-laws.md`, `protocol/rulings.md`, `roles/design-engineer.md` |
| Anshu Chimala, ["How to turn your AI into a world-class designer"](https://www.lennysnewsletter.com/p/how-to-turn-your-ai-into-a-world) (Lenny's Newsletter, 2026) | Discover / Define / Deliver for a team of agents; seed strings for variety; ambitious prompts; the fresh-context, screenshot-only critic scoring out of 10 with the stop bar kept out of its prompt; ranking against professional references; image generation; the cutting pass. The paywalled final section was not used. | `SKILL.md`, `protocol/40-develop.md`, `protocol/70-crit-loop.md`, `protocol/80-deliver.md` |
| Anshu Chimala, ["To get great design at half the price, give your AI an Idiot Boss"](https://anshuc.substack.com/p/to-get-great-design-at-half-the-price) | A lean orchestrator plus one strong, persistent maker; minimal maker prompts; problems, not prescriptions | `SKILL.md`, `protocol/60-build.md` |
| Sakana AI, "String Seed of Thought" | Randomness from outside the model | `scripts/seed.mjs` |
| Mika Reyes, ["8 AI design techniques"](https://mikareyes.com/ai/8-ai-design-techniques-to-break-safe-mode) | Separate visual and copy tell passes; the "coffee test" for the lines only you can write | `protocol/80-deliver.md`, `knowledge/content.md` |
| Willis Wee, ["What I learned redesigning my site"](https://williswee.substack.com/p/what-i-learned-redesigning-my-site) | Bounded loops, Keep / Improve locks, concrete criteria over "studio quality" | `SKILL.md` stop rule, `protocol/30-define.md` |
| [Vmobify](https://vmobify.com/blog/claude-code-ui-ux-plugins-skills) | One signature move; the 9-state matrix; DESIGN.md sections | `knowledge/interaction.md`, `templates/DESIGN.md` |
| Claude Academy, "A CLAUDE.md that follows" | Lean, checkable rules; name the replacement for every ban | house style |
| Gustavo Fior, [Craft](https://craft.gustavofior.com/) (MIT, per its README) and "Incremental Complexity" | Design-engineering concepts with exact values (tabular numbers, optical alignment, noise, nested radius, image outlines, hover restraint, and more); complexity that is contextual, not merely delayed | `knowledge/*` (tagged "Craft") |
| Kausthubh, [Critly](https://github.com/kausthubh-coder/craft), a fork of Craft (MIT) | Interaction and content concepts: states, focus rings, inputs, empty states, toasts, destructive actions, microcopy, real content | `knowledge/interaction.md`, `knowledge/content.md`, `knowledge/research.md`, `knowledge/imagery.md` (tagged "Critly") |
| Eric Lammertsma, [world-class-designer](https://github.com/elammertsma/world-class-designer) (MIT) | The studio critic is adapted from its design-critic agent; the AI-tells catalog, cut pass and states pass build on its references; the 3-critic median | `roles/critic.md`, `knowledge/ai-tells.md` |
| Jason Prunty, [design-director](https://github.com/j-withmission/design-director) (MIT) | Evidence on critic reliability (strong models for absolute scores, cheap models only pairwise); a written reference brief instead of photo moodboards; rules tallied apart from the score; fixed and open axes; the divergence check | `protocol/20-discover.md`, `protocol/40-develop.md`, `protocol/90-overnight.md` |
| José Nogueira, [design-director](https://github.com/jose-nogueira1/design-director) (MIT) | The intake interview: feeling words, anti-inspirations, the ambition dial, never asking what you can find yourself | `protocol/10-intake.md` |
| Zachary Landes, [design-craft](https://github.com/zachlandes/skills) (MIT) | Context hygiene for critics, the cut-only reviewer, copy handback | `protocol/80-deliver.md`, `roles/_contracts.md` |
| keysjoao, [laws-of-ux-skills](https://github.com/keysjoao/laws-of-ux-skills) (MIT) | Routing laws by surface type (structure only) | `knowledge/ux-laws.md` |
| nexu-io, [open-design `craft/`](https://github.com/nexu-io/open-design) (Apache-2.0) | Ideas only: folklore busts and dark-pattern guards for UX laws, state coverage and loading thresholds, anti-slop specifics | `knowledge/*` |
| Anthropic, [frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache-2.0) | Grounding the design in its subject; the named default looks; plan → review against the brief → build → critique; "spend boldness in one place"; writing rules | `knowledge/ai-tells.md`, `knowledge/brand.md`, `knowledge/content.md` |
| [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT) | Semantic token pairs, OKLCH theming, a radius scale; the rules-file structure of its skill | `knowledge/visual-systems.md` |
| Maxwell Barvian, [NumberFlow](https://number-flow.barvian.me/) (MIT) | Motion that carries meaning, timing channels, reduced motion by default | `knowledge/motion-sound.md` |
| [Remotion](https://www.remotion.dev/docs/ai/skills) | How skills are packaged and routed | repo structure |
| Josh Puckett and Adam Michela, [Graphical](https://www.graphicalui.com/) | One design-language file per product; design-language axes; finding and fixing inconsistent styles | `templates/DESIGN.md`, `knowledge/visual-systems.md` |
| [desengs.com](https://desengs.com/) and its [inspiration](https://desengs.com/inspiration/) collection | Taste principles distilled from the collection, and the reference index | `knowledge/inspiration.md`, `sources/` |
| [designengineer.tools](https://designengineer.tools/) | The design engineer's toolbox | `knowledge/design-engineering.md`, `sources/` |

## Books

These are distilled as principles in our own words. No text is reproduced.

| Book | Used for |
|---|---|
| Adam Wathan and Steve Schoger, *Refactoring UI* | Hierarchy, spacing, color, depth |
| Josef Müller-Brockmann, *Grid Systems in Graphic Design* | Grids, rhythm |
| Robert Bringhurst, *The Elements of Typographic Style* | Typography |
| Josef Albers, *Interaction of Color* | Relative color |
| Alan Cooper, Robert Reimann, David Cronin and Christopher Noessel, *About Face* | Goals, postures, idioms |
| Jenifer Tidwell, Charles Brewer and Aynne Valencia, *Designing Interfaces* | Patterns |
| Dan Saffer, *Microinteractions* | Trigger, rules, feedback, loops |
| Jeff Johnson, *Designing with the Mind in Mind* | Perception and cognition |
| Jon Yablonski, *Laws of UX* | The laws beyond Hayes's 20 |
| Don Norman, *The Design of Everyday Things* and *Emotional Design* | Affordances, signifiers, errors; visceral, behavioural and reflective design |
| Edward Tufte, *The Visual Display of Quantitative Information* and *Envisioning Information* | Data display |
| Louis Rosenfeld, Peter Morville and Jorge Arango, *Information Architecture* | Organisation, labelling, navigation |
| Aarron Walter, *Designing for Emotion* | Personality, delight |
| Alina Wheeler, *Designing Brand Identity* | Identity systems |
| Marty Neumeier, *The Brand Gap* and *Zag* | Differentiation |
| Byron Sharp, *How Brands Grow* | Distinctive brand assets |
| Adam Connor and Aaron Irizarry, *Discussing Design* | Critique practice |
| Jakob Nielsen (usability heuristics); Wharton, Rieman, Lewis and Polson (cognitive walkthrough); Steve Krug, *Don't Make Me Think* (trunk test); Card, Moran and Newell (keystroke-level model); Microsoft Inclusive Design (persona spectrum); Jeff Gothelf, *Lean UX* (assumptions) | Research methods in `knowledge/research.md` |

If we've missed a credit, or credited something wrongly, please open an issue.
