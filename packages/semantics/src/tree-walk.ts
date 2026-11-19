// Hierarchical semantic tree walk (ADR-0004 Context, Scope note).
// Preorder hierarchical traversal: root page -> sections -> contents.
// Provides the pure traversal seam consumed by future Markdown exporters.
import { isRootId, childrenOf, type Document, type Shape, type ShapeId } from "@open-draw/canvas";
import {
  PLATFORM_PROFILES,
  type DeviceType,
  type PlatformId,
  type PlatformProfile,
  type SemanticConflict,
} from "@open-draw/profiles";
import { getShapeOrder } from "./plugins";
import { computeSemanticConflict } from "./compute-conflict";
import { resolveShapeDisplayName, resolveShapeSemanticType } from "./display-name";
import { resolveRootShape } from "./resolve-root";
import { resolveSemantic, type ResolvedSemantic } from "./resolve-semantic";
import { PLUGIN_ROOT_PLATFORM, getShapeSemantic } from "./plugins";

export type ChildIndex = ReadonlyMap<ShapeId, readonly Shape[]>;

export function buildChildIndex(document: Document): ChildIndex {
  const index = new Map<ShapeId, Shape[]>();
  for (const shape of Object.values(document.shapes)) {
    const list = index.get(shape.parentId);
    if (list === undefined) {
      index.set(shape.parentId, [shape]);
    } else {
      list.push(shape);
    }
  }
  return index;
}

export interface SemanticTreeNode {
  readonly shape: Shape;
  readonly depth: number;
  readonly displayName: string;
  readonly semanticType?: string;
  readonly semantic?: ResolvedSemantic;
  readonly conflict?: SemanticConflict;
}

export function compareShapesSpatial(a: Shape, b: Shape): number {
  const diffY = a.boundingBox.y - b.boundingBox.y;
  if (Math.abs(diffY) > 1e-4) {
    return diffY;
  }
  const diffX = a.boundingBox.x - b.boundingBox.x;
  if (Math.abs(diffX) > 1e-4) {
    return diffX;
  }
  return a.id.localeCompare(b.id);
}

export function sortSiblingShapes(children: Shape[], deviceType?: DeviceType): void {
  children.sort((a, b) => {
    const orderA = getShapeOrder(a, deviceType);
    const orderB = getShapeOrder(b, deviceType);
    if (orderA !== undefined || orderB !== undefined) {
      const valA = orderA ?? 0;
      const valB = orderB ?? 0;
      if (valA !== valB) {
        return valA - valB;
      }
    }
    return compareShapesSpatial(a, b);
  });
}

/**
 * Pure hierarchical preorder walk of a document from a root shape or the virtual canvas root (ROOT_ID).
 */
export function walkSemanticTree(
  doc: Document,
  rootId: ShapeId,
  profile?: PlatformProfile,
  deviceType?: DeviceType | Readonly<Record<ShapeId, DeviceType | undefined>>,
  childIndex?: ChildIndex,
): readonly SemanticTreeNode[] {
  const nodes: SemanticTreeNode[] = [];
  const index = childIndex ?? buildChildIndex(doc);

  function visit(
    shape: Shape,
    depth: number,
    inheritedRoot?: Shape,
    inheritedProfile?: PlatformProfile,
  ): void {
    const isRoot = isRootId(shape.parentId);
    const rootShape = isRoot ? shape : (inheritedRoot ?? resolveRootShape(doc, shape.id));
    const shapePlatform =
      (rootShape?.meta.pluginData?.[PLUGIN_ROOT_PLATFORM] as PlatformId | undefined) ??
      (rootShape?.meta.platform as PlatformId | undefined);
    const shapeProfile =
      shapePlatform !== undefined
        ? PLATFORM_PROFILES[shapePlatform]
        : (inheritedProfile ?? profile);
    const semantic = resolveSemantic(shapeProfile, getShapeSemantic(shape));
    const conflict = computeSemanticConflict(doc, shape, shapeProfile);
    const displayName = resolveShapeDisplayName(shape, shapeProfile);
    const semanticType = resolveShapeSemanticType(shape, shapeProfile);

    nodes.push({
      shape,
      depth,
      displayName,
      ...(semanticType !== undefined ? { semanticType } : {}),
      ...(semantic !== undefined ? { semantic } : {}),
      ...(conflict !== undefined ? { conflict } : {}),
    });

    const children = [...childrenOf(doc, shape.id, index)];
    if (children.length === 0) {
      return;
    }

    // If deviceType is provided (global or scoped to root), sort by responsive order (absent = 0)
    const activeDevice: DeviceType | undefined =
      typeof deviceType === "object" && deviceType !== null && rootShape !== undefined
        ? deviceType[rootShape.id]
        : (deviceType as DeviceType | undefined);

    sortSiblingShapes(children, activeDevice);

    for (const child of children) {
      visit(child, depth + 1, rootShape, shapeProfile);
    }
  }

  if (isRootId(rootId)) {
    const rootChildren = [...childrenOf(doc, rootId, index)];
    const activeGlobalDevice = typeof deviceType === "string" ? deviceType : undefined;
    sortSiblingShapes(rootChildren, activeGlobalDevice);
    for (const child of rootChildren) {
      visit(child, 0);
    }
    return nodes;
  }

  const rootShape = doc.shapes[rootId];
  if (rootShape === undefined) {
    return [];
  }

  visit(rootShape, 0);
  return nodes;
}
