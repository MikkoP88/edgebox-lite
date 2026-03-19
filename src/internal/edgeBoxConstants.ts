/**
 * EdgeBox constants.
 */

/** Minimum width for resizable elements (default) */
export const DEFAULT_MIN_WIDTH = 300;

/** Minimum height for resizable elements (default) */
export const DEFAULT_MIN_HEIGHT = 400;

/** Pixel margin around resize handles for easier grabbing */
export const RESIZE_HANDLE_MARGIN = 10;

/** Minimum drag distance in pixels before treating movement as a drag (vs click) */
export const DRAG_THRESHOLD = 5;

/** Delay in ms before drag activates (prevents accidental drags) */
export const DRAG_ACTIVATION_DELAY = 150;

/** Delay in ms before removing event listeners after drag ends */
export const DRAG_STATE_RESET_DELAY = 50;

/** Default padding from viewport edges for boundary calculations */
export const DEFAULT_BOUNDARY_PADDING = 0;

/** Default safe zone (keeps element away from viewport edges) */
export const DEFAULT_SAFE_ZONE = DEFAULT_BOUNDARY_PADDING;

/** Default drag behavior */
export const DEFAULT_COMMIT_TO_EDGES = false;

/** Default auto focus behavior */
export const DEFAULT_AUTO_FOCUS = "unset" as const;

/** Default auto focus sensitivity as % of viewport */
export const DEFAULT_AUTO_FOCUS_SENSITIVITY = 5;

/** Minimum movement (px) required before a press becomes a drag */
export const DEFAULT_DRAG_START_DISTANCE = 6;

/** Default press-and-hold delay (ms) before a press becomes a drag without moving */
export const DEFAULT_DRAG_START_DELAY = DRAG_ACTIVATION_DELAY;

/** Default delay (ms) to block the next click/tap after a drag ends */
export const DEFAULT_DRAG_END_EVENT_DELAY = 150;

/** Default padding from viewport edges (in pixels) */
export const DEFAULT_EDGE_PADDING = 24;

/** Default anchored edge position */
export const DEFAULT_EDGE_POSITION = "bottom-right" as const;

/** Default auto recalc behavior for `useEdgeBoxPosition` */
export const DEFAULT_DISABLE_AUTO_RECALC = false;

/** Default viewport fallback size for SSR/non-browser environments */
export const DEFAULT_VIEWPORT_FALLBACK_WIDTH = 1920;
export const DEFAULT_VIEWPORT_FALLBACK_HEIGHT = 1080;

/** Default initial size for `useEdgeBoxResize` */
export const DEFAULT_RESIZE_INITIAL_WIDTH = 420;
export const DEFAULT_RESIZE_INITIAL_HEIGHT = 550;
