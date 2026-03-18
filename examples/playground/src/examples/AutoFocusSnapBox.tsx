import { useState } from "react";
import {
  useEdgeBox,
  type EdgeBoxAutoFocus,
  type ResizeDirection,
} from "@edgebox-lite/react";

function Handle({
  dir,
  getHandleProps,
}: {
  dir: ResizeDirection;
  getHandleProps: (direction: ResizeDirection) => {
    onMouseDown?: (e: React.MouseEvent) => void;
    onTouchStart?: (e: React.TouchEvent) => void;
  };
}) {
  const size = 10;
  const handleProps = getHandleProps(dir);
  const common: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: "rgba(255,255,255,0.85)",
    borderRadius: 999,
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

export function AutoFocusSnapBox() {
  const [autoFocus, setAutoFocus] = useState<EdgeBoxAutoFocus>("corners");
  const [lastSnap, setLastSnap] = useState("No snap commit yet");

  const {
    ref,
    style,
    isDragging,
    getDragProps,
    getResizeHandleProps,
  } = useEdgeBox({
    position: "top-center",
    width: 360,
    height: 220,
    padding: 24,
    safeZone: 16,
    commitToEdges: true,
    autoFocus,
    autoFocusSensitivity: 8,
    onDragEnd: (finalOffset) => {
      setLastSnap(`Drag ended near ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}`);
    },
    minWidth: 260,
    minHeight: 160,
    onResizeEnd: (finalDimensions, finalOffset) => {
      setLastSnap(
        `Resize snapped to ${Math.round(finalDimensions.width)}×${Math.round(finalDimensions.height)} at ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}`
      );
    },
  });

  const snapBoxStyle: React.CSSProperties = {
    ...style,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 12,
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="row">
          <strong>AutoFocusSnapBox</strong>
          <label style={{ marginLeft: "auto" }}>
            autoFocus:{" "}
            <select value={autoFocus} onChange={(e) => setAutoFocus(e.target.value as EdgeBoxAutoFocus)}>
              <option value="unset">unset</option>
              <option value="corners">corners</option>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
              <option value="all">all</option>
              <option value="full">full</option>
              <option value="1,2,10">1,2,10</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, lineHeight: 1.25 }}>
          Drag/resize near a snap target, release, and <code>useEdgeBox()</code> will commit the snapped result.
        </div>
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
          Last snap: <code>{lastSnap}</code>
        </div>
      </div>

      <div
        ref={ref}
        style={snapBoxStyle}
        {...getDragProps()}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Try snapping</div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Current preset: <code>{autoFocus}</code>
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
          <Handle key={dir} dir={dir} getHandleProps={getResizeHandleProps} />
        ))}
      </div>
    </div>
  );
}
