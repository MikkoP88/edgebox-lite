import { useRef } from "react";
import { useEdgeBoxDrag, useEdgeBoxPosition, usePaddingValues } from "@edgebox-lite/react";

export function DraggableStickyNote() {
  const noteRef = useRef<HTMLDivElement>(null);

  const paddingValues = usePaddingValues(24);
  const safeZone = 16;

  const width = 260;
  const height = 180;

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "bottom-right",
    width,
    height,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, isDragging, isPendingDrag, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: noteRef,
    safeZone,
  });

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width,
    height,
    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
    background: "#ffe066",
    color: "#1b1b1b",
    borderRadius: 16,
    padding: 14,
    boxShadow: isDragging
      ? "0 20px 60px rgba(0,0,0,0.45)"
      : isPendingDrag
        ? "0 16px 40px rgba(0,0,0,0.35)"
        : "0 12px 30px rgba(0,0,0,0.3)",
    userSelect: "none",
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={noteRef}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <strong>DraggableStickyNote</strong>
      <p style={{ margin: "10px 0 0", lineHeight: 1.25 }}>
        Click and drag me. I stay inside the safe zone ({safeZone}px).
      </p>
      <p style={{ margin: "10px 0 0", lineHeight: 1.25, opacity: 0.9 }}>
        Tip: set <code>commitToEdges</code> to keep the final position.
      </p>
    </div>
  );
}
