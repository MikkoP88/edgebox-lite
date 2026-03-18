import { useState, useRef, useEffect, useCallback } from "react";
import { EdgeBoxEdges } from "./useEdgeBoxPosition";
import { applyEdgeBoxAutoFocus, type EdgeBoxAutoFocus } from "./autoFocus";
import {
  DEFAULT_AUTO_FOCUS,
  DEFAULT_AUTO_FOCUS_SENSITIVITY,
  DEFAULT_COMMIT_TO_EDGES,
  DEFAULT_RESIZE_INITIAL_HEIGHT,
  DEFAULT_RESIZE_INITIAL_WIDTH,
  DEFAULT_SAFE_ZONE,
  DEFAULT_MIN_WIDTH,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  DEFAULT_VIEWPORT_FALLBACK_WIDTH,
} from "./constants";
import {
  getFirstTouchInteractionPoint,
  getMouseInteractionPoint,
  getTouchInteractionPointById,
  isTouchStartEvent,
  MOUSE_EVENT_ID,
} from "./interaction";
import type { ResizeDirection, Dimensions, Position } from "./types";

export interface UseEdgeBoxResizeOptions {
  edges: EdgeBoxEdges;
  updateEdges?: (edges: Partial<EdgeBoxEdges>) => void;
  commitToEdges?: boolean;
  onCommitSize?: (finalDimensions: Dimensions) => void;
  baseOffset?: Position;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  safeZone?: number;
  autoFocus?: EdgeBoxAutoFocus;
  autoFocusSensitivity?: number;
  onResizeEnd?: (finalDimensions: Dimensions, finalOffset: Position) => void;
}

export interface ResetSizeOptions {
  commit?: boolean;
}

export interface UseEdgeBoxResizeResult {
  dimensions: Dimensions;
  resizeOffset: Position;
  isResizing: boolean;
  resizeDirection: ResizeDirection | null;
  handleResizeStart: (direction: ResizeDirection, e: React.MouseEvent | React.TouchEvent) => void;
  resetDimensions: (options?: ResetSizeOptions) => void;
  resetSize: (options?: ResetSizeOptions) => void;
}

export function useEdgeBoxResize({
  edges,
  updateEdges,
  commitToEdges = DEFAULT_COMMIT_TO_EDGES,
  onCommitSize,
  baseOffset = { x: 0, y: 0 },
  initialWidth = DEFAULT_RESIZE_INITIAL_WIDTH,
  initialHeight = DEFAULT_RESIZE_INITIAL_HEIGHT,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxWidth = typeof window !== 'undefined' ? window.innerWidth : DEFAULT_VIEWPORT_FALLBACK_WIDTH,
  maxHeight = typeof window !== 'undefined' ? window.innerHeight : DEFAULT_VIEWPORT_FALLBACK_HEIGHT,
  safeZone = DEFAULT_SAFE_ZONE,
  autoFocus = DEFAULT_AUTO_FOCUS,
  autoFocusSensitivity = DEFAULT_AUTO_FOCUS_SENSITIVITY,
  onResizeEnd,
}: UseEdgeBoxResizeOptions): UseEdgeBoxResizeResult {
  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: initialWidth,
    height: initialHeight,
  });

  const [resizeOffset, setResizeOffset] = useState<Position>({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);

  const resizeStartRef = useRef<Position>({ x: 0, y: 0 });
  const startDimensionsRef = useRef<Dimensions>({ width: initialWidth, height: initialHeight });
  const startOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const activeEventIdRef = useRef<number | null>(null);

  const dimensionsRef = useRef<Dimensions>({ width: initialWidth, height: initialHeight });
  const resizeOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const baseOffsetRef = useRef<Position>(baseOffset);

  useEffect(() => {
    dimensionsRef.current = dimensions;
    resizeOffsetRef.current = resizeOffset;
  }, [dimensions, resizeOffset]);

  useEffect(() => {
    baseOffsetRef.current = baseOffset;
  }, [baseOffset]);

  useEffect(() => {
    if (isResizing) return;
    setDimensions({ width: initialWidth, height: initialHeight });
  }, [initialWidth, initialHeight, isResizing]);

  const applyResize = useCallback((dx: number, dy: number) => {
    const dir = resizeDirection;
    if (!dir) return;

    const startWidth = startDimensionsRef.current.width;
    const startHeight = startDimensionsRef.current.height;
    const startOffsetX = startOffsetRef.current.x;
    const startOffsetY = startOffsetRef.current.y;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newOffsetX = startOffsetX;
    let newOffsetY = startOffsetY;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const base = baseOffsetRef.current;
    const startLeft = edges.left + base.x + startOffsetX;
    const startTop = edges.top + base.y + startOffsetY;
    const startRight = startLeft + startWidth;
    const startBottom = startTop + startHeight;

    if (dir.includes('e') && !dir.includes('w')) {
      newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx));
      const maxWidthByRightBoundary = (viewportWidth - safeZone) - startLeft;
      newWidth = Math.min(newWidth, maxWidthByRightBoundary);
      newOffsetX = startOffsetX;
    }

    if (dir.includes('w')) {
      let newLeft = startLeft + dx;
      newLeft = Math.max(safeZone, newLeft);

      const maxLeftByMinWidth = startRight - minWidth;
      newLeft = Math.min(newLeft, maxLeftByMinWidth);

      const minLeftByMaxWidth = startRight - maxWidth;
      newLeft = Math.max(newLeft, minLeftByMaxWidth);

      newWidth = startRight - newLeft;
      newOffsetX = startOffsetX + (newLeft - startLeft);
    }

    if (dir.includes('s') && !dir.includes('n')) {
      newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy));
      const maxHeightByBottomBoundary = (viewportHeight - safeZone) - startTop;
      newHeight = Math.min(newHeight, maxHeightByBottomBoundary);
      newOffsetY = startOffsetY;
    }

    if (dir.includes('n')) {
      let newTop = startTop + dy;
      newTop = Math.max(safeZone, newTop);

      const maxTopByMinHeight = startBottom - minHeight;
      newTop = Math.min(newTop, maxTopByMinHeight);

      const minTopByMaxHeight = startBottom - maxHeight;
      newTop = Math.max(newTop, minTopByMaxHeight);

      newHeight = startBottom - newTop;
      newOffsetY = startOffsetY + (newTop - startTop);
    }

    setDimensions({ width: newWidth, height: newHeight });
    setResizeOffset({ x: newOffsetX, y: newOffsetY });
  }, [resizeDirection, edges, minWidth, minHeight, maxWidth, maxHeight, safeZone]);

  const handleResizeStart: UseEdgeBoxResizeResult["handleResizeStart"] = useCallback((
    direction: ResizeDirection,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (activeEventIdRef.current !== null) return;

    let startPoint;

    if (isTouchStartEvent(e)) {
      startPoint = getFirstTouchInteractionPoint(e.changedTouches)
        ?? getFirstTouchInteractionPoint(e.touches);
    } else {
      startPoint = getMouseInteractionPoint(e);
    }

    if (!startPoint) return;

    setIsResizing(true);
    setResizeDirection(direction);
    activeEventIdRef.current = startPoint.eventId;

    const startX = Math.max(0, Math.min(window.innerWidth, startPoint.clientX));
    const startY = Math.max(0, Math.min(window.innerHeight, startPoint.clientY));
    resizeStartRef.current = { x: startX, y: startY };
    startDimensionsRef.current = { ...dimensions };
    startOffsetRef.current = { ...resizeOffset };
  }, [dimensions, resizeOffset]);

  const handleEndResize = useCallback(() => {
    activeEventIdRef.current = null;

    const base = baseOffsetRef.current;
    const finalOffset = resizeOffsetRef.current;
    const finalDimensions = dimensionsRef.current;

    const baseEdges = edgesRef.current;

    const actualLeft = baseEdges.left + base.x + finalOffset.x;
    const actualTop = baseEdges.top + base.y + finalOffset.y;
    const actualBox = {
      left: actualLeft,
      top: actualTop,
      right: actualLeft + finalDimensions.width,
      bottom: actualTop + finalDimensions.height,
    };

    const focused = applyEdgeBoxAutoFocus(actualBox, {
      safeZone,
      autoFocus,
      autoFocusSensitivity,
    });

    const focusedDimensions = {
      width: focused.right - focused.left,
      height: focused.bottom - focused.top,
    };

    const focusedOffset = {
      x: focused.left - (baseEdges.left + base.x),
      y: focused.top - (baseEdges.top + base.y),
    };

    setIsResizing(false);
    setResizeDirection(null);

    setResizeOffset({ x: 0, y: 0 });

    if (commitToEdges && updateEdges) {
      const left = baseEdges.left + focusedOffset.x;
      const top = baseEdges.top + focusedOffset.y;
      updateEdges({
        left,
        top,
        right: left + focusedDimensions.width,
        bottom: top + focusedDimensions.height,
      });
      onCommitSize?.(focusedDimensions);
    }

    if (onResizeEnd) {
      onResizeEnd(focusedDimensions, focusedOffset);
    }
  }, [autoFocus, autoFocusSensitivity, commitToEdges, onCommitSize, onResizeEnd, safeZone, updateEdges]);

  const resetSize = useCallback((options?: ResetSizeOptions) => {
    const commit = options?.commit ?? false;

    const requestedDimensions = {
      width: initialWidth,
      height: initialHeight,
    };

    const finalDimensions = { ...requestedDimensions };

    if (typeof window !== 'undefined') {
      const availableWidth = Math.max(0, window.innerWidth - safeZone * 2);
      const availableHeight = Math.max(0, window.innerHeight - safeZone * 2);

      finalDimensions.width = Math.min(
        Math.max(minWidth, Math.min(maxWidth, requestedDimensions.width)),
        availableWidth || requestedDimensions.width
      );

      finalDimensions.height = Math.min(
        Math.max(minHeight, Math.min(maxHeight, requestedDimensions.height)),
        availableHeight || requestedDimensions.height
      );
    }

    activeEventIdRef.current = null;
    setIsResizing(false);
    setResizeDirection(null);

    dimensionsRef.current = finalDimensions;
    resizeOffsetRef.current = { x: 0, y: 0 };
    startDimensionsRef.current = finalDimensions;
    startOffsetRef.current = { x: 0, y: 0 };

    setDimensions(finalDimensions);
    setResizeOffset({ x: 0, y: 0 });

    if (commit) {
      onCommitSize?.(finalDimensions);

      if (updateEdges) {
        const baseEdges = edgesRef.current;
        let left = baseEdges.left;
        let top = baseEdges.top;

        if (typeof window !== 'undefined') {
          left = Math.max(safeZone, Math.min(window.innerWidth - safeZone - finalDimensions.width, left));
          top = Math.max(safeZone, Math.min(window.innerHeight - safeZone - finalDimensions.height, top));
        }

        updateEdges({
          left,
          top,
          right: left + finalDimensions.width,
          bottom: top + finalDimensions.height,
        });
      }
    }
  }, [initialWidth, initialHeight, maxHeight, maxWidth, minHeight, minWidth, onCommitSize, safeZone, updateEdges]);

  const resetDimensions = resetSize;

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (activeEventIdRef.current !== MOUSE_EVENT_ID) return;

      const clientX = Math.max(0, Math.min(window.innerWidth, e.clientX));
      const clientY = Math.max(0, Math.min(window.innerHeight, e.clientY));

      const dx = clientX - resizeStartRef.current.x;
      const dy = clientY - resizeStartRef.current.y;
      applyResize(dx, dy);
    };

    const handleMouseUp = () => {
      if (activeEventIdRef.current !== MOUSE_EVENT_ID) return;
      handleEndResize();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const activeEventId = activeEventIdRef.current;
      if (activeEventId === null || activeEventId === MOUSE_EVENT_ID) return;

      const touch = getTouchInteractionPointById(e.touches, activeEventId)
        ?? getTouchInteractionPointById(e.changedTouches, activeEventId);
      if (!touch) return;

      e.preventDefault();

      const clientX = Math.max(0, Math.min(window.innerWidth, touch.clientX));
      const clientY = Math.max(0, Math.min(window.innerHeight, touch.clientY));

      const dx = clientX - resizeStartRef.current.x;
      const dy = clientY - resizeStartRef.current.y;
      applyResize(dx, dy);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const activeEventId = activeEventIdRef.current;
      if (activeEventId === null || activeEventId === MOUSE_EVENT_ID) return;

      const touch = getTouchInteractionPointById(e.changedTouches, activeEventId);
      if (!touch) return;

      handleEndResize();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isResizing, applyResize, handleEndResize]);

  return {
    dimensions,
    resizeOffset,
    isResizing,
    resizeDirection,
    handleResizeStart,
    resetDimensions,
    resetSize,
  };
}
