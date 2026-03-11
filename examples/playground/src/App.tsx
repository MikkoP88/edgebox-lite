import { useState } from "react";
import { DraggableStickyNote } from "./examples/DraggableStickyNote";
import { ResizableToolPalette } from "./examples/ResizableToolPalette";
import { DragResizeWindow } from "./examples/DragResizeWindow";
import { AutoSizedQuickMenu } from "./examples/AutoSizedQuickMenu";
import { AutoFocusSnapBox } from "./examples/AutoFocusSnapBox";

type ExampleId =
  | "draggable"
  | "resizable"
  | "drag-resize"
  | "auto-size-clamp"
  | "autofocus";

export function App() {
  const [example, setExample] = useState<ExampleId>("drag-resize");

  const exampleElement = (() => {
    switch (example) {
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
              <option value="drag-resize">Drag + resize window</option>
              <option value="draggable">Draggable sticky note</option>
              <option value="resizable">Resizable tool palette</option>
              <option value="auto-size-clamp">Auto-sized quick menu + clamp</option>
              <option value="autofocus">Auto focus snapping</option>
            </select>
          </label>
        </div>
        <p className="exampleHostHint">
          These demos render a <code>position: fixed</code> element that you can drag/resize.
          Try resizing the browser window to see clamping/recalc behavior.
        </p>
      </div>

      {exampleElement}
    </div>
  );
}
