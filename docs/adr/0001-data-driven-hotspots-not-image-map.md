---
status: accepted
---

# Data-driven overlay Hotspots instead of an HTML image map

The Nav Scene needs Hotspots (About/Projects/Contact/Home, plus a Secret Hotspot for Games) that the Nav Character walks into and interacts with via a key press, not a mouse click. An HTML image map (`<map>`/`<area>`) is the obvious native tool for clickable regions on a flat image, and was the original plan.

We rejected it: image maps are pointer/focus-activated only — the browser handles the "was this area clicked/focused" check internally, with no data exposed for a continuous "is the Nav Character's current position inside this zone" query every frame, which the walk-then-interact mechanic requires. Reusing `<area coords>` for that would mean scraping geometry back out of the DOM to reimplement what the browser already hid from us.

Instead, each Hotspot is defined as position/size data (`{ x, y, width, height, destination, secret }`) that movement logic can check directly, rendered as positioned overlay elements. This also gives CSS-based hover/reveal effects and responsive scaling that image maps don't support well.
