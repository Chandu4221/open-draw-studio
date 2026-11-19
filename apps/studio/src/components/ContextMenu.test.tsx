import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { ContextMenu, type ContextMenuGroup } from "./ContextMenu";
import { clampMenuCoordinates } from "./context-menu-helpers";

describe("ContextMenu", () => {
  const sampleGroups: readonly ContextMenuGroup[] = [
    {
      items: [
        {
          id: "bring-to-front",
          label: "Bring to Front",
          shortcut: "Ctrl+Shift+]",
          onClick: vi.fn(),
        },
        {
          id: "bring-forward",
          label: "Bring Forward",
          shortcut: "Ctrl+]",
          onClick: vi.fn(),
        },
      ],
    },
    {
      items: [
        {
          id: "delete",
          label: "Delete",
          shortcut: "Delete",
          danger: true,
          onClick: vi.fn(),
        },
      ],
    },
  ];

  it("returns null when isOpen is false", () => {
    const html = renderToString(
      <ContextMenu isOpen={false} x={100} y={100} groups={sampleGroups} onClose={vi.fn()} />,
    );
    expect(html).toBe("");
  });

  it("renders menu with role=menu and menuitems when isOpen is true", () => {
    const html = renderToString(
      <ContextMenu isOpen={true} x={150} y={200} groups={sampleGroups} onClose={vi.fn()} />,
    );

    expect(html).toContain('role="menu"');
    expect(html).toContain("od-context-menu");
    expect(html).toContain("Bring to Front");
    expect(html).toContain("Bring Forward");
    expect(html).toContain("Ctrl+Shift+]");
    expect(html).toContain("Delete");
    expect(html).toContain("od-context-menu__item--danger");
  });

  describe("clampMenuCoordinates", () => {
    it("preserves coordinates when within viewport bounds", () => {
      const pos = clampMenuCoordinates(100, 150, 200, 250, 1920, 1080);
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(150);
    });

    it("clamps X when menu would overflow the right viewport edge", () => {
      const pos = clampMenuCoordinates(1850, 100, 200, 250, 1920, 1080);
      expect(pos.x).toBe(1712); // 1920 - 200 - 8 (padding)
      expect(pos.y).toBe(100);
    });

    it("clamps Y when menu would overflow the bottom viewport edge", () => {
      const pos = clampMenuCoordinates(100, 1000, 200, 250, 1920, 1080);
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(822); // 1080 - 250 - 8 (padding)
    });
  });
});
