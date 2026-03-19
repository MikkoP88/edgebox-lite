export interface CenterPoint {
  x: number;
  y: number;
}

export interface EdgeBoxRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface EdgeBoxEdges extends EdgeBoxRect {
  center: CenterPoint;
}

export function calculateCenter(edges: EdgeBoxRect): CenterPoint {
  return {
    x: (edges.left + edges.right) / 2,
    y: (edges.top + edges.bottom) / 2,
  };
}

export function toEdgeBoxEdges(edges: EdgeBoxRect): EdgeBoxEdges {
  return {
    ...edges,
    center: calculateCenter(edges),
  };
}

export function areEdgeBoxRectsEqual(a: EdgeBoxRect, b: EdgeBoxRect): boolean {
  return a.left === b.left
    && a.right === b.right
    && a.top === b.top
    && a.bottom === b.bottom;
}

export function mergeEdgeBoxEdges(prev: EdgeBoxEdges, next: Partial<EdgeBoxEdges>): EdgeBoxEdges {
  return toEdgeBoxEdges({
    left: next.left ?? prev.left,
    right: next.right ?? prev.right,
    top: next.top ?? prev.top,
    bottom: next.bottom ?? prev.bottom,
  });
}
