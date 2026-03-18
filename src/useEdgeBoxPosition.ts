import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { EdgePosition } from "./cssEdgePosition";
import { PaddingValues } from "./padding";
import {
  DEFAULT_DISABLE_AUTO_RECALC,
  DEFAULT_EDGE_PADDING,
  DEFAULT_EDGE_POSITION,
  DEFAULT_SAFE_ZONE,
} from "./constants";

export interface CenterPoint {
  x: number;
  y: number;
}

export interface EdgeBoxEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  center: CenterPoint;
}

export interface UseEdgeBoxPositionOptions {
  position?: EdgePosition;
  width?: number;
  height?: number;
  padding?: PaddingValues | number;
  safeZone?: number;
  disableAutoRecalc?: boolean;
}

export interface UseEdgeBoxPositionResult {
  edges: EdgeBoxEdges;
  recalculate: () => void;
  updateEdges: (edges: Partial<EdgeBoxEdges>) => void;
  resetPosition: () => void;
}

function calculateCenter(edges: Omit<EdgeBoxEdges, 'center'>): CenterPoint {
  return {
    x: (edges.left + edges.right) / 2,
    y: (edges.top + edges.bottom) / 2,
  };
}

function calculateEdges(
  position: EdgePosition,
  width: number | undefined,
  height: number | undefined,
  paddingValues: PaddingValues,
  safeZone: number,
): EdgeBoxEdges {
  if (typeof window === 'undefined') {
    const edges = { left: 0, right: 0, top: 0, bottom: 0 };
    return { ...edges, center: calculateCenter(edges) };
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

  const edges = { left, right, top, bottom };
  return { ...edges, center: calculateCenter(edges) };
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

  const paddingValues: PaddingValues = useMemo(() => {
    return typeof paddingProp === "number"
      ? { top: paddingProp, right: paddingProp, bottom: paddingProp, left: paddingProp }
      : paddingProp;
  }, [paddingProp]);

  const [edges, setEdges] = useState<EdgeBoxEdges>(() =>
    calculateEdges(position, width, height, paddingValues, safeZone)
  );

  const isManualPositionRef = useRef(false);

  const recalculate = useCallback(() => {
    if (isManualPositionRef.current && typeof window !== 'undefined') {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setEdges(prev => {
        const derivedWidth = prev.right - prev.left;
        const derivedHeight = prev.bottom - prev.top;
        const w = width ?? (derivedWidth > 0 ? derivedWidth : undefined);
        const h = height ?? (derivedHeight > 0 ? derivedHeight : undefined);

        if (w !== undefined && h !== undefined) {
          const minLeft = safeZone;
          const maxLeft = viewportWidth - safeZone - w;
          const minTop = safeZone;
          const maxTop = viewportHeight - safeZone - h;

          const left = Math.max(minLeft, Math.min(maxLeft, prev.left));
          const top = Math.max(minTop, Math.min(maxTop, prev.top));

          const next = {
            left,
            top,
            right: left + w,
            bottom: top + h,
          };

          return { ...next, center: calculateCenter(next) };
        }

        // If we can't determine a box size, fall back to the default positional calculation.
        const next = calculateEdges(position, width, height, paddingValues, safeZone);
        return next;
      });
      return;
    }

    const newEdges = calculateEdges(position, width, height, paddingValues, safeZone);
    setEdges(newEdges);
  }, [position, width, height, paddingValues, safeZone]);

  const updateEdges = useCallback((newEdges: Partial<EdgeBoxEdges>) => {
    setEdges(prev => {
      const merged = {
        left: newEdges.left ?? prev.left,
        right: newEdges.right ?? prev.right,
        top: newEdges.top ?? prev.top,
        bottom: newEdges.bottom ?? prev.bottom,
      };
      return { ...merged, center: calculateCenter(merged) };
    });

    isManualPositionRef.current = true;
  }, []);

  const resetPosition = useCallback(() => {
    isManualPositionRef.current = false;
    setEdges(calculateEdges(position, width, height, paddingValues, safeZone));
  }, [position, width, height, paddingValues, safeZone]);

  useEffect(() => {
    if (disableAutoRecalc) return;

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
