const VIEWPORT_PADDING = 8;
export const DEFAULT_MENU_WIDTH = 200;
export const DEFAULT_MENU_HEIGHT = 240;

export function clampMenuCoordinates(
  x: number,
  y: number,
  menuWidth = DEFAULT_MENU_WIDTH,
  menuHeight = DEFAULT_MENU_HEIGHT,
  viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 1080,
): { readonly x: number; readonly y: number } {
  let clampedX = Math.max(VIEWPORT_PADDING, x);
  let clampedY = Math.max(VIEWPORT_PADDING, y);

  if (clampedX + menuWidth + VIEWPORT_PADDING > viewportWidth) {
    clampedX = Math.max(VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING);
  }

  if (clampedY + menuHeight + VIEWPORT_PADDING > viewportHeight) {
    clampedY = Math.max(VIEWPORT_PADDING, viewportHeight - menuHeight - VIEWPORT_PADDING);
  }

  return { x: Math.round(clampedX), y: Math.round(clampedY) };
}
