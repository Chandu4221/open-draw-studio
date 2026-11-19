import { useCallback, useEffect, useState } from "react";
import type { Command, Document, Editor, ShapeId } from "@open-draw/canvas";
import {
  copyShapesToClipboard,
  cutShapesToClipboard,
  hasClipboardContent,
  pasteShapesFromClipboard,
} from "./studio-clipboard";

export interface UseStudioClipboardProps {
  readonly getDoc: () => Document;
  readonly getEditor: () => Editor | null;
  readonly commit: (commands: readonly Command[]) => void;
  readonly render: () => void;
  readonly setSelectedShapeId: (id: ShapeId | null) => void;
  readonly onNotify: (text: string) => void;
}

export interface UseStudioClipboardResult {
  readonly canPaste: boolean;
  readonly handleCut: () => void;
  readonly handleCopy: () => void;
  readonly handlePaste: () => void;
}

export function useStudioClipboard(props: UseStudioClipboardProps): UseStudioClipboardResult {
  const { getDoc, getEditor, commit, render, setSelectedShapeId, onNotify } = props;
  const [, setClipboardVersion] = useState<number>(0);

  const handleCopy = useCallback(() => {
    const ed = getEditor();
    const selectedIds = ed ? ed.getSelection() : [];
    if (selectedIds.length === 0) return;

    const currentDoc = getDoc();
    const payload = copyShapesToClipboard(currentDoc, selectedIds);
    if (!payload) return;

    setClipboardVersion((v) => v + 1);
    onNotify(
      payload.topLevelIds.length === 1
        ? `Copied shape: ${payload.topLevelIds[0]}`
        : `Copied ${payload.topLevelIds.length} shapes`,
    );
  }, [getEditor, getDoc, onNotify]);

  const handleCut = useCallback(() => {
    const ed = getEditor();
    const selectedIds = ed ? ed.getSelection() : [];
    if (selectedIds.length === 0) return;

    const currentDoc = getDoc();
    const result = cutShapesToClipboard(currentDoc, selectedIds);
    if (!result) return;

    commit(result.deleteCommands);
    ed?.clearSelection();
    setSelectedShapeId(null);
    render();

    setClipboardVersion((v) => v + 1);
    onNotify(
      result.payload.topLevelIds.length === 1
        ? `Cut shape: ${result.payload.topLevelIds[0]}`
        : `Cut ${result.payload.topLevelIds.length} shapes`,
    );
  }, [getEditor, getDoc, commit, render, setSelectedShapeId, onNotify]);

  const handlePaste = useCallback(async () => {
    let externalText: string | null = null;
    if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
      try {
        externalText = await navigator.clipboard.readText();
      } catch {
        // Fallback to internal in-memory clipboard
      }
    }

    const currentDoc = getDoc();
    const result = pasteShapesFromClipboard(currentDoc, externalText);
    if (!result) return;

    commit(result.commands);
    const ed = getEditor();
    ed?.selectMany(result.newTopLevelIds);
    setSelectedShapeId(result.newTopLevelIds.length === 1 ? result.newTopLevelIds[0]! : null);
    render();

    onNotify(
      result.newTopLevelIds.length === 1
        ? `Pasted shape: ${result.newTopLevelIds[0]}`
        : `Pasted ${result.newTopLevelIds.length} shapes`,
    );
  }, [getDoc, commit, getEditor, setSelectedShapeId, render, onNotify]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable ||
        Boolean(target.closest?.("[contenteditable='true']"))
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      if (e.key === "x" || e.key === "X") {
        const ed = getEditor();
        if (ed && ed.getSelection().length > 0) {
          e.preventDefault();
          handleCut();
        }
      } else if (e.key === "c" || e.key === "C") {
        const ed = getEditor();
        if (ed && ed.getSelection().length > 0) {
          handleCopy();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [getEditor, handleCut, handleCopy]);

  return {
    get canPaste() {
      return hasClipboardContent();
    },
    handleCut,
    handleCopy,
    handlePaste,
  };
}
