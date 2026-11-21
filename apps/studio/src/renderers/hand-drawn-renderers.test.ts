import { describe, expect, it } from "vitest";
import type { BoundingBox, Document, LineShape, RectShape, ShapeId } from "@open-draw/canvas";
import { ROOT_ID, SHAPE_KINDS } from "@open-draw/canvas";
import { STYLE_PROFILES } from "@open-draw/profiles";
import { PLUGIN_ROOT_STYLE } from "@open-draw/semantics";
import { buildCrayonFilterDefs, renderCrayonRect } from "./crayon-renderers";
import {
  createSeededRandom,
  hashShapeId,
  renderHandDrawnEllipse,
  renderHandDrawnLine,
  renderHandDrawnRect,
} from "./hand-drawn-renderers";
import { createStudioCustomRenderers } from "./studio-custom-renderers";
import { documentToSvgWithLegend } from "../export-image";

describe("hand-drawn marker and crayon stroke renderers (R-021, ADR-0005 D3)", () => {
  const sampleBox: BoundingBox = { x: 10, y: 20, width: 200, height: 60 };
  const sampleShape: RectShape = {
    id: "rect-1" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: ROOT_ID,
    boundingBox: sampleBox,
    meta: {},
  };

  it("produces deterministic 32-bit positive hash seeds for shape IDs", () => {
    const seed1 = hashShapeId("shape-abc");
    const seed2 = hashShapeId("shape-abc");
    const seed3 = hashShapeId("shape-xyz");

    expect(seed1).toBe(seed2);
    expect(seed1).toBeGreaterThan(0);
    expect(Number.isInteger(seed1)).toBe(true);
    expect(seed1).not.toBe(seed3);
  });

  it("produces identical random sequences for identical seeds", () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(12345);

    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  it("renders byte-for-byte identical SVG across repeated calls (zero Math.random)", () => {
    const svg1 = renderHandDrawnRect(sampleShape, sampleBox);
    const svg2 = renderHandDrawnRect(sampleShape, sampleBox);

    expect(svg1).toBe(svg2);
    expect(svg1).toContain("<path");
    expect(svg1).toContain('stroke-linecap="round"');
    expect(svg1).toContain('stroke-linejoin="round"');
  });

  it("renders 4 distinct overshooting stroke segments for sharp hand-drawn rectangles", () => {
    const svg = renderHandDrawnRect(sampleShape, sampleBox);
    // 4 separate perimeter strokes with corner crossings/overshoots in path d
    const moveMatches = svg.match(/M\s/g);
    expect(moveMatches).toHaveLength(4);
    expect(svg).toContain('stroke-linecap="round"');
  });

  it("renders distinct organic paths for different shape IDs with the same dimensions", () => {
    const otherShape: RectShape = {
      ...sampleShape,
      id: "rect-2" as ShapeId,
    };

    const svg1 = renderHandDrawnRect(sampleShape, sampleBox);
    const svg2 = renderHandDrawnRect(otherShape, sampleBox);

    expect(svg1).not.toBe(svg2);
  });

  it("renders hand-drawn ellipse with multi-arc sketch strokes", () => {
    const ellipseShape = {
      id: "ellipse-1" as ShapeId,
      kind: SHAPE_KINDS.ellipse,
      parentId: ROOT_ID,
      boundingBox: { x: 50, y: 50, width: 80, height: 80 },
      meta: {},
    };

    const svg = renderHandDrawnEllipse(ellipseShape, ellipseShape.boundingBox);
    expect(svg).toContain("<path");
    expect(svg).toContain('stroke-linecap="round"');
  });

  it("renders hand-drawn line with slight natural wobble", () => {
    const lineShape: LineShape = {
      id: "line-1" as ShapeId,
      kind: SHAPE_KINDS.line,
      parentId: ROOT_ID,
      boundingBox: { x: 0, y: 0, width: 100, height: 50 },
      start: { x: 0, y: 0 },
      end: { x: 100, y: 50 },
      meta: {},
    };

    const svg = renderHandDrawnLine(lineShape, lineShape.boundingBox);
    expect(svg).toContain("<path");
    expect(svg).toContain('stroke-linecap="round"');
  });

  it("builds deterministic SVG wax crayon filter with turbulence and displacement", () => {
    const filterDefs = buildCrayonFilterDefs(42, "test-filter-42");
    expect(filterDefs).toContain('<filter id="test-filter-42"');
    expect(filterDefs).toContain('<feTurbulence type="fractalNoise"');
    expect(filterDefs).toContain('<feTurbulence type="turbulence"');
    expect(filterDefs).toContain("<feDisplacementMap");
  });

  it("renders crayon rect with filter reference and displacement attributes", () => {
    const svg = renderCrayonRect(sampleShape, sampleBox);
    expect(svg).toContain('filter="url(#od-crayon-filter-rect-1)"');
    expect(svg).toContain("<feTurbulence");
    expect(svg).toContain("<feDisplacementMap");
  });

  it("dispatches to hand-drawn renderers when root style is hand-drawn", () => {
    const rootShape = {
      id: "page-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: ROOT_ID,
      boundingBox: { x: 0, y: 0, width: 800, height: 600 },
      meta: {
        isContainer: true,
        pluginData: {
          [PLUGIN_ROOT_STYLE]: STYLE_PROFILES.handDrawn,
        },
      },
    };

    const childRect: RectShape = {
      id: "btn-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: rootShape.id,
      boundingBox: { x: 20, y: 20, width: 120, height: 40 },
      meta: {},
    };

    const doc: Document = {
      shapes: {
        [rootShape.id]: rootShape,
        [childRect.id]: childRect,
      },
      rootIds: [rootShape.id],
    } as unknown as Document;

    const renderers = createStudioCustomRenderers(() => doc);
    const renderer = renderers[SHAPE_KINDS.rect];
    expect(renderer).toBeDefined();
    const rendered = renderer!(childRect, childRect.boundingBox);

    expect(rendered).toContain('stroke-linecap="round"');
    expect(rendered).not.toContain("od-crayon-filter");
  });

  it("dispatches to crayon renderers when root style is crayon", () => {
    const rootShape = {
      id: "page-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: ROOT_ID,
      boundingBox: { x: 0, y: 0, width: 800, height: 600 },
      meta: {
        isContainer: true,
        pluginData: {
          [PLUGIN_ROOT_STYLE]: STYLE_PROFILES.crayon,
        },
      },
    };

    const childRect: RectShape = {
      id: "btn-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: rootShape.id,
      boundingBox: { x: 20, y: 20, width: 120, height: 40 },
      meta: {},
    };

    const doc: Document = {
      shapes: {
        [rootShape.id]: rootShape,
        [childRect.id]: childRect,
      },
      rootIds: [rootShape.id],
    } as unknown as Document;

    const renderers = createStudioCustomRenderers(() => doc);
    const renderer = renderers[SHAPE_KINDS.rect];
    expect(renderer).toBeDefined();
    const rendered = renderer!(childRect, childRect.boundingBox);

    expect(rendered).toContain("od-crayon-filter");
    expect(rendered).toContain("<feTurbulence");
  });

  it("dispatches to standard wireframe renderers when root style is minimal", () => {
    const rootShape = {
      id: "page-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: ROOT_ID,
      boundingBox: { x: 0, y: 0, width: 800, height: 600 },
      meta: {
        isContainer: true,
        pluginData: {
          [PLUGIN_ROOT_STYLE]: STYLE_PROFILES.minimal,
        },
      },
    };

    const childRect: RectShape = {
      id: "btn-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: rootShape.id,
      boundingBox: { x: 20, y: 20, width: 120, height: 40 },
      meta: {},
    };

    const doc: Document = {
      shapes: {
        [rootShape.id]: rootShape,
        [childRect.id]: childRect,
      },
      rootIds: [rootShape.id],
    } as unknown as Document;

    const renderers = createStudioCustomRenderers(() => doc);
    const renderer = renderers[SHAPE_KINDS.rect];
    expect(renderer).toBeDefined();
    const rendered = renderer!(childRect, childRect.boundingBox);

    expect(rendered).toContain("<rect");
  });

  it("renders hand-drawn shapes in document export when style is hand-drawn", () => {
    const rootShape = {
      id: "page-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: ROOT_ID,
      boundingBox: { x: 0, y: 0, width: 800, height: 600 },
      meta: {
        isContainer: true,
        pluginData: {
          [PLUGIN_ROOT_STYLE]: STYLE_PROFILES.handDrawn,
        },
      },
    };

    const childRect: RectShape = {
      id: "btn-1" as ShapeId,
      kind: SHAPE_KINDS.rect,
      parentId: rootShape.id,
      boundingBox: { x: 20, y: 20, width: 120, height: 40 },
      meta: {},
    };

    const doc: Document = {
      shapes: {
        [rootShape.id]: rootShape,
        [childRect.id]: childRect,
      },
      rootIds: [rootShape.id],
    } as unknown as Document;

    const svg = documentToSvgWithLegend(doc);
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).not.toContain("od-crayon-filter");
  });
});
