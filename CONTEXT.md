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
A climbable vertical feature on certain tree trunks in the Nav Scene. Lets the Nav Character move up/down instead of only left/right.
_Avoid_: vine, ladder

**Secret Hotspot**:
A Hotspot deliberately not visually obvious, placed to reward exploration (e.g., up in the canopy, reached by climbing Ivy) rather than shown as a normal nav item. The Games Hotspot is the first of these.
_Avoid_: hidden button, easter egg
