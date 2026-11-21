import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDocument,
  createEditor,
  createRect,
  parseShapeId,
  ROOT_ID,
  TOOLS,
  type Editor,
} from "@open-draw/canvas";
import { PLUGIN_ROOT_PLATFORM, PLUGIN_SEMANTICS } from "@open-draw/semantics";
import { dispatchPointer, type MockDomNode, setupMockDomEnvironment } from "./test-dom-mock";
import { normalizeStudioDocument } from "./normalize-document";

describe("Image overlay parenting", () => {
  let container: MockDomNode;
  let restoreDom: () => void;
  let editor: Editor | null = null;

  beforeEach(() => {
    const env = setupMockDomEnvironment();
    container = env.container;
    restoreDom = env.restore;
  });

  afterEach(() => {
    if (editor !== null) {
      editor.destroy();
      editor = null;
    }
    restoreDom();
  });

  it("resolves image frame as drop target when child overlay is drawn inside image bounds", () => {
    // 1. Root Screen
    const rootId = parseShapeId("s-root");
    const cardId = parseShapeId("s-card");
    const imageId = parseShapeId("s-image");

    const root = createRect(
      rootId,
      { x: 340, y: 540, width: 550, height: 460 },
      {
        parentId: ROOT_ID,
        meta: {
          order: {},
          pluginData: { [PLUGIN_ROOT_PLATFORM]: "web" },
        },
      },
    );

    // 2. Card
    const card = createRect(
      cardId,
      { x: 66, y: 27, width: 438, height: 392 },
      {
        parentId: rootId,
        meta: {
          order: {},
          pluginData: { [PLUGIN_SEMANTICS]: { platform: "web", id: "card" } },
        },
      },
    );

    // 3. Image inside Card
    const image = createRect(
      imageId,
      { x: 5, y: 7, width: 427, height: 372 },
      {
        parentId: cardId,
        meta: {
          order: {},
          pluginData: { [PLUGIN_SEMANTICS]: { platform: "web", id: "image" } },
        },
      },
    );

    const doc = normalizeStudioDocument(createDocument([root, card, image]));
    expect(doc.shapes[imageId]?.meta.isContainer).toBe(true);

    editor = createEditor(container as unknown as HTMLElement, {
      document: doc,
      nestingMode: "containers-only",
    });

    const mockSvg = editor.svg as unknown as MockDomNode;

    // Card world = (340 + 66, 540 + 27) = (406, 567)
    // Image world = (406 + 5, 567 + 7) = (411, 574) with width 427, height 372 => [411..838, 574..946]
    // Draw bookmark button at world point (773, 888) to (805, 920)
    editor.setTool(TOOLS.drawRect);
    dispatchPointer(mockSvg, "pointerdown", { x: 773, y: 888 }, 0);
    dispatchPointer(mockSvg, "pointermove", { x: 805, y: 920 });
    dispatchPointer(mockSvg, "pointerup", { x: 805, y: 920 });

    const updatedDoc = editor.getDocument();
    const shapes = Object.values(updatedDoc.shapes);
    const bookmarkButton = shapes.find(
      (s) => s.id !== rootId && s.id !== cardId && s.id !== imageId,
    );

    expect(bookmarkButton).toBeDefined();
    // The bookmark action button resolves to Image as its parent overlay container
    expect(bookmarkButton?.parentId).toBe(imageId);
  });
});
