import type { Dimensions, Position } from "../edgeBoxTypes";

export interface ViewportSafeBounds {
  minLeft: number;
  minTop: number;
  maxRight: number;
  maxBottom: number;
  availableWidth: number;
  availableHeight: number;
}

export function getViewportSafeBounds(
  viewportWidth: number,
  viewportHeight: number,
  safeZone: number,
): ViewportSafeBounds {
  const minLeft = safeZone;
  const minTop = safeZone;
  const maxRight = viewportWidth - safeZone;
  const maxBottom = viewportHeight - safeZone;

  return {
    minLeft,
    minTop,
    maxRight,
    maxBottom,
    availableWidth: maxRight - minLeft,
    availableHeight: maxBottom - minTop,
  };
}

export function clampLeftToViewport(
  left: number,
  width: number,
  safeZone: number,
  viewportWidth: number,
): number {
  const minLeft = safeZone;
  const maxLeft = Math.max(minLeft, viewportWidth - safeZone - width);
  return Math.max(minLeft, Math.min(maxLeft, left));
}

export function clampTopToViewport(
  top: number,
  height: number,
  safeZone: number,
  viewportHeight: number,
): number {
  const minTop = safeZone;
  const maxTop = Math.max(minTop, viewportHeight - safeZone - height);
  return Math.max(minTop, Math.min(maxTop, top));
}

export function clampTopLeftToViewport(
  left: number,
  top: number,
  dimensions: Dimensions,
  safeZone: number,
  viewportWidth: number,
  viewportHeight: number,
): Position {
  return {
    x: clampLeftToViewport(left, dimensions.width, safeZone, viewportWidth),
    y: clampTopToViewport(top, dimensions.height, safeZone, viewportHeight),
  };
}

export function clampDimensionsToViewport(
  requestedDimensions: Dimensions,
  options: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    safeZone: number;
    viewportWidth: number;
    viewportHeight: number;
  },
): Dimensions {
  const {
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    safeZone,
    viewportWidth,
    viewportHeight,
  } = options;

  const bounds = getViewportSafeBounds(viewportWidth, viewportHeight, safeZone);

  return {
    width: Math.min(
      Math.max(minWidth, Math.min(maxWidth, requestedDimensions.width)),
      Math.max(0, bounds.availableWidth),
    ),
    height: Math.min(
      Math.max(minHeight, Math.min(maxHeight, requestedDimensions.height)),
      Math.max(0, bounds.availableHeight),
    ),
  };
}

export function getViewportClampDelta(
  rect: Pick<DOMRectReadOnly, "left" | "right" | "top" | "bottom" | "width" | "height">,
  safeZone: number,
  viewportWidth: number,
  viewportHeight: number,
): Position {
  const bounds = getViewportSafeBounds(viewportWidth, viewportHeight, safeZone);

  let dx = 0;
  let dy = 0;

  if (rect.width > bounds.availableWidth) {
    dx = bounds.minLeft - rect.left;
  } else if (rect.left < bounds.minLeft) {
    dx = bounds.minLeft - rect.left;
  } else if (rect.right > bounds.maxRight) {
    dx = bounds.maxRight - rect.right;
  }

  if (rect.height > bounds.availableHeight) {
    dy = bounds.minTop - rect.top;
  } else if (rect.top < bounds.minTop) {
    dy = bounds.minTop - rect.top;
  } else if (rect.bottom > bounds.maxBottom) {
    dy = bounds.maxBottom - rect.bottom;
  }

  return { x: dx, y: dy };
}
