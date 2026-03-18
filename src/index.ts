/**
 * EdgeBox
 *
 * Public entrypoint for the EdgeBox system.
 *
 * Note: this file uses explicit exports (and a couple namespaces) to avoid
 * type/name collisions (e.g. multiple `Position`/`Dimensions` types).
 */

export { useEdgeBoxPaddingValues, usePaddingValues } from "./padding";
export type { PaddingValue, PaddingValues } from "./padding";

export { useCssEdgePosition } from "./cssEdgePosition";
export type { CssEdgePosition, EdgePosition, UseCssEdgePositionResult } from "./cssEdgePosition";

export type { ResizeDirection } from "./types";

export { useEdgeBoxPosition } from "./useEdgeBoxPosition";
export type { EdgeBoxEdges } from "./useEdgeBoxPosition";

export type { EdgeBoxAutoFocus } from "./autoFocus";

export { useEdgeBoxDrag } from "./useEdgeBoxDrag";

export { useEdgeBoxResize } from "./useEdgeBoxResize";

export { useEdgeBoxViewportClamp } from "./useEdgeBoxViewportClamp";
