import { useMemo, useCallback } from "react";
import type { PaddingValues } from "./useEdgeBoxPaddingValues";

/** Position options for elements */
export type EdgePosition = "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center";

/** CSS edge position - track actual CSS properties instead of converting */
export interface CssEdgePosition {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

/** Return value for useEdgeBoxCssPosition hook */
export interface UseEdgeBoxCssPositionResult {
  /** Function to calculate CSS edge position */
  cssEdgePosition: () => CssEdgePosition;
  /** Initial CSS edge position */
  initialCssPosition: CssEdgePosition;
}

/**
 * Custom hook that calculates CSS edge position for boundary calculations.
 */
export function useEdgeBoxCssPosition(options: {
  position: EdgePosition;
  paddingValues: PaddingValues;
}): UseEdgeBoxCssPositionResult {
  const { position, paddingValues } = options;

  const calculateCssPosition = useCallback((): CssEdgePosition => {
    if (typeof window === 'undefined') return { left: 0, top: 0 };

    const positionResult: CssEdgePosition = {};

    // Calculate horizontal position using actual CSS property
    if (position === "top-center" || position === "bottom-center") {
      // Center positions use left: 50%
      positionResult.left = window.innerWidth / 2;
    } else if (position === "top-left" || position === "bottom-left") {
      // Left positions - use LEFT property
      positionResult.left = paddingValues.left;
    } else {
      // Right positions - use RIGHT property, not calculated left!
      positionResult.right = paddingValues.right;
    }

    // Calculate vertical position using actual CSS property
    if (position === "top-left" || position === "top-right" || position === "top-center") {
      // Top positions - use TOP property
      positionResult.top = paddingValues.top;
    } else {
      // Bottom positions - use BOTTOM property, not calculated top!
      positionResult.bottom = paddingValues.bottom;
    }

    return positionResult;
  }, [position, paddingValues]);

  const initialCssPosition = useMemo(() => calculateCssPosition(), [calculateCssPosition]);

  return {
    cssEdgePosition: calculateCssPosition,
    initialCssPosition,
  };
}

