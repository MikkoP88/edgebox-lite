import { useMemo } from "react";
import type { Position } from "../edgeBoxTypes";

const ZERO_POSITION: Position = { x: 0, y: 0 };

export interface UseEdgeBoxTransformOptions {
  dragOffset?: Position;
  resizeOffset?: Position;
  isResizing?: boolean;
  includeResizeOffset?: boolean;
  baseTransform?: string;
}

export interface UseEdgeBoxTransformResult {
  offset: Position;
  transform: string;
}

/**
 * Composes EdgeBox motion offsets into a single translate3d transform string.
 *
 * This keeps committed geometry (`edges`) separate from temporary visual motion.
 */
export function useEdgeBoxTransform({
  dragOffset = ZERO_POSITION,
  resizeOffset = ZERO_POSITION,
  isResizing,
  includeResizeOffset = true,
  baseTransform,
}: UseEdgeBoxTransformOptions = {}): UseEdgeBoxTransformResult {
  return useMemo(() => {
    const applyResizeOffset = includeResizeOffset && (isResizing ?? true);

    const offset = {
      x: dragOffset.x + (applyResizeOffset ? resizeOffset.x : 0),
      y: dragOffset.y + (applyResizeOffset ? resizeOffset.y : 0),
    };

    const translate = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
    const transform = baseTransform ? `${baseTransform} ${translate}` : translate;

    return {
      offset,
      transform,
    };
  }, [baseTransform, dragOffset.x, dragOffset.y, includeResizeOffset, isResizing, resizeOffset.x, resizeOffset.y]);
}
