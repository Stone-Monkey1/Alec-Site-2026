import { useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Forest from '../../assets/Forest.png';
import Stonemonkey from '../../assets/Stonemonkey.png';
import {
  NAV_SCENE_CONFIG,
  navSceneReducer,
  createInitialState,
  findHotspotAt,
  findIvyAt,
  KEY_ACTIONS,
} from './navSceneModel';
import { CHARACTER_SHEET_WIDTH, CHARACTER_FRAME_SIZE } from './characterSprite';
import { useCharacterAnimation } from './useCharacterAnimation';
import './navSceneStyle.css';

function reducer(state, action) {
  return navSceneReducer(state, action, NAV_SCENE_CONFIG);
}

function NavScene() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, NAV_SCENE_CONFIG, createInitialState);
  const { frame, facing } = useCharacterAnimation(state.x, state.y);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    function handleKeyDown(event) {
      const actionType = KEY_ACTIONS[event.key];
      if (!actionType) return;
      event.preventDefault();

      if (actionType === 'INTERACT') {
        const current = stateRef.current;
        const hotspot = findHotspotAt(current.x, current.y, NAV_SCENE_CONFIG.hotspots);
        dispatch({ type: 'INTERACT' });
        if (hotspot) navigate(hotspot.path);
        return;
      }
      dispatch({ type: actionType });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const hotspotHere = findHotspotAt(state.x, state.y, NAV_SCENE_CONFIG.hotspots);
  const ivyHere = findIvyAt(state.x, NAV_SCENE_CONFIG.ivy);
  const displayMaxY = NAV_SCENE_CONFIG.canopyHeight + 40; // headroom above the tallest Ivy

  return (
    <div className="nav-scene">
      <div className="nav-scene__viewport">
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
            bottom: `${(state.y / displayMaxY) * 100}%`,
            transform: `translate(-50%, 50%) scaleX(${facing === 'left' ? -1 : 1})`,
          }}
        >
          <img
            className="nav-scene__character-sheet"
            src={Stonemonkey}
            alt="Nav Character"
            style={{
              width: `${(CHARACTER_SHEET_WIDTH / CHARACTER_FRAME_SIZE) * 100}%`,
              left: `${-(frame.x / CHARACTER_FRAME_SIZE) * 100}%`,
              top: `${-(frame.y / CHARACTER_FRAME_SIZE) * 100}%`,
            }}
          />
        </div>

        {hotspotHere && (
          <div
            className="nav-scene__prompt"
            style={{ left: `${(state.x / NAV_SCENE_CONFIG.sceneWidth) * 100}%` }}
          >
            Press Enter to visit {hotspotHere.label}
          </div>
        )}
      </div>

      <p className="nav-scene__hint">
        Move with the arrow keys or WASD
        {ivyHere && !state.isClimbing ? ' — press ↑ to climb the Ivy' : ''}.
        Press Enter or Space to interact.
      </p>
    </div>
  );
}

export default NavScene;
