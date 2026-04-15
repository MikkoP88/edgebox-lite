# EdgeBox Lite - `@edgebox-lite/react`

`@edgebox-lite/react` is a lightweight React hook package for draggable, resizable, and anchored floating UI.

Use it for things like:
- floating panels
- tool palettes
- chat windows
- menus and popovers
- small anchored overlays

EdgeBox uses an **edges-first** model:
- committed position is stored as viewport `left` / `right` / `top` / `bottom`
- temporary drag and resize motion is applied with `transform: translate3d(...)`

That keeps interaction updates smooth while still letting you commit final geometry when a gesture ends.

## Start here

- Live playground: https://mikkop88.github.io/edgebox-lite/
- API reference: `docs/api.md`
- Advanced usage: `docs/advanced.md`
- Example source: `examples/playground`

## Install

```bash
npm install @edgebox-lite/react
```

Requirements:
- React `>=18`
- TypeScript supported
- ESM + CJS builds included

## Quick start

For most apps, start with `useEdgeBox()`.

```tsx
import { useEdgeBox } from "@edgebox-lite/react";

export function FloatingPanel() {
  const {
    ref,
    style,
    getDragProps,
    getResizeHandleProps,
    isDragging,
    isResizing,
  } = useEdgeBox({
    position: "bottom-right",
    width: 320,
    height: 220,
    padding: 24,
    safeZone: 16,
    commitToEdges: true,
    minWidth: 240,
    minHeight: 160,
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        position: "fixed",
        background: "#1b2337",
        border: "1px solid #45516f",
        borderRadius: 16,
        touchAction: "none",
      }}
    >
      <div {...getDragProps()}>
        {isDragging ? "Dragging" : isResizing ? "Resizing" : "Drag me"}
      </div>

      <button {...getResizeHandleProps("se")}>Resize</button>
    </div>
  );
}
```

## Which API should be used?

### Use `useEdgeBox()` when
- one box needs drag and/or resize
- a simple high-level API is preferred
- drag props and resize handle props are wanted out of the box

### Use primitive hooks when
- drag, resize, and position must be composed manually
- custom rendering or gesture wiring is needed
- auto-sized or linked UI is being built

Common choices:

| Goal | Recommended API |
|---|---|
| Drag-only box | `useEdgeBox()` or `useEdgeBoxDrag` |
| Resize-only box | `useEdgeBox()` or `useEdgeBoxResize` |
| Drag + resize panel | `useEdgeBox()` |
| Auto-sized menu that must stay in view | `useEdgeBoxPosition` + `useEdgeBoxDrag` + `useEdgeBoxViewportClamp` |
| Anchored CSS-only placement | `useEdgeBoxCssPosition` |
| Linked/follower overlay | `useEdgeBoxLinkedBoxes` |

## Main features

- Anchored positioning: `top-left`, `top-center`, `bottom-right`, and more
- Drag with safe-zone clamping
- 8-direction resize with min/max constraints
- Optional commit mode for drag and resize
- Auto focus snapping on gesture end
- Auto-sized DOM viewport clamping with `ResizeObserver`
- Geometry helpers for rect/edge conversions and alignment
- Viewport and measured-size helpers
- SSR-aware guards around `window`
- Multitouch-safe gesture tracking

## Exports at a glance

Main high-level export:
- `useEdgeBox`

Useful lower-level hooks:
- `useEdgeBoxPosition`
- `useEdgeBoxDrag`
- `useEdgeBoxResize`
- `useEdgeBoxTransform`
- `useEdgeBoxMeasuredSize`
- `useEdgeBoxViewportSize`
- `useEdgeBoxViewportClamp`
- `useEdgeBoxLinkedBoxes`
- `useEdgeBoxCssPosition`
- `useEdgeBoxPaddingValues`
- `resolveEdgeBoxPaddingValues`

Geometry helpers:
- `rectToEdges`
- `edgesToRect`
- `edgesToOffsetRect`
- `alignRect`
- `clampRectToViewport`

For full signatures and return types, use `docs/api.md`.

## Examples

Runnable playground examples are in `examples/playground`.

Included demos:
- `SimpleDraggableBox`
- `SimpleResizableBox`
- `DragResizeWindow`
- `AutoSizedQuickMenu`
- `AutoFocusSnapBox`
- `AnchoredCssPositionShowcase`

Run locally:

```bash
npm install
npm run build
cd examples/playground
npm install
npm run dev
```

## Core concepts

### 1. Edges are the committed position

EdgeBox stores committed geometry as viewport coordinates.

```ts
type EdgeBoxEdges = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  center: { x: number; y: number };
};
```

### 2. Offsets are temporary motion

During drag and resize, temporary movement is usually rendered with `transform`.

- committed geometry stays in `edges`
- temporary movement lives in `dragOffset` and `resizeOffset`
- `useEdgeBoxTransform()` combines offsets into one render transform

### 3. `padding` and `safeZone` are different

- `padding`: initial anchored inset
- `safeZone`: enforced viewport boundary inset

In short:
- `padding` sets where the box starts
- `safeZone` sets where the box is allowed to go

### 4. Commit mode

With `commitToEdges: true`:
- the box moves with temporary offsets during interaction
- final geometry is committed into `edges` at gesture end
- offsets reset back to zero

With `commitToEdges: false`:
- offsets remain the source of truth
- committed `edges` are not rewritten automatically

## Animations

Yes, animations are possible.

### Safe / recommended
Animate inner content or visual polish such as:
- `opacity`
- `background`
- `box-shadow`
- border color
- inner content transitions

### Use caution on the outer controlled container
Do **not** animate these properties during active drag or resize:
- `transform`
- `left`
- `top`
- `right`
- `bottom`
- `width`
- `height`

Why:
- pointer lag
- jitter
- overshoot
- incorrect clamp or snap behavior

Recommended pattern:
- keep the EdgeBox-controlled outer element immediate
- animate child content instead
- post-gesture animations are fine if they do not fight live pointer updates

Bad:

```css
.floating {
  transition: all 300ms ease;
}
```

Better:

```css
.floating {
  /* no transition on EdgeBox-controlled layout properties */
}

.floatingContent {
  transition: opacity 300ms ease, box-shadow 300ms ease;
}
```

## Common pitfalls

### Prefer `position: fixed`
EdgeBox uses viewport coordinates, so the rendered element is usually `position: fixed`.

### Do not overwrite the movement transform
If a base transform is also needed, compose it into one transform string.

```ts
const transform = `${baseTransform} translate3d(${offset.x}px, ${offset.y}px, 0)`;
```

### Prefer `elementRef` when actual DOM size matters
Use `elementRef` for drag and viewport-clamp flows when accurate live DOM measurement is important.

### Avoid delayed layout transitions on the controlled container
Transitions on layout and movement properties make drag and resize feel wrong.

## Documentation map

- `README.md` - onboarding and common usage
- `docs/api.md` - hook-by-hook reference
- `docs/advanced.md` - low-level composition and advanced recipes
- `examples/README.md` - running the examples

## Compatibility

Languages:
- JavaScript
- TypeScript

Frameworks / bundlers:
- Vite
- Next.js
- Remix
- CRA / custom Webpack

## Package structure

- `src/` - package source
- `dist/` - built output
- `examples/playground/` - runnable demo app
- `docs/` - reference and advanced guides

## License

MIT
