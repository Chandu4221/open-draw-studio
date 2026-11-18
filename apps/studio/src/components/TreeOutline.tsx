import React, { useMemo, useState } from "react";
import {
  isRootId,
  SHAPE_KIND_LABELS,
  type BuiltinShapeKind,
  type ShapeId,
} from "@open-draw/canvas";
import { resolveShapeSemanticType } from "@open-draw/semantics";
import { OdBadge, OdIcon } from "@open-draw/ui";

import {
  computeContainerIds,
  determineDotCategory,
  filterVisibleTreeNodes,
  findAncestorIds,
  type TreeNodes,
} from "./tree-outline-helpers";

export interface TreeOutlineProps {
  readonly treeNodes: TreeNodes;
  readonly selectedShapeId: ShapeId | null;
  readonly selectShape: (id: ShapeId) => void;
  readonly showHeader?: boolean;
  readonly isScopedToRoot?: boolean | undefined;
  readonly activeRootTitle?: string | undefined;
  readonly onClearScope?: (() => void) | undefined;
  readonly hoveredShapeId?: ShapeId | null | undefined;
  readonly onHoverShape?: ((id: ShapeId | null) => void) | undefined;
  readonly collapsedIds?: ReadonlySet<ShapeId> | undefined;
  readonly onToggleCollapse?: ((id: ShapeId) => void) | undefined;
}

export function TreeOutline(props: TreeOutlineProps): React.JSX.Element {
  const {
    treeNodes,
    selectedShapeId,
    selectShape,
    showHeader = true,
    isScopedToRoot,
    activeRootTitle,
    onClearScope,
    hoveredShapeId,
    onHoverShape,
    collapsedIds: controlledCollapsedIds,
    onToggleCollapse,
  } = props;

  const [internalCollapsedIds, setInternalCollapsedIds] = useState<ReadonlySet<ShapeId>>(
    () => new Set(),
  );
  const [prevSelectedId, setPrevSelectedId] = useState<ShapeId | null>(selectedShapeId);

  let activeInternalCollapsed = internalCollapsedIds;
  if (selectedShapeId !== prevSelectedId) {
    setPrevSelectedId(selectedShapeId);
    if (selectedShapeId) {
      const ancestors = findAncestorIds(treeNodes, selectedShapeId);
      const hasCollapsed = [...ancestors].some((a) => internalCollapsedIds.has(a));
      if (hasCollapsed) {
        const next = new Set(internalCollapsedIds);
        ancestors.forEach((a) => next.delete(a));
        activeInternalCollapsed = next;
        setInternalCollapsedIds(next);
      }
    }
  }

  const collapsedIds = controlledCollapsedIds ?? activeInternalCollapsed;
  const containerIds = useMemo(() => computeContainerIds(treeNodes), [treeNodes]);

  const toggleCollapse = (id: ShapeId) => {
    if (onToggleCollapse) {
      onToggleCollapse(id);
    } else {
      setInternalCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const visibleNodes = useMemo(
    () => filterVisibleTreeNodes(treeNodes, collapsedIds),
    [treeNodes, collapsedIds],
  );

  return (
    <div className="od-tree-container">
      {showHeader && (
        <div className="od-tree-header">
          <span className="od-section-header">LAYERS</span>
          <OdBadge>{treeNodes.length}</OdBadge>
        </div>
      )}
      {isScopedToRoot && activeRootTitle && (
        <div className="od-tree-scope-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--od-4)", minWidth: 0 }}>
            <span style={{ color: "var(--od-text-secondary)", flexShrink: 0 }}>Scope:</span>
            <span
              style={{
                fontWeight: 600,
                color: "var(--od-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeRootTitle}
            </span>
          </div>
          {onClearScope && (
            <button
              type="button"
              className="od-btn od-btn--ghost"
              style={{ height: "20px", padding: "0 var(--od-4)", fontSize: "10px", flexShrink: 0 }}
              onClick={onClearScope}
              title="Show all screens on canvas"
            >
              All Screens
            </button>
          )}
        </div>
      )}
      <div className="od-tree-scroll">
        {visibleNodes.length === 0 ? (
          <div className="od-empty" style={{ padding: "var(--od-16)" }}>
            <span>No layers</span>
          </div>
        ) : (
          visibleNodes.map((node) => {
            const isSelected = node.shape.id === selectedShapeId;
            const isHovered = !isSelected && node.shape.id === hoveredShapeId;
            const itemName =
              node.shape.label && node.shape.label.trim().length > 0
                ? node.shape.label
                : (SHAPE_KIND_LABELS[node.shape.kind as BuiltinShapeKind] ?? node.shape.kind);
            const semanticChip =
              node.semanticType ??
              node.semantic?.displayName ??
              (isRootId(node.shape.parentId) ? resolveShapeSemanticType(node.shape) : undefined);
            const isContainer = containerIds.has(node.shape.id);
            const isCollapsed = collapsedIds.has(node.shape.id);
            const dotCategory = determineDotCategory(node);

            return (
              <div
                key={node.shape.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-expanded={isContainer ? !isCollapsed : undefined}
                aria-label={`Select layer ${itemName}`}
                className={`od-tree-item${isHovered ? " od-tree-item--hovered" : ""}`}
                onClick={() => selectShape(node.shape.id)}
                onPointerEnter={() => onHoverShape?.(node.shape.id)}
                onPointerLeave={() => onHoverShape?.(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectShape(node.shape.id);
                  } else if (e.key === "ArrowLeft" && isContainer && !isCollapsed) {
                    e.preventDefault();
                    toggleCollapse(node.shape.id);
                  } else if (e.key === "ArrowRight" && isContainer && isCollapsed) {
                    e.preventDefault();
                    toggleCollapse(node.shape.id);
                  }
                }}
              >
                <div className="od-tree-item__left">
                  {node.depth > 0 && (
                    <span
                      className="od-tree-guide"
                      style={{ width: `${node.depth * 14}px` }}
                      aria-hidden="true"
                    />
                  )}
                  {isContainer && (
                    <span
                      role="button"
                      tabIndex={0}
                      className={`od-tree-chevron${isCollapsed ? " od-tree-chevron--collapsed" : ""}`}
                      aria-label={isCollapsed ? `Expand ${itemName}` : `Collapse ${itemName}`}
                      aria-expanded={!isCollapsed}
                      title={isCollapsed ? `Expand ${itemName}` : `Collapse ${itemName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollapse(node.shape.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleCollapse(node.shape.id);
                        }
                      }}
                    >
                      <OdIcon name="chevron" size={12} />
                    </span>
                  )}
                  <span className={`od-tree-dot od-tree-dot--${dotCategory}`} aria-hidden="true" />
                  <span className="od-tree-item__label">{itemName}</span>
                </div>
                <div className="od-tree-item__right">
                  {semanticChip && (
                    <OdBadge
                      variant="outline"
                      role={isContainer ? "button" : undefined}
                      tabIndex={isContainer ? 0 : undefined}
                      aria-label={
                        isContainer
                          ? isCollapsed
                            ? `Expand ${itemName}`
                            : `Collapse ${itemName}`
                          : undefined
                      }
                      title={
                        isContainer
                          ? isCollapsed
                            ? `Click to expand ${itemName}`
                            : `Click to collapse ${itemName}`
                          : undefined
                      }
                      className={isContainer ? "od-tree-chip--container" : undefined}
                      style={{
                        fontSize: "11px",
                        height: "18px",
                        padding: "0 6px",
                        fontWeight: 500,
                      }}
                      onClick={
                        isContainer
                          ? (e) => {
                              e.stopPropagation();
                              toggleCollapse(node.shape.id);
                            }
                          : undefined
                      }
                      onKeyDown={
                        isContainer
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCollapse(node.shape.id);
                              }
                            }
                          : undefined
                      }
                    >
                      {semanticChip}
                    </OdBadge>
                  )}
                  {node.conflict && (
                    <span
                      style={{
                        backgroundColor: "var(--od-danger-soft)",
                        color: "var(--od-danger)",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "1px 4px",
                        borderRadius: "var(--od-radius-sm)",
                        flexShrink: 0,
                      }}
                      title={node.conflict.reason}
                    >
                      conflict
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
