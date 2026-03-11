import { useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPosition,
  useEdgeBoxResize,
  usePaddingValues,
  type EdgeBoxAutoFocus,
  type ResizeDirection,
} from "@edgebox/react";

function Handle({ dir, onStart }: { dir: ResizeDirection; onStart: (dir: ResizeDirection, e: React.MouseEvent) => void }) {
  const size = 10;
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

  return <div style={{ ...common, ...pos[dir] }} onMouseDown={(e) => onStart(dir, e)} />;
}

export function AutoFocusSnapBox() {
  const boxRef = useRef<HTMLDivElement>(null);

  const paddingValues = usePaddingValues(24);
  const safeZone = 16;

  const [autoFocus, setAutoFocus] = useState<EdgeBoxAutoFocus>("corners");
  const [committedSize, setCommittedSize] = useState({ width: 360, height: 220 });

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "top-center",
    width: committedSize.width,
    height: committedSize.height,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, handleMouseDown, handleTouchStart, isDragging } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: boxRef,
    safeZone,
    autoFocus,
    autoFocusSensitivity: 8,
  });

  const { dimensions, resizeOffset, isResizing, handleResizeStart } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges: true,
    onCommitSize: setCommittedSize,
    baseOffset: dragOffset,
    initialWidth: committedSize.width,
    initialHeight: committedSize.height,
    minWidth: 260,
    minHeight: 160,
    safeZone,
    autoFocus,
    autoFocusSensitivity: 8,
  });

  const currentOffset = {
    x: dragOffset.x + (isResizing ? resizeOffset.x : 0),
    y: dragOffset.y + (isResizing ? resizeOffset.y : 0),
  };

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width: dimensions.width,
    height: dimensions.height,
    transform: `translate3d(${currentOffset.x}px, ${currentOffset.y}px, 0)`,
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
            </select>
          </label>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, lineHeight: 1.25 }}>
          Drag/resize near a snap target, release, and EdgeBox will adjust the final committed edges.
        </div>
      </div>

      <div
        ref={boxRef}
        style={style}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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
          <Handle key={dir} dir={dir} onStart={handleResizeStart} />
        ))}
      </div>
    </div>
  );
}
