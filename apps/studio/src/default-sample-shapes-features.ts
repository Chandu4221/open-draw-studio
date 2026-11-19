import type { Shape, ShapeId } from "@open-draw/canvas";
import { SHAPE_KINDS } from "@open-draw/canvas";
import { PLUGIN_SEMANTICS } from "@open-draw/semantics";

export const SAMPLE_FEATURES_SHAPES: readonly Shape[] = [
  {
    id: "s-7a29" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a07" as ShapeId,
    boundingBox: {
      x: 12.66,
      y: 472.69,
      width: 693.77,
      height: 179.07,
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
    id: "s-7a2a" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a29" as ShapeId,
    boundingBox: {
      x: 219.22,
      y: 22.02,
      width: 256.75,
      height: 32,
    },
    content: "More than shapes on a canvas.",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "2" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "2" } },
      },
    },
  },
  {
    id: "s-7a2e" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a29" as ShapeId,
    boundingBox: {
      x: 190.58,
      y: 88.77,
      width: 123.13,
      height: 77.36,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "card", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "card", platform: "web" },
      },
    },
  },
  {
    id: "s-7a2f" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a2e" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 12.03,
      width: 100,
      height: 32,
    },
    content: "Tag components with meaning",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "4" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "4" } },
      },
    },
  },
  {
    id: "s-7a30" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a2e" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 44.03,
      width: 100,
      height: 32,
    },
    content: "Mark what each element is—button, nav, form, screen.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
  {
    id: "s-7a31" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a29" as ShapeId,
    boundingBox: {
      x: 365.08,
      y: 88.77,
      width: 123.13,
      height: 77.36,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "card", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "card", platform: "web" },
      },
    },
  },
  {
    id: "s-7a32" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a31" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 12.03,
      width: 100,
      height: 32,
    },
    content: "Export structured markup",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "4" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "4" } },
      },
    },
  },
  {
    id: "s-7a33" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a31" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 44.03,
      width: 100,
      height: 32,
    },
    content: "Turn the document into specs and frontend-ready output.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
  {
    id: "s-7a34" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a29" as ShapeId,
    boundingBox: {
      x: 536.41,
      y: 89.53,
      width: 123.13,
      height: 77.36,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "card", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "card", platform: "web" },
      },
    },
  },
  {
    id: "s-7a35" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a34" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 12.03,
      width: 100,
      height: 32,
    },
    content: "Swap styles without redrawing",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "4" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "4" } },
      },
    },
  },
  {
    id: "s-7a36" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a34" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 44.03,
      width: 100,
      height: 32,
    },
    content: "Explore visual languages on the same underlying structure.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
  {
    id: "s-7a2b" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a29" as ShapeId,
    boundingBox: {
      x: 18.63,
      y: 90.11,
      width: 123.13,
      height: 77.36,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "card", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "card", platform: "web" },
      },
    },
  },
  {
    id: "s-7a2c" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a2b" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 12.03,
      width: 100,
      height: 32,
    },
    content: "Draw on a real canvas",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "4" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "4" } },
      },
    },
  },
  {
    id: "s-7a2d" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a2b" as ShapeId,
    boundingBox: {
      x: 11.57,
      y: 44.03,
      width: 100,
      height: 32,
    },
    content: "Build layouts with shapes, hierarchy, and structure.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
];
