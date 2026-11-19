import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { OdIcon, type IconId } from "@open-draw/ui";

export interface ContextMenuItem {
  readonly id: string;
  readonly label: string;
  readonly shortcut?: string | undefined;
  readonly icon?: IconId | undefined;
  readonly danger?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly onClick: () => void;
}

export interface ContextMenuGroup {
  readonly items: readonly ContextMenuItem[];
}

export interface ContextMenuProps {
  readonly isOpen: boolean;
  readonly x: number;
  readonly y: number;
  readonly groups: readonly ContextMenuGroup[];
  readonly onClose: () => void;
}

import {
  clampMenuCoordinates,
  DEFAULT_MENU_HEIGHT,
  DEFAULT_MENU_WIDTH,
} from "./context-menu-helpers";

export function ContextMenu(props: ContextMenuProps): React.JSX.Element | null {
  const { isOpen, x, y, groups, onClose } = props;
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuDimensions, setMenuDimensions] = useState<{ width: number; height: number }>({
    width: DEFAULT_MENU_WIDTH,
    height: DEFAULT_MENU_HEIGHT,
  });

  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setMenuDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, [isOpen, groups]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || groups.length === 0) {
    return null;
  }

  const { x: clampedX, y: clampedY } = clampMenuCoordinates(
    x,
    y,
    menuDimensions.width,
    menuDimensions.height,
  );

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      className="od-context-menu"
      style={{
        position: "fixed",
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        zIndex: 1000,
      }}
    >
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="od-context-menu__group" role="group">
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`od-context-menu__item${item.danger ? " od-context-menu__item--danger" : ""}`}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
            >
              {item.icon && <OdIcon name={item.icon} size={14} />}
              <span className="od-context-menu__label">{item.label}</span>
              {item.shortcut && (
                <span className="od-context-menu__shortcut">
                  <kbd className="od-kbd">{item.shortcut}</kbd>
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
