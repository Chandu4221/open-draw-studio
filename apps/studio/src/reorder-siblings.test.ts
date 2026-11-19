import { describe, expect, it } from "vitest";
import { createDocument, createRect, parseShapeId, ROOT_ID, COMMANDS } from "@open-draw/canvas";
import { DEVICE_TYPES } from "@open-draw/profiles";
import { PLUGIN_RESPONSIVE } from "@open-draw/semantics";
import { buildSiblingReorderCommands } from "./reorder-siblings";

describe("buildSiblingReorderCommands", () => {
  const pageId = parseShapeId("page-1");
  const s1 = parseShapeId("s-1");
  const s2 = parseShapeId("s-2");
  const s3 = parseShapeId("s-3");

  const doc = createDocument([
    createRect(pageId, { x: 0, y: 0, width: 800, height: 1200 }, { parent: ROOT_ID }),
    createRect(s1, { x: 10, y: 100, width: 200, height: 80 }, { parent: pageId }),
    createRect(s2, { x: 10, y: 200, width: 200, height: 80 }, { parent: pageId }),
    createRect(s3, { x: 10, y: 300, width: 200, height: 80 }, { parent: pageId }),
  ]);

  it("returns null when attempting to move the top sibling up", () => {
    const cmds = buildSiblingReorderCommands(doc, s1, "up");
    expect(cmds).toBeNull();
  });

  it("returns null when attempting to move the bottom sibling down", () => {
    const cmds = buildSiblingReorderCommands(doc, s3, "down");
    expect(cmds).toBeNull();
  });

  it("returns null when shape does not exist or has no siblings", () => {
    expect(buildSiblingReorderCommands(doc, parseShapeId("non-existent"), "up")).toBeNull();
    expect(buildSiblingReorderCommands(doc, pageId, "up")).toBeNull();
  });

  it("moves middle sibling up by swapping order with previous sibling", () => {
    const cmds = buildSiblingReorderCommands(doc, s2, "up");
    expect(cmds).toEqual([
      {
        type: COMMANDS.setShapePluginData,
        id: s2,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { default: 0 } },
      },
      {
        type: COMMANDS.setShapePluginData,
        id: s1,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { default: 10 } },
      },
      {
        type: COMMANDS.setShapePluginData,
        id: s3,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { default: 20 } },
      },
    ]);
  });

  it("moves middle sibling down targeting activeDeviceType when specified", () => {
    const cmds = buildSiblingReorderCommands(doc, s2, "down", DEVICE_TYPES.mobile);
    expect(cmds).toEqual([
      {
        type: COMMANDS.setShapePluginData,
        id: s1,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { mobile: 0 } },
      },
      {
        type: COMMANDS.setShapePluginData,
        id: s3,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { mobile: 10 } },
      },
      {
        type: COMMANDS.setShapePluginData,
        id: s2,
        pluginId: PLUGIN_RESPONSIVE,
        data: { order: { mobile: 20 } },
      },
    ]);
  });
});
