import { beforeEach, describe, expect, it } from "vitest";
import {
  createDocument,
  createRect,
  createText,
  parseShapeId,
  ROOT_ID,
  COMMANDS,
} from "@open-draw/canvas";
import {
  clearClipboard,
  copyShapesToClipboard,
  cutShapesToClipboard,
  hasClipboardContent,
  pasteShapesFromClipboard,
} from "./studio-clipboard";

describe("studio-clipboard (R-004, R-008, R-016, ADR-0006)", () => {
  beforeEach(() => {
    clearClipboard();
  });

  it("copies selected shape and its subtree to clipboard", () => {
    const rootRect = createRect(
      parseShapeId("rect-1"),
      { x: 100, y: 100, width: 200, height: 200 },
      { parentId: ROOT_ID },
    );
    const childText = createText(
      parseShapeId("text-1"),
      { x: 120, y: 120, width: 80, height: 24 },
      { parentId: parseShapeId("rect-1") },
    );
    const doc = createDocument([rootRect, childText]);

    expect(hasClipboardContent()).toBe(false);

    const payload = copyShapesToClipboard(doc, [rootRect.id]);
    expect(payload).not.toBeNull();
    expect(payload?.topLevelIds).toEqual([rootRect.id]);
    expect(payload?.shapes.map((s) => s.id)).toEqual([rootRect.id, childText.id]);
    expect(hasClipboardContent()).toBe(true);
  });

  it("cuts selected shape by copying and generating delete commands", () => {
    const rect = createRect(
      parseShapeId("rect-cut"),
      { x: 50, y: 50, width: 100, height: 100 },
      { parentId: ROOT_ID },
    );
    const doc = createDocument([rect]);

    const result = cutShapesToClipboard(doc, [rect.id]);
    expect(result).not.toBeNull();
    expect(result?.payload.topLevelIds).toEqual([rect.id]);
    expect(result?.deleteCommands).toEqual([{ type: COMMANDS.deleteShape, id: rect.id }]);
    expect(hasClipboardContent()).toBe(true);
  });

  it("pastes copied shapes with ID remapping and +20 offset", () => {
    const parent = createRect(
      parseShapeId("parent-1"),
      { x: 100, y: 100, width: 300, height: 200 },
      { parentId: ROOT_ID },
    );
    const child = createRect(
      parseShapeId("child-1"),
      { x: 120, y: 120, width: 100, height: 80 },
      { parentId: parseShapeId("parent-1") },
    );
    const doc = createDocument([parent, child]);

    copyShapesToClipboard(doc, [parent.id]);

    const pasted = pasteShapesFromClipboard(doc);
    expect(pasted).not.toBeNull();
    expect(pasted?.commands).toHaveLength(2);
    expect(pasted?.newTopLevelIds).toHaveLength(1);

    const newParentId = pasted!.newTopLevelIds[0]!;
    expect(newParentId).not.toBe(parent.id);

    // Verify offset on top level
    const createParentCmd = pasted!.commands.find(
      (c) => c.type === COMMANDS.createShape && c.shape.id === newParentId,
    );
    expect(createParentCmd).toBeDefined();
    if (createParentCmd && createParentCmd.type === COMMANDS.createShape) {
      expect(createParentCmd.shape.boundingBox.x).toBe(120); // 100 + 20
      expect(createParentCmd.shape.boundingBox.y).toBe(120); // 100 + 20
    }

    // Verify child reparenting
    const createChildCmd = pasted!.commands.find(
      (c) => c.type === COMMANDS.createShape && c.shape.id !== newParentId,
    );
    expect(createChildCmd).toBeDefined();
    if (createChildCmd && createChildCmd.type === COMMANDS.createShape) {
      expect(createChildCmd.shape.parentId).toBe(newParentId);
    }
  });

  it("pastes from external serialized open-draw clipboard JSON", () => {
    const rect = createRect(
      parseShapeId("external-rect"),
      { x: 200, y: 200, width: 100, height: 100 },
      { parentId: ROOT_ID },
    );
    const doc = createDocument([]);

    const externalJson = JSON.stringify({
      type: "open-draw/clipboard",
      version: 1,
      copyId: "ext-1",
      shapes: [rect],
      topLevelIds: [rect.id],
    });

    const pasted = pasteShapesFromClipboard(doc, externalJson);
    expect(pasted).not.toBeNull();
    expect(pasted?.commands).toHaveLength(1);
    expect(pasted?.newTopLevelIds).toHaveLength(1);
  });

  it("returns null when pasting from an empty clipboard", () => {
    const doc = createDocument([]);
    const pasted = pasteShapesFromClipboard(doc);
    expect(pasted).toBeNull();
  });
});
