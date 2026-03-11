# Examples

This directory contains runnable examples for `@edgebox/react`.

## Requirements

- Node.js 18+ (recommended: latest LTS)
- npm 9+ (or pnpm/yarn)

## How to run

1) Build the library (this repo root):

```bash
npm install
npm run build
```

2) Install and run the example playground:

```bash
cd examples/playground
npm install
npm run dev
```

Then open the dev server URL shown in the terminal.

## Included examples

The playground app contains these examples:

- `DraggableStickyNote` – basic drag + safe-zone clamping
- `ResizableToolPalette` – basic resize (8 directions) + min/max constraints
- `DragResizeWindow` – drag + resize combined (offset composition)
- `AutoSizedQuickMenu` – auto-sized element + `useEdgeBoxViewportClamp` for intrinsic-size changes
- `AutoFocusSnapBox` – snapping (auto focus) after drag/resize
