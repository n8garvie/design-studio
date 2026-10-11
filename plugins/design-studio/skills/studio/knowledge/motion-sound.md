# Motion and sound

> Used by: interaction designer (behavior), emotion designer (feel), design engineer; motion designer (guest, owns motion tokens and choreography when invited). Distilled from: Craft (Gustavo Fior: hover restraint, novelty budget, the Craft video's timeline), Critly (Kausthubh's completed and extended Craft concepts: easings, springs, button press, interruptibility, exit animations, scale entrances, stagger, shared layout, liquid motion, clip-path, icon morph, momentum, living charts, smooth animation, reduced motion, product feel, interface SFX, layering sounds), NumberFlow (Maxwell Barvian), Anthropic's frontend-design skill, world-class-designer (Lammertsma), Anshu Chimala (Lenny's Newsletter, technique 5), Remotion. Written in our own words; see CREDITS.md.

Motion is behavior first and feel second: the interaction designer owns when something moves and whether it explains a change, the emotion designer owns how it feels. Values are defaults to beat, not ceilings; most come from Critly's demos and are studio defaults unless a product reference says otherwise. Screenshots cannot show motion, so many checks read the motion table in direction.md, the system sheet's replayable motion section, or the code. Never apply mechanically: a launcher and a celebration screen want opposite answers from the same rule.

## 1. Move only to show what changed: Motion answers the user (frontend-design)

Motion earns its place when it answers a person's action (opening, expanding, confirming, reordering) and shows where something came from or went.

- Name the change each animation explains before you design it: origin, destination, cause.
- Animate non-user-triggered things only to draw needed attention (a new message, a finished job), never to fill silence or signal "premium".
- Prefer no animation to decorative animation; content that simply appears is a valid, often better, choice.
- Don't animate to teach a complex system; a clear static diagram teaches better and is remembered longer.

Check: every row of the motion table in direction.md names the change it explains; the system sheet has no animation without a stated trigger.

## 2. Spend motion on one orchestrated moment, and fail visible: One moment beats scattered effects (frontend-design; world-class-designer)

A single page-load sequence or one reveal tied to the signature move lands; fade-and-slide-up on every section and hover transitions on every card read as AI-generated.

- Choose one moment per page or flow for authored motion; everything else appears or answers input.
- Replace scroll-triggered fade-ups with content that is simply there, and give the one moment a reason rooted in the direction.
- Make entrances fail visible: content must be fully visible if the script, the observer or the animation never runs (a staggered hero that waited on mount once shipped at opacity 0).
- Don't gate reading or clicking on an entrance finishing.

Check: the full-page screenshot captured without scrolling shows every section's content; any blank band where content should be is a blocker. Count scroll-triggered entrances in the motion table: one sequence per page at most.

## 3. Spend novelty by frequency: Novelty budget (Craft; Critly: novelty budget)

Keep about 90% of the experience familiar and spend the 10% where it lands: the rarer the moment, the more expressive it can be.

- Spend nothing on constant actions (hover, tab switches, checking a box), a short quiet transition on occasional ones (opening a dialog, sending), and the budget on rare ones (finishing onboarding, clearing the inbox, a yearly recap).
- Play once-only moments once: a welcome sequence never replays on reload.
- Count the cost: a 300ms transition seen 200 times a day is about six hours of waiting a year.
- Don't spend the budget on novel interaction patterns casually; people must learn those before they can use them.

Check: the motion table marks each pattern's frequency (constant, occasional, rare) and only rare rows carry expressive motion (overshoot, sequence, sound).
Values: constant 0ms; occasional 150–250ms; rare up to 600ms with sequence or spring.

## 4. Set the pace from the product's feel: Pace (Critly: product feel)

Pace is one of three feel dials (density, pace, tone) and must agree with the others; a bland product is forgettable, a mismatched one feels broken.

- All-day tools: instant, 150ms with a strong ease-out, little else.
- Calm apps visited a few times a day (banking, reading, journaling): unhurried, about 300ms with a gentler curve.
- Playful apps people choose to open: springs that overshoot, saved for the moments that matter.
- Don't put playful timing on a dense table people sort fifty times a day.

Check: direction.md states the pace dial and every duration in the motion table falls in its band; a sovereign product with sorts or filters over 200ms fails.

## 5. Use two or three curves everywhere: Easing tokens (Critly: easings; studio)

Easing decides whether something opened for you or at you, and a consistent set of curves does more for cohesion than any single animation.

- Use a strong ease-out for anything that appears or responds because the user acted; it moves at once and spends the rest settling.
- Use an in-out curve for things already on screen moving to a new place, and ease-in only for exits.
- Use linear only for progress, time and hold-to-confirm fills.
- Replace the browser's `ease` and `ease-out` keywords; they are too gentle and make the same duration feel slow.

Check: the system sheet lists exactly two or three easing tokens with replay; Check (code): no raw `ease`, `ease-in-out` keywords or `transition: all` in components.
Values: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (at 60ms of 250ms it covers 76% versus 36% for `ease-out`); `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` (studio default); `--ease-exit: ease-in`.

## 6. Keep a short duration scale: Duration tokens (studio)

Durations come from a handful of named steps tied to what moves, not from per-component guesses.

- Scale duration with distance and size: small controls fastest, panels slower, cross-screen slowest.
- Run exits at about half their entrance; run touch layouts 20–30% shorter than desktop, since distances are shorter.
- Keep feedback micro-interactions under 500ms; anything longer is watched, not used.
- Don't let a frequent interaction exceed 200ms, however good it looks the first time.

Check: every duration in the motion table and system sheet is a token from the scale; Check (code): no literal millisecond values outside the token file.
Values: `--dur-0: 0ms` (hover, palette, keyboard toggles), `--dur-1: 100ms` (press), `--dur-2: 150ms` (state change, reduced-motion fades), `--dur-3: 200ms` (menus, popovers), `--dur-4: 300ms` (sheets, panels, shared layout), `--dur-5: 450ms` (cross-screen), `--dur-data: 900ms` (chart tweens).

## 7. Name a few springs and start at bounce zero: Springs (Critly: springs)

A spring has no clock; describe it by duration and bounce, and add bounce only when a gesture gave the motion energy.

- Name three or four springs and use only those: fast for small controls, default for panels and sheets, one playful spring for celebrations and thrown things.
- Start every spring at bounce 0 (critically damped); add bounce when a swipe or throw gave momentum, never on a tap-opened sheet.
- Never bounce exits, opacity or color; opacity can't overshoot 1, so the bounce becomes a stall.
- Never wait for a spring to settle before letting people act; it rests well after it looks finished.

Check: the motion table lists named springs only; no bounce appears on exits or tap-triggered opens.
Values: fast 0.25s bounce 0; default 0.4s bounce 0; playful 0.5s bounce 0.3; bounce 0.15 overshoots 0.6% (invisible), 0.3 overshoots 4.6%, 0.4 overshoots 9.5% (the ceiling); a 0.5s spring rests at about 740ms.

## 8. Make frequent interactions instant: Hover restraint (Craft: hover restraint; Critly)

The more often something happens, the less animation it can afford, and hover happens most of all.

- Switch hover highlights on with no transition; change color, never size, and never lift or scale cards on hover.
- Delay the first tooltip, then show neighbors at once; delay heavier hover-opens (preview cards) until the pointer rests, and close them after a short grace period.
- Don't animate keyboard-triggered panels; the person pressing a shortcut already knows what it does.
- Decide by frequency and intent, not by device: a once-a-session modal may animate, a panel flipped forty times a day may not.

Check: hover screenshots show color change only, with no change in element size or position; Check (code): no transition on hover backgrounds, no `translateY` hover lift.
Values: hover 0ms; first tooltip 400–700ms, neighbors 0ms; preview cards 500–700ms rest; no hover-opens on touch.

## 9. Press down a little: Button press (Critly: button press)

Scaling a pressed control slightly tells people the click landed before anything else happens.

- Scale buttons to 0.97 while pressed and return on release.
- Scale larger surfaces less, since the same ratio moves their edges further.
- Keep the press near 100ms so it lands before a quick click ends.
- Transition `transform` only, never `all`, so press timing never leaks into hover color.

Check: the system sheet's active state shows the press scale on every pressable component; Check (code): press transitions name `transform` only.
Values: `scale(0.97)` over 100ms ease-out; 0.98–0.99 on cards and tiles wider than about 300px; below 0.92 reads as an effect.

## 10. Animate toward a target, never replay a clip: Interruptibility (Critly: interruptibility)

People change their minds mid-animation, so anything that can be triggered again before it finishes must turn around from where it is.

- Use transitions (or springs) for toggles, sheets, menus and anything re-triggerable; they retarget from the current value.
- Keep keyframes for one-shots nothing interrupts: a spinner, a wrong-password shake.
- Prefer springs for things people flick back and forth (switches, drawers, drag handles); they carry velocity through a reversal.
- Watch for keyframes hidden in utility classes ("animate-in" and "animate-out" are clips).

Check (code): open and close each overlay ten times as fast as possible; nothing flashes, jumps or finishes the old animation first.

## 11. Leave faster and quieter than you came: Exit animations (Critly: exit animations)

An entrance has a job, showing where something came from; an exit has none, because the person has already moved on.

- Run exits at about half the entrance duration with less movement, and use ease-in, since nobody needs to watch the element settle.
- Fade with a touch of blur and no travel instead of reversing the entrance.
- Collapse a removed list row's height while it fades, so the rows below slide up instead of jumping.
- Don't make anyone wait for something they dismissed.

Check: the motion table shows every exit shorter than its entrance; the after-delete screenshot shows no gap or overlap.
Values: enter rise 12px over 240ms ease-out; exit 120ms ease-in, 2px blur, no travel; list row collapse 160ms.

## 12. Grow from the trigger, not from zero: Scale entrances (Critly: scale entrances)

A menu that starts at zero scale is a cartoon zoom; one that starts near full size is a small settle that stays readable from the first frame.

- Start between 0.9 and 0.97, always combined with an opacity fade.
- Set the transform origin to the trigger: a menu under a right-aligned button grows from its top-right corner; a centered dialog grows from center.
- Close faster than you open.
- Don't go below 0.8 (it reads as a zoom); above 0.98, drop the scale and keep the fade.

Check: the open-state screenshot shows the menu attached to its trigger; Check (code): `transform-origin` points at the trigger.
Values: `scale(0.95)` to 1 with opacity, 200ms `--ease-out`; close 120ms.

## 13. Stagger lists, briefly: Stagger (Critly: stagger)

A small offset between siblings turns a block into a list the eye can follow from top to bottom.

- Keep the gap between 30ms and 60ms; past 100ms the last row is still arriving while people read the first.
- Cap the total for growing lists: the last item starts within about 300ms of the first; stagger only rows on screen and show the rest at once.
- Animate only opacity and transform so rows hold their space from the first frame, and keep them clickable while they fade.
- Hold rows at their first frame during the delay, or they flash at full opacity, vanish and fade in.

Check: list screenshots taken at load show every row present; Check (code): `animation-fill-mode: both` and a capped step.
Values: step 40ms (33ms for ten rows); rise 8px; total cap 300ms.

## 14. Move one element instead of swapping two: Shared layout and liquid motion (Critly: shared layout, liquid motion)

When two elements are the same thing to the user, moving one keeps the eye on it; continuity is information.

- Slide tab indicators, carry a thumbnail into a detail header, and morph a touched button into its menu, closing it back to where it came from.
- Share only things that really are the same to the user; a button morphing into an unrelated panel reads as a glitch.
- Keep text moving, not stretching, and correct radius and shadow while the box scales.
- Spend liquid morphs once per screen and keep them off actions repeated a hundred times a day.

Check: the motion table names each shared pair; the before and after screenshots show the same element in both states.
Values: spring bounce 0 settling in 300ms; liquid stretch capped at 1.25 with matching squash; View Transitions skip rather than reverse on a second click, so use them for navigation, not for controls people poke at.

## 15. Animate the window, not the box: Clip-path (Critly: clip-path)

Clipping changes what is visible without touching layout, so text never reflows mid-animation.

- Reveal and wipe with `clip-path` instead of animating width or height.
- Build segmented controls by clipping an inverted copy of the labels to the pill, so text changes color exactly at its edge.
- Show hold-to-confirm for destructive actions as a clipped fill that runs linearly while held and snaps back fast on release.
- Give shadows and focus rings room with negative insets, and write both ends of a clip in the same shape with the same number of arguments.

Check: the segmented control screenshot shows no half-tinted labels; Check (code): no width or height animation for reveals.
Values: hold-to-confirm 1.5s linear, release 200ms ease-out; `inset(-16px)` to `inset(-16px calc(100% + 16px) -16px -16px)`.

## 16. Blur between icons instead of swapping them: Icon morph (Critly: icon morph)

A hard icon swap registers as a jump; a short blur, scale and fade reads as one icon changing.

- Shrink and blur the old icon while the new one grows and sharpens, driven by a no-bounce spring.
- Skip the morph on first render, when there is nothing to morph from.
- Move the strokes themselves only when shapes are related (hamburger to close); otherwise blur-crossfade.
- Don't morph path data between unrelated icons.

Check: the system sheet's icon-button section replays copy to check and play to pause.
Values: blur 4px, start scale 0.25, spring 0.3s bounce 0.

## 17. Finish the throw people started: Momentum (Critly: momentum)

When a drag ends the thing is still moving, so the animation that takes over must start at that velocity and aim where the throw was going.

- Hand the release velocity to a spring, and project the throw forward before snapping to the nearest target.
- Dismiss sheets and toasts by a fast flick or a long drag; distance alone feels heavy.
- Past an edge, let content follow less and less, then spring back; never stop dead.
- Animate x and y as separate springs so diagonal throws curve naturally.

Check (code): a hard flick toward a corner lands in that corner; a short fast flick dismisses a sheet.
Values: projection deceleration 0.998 per ms (1000px/s projects about 500px; 0.99 for precise); dismiss at 0.4px/ms or a quarter of the height (sheets), 0.11px/ms or 45px (toasts); rubber band factor 0.55.

## 18. Let numbers move with meaning: Trend, continuity and timing channels (NumberFlow)

A number that changes in place should show which way it went and roughly how far before anyone reads it, with movement, spin and fade on separate clocks.

- Roll digits up when the value rises and down when it falls; let each digit pick its own direction only when the change has no overall trend worth conveying; pass through in-between values when magnitude matters.
- Time transforms and digit spin together on a spring-like curve, and fades on a shorter ease-out at about half the movement, so entering and leaving characters settle before the motion ends.
- Isolate a number's transition from unrelated layout changes in the same update, group numbers that push each other so they move as one, and match surrounding layout animation to the number's timing.
- Don't animate a number the person is typing (animate stepper presses and server updates only), and respect reduced motion by default; switching animation off finishes any running one.

Check: the motion table names the trend rule and timing for each animated number; Check (code): opacity timing is about half the transform timing, and animation is off while a numeric field is being typed in.
Values: `tabular-nums` on every changing number; default transform a 0.9s no-bounce spring; tuned example transform and spin 750ms, opacity 350ms ease-out; spin line-height 0.85; digit limits so 59 rolls to 00.

## 19. Animate the change, not the data: Living charts (Critly: living charts)

Live data arrives in steps; easing each step over a few hundred milliseconds makes a chart move the way the data feels.

- Tween each new value with an ease-out that finishes well before the next update, so the chart never lags reality.
- Count numbers up or down instead of flipping, with tabular figures so digits don't shift.
- Slide re-ranked rows to their new slots while bars and numbers ease, so one source can be followed without rereading labels.
- Keep the y-axis fixed to a known range while streaming, and step without tweening under reduced motion.

Check: the chart screenshot shows a fixed axis range; Check (code): tween duration is shorter than the update interval.
Values: tween 900ms ease-out at a 1.5s update; re-rank slide 600ms.

## 20. Animate what the compositor can run: Smooth animation (Critly: smooth animation)

The main thread is shared with everything else, so only transform and opacity stay smooth while the page is busy.

- Animate `transform` and `opacity`; never `width`, `height`, `top`, `left`, `margin` or `padding`.
- Treat `filter`, `backdrop-filter`, `clip-path` and `background-color` as expensive, and fake shadow growth by fading in a layer that already has the larger shadow.
- Never animate through framework state re-rendering every frame; set `will-change` just before and remove it after.
- Start the animation first and the heavy work a frame or two later, and pause loops that are off screen.

Check (code): a performance trace shows no non-composited animations on the target screens.
Values: 16ms frame budget at 60Hz, 8ms at 120Hz.

## 21. Reduce movement, keep meaning: Reduced motion (Critly: reduced motion; NumberFlow)

Reduced motion means less movement, not no animation: travel, zoom and parallax go, and the feedback that shows what changed stays.

- Swap translate, scale, parallax, morph and stretch for a short opacity crossfade, and keep color and highlight changes.
- Flatten with 1ms, never 0ms, so transition-end events still fire and closed sheets still unmount.
- Keep drags one-to-one with the finger and settle releases without bounce or long coast; pause autoplay and loops.
- Apply it everywhere motion lives: CSS transitions, keyframes, view transitions, JS libraries, video and number animations.

Check: the system sheet shows each motion token beside its reduced-motion alternative; Check (code): `prefers-reduced-motion: reduce` is handled in CSS and in every JS motion source.
Values: replacement fade 150ms opacity; flashing never more than 3 times per second; anything moving longer than 5s gets a pause control.

## 22. Script authored motion on one timeline: Authored motion (Remotion; Craft video; Chimala)

Product videos, scroll-scrubbed stories and launch pieces are directed, not triggered, so every value derives from one clock.

- Compute every property from the current frame (interpolate with clamping, heavily damped springs); never rely on CSS transitions or timers in a render.
- Keep one timeline file of scene start frames and lengths so movement, camera and sound count from the same numbers; let the camera follow a beat after its subject.
- Use generated video where code can't reach (a looping clip keyed into the UI, a scroll-scrubbed move between two product states) and only to show a real state change.
- Hold each idea long enough to read twice, and never hijack native scroll speed for a scrubbed sequence.

Check: under reduced motion, a scrubbed sequence shows a still of each state; the storyboard in direction.md lists scenes with frame counts.
Values: 60fps, `ms(n) = round(n / 1000 * 60)` frames; beats of 45 frames (750ms); camera starts 24 frames after the subject and glides 32 frames longer (Craft video).

## 23. Let sound confirm, never carry: Interface SFX (Critly: interface SFX)

An interface sound is a cue, not a soundtrack: it says that worked about something people can already see.

- Pair every cue with a visible change; sound off must lose nothing.
- Use cues where completion may happen out of sight (send, copy, save, a long upload finishing, a keyboard toggle) and calm, non-buzzer sounds for errors.
- Shape the cue like the action: a two-note flip for a toggle, a tick for done, a rising arpeggio for sent, a falling pop for removed.
- Never sound typing, scrolling, menus, navigation or anything that can fire twice in a second; drop cues before the first user gesture, and keep an obvious mute that remembers.

Check: the sound table in direction.md pairs each cue with its visible change and frequency class; a mute control appears in the chrome screenshot whenever sound exists.
Values: cue length 16ms to under 300ms; gain 0.04–0.1 (library defaults near 0.5 are far too loud); hover whisper 0.01 rising 25 cents per item, or silence; trigger it twenty times in a row and cut it if it tires by the tenth.

## 24. Build cues from short layers that each add something: Layering sounds (Critly: layering sounds)

One sine is a test tone; a few short, quieter, slightly late layers make a cue with body.

- Start layers within about 40ms of each other, each quieter than the last; at 80ms the seams become audible.
- Make each layer add something distinct: a triangle for softer harmonics, an octave up for air, an octave down for weight.
- Space arpeggio notes 40–80ms to hear one rising gesture; past 120ms it becomes a melody that asks too much attention.
- Add a short filtered noise burst for a tactile click; delete any layer whose muting changes nothing.

Check: the sound table lists layers and gains per cue.
Values: gains stepping from 0.08 down to 0.02; success arpeggio C, E, G, C at 60ms; noise layer under 30ms through a 2600Hz bandpass.

## 25. Ship motion as tokens and a table: Motion spec (studio)

Motion that lives only in someone's head drifts in the build, so write it as tokens plus a table the engineer builds and the critic checks.

- Define easing, duration and spring tokens once, as CSS custom properties.
- List every animated pattern with trigger, property, distance, duration token, easing token, frequency class and reduced-motion alternative.
- Render the tokens on the system sheet with replay buttons and a reduced-motion toggle.
- Don't spec motion as adjectives ("smooth", "snappy"); spec numbers.

Check: system.html has a motion section rendering every token with replay and its reduced-motion alternative; the direction.md motion table has no blank cells.
Values: `| pattern | trigger | property | distance | duration | easing | frequency | reduced |`.

## When these conflict

Motion yields to responsiveness: if an animation delays input, content or reading, cut it. Frequency beats beauty: the more often it happens, the less it moves. Meaning beats flourish: keep the motion that shows what changed, cut the motion that decorates. Under reduced motion, keep the meaning and lose the travel. Sound is always optional and never the only signal.

Then defer to the studio ladder:

1. accessibility & legibility floor
2. explicit user decisions
3. clarity
4. user control
5. task completion
6. system consistency
7. brand distinctiveness
8. delight
