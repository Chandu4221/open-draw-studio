// Standard wireframe fallback SVG renderers for ellipse, line, penPath (R-008, R-010, R-021).
import type { BoundingBox, LineShape, PenPathShape, Shape } from "@open-draw/canvas";
import { resolveWireframeFill, WIREFRAME_PALETTE } from "./wireframe-renderers";

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
 * Standard SVG renderer for wireframe ellipses in minimal mode.
 */
export function renderStandardEllipseSvg(shape: Shape, box: BoundingBox): string {
  const { fill, fillOpacity, defs } = resolveWireframeFill(shape);
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const sw = shape.strokeWidth !== undefined ? ` stroke-width="${num(shape.strokeWidth, 1)}"` : "";
  const op = fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : "";
  const cx = num(box.x + box.width / 2);
  const cy = num(box.y + box.height / 2);
  const rx = num(box.width / 2, 1);
  const ry = num(box.height / 2, 1);
  return `${defs ?? ""}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}"${sw}${op} />`;
}

/**
 * Standard SVG renderer for wireframe lines in minimal mode.
 */
export function renderStandardLineSvg(shape: Shape, box: BoundingBox): string {
  const line = shape as LineShape;
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, 2);
  return `<line x1="${num(box.x + line.start.x)}" y1="${num(box.y + line.start.y)}" x2="${num(box.x + line.end.x)}" y2="${num(box.y + line.end.y)}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
}

/**
 * Standard SVG renderer for wireframe freestyle pen paths in minimal mode.
 */
export function renderStandardPenPathSvg(shape: Shape, box: BoundingBox): string {
  const pen = shape as PenPathShape;
  const pointsStr = pen.points
    ? pen.points.map((p) => `${num(box.x + p.x)},${num(box.y + p.y)}`).join(" ")
    : "";
  const stroke = escapeXml(shape.stroke ?? WIREFRAME_PALETTE.borderDark);
  const strokeWidth = num(shape.strokeWidth, 2);
  const fill = escapeXml(shape.fill ?? "none");
  return `<polyline points="${pointsStr}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
}
