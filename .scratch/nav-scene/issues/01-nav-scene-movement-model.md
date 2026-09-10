Status: ready-for-agent

# Nav Scene movement state model

## Question

Does the Nav Scene's movement/interaction state model hold up:

- Does locking horizontal movement while climbing Ivy (per CONTEXT.md's
  "move up/down instead of only left/right") feel right, with no
  strafing mid-climb?
- Does a Hotspot fire only on exact position overlap, matching ADR
  0001's data-driven `{ x, y, width, height, destination, secret }`
  design?
- Is the Secret Hotspot (Games) reachable only by climbing Ivy into
  the canopy?

## Answer

Yes on all three. Validated interactively with a throwaway HTML
prototype (free-play + five guided walkthroughs: happy path, illegal
climb off Ivy, blocked strafe mid-climb, secret discovery via
climbing, interact-with-nothing).

**Primary source:** the prototype and its validated reducer live on
the local throwaway branch `prototype/nav-scene-state-model`, commit
`fd81d5b` — `alecsite.client/src/components/nav-scene/NavScene.state-prototype.html`.
The `navSceneReducer(state, action, config)` module in that file (a
pure `(state, action) => state` reducer, no DOM) is the reference
implementation to lift into the real Nav Scene component.

## Still open (not covered by the prototype)

- Input binding: mapping movement/interact keys to the reducer's
  actions. Deliberately out of scope for the prototype — buttons
  stood in for keys since the question was about the state model, not
  input handling.
- Actual rendering against `Forest.png` / the Nav Character sprite,
  and real scene/Hotspot coordinates (the prototype used a made-up
  schematic layout, not real art positions).
- Wiring `INTERACT` to real navigation (React Router or similar)
  instead of the prototype's log message.
