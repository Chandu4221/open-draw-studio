import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { FILL_STYLES, ROOT_ID, SHAPE_KINDS, type Shape, type ShapeId } from "@open-draw/canvas";
import { ShapeStyleInspector } from "./ShapeStyleInspector";

describe("ShapeStyleInspector (Option A, R-005, R-008, ADR-0007)", () => {
  const rectShape: Shape = {
    id: "s-rect" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: ROOT_ID,
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    fillStyle: FILL_STYLES.hatch,
    fill: "#ffffff",
    stroke: "#1f2933",
    strokeWidth: 2,
    meta: { order: {} },
  };

  const lineShape: Shape = {
    id: "s-line" as ShapeId,
    kind: SHAPE_KINDS.line,
    parentId: ROOT_ID,
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    start: { x: 0, y: 0 },
    end: { x: 100, y: 40 },
    stroke: "#1f2933",
    strokeWidth: 2,
    meta: { order: {} },
  };

  it("renders 4-button Fill Style segmented control for rect shapes", () => {
    const handleStyleChange = vi.fn();
    const handleStylePreview = vi.fn();
    const handleStyleCommit = vi.fn();

    const html = renderToString(
      <ShapeStyleInspector
        selectedShape={rectShape}
        handleStyleChange={handleStyleChange}
        handleStylePreview={handleStylePreview}
        handleStyleCommit={handleStyleCommit}
      />,
    );

    expect(html).toContain("Fill Style");
    expect(html).toContain('aria-label="Shape fill style"');
    expect(html).toContain('aria-label="Transparent fill"');
    expect(html).toContain('aria-label="Subtle fill"');
    expect(html).toContain('aria-label="Solid fill"');
    expect(html).toContain('aria-label="Hatch fill"');
    expect(html).toContain("Transparent (none)");
    expect(html).toContain("Subtle (10% tint)");
    expect(html).toContain("Solid");
    expect(html).toContain("Hatch (stripes)");
  });

  it("omits Fill Style segmented control for line shapes", () => {
    const handleStyleChange = vi.fn();
    const handleStylePreview = vi.fn();
    const handleStyleCommit = vi.fn();

    const html = renderToString(
      <ShapeStyleInspector
        selectedShape={lineShape}
        handleStyleChange={handleStyleChange}
        handleStylePreview={handleStylePreview}
        handleStyleCommit={handleStyleCommit}
      />,
    );

    expect(html).not.toContain("Fill Style");
    expect(html).not.toContain('aria-label="Shape fill style"');
    expect(html).toContain("Stroke");
    expect(html).toContain("Stroke Width");
  });
});
