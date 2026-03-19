import {
  useEdgeBoxCssPosition,
  useEdgeBoxPaddingValues,
  type EdgePosition,
} from "@edgebox-lite/react";

function AnchorBadge({
  label,
  position,
  tint,
}: {
  label: string;
  position: EdgePosition;
  tint: string;
}) {
  const paddingValues = useEdgeBoxPaddingValues({ top: 24, right: 24, bottom: 24, left: 24 });
  const { initialCssPosition } = useEdgeBoxCssPosition({
    position,
    paddingValues,
  });

  const centered = position.endsWith("center");

  const style: React.CSSProperties = {
    position: "fixed",
    ...initialCssPosition,
    transform: centered ? "translateX(-50%)" : undefined,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${tint}`,
    background: "rgba(7, 10, 20, 0.78)",
    color: "#f7f9ff",
    fontSize: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    pointerEvents: "none",
    backdropFilter: "blur(8px)",
  };

  return <div style={style}>{label}</div>;
}

export function AnchoredCssPositionShowcase() {
  return (
    <>
      <div className="card" style={{ marginTop: 16 }}>
        <strong>AnchoredCssPositionShowcase</strong>
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, lineHeight: 1.35 }}>
          This example uses the low-level <code>useEdgeBoxCssPosition</code> hook instead of
          committed <code>edges</code>. It is useful for simple anchored UI where you want CSS
          edge properties directly.
        </div>
      </div>

      <AnchorBadge label="top-left anchor" position="top-left" tint="rgba(103, 232, 249, 0.8)" />
      <AnchorBadge label="top-center anchor" position="top-center" tint="rgba(167, 139, 250, 0.8)" />
      <AnchorBadge label="bottom-right anchor" position="bottom-right" tint="rgba(250, 204, 21, 0.85)" />
    </>
  );
}
