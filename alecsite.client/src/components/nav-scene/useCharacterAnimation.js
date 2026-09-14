import { useEffect, useRef, useState } from 'react';
import { KEY_ACTIONS } from './navSceneModel';
import {
  IDLE_ROW_Y,
  WALK_ROW_Y,
  IDLE_FRAME_X,
  WALK_FRAME_X,
  IDLE_FRAME_INTERVAL_MS,
  WALK_FRAME_DISTANCE,
} from './characterSprite';

const HORIZONTAL_FACING = { MOVE_LEFT: 'left', MOVE_RIGHT: 'right' };
const MOVE_ACTIONS = new Set(['MOVE_LEFT', 'MOVE_RIGHT', 'MOVE_UP', 'MOVE_DOWN']);

// Drives the Nav Character's sprite frame from actual on-screen movement:
// the walk cycle advances with distance traveled (so legs never move
// faster or slower than the ground does), and the idle cycle advances on
// a fixed timer whenever no movement key is down.
export function useCharacterAnimation(x, y) {
  const [frame, setFrame] = useState({ x: IDLE_FRAME_X[0], y: IDLE_ROW_Y });
  const [facing, setFacing] = useState('right');
  const positionRef = useRef({ x, y });

  useEffect(() => {
    positionRef.current = { x, y };
  }, [x, y]);

  const walkStateRef = useRef(null);
  useEffect(() => {
    const heldActions = new Set();
    let idleIntervalId = null;

    function stopIdling() {
      if (idleIntervalId !== null) {
        clearInterval(idleIntervalId);
        idleIntervalId = null;
      }
    }

    function startWalking() {
      stopIdling();
      const startPos = positionRef.current;
      walkStateRef.current = { lastX: startPos.x, lastY: startPos.y, traveled: 0, index: 0 };
      setFrame({ x: WALK_FRAME_X[0], y: WALK_ROW_Y });
    }

    function startIdling() {
      walkStateRef.current = null;
      let idleIndex = 0;
      setFrame({ x: IDLE_FRAME_X[0], y: IDLE_ROW_Y });
      idleIntervalId = setInterval(() => {
        idleIndex = (idleIndex + 1) % IDLE_FRAME_X.length;
        setFrame({ x: IDLE_FRAME_X[idleIndex], y: IDLE_ROW_Y });
      }, IDLE_FRAME_INTERVAL_MS);
    }

    function handleKeyDown(event) {
      const actionType = KEY_ACTIONS[event.key];
      if (!MOVE_ACTIONS.has(actionType)) return;
      if (HORIZONTAL_FACING[actionType]) setFacing(HORIZONTAL_FACING[actionType]);
      if (heldActions.size === 0) startWalking();
      heldActions.add(actionType);
    }

    function handleKeyUp(event) {
      const actionType = KEY_ACTIONS[event.key];
      if (!MOVE_ACTIONS.has(actionType)) return;
      heldActions.delete(actionType);
      if (heldActions.size === 0) startIdling();
    }

    function handleBlur() {
      heldActions.clear();
      startIdling();
    }

    startIdling();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      stopIdling();
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
    walkState.traveled += Math.abs(dx) + Math.abs(dy);

    if (walkState.traveled >= WALK_FRAME_DISTANCE) {
      const framesAdvanced = Math.floor(walkState.traveled / WALK_FRAME_DISTANCE);
      walkState.traveled -= framesAdvanced * WALK_FRAME_DISTANCE;
      walkState.index = (walkState.index + framesAdvanced) % WALK_FRAME_X.length;
      setFrame({ x: WALK_FRAME_X[walkState.index], y: WALK_ROW_Y });
    }
  }, [x, y]);

  return { frame, facing };
}
