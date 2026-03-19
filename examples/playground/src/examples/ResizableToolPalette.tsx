import { useState } from "react";
import {
  useEdgeBox,
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
      role="button"
      aria-label={`Resize ${dir}`}
      style={{ ...common, ...pos[dir] }}
      {...handleProps}
    />
  );
}

export function ResizableToolPalette() {
  const [committedSize, setCommittedSize] = useState({ width: 360, height: 220 });
  const [lastResize, setLastResize] = useState("No committed resize yet");

  const {
    style,
    dimensions,
    isResizing,
    resetSize,
    getResizeHandleProps,
  } = useEdgeBox({
    position: "top-left",
    width: committedSize.width,
    height: committedSize.height,
    padding: 24,
    safeZone: 16,
    draggable: false,
    commitToEdges: true,
    onCommitSize: setCommittedSize,
    minWidth: 260,
    minHeight: 160,
    maxWidth: 520,
    maxHeight: 360,
    onResizeEnd: (finalDimensions, finalOffset) => {
      setLastResize(
        `${Math.round(finalDimensions.width)}×${Math.round(finalDimensions.height)} at ${Math.round(finalOffset.x)}, ${Math.round(finalOffset.y)}`
      );
    },
  });

  const paletteStyle: React.CSSProperties = {
    ...style,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    boxShadow: isResizing ? "0 22px 70px rgba(0,0,0,0.55)" : "0 14px 40px rgba(0,0,0,0.35)",
    touchAction: "none",
  };

  return (
    <div style={paletteStyle}>
      <strong>ResizableToolPalette</strong>
      <p style={{ margin: "10px 0 0", opacity: 0.9, lineHeight: 1.25 }}>
        Resize from any handle with mouse or touch. This demo now uses <code>useEdgeBox()</code> for committed resize, constraints, and reset flows.
      </p>

      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.35, opacity: 0.92 }}>
        <div>
          Size: <code>{Math.round(dimensions.width)}×{Math.round(dimensions.height)}</code>
        </div>
        <div>
          Last commit: <code>{lastResize}</code>
        </div>
        <div>
          Constraints: <code>260×160</code> min, <code>520×360</code> max
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => resetSize({ commit: true })}>Reset size</button>
        <button onClick={() => setCommittedSize({ width: 420, height: 280 })}>Preset 420×280</button>
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
  );
}
