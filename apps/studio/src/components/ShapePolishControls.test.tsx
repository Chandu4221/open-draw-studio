import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { ShapePolishControls } from "./ShapePolishControls";
import { ROOT_ID, SHAPE_KINDS, type Shape, type ShapeId } from "@open-draw/canvas";

describe("ShapePolishControls (R-008, R-015, ADR-0007)", () => {
  const rectShape: Shape = {
    id: "s-rect" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: ROOT_ID,
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    meta: { order: {} },
  };

  const textShape: Shape = {
    id: "s-text" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: ROOT_ID,
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    content: "Heading Text",
    meta: { order: {} },
  };

  it("renders Rounded Corners 3x3 matrix and presets for rect shapes", () => {
    const handleRadius = vi.fn();
    const handleTypo = vi.fn();
    const html = renderToString(
      <ShapePolishControls
        selectedShape={rectShape}
        handleBorderRadiusChange={handleRadius}
        handleTypographyChange={handleTypo}
      />,
    );

    expect(html).toContain("Rounded Corners");
    expect(html).toContain('aria-label="Rounded corners preset"');
    expect(html).toContain("Square");
    expect(html).toContain("Card");
    expect(html).toContain("Pill");

    // 4 corner inputs
    expect(html).toContain('aria-label="Top left rounded corner"');
    expect(html).toContain('aria-label="Top right rounded corner"');
    expect(html).toContain('aria-label="Bottom left rounded corner"');
    expect(html).toContain('aria-label="Bottom right rounded corner"');

    // Link togglers
    expect(html).toContain('aria-label="Toggle top corners link"');
    expect(html).toContain('aria-label="Toggle right corners link"');
    expect(html).toContain('aria-label="Toggle bottom corners link"');
    expect(html).toContain('aria-label="Toggle left corners link"');

    // Master center All input
    expect(html).toContain('aria-label="All rounded corners"');
  });

  it("renders typography scale control for text shapes", () => {
    const handleRadius = vi.fn();
    const handleTypo = vi.fn();
    const html = renderToString(
      <ShapePolishControls
        selectedShape={textShape}
        handleBorderRadiusChange={handleRadius}
        handleTypographyChange={handleTypo}
      />,
    );

    expect(html).toContain('aria-label="Typography scale"');
    expect(html).toContain("Display");
    expect(html).toContain("H1");
    expect(html).toContain("H2");
    expect(html).toContain("Body");
  });
});
