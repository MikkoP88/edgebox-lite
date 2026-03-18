import { useState } from "react";
import { DraggableStickyNote } from "./examples/DraggableStickyNote";
import { ResizableToolPalette } from "./examples/ResizableToolPalette";
import { DragResizeWindow } from "./examples/DragResizeWindow";
import { AutoSizedQuickMenu } from "./examples/AutoSizedQuickMenu";
import { AutoFocusSnapBox } from "./examples/AutoFocusSnapBox";
import { AnchoredCssPositionShowcase } from "./examples/AnchoredCssPositionShowcase";
import { SimplePositionBox } from "./examples/SimplePositionBox";
import { SimpleDraggableBox } from "./examples/SimpleDraggableBox";
import { SimpleResizableBox } from "./examples/SimpleResizableBox";

type ExampleId =
  | "simple-position"
  | "simple-drag"
  | "simple-resize"
  | "draggable"
  | "resizable"
  | "drag-resize"
  | "auto-size-clamp"
  | "autofocus"
  | "css-position";

const exampleMeta: Record<ExampleId, { label: string; features: string[] }> = {
  "simple-position": {
    label: "Simple anchored box",
    features: ["useEdgeBox", "updateEdges", "resetPosition"],
  },
  "simple-drag": {
    label: "Simple draggable box",
    features: ["useEdgeBox", "commitToEdges", "getDragProps()"],
  },
  "simple-resize": {
    label: "Simple resizable box",
    features: ["useEdgeBox", "single resize handle", "getResizeHandleProps()"],
  },
  "drag-resize": {
    label: "Drag + resize window",
    features: ["useEdgeBox", "resetPosition", "resetSize", "recalculate", "autoFocus"],
  },
  draggable: {
    label: "Draggable sticky note",
    features: ["useEdgeBox", "commitToEdges: false", "resetDragOffset", "baseTransform", "onDragEnd"],
  },
  resizable: {
    label: "Resizable tool palette",
    features: ["useEdgeBox", "touch resize", "min/max constraints", "resetSize({ commit: true })"],
  },
  "auto-size-clamp": {
    label: "Auto-sized quick menu + clamp",
    features: ["ResizeObserver clamp", "deps re-clamp", "manual clampNow()", "auto-sized DOM"],
  },
  autofocus: {
    label: "Auto focus snapping",
    features: ["useEdgeBox", "drag snapping", "resize snapping", "preset string areas"],
  },
  "css-position": {
    label: "CSS edge positioning",
    features: ["useEdgeBoxCssPosition", "fixed edge styles", "center anchor transform"],
  },
};

export function App() {
  const [example, setExample] = useState<ExampleId>("simple-drag");
  const selectedMeta = exampleMeta[example];

  const exampleElement = (() => {
    switch (example) {
      case "simple-position":
        return <SimplePositionBox />;
      case "simple-drag":
        return <SimpleDraggableBox />;
      case "simple-resize":
        return <SimpleResizableBox />;
      case "draggable":
        return <DraggableStickyNote />;
      case "resizable":
        return <ResizableToolPalette />;
      case "drag-resize":
        return <DragResizeWindow />;
      case "auto-size-clamp":
        return <AutoSizedQuickMenu />;
      case "autofocus":
        return <AutoFocusSnapBox />;
      case "css-position":
        return <AnchoredCssPositionShowcase />;
    }
  })();

  return (
    <div className="container">
      <h1>EdgeBox examples</h1>

      <div className="card">
        <div className="row">
          <label>
            Example:{" "}
            <select value={example} onChange={(e) => setExample(e.target.value as ExampleId)}>
              <optgroup label="Simple examples">
                <option value="simple-position">{exampleMeta["simple-position"].label}</option>
                <option value="simple-drag">{exampleMeta["simple-drag"].label}</option>
                <option value="simple-resize">{exampleMeta["simple-resize"].label}</option>
              </optgroup>
              <optgroup label="Feature demos">
                <option value="drag-resize">{exampleMeta["drag-resize"].label}</option>
                <option value="draggable">{exampleMeta.draggable.label}</option>
                <option value="resizable">{exampleMeta.resizable.label}</option>
                <option value="autofocus">{exampleMeta.autofocus.label}</option>
              </optgroup>
              <optgroup label="Advanced examples">
                <option value="auto-size-clamp">{exampleMeta["auto-size-clamp"].label}</option>
                <option value="css-position">{exampleMeta["css-position"].label}</option>
              </optgroup>
            </select>
          </label>
        </div>
        <p className="exampleHostHint">
          Start with the simple examples for minimal hook usage, then switch to the feature demos
          for reset flows, snapping, viewport clamp, and low-level CSS positioning.
        </p>
        <div className="featureList">
          {selectedMeta.features.map((feature) => (
            <span key={feature} className="featurePill">{feature}</span>
          ))}
        </div>
      </div>

      {exampleElement}
    </div>
  );
}
