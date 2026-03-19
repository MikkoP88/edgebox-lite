import { useEffect, useRef, useState } from "react";
import {
  useEdgeBoxDrag,
  useEdgeBoxTransform,
  useEdgeBoxPosition,
  useEdgeBoxViewportClamp,
  useEdgeBoxPaddingValues,
} from "@edgebox-lite/react";

export function AutoSizedQuickMenu() {
  const menuRef = useRef<HTMLDivElement>(null);

  const paddingValues = useEdgeBoxPaddingValues({ all: 24, right: 32 });
  const safeZone = 16;

  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  // When closed, we leave width/height as `undefined` (auto-size).
  // When opened, we provide explicit dimensions so clamping math is stable.
  const numericWidth = open ? (showDetails ? 360 : 320) : undefined;
  const numericHeight = open ? (showDetails ? 340 : 260) : undefined;

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
  const { clampNow } = useEdgeBoxViewportClamp({
    elementRef: menuRef,
    updateEdges,
    safeZone,
    disabled: !isHydrated || isDragging || isPendingDrag,
    deps: [open, showDetails],
  });

  const { transform } = useEdgeBoxTransform({ dragOffset });

  const style: React.CSSProperties = {
    position: "fixed",
    left: edges.left,
    top: edges.top,
    transform,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: 12,
    width: open ? 320 : "auto",
    userSelect: "none",
    touchAction: "none",
    boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
  };

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
        <button onClick={() => setShowDetails((value) => !value)} disabled={!open}>
          {showDetails ? "Compact" : "Details"}
        </button>
        <button onClick={() => clampNow()}>Clamp now</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9, lineHeight: 1.25 }}>
        Drag me. Toggle open/close and detail density. When the intrinsic DOM size changes,
        <code> useEdgeBoxViewportClamp </code> keeps the box in view.
      </div>

      {open ? (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <button>Action A</button>
          <button>Action B</button>
          <button>Action C</button>
          <div style={{ opacity: 0.8, fontSize: 12 }}>
            This content changes the menu&apos;s size.
          </div>
          {showDetails ? (
            <>
              <div style={{ opacity: 0.92, fontSize: 12, lineHeight: 1.35 }}>
                Detail mode adds more intrinsic content and a wider/taller measured box.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                <button>Pin</button>
                <button>Duplicate</button>
                <button>Detach</button>
                <button>Inspect</button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
