import {
  ancestorsOf,
  COMMANDS,
  createShapeIdGenerator,
  subtreeOf,
  type Command,
  type Document,
  type Shape,
  type ShapeId,
} from "@open-draw/canvas";

export interface StudioClipboardPayload {
  readonly copyId: string;
  readonly shapes: readonly Shape[];
  readonly topLevelIds: readonly ShapeId[];
}

interface InMemoryClipboard extends StudioClipboardPayload {
  count: number;
}

let inMemoryClipboard: InMemoryClipboard | null = null;
let sequenceCounter = 0;

export function pruneSelectedDescendants(
  doc: Document,
  selectedIds: readonly ShapeId[],
): readonly ShapeId[] {
  const selectedSet = new Set<ShapeId>(selectedIds);
  return selectedIds.filter((id) => {
    const shape = doc.shapes[id];
    if (shape === undefined) {
      return false;
    }
    for (const ancestor of ancestorsOf(doc, shape)) {
      if (selectedSet.has(ancestor.id)) {
        return false;
      }
    }
    return true;
  });
}

export function copyShapesToClipboard(
  doc: Document,
  selectedIds: readonly ShapeId[],
): StudioClipboardPayload | null {
  const topLevelIds = pruneSelectedDescendants(doc, selectedIds);
  if (topLevelIds.length === 0) {
    return null;
  }

  const shapes: Shape[] = [];
  for (const topId of topLevelIds) {
    shapes.push(...subtreeOf(doc, topId));
  }

  sequenceCounter += 1;
  const copyId = `clip-${sequenceCounter}`;
  inMemoryClipboard = {
    copyId,
    shapes,
    topLevelIds,
    count: 0,
  };

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      const serialized = JSON.stringify({
        type: "open-draw/clipboard",
        version: 1,
        copyId,
        shapes,
        topLevelIds,
      });
      void navigator.clipboard.writeText(serialized).catch(() => {});
    } catch {
      // Ignore clipboard write failures in non-secure or mocked environments
    }
  }

  return { copyId, shapes, topLevelIds };
}

export function cutShapesToClipboard(
  doc: Document,
  selectedIds: readonly ShapeId[],
): {
  readonly payload: StudioClipboardPayload;
  readonly deleteCommands: readonly Command[];
} | null {
  const payload = copyShapesToClipboard(doc, selectedIds);
  if (!payload) {
    return null;
  }

  const deleteCommands: Command[] = payload.topLevelIds.map((id) => ({
    type: COMMANDS.deleteShape,
    id,
  }));

  return { payload, deleteCommands };
}

export function pasteShapesFromClipboard(
  doc: Document,
  externalJsonText?: string | null,
): { readonly commands: readonly Command[]; readonly newTopLevelIds: readonly ShapeId[] } | null {
  let shapesToPaste: readonly Shape[] | null = null;
  let topIdsToPaste: readonly ShapeId[] | null = null;

  if (externalJsonText) {
    try {
      const data = JSON.parse(externalJsonText);
      if (
        data?.type === "open-draw/clipboard" &&
        Array.isArray(data.shapes) &&
        Array.isArray(data.topLevelIds)
      ) {
        shapesToPaste = data.shapes as Shape[];
        topIdsToPaste = data.topLevelIds as ShapeId[];
      }
    } catch {
      // Fallback to in-memory clipboard on parse error
    }
  }

  if (!shapesToPaste || !topIdsToPaste) {
    if (inMemoryClipboard && inMemoryClipboard.shapes.length > 0) {
      inMemoryClipboard.count += 1;
      shapesToPaste = inMemoryClipboard.shapes;
      topIdsToPaste = inMemoryClipboard.topLevelIds;
    }
  }

  if (!shapesToPaste || !topIdsToPaste || shapesToPaste.length === 0) {
    return null;
  }

  const offset = 20 * (inMemoryClipboard?.count ?? 1);
  const seq = createShapeIdGenerator(doc);
  const idMap = new Map<ShapeId, ShapeId>();

  for (const s of shapesToPaste) {
    idMap.set(s.id, seq.nextShapeId());
  }

  const topLevelSet = new Set<ShapeId>(topIdsToPaste);
  const pastedShapes: Shape[] = shapesToPaste.map((shape): Shape => {
    const isTopLevel = topLevelSet.has(shape.id);
    const newId = idMap.get(shape.id)!;
    const newParentId = isTopLevel ? shape.parentId : (idMap.get(shape.parentId) ?? shape.parentId);
    const newBoundingBox = isTopLevel
      ? {
          ...shape.boundingBox,
          x: shape.boundingBox.x + offset,
          y: shape.boundingBox.y + offset,
        }
      : shape.boundingBox;

    return {
      ...shape,
      id: newId,
      parentId: newParentId,
      boundingBox: newBoundingBox,
    };
  });

  const commands: Command[] = pastedShapes.map((shape) => ({
    type: COMMANDS.createShape,
    shape,
  }));

  const newTopLevelIds = topIdsToPaste.map((id) => idMap.get(id)!);

  return { commands, newTopLevelIds };
}

export function hasClipboardContent(): boolean {
  return inMemoryClipboard !== null && inMemoryClipboard.shapes.length > 0;
}

export function clearClipboard(): void {
  inMemoryClipboard = null;
  sequenceCounter = 0;
}
