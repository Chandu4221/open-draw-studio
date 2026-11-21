import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  COMMANDS,
  createDocument,
  createEditor,
  createRect,
  parseShapeId,
  ROOT_ID,
  type Editor,
} from "@open-draw/canvas";
import { STYLE_PROFILES } from "@open-draw/profiles";
import { PLUGIN_ROOT_STYLE } from "@open-draw/semantics";
import { setupMockDomEnvironment, type MockDomNode } from "../test-dom-mock";
import { createStudioCustomRenderers, refreshDocumentScene } from "./studio-custom-renderers";

describe("inherited render style updates for child shapes (R-021, R-026)", () => {
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

  it("updates child shape strokes immediately when parent container render style changes", () => {
    const rootId = parseShapeId("root-card");
    const childId = parseShapeId("child-btn");

    const rootShape = createRect(
      rootId,
      { x: 0, y: 0, width: 400, height: 300 },
      {
        parentId: ROOT_ID,
        meta: {
          isContainer: true,
          pluginData: {
            [PLUGIN_ROOT_STYLE]: STYLE_PROFILES.minimal,
          },
        },
      },
    );

    const childShape = createRect(
      childId,
      { x: 20, y: 20, width: 120, height: 40 },
      { parentId: rootId },
    );

    const doc = createDocument([rootShape, childShape]);

    editor = createEditor(container as unknown as HTMLElement, {
      document: doc,
      customRenderers: createStudioCustomRenderers(() => editor?.getDocument() ?? doc),
    });

    const svgNode = container.children[0] as MockDomNode;
    const docScene = svgNode.querySelector(".od-document-scene");
    expect(docScene).toBeDefined();

    // 1. Initial render: both root and child are in minimal wireframe mode (<rect)
    expect(docScene?.innerHTML).not.toContain('stroke-linecap="round"');

    // 2. Change parent container render style to hand-drawn marker
    editor.execute([
      {
        type: COMMANDS.setShapePluginData,
        id: rootId,
        pluginId: PLUGIN_ROOT_STYLE,
        data: STYLE_PROFILES.handDrawn,
      },
    ]);

    // 3. Without full refresh, standard editor.render() leaves children unadapted
    // (This reproduces the drift / bug reported by the user)
    editor.render();

    // 4. Calling refreshDocumentScene immediately updates children to inherit the new style
    refreshDocumentScene(editor);

    // Child button shape must now be rendered in hand-drawn style with round linecaps
    expect(docScene?.innerHTML).toContain('stroke-linecap="round"');
  });
});
