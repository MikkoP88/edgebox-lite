import { useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPosition,
  useEdgeBoxResize,
  usePaddingValues,
  type ResizeDirection,
} from "@edgebox-lite/react";

function ResizeHandle({
  dir,
  onStart,
  disabled,
}: {
  dir: ResizeDirection;
  onStart: (dir: ResizeDirection, e: React.MouseEvent | React.TouchEvent) => void;
  disabled?: boolean;
}) {
  const size = 12;

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
      onMouseDown={(e) => onStart(dir, e)}
      onTouchStart={(e) => onStart(dir, e)}
    />
  );
}

export function DragResizeWindow() {
  const windowRef = useRef<HTMLDivElement>(null);
  const paddingValues = usePaddingValues(24);
  const safeZone = 16;

  const [committedSize, setCommittedSize] = useState({ width: 420, height: 260 });

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "bottom-center",
    width: committedSize.width,
    height: committedSize.height,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, isDragging, isPendingDrag, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: windowRef,
    safeZone,
    autoFocus: "corners",
    autoFocusSensitivity: 6,
  });

  const { dimensions, resizeOffset, isResizing, handleResizeStart } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges: true,
    onCommitSize: setCommittedSize,
    baseOffset: dragOffset,
    initialWidth: committedSize.width,
    initialHeight: committedSize.height,
    minWidth: 320,
    minHeight: 200,
    safeZone,
    autoFocus: "corners",
    autoFocusSensitivity: 6,
  });

  const currentOffset = {
    x: dragOffset.x + (isResizing ? resizeOffset.x : 0),
    y: dragOffset.y + (isResizing ? resizeOffset.y : 0),
  };

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: `translate3d(${currentOffset.x}px, ${currentOffset.y}px, 0)`,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 18,
    overflow: "hidden",
    boxShadow:
      isDragging || isResizing
        ? "0 28px 90px rgba(0,0,0,0.55)"
        : "0 14px 40px rgba(0,0,0,0.35)",
    touchAction: "none",
  };

  const headerStyle: React.CSSProperties = {
    padding: 12,
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.2)",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={windowRef}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div style={headerStyle}>
        <strong>DragResizeWindow</strong>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
          Drag anywhere. Resize from corners/edges. Snaps to corners on release.
        </div>
      </div>

      <div style={{ padding: 12, fontSize: 14, opacity: 0.92, lineHeight: 1.3 }}>
        <p style={{ margin: 0 }}>
          Key idea: drag and resize both produce offsets. When you use both together,
          compose them into one <code>transform</code>.
        </p>
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
        <ResizeHandle key={dir} dir={dir} onStart={handleResizeStart} />
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
