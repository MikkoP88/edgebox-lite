import { useEdgeBox } from "@edgebox-lite/react";

export function SimpleResizableBox() {
  const { style, dimensions, isResizing, getResizeHandleProps } = useEdgeBox({
    position: "top-right",
    width: 260,
    height: 160,
    padding: 24,
    safeZone: 16,
    draggable: false,
    commitToEdges: true,
    minWidth: 200,
    minHeight: 120,
  });

  return (
    <div
      style={{
        ...style,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: isResizing ? "0 20px 55px rgba(0,0,0,0.45)" : "0 14px 40px rgba(0,0,0,0.35)",
        touchAction: "none",
      }}
    >
      <strong>SimpleResizableBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal resize example using <code>useEdgeBox</code> and one bottom-right handle.
      </p>
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.82 }}>
        Size: <code>{Math.round(dimensions.width)}×{Math.round(dimensions.height)}</code>
      </div>

      <button
        style={{ position: "absolute", right: 10, bottom: 10, cursor: "nwse-resize" }}
        {...getResizeHandleProps("se")}
      >
        Resize
      </button>
    </div>
  );
}
