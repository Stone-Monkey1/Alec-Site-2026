// Pure Nav Scene state module. No DOM access here — this is the
// validated model from the movement prototype (see
// .scratch/nav-scene/issues/01-nav-scene-movement-model.md and branch
// prototype/nav-scene-state-model), adapted to Forest.png's real
// dimensions (1536x256).

export const NAV_SCENE_CONFIG = {
  sceneWidth: 1536,
  canopyHeight: 200, // headroom used for percentage-based vertical layout
  groundY: 37, // the grassy walking plane — must match spawn.y and the ground Hotspots' y-band
  step: 60,
  ivy: [
    { id: 'ivy-1', xMin: 980, xMax: 1080, maxHeight: 200 },
  ],
  hotspots: [
    { id: 'about', label: 'About', xMin: 60, xMax: 210, yMin: 30, yMax: 70, destination: 'About', path: '/about', secret: false },
    { id: 'projects', label: 'Projects', xMin: 320, xMax: 470, yMin: 30, yMax: 70, destination: 'Projects', path: '/projects', secret: false },
    { id: 'home', label: 'Home', xMin: 720, xMax: 870, yMin: 30, yMax: 70, destination: 'Home', path: '/', secret: false },
    { id: 'contact', label: 'Contact', xMin: 1230, xMax: 1380, yMin: 30, yMax: 70, destination: 'Contact', path: '/contact', secret: false },
    { id: 'games', label: 'Games', xMin: 980, xMax: 1080, yMin: 150, yMax: 200, destination: 'Games', path: '/games', secret: true },
  ],
  spawn: { x: 600, y: 37 },
};

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
  if (state.isClimbing) {
    return withMessage(state, "Can't move sideways while climbing Ivy — climb down first.", true, {});
  }
  const newX = clamp(state.x + dir * config.step, 0, config.sceneWidth);
  if (newX === state.x) {
    return withMessage(state, 'Edge of the Nav Scene.', true, {});
  }
  return withMessage(state, null, false, { x: newX });
}

function climb(state, dir, config) {
  if (dir > 0) {
    const ivy = state.isClimbing
      ? config.ivy.find((z) => z.id === state.activeIvyId)
      : findIvyAt(state.x, config.ivy);
    if (!ivy) {
      return withMessage(state, "No Ivy here — can't climb.", true, {});
    }
    const newY = clamp(state.y + config.step, config.groundY, ivy.maxHeight);
    if (newY === state.y) {
      return withMessage(state, 'Already at the top of the Ivy.', true, {});
    }
    return withMessage(state, null, false, { y: newY, isClimbing: true, activeIvyId: ivy.id });
  }
  if (!state.isClimbing) {
    return withMessage(state, 'Already on the ground.', true, {});
  }
  const newY = clamp(state.y - config.step, config.groundY, 9999);
  const stillClimbing = newY > config.groundY;
  return withMessage(state, null, false, {
    y: newY,
    isClimbing: stillClimbing,
    activeIvyId: stillClimbing ? state.activeIvyId : null,
  });
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
    case 'INTERACT': return interact(state, config);
    default: return state;
  }
}
