import { useLayoutEffect, useState } from 'react';

// Forest.png's native pixel height. The scene's width lives in
// NAV_SCENE_CONFIG.sceneWidth; together they give the scene's aspect ratio.
export const SCENE_IMAGE_HEIGHT = 256;

// Below this on-screen height the full-width Nav Scene is too small to
// read (on a ~390px phone it would be ~65px tall with an ~8px Nav
// Character), so the camera zooms in and follows the Nav Character
// instead of shrinking the whole scene to fit. 200px means zoom only
// kicks in below ~1200px wide, so typical laptops/desktops still see the
// whole scene without panning.
export const MIN_VIEWPORT_HEIGHT_PX = 200;

// Pure camera math. Given how wide the viewport is on screen, decide how
// much of the scene (in scene units) fits across it, then center that
// window on the Nav Character — clamped so the camera never shows past
// either edge of Forest.png. Wide screens get zoom 1: the whole scene, no
// panning, exactly the pre-camera layout.
export function computeCamera(viewportWidthPx, characterX, sceneWidth) {
  const naturalHeightPx = (viewportWidthPx * SCENE_IMAGE_HEIGHT) / sceneWidth;
  const zoom = naturalHeightPx > 0 ? Math.max(1, MIN_VIEWPORT_HEIGHT_PX / naturalHeightPx) : 1;
  const visibleWidth = sceneWidth / zoom;
  const left = Math.max(0, Math.min(sceneWidth - visibleWidth, characterX - visibleWidth / 2));
  return { zoom, visibleWidth, left };
}

// Tracks the viewport's on-screen width and returns the camera for the
// Nav Character's current x. Layout effect so the first paint is already
// at the right zoom, not a flash of the tiny full-width scene.
export function useNavCamera(viewportRef, characterX, sceneWidth) {
  const [viewportWidthPx, setViewportWidthPx] = useState(0);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    setViewportWidthPx(viewport.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      setViewportWidthPx(entry.contentRect.width);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewportRef]);

  return computeCamera(viewportWidthPx, characterX, sceneWidth);
}
