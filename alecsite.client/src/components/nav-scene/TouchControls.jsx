// On-screen controls for touch devices. Only shown on coarse-pointer,
// no-hover devices (see navSceneStyle.css) — keyboard users never see it.
// Everything here routes through the same entry points the keyboard uses,
// so touch and keys can't drift apart in behavior.

function HoldButton({ action, label, glyph, onPress, onRelease }) {
  function handlePointerDown(event) {
    event.preventDefault();
    // Capture so the release still arrives if the finger slides off the button.
    event.currentTarget.setPointerCapture(event.pointerId);
    onPress(action);
  }

  function handlePointerEnd() {
    onRelease(action);
  }

  return (
    <button
      type="button"
      className="nav-touch__button nav-touch__dpad-button"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}

function TouchControls({ onPressMove, onReleaseMove, onJump, onToggleClimb, onInteract, canClimb, isClimbing, hotspotLabel }) {
  const holdProps = { onPress: onPressMove, onRelease: onReleaseMove };

  return (
    <div className="nav-touch" aria-label="Movement controls" role="group">
      <div className="nav-touch__dpad">
        <span className="nav-touch__dpad-up"><HoldButton action="MOVE_UP" label="Climb up" glyph="▲" {...holdProps} /></span>
        <span className="nav-touch__dpad-left"><HoldButton action="MOVE_LEFT" label="Move left" glyph="◀" {...holdProps} /></span>
        <span className="nav-touch__dpad-right"><HoldButton action="MOVE_RIGHT" label="Move right" glyph="▶" {...holdProps} /></span>
        <span className="nav-touch__dpad-down"><HoldButton action="MOVE_DOWN" label="Climb down" glyph="▼" {...holdProps} /></span>
      </div>

      <div className="nav-touch__actions">
        <button type="button" className="nav-touch__button" onClick={onJump}>
          Jump
        </button>
        <button type="button" className="nav-touch__button" onClick={onToggleClimb} disabled={!canClimb && !isClimbing}>
          {isClimbing ? 'Let go' : 'Grab'}
        </button>
        <button
          type="button"
          className="nav-touch__button nav-touch__button--primary"
          onClick={onInteract}
          disabled={!hotspotLabel}
        >
          {hotspotLabel ? `Go: ${hotspotLabel}` : 'Go'}
        </button>
      </div>
    </div>
  );
}

export default TouchControls;
