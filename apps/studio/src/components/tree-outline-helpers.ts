import { isRootId, type ShapeId } from "@open-draw/canvas";
import type { walkSemanticTree } from "@open-draw/semantics";

export type TreeNodes = ReturnType<typeof walkSemanticTree>;
export type TreeNode = TreeNodes[number];
export type DotCategory = "conflict" | "container" | "interactive" | "content" | "primitive";

export function computeContainerIds(treeNodes: TreeNodes): Set<ShapeId> {
  const containers = new Set<ShapeId>();
  for (let i = 0; i < treeNodes.length; i++) {
    const node = treeNodes[i];
    if (!node) continue;
    const nextNode = treeNodes[i + 1];
    if (isRootId(node.shape.parentId) || (nextNode !== undefined && nextNode.depth > node.depth)) {
      containers.add(node.shape.id);
    }
  }
  return containers;
}

export function findAncestorIds(treeNodes: TreeNodes, targetId: ShapeId): Set<ShapeId> {
  const parentMap = new Map<ShapeId, ShapeId>();
  for (const n of treeNodes) {
    if (!isRootId(n.shape.parentId)) parentMap.set(n.shape.id, n.shape.parentId as ShapeId);
  }
  const ancestors = new Set<ShapeId>();
  let curr = parentMap.get(targetId);
  while (curr) {
    ancestors.add(curr);
    curr = parentMap.get(curr);
  }
  return ancestors;
}

export function filterVisibleTreeNodes(
  treeNodes: TreeNodes,
  collapsedIds: ReadonlySet<ShapeId>,
): TreeNode[] {
  if (collapsedIds.size === 0) return [...treeNodes];
  const visible: TreeNode[] = [];
  let hiddenBelowDepth: number | null = null;
  for (const node of treeNodes) {
    if (hiddenBelowDepth !== null) {
      if (node.depth > hiddenBelowDepth) continue;
      hiddenBelowDepth = null;
    }
    visible.push(node);
    if (collapsedIds.has(node.shape.id)) hiddenBelowDepth = node.depth;
  }
  return visible;
}

export function determineDotCategory(node: TreeNode): DotCategory {
  if (node.conflict !== undefined) return "conflict";
  if (isRootId(node.shape.parentId)) return "container";
  const cat = node.semantic?.definition?.category;
  if (cat === "layout") return "container";
  if (cat === "interactive" || cat === "forms" || cat === "navigation") return "interactive";
  if (cat === "content" || cat === "feedback") return "content";
  return "primitive";
}

export interface SiblingIndexInfo {
  readonly index: number;
  readonly total: number;
}

export function computeSiblingIndices(
  treeNodes: TreeNodes,
): ReadonlyMap<ShapeId, SiblingIndexInfo> {
  const parentChildren = new Map<ShapeId, ShapeId[]>();
  for (const node of treeNodes) {
    const pid = node.shape.parentId;
    const list = parentChildren.get(pid);
    if (list === undefined) {
      parentChildren.set(pid, [node.shape.id]);
    } else {
      list.push(node.shape.id);
    }
  }
  const map = new Map<ShapeId, SiblingIndexInfo>();
  for (const children of parentChildren.values()) {
    for (let i = 0; i < children.length; i++) {
      map.set(children[i]!, { index: i, total: children.length });
    }
  }
  return map;
}
