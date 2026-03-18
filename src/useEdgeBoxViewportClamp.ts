import { useCallback, useEffect } from "react";
import type { EdgeBoxEdges } from "./useEdgeBoxPosition";
import { DEFAULT_SAFE_ZONE } from "./constants";

export interface UseEdgeBoxViewportClampOptions {
  elementRef: React.RefObject<HTMLElement>;
  updateEdges: (edges: Partial<EdgeBoxEdges>) => void;
  safeZone?: number;
  disabled?: boolean;
  deps?: readonly unknown[];
}

export interface UseEdgeBoxViewportClampResult {
  clampNow: () => void;
}

/**
 * Keeps an auto-sized element inside the viewport by measuring its DOM rect and committing
 * corrected edges via `updateEdges`.
 *
 * Use this for elements whose size changes outside drag/resize gestures (menus, popovers, etc.).
 */
export function useEdgeBoxViewportClamp({
  elementRef,
  updateEdges,
  safeZone = DEFAULT_SAFE_ZONE,
  disabled = false,
  deps = [],
}: UseEdgeBoxViewportClampOptions): UseEdgeBoxViewportClampResult {
  const clampIntoViewport = useCallback(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const minLeft = safeZone;
    const minTop = safeZone;
    const maxRight = viewportWidth - safeZone;
    const maxBottom = viewportHeight - safeZone;

    const availableWidth = maxRight - minLeft;
    const availableHeight = maxBottom - minTop;

    let dx = 0;
    let dy = 0;

    if (rect.width > availableWidth) {
      dx = minLeft - rect.left;
    } else if (rect.left < minLeft) {
      dx = minLeft - rect.left;
    } else if (rect.right > maxRight) {
      dx = maxRight - rect.right;
    }

    if (rect.height > availableHeight) {
      dy = minTop - rect.top;
    } else if (rect.top < minTop) {
      dy = minTop - rect.top;
    } else if (rect.bottom > maxBottom) {
      dy = maxBottom - rect.bottom;
    }

    if (dx === 0 && dy === 0) return;

    updateEdges({
      left: rect.left + dx,
      right: rect.right + dx,
      top: rect.top + dy,
      bottom: rect.bottom + dy,
    });
  }, [disabled, elementRef, safeZone, updateEdges]);

  // Clamp after dependency changes (e.g. open/close) once the DOM has painted.
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const id = window.requestAnimationFrame(() => clampIntoViewport());
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, clampIntoViewport, ...deps]);

  // Clamp on intrinsic size changes (transitions, content updates, responsive changes).
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const el = elementRef.current;
    if (!el) return;

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      clampIntoViewport();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [disabled, clampIntoViewport, elementRef]);

  return {
    clampNow: clampIntoViewport,
  };
}
