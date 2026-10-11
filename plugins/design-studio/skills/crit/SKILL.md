---
name: crit
description: Design critique from the Design Studio team. Role critics (visual, typography, content, interaction, product, brand, emotion) and fresh screenshot-only panel critics review a page, screen, prototype, URL or screenshots, rank it blind against your visual references, challenge each other's findings, and return a ranked fix list against a studio-grade bar. Use when the user asks the design studio or a design team to critique or review a design, or asks why a design looks generic or how it compares to references. Spawns subagents. To design or iterate until it is great, use the studio skill.
argument-hint: "[path, URL or screenshots] [quick|standard|deep] [refs: paths or URLs]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/../studio/scripts/*)
license: MIT
metadata:
  short-description: Studio critique with a ranked fix list
---

# Design Studio: critique

Run the Design Studio in **crit mode**.

1. Read the studio skill at `../studio/SKILL.md`, relative to this file. In Claude Code that is `${CLAUDE_SKILL_DIR}/../studio/SKILL.md`; if that text appears unexpanded, use the folder next to this one. Follow it with **mode = crit** and the user's request as the target. Everywhere it says SKILL_DIR or SCRIPTS, it means that `studio` folder and its `scripts/`.
2. Crit mode runs a light intake, then a reference read (if the user gave references), then **one** crit round:
   - capture
   - role critics, the scoring panel, and a blind lineup against the references
   - tally
   - cross-critique on conflicts
   - rulings
3. Report. You don't apply fixes unless the user then asks you to continue in make mode.

If the user gave only screenshots, critique those. Note in the report that measurements weren't available.
