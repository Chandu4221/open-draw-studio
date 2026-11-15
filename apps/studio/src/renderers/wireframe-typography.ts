import type { PluginId, Shape } from "@open-draw/canvas";
import { parsePluginId } from "@open-draw/canvas";

export const PLUGIN_TYPOGRAPHY: PluginId = parsePluginId("open-draw:typography");

export const TYPOGRAPHY_VARIANTS = {
  display: "display",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "body",
  caption: "caption",
  button: "button",
} as const;

export type TypographyVariant = (typeof TYPOGRAPHY_VARIANTS)[keyof typeof TYPOGRAPHY_VARIANTS];

export interface TypographySpec {
  readonly fontSize: number;
  readonly fontWeight: number;
  readonly letterSpacing?: string;
  readonly lineHeight?: number;
}

export const TYPOGRAPHY_SPECS: Readonly<Record<TypographyVariant, TypographySpec>> = Object.freeze({
  [TYPOGRAPHY_VARIANTS.display]: { fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" },
  [TYPOGRAPHY_VARIANTS.h1]: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" },
  [TYPOGRAPHY_VARIANTS.h2]: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" },
  [TYPOGRAPHY_VARIANTS.h3]: { fontSize: 15, fontWeight: 600 },
  [TYPOGRAPHY_VARIANTS.body]: { fontSize: 14, fontWeight: 400 },
  [TYPOGRAPHY_VARIANTS.caption]: { fontSize: 12, fontWeight: 500 },
  [TYPOGRAPHY_VARIANTS.button]: { fontSize: 14, fontWeight: 600 },
});

export const WIREFRAME_PALETTE = {
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textOnDark: "#ffffff",
  borderSubtle: "#e2e8f0",
  borderDefault: "#cbd5e1",
  borderDark: "#0f172a",
  surfaceCard: "#ffffff",
  surfaceInput: "#f8fafc",
  surfaceButtonDark: "#0f172a",
  surfaceButtonLight: "#f1f5f9",
} as const;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Calculates whether text on a given background fill should be white or dark (WCAG 2.1 relative luminance).
 */
export function computeAutoContrastText(fill: string | undefined | null): string {
  if (!fill || fill === "none" || fill === "transparent") return WIREFRAME_PALETTE.textPrimary;
  const hex = fill.trim().toLowerCase();
  if (!hex.startsWith("#")) return WIREFRAME_PALETTE.textPrimary;
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    const h1 = hex.charAt(1),
      h2 = hex.charAt(2),
      h3 = hex.charAt(3);
    r = parseInt(h1 + h1, 16);
    g = parseInt(h2 + h2, 16);
    b = parseInt(h3 + h3, 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 140 ? WIREFRAME_PALETTE.textOnDark : WIREFRAME_PALETTE.textPrimary;
}

/**
 * Resolves the effective typography variant for a shape (either from explicit meta or derived from semantic role).
 */
export function resolveShapeTypographyVariant(shape: Shape): TypographyVariant {
  const metaTypo =
    (shape.meta.pluginData?.[PLUGIN_TYPOGRAPHY] as TypographyVariant | undefined | null) ??
    (shape.meta.typography as TypographyVariant | undefined);
  if (metaTypo && metaTypo in TYPOGRAPHY_SPECS) {
    return metaTypo;
  }

  const semantic = shape.meta.semantic as
    { id?: string; properties?: Record<string, unknown> } | undefined;
  const tagId = semantic?.id;
  const rawLevel = semantic?.properties?.level;
  const level = typeof rawLevel === "number" ? rawLevel : Number(rawLevel);

  if (tagId === "heading" || tagId === "header") {
    if (level === 1) return TYPOGRAPHY_VARIANTS.h1;
    if (level === 2) return TYPOGRAPHY_VARIANTS.h2;
    if (level === 3) return TYPOGRAPHY_VARIANTS.h3;
    return TYPOGRAPHY_VARIANTS.h1;
  }
  if (tagId === "button" || tagId === "floating-action-button") {
    return TYPOGRAPHY_VARIANTS.button;
  }
  if (tagId === "caption" || tagId === "badge" || tagId === "chip") {
    return TYPOGRAPHY_VARIANTS.caption;
  }

  return TYPOGRAPHY_VARIANTS.body;
}

/**
 * Resolves typography specifications (font-size, font-weight) for a text or labeled shape.
 */
export function resolveShapeTypography(shape: Shape): TypographySpec {
  const variant = resolveShapeTypographyVariant(shape);
  return TYPOGRAPHY_SPECS[variant];
}

export function buildScopedTextStyle(shape: Shape): string {
  const autoTextColor = computeAutoContrastText(shape.fill);
  const typo = resolveShapeTypography(shape);
  const safeId = escapeXml(shape.id);

  const styleRules = [
    `font-family: var(--od-font, system-ui, -apple-system, sans-serif) !important;`,
    `font-size: ${typo.fontSize}px !important;`,
    `font-weight: ${typo.fontWeight} !important;`,
  ];
  if (autoTextColor === WIREFRAME_PALETTE.textOnDark) {
    styleRules.push(`fill: ${WIREFRAME_PALETTE.textOnDark} !important;`);
  }
  if (typo.letterSpacing) {
    styleRules.push(`letter-spacing: ${typo.letterSpacing} !important;`);
  }

  return `<style>[data-shape-id="${safeId}"] text { ${styleRules.join(" ")} }</style>`;
}
