import { useCallback } from "react";
import type { EdgeBoxEdges } from "../edgeBoxEdges";
import { alignRect, clampRectToViewport, edgesToOffsetRect, rectToEdges, type EdgeBoxLayoutRect } from "../edgeBoxRect";
import type { Dimensions, Position } from "../edgeBoxTypes";
import type { EdgePosition } from "./useEdgeBoxCssPosition";
import { DEFAULT_SAFE_ZONE } from "../internal/edgeBoxConstants";

export interface UseEdgeBoxLinkedBoxesOptions {
  position: EdgePosition;
  safeZone?: number;
}

export interface UseEdgeBoxLinkedBoxesResult {
  getRectFromEdges: (edges: EdgeBoxEdges, offset?: Position, size?: Dimensions) => EdgeBoxLayoutRect;
  getLinkedRect: (sourceRect: EdgeBoxLayoutRect, size: Dimensions, clamp?: boolean) => EdgeBoxLayoutRect;
  getLinkedEdges: (sourceRect: EdgeBoxLayoutRect, size: Dimensions, clamp?: boolean) => EdgeBoxEdges;
  clampRect: (rect: EdgeBoxLayoutRect) => EdgeBoxLayoutRect;
}

export function useEdgeBoxLinkedBoxes({
  position,
  safeZone = DEFAULT_SAFE_ZONE,
}: UseEdgeBoxLinkedBoxesOptions): UseEdgeBoxLinkedBoxesResult {
  const clampRect = useCallback((rect: EdgeBoxLayoutRect) => {
    return clampRectToViewport(rect, safeZone);
  }, [safeZone]);

  const getRectFromEdges = useCallback((edges: EdgeBoxEdges, offset?: Position, size?: Dimensions) => {
    return edgesToOffsetRect(edges, offset, size);
  }, []);

  const getLinkedRect = useCallback((sourceRect: EdgeBoxLayoutRect, size: Dimensions, clamp = false) => {
    const alignedRect = alignRect(sourceRect, size, position);
    return clamp ? clampRectToViewport(alignedRect, safeZone) : alignedRect;
  }, [position, safeZone]);

  const getLinkedEdges = useCallback((sourceRect: EdgeBoxLayoutRect, size: Dimensions, clamp = false) => {
    return rectToEdges(getLinkedRect(sourceRect, size, clamp));
  }, [getLinkedRect]);

  return {
    getRectFromEdges,
    getLinkedRect,
    getLinkedEdges,
    clampRect,
  };
}
