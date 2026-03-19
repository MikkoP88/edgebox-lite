import { useState, useRef, useCallback, useEffect, type RefObject } from "react";
import type { EdgeBoxEdges } from "../edgeBoxEdges";
import { getEdgeBoxAutoFocusAreas, type EdgeBoxAutoFocus } from "../internal/edgeBoxAutoFocus";
import {
  DEFAULT_AUTO_FOCUS,
  DEFAULT_AUTO_FOCUS_SENSITIVITY,
  DEFAULT_COMMIT_TO_EDGES,
  DEFAULT_DRAG_END_EVENT_DELAY,
  DEFAULT_DRAG_START_DELAY,
  DEFAULT_DRAG_START_DISTANCE,
  DEFAULT_SAFE_ZONE,
} from "../internal/edgeBoxConstants";
import {
  getFirstTouchInteractionPoint,
  getTouchInteractionPointById,
  MOUSE_EVENT_ID,
} from "../internal/edgeBoxInteraction";
import type { Position } from "../edgeBoxTypes";
import { useLatestRef } from "../internal/useLatestRef";

export interface UseEdgeBoxDragOptions {
  edges: EdgeBoxEdges;
  updateEdges?: (edges: Partial<EdgeBoxEdges>) => void;
  commitToEdges?: boolean;
  safeZone?: number;
  /** Minimum pointer movement (pixels) required before a press is treated as a drag. */
  dragStartDistance?: number;
  /** Press-and-hold delay (ms) after which a press becomes a drag even without moving. */
  dragStartDelay?: number;
  /** Delay (ms) to block the next click/tap after a drag ends. */
  dragEndEventDelay?: number;
  autoFocus?: EdgeBoxAutoFocus;
  autoFocusSensitivity?: number;
  elementWidth?: number;
  elementHeight?: number;
  elementRef?: RefObject<HTMLElement>;
  onDragEnd?: (finalOffset: Position) => void;
}

export interface UseEdgeBoxDragResult {
  dragOffset: Position;
  isDragging: boolean;
  isPendingDrag: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  resetDragOffset: () => void;
  cancelDrag: () => void;
}

export function useEdgeBoxDrag({
  edges,
  updateEdges,
  commitToEdges = DEFAULT_COMMIT_TO_EDGES,
  safeZone = DEFAULT_SAFE_ZONE,
  dragStartDistance = DEFAULT_DRAG_START_DISTANCE,
  dragStartDelay = DEFAULT_DRAG_START_DELAY,
  dragEndEventDelay = DEFAULT_DRAG_END_EVENT_DELAY,
  autoFocus = DEFAULT_AUTO_FOCUS,
  autoFocusSensitivity = DEFAULT_AUTO_FOCUS_SENSITIVITY,
  elementWidth,
  elementHeight,
  elementRef,
  onDragEnd,
}: UseEdgeBoxDragOptions): UseEdgeBoxDragResult {
  const edgesRef = useLatestRef(edges);

  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const dragOffsetRef = useLatestRef(dragOffset);

  const [isDragging, setIsDragging] = useState(false);
  const [isPendingDrag, setIsPendingDrag] = useState(false);

  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const originalOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const dragTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const isPendingDragRef = useRef(false);
  const pendingViewportResizeClampRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const activeEventIdRef = useRef<number | null>(null);
  const baseEdgesRef = useRef<{ left: number; right: number; top: number; bottom: number } | null>(null);
  const baseDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const cleanupInteractionRef = useRef<(() => void) | null>(null);
  const preventClickListenerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const preventClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetHasDraggedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragStartDistanceRef = useLatestRef(Math.max(0, dragStartDistance));
  const dragStartDelayRef = useLatestRef(Math.max(0, dragStartDelay));
  const dragEndEventDelayRef = useLatestRef(Math.max(0, dragEndEventDelay));

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    isPendingDragRef.current = isPendingDrag;
  }, [isPendingDrag]);

  const clearPostDragCleanup = useCallback(() => {
    if (preventClickTimeoutRef.current) {
      clearTimeout(preventClickTimeoutRef.current);
      preventClickTimeoutRef.current = null;
    }

    if (resetHasDraggedTimeoutRef.current) {
      clearTimeout(resetHasDraggedTimeoutRef.current);
      resetHasDraggedTimeoutRef.current = null;
    }

    if (preventClickListenerRef.current && typeof window !== "undefined") {
      window.removeEventListener("click", preventClickListenerRef.current, true);
      preventClickListenerRef.current = null;
    }
  }, []);

  const clampToBoundaries = useCallback((offsetX: number, offsetY: number): Position => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let width: number, height: number;

    if (baseDimensionsRef.current) {
      width = baseDimensionsRef.current.width;
      height = baseDimensionsRef.current.height;
    } else if (elementWidth !== undefined && elementHeight !== undefined) {
      width = elementWidth;
      height = elementHeight;
    } else if (elementRef?.current) {
      const rect = elementRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    } else {
      return { x: offsetX, y: offsetY };
    }

    const latestEdges = edgesRef.current;
    const baseEdges = baseEdgesRef.current ?? {
      left: latestEdges.left,
      right: latestEdges.right,
      top: latestEdges.top,
      bottom: latestEdges.bottom,
    };

    const edgeWidth = baseEdges.right - baseEdges.left;
    const edgeHeight = baseEdges.bottom - baseEdges.top;

    let effectiveBaseEdges = baseEdges;
    if (edgeWidth <= 0 || edgeHeight <= 0) {
      if (elementRef?.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const currentOffset = dragOffsetRef.current;

        effectiveBaseEdges = {
          left: rect.left - currentOffset.x,
          right: rect.right - currentOffset.x,
          top: rect.top - currentOffset.y,
          bottom: rect.bottom - currentOffset.y,
        };
      } else {
        const centerX = (latestEdges.left + latestEdges.right) / 2;
        const centerY = (latestEdges.top + latestEdges.bottom) / 2;
        effectiveBaseEdges = {
          left: centerX - width / 2,
          right: centerX + width / 2,
          top: centerY - height / 2,
          bottom: centerY + height / 2,
        };
      }
    }

    const minOffsetX = safeZone - effectiveBaseEdges.left;
    const maxOffsetX = viewportWidth - safeZone - effectiveBaseEdges.right;
    const minOffsetY = safeZone - effectiveBaseEdges.top;
    const maxOffsetY = viewportHeight - safeZone - effectiveBaseEdges.bottom;

    return {
      x: Math.max(minOffsetX, Math.min(maxOffsetX, offsetX)),
      y: Math.max(minOffsetY, Math.min(maxOffsetY, offsetY)),
    };
  }, [dragOffsetRef, edgesRef, safeZone, elementWidth, elementHeight, elementRef]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewportResize = () => {
      if (
        commitToEdges &&
        !isDraggingRef.current &&
        !isPendingDragRef.current &&
        dragOffsetRef.current.x === 0 &&
        dragOffsetRef.current.y === 0
      ) {
        return;
      }

      pendingViewportResizeClampRef.current = true;
      const currentOffset = dragOffsetRef.current;
      const clamped = clampToBoundaries(currentOffset.x, currentOffset.y);

      if (clamped.x !== currentOffset.x || clamped.y !== currentOffset.y) {
        dragOffsetRef.current = clamped;
        setDragOffset(clamped);
      }
    };

    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, [clampToBoundaries, commitToEdges, edges, elementRef]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!pendingViewportResizeClampRef.current) return;
    pendingViewportResizeClampRef.current = false;

    const currentOffset = dragOffsetRef.current;
    const clamped = clampToBoundaries(currentOffset.x, currentOffset.y);

    if (clamped.x !== currentOffset.x || clamped.y !== currentOffset.y) {
      dragOffsetRef.current = clamped;
      setDragOffset(clamped);
    }
  }, [
    clampToBoundaries,
    edges.left,
    edges.right,
    edges.top,
    edges.bottom,
  ]);

  const startDrag = useCallback((clientX: number, clientY: number, eventId: number) => {
    if (activeEventIdRef.current !== null) return false;

    activeEventIdRef.current = eventId;
    dragStartRef.current = { x: clientX, y: clientY };
    const currentOffset = dragOffsetRef.current;
    originalOffsetRef.current = { x: currentOffset.x, y: currentOffset.y };
    isPendingDragRef.current = true;
    setIsPendingDrag(true);
    hasDraggedRef.current = false;

    if (elementRef?.current) {
      const rect = elementRef.current.getBoundingClientRect();

      baseEdgesRef.current = {
        left: rect.left - currentOffset.x,
        right: rect.right - currentOffset.x,
        top: rect.top - currentOffset.y,
        bottom: rect.bottom - currentOffset.y,
      };

      baseDimensionsRef.current = {
        width: rect.width,
        height: rect.height,
      };
    } else if (elementWidth !== undefined && elementHeight !== undefined) {
      baseDimensionsRef.current = {
        width: elementWidth,
        height: elementHeight,
      };
    }

    if (!baseEdgesRef.current) {
      const latestEdges = edgesRef.current;
      const edgeWidth = latestEdges.right - latestEdges.left;
      const edgeHeight = latestEdges.bottom - latestEdges.top;

      if (edgeWidth > 0 && edgeHeight > 0) {
        baseEdgesRef.current = {
          left: latestEdges.left,
          right: latestEdges.right,
          top: latestEdges.top,
          bottom: latestEdges.bottom,
        };
      }
    }

    dragTimerRef.current = setTimeout(() => {
      isPendingDragRef.current = false;
      setIsPendingDrag(false);
      setIsDragging(true);
      isDraggingRef.current = true;
    }, dragStartDelayRef.current);

    return true;
  }, [dragOffsetRef, dragStartDelayRef, edgesRef, elementWidth, elementHeight, elementRef]);

  const activateDragIfPending = useCallback(() => {
    if (!isPendingDragRef.current || isDraggingRef.current) return;

    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }

    isPendingDragRef.current = false;
    setIsPendingDrag(false);
    setIsDragging(true);
    isDraggingRef.current = true;
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number, eventId: number) => {
    if (activeEventIdRef.current !== eventId) return;
    if (!isDraggingRef.current && !isPendingDragRef.current) return;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const threshold = dragStartDistanceRef.current;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      hasDraggedRef.current = true;
      activateDragIfPending();
    }

    const newOffsetX = originalOffsetRef.current.x + deltaX;
    const newOffsetY = originalOffsetRef.current.y + deltaY;

    const clamped = clampToBoundaries(newOffsetX, newOffsetY);

    dragOffsetRef.current = clamped;
    setDragOffset(clamped);
  }, [dragStartDistanceRef, dragOffsetRef, clampToBoundaries, activateDragIfPending]);

  const endDrag = useCallback((eventId: number) => {
    if (activeEventIdRef.current !== eventId) return false;

    activeEventIdRef.current = null;

    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }

    setIsDragging(false);
    setIsPendingDrag(false);
    isDraggingRef.current = false;
    isPendingDragRef.current = false;

    if (hasDraggedRef.current) {
      clearPostDragCleanup();

      const preventClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.removeEventListener('click', preventClick, true);
        if (preventClickListenerRef.current === preventClick) {
          preventClickListenerRef.current = null;
        }
      };
      preventClickListenerRef.current = preventClick;
      window.addEventListener('click', preventClick, true);

      preventClickTimeoutRef.current = setTimeout(() => {
        if (preventClickListenerRef.current === preventClick) {
          window.removeEventListener('click', preventClick, true);
          preventClickListenerRef.current = null;
        }
        preventClickTimeoutRef.current = null;
      }, dragEndEventDelayRef.current);

      resetHasDraggedTimeoutRef.current = setTimeout(() => {
        hasDraggedRef.current = false;
        resetHasDraggedTimeoutRef.current = null;
      }, dragEndEventDelayRef.current);
    }

    return true;
  }, [clearPostDragCleanup, dragEndEventDelayRef]);

  const applyAutoFocusOnEnd = useCallback((): Position => {
    if (typeof window === 'undefined') return dragOffsetRef.current;
    if (autoFocus === 'unset') return dragOffsetRef.current;

    const areas = getEdgeBoxAutoFocusAreas(autoFocus);
    if (areas.size === 0) return dragOffsetRef.current;

    const currentOffset = dragOffsetRef.current;
    const baseEdges = baseEdgesRef.current ?? edgesRef.current;
    const actualBox = {
      left: baseEdges.left + currentOffset.x,
      right: baseEdges.right + currentOffset.x,
      top: baseEdges.top + currentOffset.y,
      bottom: baseEdges.bottom + currentOffset.y,
    };

    const applyOffset = (dx: number, dy: number) => {
      const nextOffset = clampToBoundaries(currentOffset.x + dx, currentOffset.y + dy);
      if (nextOffset.x !== currentOffset.x || nextOffset.y !== currentOffset.y) {
        dragOffsetRef.current = nextOffset;
        setDragOffset(nextOffset);
      }
      return nextOffset;
    };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sensitivity = Math.max(0, Math.min(100, autoFocusSensitivity));
    const thresholdX = viewportWidth * (sensitivity / 100);
    const thresholdY = viewportHeight * (sensitivity / 100);
    const safeLeft = safeZone;
    const safeTop = safeZone;
    const safeRight = viewportWidth - safeZone;
    const safeBottom = viewportHeight - safeZone;

    const snapLeftSafe = areas.has(1) || areas.has(2) || areas.has(3) || areas.has(4) || areas.has(8) || areas.has(9) || areas.has(10);
    const snapRightSafe = areas.has(1) || areas.has(2) || areas.has(3) || areas.has(5) || areas.has(6) || areas.has(7) || areas.has(10);
    const snapTopSafe = areas.has(1) || areas.has(3) || areas.has(4) || areas.has(5) || areas.has(7) || areas.has(9) || areas.has(11);
    const snapBottomSafe = areas.has(1) || areas.has(2) || areas.has(4) || areas.has(5) || areas.has(6) || areas.has(8) || areas.has(11);

    const xCandidates: number[] = [];
    const yCandidates: number[] = [];

    if (snapLeftSafe) {
      if (Math.abs(actualBox.left - safeLeft) <= thresholdX) xCandidates.push(safeLeft - actualBox.left);
    }
    if (snapRightSafe) {
      if (Math.abs(actualBox.right - safeRight) <= thresholdX) xCandidates.push(safeRight - actualBox.right);
    }
    if (snapTopSafe) {
      if (Math.abs(actualBox.top - safeTop) <= thresholdY) yCandidates.push(safeTop - actualBox.top);
    }
    if (snapBottomSafe) {
      if (Math.abs(actualBox.bottom - safeBottom) <= thresholdY) yCandidates.push(safeBottom - actualBox.bottom);
    }

    const pickBest = (candidates: number[]) => {
      if (candidates.length === 0) return 0;
      return candidates.reduce((best, v) => (Math.abs(v) < Math.abs(best) ? v : best), candidates[0]);
    };

    const dx = pickBest(xCandidates);
    const dy = pickBest(yCandidates);

    if (dx === 0 && dy === 0) return currentOffset;
    return applyOffset(dx, dy);
  }, [autoFocus, autoFocusSensitivity, clampToBoundaries, dragOffsetRef, edgesRef, safeZone]);

  const commitOffsetIntoEdges = useCallback((finalOffset: Position) => {
    if (!commitToEdges || !updateEdges) return;
    if (finalOffset.x === 0 && finalOffset.y === 0) return;

    const base = baseEdgesRef.current ?? edgesRef.current;
    updateEdges({
      left: base.left + finalOffset.x,
      top: base.top + finalOffset.y,
      right: base.right + finalOffset.x,
      bottom: base.bottom + finalOffset.y,
    });

    dragOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
  }, [commitToEdges, dragOffsetRef, edgesRef, updateEdges]);

  const clearBaseRefs = useCallback(() => {
    baseEdgesRef.current = null;
    baseDimensionsRef.current = null;
  }, [dragOffsetRef]);

  const finalizeDrag = useCallback(() => {
    cleanupInteractionRef.current?.();

    const finalOffset = applyAutoFocusOnEnd();

    commitOffsetIntoEdges(finalOffset);
    clearBaseRefs();
    onDragEnd?.(finalOffset);
  }, [applyAutoFocusOnEnd, clearBaseRefs, commitOffsetIntoEdges, onDragEnd]);

  const cancelDrag = useCallback(() => {
    cleanupInteractionRef.current?.();
    clearPostDragCleanup();

    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = null;
    }

    activeEventIdRef.current = null;
    hasDraggedRef.current = false;
    isDraggingRef.current = false;
    isPendingDragRef.current = false;

    setIsDragging(false);
    setIsPendingDrag(false);

    dragOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });

    clearBaseRefs();
  }, [clearBaseRefs, clearPostDragCleanup, dragOffsetRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!startDrag(e.clientX, e.clientY, MOUSE_EVENT_ID)) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
      }
      handleDragMove(e.clientX, e.clientY, MOUSE_EVENT_ID);
    };

    const handleMouseUp = () => {
      if (!endDrag(MOUSE_EVENT_ID)) return;
      finalizeDrag();
    };

    const cleanupInteraction = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (cleanupInteractionRef.current === cleanupInteraction) {
        cleanupInteractionRef.current = null;
      }
    };

    cleanupInteractionRef.current = cleanupInteraction;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [startDrag, handleDragMove, endDrag, finalizeDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = getFirstTouchInteractionPoint(e.changedTouches) ?? getFirstTouchInteractionPoint(e.touches);
    if (!touch) return;
    if (!startDrag(touch.clientX, touch.clientY, touch.eventId)) return;

    const handleTouchMove = (e: TouchEvent) => {
      const activeEventId = activeEventIdRef.current;
      if (activeEventId === null) return;

      const touch = getTouchInteractionPointById(e.touches, activeEventId)
        ?? getTouchInteractionPointById(e.changedTouches, activeEventId);
      if (!touch) return;

      if (isDraggingRef.current || isPendingDragRef.current) {
        e.preventDefault();
      }

      handleDragMove(touch.clientX, touch.clientY, touch.eventId);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const activeEventId = activeEventIdRef.current;
      if (activeEventId === null) return;

      const touch = getTouchInteractionPointById(e.changedTouches, activeEventId);
      if (!touch || !endDrag(touch.eventId)) return;

      finalizeDrag();
    };

    const cleanupInteraction = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      if (cleanupInteractionRef.current === cleanupInteraction) {
        cleanupInteractionRef.current = null;
      }
    };

    cleanupInteractionRef.current = cleanupInteraction;

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  }, [startDrag, handleDragMove, endDrag, finalizeDrag]);

  const resetDragOffset = useCallback(() => {
    dragOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
  }, [dragOffsetRef]);

  useEffect(() => {
    return () => {
      cleanupInteractionRef.current?.();
      clearPostDragCleanup();

      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
      }

      activeEventIdRef.current = null;
    };
  }, [clearPostDragCleanup]);

  return {
    dragOffset,
    isDragging,
    isPendingDrag,
    handleMouseDown,
    handleTouchStart,
    resetDragOffset,
    cancelDrag,
  };
}
