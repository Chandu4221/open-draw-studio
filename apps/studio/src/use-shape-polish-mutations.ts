import type { Command, Shape } from "@open-draw/canvas";
import { COMMANDS } from "@open-draw/canvas";
import {
  PLUGIN_BORDER_RADIUS,
  PLUGIN_TYPOGRAPHY,
  type ShapeBorderRadius,
  type TypographyVariant,
} from "./renderers/wireframe-renderers";

export interface ShapePolishMutationsProps {
  readonly selectedShape: Shape | undefined;
  readonly commit: (commands: readonly Command[]) => void;
  readonly render: () => void;
}

export interface ShapePolishMutations {
  readonly handleBorderRadiusChange: (radius: ShapeBorderRadius | null) => void;
  readonly handleTypographyChange: (typography: TypographyVariant | null) => void;
}

export function useShapePolishMutations(props: ShapePolishMutationsProps): ShapePolishMutations {
  const { selectedShape, commit, render } = props;

  function handleBorderRadiusChange(radius: ShapeBorderRadius | null): void {
    if (!selectedShape) return;
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: selectedShape.id,
        pluginId: PLUGIN_BORDER_RADIUS,
        data: radius,
      },
    ]);
    render();
  }

  function handleTypographyChange(typography: TypographyVariant | null): void {
    if (!selectedShape) return;
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: selectedShape.id,
        pluginId: PLUGIN_TYPOGRAPHY,
        data: typography,
      },
    ]);
    render();
  }

  return {
    handleBorderRadiusChange,
    handleTypographyChange,
  };
}
