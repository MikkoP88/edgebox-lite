import { useState, useCallback, useEffect, useRef } from "react";
import type { EdgePosition } from "./useEdgeBoxCssPosition";
import { useEdgeBoxPaddingValues, type PaddingValue, type PaddingValues } from "./useEdgeBoxPaddingValues";
import { areEdgeBoxRectsEqual, mergeEdgeBoxEdges, toEdgeBoxEdges } from "../edgeBoxEdges";
import {
  DEFAULT_DISABLE_AUTO_RECALC,
  DEFAULT_EDGE_PADDING,
  DEFAULT_EDGE_POSITION,
  DEFAULT_SAFE_ZONE,
} from "../internal/edgeBoxConstants";
import { clampTopLeftToViewport } from "../internal/edgeBoxViewportBounds";

export type { CenterPoint, EdgeBoxEdges } from "../edgeBoxEdges";
import type { EdgeBoxEdges } from "../edgeBoxEdges";

export interface UseEdgeBoxPositionOptions {
  position?: EdgePosition;
  width?: number;
  height?: number;
  padding?: PaddingValue;
  safeZone?: number;
  disableAutoRecalc?: boolean;
}

export interface UseEdgeBoxPositionResult {
  edges: EdgeBoxEdges;
  recalculate: () => void;
  updateEdges: (edges: Partial<EdgeBoxEdges>, manualPosition?: boolean) => void;
  resetPosition: () => void;
}

function calculateEdges(
  position: EdgePosition,
  width: number | undefined,
  height: number | undefined,
  paddingValues: PaddingValues,
  safeZone: number,
): EdgeBoxEdges {
  if (typeof window === 'undefined') {
    return toEdgeBoxEdges({ left: 0, right: 0, top: 0, bottom: 0 });
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left: number, right: number, top: number, bottom: number;

  if (position === 'top-center' || position === 'bottom-center') {
    if (width !== undefined) {
      const centerX = viewportWidth / 2;
      left = centerX - width / 2;
      right = centerX + width / 2;
    } else {
      left = viewportWidth / 2;
      right = left;
    }
  } else if (position === 'top-left' || position === 'bottom-left') {
    left = paddingValues.left;
    right = width !== undefined ? left + width : left;
  } else {
    right = viewportWidth - paddingValues.right;
    left = width !== undefined ? right - width : right;
  }

  if (position === 'top-left' || position === 'top-right' || position === 'top-center') {
    top = paddingValues.top;
    bottom = height !== undefined ? top + height : top;
  } else {
    bottom = viewportHeight - paddingValues.bottom;
    top = height !== undefined ? bottom - height : bottom;
  }

  if (width !== undefined) {
    const minLeft = safeZone;
    const maxLeft = Math.max(minLeft, viewportWidth - safeZone - width);
    left = Math.max(minLeft, Math.min(maxLeft, left));
    right = left + width;
  }

  if (height !== undefined) {
    const minTop = safeZone;
    const maxTop = Math.max(minTop, viewportHeight - safeZone - height);
    top = Math.max(minTop, Math.min(maxTop, top));
    bottom = top + height;
  }

  return toEdgeBoxEdges({ left, right, top, bottom });
}

function clampManualEdgesToViewport(
  edges: EdgeBoxEdges,
  width: number | undefined,
  height: number | undefined,
  safeZone: number,
  position: EdgePosition,
): EdgeBoxEdges | null {
  if (typeof window === "undefined") {
    return null;
  }

  const derivedWidth = edges.right - edges.left;
  const derivedHeight = edges.bottom - edges.top;
  const nextWidth = width ?? (derivedWidth > 0 ? derivedWidth : undefined);
  const nextHeight = height ?? (derivedHeight > 0 ? derivedHeight : undefined);

  if (nextWidth === undefined || nextHeight === undefined) {
    return null;
  }

  const centerX = (edges.left + edges.right) / 2;
  const nextLeft = position === "top-center" || position === "bottom-center"
    ? centerX - nextWidth / 2
    : position === "top-right" || position === "bottom-right"
      ? edges.right - nextWidth
      : edges.left;
  const nextTop = position === "bottom-left" || position === "bottom-center" || position === "bottom-right"
    ? edges.bottom - nextHeight
    : edges.top;

  const { x: left, y: top } = clampTopLeftToViewport(
    nextLeft,
    nextTop,
    { width: nextWidth, height: nextHeight },
    safeZone,
    window.innerWidth,
    window.innerHeight,
  );

  return toEdgeBoxEdges({
    left,
    top,
    right: left + nextWidth,
    bottom: top + nextHeight,
  });
}

export function useEdgeBoxPosition(options: UseEdgeBoxPositionOptions = {}): UseEdgeBoxPositionResult {
  const {
    position = DEFAULT_EDGE_POSITION,
    width,
    height,
    padding: paddingProp = DEFAULT_EDGE_PADDING,
    safeZone = DEFAULT_SAFE_ZONE,
    disableAutoRecalc = DEFAULT_DISABLE_AUTO_RECALC,
  } = options;

  const paddingValues = useEdgeBoxPaddingValues(paddingProp);

  const [edges, setEdges] = useState<EdgeBoxEdges>(() =>
    calculateEdges(position, width, height, paddingValues, safeZone)
  );

  const isManualPositionRef = useRef(false);

  const recalculate = useCallback(() => {
    if (isManualPositionRef.current && typeof window !== 'undefined') {
      setEdges(prev => {
        const clamped = clampManualEdgesToViewport(prev, width, height, safeZone, position);
        if (clamped) {
          if (areEdgeBoxRectsEqual(prev, clamped)) {
            return prev;
          }
          return clamped;
        }

        // If we can't determine a box size, fall back to the default positional calculation.
        const fallback = calculateEdges(position, width, height, paddingValues, safeZone);
        if (areEdgeBoxRectsEqual(prev, fallback)) {
          return prev;
        }
        return fallback;
      });
      return;
    }

    setEdges(prev => {
      const next = calculateEdges(position, width, height, paddingValues, safeZone);
      if (areEdgeBoxRectsEqual(prev, next)) {
        return prev;
      }
      return next;
    });
  }, [position, width, height, paddingValues, safeZone]);

  const updateEdges = useCallback((newEdges: Partial<EdgeBoxEdges>, manualPosition = true) => {
    setEdges(prev => {
      const next = mergeEdgeBoxEdges(prev, newEdges);
      if (areEdgeBoxRectsEqual(prev, next)) {
        return prev;
      }
      return next;
    });

    isManualPositionRef.current = manualPosition;
  }, []);

  const resetPosition = useCallback(() => {
    isManualPositionRef.current = false;
    setEdges(prev => {
      const next = calculateEdges(position, width, height, paddingValues, safeZone);
      if (areEdgeBoxRectsEqual(prev, next)) {
        return prev;
      }
      return next;
    });
  }, [position, width, height, paddingValues, safeZone]);

  useEffect(() => {
    if (disableAutoRecalc) return;
    if (typeof window === "undefined") return;

    const handleResize = () => {
      recalculate();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recalculate, disableAutoRecalc]);

  useEffect(() => {
    if (disableAutoRecalc) return;
    recalculate();
  }, [recalculate, disableAutoRecalc]);

  return {
    edges,
    recalculate,
    updateEdges,
    resetPosition,
  };
}
