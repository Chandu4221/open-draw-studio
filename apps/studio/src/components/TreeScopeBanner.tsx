import React from "react";

export interface TreeScopeBannerProps {
  readonly activeRootTitle: string;
  readonly onClearScope?: (() => void) | undefined;
}

export function TreeScopeBanner({
  activeRootTitle,
  onClearScope,
}: TreeScopeBannerProps): React.JSX.Element {
  return (
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
  );
}
