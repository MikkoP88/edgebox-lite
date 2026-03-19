export const MOUSE_EVENT_ID = -1;

export interface InteractionPoint {
  clientX: number;
  clientY: number;
  eventId: number;
}

interface TouchLike {
  clientX: number;
  clientY: number;
  identifier: number;
}

interface TouchListLike<TTouch extends TouchLike = TouchLike> {
  length: number;
  [index: number]: TTouch;
  item(index: number): TTouch | null;
}

export function isTouchStartEvent(
  e: React.MouseEvent | React.TouchEvent
): e is React.TouchEvent {
  return "changedTouches" in e;
}

export function getStartInteractionPoint(
  e: React.MouseEvent | React.TouchEvent
): InteractionPoint | null {
  if (isTouchStartEvent(e)) {
    return getFirstTouchInteractionPoint(e.changedTouches)
      ?? getFirstTouchInteractionPoint(e.touches);
  }

  return getMouseInteractionPoint(e);
}

export function clampClientPointToViewport(clientX: number, clientY: number) {
  if (typeof window === "undefined") {
    return { x: clientX, y: clientY };
  }

  return {
    x: Math.max(0, Math.min(window.innerWidth, clientX)),
    y: Math.max(0, Math.min(window.innerHeight, clientY)),
  };
}

export function getMouseInteractionPoint(e: React.MouseEvent): InteractionPoint {
  return {
    clientX: e.clientX,
    clientY: e.clientY,
    eventId: MOUSE_EVENT_ID,
  };
}

export function getTouchInteractionPoint(touch: TouchLike): InteractionPoint {
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
    eventId: touch.identifier,
  };
}

export function getFirstTouchInteractionPoint(touches: TouchListLike): InteractionPoint | null {
  const touch = touches[0];
  return touch ? getTouchInteractionPoint(touch) : null;
}

export function getTouchInteractionPointById(
  touches: TouchListLike,
  eventId: number
): InteractionPoint | null {
  for (let i = 0; i < touches.length; i += 1) {
    const touch = touches[i];
    if (touch.identifier === eventId) {
      return getTouchInteractionPoint(touch);
    }
  }

  return null;
}
