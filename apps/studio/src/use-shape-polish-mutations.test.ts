import { describe, expect, it, vi } from "vitest";
import { useShapePolishMutations } from "./use-shape-polish-mutations";
import { COMMANDS, ROOT_ID, SHAPE_KINDS, type Shape, type ShapeId } from "@open-draw/canvas";
import { PLUGIN_BORDER_RADIUS, PLUGIN_TYPOGRAPHY } from "./renderers/wireframe-renderers";

describe("useShapePolishMutations", () => {
  const dummyShape: Shape = {
    id: "s-rect" as ShapeId,
    kind: SHAPE_KINDS.rect,
    parentId: ROOT_ID,
    boundingBox: { x: 0, y: 0, width: 100, height: 40 },
    meta: { order: {} },
  };

  it("emits setShapePluginData command for border radius change", () => {
    const commit = vi.fn();
    const render = vi.fn();
    const { handleBorderRadiusChange } = useShapePolishMutations({
      selectedShape: dummyShape,
      commit,
      render,
    });

    handleBorderRadiusChange(8);
    expect(commit).toHaveBeenCalledWith([
      {
        type: COMMANDS.setShapePluginData,
        id: "s-rect",
        pluginId: PLUGIN_BORDER_RADIUS,
        data: 8,
      },
    ]);
    expect(render).toHaveBeenCalled();

    handleBorderRadiusChange({ tl: 12, tr: 12, br: 0, bl: 0 });
    expect(commit).toHaveBeenCalledWith([
      {
        type: COMMANDS.setShapePluginData,
        id: "s-rect",
        pluginId: PLUGIN_BORDER_RADIUS,
        data: { tl: 12, tr: 12, br: 0, bl: 0 },
      },
    ]);
  });

  it("emits setShapePluginData command for typography change", () => {
    const commit = vi.fn();
    const render = vi.fn();
    const { handleTypographyChange } = useShapePolishMutations({
      selectedShape: dummyShape,
      commit,
      render,
    });

    handleTypographyChange("h1");
    expect(commit).toHaveBeenCalledWith([
      {
        type: COMMANDS.setShapePluginData,
        id: "s-rect",
        pluginId: PLUGIN_TYPOGRAPHY,
        data: "h1",
      },
    ]);
    expect(render).toHaveBeenCalled();
  });

  it("does nothing when selectedShape is undefined", () => {
    const commit = vi.fn();
    const render = vi.fn();
    const { handleBorderRadiusChange, handleTypographyChange } = useShapePolishMutations({
      selectedShape: undefined,
      commit,
      render,
    });

    handleBorderRadiusChange(8);
    handleTypographyChange("h1");
    expect(commit).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
  });
});
