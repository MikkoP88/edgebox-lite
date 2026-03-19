import { useRef, useState } from "react";
import {
  useEdgeBox,
  type ResizeDirection,
} from "@edgebox-lite/react";

function ResizeHandle({
  dir,
  getHandleProps,
  disabled,
}: {
  dir: ResizeDirection;
  getHandleProps: (direction: ResizeDirection) => {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
  disabled?: boolean;
}) {
  const size = 12;
  const handleProps = getHandleProps(dir);

  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: disabled ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)",
    borderRadius: 999,
    pointerEvents: disabled ? "none" : "auto",
  };

  const pos: Record<ResizeDirection, React.CSSProperties> = {
    n: { top: -size / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    s: { bottom: -size / 2, left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" },
    e: { right: -size / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    w: { left: -size / 2, top: "50%", transform: "translateY(-50%)", cursor: "ew-resize" },
    ne: { top: -size / 2, right: -size / 2, cursor: "nesw-resize" },
    nw: { top: -size / 2, left: -size / 2, cursor: "nwse-resize" },
    se: { bottom: -size / 2, right: -size / 2, cursor: "nwse-resize" },
    sw: { bottom: -size / 2, left: -size / 2, cursor: "nesw-resize" },
  };

  return (
    <div
      style={{ ...common, ...pos[dir] }}
      {...handleProps}
    />
  );
}

export function DragResizeWindow() {
  const [autoRecalc, setAutoRecalc] = useState(true);
  const [eventSummary, setEventSummary] = useState("Try dragging or resizing the panel.");

  const {
    ref,
    style,
    isDragging,
    isPendingDrag,
    isResizing,
    resetPosition,
    resetSize,
    recalculate,
    cancelDrag,
    getDragProps,
    getResizeHandleProps,
  } = useEdgeBox({
    position: "bottom-center",
    width: 420,
    height: 260,
    padding: 24,
    safeZone: 16,
    disableAutoRecalc: !autoRecalc,
    commitToEdges: true,
    autoFocus: "corners",
    autoFocusSensitivity: 6,
    onDragEnd: (finalOffset) => {
      setEventSummary(`Drag committed with offset ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}.`);
    },
    minWidth: 320,
    minHeight: 200,
    onResizeEnd: (finalDimensions, finalOffset) => {
      setEventSummary(
        `Resize committed to ${Math.round(finalDimensions.width)}×${Math.round(finalDimensions.height)} at ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}.`
      );
    },
  });

  const headerStyle: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.2)",
    cursor: isDragging ? "grabbing" : "grab",
  };

  const handleResetAll = () => {
    cancelDrag();
    resetPosition();
    resetSize({ commit: true });
    setEventSummary("Position and size reset to their anchored defaults.");
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow:
          isDragging || isResizing
            ? "0 28px 90px rgba(0,0,0,0.55)"
            : "0 14px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div style={headerStyle} {...getDragProps()}>
        <strong>DragResizeWindow</strong>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
          Drag from the header. Resize from corners/edges. This version uses the new <code>useEdgeBox</code> helper.
        </div>
      </div>

      <div style={{ padding: 12, fontSize: 14, opacity: 0.92, lineHeight: 1.3 }}>
        <p style={{ margin: 0 }}>
          Key idea: drag and resize both produce offsets. When you use both together,
          compose them into one <code>transform</code>.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={() => resetPosition()}>Reset position</button>
          <button onClick={() => resetSize({ commit: true })}>Reset size</button>
          <button onClick={() => recalculate()}>Manual recalc</button>
          <button onClick={handleResetAll}>Reset all</button>
          <button onClick={() => setAutoRecalc((value) => !value)}>
            Auto recalc: {autoRecalc ? "on" : "off"}
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
          {eventSummary}
        </div>
      </div>

      {([
        "n",
        "s",
        "e",
        "w",
        "ne",
        "nw",
        "se",
        "sw",
      ] as const).map((dir) => (
        <ResizeHandle key={dir} dir={dir} getHandleProps={getResizeHandleProps} />
      ))}

      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          fontSize: 12,
          opacity: 0.8,
        }}
      >
        {isDragging ? "Dragging" : isResizing ? "Resizing" : "Idle"}
      </div>
    </div>
  );
}
