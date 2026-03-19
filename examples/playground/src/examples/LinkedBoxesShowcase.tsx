import { useRef } from "react";
import {
  useEdgeBox,
  useEdgeBoxLinkedBoxes,
  useEdgeBoxMeasuredSize,
  useEdgeBoxViewportSize,
} from "@edgebox-lite/react";

export function LinkedBoxesShowcase() {
  const sourceRef = useRef<HTMLDivElement>(null);
  const linkedRef = useRef<HTMLDivElement>(null);

  const {
    ref,
    style,
    edges,
    dimensions,
    offset,
    isDragging,
    isPendingDrag,
    isResizing,
    getDragProps,
    getResizeHandleProps,
  } = useEdgeBox({
    elementRef: sourceRef,
    position: "bottom-center",
    width: 320,
    height: 180,
    padding: 24,
    safeZone: 16,
    commitToEdges: true,
    minWidth: 240,
    minHeight: 140,
    autoFocus: "horizontal",
  });

  const linkedSize = useEdgeBoxMeasuredSize(linkedRef) ?? { width: 160, height: 64 };
  const viewport = useEdgeBoxViewportSize({ padding: 16 });
  const { getRectFromEdges, getLinkedRect, getLinkedEdges } = useEdgeBoxLinkedBoxes({
    position: "top-right",
    safeZone: 16,
  });

  const sourceRect = getRectFromEdges(edges, offset, dimensions);
  const linkedRect = getLinkedRect(sourceRect, linkedSize, true);
  const linkedEdges = getLinkedEdges(sourceRect, linkedSize, true);

  return (
    <div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row">
          <strong>LinkedBoxesShowcase</strong>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.92, lineHeight: 1.35 }}>
          Drag or resize the main panel. The linked overlay is positioned from the source box using
          <code> useEdgeBoxLinkedBoxes </code>, while its measured DOM size comes from
          <code> useEdgeBoxMeasuredSize </code>.
        </div>
      </div>

      <div
        ref={ref}
        style={{
          ...style,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 16,
          padding: 12,
          boxShadow: isDragging || isResizing ? "0 20px 60px rgba(0,0,0,0.45)" : "0 12px 30px rgba(0,0,0,0.28)",
          touchAction: "none",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: isDragging ? "grabbing" : "grab" }}
          {...getDragProps()}
        >
          <strong style={{ flex: 1 }}>Source panel</strong>
          <span style={{ fontSize: 12, opacity: 0.85 }}>
            {isDragging ? "Dragging" : isPendingDrag ? "Hold…" : isResizing ? "Resizing" : "Idle"}
          </span>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.35, opacity: 0.9 }}>
          <div>
            Source rect: <code>{Math.round(sourceRect.left)}, {Math.round(sourceRect.top)}, {Math.round(sourceRect.width)}×{Math.round(sourceRect.height)}</code>
          </div>
          <div>
            Viewport inner size: <code>{viewport.width}×{viewport.height}</code>
          </div>
          <div>
            Linked edges center: <code>{Math.round(linkedEdges.center.x)}, {Math.round(linkedEdges.center.y)}</code>
          </div>
        </div>

        <button
          style={{ marginTop: 14 }}
          {...getResizeHandleProps("se")}
        >
          Resize
        </button>
      </div>

      <div
        ref={linkedRef}
        style={{
          position: "fixed",
          left: linkedRect.left,
          top: linkedRect.top,
          width: linkedRect.width,
          height: linkedRect.height,
          borderRadius: 14,
          background: "rgba(34,197,94,0.16)",
          border: "1px solid rgba(34,197,94,0.55)",
          padding: 10,
          fontSize: 12,
          lineHeight: 1.35,
          boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
        }}
      >
        <strong>Linked overlay</strong>
        <div style={{ marginTop: 6, opacity: 0.9 }}>
          measured: <code>{Math.round(linkedSize.width)}×{Math.round(linkedSize.height)}</code>
        </div>
      </div>
    </div>
  );
}
