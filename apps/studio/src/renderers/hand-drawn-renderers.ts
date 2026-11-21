// Deterministic hand-drawn marker stroke SVG renderers (R-002, R-005, R-008, R-010, R-021, ADR-0005 D3).
// Models authentic human imperfection: non-parallel edge slopes, natural corner overshoots,
// gentle sagging/bowing, and sketch-style overlapping arcs (Image 2).
import type { BoundingBox, LineShape, PenPathShape, Shape } from "@open-draw/canvas";
import {
  type CornerRadii,
  resolveShapeCornerRadii,
  resolveWireframeFill,
  WIREFRAME_PALETTE,
} from "./wireframe-renderers";
import { buildScopedTextStyle } from "./wireframe-typography";

const DEFAULT_MARKER_STROKE_WIDTH = 2.5;

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
 * Pure 32-bit FNV-1a hash of a shape ID to generate deterministic seed (ADR-0005 D3).
 */
export function hashShapeId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministic seeded pseudorandom generator (Mulberry32).
 * Zero Math.random(), 100% byte-identical renders (R-021).
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a cubic bezier segment with natural hand-drawn bowing and tremor between two points.
 */
function wavySegment(x1: number, y1: number, x2: number, y2: number, rng: () => number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);

  if (length < 4) {
    return `L ${fmt(x2)} ${fmt(y2)}`;
  }

  const nx = -dy / length;
  const ny = dx / length;
  // Natural human hand tremor and slight bowing (noticeable amplitude)
  const maxAmp = Math.min(3.0, Math.max(1.0, length * 0.022));

  const bow = (rng() - 0.48) * 1.8 * maxAmp;
  const tremor1 = (rng() - 0.5) * 1.4 * maxAmp;
  const tremor2 = (rng() - 0.5) * 1.4 * maxAmp;

  const c1x = x1 + dx * 0.33 + nx * (bow + tremor1);
  const c1y = y1 + dy * 0.33 + ny * (bow + tremor1);
  const c2x = x1 + dx * 0.67 + nx * (bow + tremor2);
  const c2y = y1 + dy * 0.67 + ny * (bow + tremor2);

  return `C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(x2)} ${fmt(y2)}`;
}

/**
 * Generates an imperfect hand-drawn rectangle with non-parallel edges and corner overshoots.
 */
export function generateHandDrawnRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radii: CornerRadii,
  rng: () => number,
): string {
  const hasRoundedCorners = radii.tl > 0 || radii.tr > 0 || radii.br > 0 || radii.bl > 0;

  // Slight deterministic drift on the 4 corner coordinates (non-parallel edges)
  const drift = (scale = 1.6) => (rng() - 0.5) * scale;
  const p0 = { x: x + drift(), y: y + drift() };
  const p1 = { x: x + width + drift(), y: y + drift() };
  const p2 = { x: x + width + drift(), y: y + height + drift() };
  const p3 = { x: x + drift(), y: y + height + drift() };

  if (!hasRoundedCorners) {
    // Sharp rectangle: 4 strokes with natural corner overshoots (Image 2)
    const os = Math.min(4.0, Math.max(1.8, Math.min(width, height) * 0.05));
    const top = `M ${fmt(p0.x - os)} ${fmt(p0.y)} ${wavySegment(p0.x - os, p0.y, p1.x + os, p1.y, rng)}`;
    const right = `M ${fmt(p1.x)} ${fmt(p1.y - os)} ${wavySegment(p1.x, p1.y - os, p2.x, p2.y + os, rng)}`;
    const bottom = `M ${fmt(p2.x + os)} ${fmt(p2.y)} ${wavySegment(p2.x + os, p2.y, p3.x - os, p3.y, rng)}`;
    const left = `M ${fmt(p3.x)} ${fmt(p3.y + os)} ${wavySegment(p3.x, p3.y + os, p0.x, p0.y - os, rng)}`;
    return `${top} ${right} ${bottom} ${left}`;
  }

  // Rounded rectangle with asymmetric corner radii and organic curved transitions
  const tl = Math.max(2, radii.tl + drift(2.0));
  const tr = Math.max(2, radii.tr + drift(2.0));
  const br = Math.max(2, radii.br + drift(2.0));
  const bl = Math.max(2, radii.bl + drift(2.0));

  const start = `M ${fmt(p0.x + tl)} ${fmt(p0.y)}`;
  const topEdge = wavySegment(p0.x + tl, p0.y, p1.x - tr, p1.y, rng);
  const trCorner = `A ${fmt(tr)} ${fmt(tr)} 0 0 1 ${fmt(p1.x)} ${fmt(p1.y + tr)}`;
  const rightEdge = wavySegment(p1.x, p1.y + tr, p2.x, p2.y - br, rng);
  const brCorner = `A ${fmt(br)} ${fmt(br)} 0 0 1 ${fmt(p2.x - br)} ${fmt(p2.y)}`;
  const bottomEdge = wavySegment(p2.x - br, p2.y, p3.x + bl, p3.y, rng);
  const blCorner = `A ${fmt(bl)} ${fmt(bl)} 0 0 1 ${fmt(p3.x)} ${fmt(p3.y - bl)}`;
  const leftEdge = wavySegment(p3.x, p3.y - bl, p0.x, p0.y + tl, rng);
  const tlCorner = `A ${fmt(tl)} ${fmt(tl)} 0 0 1 ${fmt(p0.x + tl)} ${fmt(p0.y)}`;

  return `${start} ${topEdge} ${trCorner} ${rightEdge} ${brCorner} ${bottomEdge} ${blCorner} ${leftEdge} ${tlCorner} Z`;
}

/**
 * Custom SVG renderer for hand-drawn marker rectangles, cards, and buttons (Image 2).
 */
export function renderHandDrawnRect(shape: Shape, box: BoundingBox): string {
  const seed = hashShapeId(shape.id);
  const rng = createSeededRandom(seed);
  const radii = resolveShapeCornerRadii(shape, box);
  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, DEFAULT_MARKER_STROKE_WIDTH);
  const fillOpacityAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";

  const pathD = generateHandDrawnRectPath(
    num(box.x),
    num(box.y),
    num(box.width, 1),
    num(box.height, 1),
    radii,
    rng,
  );

  const isClosed = pathD.includes("Z");
  if (!isClosed && fill !== "none") {
    // Underlay a subtle closed path for filling non-closed overshoot boxes
    const fillPath = `M ${fmt(box.x)} ${fmt(box.y)} L ${fmt(box.x + box.width)} ${fmt(box.y)} L ${fmt(box.x + box.width)} ${fmt(box.y + box.height)} L ${fmt(box.x)} ${fmt(box.y + box.height)} Z`;
    return `${buildScopedTextStyle(shape)}${defs ?? ""}<path d="${fillPath}" fill="${fill}"${fillOpacityAttr} stroke="none" /><path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
  }

  return `${buildScopedTextStyle(shape)}${defs ?? ""}<path d="${pathD}" fill="${fill}"${fillOpacityAttr} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/**
 * Custom SVG renderer for hand-drawn marker ellipses and circles (Image 2).
 * Drawn as two slightly asymmetric overlapping curved arcs with sketch overshoots.
 */
export function renderHandDrawnEllipse(shape: Shape, box: BoundingBox): string {
  const seed = hashShapeId(shape.id);
  const rng = createSeededRandom(seed);
  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, DEFAULT_MARKER_STROKE_WIDTH);
  const fillOpacityAttr = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";

  const cx = box.x + box.width / 2 + (rng() - 0.5) * 1.5;
  const cy = box.y + box.height / 2 + (rng() - 0.5) * 1.5;
  const rx = Math.max(2, box.width / 2 + (rng() - 0.5) * 1.5);
  const ry = Math.max(2, box.height / 2 + (rng() - 0.5) * 1.5);
  const kappa = 0.5522847498307936;

  // Asymmetrical quad wobble for human sketch feel
  const d0 = (rng() - 0.5) * 2.2;
  const d1 = (rng() - 0.5) * 2.2;
  const d2 = (rng() - 0.5) * 2.2;
  const d3 = (rng() - 0.5) * 2.2;

  const topX = cx + d0;
  const topY = cy - ry;
  const rightX = cx + rx;
  const rightY = cy + d1;
  const bottomX = cx - d2;
  const bottomY = cy + ry;
  const leftX = cx - rx;
  const leftY = cy - d3;

  const pathD = [
    `M ${fmt(topX)} ${fmt(topY)}`,
    `C ${fmt(topX + rx * kappa)} ${fmt(topY)}, ${fmt(rightX)} ${fmt(rightY - ry * kappa)}, ${fmt(rightX)} ${fmt(rightY)}`,
    `C ${fmt(rightX)} ${fmt(rightY + ry * kappa)}, ${fmt(bottomX + rx * kappa)} ${fmt(bottomY)}, ${fmt(bottomX)} ${fmt(bottomY)}`,
    `C ${fmt(bottomX - rx * kappa)} ${fmt(bottomY)}, ${fmt(leftX)} ${fmt(leftY + ry * kappa)}, ${fmt(leftX)} ${fmt(leftY)}`,
    `C ${fmt(leftX)} ${fmt(leftY - ry * kappa)}, ${fmt(topX - rx * kappa)} ${fmt(topY)}, ${fmt(topX + d1)} ${fmt(topY + 1)}`,
    "Z",
  ].join(" ");

  return `${buildScopedTextStyle(shape)}${defs ?? ""}<path d="${pathD}" fill="${fill}"${fillOpacityAttr} stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/**
 * Custom SVG renderer for hand-drawn marker lines (Image 2).
 */
export function renderHandDrawnLine(shape: Shape, box: BoundingBox): string {
  const line = shape as LineShape;
  const seed = hashShapeId(shape.id);
  const rng = createSeededRandom(seed);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, DEFAULT_MARKER_STROKE_WIDTH);

  // Slight endpoint overshoot for hand-drawn line feel
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const len = Math.hypot(dx, dy);
  const ux = len > 0 ? dx / len : 0;
  const uy = len > 0 ? dy / len : 0;
  const os = Math.min(3.0, len * 0.04);

  const x1 = num(box.x + line.start.x - ux * os);
  const y1 = num(box.y + line.start.y - uy * os);
  const x2 = num(box.x + line.end.x + ux * os);
  const y2 = num(box.y + line.end.y + uy * os);

  const seg = wavySegment(x1, y1, x2, y2, rng);
  const pathD = `M ${fmt(x1)} ${fmt(y1)} ${seg}`;

  return `<path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/**
 * Custom SVG renderer for hand-drawn marker pen paths (freestyle polylines).
 */
export function renderHandDrawnPenPath(shape: Shape, box: BoundingBox): string {
  const pen = shape as PenPathShape;
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, DEFAULT_MARKER_STROKE_WIDTH);
  const fill = escapeXml(shape.fill ?? "none");

  if (!pen.points || pen.points.length === 0) return "";
  const pointsStr = pen.points.map((p) => `${fmt(box.x + p.x)},${fmt(box.y + p.y)}`).join(" ");

  return `<polyline points="${pointsStr}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}

/**
 * Custom SVG renderer for hand-drawn marker text elements.
 */
export function renderHandDrawnText(shape: Shape, box: BoundingBox): string {
  const styleTag = buildScopedTextStyle(shape);
  if (shape.fill !== undefined && shape.fill !== "none" && shape.fill !== "transparent") {
    return renderHandDrawnRect(shape, box);
  }
  return styleTag;
}
