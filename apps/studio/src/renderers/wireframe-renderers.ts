import type { BoundingBox, PluginId, Shape } from "@open-draw/canvas";
import { FILL_STYLES, parsePluginId } from "@open-draw/canvas";
import { buildScopedTextStyle, WIREFRAME_PALETTE } from "./wireframe-typography";

export {
  PLUGIN_TYPOGRAPHY,
  TYPOGRAPHY_VARIANTS,
  type TypographyVariant,
  type TypographySpec,
  TYPOGRAPHY_SPECS,
  WIREFRAME_PALETTE,
  computeAutoContrastText,
  resolveShapeTypographyVariant,
  resolveShapeTypography,
  buildScopedTextStyle,
} from "./wireframe-typography";

export const PLUGIN_BORDER_RADIUS: PluginId = parsePluginId("open-draw:border-radius");

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

export function resolveWireframeFill(shape: Shape): {
  fill: string;
  fillOpacity?: number | undefined;
  defs?: string | undefined;
} {
  const fillStyle = shape.fillStyle;
  if (fillStyle === FILL_STYLES.none) {
    return { fill: "none" };
  }
  if (fillStyle === FILL_STYLES.subtle) {
    const tintColor =
      shape.fill && shape.fill !== "none" && shape.fill !== "transparent"
        ? shape.fill
        : shape.stroke && shape.stroke !== "none"
          ? shape.stroke
          : WIREFRAME_PALETTE.borderDark;
    return { fill: escapeXml(tintColor), fillOpacity: 0.1 };
  }
  if (fillStyle === FILL_STYLES.hatch) {
    const patternId = `od-pattern-hatch-${escapeXml(shape.id)}`;
    const strokeColor = escapeXml(
      shape.stroke && shape.stroke !== "none" ? shape.stroke : WIREFRAME_PALETTE.borderDark,
    );
    const defs = `<defs><pattern id="${patternId}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)"><line x1="0" y1="0" x2="0" y2="10" stroke="${strokeColor}" stroke-width="1.5" /></pattern></defs>`;
    return { fill: `url(#${patternId})`, defs };
  }
  if (fillStyle === FILL_STYLES.solid) {
    return { fill: escapeXml(shape.fill ?? WIREFRAME_PALETTE.surfaceCard) };
  }
  if (shape.fill !== undefined) {
    return { fill: escapeXml(shape.fill) };
  }
  return { fill: "none" };
}

function renderRectSvg(
  box: BoundingBox,
  radii: CornerRadii,
  fill: string,
  stroke?: string,
  strokeWidth?: number,
  fillOpacity?: number,
  defs?: string,
): string {
  const isUniform = radii.tl === radii.tr && radii.tr === radii.br && radii.br === radii.bl;
  const strokeAttr = stroke ? ` stroke="${escapeXml(stroke)}"` : "";
  const swAttr = strokeWidth ? ` stroke-width="${strokeWidth}"` : "";
  const fillOpacityAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";
  const defsTag = defs ?? "";

  if (isUniform) {
    const radius = radii.tl;
    const formattedRadius = Number.isInteger(radius) ? radius.toString() : radius.toFixed(1);
    const radiusAttr = radius > 0 ? ` rx="${formattedRadius}" ry="${formattedRadius}"` : "";
    return `${defsTag}<rect x="${num(box.x)}" y="${num(box.y)}" width="${num(box.width, 1)}" height="${num(box.height, 1)}"${radiusAttr} fill="${fill}"${fillOpacityAttr}${strokeAttr}${swAttr} />`;
  }

  const pathD = generateRoundedRectPath(
    num(box.x),
    num(box.y),
    num(box.width, 1),
    num(box.height, 1),
    radii,
  );
  return `${defsTag}<path d="${pathD}" fill="${fill}"${fillOpacityAttr}${strokeAttr}${swAttr} />`;
}

/**
 * Custom SVG renderer for polished rectangles, cards, and buttons.
 */
export function renderPolishedRect(shape: Shape, box: BoundingBox): string {
  const radii = resolveShapeCornerRadii(shape, box);
  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = shape.stroke ?? WIREFRAME_PALETTE.borderDark;
  const strokeWidth = num(shape.strokeWidth, 1);
  return `${buildScopedTextStyle(shape)}${renderRectSvg(box, radii, fill, stroke, strokeWidth, fillOpacity, defs)}`;
}

/**
 * Custom SVG renderer for polished typography shapes.
 */
export function renderPolishedText(shape: Shape, box: BoundingBox): string {
  const styleTag = buildScopedTextStyle(shape);
  if (shape.fill !== undefined && shape.fill !== "none" && shape.fill !== "transparent") {
    const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
    const radii = resolveShapeCornerRadii(shape, box);
    return `${styleTag}${renderRectSvg(box, radii, fill, shape.stroke, num(shape.strokeWidth, 1), fillOpacity, defs)}`;
  }
  return styleTag;
}
