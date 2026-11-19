// Studio wireframe plugin contracts and identifiers (R-044, ADR-0003 D4).
import { parsePluginId, type PluginId, type Shape } from "@open-draw/canvas";
import type { DeviceType, SemanticTag } from "@open-draw/profiles";

export const PLUGIN_SEMANTICS: PluginId = parsePluginId("open-draw:semantics");
export const PLUGIN_ROOT_PLATFORM: PluginId = parsePluginId("open-draw:root-platform");
export const PLUGIN_ROOT_ROLE: PluginId = parsePluginId("open-draw:root-role");
export const PLUGIN_DESIGN_STYLE: PluginId = parsePluginId("open-draw:design-style");
export const PLUGIN_THEME: PluginId = parsePluginId("open-draw:theme");
export const PLUGIN_DARK_MODE: PluginId = parsePluginId("open-draw:dark-mode");
export const PLUGIN_ROOT_STYLE: PluginId = parsePluginId("open-draw:root-style");
export const PLUGIN_RESPONSIVE: PluginId = parsePluginId("open-draw:responsive");

export interface ResponsivePluginData {
  readonly hiddenOn?: readonly DeviceType[] | undefined;
  readonly order?: Readonly<Record<string, number>> | undefined;
}

/**
 * Resolves the semantic tag from shape.meta.pluginData with fallback to shape.meta.semantic.
 */
export function getShapeSemantic(shape: Shape | undefined): SemanticTag | undefined {
  if (!shape) return undefined;
  const tag =
    (shape.meta.pluginData?.[PLUGIN_SEMANTICS] as SemanticTag | undefined | null) ??
    (shape.meta.semantic as SemanticTag | undefined | null);
  if (tag === null || tag === undefined) {
    return undefined;
  }
  return tag;
}

/**
 * Resolves responsive hiddenOn device types from pluginData or legacy meta.
 */
export function getShapeHiddenOn(shape: Shape | undefined): readonly DeviceType[] | undefined {
  if (!shape) return undefined;
  const responsive = shape.meta.pluginData?.[PLUGIN_RESPONSIVE] as ResponsivePluginData | undefined;
  if (responsive?.hiddenOn !== undefined) {
    return responsive.hiddenOn;
  }
  return (shape.meta as { hiddenOn?: readonly DeviceType[] }).hiddenOn;
}

/**
 * Resolves responsive order for a given deviceType (or default order) from pluginData or legacy meta.
 */
export function getShapeOrder(
  shape: Shape | undefined,
  deviceType?: DeviceType,
): number | undefined {
  if (!shape) return undefined;
  const responsive = shape.meta.pluginData?.[PLUGIN_RESPONSIVE] as ResponsivePluginData | undefined;
  if (deviceType !== undefined) {
    if (responsive?.order?.[deviceType] !== undefined) {
      return responsive.order[deviceType];
    }
    const legacy = (shape.meta as { order?: Readonly<Record<string, number>> }).order?.[deviceType];
    if (legacy !== undefined) return legacy;
  }
  if (responsive?.order?.default !== undefined) {
    return responsive.order.default;
  }
  return (shape.meta as { order?: Readonly<Record<string, number>> }).order?.default;
}
