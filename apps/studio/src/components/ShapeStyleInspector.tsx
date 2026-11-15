import React, { useEffect, useRef } from "react";
import { FILL_STYLES, SHAPE_KINDS, type FillStyle, type Shape } from "@open-draw/canvas";
import { OdField, OdIcon, OdSegmentedControl, type OdSegmentedItem } from "@open-draw/ui";
import { ColorPickerRow } from "./ColorPickerRow";

type EditSession<T> = { start: T | null; active: boolean };

interface StrokeWidthRowProps {
  readonly value: number | undefined | null;
  readonly shapeId: string;
  readonly onPreview: (val: number | null) => void;
  readonly onCommit: (val: number | null, startVal: number | null) => void;
  readonly onReset: () => void;
}

function StrokeWidthRow(props: StrokeWidthRowProps): React.JSX.Element {
  const { value, shapeId, onPreview, onCommit, onReset } = props;
  const strokeInputId = `shape-${shapeId}-stroke-width`;
  const sessionRef = useRef<EditSession<number>>({ start: null, active: false });

  useEffect(() => {
    sessionRef.current = { start: null, active: false };
  }, [shapeId]);

  const startSession = () => {
    if (!sessionRef.current.active) {
      sessionRef.current = { start: value ?? null, active: true };
    }
  };

  const commitValue = (raw: string | null) => {
    if (sessionRef.current.active) {
      const start = sessionRef.current.start;
      sessionRef.current = { start: null, active: false };
      const val = raw === null || raw.trim().length === 0 ? null : Number(raw.trim());
      if (val !== start) onCommit(val, start);
    }
  };

  return (
    <OdField label="Stroke Width" htmlFor={strokeInputId}>
      <div style={{ display: "flex", gap: "var(--od-4)", alignItems: "center", width: "100%" }}>
        <input
          id={strokeInputId}
          type="number"
          min="0"
          max="64"
          className="od-input"
          aria-label="Stroke width in pixels"
          value={value ?? ""}
          placeholder="1"
          onFocus={startSession}
          onChange={(e) => {
            const raw = e.target.value.trim();
            onPreview(raw.length === 0 ? null : Number(raw));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitValue(e.currentTarget.value);
              (e.target as HTMLElement).blur();
            }
          }}
          onBlur={(e) => commitValue(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            width: 0,
            height: "var(--od-control-height)",
            padding: "0 var(--od-4)",
            fontSize: "var(--od-text-xs)",
          }}
        />
        <button
          type="button"
          onClick={onReset}
          className="od-btn od-btn--ghost"
          aria-label="Reset stroke width to default"
          title="Reset stroke width to default"
          style={{
            height: "var(--od-control-height)",
            width: "24px",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <OdIcon name="undo" />
        </button>
      </div>
    </OdField>
  );
}

export type StyleChangeHandler = (
  fill?: string | null,
  stroke?: string | null,
  strokeWidth?: number | null,
  fillStyle?: FillStyle | null,
) => void;

export interface ShapeStyleInspectorProps {
  readonly selectedShape: Shape;
  readonly handleStyleChange: StyleChangeHandler;
  readonly handleStylePreview: StyleChangeHandler;
  readonly handleStyleCommit: (
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    startStyle?: {
      fill?: string | null;
      stroke?: string | null;
      strokeWidth?: number | null;
      fillStyle?: FillStyle | null;
    },
    fillStyle?: FillStyle | null,
  ) => void;
}

const FILL_STYLE_ITEMS: readonly OdSegmentedItem<FillStyle>[] = [
  {
    id: FILL_STYLES.none,
    icon: "fill-none",
    tooltip: "Transparent (none)",
    "aria-label": "Transparent fill",
  },
  {
    id: FILL_STYLES.subtle,
    icon: "fill-subtle",
    tooltip: "Subtle (10% tint)",
    "aria-label": "Subtle fill",
  },
  {
    id: FILL_STYLES.solid,
    icon: "fill-solid",
    tooltip: "Solid",
    "aria-label": "Solid fill",
  },
  {
    id: FILL_STYLES.hatch,
    icon: "fill-hatch",
    tooltip: "Hatch (stripes)",
    "aria-label": "Hatch fill",
  },
];

export function ShapeStyleInspector(props: ShapeStyleInspectorProps): React.JSX.Element {
  const { selectedShape, handleStyleChange, handleStylePreview, handleStyleCommit } = props;

  const supportsFill =
    selectedShape.kind === SHAPE_KINDS.rect ||
    selectedShape.kind === SHAPE_KINDS.ellipse ||
    selectedShape.kind === SHAPE_KINDS.page ||
    selectedShape.kind === SHAPE_KINDS.section;

  const currentFillStyle: FillStyle =
    selectedShape.fillStyle ??
    (selectedShape.fill && selectedShape.fill !== "none" && selectedShape.fill !== "transparent"
      ? FILL_STYLES.solid
      : FILL_STYLES.none);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--od-12)" }}>
      {supportsFill && (
        <>
          <OdField label="Fill Style">
            <OdSegmentedControl
              items={FILL_STYLE_ITEMS}
              value={currentFillStyle}
              onSelect={(val) => {
                const nextFill =
                  val === FILL_STYLES.solid &&
                  (!selectedShape.fill ||
                    selectedShape.fill === "none" ||
                    selectedShape.fill === "transparent")
                    ? "#ffffff"
                    : undefined;
                handleStyleCommit(
                  nextFill,
                  undefined,
                  undefined,
                  { fillStyle: selectedShape.fillStyle ?? null, fill: selectedShape.fill ?? null },
                  val,
                );
              }}
              aria-label="Shape fill style"
            />
          </OdField>
          <ColorPickerRow
            label="Fill"
            fieldKey="fill"
            value={selectedShape.fill}
            fallbackHex="#ffffff"
            shapeId={selectedShape.id}
            onPreview={(val) => {
              const nextFillStyle =
                val &&
                val !== "none" &&
                val !== "transparent" &&
                currentFillStyle === FILL_STYLES.none
                  ? FILL_STYLES.solid
                  : undefined;
              handleStylePreview(val, undefined, undefined, nextFillStyle);
            }}
            onCommit={(val, start) => {
              const nextFillStyle =
                val &&
                val !== "none" &&
                val !== "transparent" &&
                currentFillStyle === FILL_STYLES.none
                  ? FILL_STYLES.solid
                  : undefined;
              handleStyleCommit(
                val,
                undefined,
                undefined,
                { fill: start, fillStyle: selectedShape.fillStyle ?? null },
                nextFillStyle,
              );
            }}
            onReset={() => handleStyleChange(null, undefined, undefined, null)}
          />
        </>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
          gap: "var(--od-8)",
        }}
      >
        <ColorPickerRow
          label="Stroke"
          fieldKey="stroke"
          value={selectedShape.stroke}
          fallbackHex="#1f2933"
          shapeId={selectedShape.id}
          onPreview={(val) => handleStylePreview(undefined, val, undefined, undefined)}
          onCommit={(val, start) =>
            handleStyleCommit(undefined, val, undefined, { stroke: start }, undefined)
          }
          onReset={() => handleStyleChange(undefined, null, undefined, undefined)}
        />
        <StrokeWidthRow
          value={selectedShape.strokeWidth}
          shapeId={selectedShape.id}
          onPreview={(val) => handleStylePreview(undefined, undefined, val, undefined)}
          onCommit={(val, start) =>
            handleStyleCommit(undefined, undefined, val, { strokeWidth: start }, undefined)
          }
          onReset={() => handleStyleChange(undefined, undefined, null, undefined)}
        />
      </div>
    </div>
  );
}
