import { useEffect, useRef, useState } from 'react';
import { KEY_ACTIONS, MOVE_ACTIONS, NAV_SCENE_CONFIG } from './navSceneModel';
import { shouldIgnoreKey } from './shouldIgnoreKey';
import {
  IDLE_ROW_Y,
  WALK_ROW_Y,
  CLIMB_ROW_Y,
  JUMP_ROW_Y,
  IDLE_FRAME_X,
  WALK_FRAME_X,
  CLIMB_FRAME_X,
  JUMP_FRAME_X,
  IDLE_FRAME_INTERVAL_MS,
  JUMP_FRAME_INTERVAL_MS,
  FALL_TICK_INTERVAL_MS,
  MOVE_TICK_INTERVAL_MS,
  WALK_FRAME_DISTANCE,
  CLIMB_FRAME_DISTANCE,
  JUMP_FRAME_DISTANCE,
  JUMP_HEIGHT,
  FALL_FRAME_X,
} from './characterSprite';

// Parabolic hop: 0 at takeoff/landing (i === 0 or i === last frame),
// peaking at JUMP_HEIGHT halfway through the animation.
function jumpArcOffset(frameIndex) {
  const t = frameIndex / (JUMP_FRAME_X.length - 1);
  return JUMP_HEIGHT * 4 * t * (1 - t);
}

// The reducer only knows how to move by its own fixed NAV_SCENE_CONFIG.step
// per MOVE_LEFT/MOVE_RIGHT — it has no notion of an arbitrary distance. To
// let JUMP_FRAME_DISTANCE cover a different distance than a normal walk
// step, the jump's momentum tick fires that many whole steps instead of one.
const JUMP_MOMENTUM_STEPS_PER_TICK = Math.max(1, Math.round(JUMP_FRAME_DISTANCE / NAV_SCENE_CONFIG.step));

const HORIZONTAL_FACING = { MOVE_LEFT: 'left', MOVE_RIGHT: 'right' };

// Drives the Nav Character's sprite frame from actual on-screen movement:
// the walk/climb cycle advances with distance traveled (so legs/hands
// never move faster or slower than the ground/Ivy does), and the ground
// idle cycle advances on a fixed timer whenever the Nav Character is on
// the ground with no movement key down.
//
// Climbing is not just "walking on a different axis": grabbing the Ivy
// (the "e" toggle, tracked by isClimbing) freezes the sprite on its
// current/last climb frame immediately, even before any climb input, and
// releasing a climb key mid-climb freezes it again rather than falling
// back to the ground idle-bounce. The climb cycle only advances while
// actually climbing.
//
// Jumping carries whatever horizontal direction was held at takeoff:
// the direction is snapshotted once when Space is pressed, then replayed
// as ordinary MOVE_LEFT/MOVE_RIGHT dispatches on the jump's own frame
// ticks — so releasing the key mid-air doesn't kill the character's
// forward motion, the same way a running jump keeps its momentum.
//
// Gravity: letting go of the Ivy above the ground (isFalling) reuses the
// climb sprite and the same distance-driven frame advance as climbing —
// the only difference is the component drives FALL_STEP dispatches on a
// timer instead of movement keys driving them. fall()'s clamp to groundY
// in the reducer is what flips isFalling back off.
//
// Continuous movement is driven by our own MOVE_TICK_INTERVAL_MS timer,
// not native keydown auto-repeat: most browsers/OSes only keep repeating
// the most-recently-pressed key, so holding a movement key and then
// tapping Space to jump can silently stop the movement key's repeat
// stream mid-hold. Re-dispatching held actions ourselves off heldActionsRef
// means movement keeps advancing regardless of what the OS does with
// repeat events. The loop pauses (not stops) during a jump — jump's own
// momentum ticks own horizontal movement while airborne.
//
// The hook listens to the keyboard itself, and also returns pressMove /
// releaseMove / jump so non-keyboard input (TouchControls) can drive the
// exact same held-action state.
export function useCharacterAnimation(x, y, isClimbing, isFalling, dispatch) {
  const [frame, setFrame] = useState({ x: IDLE_FRAME_X[0], y: IDLE_ROW_Y });
  const [facing, setFacing] = useState('right');
  const [jumpOffset, setJumpOffset] = useState(0);

  const positionRef = useRef({ x, y });
  const isClimbingRef = useRef(isClimbing);
  const dispatchRef = useRef(dispatch);
  const isJumpingRef = useRef(false);
  const heldActionsRef = useRef(new Set());
  const walkStateRef = useRef(null);
  const idleIntervalRef = useRef(null);
  const jumpIntervalRef = useRef(null);
  const moveIntervalRef = useRef(null);

  useEffect(() => {
    positionRef.current = { x, y };
  }, [x, y]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  function stopIdling() {
    if (idleIntervalRef.current !== null) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
  }

  // Our own clock for continuous movement, independent of native key-repeat
  // (see the module doc comment). Re-dispatches every currently-held
  // movement action once per tick; skips the tick entirely during a jump,
  // since the jump's momentum ticks already own horizontal movement then.
  function startMoveLoop() {
    if (moveIntervalRef.current !== null) return;
    moveIntervalRef.current = setInterval(() => {
      if (isJumpingRef.current) return;
      heldActionsRef.current.forEach((action) => {
        dispatchRef.current({ type: action });
      });
    }, MOVE_TICK_INTERVAL_MS);
  }

  function stopMoveLoop() {
    if (moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }

  function startIdling() {
    walkStateRef.current = null;
    let idleIndex = 0;
    setFrame({ x: IDLE_FRAME_X[0], y: IDLE_ROW_Y });
    idleIntervalRef.current = setInterval(() => {
      idleIndex = (idleIndex + 1) % IDLE_FRAME_X.length;
      setFrame({ x: IDLE_FRAME_X[idleIndex], y: IDLE_ROW_Y });
    }, IDLE_FRAME_INTERVAL_MS);
  }

  // Grabbed the Ivy while stationary: stop the ground idle-bounce and
  // freeze on the first climb frame (or whichever climb frame was
  // already showing, if this is a re-grab after letting go mid-climb).
  function freezeOnIvy() {
    stopIdling();
    const resumeIndex = walkStateRef.current?.mode === 'climb' ? walkStateRef.current.index : 0;
    walkStateRef.current = {
      mode: 'climb',
      lastX: positionRef.current.x,
      lastY: positionRef.current.y,
      traveled: 0,
      index: resumeIndex,
    };
    setFrame({ x: CLIMB_FRAME_X[resumeIndex], y: CLIMB_ROW_Y });
  }

  function startWalking() {
    stopIdling();
    const startPos = positionRef.current;
    const mode = isClimbingRef.current ? 'climb' : 'walk';
    const startIndex = mode === 'climb' && walkStateRef.current?.mode === 'climb'
      ? walkStateRef.current.index
      : 0;
    walkStateRef.current = { mode, lastX: startPos.x, lastY: startPos.y, traveled: 0, index: startIndex };
    setFrame(mode === 'climb'
      ? { x: CLIMB_FRAME_X[startIndex], y: CLIMB_ROW_Y }
      : { x: WALK_FRAME_X[0], y: WALK_ROW_Y });
  }

  // Movement stopped. Climbing freezes on whatever frame it was on — the
  // Nav Character is still gripping the Ivy — until the next climb
  // input. Walking falls back to the ground idle-bounce. While a jump is
  // in flight the jump interval alone owns the frame; its own completion
  // handler decides whether to land on a climb, walk, or idle frame, so
  // stopMoving must not touch the frame (or clear walkStateRef) here.
  function stopMoving() {
    if (isJumpingRef.current) return;
    if (walkStateRef.current && walkStateRef.current.mode === 'climb') return;
    startIdling();
  }

  function playJump() {
      if (jumpIntervalRef.current !== null || walkStateRef.current?.mode === 'climb') return;
    stopIdling();
    isJumpingRef.current = true;

    // Snapshot momentum: whichever horizontal key was held at takeoff
    // keeps driving the Nav Character for the rest of the jump, even if
    // it's released mid-air.
    const momentumAction = heldActionsRef.current.has('MOVE_RIGHT')
      ? 'MOVE_RIGHT'
      : heldActionsRef.current.has('MOVE_LEFT')
        ? 'MOVE_LEFT'
        : null;

      let jumpIndex = 0;
// start jump on the first frame of the jump arc Jump_Frame_X will change as the jump progresses, and jumpOffset will be calculated based on the jump arc
    setFrame({ x: JUMP_FRAME_X[0], y: JUMP_ROW_Y });
    setJumpOffset(jumpArcOffset(0));
    jumpIntervalRef.current = setInterval(() => {
      jumpIndex += 1;
      if (jumpIndex >= JUMP_FRAME_X.length) {
        clearInterval(jumpIntervalRef.current);
        jumpIntervalRef.current = null;
        isJumpingRef.current = false;
        setJumpOffset(0);
        const walkState = walkStateRef.current;
        if (heldActionsRef.current.size > 0) {
            startWalking();
        } else if (walkState && walkState.mode === 'climb') {
          setFrame({ x: CLIMB_FRAME_X[walkState.index], y: CLIMB_ROW_Y });
        } else {
          startIdling();
        }
        return;
      }
      setFrame({ x: JUMP_FRAME_X[jumpIndex], y: JUMP_ROW_Y });
      setJumpOffset(jumpArcOffset(jumpIndex));
      if (momentumAction) {
        for (let step = 0; step < JUMP_MOMENTUM_STEPS_PER_TICK; step += 1) {
          dispatchRef.current({ type: momentumAction });
        }
      }
    }, JUMP_FRAME_INTERVAL_MS);
  }

  // React immediately to grabbing/letting go of the Ivy — not just to the
  // next movement key — otherwise the ground idle-bounce keeps running
  // silently underneath a Nav Character that's already gripping the Ivy.
  useEffect(() => {
    isClimbingRef.current = isClimbing;
    if (heldActionsRef.current.size > 0) return;
    if (isClimbing || isJumpingRef.current) {
      freezeOnIvy();
    } else if (walkStateRef.current && walkStateRef.current.mode === 'climb') {
      startIdling();
    }
  }, [isClimbing]);

  // Falling is gravity, not player input: freeze on the climb frame the
  // fall starts from (same as grabbing the Ivy), then drive FALL_STEP on
  // a fast timer until the reducer's groundY clamp flips isFalling back
  // off, at which point we land into whatever's currently held (or idle).
  useEffect(() => {
    if (!isFalling) return undefined;
      stopIdling();
      setFrame({ x: FALL_FRAME_X, y: JUMP_ROW_Y });
    const fallIntervalId = setInterval(() => {
      dispatchRef.current({ type: 'FALL_STEP' });
    }, FALL_TICK_INTERVAL_MS);
    return () => {
      clearInterval(fallIntervalId);
      if (heldActionsRef.current.size > 0) {
        startWalking();
      } else {
        startIdling();
      }
    };
  }, [isFalling]);

  // Input entry points shared by every input source — the keyboard
  // handlers below and the on-screen TouchControls both go through these,
  // so a held D-pad button behaves exactly like a held arrow key.
  function pressMove(actionType) {
    if (HORIZONTAL_FACING[actionType]) setFacing(HORIZONTAL_FACING[actionType]);
    if (heldActionsRef.current.has(actionType)) return;
    if (heldActionsRef.current.size === 0) {
      startWalking();
      startMoveLoop();
      dispatchRef.current({ type: actionType }); // immediate first step, don't wait for the first tick
    }
    heldActionsRef.current.add(actionType);
  }

  function releaseMove(actionType) {
    heldActionsRef.current.delete(actionType);
    if (heldActionsRef.current.size === 0) {
      stopMoveLoop();
      stopMoving();
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (shouldIgnoreKey(event)) return;
      if (event.key === ' ') {
        event.preventDefault();
        playJump();
        return;
      }
      const actionType = KEY_ACTIONS[event.key];
      if (!MOVE_ACTIONS.has(actionType)) return;
      event.preventDefault();
      pressMove(actionType);
    }

    function handleKeyUp(event) {
      const actionType = KEY_ACTIONS[event.key];
      if (!MOVE_ACTIONS.has(actionType)) return;
      releaseMove(actionType);
    }

    function handleBlur() {
      heldActionsRef.current.clear();
      stopMoveLoop();
      stopMoving();
    }

    startIdling();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      stopIdling();
      stopMoveLoop();
      if (jumpIntervalRef.current !== null) clearInterval(jumpIntervalRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const walkState = walkStateRef.current;
    if (!walkState) return;

    const dx = x - walkState.lastX;
    const dy = y - walkState.lastY;
    walkState.lastX = x;
    walkState.lastY = y;
    if (isJumpingRef.current) return; // jump animation owns the frame for now

    walkState.traveled += Math.abs(dx) + Math.abs(dy);

    const frameX = walkState.mode === 'climb' ? CLIMB_FRAME_X : WALK_FRAME_X;
    const frameY = walkState.mode === 'climb' ? CLIMB_ROW_Y : WALK_ROW_Y;
    const frameDistance = walkState.mode === 'climb' ? CLIMB_FRAME_DISTANCE : WALK_FRAME_DISTANCE;

    if (walkState.traveled >= frameDistance) {
      const framesAdvanced = Math.floor(walkState.traveled / frameDistance);
      walkState.traveled -= framesAdvanced * frameDistance;
      walkState.index = (walkState.index + framesAdvanced) % frameX.length;
      setFrame({ x: frameX[walkState.index], y: frameY });
    }
  }, [x, y]);

  return { frame, facing, jumpOffset, pressMove, releaseMove, jump: playJump };
}
