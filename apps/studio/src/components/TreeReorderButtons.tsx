import React from "react";

export interface TreeReorderButtonsProps {
  readonly itemName: string;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly isVisible: boolean;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
}

export function TreeReorderButtons(props: TreeReorderButtonsProps): React.JSX.Element {
  const { itemName, canMoveUp, canMoveDown, isVisible, onMoveUp, onMoveDown } = props;

  return (
    <div
      className="od-tree-reorder-actions"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <button
        type="button"
        className="od-tree-reorder-btn"
        disabled={!canMoveUp}
        aria-label={`Move ${itemName} up`}
        title={canMoveUp ? "Move layer up" : "Already at top"}
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
        </svg>
      </button>
      <button
        type="button"
        className="od-tree-reorder-btn"
        disabled={!canMoveDown}
        aria-label={`Move ${itemName} down`}
        title={canMoveDown ? "Move layer down" : "Already at bottom"}
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </button>
    </div>
  );
}
