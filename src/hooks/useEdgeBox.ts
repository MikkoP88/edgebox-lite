import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Position, Dimensions, ResizeDirection } from "../edgeBoxTypes";
import { useEdgeBoxPosition, type EdgeBoxEdges } from "./useEdgeBoxPosition";
import { useEdgeBoxDrag } from "./useEdgeBoxDrag";
import { useEdgeBoxResize, type ResetSizeOptions } from "./useEdgeBoxResize";
import { useEdgeBoxTransform } from "./useEdgeBoxTransform";
import type { EdgePosition } from "./useEdgeBoxCssPosition";
import { useEdgeBoxPaddingValues, type PaddingValue } from "./useEdgeBoxPaddingValues";
import type { EdgeBoxAutoFocus } from "../internal/edgeBoxAutoFocus";
import {
  DEFAULT_AUTO_FOCUS,
  DEFAULT_AUTO_FOCUS_SENSITIVITY,
  DEFAULT_COMMIT_TO_EDGES,
  DEFAULT_DISABLE_AUTO_RECALC,
  DEFAULT_DRAG_END_EVENT_DELAY,
  DEFAULT_DRAG_START_DELAY,
  DEFAULT_DRAG_START_DISTANCE,
  DEFAULT_EDGE_PADDING,
  DEFAULT_EDGE_POSITION,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_MIN_WIDTH,
  DEFAULT_RESIZE_INITIAL_HEIGHT,
  DEFAULT_RESIZE_INITIAL_WIDTH,
  DEFAULT_SAFE_ZONE,
  DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  DEFAULT_VIEWPORT_FALLBACK_WIDTH,
} from "../internal/edgeBoxConstants";

export interface UseEdgeBoxOptions {
  elementRef?: React.RefObject<HTMLElement>;
  position?: EdgePosition;
  width?: number;
  height?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  padding?: PaddingValue;
  safeZone?: number;
  disableAutoRecalc?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  commitToEdges?: boolean;
  autoFocus?: EdgeBoxAutoFocus;
  autoFocusSensitivity?: number;
  dragStartDistance?: number;
  dragStartDelay?: number;
  dragEndEventDelay?: number;
  baseTransform?: string;
  onCommitSize?: (dimensions: Dimensions) => void;
  onDragEnd?: (finalOffset: Position) => void;
  onResizeEnd?: (finalDimensions: Dimensions, finalOffset: Position) => void;
}

export interface UseEdgeBoxDragProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export interface UseEdgeBoxResizeHandleProps {
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export interface UseEdgeBoxResult {
  ref: React.RefObject<HTMLDivElement>;
  style: React.CSSProperties;
  edges: EdgeBoxEdges;
  dimensions: Dimensions;
  offset: Position;
  transform: string;
  dragOffset: Position;
  resizeOffset: Position;
  isDragging: boolean;
  isPendingDrag: boolean;
  isResizing: boolean;
  resizeDirection: ResizeDirection | null;
  updateEdges: (edges: Partial<EdgeBoxEdges>, manualPosition?: boolean) => void;
  recalculate: () => void;
  resetPosition: () => void;
  resetDragOffset: () => void;
  cancelDrag: () => void;
  resetSize: (options?: ResetSizeOptions) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleResizeStart: (direction: ResizeDirection, e: React.MouseEvent | React.TouchEvent) => void;
  getDragProps: () => UseEdgeBoxDragProps;
  getResizeHandleProps: (direction: ResizeDirection) => UseEdgeBoxResizeHandleProps;
}

export function useEdgeBox({
  elementRef,
  position = DEFAULT_EDGE_POSITION,
  width,
  height,
  initialWidth,
  initialHeight,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxWidth = typeof window !== "undefined" ? window.innerWidth : DEFAULT_VIEWPORT_FALLBACK_WIDTH,
  maxHeight = typeof window !== "undefined" ? window.innerHeight : DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  padding = DEFAULT_EDGE_PADDING,
  safeZone = DEFAULT_SAFE_ZONE,
  disableAutoRecalc = DEFAULT_DISABLE_AUTO_RECALC,
  draggable = true,
  resizable = true,
  commitToEdges = DEFAULT_COMMIT_TO_EDGES,
  autoFocus = DEFAULT_AUTO_FOCUS,
  autoFocusSensitivity = DEFAULT_AUTO_FOCUS_SENSITIVITY,
  dragStartDistance = DEFAULT_DRAG_START_DISTANCE,
  dragStartDelay = DEFAULT_DRAG_START_DELAY,
  dragEndEventDelay = DEFAULT_DRAG_END_EVENT_DELAY,
  baseTransform,
  onCommitSize,
  onDragEnd,
  onResizeEnd,
}: UseEdgeBoxOptions = {}): UseEdgeBoxResult {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = (elementRef ?? internalRef) as React.RefObject<HTMLDivElement>;
  const paddingValues = useEdgeBoxPaddingValues(padding);

  const resolvedInitialWidth = width ?? initialWidth ?? DEFAULT_RESIZE_INITIAL_WIDTH;
  const resolvedInitialHeight = height ?? initialHeight ?? DEFAULT_RESIZE_INITIAL_HEIGHT;

  const [committedSize, setCommittedSize] = useState<Dimensions>({
    width: resolvedInitialWidth,
    height: resolvedInitialHeight,
  });

  useEffect(() => {
    setCommittedSize(prev => {
      if (prev.width === resolvedInitialWidth && prev.height === resolvedInitialHeight) {
        return prev;
      }

      return {
        width: resolvedInitialWidth,
        height: resolvedInitialHeight,
      };
    });
  }, [resolvedInitialHeight, resolvedInitialWidth]);

  const [measuredSize, setMeasuredSize] = useState<Partial<Dimensions>>({});
  const tracksIntrinsicSize = !resizable && (width === undefined || height === undefined);

  useEffect(() => {
    if (!tracksIntrinsicSize) return;
    if (typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    const updateMeasuredSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      setMeasuredSize(prev => {
        const nextWidth = width === undefined ? rect.width : prev.width;
        const nextHeight = height === undefined ? rect.height : prev.height;

        if (
          prev.width !== undefined
          && nextWidth !== undefined
          && Math.abs(prev.width - nextWidth) < 0.5
          && prev.height !== undefined
          && nextHeight !== undefined
          && Math.abs(prev.height - nextHeight) < 0.5
        ) {
          return prev;
        }

        if (
          prev.width === nextWidth
          && prev.height === nextHeight
        ) {
          return prev;
        }

        return {
          width: nextWidth,
          height: nextHeight,
        };
      });
    };

    updateMeasuredSize();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateMeasuredSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [height, tracksIntrinsicSize, width]);

  const positionWidth = resizable ? committedSize.width : width ?? measuredSize.width;
  const positionHeight = resizable ? committedSize.height : height ?? measuredSize.height;

  const { edges, updateEdges, recalculate, resetPosition } = useEdgeBoxPosition({
    position,
    width: positionWidth,
    height: positionHeight,
    padding,
    safeZone,
    disableAutoRecalc,
  });

  const {
    dragOffset,
    isDragging,
    isPendingDrag,
    handleMouseDown,
    handleTouchStart,
    resetDragOffset,
    cancelDrag,
  } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges,
    safeZone,
    dragStartDistance,
    dragStartDelay,
    dragEndEventDelay,
    autoFocus,
    autoFocusSensitivity,
    elementRef: ref,
    onDragEnd,
  });

  const handleCommitSize = useCallback((finalDimensions: Dimensions) => {
    setCommittedSize(finalDimensions);
    onCommitSize?.(finalDimensions);
  }, [onCommitSize]);

  const {
    dimensions,
    resizeOffset,
    isResizing,
    resizeDirection,
    handleResizeStart,
    resetSize,
  } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges,
    onCommitSize: handleCommitSize,
    baseOffset: dragOffset,
    initialWidth: committedSize.width,
    initialHeight: committedSize.height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    safeZone,
    autoFocus,
    autoFocusSensitivity,
    onResizeEnd,
  });

  const isCenterPosition = position === "top-center" || position === "bottom-center";
  const isLeftPosition = position === "top-left" || position === "bottom-left";
  const isTopPosition = position === "top-left" || position === "top-right" || position === "top-center";

  const resolvedAnchorStyle = useMemo(() => {
    const style: React.CSSProperties = {};
    const baseTransforms: string[] = [];
    const autoWidth = !resizable && width === undefined;
    const autoHeight = !resizable && height === undefined;

    if (typeof window === "undefined") {
      const leftPad = Math.max(paddingValues.left, safeZone);
      const rightPad = Math.max(paddingValues.right, safeZone);
      const topPad = Math.max(paddingValues.top, safeZone);
      const bottomPad = Math.max(paddingValues.bottom, safeZone);

      if (autoWidth) {
        if (isCenterPosition) {
          style.left = "50%";
          baseTransforms.push("translateX(-50%)");
        } else if (isLeftPosition) {
          style.left = leftPad;
        } else {
          style.right = rightPad;
        }
      } else {
        style.left = edges.left;
      }

      if (autoHeight) {
        if (isTopPosition) {
          style.top = topPad;
        } else {
          style.bottom = bottomPad;
        }
      } else {
        style.top = edges.top;
      }

      return {
        style,
        baseTransform: baseTransforms.join(" "),
      };
    }

    if (autoWidth) {
      if (isCenterPosition) {
        style.left = (edges.left + edges.right) / 2;
        baseTransforms.push("translateX(-50%)");
      } else if (isLeftPosition) {
        style.left = edges.left;
      } else {
        style.right = window.innerWidth - edges.right;
      }
    } else {
      style.left = edges.left;
    }

    if (autoHeight) {
      if (isTopPosition) {
        style.top = edges.top;
      } else {
        style.bottom = window.innerHeight - edges.bottom;
      }
    } else {
      style.top = edges.top;
    }

    return {
      style,
      baseTransform: baseTransforms.join(" "),
    };
  }, [
    edges.bottom,
    edges.left,
    edges.right,
    edges.top,
    height,
    isCenterPosition,
    isLeftPosition,
    isTopPosition,
    paddingValues.bottom,
    paddingValues.left,
    paddingValues.right,
    paddingValues.top,
    resizable,
    safeZone,
    width,
  ]);

  const composedBaseTransform = useMemo(() => {
    return [resolvedAnchorStyle.baseTransform, baseTransform].filter(Boolean).join(" ");
  }, [baseTransform, resolvedAnchorStyle.baseTransform]);

  const { offset, transform } = useEdgeBoxTransform({
    dragOffset,
    resizeOffset,
    isResizing,
    baseTransform: composedBaseTransform || undefined,
  });

  const resolvedDimensions = useMemo<Dimensions>(() => ({
    width: width ?? measuredSize.width ?? dimensions.width,
    height: height ?? measuredSize.height ?? dimensions.height,
  }), [dimensions.height, dimensions.width, height, measuredSize.height, measuredSize.width, width]);

  const style = useMemo((): React.CSSProperties => ({
    position: "fixed",
    ...resolvedAnchorStyle.style,
    width: !resizable && width === undefined ? undefined : dimensions.width,
    height: !resizable && height === undefined ? undefined : dimensions.height,
    transform,
    touchAction: draggable || resizable ? "none" : undefined,
  }), [dimensions.height, dimensions.width, draggable, height, resizable, resolvedAnchorStyle.style, transform, width]);

  const getDragProps = useCallback((): UseEdgeBoxDragProps => {
    if (!draggable) {
      return {};
    }

    return {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    };
  }, [draggable, handleMouseDown, handleTouchStart]);

  const getResizeHandleProps = useCallback((direction: ResizeDirection): UseEdgeBoxResizeHandleProps => {
    if (!resizable) {
      return {};
    }

    return {
      onMouseDown: (e: React.MouseEvent) => handleResizeStart(direction, e),
      onTouchStart: (e: React.TouchEvent) => handleResizeStart(direction, e),
    };
  }, [handleResizeStart, resizable]);

  return {
    ref,
    style,
    edges,
    dimensions: resolvedDimensions,
    offset,
    transform,
    dragOffset,
    resizeOffset,
    isDragging,
    isPendingDrag,
    isResizing,
    resizeDirection,
    updateEdges,
    recalculate,
    resetPosition,
    resetDragOffset,
    cancelDrag,
    resetSize,
    handleMouseDown,
    handleTouchStart,
    handleResizeStart,
    getDragProps,
    getResizeHandleProps,
  };
}
