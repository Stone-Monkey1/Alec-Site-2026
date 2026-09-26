import { useCallback, useEffect, useReducer, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Forest from '../../assets/Forest.png';
import Stonemonkey from '../../assets/Stonemonkey.png';
import {
  NAV_SCENE_CONFIG,
  navSceneReducer,
  createInitialState,
  findHotspotAt,
  findIvyAt,
  KEY_ACTIONS,
  MOVE_ACTIONS,
} from './navSceneModel';
import { CHARACTER_SHEET_WIDTH, CHARACTER_FRAME_WIDTH, CHARACTER_FRAME_HEIGHT } from './characterSprite';
import { useCharacterAnimation } from './useCharacterAnimation';
import TouchControls from './TouchControls';
import { shouldIgnoreKey } from './shouldIgnoreKey';
import { useNavCamera, SCENE_IMAGE_HEIGHT } from './useNavCamera';
import './navSceneStyle.css';

// .nav-scene__character is 2% of the scene's width with an 85:80 frame;
// the scene is sceneWidth:SCENE_IMAGE_HEIGHT, so half the Nav Character's
// height as a % of the scene's height is:
const CHARACTER_HALF_HEIGHT_PCT = (0.02 * (NAV_SCENE_CONFIG.sceneWidth / SCENE_IMAGE_HEIGHT) * (80 / 85) * 100) / 2;
const PROMPT_GAP_PCT = 2;
const PROMPT_FLIP_ABOVE_PCT = 65; // above this height there's no room for the prompt overhead

const PLAIN_LINKS = [...NAV_SCENE_CONFIG.hotspots]
  .filter((hotspot) => !hotspot.secret)
  .sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0));

function reducer(state, action) {
  return navSceneReducer(state, action, NAV_SCENE_CONFIG);
}

function NavScene() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, NAV_SCENE_CONFIG, createInitialState);
  const { frame, facing, jumpOffset, pressMove, releaseMove, jump } = useCharacterAnimation(state.x, state.y, state.isClimbing, state.isFalling, dispatch);
  const stateRef = useRef(state);
  const viewportRef = useRef(null);
  const camera = useNavCamera(viewportRef, state.x, NAV_SCENE_CONFIG.sceneWidth);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Shared by the keyboard handler and TouchControls.
  const interact = useCallback(() => {
    const current = stateRef.current;
    const hotspot = findHotspotAt(current.x, current.y, NAV_SCENE_CONFIG.hotspots);
    dispatch({ type: 'INTERACT' });
    if (hotspot) navigate(hotspot.path);
  }, [navigate]);

  const toggleClimb = useCallback(() => dispatch({ type: 'TOGGLE_CLIMB' }), []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (shouldIgnoreKey(event)) return;
      const actionType = KEY_ACTIONS[event.key];
      if (!actionType || MOVE_ACTIONS.has(actionType)) return; // held movement is dispatched by useCharacterAnimation's own timer
      event.preventDefault();

      if (actionType === 'INTERACT') {
        interact();
        return;
      }
      dispatch({ type: actionType });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interact]);

  const hotspotHere = findHotspotAt(state.x, state.y, NAV_SCENE_CONFIG.hotspots);
  const ivyHere = findIvyAt(state.x, NAV_SCENE_CONFIG.ivy);
  const displayMaxY = NAV_SCENE_CONFIG.canopyHeight + 40; // headroom above the tallest Ivy

  // The prompt floats just above the Nav Character's head, or just below
  // its feet when it's high on the Ivy and there's no room above. Its
  // horizontal anchor slides from its left edge to its right edge as the
  // Nav Character crosses the visible window, so it's centered mid-screen
  // but never pushed past either edge of the viewport.
  const characterCenterPct = ((state.y + jumpOffset) / displayMaxY) * 100;
  const promptAbove = characterCenterPct < PROMPT_FLIP_ABOVE_PCT;
  const promptOffsetPct = CHARACTER_HALF_HEIGHT_PCT + PROMPT_GAP_PCT;
  const promptAnchor = Math.max(0, Math.min(1, (state.x - camera.left) / camera.visibleWidth));

  return (
    <div className="nav-scene">
      {/* The viewport shows camera.visibleWidth scene units; the world inside
          it is always the full scene (zoomed wider than the viewport on
          narrow screens) and slides left to keep the Nav Character in view.
          Everything in the world keeps positioning itself as a % of the full
          scene, so none of the layout math below knows about the camera. */}
      <div
        ref={viewportRef}
        className="nav-scene__viewport"
        style={{ aspectRatio: `${camera.visibleWidth} / ${SCENE_IMAGE_HEIGHT}` }}
      >
        <div
          className="nav-scene__world"
          style={{
            width: `${camera.zoom * 100}%`,
            transform: `translateX(${-(camera.left / NAV_SCENE_CONFIG.sceneWidth) * 100}%)`,
          }}
        >
          <img className="nav-scene__background" src={Forest} alt="" />

          {NAV_SCENE_CONFIG.ivy.map((zone) => (
            <div
              key={zone.id}
              className="nav-scene__ivy"
              style={{
                left: `${(zone.xMin / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
                width: `${((zone.xMax - zone.xMin) / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
                height: `${(zone.maxHeight / displayMaxY) * 100}%`,
              }}
            />
          ))}

          {NAV_SCENE_CONFIG.hotspots.map((hotspot) => {
            const isDiscovered = !hotspot.secret || state.discoveredSecret;
            const isActive = hotspotHere && hotspotHere.id === hotspot.id;
            return (
              <div
                key={hotspot.id}
                className={`nav-scene__hotspot${isActive ? ' nav-scene__hotspot--active' : ''}`}
                style={{
                  left: `${(hotspot.xMin / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
                  width: `${((hotspot.xMax - hotspot.xMin) / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
                  bottom: `${(hotspot.yMin / displayMaxY) * 100}%`,
                  height: `${((hotspot.yMax - hotspot.yMin) / displayMaxY) * 100}%`,
                  visibility: isDiscovered ? 'visible' : 'hidden',
                }}
              >
                <span className="nav-scene__hotspot-label">{hotspot.label}</span>
              </div>
            );
          })}

          <div
            className="nav-scene__character"
            style={{
              left: `${(state.x / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
              bottom: `${((state.y + jumpOffset) / displayMaxY) * 100}%`,
              transform: `translate(-50%, 50%) scaleX(${facing === 'left' ? -1 : 1})`,
            }}
          >
            <img
              className="nav-scene__character-sheet"
              src={Stonemonkey}
              alt="Nav Character"
              style={{
                width: `${(CHARACTER_SHEET_WIDTH / CHARACTER_FRAME_WIDTH) * 100}%`,
                left: `${-(frame.x / CHARACTER_FRAME_WIDTH) * 100}%`,
                top: `${-(frame.y / CHARACTER_FRAME_HEIGHT) * 100}%`,
              }}
            />
          </div>

          {hotspotHere && (
            <div
              className="nav-scene__prompt"
              style={{
                left: `${(state.x / NAV_SCENE_CONFIG.sceneWidth) * 100}%`,
                transform: `translateX(${-promptAnchor * 100}%)`,
                ...(promptAbove
                  ? { bottom: `${characterCenterPct + promptOffsetPct}%` }
                  : { top: `${100 - characterCenterPct + promptOffsetPct}%` }),
              }}
            >
              <span className="nav-scene__keyboard-only">Press Enter to visit {hotspotHere.label}</span>
              <span className="nav-scene__touch-only">Tap Go to visit {hotspotHere.label}</span>
            </div>
          )}
        </div>
      </div>

      <TouchControls
        onPressMove={pressMove}
        onReleaseMove={releaseMove}
        onJump={jump}
        onToggleClimb={toggleClimb}
        onInteract={interact}
        canClimb={!!ivyHere}
        isClimbing={state.isClimbing}
        hotspotLabel={hotspotHere ? hotspotHere.label : null}
      />

      <p className="nav-scene__hint nav-scene__keyboard-only">
        Move with the arrow keys or WASD
        {ivyHere && !state.isClimbing ? ' — press E to grab the Ivy' : ''}
        {state.isClimbing ? ' — press E to let go and fall' : ''}.
        Press Enter to interact. Press Space to jump.
      </p>

      {/* Plain links for anyone who'd rather not play: screen readers,
          visitors in a hurry. Built from the same Hotspots as the scene. */}
      <nav className="nav-scene__links" aria-label="Site">
        {PLAIN_LINKS.map((hotspot) => (
          <NavLink key={hotspot.id} to={hotspot.path} end>
            {hotspot.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default NavScene;
