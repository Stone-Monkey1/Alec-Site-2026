# AlecSite

Alec's personal site: a React front end served by an ASP.NET Core backend, with an interactive, game-like navigation scene as its primary way of moving between sections.

## Language

**Nav Scene**:
The persistent, interactive background (currently `Forest.png`) that hosts site navigation on every page. The visitor's Nav Character walks around inside it.
_Avoid_: nav bar, hero image, background

**Nav Character**:
The pixel-art monkey sprite (`Stonemonkey.png`) the visitor moves around the Nav Scene using movement keys to reach Hotspots.
_Avoid_: mascot, avatar, sprite, player

**Hotspot**:
A zone within the Nav Scene tied to one Destination. Standing the Nav Character inside a Hotspot and pressing the interact key navigates to that Destination.
_Avoid_: button, area, zone, link

**Destination**:
A site section reachable via a Hotspot. Baseline set: Home, About, Projects, Contact — each has its own Hotspot in the Nav Scene, including Home. Games is a planned future Destination, reachable only via a Secret Hotspot; its page is not built yet.
_Avoid_: page, route

**Ivy**:
A climbable vertical feature on certain tree trunks in the Nav Scene. Lets the Nav Character move up/down instead of only left/right. Also grows in the Understory, where it's the way back up into the Nav Scene.
_Avoid_: vine, ladder

**Understory**:
The small, fixed-size space the Nav Character falls into through a Hole, overlaying that page's real page copy (e.g. About's `h1`). Identical in layout on every page — same Hole position, same Platforms, same hidden Games Hotspot. Named for the forest layer beneath the canopy, pairing with Ivy/canopy already being used for the Nav Scene's vertical space above.
_Avoid_: text area, content area, basement

**Hole**:
A gap in the Nav Scene, at the same position on every page, that drops the Nav Character into the Understory when walked over. Falling is automatic and uncontrolled: no movement input during the drop.
_Avoid_: pit, trap door, hatch

**Torch**:
An object the Nav Character automatically picks up while falling through a Hole. Once acquired, it casts a glowing light radius around the Nav Character that reveals Platforms and the Ivy leading back up to the Nav Scene.
_Avoid_: lamp, light source, lantern

**Platform**:
One of several sprite objects positioned in the Understory, identical on every page, that the Nav Character lands on and jumps between.
_Avoid_: ledge, step, block

**Secret Hotspot**:
A Hotspot deliberately not visually obvious, placed to reward exploration rather than shown as a normal nav item. The Games Hotspot is the first of these — it lives in the Understory now (same position on every page), not the canopy/Ivy.
_Avoid_: hidden button, easter egg
