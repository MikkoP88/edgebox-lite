# Advanced EdgeBox usage

Back to the main guide: [`README.md`](../README.md)

Full API reference: [`docs/api.md`](./api.md)

## Advanced: composing the primitive hooks manually

Most apps should start with `useEdgeBox()`.

The following walkthrough is the lower-level composition path for advanced customization, custom gesture wiring, or library-level integrations where you want to use the primitive hooks directly.

### Requirements

- React 18+
- Your floating element should usually be `position: fixed` (because EdgeBox uses viewport coordinates)
- Add `touchAction: "none"` to the draggable/resizable element (prevents the browser from treating touch as scroll/zoom)

### Step 1: Create a `ref`

EdgeBox can measure the element for better boundary clamping.

```tsx
const panelRef = useRef<HTMLDivElement>(null);
```

### Step 2: Pick `padding` and `safeZone`

- `padding` = where the element starts (anchored inset)
- `safeZone` = where the element is allowed to be (clamp boundary)

```tsx
const paddingValues = useEdgeBoxPaddingValues(24);
const safeZone = 16;
```

### Step 3: Position (committed `edges`)

```tsx
const { edges, updateEdges } = useEdgeBoxPosition({
  position: "bottom-right",
  width: 420,
  height: 260,
  padding: paddingValues,
  safeZone,
});
```

### Step 4: Drag (temporary `dragOffset`)

```tsx
const { dragOffset, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
  edges,
  updateEdges,
  commitToEdges: true,
  elementRef: panelRef,
  safeZone,
});
```

### Step 5: Resize (temporary `resizeOffset` + `dimensions`)

Most UIs also keep a committed size, so the next render starts from the last size.

```tsx
const [committedSize, setCommittedSize] = useState({ width: 420, height: 260 });

const { dimensions, resizeOffset, handleResizeStart, isResizing } = useEdgeBoxResize({
  edges,
  updateEdges,
  commitToEdges: true,
  onCommitSize: setCommittedSize,
  baseOffset: dragOffset,
  initialWidth: committedSize.width,
  initialHeight: committedSize.height,
  minWidth: 300,
  minHeight: 200,
  safeZone,
});
```

### Step 6: Render (`edges` + offsets)

```tsx
const { transform } = useEdgeBoxTransform({
  dragOffset,
  resizeOffset,
  isResizing,
});

return (
  <div
    ref={panelRef}
    style={{
      position: "fixed",
      left: edges.left,
      top: edges.top,
      width: dimensions.width,
      height: dimensions.height,
      transform,
      touchAction: "none",
    }}
    onMouseDown={handleMouseDown}
    onTouchStart={handleTouchStart}
  />
);
```

## Advanced recipe: primitive hook composition

This is the lower-level composition pattern:

1) `useEdgeBoxPosition` holds the committed `edges`.
2) `useEdgeBoxDrag` produces `dragOffset`.
3) `useEdgeBoxResize` produces `dimensions` and `resizeOffset`.
4) Apply `edges` via CSS `left/top` and apply combined offsets via `useEdgeBoxTransform(...)`.

If you use both drag and resize together, pass the current drag offset as `baseOffset` into resize so resize math matches the element’s transformed position.

## Logic flow (low-level hooks)

Typical low-level render/update loop for a floating element:

1) `useEdgeBoxPosition` provides committed `edges`.
2) Drag/resize hooks produce temporary offsets (`dragOffset`, `resizeOffset`) and/or dimensions.
3) `useEdgeBoxTransform` composes those offsets into one render transform.
4) Your component renders with:
   - static positioning: `left: edges.left`, `top: edges.top`
   - dynamic movement: `transform`
5) On gesture end:
   - if `commitToEdges: true`, the hook calls `updateEdges(...)` and resets offsets back to `0,0`
   - if `commitToEdges: false`, offsets remain as the source of truth
6) On viewport resize:
   - `useEdgeBoxPosition` recalculates/clamps anchored boxes
   - if the element is in manual mode, it clamps the manual position into `safeZone`

## `useEdgeBoxViewportClamp(options)`

DOM-measure clamp for elements whose size changes *outside* drag/resize gestures (menus, popovers, dynamic content, responsive layout changes).

Options:

- `elementRef: React.RefObject<HTMLElement>`
- `updateEdges(partialEdges)`
- `safeZone?: number` (default: `0`)
- `disabled?: boolean` (default: `false`)
- `deps?: readonly unknown[]` (default: `[]`) – re-clamp after these dependencies change

Returns:

- `clampNow()` – manually measure and clamp the element into the viewport immediately

Viewport clamp is useful when intrinsic DOM size changes after render, for example:

- menus that expand/collapse
- async content loading
- responsive content blocks
- popovers whose content changes without a drag/resize gesture

## `useEdgeBoxMeasuredSize(ref, options?)`

Use `useEdgeBoxMeasuredSize()` when you need the real DOM size of an element and that size may change after render.

Typical uses:

- auto-sized menus
- tooltip/popover content
- follower overlays whose size should drive linked positioning
- intrinsic content that loads asynchronously

Because the hook uses `ResizeObserver`, it stays aligned with actual DOM size rather than guessed dimensions.

## `useEdgeBoxViewportSize(options?)`

Use `useEdgeBoxViewportSize()` when you want viewport dimensions as reactive state, optionally reduced by resolved padding.

Typical uses:

- build container rects for layout helpers
- calculate inner working area after edge padding
- respond to `visualViewport` changes on mobile browsers
- feed viewport values into custom layout systems outside `useEdgeBoxPosition`

The hook returns both:

- raw viewport size: `viewportWidth`, `viewportHeight`
- padded inner size: `width`, `height`

## Geometry helpers

The package now exposes pure rect/edge helpers for layout math outside React state.

Useful helpers:

- `rectToEdges(rect)`
- `edgesToRect(edges)`
- `edgesToOffsetRect(edges, offset?, size?)`
- `alignRect(containerRect, size, position)`
- `clampRectToViewport(rect, safeZone?)`

These are useful when you need to:

- convert between render rects and committed edges
- align follower UI inside or around another rect
- clamp arbitrary layout output back into the viewport
- test geometry math without mounting React hooks

## `useEdgeBoxLinkedBoxes(options)`

`useEdgeBoxLinkedBoxes()` builds on the geometry helpers for linked UI such as:

- overlays attached to a draggable window
- floating badges or status chips
- mini tool palettes that follow a source panel
- linked windows that should stay aligned with a source rect

Typical flow:

1) compute the source rect from `edges` and current offset with `getRectFromEdges(...)`
2) measure the follower box with `useEdgeBoxMeasuredSize(...)`
3) generate a linked rect with `getLinkedRect(...)`
4) optionally clamp it to the viewport

This keeps the follower box derived from the source box instead of manually recalculating positions in component code.

## `useEdgeBoxCssPosition(options)`

Low-level helper that returns CSS edge style (`left`/`right`/`top`/`bottom`) for an anchored position. Most components in this repo use `useEdgeBoxPosition` directly instead.

Use this hook when you specifically want CSS edge properties for rendering logic, but you do **not** need the full committed `edges` model from `useEdgeBoxPosition`.

Typical cases:

- low-level component primitives
- CSS-driven anchored layouts
- initial placement helpers
- custom components that want to render with `right`/`bottom` instead of converting everything to `left`/`top`

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

- `cssEdgePosition()` – recalculates the current CSS edge position
- `initialCssPosition` – the initial calculated CSS edge position

Behavior notes:

- left-anchored positions return `left`
- right-anchored positions return `right`
- top-anchored positions return `top`
- bottom-anchored positions return `bottom`
- centered positions use `left: window.innerWidth / 2`
- on the server, the fallback is `{ left: 0, top: 0 }`

Example:

```tsx
const paddingValues = useEdgeBoxPaddingValues({ top: 16, right: 24, bottom: 16, left: 24 });

const { initialCssPosition } = useEdgeBoxCssPosition({
  position: "bottom-right",
  paddingValues,
});

// initialCssPosition === { right: 24, bottom: 16 }
```

Example with center anchoring:

```tsx
const { cssEdgePosition } = useEdgeBoxCssPosition({
  position: "top-center",
  paddingValues: useEdgeBoxPaddingValues(24),
});

const anchoredStyle = cssEdgePosition();
// => { left: window.innerWidth / 2, top: 24 }
```

For most interactive floating UI, prefer `useEdgeBoxPosition`, because it gives you the higher-level `edges` model plus recalculation and manual updates.

## Important warnings (CSS + transforms)

### Avoid transitions/animations on the positioned container

EdgeBox updates `left`/`top` (and applies `transform`) frequently during pointer interactions.

Do **not** apply `transition` / `animation` to these properties on the draggable/resizable container:

- `transform`
- `left`, `top`, `right`, `bottom`
- `width`, `height`

Why: any delay/easing on those properties will cause the DOM to lag behind pointer movement. This can create visible jitter, overshoot, and incorrect boundary/clamp behavior.

Recommended pattern:

- keep the outer EdgeBox-controlled element instant (no transitions)
- apply transitions to inner content elements instead (opacity, background, shadows, etc.)

## Common pitfalls

### Use viewport-relative positioning

EdgeBox `edges` are viewport coordinates, so the positioned element is typically `position: fixed`.

If you place the element inside a transformed/zoomed parent, or inside a scroll container, viewport math and DOM rects (`getBoundingClientRect`) may no longer match your intended coordinate space.

### Compose transforms (don’t overwrite them)

EdgeBox expects to control `transform` for movement.

If you also need a base transform (for example `translateX(-50%)`, scaling, or rotation), compose it into one `transform` string rather than setting `transform` in two places.

Example:

```ts
const transform = `${baseTransform} translate3d(${offset.x}px, ${offset.y}px, 0)`;
```

### Prefer `elementRef` for accurate sizing

If possible, pass an `elementRef` into drag/viewport clamp so EdgeBox can measure the real DOM rect.

### CSS example: what not to do

Bad:

```css
.floating {
  transition: all 300ms ease;
  transition-delay: 100ms;
}
```

Good:

```css
.floating {
  /* no transitions on the EdgeBox-controlled container */
}

.floatingContent {
  transition: opacity 300ms ease;
}
```
