import { describe, expect, it, vi } from "vitest";
import {
  parseShapeId,
  ROOT_ID,
  SHAPE_KINDS,
  type CanvasController,
  type Document,
  type Editor,
  type Point,
} from "@open-draw/canvas";
import { buildContextMenuGroups, resolveContextMenuTarget } from "./use-context-menu";

describe("useContextMenu", () => {
  const shapeId1 = parseShapeId("s1");

  describe("buildContextMenuGroups", () => {
    it("generates arrange, edit, and utility groups when targeting shapes", () => {
      const onBringToFront = vi.fn();
      const onBringForward = vi.fn();
      const onSendBackward = vi.fn();
      const onSendToBack = vi.fn();
      const onDuplicate = vi.fn();
      const onDelete = vi.fn();
      const onCopyId = vi.fn();

      const groups = buildContextMenuGroups({
        isBackground: false,
        targetShapeIds: [shapeId1],
        onBringToFront,
        onBringForward,
        onSendBackward,
        onSendToBack,
        onDuplicate,
        onDelete,
        onCopyId,
      });

      expect(groups).toHaveLength(3);
      const [arrangeGroup, editGroup, utilityGroup] = groups;
      expect(arrangeGroup).toBeDefined();
      expect(editGroup).toBeDefined();
      expect(utilityGroup).toBeDefined();
      if (!arrangeGroup || !editGroup || !utilityGroup) return;

      // Group 1: Arrange
      const arrangeIds = arrangeGroup.items.map((i) => i.id);
      expect(arrangeIds).toEqual([
        "bring-to-front",
        "bring-forward",
        "send-backward",
        "send-to-back",
      ]);

      // Group 2: Edit
      const editIds = editGroup.items.map((i) => i.id);
      expect(editIds).toEqual(["duplicate", "delete"]);
      expect(editGroup.items.find((i) => i.id === "delete")?.danger).toBe(true);

      // Group 3: Utility
      const utilityIds = utilityGroup.items.map((i) => i.id);
      expect(utilityIds).toEqual(["copy-chip-id"]);

      // Verify action triggering
      arrangeGroup.items[0]?.onClick();
      expect(onBringToFront).toHaveBeenCalledTimes(1);

      editGroup.items[0]?.onClick();
      expect(onDuplicate).toHaveBeenCalledTimes(1);

      editGroup.items[1]?.onClick();
      expect(onDelete).toHaveBeenCalledTimes(1);

      utilityGroup.items[0]?.onClick();
      expect(onCopyId).toHaveBeenCalledTimes(1);
    });

    it("generates canvas navigation and select-all groups when clicking canvas background", () => {
      const onSelectAll = vi.fn();
      const onResetZoom = vi.fn();
      const onZoomIn = vi.fn();
      const onZoomOut = vi.fn();

      const groups = buildContextMenuGroups({
        isBackground: true,
        targetShapeIds: [],
        onSelectAll,
        onResetZoom,
        onZoomIn,
        onZoomOut,
      });

      expect(groups).toHaveLength(2);
      const [selectionGroup, navigationGroup] = groups;
      expect(selectionGroup).toBeDefined();
      expect(navigationGroup).toBeDefined();
      if (!selectionGroup || !navigationGroup) return;

      // Group 1: Selection
      expect(selectionGroup.items.map((i) => i.id)).toEqual(["select-all"]);

      // Group 2: Navigation
      expect(navigationGroup.items.map((i) => i.id)).toEqual(["reset-zoom", "zoom-in", "zoom-out"]);

      selectionGroup.items[0]?.onClick();
      expect(onSelectAll).toHaveBeenCalledTimes(1);

      navigationGroup.items[0]?.onClick();
      expect(onResetZoom).toHaveBeenCalledTimes(1);
    });

    it("includes cut, copy, and paste items with correct shortcuts and disabled state when provided", () => {
      const onCut = vi.fn();
      const onCopy = vi.fn();
      const onPaste = vi.fn();

      const groups = buildContextMenuGroups({
        isBackground: false,
        targetShapeIds: [shapeId1],
        onCut,
        onCopy,
        onPaste,
        canPaste: false,
      });

      expect(groups).toHaveLength(1);
      const editGroup = groups[0];
      expect(editGroup).toBeDefined();
      if (!editGroup) return;

      const items = editGroup.items;
      expect(items.map((i) => i.id)).toEqual(["cut", "copy", "paste"]);

      const cutItem = items.find((i) => i.id === "cut");
      const copyItem = items.find((i) => i.id === "copy");
      const pasteItem = items.find((i) => i.id === "paste");

      expect(cutItem).toBeDefined();
      expect(copyItem).toBeDefined();
      expect(pasteItem).toBeDefined();

      expect(pasteItem?.disabled).toBe(true);

      cutItem?.onClick();
      expect(onCut).toHaveBeenCalledTimes(1);

      copyItem?.onClick();
      expect(onCopy).toHaveBeenCalledTimes(1);

      pasteItem?.onClick();
      expect(onPaste).toHaveBeenCalledTimes(1);
    });

    it("includes paste item in canvas background group with disabled state reflecting canPaste", () => {
      const onPaste = vi.fn();
      const onSelectAll = vi.fn();

      const groups = buildContextMenuGroups({
        isBackground: true,
        targetShapeIds: [],
        onPaste,
        canPaste: true,
        onSelectAll,
      });

      expect(groups).toHaveLength(1);
      const actionGroup = groups[0];
      expect(actionGroup).toBeDefined();
      if (!actionGroup) return;

      expect(actionGroup.items.map((i) => i.id)).toEqual(["paste", "select-all"]);
      const pasteItem = actionGroup.items.find((i) => i.id === "paste");
      expect(pasteItem?.disabled).toBe(false);

      pasteItem?.onClick();
      expect(onPaste).toHaveBeenCalledTimes(1);
    });
  });

  describe("resolveContextMenuTarget", () => {
    const doc: Document = {
      schema: { version: 1 },
      shapes: {
        [shapeId1]: {
          id: shapeId1,
          parentId: ROOT_ID,
          kind: SHAPE_KINDS.rect,
          boundingBox: { x: 0, y: 0, width: 100, height: 100 },
          meta: { order: {} },
        },
      },
    };

    it("prioritizes explicitShapeId when valid in document", () => {
      const target = resolveContextMenuTarget({
        editor: null,
        doc,
        event: { clientX: 0, clientY: 0, target: null } as unknown as MouseEvent,
        explicitShapeId: shapeId1,
      });
      expect(target).toBe(shapeId1);
    });

    it("resolves target from DOM element data-shape-id attribute", () => {
      const mockElement = {
        closest: (selector: string) => {
          if (selector === "[data-shape-id]") {
            return {
              getAttribute: (attr: string) => (attr === "data-shape-id" ? shapeId1 : null),
            };
          }
          return null;
        },
      };

      const target = resolveContextMenuTarget({
        editor: null,
        doc,
        event: { clientX: 0, clientY: 0, target: mockElement } as unknown as MouseEvent,
      });
      expect(target).toBe(shapeId1);
    });

    it("resolves target using canvas.pickShape when clicking on SVG viewport", () => {
      const mockSvg = {
        getBoundingClientRect: () => ({ left: 50, top: 50 }),
      };
      const mockCanvas: Partial<CanvasController> = {
        screenToWorld: (pt: Point) => ({ x: pt.x, y: pt.y }),
        pickShape: (_d, pt) => (pt.x === 100 && pt.y === 100 ? shapeId1 : null),
      };
      const mockEditor: Partial<Editor> = {
        svg: mockSvg as unknown as SVGSVGElement,
        canvas: mockCanvas as CanvasController,
      };

      const hit = resolveContextMenuTarget({
        editor: mockEditor as Editor,
        doc,
        event: { clientX: 150, clientY: 150, target: null } as unknown as MouseEvent,
      });
      expect(hit).toBe(shapeId1);

      const miss = resolveContextMenuTarget({
        editor: mockEditor as Editor,
        doc,
        event: { clientX: 20, clientY: 20, target: null } as unknown as MouseEvent,
      });
      expect(miss).toBeNull();
    });
  });
});
