# EdgeBox API reference

Back to the main guide: [`README.md`](../README.md)

Advanced usage guide: [`docs/advanced.md`](./advanced.md)

## Exports

```ts
import {
  useEdgeBox,
  useEdgeBoxPaddingValues,
  useEdgeBoxCssPosition,
  useEdgeBoxPosition,
  useEdgeBoxDrag,
  useEdgeBoxResize,
  useEdgeBoxTransform,
  useEdgeBoxViewportClamp,
} from "@edgebox-lite/react";
```

All exported hooks in the package entrypoint:

| Hook | Status | Primary purpose |
|---|---|---|
| `useEdgeBox` | Exported | High-level hook that composes position, drag, resize, and transform into one simpler API |
| `useEdgeBoxPaddingValues` | Exported | Normalize padding shorthand into resolved edge values |
| `useEdgeBoxCssPosition` | Exported | Compute low-level CSS `left`/`right`/`top`/`bottom` anchor values |
| `useEdgeBoxPosition` | Exported | Track committed viewport `edges` and recalculate/clamp them |
| `useEdgeBoxDrag` | Exported | Add drag interactions with safe-zone clamping |
| `useEdgeBoxResize` | Exported | Add 8-direction resize interactions with constraints |
| `useEdgeBoxTransform` | Exported | Combine drag/resize offsets into one `translate3d(...)` |
| `useEdgeBoxViewportClamp` | Exported | Measure DOM size changes and keep the box inside the viewport |

## API cheat sheet

| Hook | What it solves | You give it | You get back |
|---|---|---|---|
| `useEdgeBox` | High-level common-case EdgeBox wiring | position, size, drag/resize options | `ref`, `style`, drag/resize props, state flags, reset helpers |
| `useEdgeBoxPaddingValues` | Turn shorthand padding into `{top,right,bottom,left}` | `number` or object | `PaddingValues` |
| `useEdgeBoxCssPosition` | Return low-level anchored CSS edge coordinates | `position`, `paddingValues` | `cssEdgePosition()`, `initialCssPosition` |
| `useEdgeBoxPosition` | Initial anchored placement + viewport-resize recalc | `position`, `width/height`, `padding`, `safeZone` | `edges`, `updateEdges`, `recalculate`, `resetPosition` |
| `useEdgeBoxDrag` | Dragging + boundary clamping | `edges`, `updateEdges`, `elementRef`, `safeZone` | `dragOffset`, `handleMouseDown`, `handleTouchStart`, `resetDragOffset`, `cancelDrag`, flags |
| `useEdgeBoxResize` | Resizing + constraints + safe-zone clamping | `edges`, `updateEdges`, `baseOffset`, constraints | `dimensions`, `resizeOffset`, `handleResizeStart`, `resetSize(options?)`, flags |
| `useEdgeBoxTransform` | Compose drag/resize motion into one render transform | offsets, optional `baseTransform` | `offset`, `transform` |
| `useEdgeBoxViewportClamp` | Keep auto-sized DOM inside viewport | `elementRef`, `updateEdges`, `deps` | `clampNow()` |

## Types

Main types used across the package:

- `Position`
- `Dimensions`
- `ResizeDirection`
- `EdgeBoxEdges`
- `EdgeBoxAutoFocus`
- `PaddingValue`
- `PaddingValues`
- `CssEdgePosition`
- `EdgePosition`
- `UseEdgeBoxCssPositionResult`

## Hook reference

### `useEdgeBox(options)`

High-level composite hook for the common EdgeBox pattern.

Use this when you want the simplest API for a draggable and/or resizable floating element without manually composing `useEdgeBoxPosition`, `useEdgeBoxDrag`, `useEdgeBoxResize`, and `useEdgeBoxTransform` yourself.

Options:

- `position?: EdgePosition` – anchored start position (default: `bottom-right`)
- `width?: number`, `height?: number` – initial box size
- `initialWidth?: number`, `initialHeight?: number` – aliases for initial size when you prefer resize-style naming
- `padding?: PaddingValue` – anchored inset (default: `24`)
- `safeZone?: number` – boundary inset (default: `0`)
- `disableAutoRecalc?: boolean` – disable automatic viewport resize recalculation
- `draggable?: boolean` (default: `true`)
- `resizable?: boolean` (default: `true`)
- `commitToEdges?: boolean` (default: `false`)
- `minWidth?`, `minHeight?`, `maxWidth?`, `maxHeight?` – resize constraints
- `autoFocus?: EdgeBoxAutoFocus`
- `autoFocusSensitivity?: number`
- `dragStartDistance?`, `dragStartDelay?`, `dragEndEventDelay?`
- `baseTransform?: string` – prepend a transform before the EdgeBox `translate3d(...)`
- `onCommitSize?`, `onDragEnd?`, `onResizeEnd?`

Returns:

- `ref`
- `style`
- `edges`, `dimensions`
- `dragOffset`, `resizeOffset`, `offset`, `transform`
- `isDragging`, `isPendingDrag`, `isResizing`, `resizeDirection`
- `updateEdges(...)`, `recalculate()`, `resetPosition()`
- `resetDragOffset()`, `cancelDrag()`, `resetSize(options?)`
- `handleMouseDown(e)`, `handleTouchStart(e)`, `handleResizeStart(direction, e)`
- `getDragProps()` – returns drag bindings for a drag handle or container
- `getResizeHandleProps(direction)` – returns bindings for a resize handle

### `useEdgeBoxPaddingValues(padding)`

Normalizes a `number` or shorthand object into `PaddingValues`.

Use this hook when you want one consistent padding object to pass into positioning helpers. It is especially useful when your component accepts shorthand config but the rest of your layout math expects explicit `top/right/bottom/left` numbers.

Accepted input:

- `number`
- object shorthand:
  - `all?: number`
  - `horizontal?: number`
  - `vertical?: number`
  - `top?: number`
  - `right?: number`
  - `bottom?: number`
  - `left?: number`

Resolution order:

- If you pass a `number`, all four sides get that number.
- If you pass an object, the hook resolves values in this order:
  - `all` as the broad default
  - `horizontal` / `vertical` override `all`
  - side-specific values (`top`, `right`, `bottom`, `left`) override everything else for that side
- Missing object values fall back to `24`.

Returns:

- `PaddingValues`
  - `top: number`
  - `right: number`
  - `bottom: number`
  - `left: number`

```ts
const paddingValues = useEdgeBoxPaddingValues({ all: 24, horizontal: 32 });
// => { top: 24, right: 32, bottom: 24, left: 32 }
```

More examples:

```ts
useEdgeBoxPaddingValues(16);
// => { top: 16, right: 16, bottom: 16, left: 16 }

useEdgeBoxPaddingValues({ all: 24, vertical: 40, left: 8 });
// => { top: 40, right: 24, bottom: 40, left: 8 }
```

### `useEdgeBoxPosition(options)`

Tracks the committed box position (`edges`) and recalculates/clamps it on viewport resize.

Options:

- `position?: EdgePosition` – anchored start position (default: `bottom-right`)
- `width?: number`, `height?: number` – known box dimensions (recommended)
- `padding?: PaddingValue` – anchored inset (default: `24`)
- `safeZone?: number` – boundary inset (default: `0`)
- `disableAutoRecalc?: boolean` – disables automatic recalculation on `window.resize` (default: `false`)

Returns:

- `edges`
- `recalculate()`
- `updateEdges(partialEdges)` – switches EdgeBox into manual mode
- `resetPosition()` – clears manual mode and restores the anchored default position

### `useEdgeBoxDrag(options)`

Adds draggable behavior and boundary clamping.

Options:

- `edges: EdgeBoxEdges`
- `updateEdges?: (partial: Partial<EdgeBoxEdges>) => void`
- `commitToEdges?: boolean` (default: `false`)
- `safeZone?: number` (default: `0`)
- `dragStartDistance?: number` (default: `6`)
- `dragStartDelay?: number` (default: `150`)
- `dragEndEventDelay?: number` (default: `150`)
- `autoFocus?: EdgeBoxAutoFocus` (default: `unset`)
- `autoFocusSensitivity?: number` (default: `5`)
- `elementWidth?: number`, `elementHeight?: number`
- `elementRef?: React.RefObject<HTMLElement>`
- `onDragEnd?: (finalOffset: Position) => void`

Returns:

- `dragOffset: { x, y }`
- `isDragging`, `isPendingDrag`
- `handleMouseDown(e)`, `handleTouchStart(e)`
- `resetDragOffset()`
- `cancelDrag()`

### Auto focus

Both `useEdgeBoxDrag` and `useEdgeBoxResize` can apply auto focus on gesture end.

- `autoFocus?: EdgeBoxAutoFocus` (default: `unset`)
- `autoFocusSensitivity?: number` (default: `5`) – percentage of the viewport

Supported presets:

- `unset`
- `all`, `full`
- `horizontal`, `vertical`
- `top`, `bottom`, `left`, `right`
- `right-left`, `bottom-top`
- `full-horizontal-vertical`, `horizontal-vertical`
- `full-horizontal`, `full-vertical`
- `full-top`, `full-bottom`, `full-left`, `full-right`
- `corners`
- `right-bottom`, `right-top`, `left-bottom`, `left-top`

Advanced: you can also pass a comma-separated string of numeric areas (for example `"1,2,10"`).

### `useEdgeBoxResize(options)`

Adds 8-direction resize behavior with min/max constraints and safe-zone clamping.

Options:

- `edges: EdgeBoxEdges`
- `updateEdges?: (partial: Partial<EdgeBoxEdges>) => void`
- `commitToEdges?: boolean` (default: `false`)
- `onCommitSize?: (dimensions: Dimensions) => void`
- `baseOffset?: Position` (default: `{ x: 0, y: 0 }`)
- `initialWidth?: number` (default: `420`)
- `initialHeight?: number` (default: `550`)
- `minWidth?: number` (default: `300`)
- `minHeight?: number` (default: `400`)
- `maxWidth?: number` (default: `window.innerWidth` / fallback `1920`)
- `maxHeight?: number` (default: `window.innerHeight` / fallback `1080`)
- `safeZone?: number` (default: `0`)
- `autoFocus?: EdgeBoxAutoFocus` (default: `unset`)
- `autoFocusSensitivity?: number` (default: `5`)
- `onResizeEnd?: (finalDimensions: Dimensions, finalOffset: Position) => void`

Returns:

- `dimensions: { width, height }`
- `resizeOffset: { x, y }`
- `isResizing`, `resizeDirection`
- `handleResizeStart(direction, e)`
- `resetSize(options?)`

Reset options:

- `commit?: boolean` (default: `false`)
  - `resetSize()` resets local resize state only
  - `resetSize({ commit: true })` also calls `onCommitSize(...)` and commits the reset dimensions back into `edges`

### `useEdgeBoxTransform(options)`

Composes EdgeBox motion into a single `translate3d(...)` string while keeping committed geometry in `edges`.

Options:

- `dragOffset?: Position` (default: `{ x: 0, y: 0 }`)
- `resizeOffset?: Position` (default: `{ x: 0, y: 0 }`)
- `isResizing?: boolean`
- `includeResizeOffset?: boolean` (default: `true`)
- `baseTransform?: string`

Returns:

- `offset: { x, y }`
- `transform: string`

### `useEdgeBoxViewportClamp(options)`

DOM-measure clamp for elements whose size changes outside drag/resize gestures.

Options:

- `elementRef: React.RefObject<HTMLElement>`
- `updateEdges(partialEdges)`
- `safeZone?: number` (default: `0`)
- `disabled?: boolean` (default: `false`)
- `deps?: readonly unknown[]` (default: `[]`)

Returns:

- `clampNow()`

### `useEdgeBoxCssPosition(options)`

Low-level helper that returns CSS edge style (`left`/`right`/`top`/`bottom`) for an anchored position.

Options:

- `position: EdgePosition`
- `paddingValues: PaddingValues`

Supported `position` values:

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

Returns:

- `cssEdgePosition()`
- `initialCssPosition`
