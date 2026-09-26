// The Nav Scene listens for keys on the whole window, so without this it
// would steal keys from the page copy below it: Enter on a link, Space on a
// button, typing into a field. Arrow keys still drive the Nav Character
// when a link or button has focus, so clicking one doesn't freeze the game.
const TEXT_ENTRY = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const ACTIVATABLE = 'a[href], button, summary, [role="button"], [role="link"]';

export function shouldIgnoreKey(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  const target = event.target;
  if (!(target instanceof Element)) return false;
  if (target.closest(TEXT_ENTRY)) return true;
  if ((event.key === 'Enter' || event.key === ' ') && target.closest(ACTIVATABLE)) return true;
  return false;
}
