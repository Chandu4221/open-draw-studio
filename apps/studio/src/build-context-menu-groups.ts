import type { Document, Editor, ShapeId } from "@open-draw/canvas";
import type { ContextMenuGroup } from "./components/ContextMenu";

export interface ResolveTargetOptions {
  readonly editor: Editor | null;
  readonly doc: Document;
  readonly event: React.MouseEvent | MouseEvent;
  readonly explicitShapeId?: ShapeId | null | undefined;
}

export function resolveContextMenuTarget(options: ResolveTargetOptions): ShapeId | null {
  const { editor, doc, event, explicitShapeId } = options;
  if (explicitShapeId && doc.shapes[explicitShapeId]) {
    return explicitShapeId;
  }

  const domTarget = event.target as HTMLElement | SVGElement | null;
  const shapeEl = domTarget?.closest?.("[data-shape-id]");
  if (shapeEl) {
    const rawId = shapeEl.getAttribute("data-shape-id");
    if (rawId) {
      const candidateId = rawId as ShapeId;
      if (doc.shapes[candidateId]) {
        return candidateId;
      }
    }
  }

  if (editor && editor.svg) {
    const rect = editor.svg.getBoundingClientRect();
    const screenPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const worldPoint = editor.canvas.screenToWorld(screenPoint);
    return editor.canvas.pickShape(doc, worldPoint);
  }

  return null;
}

export interface ContextMenuOptions {
  readonly isBackground: boolean;
  readonly targetShapeIds: readonly ShapeId[];
  readonly onBringToFront?: (() => void) | undefined;
  readonly onBringForward?: (() => void) | undefined;
  readonly onSendBackward?: (() => void) | undefined;
  readonly onSendToBack?: (() => void) | undefined;
  readonly onDuplicate?: (() => void) | undefined;
  readonly onDelete?: (() => void) | undefined;
  readonly onCopyId?: (() => void) | undefined;
  readonly onSelectAll?: (() => void) | undefined;
  readonly onResetZoom?: (() => void) | undefined;
  readonly onZoomIn?: (() => void) | undefined;
  readonly onZoomOut?: (() => void) | undefined;
}

function resolveModifier(): string {
  if (typeof navigator !== "undefined") {
    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || "");
    if (isMac) return "Cmd";
  }
  return "Ctrl";
}

export function buildContextMenuGroups(options: ContextMenuOptions): readonly ContextMenuGroup[] {
  const mod = resolveModifier();
  const groups: ContextMenuGroup[] = [];

  if (options.isBackground) {
    if (options.onSelectAll) {
      groups.push({
        items: [
          {
            id: "select-all",
            label: "Select All",
            shortcut: `${mod}+A`,
            onClick: options.onSelectAll,
          },
        ],
      });
    }

    const navItems = [];
    if (options.onResetZoom) {
      navItems.push({
        id: "reset-zoom",
        label: "Reset Zoom (100%)",
        onClick: options.onResetZoom,
      });
    }
    if (options.onZoomIn) {
      navItems.push({
        id: "zoom-in",
        label: "Zoom In",
        icon: "zoom-in" as const,
        shortcut: `${mod}++`,
        onClick: options.onZoomIn,
      });
    }
    if (options.onZoomOut) {
      navItems.push({
        id: "zoom-out",
        label: "Zoom Out",
        icon: "zoom-out" as const,
        shortcut: `${mod}+-`,
        onClick: options.onZoomOut,
      });
    }

    if (navItems.length > 0) {
      groups.push({ items: navItems });
    }

    return groups;
  }

  // Target shapes selected
  const hasTargets = options.targetShapeIds.length > 0;
  if (!hasTargets) return [];

  const arrangeItems = [];
  if (options.onBringToFront) {
    arrangeItems.push({
      id: "bring-to-front",
      label: "Bring to Front",
      shortcut: `${mod}+Shift+]`,
      onClick: options.onBringToFront,
    });
  }
  if (options.onBringForward) {
    arrangeItems.push({
      id: "bring-forward",
      label: "Bring Forward",
      shortcut: `${mod}+]`,
      onClick: options.onBringForward,
    });
  }
  if (options.onSendBackward) {
    arrangeItems.push({
      id: "send-backward",
      label: "Send Backward",
      shortcut: `${mod}+[`,
      onClick: options.onSendBackward,
    });
  }
  if (options.onSendToBack) {
    arrangeItems.push({
      id: "send-to-back",
      label: "Send to Back",
      shortcut: `${mod}+Shift+[`,
      onClick: options.onSendToBack,
    });
  }

  if (arrangeItems.length > 0) {
    groups.push({ items: arrangeItems });
  }

  const editItems = [];
  if (options.onDuplicate) {
    editItems.push({
      id: "duplicate",
      label: "Duplicate",
      shortcut: `${mod}+D`,
      onClick: options.onDuplicate,
    });
  }
  if (options.onDelete) {
    editItems.push({
      id: "delete",
      label: "Delete",
      shortcut: "Delete",
      danger: true,
      onClick: options.onDelete,
    });
  }

  if (editItems.length > 0) {
    groups.push({ items: editItems });
  }

  if (options.onCopyId && options.targetShapeIds.length === 1) {
    groups.push({
      items: [
        {
          id: "copy-chip-id",
          label: "Copy Chip ID",
          onClick: options.onCopyId,
        },
      ],
    });
  }

  return groups;
}
