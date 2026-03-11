import { useState } from "react";
import {
  useEdgeBoxPosition,
  useEdgeBoxResize,
  usePaddingValues,
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

  return (
    <div
      role="button"
      aria-label={`Resize ${dir}`}
      style={{ ...common, ...pos[dir] }}
      onMouseDown={(e) => onStart(dir, e)}
    />
  );
}

export function ResizableToolPalette() {
  const paddingValues = usePaddingValues(24);
  const safeZone = 16;

  const [committedSize, setCommittedSize] = useState({ width: 360, height: 220 });

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "top-left",
    width: committedSize.width,
    height: committedSize.height,
    padding: paddingValues,
    safeZone,
  });

  const { dimensions, resizeOffset, isResizing, handleResizeStart } = useEdgeBoxResize({
    edges,
    updateEdges,
    commitToEdges: true,
    onCommitSize: setCommittedSize,
    initialWidth: committedSize.width,
    initialHeight: committedSize.height,
    minWidth: 260,
    minHeight: 160,
    safeZone,
  });

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    width: dimensions.width,
    height: dimensions.height,
    transform: `translate3d(${resizeOffset.x}px, ${resizeOffset.y}px, 0)`,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    boxShadow: isResizing ? "0 22px 70px rgba(0,0,0,0.55)" : "0 14px 40px rgba(0,0,0,0.35)",
    touchAction: "none",
  };

  return (
    <div style={style}>
      <strong>ResizableToolPalette</strong>
      <p style={{ margin: "10px 0 0", opacity: 0.9, lineHeight: 1.25 }}>
        Drag the white dots to resize (8 directions). Size commits on mouse up.
      </p>

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
  );
}
