import type { Shape, ShapeId } from "@open-draw/canvas";
import { SHAPE_KINDS } from "@open-draw/canvas";
import { PLUGIN_SEMANTICS } from "@open-draw/semantics";
import { PLUGIN_TYPOGRAPHY } from "./renderers/wireframe-typography";

export const SAMPLE_HERO_SHAPES: readonly Shape[] = [
  {
    id: "s-7a11" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a07" as ShapeId,
    boundingBox: {
      x: 14.08,
      y: 99.43,
      width: 692.34,
      height: 197.96,
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
    id: "s-7a14" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a11" as ShapeId,
    boundingBox: {
      x: 155.91,
      y: 7.91,
      width: 380.51,
      height: 32,
    },
    content: "Draw what you imagine. Give it meaning. Build with AI.",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web" },
      },
    },
  },
  {
    id: "s-7a12" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a11" as ShapeId,
    boundingBox: {
      x: 86.8,
      y: 46.74,
      width: 522.39,
      height: 31.18,
    },
    content:
      "OpenDraw is a visual design canvas that lets you sketch freely, add intent when needed, and give AI the context to turn your ideas into real interfaces.",
    meta: {
      order: {},
      semantic: { id: "heading", platform: "web", properties: { level: "3" } },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "heading", platform: "web", properties: { level: "3" } },
      },
    },
  },
  {
    id: "s-504a01" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a11" as ShapeId,
    boundingBox: {
      x: 236.86,
      y: 91.87,
      width: 219.71,
      height: 32,
    },
    content: "Simple by default. Powerful by intention.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
        [PLUGIN_TYPOGRAPHY]: "h3",
      },
    },
  },
  {
    id: "s-7a13" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a11" as ShapeId,
    boundingBox: {
      x: 240.12,
      y: 133.41,
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
