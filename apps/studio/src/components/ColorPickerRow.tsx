import React, { useEffect, useRef } from "react";
import { OdField, OdIcon } from "@open-draw/ui";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

type EditSession<T> = { start: T | null; active: boolean };

function toColorInputValue(val: string | undefined | null, fallback: string): string {
  if (val && HEX_COLOR_RE.test(val)) return val;
  return fallback;
}

export interface ColorPickerRowProps {
  readonly label: string;
  readonly fieldKey: "fill" | "stroke";
  readonly value: string | undefined | null;
  readonly fallbackHex: string;
  readonly shapeId: string;
  readonly onPreview: (val: string | null) => void;
  readonly onCommit: (val: string | null, startVal: string | null) => void;
  readonly onReset: () => void;
}

export function ColorPickerRow(props: ColorPickerRowProps): React.JSX.Element {
  const { label, fieldKey, value, fallbackHex, shapeId, onPreview, onCommit, onReset } = props;
  const hexInputId = `shape-${shapeId}-${fieldKey}-hex`;
  const colorPickerId = `shape-${shapeId}-${fieldKey}-color`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sessionRef = useRef<EditSession<string>>({ start: null, active: false });

  useEffect(() => {
    sessionRef.current = { start: null, active: false };
  }, [shapeId]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onNativeChange = () => {
      if (sessionRef.current.active) {
        const start = sessionRef.current.start;
        sessionRef.current = { start: null, active: false };
        if (el.value !== start) onCommit(el.value, start);
      }
    };
    el.addEventListener("change", onNativeChange);
    return () => el.removeEventListener("change", onNativeChange);
  }, [onCommit]);

  const commitValue = (raw: string | null) => {
    if (sessionRef.current.active) {
      const start = sessionRef.current.start;
      sessionRef.current = { start: null, active: false };
      const val = raw === null ? null : raw.trim().length === 0 ? null : raw.trim();
      if (val !== start) onCommit(val, start);
    }
  };

  const startSession = () => {
    if (!sessionRef.current.active) {
      sessionRef.current = { start: value ?? null, active: true };
    }
  };

  return (
    <OdField label={label} htmlFor={hexInputId}>
      <div style={{ display: "flex", gap: "var(--od-4)", alignItems: "center", width: "100%" }}>
        <input
          ref={inputRef}
          id={colorPickerId}
          type="color"
          className="od-input"
          aria-label={`${label} color picker`}
          value={toColorInputValue(value, fallbackHex)}
          onFocus={startSession}
          onChange={(e) => {
            startSession();
            onPreview(e.target.value);
          }}
          onBlur={() => {
            if (sessionRef.current.active) {
              const start = sessionRef.current.start;
              sessionRef.current = { start: null, active: false };
              const val = inputRef.current?.value ?? value ?? null;
              if (val !== start) onCommit(val, start);
            }
          }}
          style={{
            width: "26px",
            height: "var(--od-control-height)",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          id={hexInputId}
          type="text"
          className="od-input"
          placeholder={fallbackHex}
          aria-label={`${label} hex code or none`}
          value={value ?? ""}
          onFocus={startSession}
          onChange={(e) => {
            const raw = e.target.value.trim();
            onPreview(raw.length === 0 ? null : raw);
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
            padding: "0 var(--od-4)",
            fontSize: "var(--od-text-xs)",
          }}
        />
        <button
          type="button"
          onClick={onReset}
          className="od-btn od-btn--ghost"
          aria-label={`Reset ${label.toLowerCase()} to default`}
          title={`Reset ${label.toLowerCase()} to default`}
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
