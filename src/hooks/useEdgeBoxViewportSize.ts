import { useEffect, useMemo, useState } from "react";
import { DEFAULT_VIEWPORT_FALLBACK_HEIGHT, DEFAULT_VIEWPORT_FALLBACK_WIDTH } from "../internal/edgeBoxConstants";
import { resolveEdgeBoxPaddingValues, type PaddingValue, type PaddingValues } from "./useEdgeBoxPaddingValues";

export interface UseEdgeBoxViewportSizeOptions {
  padding?: PaddingValue;
  disabled?: boolean;
  listenToVisualViewport?: boolean;
  fallbackWidth?: number;
  fallbackHeight?: number;
}

export interface UseEdgeBoxViewportSizeResult {
  viewportWidth: number;
  viewportHeight: number;
  width: number;
  height: number;
  paddingValues: PaddingValues;
}

export function useEdgeBoxViewportSize({
  padding,
  disabled = false,
  listenToVisualViewport = true,
  fallbackWidth = DEFAULT_VIEWPORT_FALLBACK_WIDTH,
  fallbackHeight = DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
}: UseEdgeBoxViewportSizeOptions = {}): UseEdgeBoxViewportSizeResult {
  const paddingValues = useMemo(() => resolveEdgeBoxPaddingValues(padding), [padding]);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === "undefined" ? fallbackWidth : window.innerWidth,
    height: typeof window === "undefined" ? fallbackHeight : window.innerHeight,
  }));

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;

    const updateViewportSize = () => {
      setViewportSize((prev) => {
        const next = {
          width: window.innerWidth,
          height: window.innerHeight,
        };

        return prev.width === next.width && prev.height === next.height ? prev : next;
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    if (listenToVisualViewport) {
      window.visualViewport?.addEventListener("resize", updateViewportSize);
    }

    return () => {
      window.removeEventListener("resize", updateViewportSize);
      if (listenToVisualViewport) {
        window.visualViewport?.removeEventListener("resize", updateViewportSize);
      }
    };
  }, [disabled, listenToVisualViewport]);

  return useMemo(() => ({
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
    width: Math.max(0, viewportSize.width - paddingValues.left - paddingValues.right),
    height: Math.max(0, viewportSize.height - paddingValues.top - paddingValues.bottom),
    paddingValues,
  }), [paddingValues, viewportSize.height, viewportSize.width]);
}
