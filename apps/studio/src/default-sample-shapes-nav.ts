import type { Shape, ShapeId } from "@open-draw/canvas";
import { ROOT_ID, SHAPE_KINDS } from "@open-draw/canvas";
import { PLATFORMS } from "@open-draw/profiles";
import {
  PLUGIN_DESIGN_STYLE,
  PLUGIN_ROOT_PLATFORM,
  PLUGIN_ROOT_ROLE,
  PLUGIN_SEMANTICS,
  ROOT_ROLES,
} from "@open-draw/semantics";

export const SAMPLE_NAV_SHAPES: readonly Shape[] = [
  {
    id: "s-7a07" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: ROOT_ID,
    boundingBox: {
      x: 273.61,
      y: 127.69,
      width: 719.12,
      height: 865.71,
    },
    label: "OpenDraw Studio Landing Page",
    meta: {
      order: {},
      isContainer: true,
      platform: PLATFORMS.web,
      role: ROOT_ROLES.screen,
      pluginData: {
        [PLUGIN_ROOT_PLATFORM]: "web",
        [PLUGIN_DESIGN_STYLE]: "brutalism",
        [PLUGIN_ROOT_ROLE]: "screen",
      },
    },
  },
  {
    id: "s-7a09" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a07" as ShapeId,
    boundingBox: {
      x: 11.56,
      y: 14.65,
      width: 692.34,
      height: 76.68,
    },
    meta: {
      order: {},
      isContainer: true,
      semantic: { id: "navbar", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "navbar", platform: "web" },
      },
    },
  },
  {
    id: "s-7a0c" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: "s-7a09" as ShapeId,
    boundingBox: {
      x: 591.54,
      y: 11.67,
      width: 90.27,
      height: 42.68,
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
  {
    id: "s-7a0a" as ShapeId,
    kind: SHAPE_KINDS.text,
    parentId: "s-7a09" as ShapeId,
    boundingBox: {
      x: 21.41,
      y: 22.34,
      width: 100,
      height: 32,
    },
    label: "Logo",
    content: "Open Draw",
    meta: {
      order: {},
      semantic: { id: "link", platform: "web" },
      pluginData: {
        [PLUGIN_SEMANTICS]: { id: "link", platform: "web" },
      },
    },
  },
];
