import { useMemo } from "react";

/** Padding can be a number or object with specific directions */
export type PaddingValue = number | {
  all?: number;
  horizontal?: number;
  vertical?: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/** Resolved padding values for all edges */
export interface PaddingValues {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Custom hook that resolves padding prop into individual edge values.
 */
export function useEdgeBoxPaddingValues(
  padding: PaddingValue = 24
): PaddingValues {
  return useMemo(() => {
    if (typeof padding === 'number') {
      return {
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
      };
    }

    // Object padding - resolve each side with precedence
    const defaultPadding = 24;
    const all = padding.all ?? defaultPadding;
    const horizontal = padding.horizontal ?? all;
    const vertical = padding.vertical ?? all;

    return {
      top: padding.top ?? vertical,
      bottom: padding.bottom ?? vertical,
      left: padding.left ?? horizontal,
      right: padding.right ?? horizontal,
    };
  }, [padding]);
}

/** @deprecated Use `useEdgeBoxPaddingValues` instead. */
export const usePaddingValues = useEdgeBoxPaddingValues;
