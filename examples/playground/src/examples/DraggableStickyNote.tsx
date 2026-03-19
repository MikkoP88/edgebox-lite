import { useState } from "react";
import { useEdgeBox } from "@edgebox-lite/react";

export function DraggableStickyNote() {
  const [lastRelease, setLastRelease] = useState("Not released yet");

  const {
    ref,
    style: edgeBoxStyle,
    dragOffset,
    isDragging,
    isPendingDrag,
    getDragProps,
    resetDragOffset,
    cancelDrag,
  } = useEdgeBox({
    position: "bottom-right",
    width: 260,
    height: 180,
    padding: 24,
    safeZone: 16,
    commitToEdges: false,
    resizable: false,
    baseTransform: "rotate(-2deg)",
    dragStartDistance: 10,
    dragStartDelay: 180,
    dragEndEventDelay: 220,
    onDragEnd: (finalOffset) => {
      setLastRelease(`${Math.round(finalOffset.x)}px, ${Math.round(finalOffset.y)}px`);
    },
  });

  const stopInteraction: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
  };

  const stopTouch: React.TouchEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
  };

  const noteStyle: React.CSSProperties = {
    ...edgeBoxStyle,
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
      ref={ref}
      style={noteStyle}
      {...getDragProps()}
    >
      <strong>DraggableStickyNote</strong>
      <p style={{ margin: "10px 0 0", lineHeight: 1.25 }}>
        This demo uses <code>useEdgeBox()</code> with <code>commitToEdges: false</code>, so the drag offset stays as the source of truth until you reset it.
      </p>
      <p style={{ margin: "10px 0 0", lineHeight: 1.25, opacity: 0.9 }}>
        Safe zone: <code>16px</code>. Base transform is composed with <code>rotate(-2deg)</code>.
      </p>

      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.35 }}>
        <div>
          Status: <strong>{isDragging ? "Dragging" : isPendingDrag ? "Pending drag" : "Idle"}</strong>
        </div>
        <div>
          Offset: <code>{Math.round(dragOffset.x)}px</code>, <code>{Math.round(dragOffset.y)}px</code>
        </div>
        <div>
          Last release: <code>{lastRelease}</code>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button onMouseDown={stopInteraction} onTouchStart={stopTouch} onClick={() => resetDragOffset()}>
          Reset offset
        </button>
        <button onMouseDown={stopInteraction} onTouchStart={stopTouch} onClick={() => cancelDrag()}>
          Cancel drag
        </button>
      </div>
    </div>
  );
}
