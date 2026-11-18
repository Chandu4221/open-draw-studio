import { useCallback, useMemo, useRef, useState } from "react";
import { isRootId, type ShapeId } from "@open-draw/canvas";
import type { CanvasController, Editor } from "@open-draw/canvas";
import type { Document } from "@open-draw/canvas";
import { getRootContainerIds, pickAnyRootChip } from "./canvas-overlays";

export function syncVisibleChipRoots(
  curDoc: Document,
  disabledRoots: ReadonlySet<ShapeId>,
): Set<ShapeId> {
  const visible = new Set<ShapeId>();
  for (const shape of Object.values(curDoc.shapes)) {
    if (isRootId(shape.parentId) && !disabledRoots.has(shape.id)) {
      visible.add(shape.id);
    }
  }
  return visible;
}

export function toggleRootChip(rootId: ShapeId, disabledRoots: Set<ShapeId>): boolean {
  if (disabledRoots.has(rootId)) {
    disabledRoots.delete(rootId);
    return true;
  }
  disabledRoots.add(rootId);
  return false;
}

export interface UseRootChipVisibilityOptions {
  readonly initialDoc: Document;
  readonly editorRef: React.MutableRefObject<Editor | null>;
}

export interface UseRootChipVisibilityResult {
  readonly initialRootIds: ReadonlySet<ShapeId>;
  readonly visibleChipRoots: ReadonlySet<ShapeId>;
  readonly visibleChipRootsRef: React.MutableRefObject<ReadonlySet<ShapeId>>;
  readonly handleToggleChildChips: (rootId: ShapeId) => void;
  readonly interceptPointerDown: (
    event: PointerEvent,
    context: {
      readonly world: { readonly x: number; readonly y: number };
      readonly canvas: CanvasController;
      readonly doc: Document;
    },
  ) => boolean | void;
  readonly syncVisibleChipRoots: (doc: Document) => void;
}

export function useRootChipVisibility(
  options: UseRootChipVisibilityOptions,
): UseRootChipVisibilityResult {
  const { initialDoc, editorRef } = options;
  const disabledChipRootsRef = useRef<Set<ShapeId>>(new Set());

  const initialRootIds = useMemo(() => new Set(getRootContainerIds(initialDoc)), [initialDoc]);

  const [visibleChipRoots, setVisibleChipRoots] = useState<ReadonlySet<ShapeId>>(
    () => initialRootIds,
  );
  const visibleChipRootsRef = useRef<ReadonlySet<ShapeId>>(initialRootIds);

  const sync = useCallback((curDoc: Document): void => {
    const nextVisible = syncVisibleChipRoots(curDoc, disabledChipRootsRef.current);
    visibleChipRootsRef.current = nextVisible;
    setVisibleChipRoots(nextVisible);
  }, []);

  const handleToggleChildChips = useCallback(
    (rootId: ShapeId): void => {
      toggleRootChip(rootId, disabledChipRootsRef.current);
      const ed = editorRef.current;
      if (!ed) return;
      const nextVisible = syncVisibleChipRoots(ed.getDocument(), disabledChipRootsRef.current);
      visibleChipRootsRef.current = nextVisible;
      setVisibleChipRoots(nextVisible);
      ed.render();
    },
    [editorRef],
  );

  const interceptPointerDown = useCallback(
    (
      _event: PointerEvent,
      {
        world,
        canvas,
        doc: curDoc,
      }: {
        readonly world: { readonly x: number; readonly y: number };
        readonly canvas: CanvasController;
        readonly doc: Document;
      },
    ): boolean => {
      const hitChip = pickAnyRootChip(curDoc, world, canvas.getCamera().zoom);
      if (hitChip !== null) {
        toggleRootChip(hitChip, disabledChipRootsRef.current);
        const nextVisible = syncVisibleChipRoots(curDoc, disabledChipRootsRef.current);
        visibleChipRootsRef.current = nextVisible;
        setVisibleChipRoots(nextVisible);
        editorRef.current?.render();
        return true;
      }
      return false;
    },
    [editorRef],
  );

  return {
    initialRootIds,
    visibleChipRoots,
    visibleChipRootsRef,
    handleToggleChildChips,
    interceptPointerDown,
    syncVisibleChipRoots: sync,
  };
}
