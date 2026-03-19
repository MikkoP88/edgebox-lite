import { useEdgeBox } from "@edgebox-lite/react";

export function SimplePositionBox() {
  const width = 220;
  const height = 120;

  const { style, edges, updateEdges, resetPosition } = useEdgeBox({
    position: "top-left",
    width,
    height,
    padding: { top: 24, left: 24 },
    safeZone: 16,
    draggable: false,
    resizable: false,
  });

  return (
    <div
      style={{
        ...style,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
      }}
    >
      <strong>SimplePositionBox</strong>
      <p style={{ margin: "10px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.3 }}>
        Minimal anchored placement using the higher-level <code>useEdgeBox</code> hook.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            const nextLeft = edges.left + 24;
            updateEdges({
              left: nextLeft,
              right: nextLeft + width,
            });
          }}
        >
          Nudge right
        </button>
        <button onClick={() => resetPosition()}>Reset anchor</button>
      </div>
    </div>
  );
}
