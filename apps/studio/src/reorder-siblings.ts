// Sibling reordering commands generator (implements ADR-0004 D5, R-027).
// Generates atomic setShapePluginData transactions to reorder siblings deterministically.
import type { Command, Document, ShapeId } from "@open-draw/canvas";
import { COMMANDS } from "@open-draw/canvas";
import type { DeviceType } from "@open-draw/profiles";
import {
  PLUGIN_RESPONSIVE,
  sortSiblingShapes,
  type ResponsivePluginData,
} from "@open-draw/semantics";

export function buildSiblingReorderCommands(
  doc: Document,
  shapeId: ShapeId,
  direction: "up" | "down",
  activeDeviceType?: DeviceType,
): readonly Command[] | null {
  const targetShape = doc.shapes[shapeId];
  if (!targetShape) return null;

  const siblings = Object.values(doc.shapes).filter((s) => s.parentId === targetShape.parentId);
  if (siblings.length <= 1) return null;

  sortSiblingShapes(siblings, activeDeviceType);
  const currentIndex = siblings.findIndex((s) => s.id === shapeId);
  if (currentIndex === -1) return null;

  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return null;

  const reordered = [...siblings];
  const temp = reordered[currentIndex]!;
  reordered[currentIndex] = reordered[swapIndex]!;
  reordered[swapIndex] = temp;

  const targetKey = activeDeviceType ?? "default";
  const commands: Command[] = [];

  for (let i = 0; i < reordered.length; i++) {
    const s = reordered[i]!;
    const currentResponsive =
      (s.meta.pluginData?.[PLUGIN_RESPONSIVE] as ResponsivePluginData | undefined) ?? {};
    const currentOrder = {
      ...((s.meta as { order?: Readonly<Record<string, number>> }).order ?? {}),
      ...(currentResponsive.order ?? {}),
      [targetKey]: i * 10,
    };
    const nextResponsive: ResponsivePluginData = {
      ...(currentResponsive.hiddenOn !== undefined ? { hiddenOn: currentResponsive.hiddenOn } : {}),
      order: currentOrder,
    };
    commands.push({
      type: COMMANDS.setShapePluginData,
      id: s.id,
      pluginId: PLUGIN_RESPONSIVE,
      data: nextResponsive,
    });
  }

  return commands;
}
