import type { Shape, ShapeId } from "@open-draw/canvas";
import { SHAPE_KINDS } from "@open-draw/canvas";
import { PLUGIN_SEMANTICS } from "@open-draw/semantics";

export const SAMPLE_CTA_SHAPES: readonly Shape[] = [
  {
    id: "s-7a37" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a07" as ShapeId,
    boundingBox: {
      x: 11.9,
      y: 667.84,
      width: 694.53,
      height: 176.76,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "section", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "section", platform: "web" },
      },
    },
  },
  {
    id: "s-7a38" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a37" as ShapeId,
    boundingBox: {
      x: 215.09,
      y: 23.82,
      width: 291.4,
      height: 32,
    },
    content: "Start drawing. Add meaning. Ship the interface.",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "2" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "2" } },
      },
    },
  },
  {
    id: "s-7a39" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a37" as ShapeId,
    boundingBox: {
      x: 139.61,
      y: 65.84,
      width: 452.47,
      height: 32,
    },
    content: "Open Draw is the canvas between visual design and working markup.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
  {
    id: "s-7a3a" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a37" as ShapeId,
    boundingBox: {
      x: 243.05,
      y: 110.66,
      width: 205.57,
      height: 43.7,
    },
    content: "Try OpenDraw",
    fill: "#0f172a",
    stroke: "#0f172a",
    meta: {
      order: {},
      semantic: { id: "button", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "button", platform: "web" },
      },
    },
  },
];
