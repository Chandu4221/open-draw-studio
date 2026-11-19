import { useCallback, useMemo, useState } from "react";
import type { Document, Editor, ShapeId } from "@open-draw/canvas";
import type { ContextMenuGroup } from "./components/ContextMenu";
import {
  buildContextMenuGroups,
  resolveContextMenuTarget,
  type ContextMenuOptions,
  type ResolveTargetOptions,
} from "./build-context-menu-groups";

export {
  buildContextMenuGroups,
  resolveContextMenuTarget,
  type ContextMenuOptions,
  type ResolveTargetOptions,
};

export interface UseContextMenuProps {
  readonly getEditor: () => Editor | null;
  readonly doc: Document;
  readonly onDuplicate?: (() => void) | undefined;
  readonly onDelete?: (() => void) | undefined;
  readonly onNotify?: ((text: string) => void) | undefined;
}

export interface ContextMenuState {
  readonly isOpen: boolean;
  readonly x: number;
  readonly y: number;
  readonly targetShapeIds: readonly ShapeId[];
  readonly isBackground: boolean;
}

export interface UseContextMenuResult {
  readonly state: ContextMenuState;
  readonly groups: readonly ContextMenuGroup[];
  readonly openContextMenu: (
    e: React.MouseEvent | MouseEvent,
    shapeId?: ShapeId | null | undefined,
  ) => void;
  readonly closeContextMenu: () => void;
}

export function useContextMenu(props: UseContextMenuProps): UseContextMenuResult {
  const { getEditor, doc, onDuplicate, onDelete, onNotify } = props;
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetShapeIds: [],
    isBackground: false,
  });

  const closeContextMenu = useCallback(() => {
    setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  const openContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent, explicitShapeId?: ShapeId | null | undefined) => {
      e.preventDefault();
      e.stopPropagation();

      const ed = getEditor();
      if (!ed) return;

      const targetId = resolveContextMenuTarget({
        editor: ed,
        doc,
        event: e,
        explicitShapeId,
      });

      const currentSelection = ed.getSelection();

      if (targetId) {
        // If right-clicked target is not part of the active selection, select it
        if (!currentSelection.includes(targetId)) {
          ed.select(targetId);
        }
        const updatedSelection = ed.getSelection();
        setState({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          targetShapeIds: updatedSelection.length > 0 ? updatedSelection : [targetId],
          isBackground: false,
        });
      } else {
        setState({
          isOpen: true,
          x: e.clientX,
          y: e.clientY,
          targetShapeIds: [],
          isBackground: true,
        });
      }
    },
    [getEditor, doc],
  );

  const handleBringToFront = useCallback(() => {
    getEditor()?.bringToFront(state.targetShapeIds);
  }, [getEditor, state.targetShapeIds]);

  const handleBringForward = useCallback(() => {
    getEditor()?.bringForward(state.targetShapeIds);
  }, [getEditor, state.targetShapeIds]);

  const handleSendBackward = useCallback(() => {
    getEditor()?.sendBackward(state.targetShapeIds);
  }, [getEditor, state.targetShapeIds]);

  const handleSendToBack = useCallback(() => {
    getEditor()?.sendToBack(state.targetShapeIds);
  }, [getEditor, state.targetShapeIds]);

  const handleCopyId = useCallback(() => {
    const singleId = state.targetShapeIds[0];
    if (singleId) {
      const chipText = `#${singleId}`;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(chipText).catch(() => {});
      }
      onNotify?.(`Copied ${chipText} to clipboard`);
    }
  }, [state.targetShapeIds, onNotify]);

  const handleSelectAll = useCallback(() => {
    const allIds = Object.keys(doc.shapes) as ShapeId[];
    if (allIds.length > 0) {
      getEditor()?.selectMany(allIds);
    }
  }, [doc, getEditor]);

  const handleResetZoom = useCallback(() => {
    getEditor()?.resetZoom();
  }, [getEditor]);

  const handleZoomIn = useCallback(() => {
    getEditor()?.zoomIn();
  }, [getEditor]);

  const handleZoomOut = useCallback(() => {
    getEditor()?.zoomOut();
  }, [getEditor]);

  const groups = useMemo(
    () =>
      buildContextMenuGroups({
        isBackground: state.isBackground,
        targetShapeIds: state.targetShapeIds,
        onBringToFront: handleBringToFront,
        onBringForward: handleBringForward,
        onSendBackward: handleSendBackward,
        onSendToBack: handleSendToBack,
        onDuplicate,
        onDelete,
        onCopyId: handleCopyId,
        onSelectAll: handleSelectAll,
        onResetZoom: handleResetZoom,
        onZoomIn: handleZoomIn,
        onZoomOut: handleZoomOut,
      }),
    [
      state.isBackground,
      state.targetShapeIds,
      handleBringToFront,
      handleBringForward,
      handleSendBackward,
      handleSendToBack,
      onDuplicate,
      onDelete,
      handleCopyId,
      handleSelectAll,
      handleResetZoom,
      handleZoomIn,
      handleZoomOut,
    ],
  );

  return {
    state,
    groups,
    openContextMenu,
    closeContextMenu,
  };
}
