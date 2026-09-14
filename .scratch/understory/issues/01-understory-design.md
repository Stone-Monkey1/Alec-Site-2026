Status: ready-for-human

# Understory (Hole / Torch / Platform / Jump / burn) design

## Origin

Raw idea captured in `.scratch/ToDo.txt` ("Add ability to leave map"). Sharpened via `/grill-with-docs`. Vocabulary landed in `CONTEXT.md`: Understory, Hole, Torch, Platform (Secret Hotspot and Ivy entries updated to match).

## Settled design

- **Hole**: same position on every page (universal, part of the persistent Nav Scene). Walking over it triggers an automatic, fixed, straight-down fall — no movement input during the drop.
- **Torch**: automatically picked up mid-fall, every time, unconditionally. Casts a glowing light radius (mostly-transparent orange) around the Nav Character.
- **Understory**: a small, fixed-height vignette below a Hole, identical in layout on every page — same Platform positions, same Hole. It overlays that page's real page copy (e.g. About's `h1`), which is a separate flammable layer, not the Platforms themselves.
- **Platforms**: several distinct sprite objects (not the text elements). The Nav Character lands on one after falling, and moves between them with left/right + a new **jump** input.
  - Needs a jump animation added to `Stonemonkey.png`, same pattern as the existing idle/walk rows.
- **Getting back up**: real Ivy grows in the Understory (hidden until the Torch's light reveals it — though since the Torch is auto-acquired on every fall, it's effectively always visible once you've landed). Climbing it reuses the existing Ivy/Up-key mechanic, no new verb.
- **Burning words**: the Nav Character must be touching a lit word and hold the interact key to burn it away; holding continuously burns through multiple words. Purely cosmetic — words just disappear, no unlock or reveal behind it, resets on page reload (no persistence layer exists in this project yet). Explicitly **not** connected to Games discovery — it's a separate "fun bonus."
- **Games relocation**: the existing canopy/Ivy Secret Hotspot for Games is removed. Games becomes a hidden Hotspot-like zone inside the Understory, at the same coordinates on every page, found the same way as any other Hotspot (walk in, press interact).

## Still open — blocked on assets

A `/prototype` detour (same pattern as `prototype/nav-scene-state-model`) was considered for the genuinely "have to see it" pieces — jump feel/arc, hold-to-burn timing, how the Understory vignette actually reads at a small fixed size — but deliberately deferred. Before any of that, or `/to-spec`, can usefully proceed, these assets need to exist:

- A visible Hole worked into `Forest.png` (art), near one end.
- A Torch sprite.
- Platform sprites (several).
- A jump animation added to `Stonemonkey.png`.
- Whatever the Understory's backdrop/floor treatment is (currently undefined — it overlays real page copy, but visually TBD).

Once assets exist, resume with `/prototype` for the jump/burn/vignette feel questions above, then `/to-spec` → `/to-tickets` → `/implement`.
