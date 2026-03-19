/**
 * EdgeBox
 *
 * Public entrypoint for the EdgeBox system.
 *
 * Note: this file uses explicit exports (and a couple namespaces) to avoid
 * type/name collisions (e.g. multiple `Position`/`Dimensions` types).
 */

export { resolveEdgeBoxPaddingValues, useEdgeBoxPaddingValues } from "./hooks/useEdgeBoxPaddingValues";
export type { PaddingValue, PaddingValues } from "./hooks/useEdgeBoxPaddingValues";

export { useEdgeBoxCssPosition } from "./hooks/useEdgeBoxCssPosition";
export type {
  CssEdgePosition,
  EdgePosition,
  UseEdgeBoxCssPositionResult,
} from "./hooks/useEdgeBoxCssPosition";

export type { ResizeDirection } from "./edgeBoxTypes";

export {
  alignRect,
  clampRectToViewport,
  edgesToOffsetRect,
  edgesToRect,
  rectToEdges,
} from "./edgeBoxRect";
export type { EdgeBoxLayoutRect } from "./edgeBoxRect";

export { useEdgeBox } from "./hooks/useEdgeBox";
export type {
  UseEdgeBoxOptions,
  UseEdgeBoxResult,
  UseEdgeBoxDragProps,
  UseEdgeBoxResizeHandleProps,
} from "./hooks/useEdgeBox";

export { useEdgeBoxPosition } from "./hooks/useEdgeBoxPosition";
export type {
  EdgeBoxEdges,
  UseEdgeBoxPositionOptions,
  UseEdgeBoxPositionResult,
} from "./hooks/useEdgeBoxPosition";

export type { EdgeBoxAutoFocus } from "./internal/edgeBoxAutoFocus";

export { useEdgeBoxDrag } from "./hooks/useEdgeBoxDrag";
export type { UseEdgeBoxDragOptions, UseEdgeBoxDragResult } from "./hooks/useEdgeBoxDrag";

export { useEdgeBoxResize } from "./hooks/useEdgeBoxResize";
export type {
  ResetSizeOptions,
  UseEdgeBoxResizeOptions,
  UseEdgeBoxResizeResult,
} from "./hooks/useEdgeBoxResize";

export { useEdgeBoxTransform } from "./hooks/useEdgeBoxTransform";
export type { UseEdgeBoxTransformOptions, UseEdgeBoxTransformResult } from "./hooks/useEdgeBoxTransform";

export { useEdgeBoxMeasuredSize } from "./hooks/useEdgeBoxMeasuredSize";
export type { UseEdgeBoxMeasuredSizeOptions } from "./hooks/useEdgeBoxMeasuredSize";

export { useEdgeBoxViewportSize } from "./hooks/useEdgeBoxViewportSize";
export type {
  UseEdgeBoxViewportSizeOptions,
  UseEdgeBoxViewportSizeResult,
} from "./hooks/useEdgeBoxViewportSize";

export { useEdgeBoxLinkedBoxes } from "./hooks/useEdgeBoxLinkedBoxes";
export type {
  UseEdgeBoxLinkedBoxesOptions,
  UseEdgeBoxLinkedBoxesResult,
} from "./hooks/useEdgeBoxLinkedBoxes";

export { useEdgeBoxViewportClamp } from "./hooks/useEdgeBoxViewportClamp";
export type {
  UseEdgeBoxViewportClampOptions,
  UseEdgeBoxViewportClampResult,
} from "./hooks/useEdgeBoxViewportClamp";
