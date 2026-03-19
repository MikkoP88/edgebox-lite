import {
  alignRect,
  clampRectToViewport,
  edgesToOffsetRect,
  edgesToRect,
  rectToEdges,
  resolveEdgeBoxPaddingValues,
  useEdgeBoxViewportSize,
} from "@edgebox-lite/react";

export function LayoutHelpersShowcase() {
  const viewport = useEdgeBoxViewportSize({ padding: { all: 24, horizontal: 32 } });

  const containerRect = {
    left: 24,
    top: 40,
    width: 300,
    height: 160,
  };

  const alignedRect = alignRect(containerRect, { width: 120, height: 72 }, "bottom-right");
  const alignedEdges = rectToEdges(alignedRect);
  const roundTripRect = edgesToRect(alignedEdges);
  const offsetRect = edgesToOffsetRect(alignedEdges, { x: 12, y: -10 });
  const clampedViewportRect = clampRectToViewport(
    {
      left: viewport.viewportWidth - 120,
      top: viewport.viewportHeight - 90,
      width: 180,
      height: 120,
    },
    16,
  );
  const resolvedPadding = resolveEdgeBoxPaddingValues({ all: 24, horizontal: 32, top: 12 });

  return (
    <div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row">
          <strong>LayoutHelpersShowcase</strong>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.92, lineHeight: 1.35 }}>
          This demo shows the exported pure helpers for rect/edge conversion, alignment, viewport clamping,
          offset composition, and the pure padding resolver.
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: 380,
          height: 250,
          marginTop: 16,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: containerRect.left,
            top: containerRect.top,
            width: containerRect.width,
            height: containerRect.height,
            border: "1px dashed rgba(255,255,255,0.45)",
            borderRadius: 14,
            padding: 10,
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          containerRect
        </div>

        <div
          style={{
            position: "absolute",
            left: alignedRect.left,
            top: alignedRect.top,
            width: alignedRect.width,
            height: alignedRect.height,
            borderRadius: 12,
            background: "rgba(56,189,248,0.3)",
            border: "1px solid rgba(56,189,248,0.65)",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          alignRect
        </div>

        <div
          style={{
            position: "absolute",
            left: offsetRect.left,
            top: offsetRect.top,
            width: offsetRect.width,
            height: offsetRect.height,
            borderRadius: 12,
            background: "rgba(168,85,247,0.22)",
            border: "1px solid rgba(168,85,247,0.55)",
            display: "grid",
            placeItems: "center",
            fontSize: 12,
          }}
        >
          edgesToOffsetRect
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 8, fontSize: 13, lineHeight: 1.35 }}>
          <div>
            Viewport: <code>{viewport.viewportWidth}×{viewport.viewportHeight}</code>
          </div>
          <div>
            Inner viewport after padding: <code>{viewport.width}×{viewport.height}</code>
          </div>
          <div>
            Resolved padding: <code>{JSON.stringify(resolvedPadding)}</code>
          </div>
          <div>
            `rectToEdges` / `edgesToRect`: <code>{JSON.stringify(roundTripRect)}</code>
          </div>
          <div>
            `clampRectToViewport`: <code>{JSON.stringify(clampedViewportRect)}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
