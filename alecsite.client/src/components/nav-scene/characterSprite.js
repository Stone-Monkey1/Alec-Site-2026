// Pure sprite-sheet data for the Nav Character (Stonemonkey.png).
// The sheet is a fixed 9-column x 4-row grid, 85x80 per cell:
// row 0 (y 0-80) idle, row 1 (y 80-160) walk, row 2 (y 160-240) climb,
// row 3 (y 240-320) jump. Not every row uses all 9 columns — each
// frame array below lists only the populated columns for that row.

export const CHARACTER_SHEET_WIDTH = 765;
export const CHARACTER_SHEET_HEIGHT = 320;
export const CHARACTER_FRAME_WIDTH = 85;
export const CHARACTER_FRAME_HEIGHT = 80;

export const IDLE_ROW_Y = 0;
export const WALK_ROW_Y = 80;
export const CLIMB_ROW_Y = 160;
export const JUMP_ROW_Y = 240;

export const IDLE_FRAME_X = [0, 85, 170, 255];
export const WALK_FRAME_X = [0, 85, 170, 255, 340, 425, 510, 595, 680];
export const CLIMB_FRAME_X = [0, 85, 170, 255];
export const CLIMB_IDLE_FRAME_X = [85 , 170]
export const JUMP_FRAME_X = [0, 85, 170, 255, 340, 425];

export const IDLE_FRAME_INTERVAL_MS = 450;
export const JUMP_FRAME_INTERVAL_MS = 80;
export const FALL_TICK_INTERVAL_MS = 30; // how often gravity dispatches FALL_STEP — faster than key-repeat so a drop reads distinctly from climbing down
export const MOVE_TICK_INTERVAL_MS = 50; // how often a held movement key re-dispatches its action — our own clock instead of relying on native OS key-repeat, which pauses for a held key once a second key (e.g. Space) starts repeating

export const FALL_FRAME_X = JUMP_FRAME_X[2]
// Scene-space units (same units as NAV_SCENE_CONFIG position) the Nav
// Character must actually travel before the walk/climb cycle advances
// one frame. Tying the frame to distance rather than elapsed time keeps
// the feet locked to the ground (or hands locked to the Ivy) regardless
// of movement speed — a timer-based cycle keeps animating even while
// blocked or moving slowly, which reads as sliding rather than moving.
export const WALK_FRAME_DISTANCE = 4;
export const CLIMB_FRAME_DISTANCE = 4;
export const JUMP_FRAME_DISTANCE = 6;

// How high (in the same scene-space units as NAV_SCENE_CONFIG position)
// the Nav Character hops during the jump animation. Purely a rendering
// offset added on top of the Nav Scene's y — jumping doesn't change the
// authoritative position, so it can't be used to reach anything a walk
// or climb couldn't.
export const JUMP_HEIGHT = 24;
