// Deterministic wax crayon SVG renderers (R-002, R-005, R-008, R-010, R-021).
// Simulates textured wax crayon pigment on rough tooth paper using native SVG filters.
// 100% byte-deterministic from shape ID; zero Math.random(), zero external libraries.
import type { BoundingBox, LineShape, PenPathShape, Shape } from "@open-draw/canvas";
import { hashShapeId } from "./hand-drawn-renderers";
import {
  type CornerRadii,
  resolveShapeCornerRadii,
  resolveWireframeFill,
  WIREFRAME_PALETTE,
} from "./wireframe-renderers";
import { buildScopedTextStyle } from "./wireframe-typography";

const CRAYON_DEFAULT_STROKE_WIDTH = 3.0;

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

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

/**
 * Builds a deterministic SVG wax crayon filter element for a given shape seed.
 */
export function buildCrayonFilterDefs(seed: number, filterId: string): string {
  const seed1 = (seed % 9999) + 1;
  const seed2 = ((seed * 7) % 9999) + 1;

  return `<defs><filter id="${filterId}" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="${seed1}" result="paperGrain" /><feTurbulence type="turbulence" baseFrequency="0.07" numOctaves="2" seed="${seed2}" result="waxRoughness" /><feDisplacementMap in="SourceGraphic" in2="waxRoughness" scale="3" xChannelSelector="R" yChannelSelector="G" result="raggedEdge" /><feComposite in="raggedEdge" in2="paperGrain" operator="arithmetic" k1="0" k2="0.9" k3="-0.15" k4="0.05" result="waxCrayon" /></filter></defs>`;
}

/**
 * Generates a slightly wavy line segment for crayon outlines.
 */
function crayonWavyPath(x1: number, y1: number, x2: number, y2: number, seed: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 4) return `L ${fmt(x2)} ${fmt(y2)}`;

  const nx = -dy / len;
  const ny = dx / len;
  const amp = Math.min(2.0, Math.max(0.6, len * 0.02));
  const s = ((seed * 31) % 1000) / 1000 - 0.5;

  const cx1 = x1 + dx * 0.35 + nx * s * amp;
  const cy1 = y1 + dy * 0.35 + ny * s * amp;
  const cx2 = x1 + dx * 0.65 - nx * s * amp;
  const cy2 = y1 + dy * 0.65 - ny * s * amp;

  return `C ${fmt(cx1)} ${fmt(cy1)}, ${fmt(cx2)} ${fmt(cy2)}, ${fmt(x2)} ${fmt(y2)}`;
}

/**
 * Generates an SVG path for a rounded rectangle with crayon edges.
 */
function generateCrayonRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: CornerRadii,
  seed: number,
): string {
  const { tl, tr, br, bl } = radii;
  const x0 = x;
  const y0 = y;
  const x1 = x + w;
  const y1 = y + h;

  const pStart = `M ${fmt(x0 + tl)} ${fmt(y0)}`;
  const top = crayonWavyPath(x0 + tl, y0, x1 - tr, y0, seed);
  const trCorner =
    tr > 0 ? `A ${fmt(tr)} ${fmt(tr)} 0 0 1 ${fmt(x1)} ${fmt(y0 + tr)}` : `L ${fmt(x1)} ${fmt(y0)}`;
  const right = crayonWavyPath(x1, y0 + tr, x1, y1 - br, seed + 1);
  const brCorner =
    br > 0 ? `A ${fmt(br)} ${fmt(br)} 0 0 1 ${fmt(x1 - br)} ${fmt(y1)}` : `L ${fmt(x1)} ${fmt(y1)}`;
  const bottom = crayonWavyPath(x1 - br, y1, x0 + bl, y1, seed + 2);
  const blCorner =
    bl > 0 ? `A ${fmt(bl)} ${fmt(bl)} 0 0 1 ${fmt(x0)} ${fmt(y1 - bl)}` : `L ${fmt(x0)} ${fmt(y1)}`;
  const left = crayonWavyPath(x0, y1 - bl, x0, y0 + tl, seed + 3);
  const tlCorner =
    tl > 0 ? `A ${fmt(tl)} ${fmt(tl)} 0 0 1 ${fmt(x0 + tl)} ${fmt(y0)}` : `L ${fmt(x0)} ${fmt(y0)}`;

  return `${pStart} ${top} ${trCorner} ${right} ${brCorner} ${bottom} ${blCorner} ${left} ${tlCorner} Z`;
}

/**
 * Custom SVG renderer for wax crayon rectangles and buttons (Image 1).
 */
export function renderCrayonRect(shape: Shape, box: BoundingBox): string {
  const seed = hashShapeId(shape.id);
  const filterId = `od-crayon-filter-${escapeXml(shape.id)}`;
  const filterDefs = buildCrayonFilterDefs(seed, filterId);

  const radii = resolveShapeCornerRadii(shape, box);
  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, CRAYON_DEFAULT_STROKE_WIDTH);
  const fillOpacityAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";

  const pathD = generateCrayonRectPath(
    num(box.x),
    num(box.y),
    num(box.width, 1),
    num(box.height, 1),
    radii,
    seed,
  );

  return `${buildScopedTextStyle(shape)}${filterDefs}${defs ?? ""}<path d="${pathD}" fill="${fill}"${fillOpacityAttr} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filterId})" />`;
}

/**
 * Custom SVG renderer for wax crayon ellipses and circles (Image 1).
 */
export function renderCrayonEllipse(shape: Shape, box: BoundingBox): string {
  const seed = hashShapeId(shape.id);
  const filterId = `od-crayon-filter-${escapeXml(shape.id)}`;
  const filterDefs = buildCrayonFilterDefs(seed, filterId);

  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, CRAYON_DEFAULT_STROKE_WIDTH);
  const fillOpacityAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const rx = Math.max(1, box.width / 2);
  const ry = Math.max(1, box.height / 2);

  return `${buildScopedTextStyle(shape)}${filterDefs}${defs ?? ""}<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(rx)}" ry="${fmt(ry)}" fill="${fill}"${fillOpacityAttr} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filterId})" />`;
}

/**
 * Custom SVG renderer for wax crayon lines (Image 1).
 */
export function renderCrayonLine(shape: Shape, box: BoundingBox): string {
  const line = shape as LineShape;
  const seed = hashShapeId(shape.id);
  const filterId = `od-crayon-filter-${escapeXml(shape.id)}`;
  const filterDefs = buildCrayonFilterDefs(seed, filterId);

  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, CRAYON_DEFAULT_STROKE_WIDTH);

  const x1 = num(box.x + line.start.x);
  const y1 = num(box.y + line.start.y);
  const x2 = num(box.x + line.end.x);
  const y2 = num(box.y + line.end.y);

  const seg = crayonWavyPath(x1, y1, x2, y2, seed);
  const pathD = `M ${fmt(x1)} ${fmt(y1)} ${seg}`;

  return `${filterDefs}<path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filterId})" />`;
}

/**
 * Custom SVG renderer for wax crayon freestyle pen paths (Image 1).
 */
export function renderCrayonPenPath(shape: Shape, box: BoundingBox): string {
  const pen = shape as PenPathShape;
  const seed = hashShapeId(shape.id);
  const filterId = `od-crayon-filter-${escapeXml(shape.id)}`;
  const filterDefs = buildCrayonFilterDefs(seed, filterId);

  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, CRAYON_DEFAULT_STROKE_WIDTH);
  const fill = escapeXml(shape.fill ?? "none");

  if (!pen.points || pen.points.length === 0) return "";
  const pointsStr = pen.points.map((p) => `${fmt(box.x + p.x)},${fmt(box.y + p.y)}`).join(" ");

  return `${filterDefs}<polyline points="${pointsStr}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${filterId})" />`;
}

/**
 * Custom SVG renderer for wax crayon text (Image 1).
 */
export function renderCrayonText(shape: Shape, box: BoundingBox): string {
  const styleTag = buildScopedTextStyle(shape);
  if (shape.fill !== undefined && shape.fill !== "none" && shape.fill !== "transparent") {
    return renderCrayonRect(shape, box);
  }
  return styleTag;
}
