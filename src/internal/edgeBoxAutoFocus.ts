import type { EdgeBoxEdges } from "../edgeBoxEdges";

export type EdgeBoxAutoFocusPreset =
  | "unset"
  | "all"
  | "full"
  | "horizontal"
  | "vertical"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "right-left"
  | "bottom-top"
  | "full-horizontal-vertical"
  | "horizontal-vertical"
  | "full-horizontal"
  | "full-vertical"
  | "full-top"
  | "full-bottom"
  | "full-left"
  | "full-right"
  | "corners"
  | "right-bottom"
  | "right-top"
  | "left-bottom"
  | "left-top";

export type EdgeBoxAutoFocus = EdgeBoxAutoFocusPreset | `${number}` | `${number},${string}`;

type Box = Pick<EdgeBoxEdges, "left" | "right" | "top" | "bottom">;

export function getEdgeBoxAutoFocusAreas(autoFocus: EdgeBoxAutoFocus): Set<number> {
  if (typeof autoFocus === "string" && /^[0-9,]+$/.test(autoFocus)) {
    const nums = autoFocus
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 11);
    return new Set(nums);
  }

  switch (autoFocus) {
    case "unset":
      return new Set();
    case "all":
      return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    case "full":
      return new Set([1]);
    case "full-horizontal-vertical":
      return new Set([1, 2, 3, 4, 5, 10, 11]);
    case "horizontal-vertical":
      return new Set([2, 3, 4, 5, 10, 11]);
    case "horizontal":
      return new Set([2, 3, 10]);
    case "vertical":
      return new Set([4, 5, 11]);
    case "bottom":
      return new Set([2]);
    case "top":
      return new Set([3]);
    case "left":
      return new Set([4]);
    case "right":
      return new Set([5]);
    case "right-left":
      return new Set([10]);
    case "bottom-top":
      return new Set([11]);
    case "corners":
      return new Set([6, 7, 8, 9]);
    case "full-horizontal":
      return new Set([2, 3, 1]);
    case "full-vertical":
      return new Set([4, 5, 1]);
    case "full-bottom":
      return new Set([2, 1]);
    case "full-top":
      return new Set([3, 1]);
    case "full-left":
      return new Set([4, 1]);
    case "full-right":
      return new Set([5, 1]);
    case "right-bottom":
      return new Set([6]);
    case "right-top":
      return new Set([7]);
    case "left-bottom":
      return new Set([8]);
    case "left-top":
      return new Set([9]);
    default:
      return new Set();
  }
}

export function applyEdgeBoxAutoFocus(
  edges: Box,
  options: { safeZone: number; autoFocus: EdgeBoxAutoFocus; autoFocusSensitivity: number }
): Box {
  const { safeZone, autoFocus, autoFocusSensitivity } = options;
  if (typeof window === "undefined") return edges;
  const areas = getEdgeBoxAutoFocusAreas(autoFocus);
  if (areas.size === 0) return edges;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const sensitivity = Math.max(0, Math.min(100, autoFocusSensitivity));
  const thresholdX = viewportWidth * (sensitivity / 100);
  const thresholdY = viewportHeight * (sensitivity / 100);
  const centerThresholdX = thresholdX / 2;
  const centerThresholdY = thresholdY / 2;

  const safeLeft = safeZone;
  const safeTop = safeZone;
  const safeRight = viewportWidth - safeZone;
  const safeBottom = viewportHeight - safeZone;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;

  const inside =
    edges.left >= safeLeft &&
    edges.right <= safeRight &&
    edges.top >= safeTop &&
    edges.bottom <= safeBottom;

  if (!inside) return edges;

  const nearLeft = edges.left - safeLeft >= 0 && edges.left - safeLeft <= thresholdX;
  const nearRight = safeRight - edges.right >= 0 && safeRight - edges.right <= thresholdX;
  const nearTop = edges.top - safeTop >= 0 && edges.top - safeTop <= thresholdY;
  const nearBottom = safeBottom - edges.bottom >= 0 && safeBottom - edges.bottom <= thresholdY;

  const nearCenterLeft = Math.abs(edges.left - centerX) <= centerThresholdX;
  const nearCenterRight = Math.abs(edges.right - centerX) <= centerThresholdX;
  const nearCenterTop = Math.abs(edges.top - centerY) <= centerThresholdY;
  const nearCenterBottom = Math.abs(edges.bottom - centerY) <= centerThresholdY;

  const allow = (n: number) => areas.has(n);

  if (allow(1) && nearLeft && nearRight && nearTop && nearBottom) {
    return { left: safeLeft, right: safeRight, top: safeTop, bottom: safeBottom };
  }

  if (allow(2) && nearLeft && nearRight && nearBottom && nearCenterTop) {
    return { left: safeLeft, right: safeRight, top: centerY, bottom: safeBottom };
  }

  if (allow(3) && nearLeft && nearRight && nearTop && nearCenterBottom) {
    return { left: safeLeft, right: safeRight, top: safeTop, bottom: centerY };
  }

  if (allow(4) && nearTop && nearBottom && nearLeft && nearCenterRight) {
    return { left: safeLeft, right: centerX, top: safeTop, bottom: safeBottom };
  }

  if (allow(5) && nearTop && nearBottom && nearRight && nearCenterLeft) {
    return { left: centerX, right: safeRight, top: safeTop, bottom: safeBottom };
  }

  if (allow(10) && nearLeft && nearRight) {
    return { left: safeLeft, right: safeRight, top: edges.top, bottom: edges.bottom };
  }

  if (allow(11) && nearTop && nearBottom) {
    return { left: edges.left, right: edges.right, top: safeTop, bottom: safeBottom };
  }

  if (allow(6) && nearRight && nearBottom && nearCenterLeft && nearCenterTop) {
    return { left: centerX, right: safeRight, top: centerY, bottom: safeBottom };
  }

  if (allow(7) && nearRight && nearTop && nearCenterLeft && nearCenterBottom) {
    return { left: centerX, right: safeRight, top: safeTop, bottom: centerY };
  }

  if (allow(8) && nearLeft && nearBottom && nearCenterRight && nearCenterTop) {
    return { left: safeLeft, right: centerX, top: centerY, bottom: safeBottom };
  }

  if (allow(9) && nearLeft && nearTop && nearCenterRight && nearCenterBottom) {
    return { left: safeLeft, right: centerX, top: safeTop, bottom: centerY };
  }

  return edges;
}
