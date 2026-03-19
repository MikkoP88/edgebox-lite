import type { Dimensions, Position } from "./edgeBoxTypes";
import { toEdgeBoxEdges, type EdgeBoxEdges, type EdgeBoxRect } from "./edgeBoxEdges";
import type { EdgePosition } from "./hooks/useEdgeBoxCssPosition";
import { DEFAULT_SAFE_ZONE } from "./internal/edgeBoxConstants";
import { clampTopLeftToViewport } from "./internal/edgeBoxViewportBounds";

export interface EdgeBoxLayoutRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function rectToEdges(rect: EdgeBoxLayoutRect): EdgeBoxEdges {
  return toEdgeBoxEdges({
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
  });
}

export function edgesToRect(edges: Pick<EdgeBoxRect, "left" | "top" | "right" | "bottom">): EdgeBoxLayoutRect {
  return {
    left: edges.left,
    top: edges.top,
    width: edges.right - edges.left,
    height: edges.bottom - edges.top,
  };
}

export function alignRect(
  containerRect: EdgeBoxLayoutRect,
  size: Dimensions,
  position: EdgePosition,
): EdgeBoxLayoutRect {
  const left = position.endsWith("left")
    ? containerRect.left
    : position.endsWith("center")
      ? containerRect.left + (containerRect.width - size.width) / 2
      : containerRect.left + containerRect.width - size.width;

  const top = position.startsWith("top")
    ? containerRect.top
    : containerRect.top + containerRect.height - size.height;

  return {
    left,
    top,
    width: size.width,
    height: size.height,
  };
}

export function clampRectToViewport(
  rect: EdgeBoxLayoutRect,
  safeZone = DEFAULT_SAFE_ZONE,
): EdgeBoxLayoutRect {
  if (typeof window === "undefined") {
    return rect;
  }

  const clampedPosition = clampTopLeftToViewport(
    rect.left,
    rect.top,
    { width: rect.width, height: rect.height },
    safeZone,
    window.innerWidth,
    window.innerHeight,
  );

  return {
    ...rect,
    left: clampedPosition.x,
    top: clampedPosition.y,
  };
}

export function edgesToOffsetRect(
  edges: Pick<EdgeBoxRect, "left" | "top" | "right" | "bottom">,
  offset: Position = { x: 0, y: 0 },
  size?: Dimensions,
): EdgeBoxLayoutRect {
  const rect = edgesToRect(edges);

  return {
    left: rect.left + offset.x,
    top: rect.top + offset.y,
    width: size?.width ?? rect.width,
    height: size?.height ?? rect.height,
  };
}
