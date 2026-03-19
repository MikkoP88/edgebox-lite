import { useEdgeBox } from "@edgebox-lite/react";

export function SimpleDraggableBox() {
  const { ref, style, isDragging, getDragProps } = useEdgeBox({
    position: "bottom-left",
    width: 220,
    height: 120,
    padding: 24,
    safeZone: 16,
    commitToEdges: true,
    resizable: false,
  });

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: isDragging ? "0 20px 55px rgba(0,0,0,0.45)" : "0 14px 40px rgba(0,0,0,0.35)",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      {...getDragProps()}
    >
      <strong>SimpleDraggableBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal drag example using the new <code>useEdgeBox</code> helper.
      </p>
    </div>
  );
}
