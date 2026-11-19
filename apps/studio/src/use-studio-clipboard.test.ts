import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  COMMANDS,
  createDocument,
  createRect,
  parseShapeId,
  ROOT_ID,
  type Command,
  type Editor,
} from "@open-draw/canvas";
import { clearClipboard } from "./studio-clipboard";
import { useStudioClipboard } from "./use-studio-clipboard";

describe("useStudioClipboard (R-004, R-008, R-016, ADR-0006)", () => {
  beforeEach(() => {
    clearClipboard();
  });

  const rect1 = createRect(
    parseShapeId("rect-1"),
    { x: 10, y: 10, width: 100, height: 100 },
    { parentId: ROOT_ID },
  );

  it("copies selected shapes to clipboard and sets canPaste to true", () => {
    const doc = createDocument([rect1]);
    const mockEditor = {
      getSelection: vi.fn().mockReturnValue([rect1.id]),
    } as unknown as Editor;
    const commit = vi.fn();
    const render = vi.fn();
    const setSelectedShapeId = vi.fn();
    const onNotify = vi.fn();

    let clipboardHook!: ReturnType<typeof useStudioClipboard>;
    function TestComponent() {
      clipboardHook = useStudioClipboard({
        getDoc: () => doc,
        getEditor: () => mockEditor,
        commit,
        render,
        setSelectedShapeId,
        onNotify,
      });
      return null;
    }

    renderToString(React.createElement(TestComponent));
    expect(clipboardHook.canPaste).toBe(false);

    clipboardHook.handleCopy();
    expect(clipboardHook.canPaste).toBe(true);
    expect(onNotify).toHaveBeenCalledWith("Copied shape: rect-1");
  });

  it("cuts selected shapes by executing delete commands and setting canPaste", () => {
    const doc = createDocument([rect1]);
    const clearSelection = vi.fn();
    const mockEditor = {
      getSelection: vi.fn().mockReturnValue([rect1.id]),
      clearSelection,
    } as unknown as Editor;
    const commit = vi.fn();
    const render = vi.fn();
    const setSelectedShapeId = vi.fn();
    const onNotify = vi.fn();

    let clipboardHook!: ReturnType<typeof useStudioClipboard>;
    function TestComponent() {
      clipboardHook = useStudioClipboard({
        getDoc: () => doc,
        getEditor: () => mockEditor,
        commit,
        render,
        setSelectedShapeId,
        onNotify,
      });
      return null;
    }

    renderToString(React.createElement(TestComponent));
    clipboardHook.handleCut();

    expect(commit).toHaveBeenCalledWith([{ type: COMMANDS.deleteShape, id: rect1.id }]);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(setSelectedShapeId).toHaveBeenCalledWith(null);
    expect(render).toHaveBeenCalledTimes(1);
    expect(clipboardHook.canPaste).toBe(true);
    expect(onNotify).toHaveBeenCalledWith("Cut shape: rect-1");
  });

  it("pastes shapes from clipboard and selects the new shapes", async () => {
    const doc = createDocument([rect1]);
    const selectMany = vi.fn();
    const mockEditor = {
      getSelection: vi.fn().mockReturnValue([rect1.id]),
      selectMany,
    } as unknown as Editor;
    const commit = vi.fn();
    const render = vi.fn();
    const setSelectedShapeId = vi.fn();
    const onNotify = vi.fn();

    let clipboardHook!: ReturnType<typeof useStudioClipboard>;
    function TestComponent() {
      clipboardHook = useStudioClipboard({
        getDoc: () => doc,
        getEditor: () => mockEditor,
        commit,
        render,
        setSelectedShapeId,
        onNotify,
      });
      return null;
    }

    renderToString(React.createElement(TestComponent));
    clipboardHook.handleCopy();

    await clipboardHook.handlePaste();

    expect(commit).toHaveBeenCalledTimes(1);
    const passedCommands = commit.mock.calls[0]?.[0] as Command[];
    expect(passedCommands).toHaveLength(1);
    expect(passedCommands[0]?.type).toBe(COMMANDS.createShape);
    expect(selectMany).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(onNotify).toHaveBeenCalledWith(expect.stringContaining("Pasted shape:"));
  });
});
