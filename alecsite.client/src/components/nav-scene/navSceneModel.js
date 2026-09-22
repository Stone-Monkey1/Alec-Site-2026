// Pure Nav Scene state module. No DOM access here — this is the
// validated model from the movement prototype (see
// .scratch/nav-scene/issues/01-nav-scene-movement-model.md and branch
// prototype/nav-scene-state-model), adapted to Forest.png's real
// dimensions (1536x256).

export const NAV_SCENE_CONFIG = {
  sceneWidth: 1536,
  canopyHeight: 200, // headroom used for percentage-based vertical layout
  groundY: 37, // the grassy walking plane — must match spawn.y and the ground Hotspots' y-band
  step: 4,
  fallStep: 8, // per-tick descent while falling — faster than a manual climb-down, so gravity reads as a drop rather than another climb
  ivy: [
    { id: 'ivy-1', xMin: 795, xMax: 825, maxHeight: 200 },
  ],
  hotspots: [
    { id: 'about', label: 'About', xMin: 60, xMax: 210, yMin: 30, yMax: 70, destination: 'About', path: '/about', secret: false },
    { id: 'projects', label: 'Projects', xMin: 320, xMax: 470, yMin: 30, yMax: 70, destination: 'Projects', path: '/projects', secret: false },
    { id: 'home', label: 'Home', xMin: 720, xMax: 870, yMin: 30, yMax: 70, destination: 'Home', path: '/', secret: false },
    { id: 'contact', label: 'Contact', xMin: 1230, xMax: 1380, yMin: 30, yMax: 70, destination: 'Contact', path: '/contact', secret: false },
    { id: 'games', label: 'Games', xMin: 795, xMax: 825, yMin: 150, yMax: 200, destination: 'Games', path: '/games', secret: true },
  ],
  spawn: { x: 600, y: 37 },
};

export const KEY_ACTIONS = {
  ArrowLeft: 'MOVE_LEFT', a: 'MOVE_LEFT', A: 'MOVE_LEFT',
  ArrowRight: 'MOVE_RIGHT', d: 'MOVE_RIGHT', D: 'MOVE_RIGHT',
  ArrowUp: 'MOVE_UP', w: 'MOVE_UP', W: 'MOVE_UP',
  ArrowDown: 'MOVE_DOWN', s: 'MOVE_DOWN', S: 'MOVE_DOWN',
  e: 'TOGGLE_CLIMB', E: 'TOGGLE_CLIMB',
  Enter: 'INTERACT',
};

// Actions that come from a held-down key rather than a single press.
// useCharacterAnimation owns continuous dispatch for these (its own timer,
// not native key-repeat — see MOVE_TICK_INTERVAL_MS), so NavScene's own
// keydown handler skips them entirely.
export const MOVE_ACTIONS = new Set(['MOVE_LEFT', 'MOVE_RIGHT', 'MOVE_UP', 'MOVE_DOWN']);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function findIvyAt(x, ivyZones) {
  return ivyZones.find((z) => x >= z.xMin && x <= z.xMax) || null;
}

export function findHotspotAt(x, y, hotspots) {
  return hotspots.find((h) => x >= h.xMin && x <= h.xMax && y >= h.yMin && y <= h.yMax) || null;
}

export function createInitialState(config) {
  return {
    x: config.spawn.x,
    y: config.spawn.y,
    isClimbing: false,
    isFalling: false,
    activeIvyId: null,
    discoveredSecret: false,
    visited: [],
    lastMessage: null,
    lastBlocked: false,
  };
}

function withMessage(state, message, blocked, patch) {
  return { ...state, ...patch, lastMessage: message, lastBlocked: !!blocked };
}

function moveHorizontal(state, dir, config) {
  if (state.isClimbing || state.isFalling) {
    return withMessage(state, "Can't move sideways while climbing or falling.", true, {});
  }
  const newX = clamp(state.x + dir * config.step, 0, config.sceneWidth);
  if (newX === state.x) {
    return withMessage(state, 'Edge of the Nav Scene.', true, {});
  }
  return withMessage(state, null, false, { x: newX });
}

function climb(state, dir, config) {
  if (!state.isClimbing) {
    return withMessage(state, "Not climbing — press E on Ivy to grab it.", true, {});
  }
  const ivy = config.ivy.find((z) => z.id === state.activeIvyId);
  if (dir > 0) {
    const newY = clamp(state.y + config.step, config.groundY, ivy.maxHeight);
    if (newY === state.y) {
      return withMessage(state, 'Already at the top of the Ivy.', true, {});
    }
    return withMessage(state, null, false, { y: newY });
  }
  const newY = clamp(state.y - config.step, config.groundY, 9999);
  const stillClimbing = newY > config.groundY;
  return withMessage(state, null, false, {
    y: newY,
    isClimbing: stillClimbing,
    activeIvyId: stillClimbing ? state.activeIvyId : null,
  });
}

function toggleClimb(state, config) {
  if (state.isClimbing) {
    // Letting go above the ground plane means dropping, not just releasing
    // in place — gravity takes over until fall() clamps back to groundY.
    const grounded = state.y <= config.groundY;
    return withMessage(state, null, false, {
      isClimbing: false,
      activeIvyId: null,
      isFalling: !grounded,
    });
  }
  const ivy = findIvyAt(state.x, config.ivy);
  if (!ivy) {
    return withMessage(state, "No Ivy here — can't climb.", true, {});
  }
  return withMessage(state, null, false, { isClimbing: true, activeIvyId: ivy.id });
}

function fall(state, config) {
  if (!state.isFalling) return state;
  const newY = clamp(state.y - config.fallStep, config.groundY, 9999);
  const landed = newY <= config.groundY;
  return withMessage(state, null, false, { y: newY, isFalling: !landed });
}

function interact(state, config) {
  const hotspot = findHotspotAt(state.x, state.y, config.hotspots);
  if (!hotspot) {
    return withMessage(state, 'Nothing to interact with here.', true, {});
  }
  const visited = state.visited.includes(hotspot.destination)
    ? state.visited
    : [...state.visited, hotspot.destination];
  return withMessage(state, null, false, {
    visited,
    discoveredSecret: state.discoveredSecret || hotspot.secret,
  });
}

export function navSceneReducer(state, action, config) {
  switch (action.type) {
    case 'MOVE_LEFT': return moveHorizontal(state, -1, config);
    case 'MOVE_RIGHT': return moveHorizontal(state, 1, config);
    case 'MOVE_UP': return climb(state, 1, config);
    case 'MOVE_DOWN': return climb(state, -1, config);
    case 'TOGGLE_CLIMB': return toggleClimb(state, config);
    case 'FALL_STEP': return fall(state, config);
    case 'INTERACT': return interact(state, config);
    default: return state;
  }
}
