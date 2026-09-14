// Pure sprite-sheet data for the Nav Character (Stonemonkey.png).
// The sheet's top row (y 0-80) holds the idle cycle, the bottom row
// (y 80-160) holds the walk cycle. Every frame is read through a fixed
// 80x80 window — wide enough to hold the widest pose (~82px) without
// clipping, and narrow enough to never bleed into a neighboring frame
// (idle frames sit 96px apart, walk frames 592px apart).

export const CHARACTER_SHEET_WIDTH = 5328;
export const CHARACTER_FRAME_SIZE = 80;

export const IDLE_ROW_Y = 0;
export const WALK_ROW_Y = 80;

export const IDLE_FRAME_X = [2, 98, 194, 290];
export const WALK_FRAME_X = [0, 592, 1186, 1782, 2375, 2971, 3559, 4146, 4738];

export const IDLE_FRAME_INTERVAL_MS = 450;

// Scene-space units (same units as NAV_SCENE_CONFIG position) the Nav
// Character must actually travel before the walk cycle advances one
// frame. Tying the frame to distance rather than elapsed time keeps the
// feet locked to the ground regardless of movement speed — a timer-based
// cycle keeps animating even while blocked or moving slowly, which reads
// as sliding rather than walking.
export const WALK_FRAME_DISTANCE = 4;
