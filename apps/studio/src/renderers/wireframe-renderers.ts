import type { BoundingBox, PluginId, Shape, ShapeSvgRenderer } from "@open-draw/canvas";
import { parsePluginId, SHAPE_KINDS } from "@open-draw/canvas";

export const PLUGIN_BORDER_RADIUS: PluginId = parsePluginId("open-draw:border-radius");
export const PLUGIN_TYPOGRAPHY: PluginId = parsePluginId("open-draw:typography");

export const CORNER_RADII = {
  none: 0,
  subtle: 4,
  input: 6,
  card: 8,
  container: 10,
  badge: 12,
  pill: 999,
} as const;

export type CornerRadiusPreset = keyof typeof CORNER_RADII;

export interface CornerRadii {
  readonly tl: number;
  readonly tr: number;
  readonly br: number;
  readonly bl: number;
}

export type ShapeBorderRadius = number | "pill" | CornerRadii;

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

function num(val: number | undefined | null, fallback = 0): number {
  return typeof val === "number" && Number.isFinite(val) ? val : fallback;
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
 * Resolves the visual corner radii in pixels for a shape.
 */
export function resolveShapeCornerRadii(shape: Shape, box: BoundingBox): CornerRadii {
  const metaRadius =
    (shape.meta.pluginData?.[PLUGIN_BORDER_RADIUS] as
      number | string | Partial<CornerRadii> | undefined | null) ?? shape.meta.borderRadius;
  const maxPill = Math.min(box.width, box.height) / 2;

  if (typeof metaRadius === "number" && Number.isFinite(metaRadius) && metaRadius >= 0) {
    const val = Math.min(metaRadius, maxPill);
    return { tl: val, tr: val, br: val, bl: val };
  }
  if (metaRadius === "pill") {
    const val = Math.min(20, maxPill);
    return { tl: val, tr: val, br: val, bl: val };
  }
  if (metaRadius !== null && typeof metaRadius === "object") {
    const obj = metaRadius as Partial<CornerRadii>;
    return {
      tl: Math.min(num(obj.tl, 0), maxPill),
      tr: Math.min(num(obj.tr, 0), maxPill),
      br: Math.min(num(obj.br, 0), maxPill),
      bl: Math.min(num(obj.bl, 0), maxPill),
    };
  }

  // Derive from semantic tag if available
  const semantic = shape.meta.semantic as { id?: string } | undefined;
  const tagId = semantic?.id;

  if (tagId === "button" || tagId === "floating-action-button") {
    const val = Math.min(20, maxPill);
    return { tl: val, tr: val, br: val, bl: val };
  }
  if (
    tagId === "card" ||
    tagId === "dialog" ||
    tagId === "modal" ||
    shape.meta.isContainer === true
  ) {
    const val = CORNER_RADII.card;
    return { tl: val, tr: val, br: val, bl: val };
  }
  if (tagId === "input" || tagId === "select" || tagId === "textarea") {
    const val = CORNER_RADII.input;
    return { tl: val, tr: val, br: val, bl: val };
  }
  if (tagId === "badge" || tagId === "chip" || tagId === "tag") {
    const val = Math.min(CORNER_RADII.badge, maxPill);
    return { tl: val, tr: val, br: val, bl: val };
  }

  return { tl: 0, tr: 0, br: 0, bl: 0 };
}

/**
 * Resolves the visual corner radius in pixels for a shape.
 */
export function resolveShapeBorderRadius(shape: Shape, box: BoundingBox): number {
  const radii = resolveShapeCornerRadii(shape, box);
  return Math.max(radii.tl, radii.tr, radii.br, radii.bl);
}

/**
 * Generates an SVG path data string for a rectangle with independent corner radii.
 */
export function generateRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii,
): string {
  let { tl, tr, br, bl } = radii;
  const topSum = tl + tr;
  const rightSum = tr + br;
  const bottomSum = bl + br;
  const leftSum = tl + bl;

  const scale = Math.min(
    1,
    topSum > width ? width / topSum : 1,
    bottomSum > width ? width / bottomSum : 1,
    leftSum > height ? height / leftSum : 1,
    rightSum > height ? height / rightSum : 1,
  );

  tl *= scale;
  tr *= scale;
  br *= scale;
  bl *= scale;

  const x0 = x;
  const y0 = y;
  const x1 = x + width;
  const y1 = y + height;
  const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));

  const p1 = `M ${fmt(x0 + tl)} ${fmt(y0)} L ${fmt(x1 - tr)} ${fmt(y0)}`;
  const a1 =
    tr > 0 ? `A ${fmt(tr)} ${fmt(tr)} 0 0 1 ${fmt(x1)} ${fmt(y0 + tr)}` : `L ${fmt(x1)} ${fmt(y0)}`;
  const p2 = `L ${fmt(x1)} ${fmt(y1 - br)}`;
  const a2 =
    br > 0 ? `A ${fmt(br)} ${fmt(br)} 0 0 1 ${fmt(x1 - br)} ${fmt(y1)}` : `L ${fmt(x1)} ${fmt(y1)}`;
  const p3 = `L ${fmt(x0 + bl)} ${fmt(y1)}`;
  const a3 =
    bl > 0 ? `A ${fmt(bl)} ${fmt(bl)} 0 0 1 ${fmt(x0)} ${fmt(y1 - bl)}` : `L ${fmt(x0)} ${fmt(y1)}`;
  const p4 = `L ${fmt(x0)} ${fmt(y0 + tl)}`;
  const a4 =
    tl > 0 ? `A ${fmt(tl)} ${fmt(tl)} 0 0 1 ${fmt(x0 + tl)} ${fmt(y0)}` : `L ${fmt(x0)} ${fmt(y0)}`;

  return `${p1} ${a1} ${p2} ${a2} ${p3} ${a3} ${p4} ${a4} Z`;
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

  // Derive from semantic tag properties or tag ID
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

function buildScopedTextStyle(shape: Shape): string {
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

function renderRectSvg(
  box: BoundingBox,
  radii: CornerRadii,
  fill: string,
  stroke?: string,
  strokeWidth?: number,
): string {
  const isUniform = radii.tl === radii.tr && radii.tr === radii.br && radii.br === radii.bl;
  const strokeAttr = stroke ? ` stroke="${escapeXml(stroke)}"` : "";
  const swAttr = strokeWidth ? ` stroke-width="${strokeWidth}"` : "";

  if (isUniform) {
    const radius = radii.tl;
    const formattedRadius = Number.isInteger(radius) ? radius.toString() : radius.toFixed(1);
    const radiusAttr = radius > 0 ? ` rx="${formattedRadius}" ry="${formattedRadius}"` : "";
    return `<rect x="${num(box.x)}" y="${num(box.y)}" width="${num(box.width, 1)}" height="${num(box.height, 1)}"${radiusAttr} fill="${fill}"${strokeAttr}${swAttr} />`;
  }

  const pathD = generateRoundedRectPath(
    num(box.x),
    num(box.y),
    num(box.width, 1),
    num(box.height, 1),
    radii,
  );
  return `<path d="${pathD}" fill="${fill}"${strokeAttr}${swAttr} />`;
}

/**
 * Custom SVG renderer for polished rectangles, cards, and buttons.
 */
export function renderPolishedRect(shape: Shape, box: BoundingBox): string {
  const radii = resolveShapeCornerRadii(shape, box);
  const fill = escapeXml(shape.fill ?? "none");
  const stroke = shape.stroke ?? WIREFRAME_PALETTE.borderDark;
  const strokeWidth = num(shape.strokeWidth, 1);
  return `${buildScopedTextStyle(shape)}${renderRectSvg(box, radii, fill, stroke, strokeWidth)}`;
}

/**
 * Custom SVG renderer for polished typography shapes.
 */
export function renderPolishedText(shape: Shape, box: BoundingBox): string {
  const styleTag = buildScopedTextStyle(shape);
  if (shape.fill !== undefined && shape.fill !== "none" && shape.fill !== "transparent") {
    const fill = escapeXml(shape.fill);
    const radii = resolveShapeCornerRadii(shape, box);
    return `${styleTag}${renderRectSvg(box, radii, fill, shape.stroke, num(shape.strokeWidth, 1))}`;
  }
  return styleTag;
}

/**
 * Creates the Studio custom renderers map for documentToSvg and createEditor.
 */
export function createStudioCustomRenderers(): Readonly<Record<string, ShapeSvgRenderer>> {
  return Object.freeze({
    [SHAPE_KINDS.rect]: (shape: Shape, box: BoundingBox) => renderPolishedRect(shape, box),
    [SHAPE_KINDS.text]: (shape: Shape, box: BoundingBox) => renderPolishedText(shape, box),
  });
}
