import { useEffect, useMemo, useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxPosition,
  useEdgeBoxViewportClamp,
  usePaddingValues,
} from "@edgebox/react";

export function AutoSizedQuickMenu() {
  const menuRef = useRef<HTMLDivElement>(null);

  const paddingValues = usePaddingValues({ all: 24, right: 32 });
  const safeZone = 16;

  const [open, setOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  // When closed, we leave width/height as `undefined` (auto-size).
  // When opened, we provide explicit dimensions so clamping math is stable.
  const numericWidth = useMemo(() => (open ? 320 : undefined), [open]);
  const numericHeight = useMemo(() => (open ? 260 : undefined), [open]);

  const { edges, updateEdges } = useEdgeBoxPosition({
    position: "top-right",
    width: numericWidth,
    height: numericHeight,
    padding: paddingValues,
    safeZone,
  });

  const { dragOffset, isDragging, isPendingDrag, handleMouseDown, handleTouchStart } = useEdgeBoxDrag({
    edges,
    updateEdges,
    commitToEdges: true,
    elementRef: menuRef,
    safeZone,
  });

  // Keep the menu inside the viewport when its intrinsic size changes.
  // Typical use-case: a submenu opens/closes or content loads.
  useEdgeBoxViewportClamp({
    elementRef: menuRef,
    updateEdges,
    safeZone,
    disabled: !isHydrated || isDragging || isPendingDrag,
    deps: [open],
  });

  const style = useMemo((): React.CSSProperties => {
    return {
      position: "fixed",
      left: edges.left,
      top: edges.top,
      transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.16)",
      borderRadius: 16,
      padding: 12,
      width: open ? 320 : "auto",
      userSelect: "none",
      touchAction: "none",
      boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
    };
  }, [dragOffset.x, dragOffset.y, edges.left, edges.top, open]);

  return (
    <div
      ref={menuRef}
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <strong style={{ flex: 1 }}>AutoSizedQuickMenu</strong>
        <button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Open"}</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9, lineHeight: 1.25 }}>
        Drag me. Toggle open/close. When size changes, <code>useEdgeBoxViewportClamp</code> keeps me inside the viewport.
      </div>

      {open ? (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <button>Action A</button>
          <button>Action B</button>
          <button>Action C</button>
          <div style={{ opacity: 0.8, fontSize: 12 }}>
            This content changes the menu's size.
          </div>
        </div>
      ) : null}
    </div>
  );
}
