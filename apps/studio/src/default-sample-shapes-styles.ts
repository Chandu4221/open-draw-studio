import type { Shape, ShapeId } from "@open-draw/canvas";
import { SHAPE_KINDS } from "@open-draw/canvas";
import { PLUGIN_SEMANTICS } from "@open-draw/semantics";
import { PLUGIN_TYPOGRAPHY } from "./renderers/wireframe-typography";

export const SAMPLE_STYLES_SHAPES: readonly Shape[] = [
  {
    id: "s-504a05" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a07" as ShapeId,
    boundingBox: {
      x: 12.66,
      y: 317.82,
      width: 693.77,
      height: 133.13,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "section" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "section" },
      },
    },
  },
  {
    id: "s-504a07" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-504a05" as ShapeId,
    boundingBox: {
      x: 75.3,
      y: 5.03,
      width: 553.63,
      height: 32,
    },
    content: "Experience This WebPage in Different Design Styles",
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
    id: "s-504a06" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-504a05" as ShapeId,
    boundingBox: {
      x: 183.94,
      y: 46.82,
      width: 312.47,
      height: 39.5,
    },
    content: "Style Switcher Segmented Buttons",
    meta: {
      order: {},
      semantic: { id: "segmented-control", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "segmented-control", platform: "web" },
      },
    },
  },
  {
    id: "s-504a08" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-504a05" as ShapeId,
    boundingBox: {
      x: 122.54,
      y: 95.16,
      width: 459.15,
      height: 32,
    },
    content: "Same content. Same structure. Different visual languages.",
    meta: {
      order: {},
      semantic: { id: "text" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "text" },
      },
    },
  },
];
