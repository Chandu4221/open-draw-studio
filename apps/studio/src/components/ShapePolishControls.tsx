import React, { useState } from "react";
import { SHAPE_KINDS, type Shape } from "@open-draw/canvas";
import { OdField, OdIcon, OdSegmentedControl, type OdSegmentedItem } from "@open-draw/ui";
import {
  CORNER_RADII,
  PLUGIN_BORDER_RADIUS,
  PLUGIN_TYPOGRAPHY,
  TYPOGRAPHY_VARIANTS,
  type CornerRadii,
  type ShapeBorderRadius,
  type TypographyVariant,
} from "../renderers/wireframe-renderers";

export interface ShapePolishControlsProps {
  readonly selectedShape: Shape;
  readonly handleBorderRadiusChange: (radius: ShapeBorderRadius | null) => void;
  readonly handleTypographyChange: (typography: TypographyVariant | null) => void;
}

type RadiusKey = "none" | "subtle" | "card" | "pill";

const RADIUS_ITEMS: readonly OdSegmentedItem<RadiusKey>[] = [
  { id: "none", label: "Square" },
  { id: "subtle", label: "Subtle" },
  { id: "card", label: "Card" },
  { id: "pill", label: "Pill" },
];

const TYPOGRAPHY_ITEMS: readonly OdSegmentedItem<TypographyVariant>[] = [
  { id: TYPOGRAPHY_VARIANTS.display, label: "Display" },
  { id: TYPOGRAPHY_VARIANTS.h1, label: "H1" },
  { id: TYPOGRAPHY_VARIANTS.h2, label: "H2" },
  { id: TYPOGRAPHY_VARIANTS.h3, label: "H3" },
  { id: TYPOGRAPHY_VARIANTS.body, label: "Body" },
  { id: TYPOGRAPHY_VARIANTS.caption, label: "Caption" },
];

function parseCornerRadii(raw: unknown): CornerRadii {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const v = Math.max(0, raw);
    return { tl: v, tr: v, br: v, bl: v };
  }
  if (raw === "pill") {
    return { tl: 20, tr: 20, br: 20, bl: 20 };
  }
  if (raw !== null && typeof raw === "object") {
    const obj = raw as Partial<CornerRadii>;
    const n = (val: unknown) =>
      typeof val === "number" && Number.isFinite(val) ? Math.max(0, val) : 0;
    return { tl: n(obj.tl), tr: n(obj.tr), br: n(obj.br), bl: n(obj.bl) };
  }
  return { tl: 0, tr: 0, br: 0, bl: 0 };
}

function propagateCornerChange(
  corner: "tl" | "tr" | "br" | "bl",
  newVal: number,
  current: CornerRadii,
  links: { top: boolean; right: boolean; bottom: boolean; left: boolean },
): CornerRadii {
  const result: { tl: number; tr: number; br: number; bl: number } = {
    ...current,
    [corner]: newVal,
  };
  const visited = new Set<"tl" | "tr" | "br" | "bl">([corner]);
  const queue: ("tl" | "tr" | "br" | "bl")[] = [corner];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const neighbors: ("tl" | "tr" | "br" | "bl")[] = [];

    if (cur === "tl") {
      if (links.top) neighbors.push("tr");
      if (links.left) neighbors.push("bl");
    } else if (cur === "tr") {
      if (links.top) neighbors.push("tl");
      if (links.right) neighbors.push("br");
    } else if (cur === "br") {
      if (links.right) neighbors.push("tr");
      if (links.bottom) neighbors.push("bl");
    } else if (cur === "bl") {
      if (links.bottom) neighbors.push("br");
      if (links.left) neighbors.push("tl");
    }

    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        result[nb] = newVal;
        queue.push(nb);
      }
    }
  }

  return result;
}

interface LinkToggleProps {
  readonly linked: boolean;
  readonly onToggle: () => void;
  readonly label: string;
}

function LinkToggle({ linked, onToggle, label }: LinkToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "var(--od-radius-sm, 4px)",
        border: linked
          ? "1px solid var(--od-success, #22c55e)"
          : "1px solid var(--od-border, #e4e4e7)",
        background: linked ? "rgba(34, 197, 94, 0.1)" : "transparent",
        color: linked ? "var(--od-success, #22c55e)" : "var(--od-text-secondary, #52525b)",
        cursor: "pointer",
        padding: 0,
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <OdIcon name={linked ? "link" : "link-off"} />
    </button>
  );
}

interface CornerInputProps {
  readonly label: string;
  readonly ariaLabel: string;
  readonly value: number;
  readonly onChange: (val: number) => void;
}

function CornerInput({ label, ariaLabel, value, onChange }: CornerInputProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <span
        style={{ fontSize: "10px", fontWeight: 600, color: "var(--od-text-secondary, #52525b)" }}
      >
        {label}
      </span>
      <input
        type="number"
        min="0"
        max="999"
        aria-label={ariaLabel}
        className="od-input"
        style={{
          width: "46px",
          height: "26px",
          textAlign: "center",
          padding: "2px 4px",
          fontSize: "12px",
        }}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || "0", 10)))}
      />
    </div>
  );
}

export function ShapePolishControls(props: ShapePolishControlsProps): React.JSX.Element {
  const { selectedShape, handleBorderRadiusChange, handleTypographyChange } = props;

  const [topLinked, setTopLinked] = useState(true);
  const [rightLinked, setRightLinked] = useState(true);
  const [bottomLinked, setBottomLinked] = useState(true);
  const [leftLinked, setLeftLinked] = useState(true);

  const rawRadius =
    (selectedShape.meta.pluginData?.[PLUGIN_BORDER_RADIUS] as
      ShapeBorderRadius | undefined | null) ?? selectedShape.meta.borderRadius;

  const radii = parseCornerRadii(rawRadius);
  const isUniform = radii.tl === radii.tr && radii.tr === radii.br && radii.br === radii.bl;

  const currentRadiusKey: RadiusKey =
    rawRadius === "pill" || (isUniform && radii.tl >= 20)
      ? "pill"
      : isUniform && radii.tl === CORNER_RADII.card
        ? "card"
        : isUniform && radii.tl === CORNER_RADII.subtle
          ? "subtle"
          : isUniform && radii.tl === 0
            ? "none"
            : "none";

  const onSelectRadius = (key: RadiusKey) => {
    switch (key) {
      case "none":
        handleBorderRadiusChange(0);
        break;
      case "subtle":
        handleBorderRadiusChange(CORNER_RADII.subtle);
        break;
      case "card":
        handleBorderRadiusChange(CORNER_RADII.card);
        break;
      case "pill":
        handleBorderRadiusChange("pill");
        break;
    }
  };

  const currentTypo =
    (selectedShape.meta.pluginData?.[PLUGIN_TYPOGRAPHY] as TypographyVariant | undefined | null) ??
    (selectedShape.meta.typography as TypographyVariant | undefined) ??
    TYPOGRAPHY_VARIANTS.body;

  const isRect = selectedShape.kind === SHAPE_KINDS.rect;
  const isTextOrLabeled =
    selectedShape.kind === SHAPE_KINDS.text ||
    (selectedShape.content !== undefined && selectedShape.content.trim().length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--od-12)" }}>
      {isRect && (
        <OdField label="Rounded Corners">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--od-8)" }}>
            <OdSegmentedControl
              aria-label="Rounded corners preset"
              items={RADIUS_ITEMS}
              value={currentRadiusKey}
              onSelect={onSelectRadius}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gridTemplateRows: "auto auto auto",
                gap: "6px",
                alignItems: "center",
                justifyItems: "center",
                padding: "8px",
                borderRadius: "var(--od-radius, 6px)",
                border: "1px solid var(--od-border, #e4e4e7)",
                background: "var(--od-bg, #f4f4f5)",
              }}
            >
              {/* Row 1: TL, Top Link, TR */}
              <CornerInput
                label="TL"
                ariaLabel="Top left rounded corner"
                value={radii.tl}
                onChange={(v) => {
                  const next = propagateCornerChange("tl", v, radii, {
                    top: topLinked,
                    right: rightLinked,
                    bottom: bottomLinked,
                    left: leftLinked,
                  });
                  handleBorderRadiusChange(next);
                }}
              />

              <LinkToggle
                linked={topLinked}
                onToggle={() => setTopLinked((prev) => !prev)}
                label="Toggle top corners link"
              />

              <CornerInput
                label="TR"
                ariaLabel="Top right rounded corner"
                value={radii.tr}
                onChange={(v) => {
                  const next = propagateCornerChange("tr", v, radii, {
                    top: topLinked,
                    right: rightLinked,
                    bottom: bottomLinked,
                    left: leftLinked,
                  });
                  handleBorderRadiusChange(next);
                }}
              />

              {/* Row 2: Left Link, All, Right Link */}
              <LinkToggle
                linked={leftLinked}
                onToggle={() => setLeftLinked((prev) => !prev)}
                label="Toggle left corners link"
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--od-text-secondary, #52525b)",
                  }}
                >
                  All
                </span>
                <input
                  type="number"
                  min="0"
                  max="999"
                  aria-label="All rounded corners"
                  className="od-input"
                  style={{
                    width: "46px",
                    height: "26px",
                    textAlign: "center",
                    padding: "2px 4px",
                    fontSize: "12px",
                  }}
                  placeholder={isUniform ? undefined : "—"}
                  value={isUniform ? radii.tl : ""}
                  onChange={(e) => {
                    if (e.target.value === "") return;
                    const v = Math.max(0, parseInt(e.target.value, 10));
                    handleBorderRadiusChange({ tl: v, tr: v, br: v, bl: v });
                  }}
                />
              </div>

              <LinkToggle
                linked={rightLinked}
                onToggle={() => setRightLinked((prev) => !prev)}
                label="Toggle right corners link"
              />

              {/* Row 3: BL, Bottom Link, BR */}
              <CornerInput
                label="BL"
                ariaLabel="Bottom left rounded corner"
                value={radii.bl}
                onChange={(v) => {
                  const next = propagateCornerChange("bl", v, radii, {
                    top: topLinked,
                    right: rightLinked,
                    bottom: bottomLinked,
                    left: leftLinked,
                  });
                  handleBorderRadiusChange(next);
                }}
              />

              <LinkToggle
                linked={bottomLinked}
                onToggle={() => setBottomLinked((prev) => !prev)}
                label="Toggle bottom corners link"
              />

              <CornerInput
                label="BR"
                ariaLabel="Bottom right rounded corner"
                value={radii.br}
                onChange={(v) => {
                  const next = propagateCornerChange("br", v, radii, {
                    top: topLinked,
                    right: rightLinked,
                    bottom: bottomLinked,
                    left: leftLinked,
                  });
                  handleBorderRadiusChange(next);
                }}
              />
            </div>
          </div>
        </OdField>
      )}

      {isTextOrLabeled && (
        <OdField label="Typography Scale">
          <OdSegmentedControl
            aria-label="Typography scale"
            items={TYPOGRAPHY_ITEMS}
            value={currentTypo}
            onSelect={(id) => handleTypographyChange(id)}
          />
        </OdField>
      )}
    </div>
  );
}
