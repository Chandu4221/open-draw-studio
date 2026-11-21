import { describe, expect, it } from "vitest";
import {
  CORNER_RADII,
  TYPOGRAPHY_VARIANTS,
  computeAutoContrastText,
  generateRoundedRectPath,
  PLUGIN_BORDER_RADIUS,
  renderPolishedRect,
  resolveShapeBorderRadius,
  resolveShapeCornerRadii,
  resolveShapeTypography,
  resolveWireframeFill,
} from "./wireframe-renderers";
import { createStudioCustomRenderers } from "./studio-custom-renderers";
import {
  type BoundingBox,
  FILL_STYLES,
  ROOT_ID,
  SHAPE_KINDS,
  type Shape,
  type ShapeId,
} from "@open-draw/canvas";

describe("wireframe-renderers", () => {
  const dummyBox: BoundingBox = { x: 10, y: 20, width: 200, height: 100 };

  describe("resolveShapeBorderRadius", () => {
    it("returns explicit borderRadius from shape meta", () => {
      const shape: Shape = {
        id: "s-1" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {}, borderRadius: 12 },
      };
      expect(resolveShapeBorderRadius(shape, dummyBox)).toBe(12);
    });

    it("returns explicit borderRadius from pluginData", () => {
      const shape: Shape = {
        id: "s-plugin" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {}, pluginData: { [PLUGIN_BORDER_RADIUS]: 16 } },
      };
      expect(resolveShapeBorderRadius(shape, dummyBox)).toBe(16);
    });

    it("returns pill radius when borderRadius is pill", () => {
      const shape: Shape = {
        id: "s-1" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 120, height: 40 },
        meta: { order: {}, borderRadius: "pill" },
      };
      expect(resolveShapeBorderRadius(shape, { x: 0, y: 0, width: 120, height: 40 })).toBe(20);
    });

    it("derives pill radius for semantic button", () => {
      const shape: Shape = {
        id: "s-btn" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 100, height: 44 },
        meta: { order: {}, semantic: { id: "button", platform: "web" } },
      };
      expect(resolveShapeBorderRadius(shape, { x: 0, y: 0, width: 100, height: 44 })).toBe(20);
    });

    it("derives card radius for semantic card", () => {
      const shape: Shape = {
        id: "s-card" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {}, semantic: { id: "card", platform: "web" } },
      };
      expect(resolveShapeBorderRadius(shape, dummyBox)).toBe(CORNER_RADII.card);
    });

    it("derives input radius for semantic input", () => {
      const shape: Shape = {
        id: "s-input" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 200, height: 40 },
        meta: { order: {}, semantic: { id: "input", platform: "web" } },
      };
      expect(resolveShapeBorderRadius(shape, { x: 0, y: 0, width: 200, height: 40 })).toBe(6);
    });

    it("returns independent 4-corner radii from pluginData", () => {
      const shape: Shape = {
        id: "s-asym" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: {
          order: {},
          pluginData: { [PLUGIN_BORDER_RADIUS]: { tl: 10, tr: 10, br: 0, bl: 0 } },
        },
      };
      expect(resolveShapeCornerRadii(shape, dummyBox)).toEqual({ tl: 10, tr: 10, br: 0, bl: 0 });
      expect(resolveShapeBorderRadius(shape, dummyBox)).toBe(10);
    });
  });

  describe("computeAutoContrastText", () => {
    it("returns white text on dark backgrounds", () => {
      expect(computeAutoContrastText("#0f172a")).toBe("#ffffff");
      expect(computeAutoContrastText("#1e293b")).toBe("#ffffff");
      expect(computeAutoContrastText("#000000")).toBe("#ffffff");
      expect(computeAutoContrastText("#2563eb")).toBe("#ffffff");
    });

    it("returns dark text on light backgrounds", () => {
      expect(computeAutoContrastText("#ffffff")).toBe("#0f172a");
      expect(computeAutoContrastText("#f8fafc")).toBe("#0f172a");
      expect(computeAutoContrastText("#e2e8f0")).toBe("#0f172a");
      expect(computeAutoContrastText(undefined)).toBe("#0f172a");
    });
  });

  describe("resolveShapeTypography", () => {
    it("resolves heading typography from semantic tag", () => {
      const shape: Shape = {
        id: "s-h1" as ShapeId,
        kind: SHAPE_KINDS.text,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {}, semantic: { id: "heading", platform: "web", properties: { level: 1 } } },
      };
      const typo = resolveShapeTypography(shape);
      expect(typo.fontSize).toBe(22);
      expect(typo.fontWeight).toBe(700);
    });

    it("resolves heading typography when level is string '2' or '3'", () => {
      const shapeH2: Shape = {
        id: "s-h2" as ShapeId,
        kind: SHAPE_KINDS.text,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: {
          order: {},
          semantic: { id: "heading", platform: "web", properties: { level: "2" } },
        },
      };
      expect(resolveShapeTypography(shapeH2).fontSize).toBe(18);

      const shapeH3: Shape = {
        id: "s-h3" as ShapeId,
        kind: SHAPE_KINDS.text,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: {
          order: {},
          semantic: { id: "heading", platform: "web", properties: { level: "3" } },
        },
      };
      expect(resolveShapeTypography(shapeH3).fontSize).toBe(15);
    });

    it("resolves explicit typography from meta", () => {
      const shape: Shape = {
        id: "s-t1" as ShapeId,
        kind: SHAPE_KINDS.text,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {}, typography: TYPOGRAPHY_VARIANTS.display },
      };
      const typo = resolveShapeTypography(shape);
      expect(typo.fontSize).toBe(28);
      expect(typo.fontWeight).toBe(700);
    });
  });

  describe("renderPolishedRect", () => {
    it("renders rect with rx and ry attributes when radius is present", () => {
      const shape: Shape = {
        id: "s-btn" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 10, y: 20, width: 100, height: 40 },
        fill: "#0f172a",
        meta: { order: {}, semantic: { id: "button", platform: "web" } },
      };
      const svg = renderPolishedRect(shape, { x: 10, y: 20, width: 100, height: 40 });
      expect(svg).toContain('rx="20"');
      expect(svg).toContain('ry="20"');
      expect(svg).toContain('fill="#0f172a"');
    });

    it("injects style rule for auto-contrast white text on dark buttons", () => {
      const shape: Shape = {
        id: "s-btn-dark" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 10, y: 20, width: 100, height: 40 },
        fill: "#0f172a",
        content: "Sign In",
        meta: { order: {}, semantic: { id: "button", platform: "web" } },
      };
      const svg = renderPolishedRect(shape, { x: 10, y: 20, width: 100, height: 40 });
      expect(svg).toContain('data-shape-id="s-btn-dark"] text');
      expect(svg).toContain("fill: #ffffff !important");
    });

    it("renders SVG path element instead of rect when corners are asymmetric", () => {
      const shape: Shape = {
        id: "s-tab" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 120, height: 40 },
        fill: "#ffffff",
        stroke: "#0f172a",
        meta: {
          order: {},
          pluginData: { [PLUGIN_BORDER_RADIUS]: { tl: 12, tr: 12, br: 0, bl: 0 } },
        },
      };
      const svg = renderPolishedRect(shape, { x: 0, y: 0, width: 120, height: 40 });
      expect(svg).toContain("<path d=");
      expect(svg).not.toContain("<rect");
      expect(svg).toContain('fill="#ffffff"');
      expect(svg).toContain('stroke="#0f172a"');
    });

    it("renders fill='none' for shape with fillStyle none (two-way sync, Option A)", () => {
      const shape: Shape = {
        id: "s-none" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 100, height: 40 },
        fillStyle: FILL_STYLES.none,
        fill: "#ffffff",
        meta: { order: {} },
      };
      const svg = renderPolishedRect(shape, { x: 0, y: 0, width: 100, height: 40 });
      expect(svg).toContain('fill="none"');
      expect(svg).not.toContain('fill="#ffffff"');
    });

    it("renders subtle fill with 10% opacity for fillStyle subtle", () => {
      const shape: Shape = {
        id: "s-subtle" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 100, height: 40 },
        fillStyle: FILL_STYLES.subtle,
        stroke: "#0f172a",
        meta: { order: {} },
      };
      const svg = renderPolishedRect(shape, { x: 0, y: 0, width: 100, height: 40 });
      expect(svg).toContain('fill-opacity="0.1"');
      expect(svg).toContain('fill="#0f172a"');
    });

    it("renders hatch pattern with defs and pattern url for fillStyle hatch", () => {
      const shape: Shape = {
        id: "s-hatch" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 100, height: 40 },
        fillStyle: FILL_STYLES.hatch,
        stroke: "#0f172a",
        meta: { order: {} },
      };
      const svg = renderPolishedRect(shape, { x: 0, y: 0, width: 100, height: 40 });
      expect(svg).toContain("<defs><pattern id=");
      expect(svg).toContain('fill="url(#od-pattern-hatch-s-hatch)"');
    });

    it("renders solid fill for fillStyle solid", () => {
      const shape: Shape = {
        id: "s-solid" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: { x: 0, y: 0, width: 100, height: 40 },
        fillStyle: FILL_STYLES.solid,
        fill: "#3b82f6",
        meta: { order: {} },
      };
      const svg = renderPolishedRect(shape, { x: 0, y: 0, width: 100, height: 40 });
      expect(svg).toContain('fill="#3b82f6"');
    });
  });

  describe("resolveWireframeFill", () => {
    it("returns fill='none' when fillStyle is none", () => {
      const shape: Shape = {
        id: "s-f-none" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        fillStyle: FILL_STYLES.none,
        fill: "#ffffff",
        meta: { order: {} },
      };
      expect(resolveWireframeFill(shape)).toEqual({ fill: "none" });
    });

    it("returns transparent none fallback when shape has no fill and no fillStyle", () => {
      const shape: Shape = {
        id: "s-f-default" as ShapeId,
        kind: SHAPE_KINDS.rect,
        parentId: ROOT_ID,
        boundingBox: dummyBox,
        meta: { order: {} },
      };
      expect(resolveWireframeFill(shape)).toEqual({ fill: "none" });
    });
  });

  describe("generateRoundedRectPath", () => {
    it("generates closed SVG path with elliptical arcs for independent corners", () => {
      const pathD = generateRoundedRectPath(0, 0, 100, 50, { tl: 8, tr: 8, br: 0, bl: 0 });
      expect(pathD).toContain("M 8 0");
      expect(pathD).toContain("A 8 8 0 0 1 100 8");
      expect(pathD).toContain("L 100 50");
      expect(pathD).toContain("L 0 50");
      expect(pathD).toContain("A 8 8 0 0 1 8 0");
      expect(pathD).toContain("Z");
    });

    it("clamps radii proportionally when corner sum exceeds dimension", () => {
      const pathD = generateRoundedRectPath(0, 0, 50, 50, { tl: 40, tr: 40, br: 0, bl: 0 });
      expect(pathD).toContain("M 25 0");
      expect(pathD).toContain("A 25 25 0 0 1 50 25");
    });
  });

  describe("createStudioCustomRenderers", () => {
    it("provides custom renderers for rect and text", () => {
      const renderers = createStudioCustomRenderers();
      expect(renderers[SHAPE_KINDS.rect]).toBeDefined();
      expect(renderers[SHAPE_KINDS.text]).toBeDefined();
    });
  });
});
