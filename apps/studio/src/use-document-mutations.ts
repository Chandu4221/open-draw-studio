import type { Command, FillStyle, Shape } from "@open-draw/canvas";
import { COMMANDS, isRootId } from "@open-draw/canvas";
import type {
  DesignStyleId,
  DeviceType,
  PlatformId,
  PlatformProfile,
  StyleId,
} from "@open-draw/profiles";
import { PLATFORM_PROFILES } from "@open-draw/profiles";
import {
  PLUGIN_DESIGN_STYLE,
  PLUGIN_RESPONSIVE,
  PLUGIN_ROOT_PLATFORM,
  PLUGIN_ROOT_ROLE,
  PLUGIN_ROOT_STYLE,
  PLUGIN_SEMANTICS,
  getShapeHiddenOn,
  getShapeSemantic,
  type ResponsivePluginData,
  type RootRole,
} from "@open-draw/semantics";

export interface DocumentMutationsProps {
  readonly selectedShape: Shape | undefined;
  readonly rootShape: Shape | undefined;
  readonly activeProfile: PlatformProfile | undefined;
  readonly activeDeviceType: DeviceType | undefined;
  readonly setActiveDeviceType: (dt: DeviceType | undefined) => void;
  readonly commit: (
    commands: readonly Command[],
    options?: { record?: boolean; customInverse?: readonly Command[] },
  ) => void;
  readonly render: () => void;
}

export interface DocumentMutations {
  readonly handleSetPlatform: (platform: PlatformId | "") => void;
  readonly handleSetStyle: (style: StyleId) => void;
  readonly handleSetDesignStyle: (designStyle: DesignStyleId | "") => void;
  readonly handleSetRole: (role: RootRole | "") => void;
  readonly handleSetLabel: (
    labelStr: string,
    options?: { record?: boolean; startVal?: string | null },
  ) => void;
  readonly handleSetContent: (
    contentStr: string,
    options?: { record?: boolean; startVal?: string | null },
  ) => void;
  readonly handleSetSemantic: (semanticIdStr: string) => void;
  readonly handlePropertyChange: (propId: string, val: string | number | boolean) => void;
  readonly handleToggleHiddenOn: (dt: DeviceType) => void;
  readonly handleOrderChange: (dt: DeviceType, valStr: string) => void;
  readonly handleStyleChange: (
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    fillStyle?: FillStyle | null,
  ) => void;
  readonly handleStylePreview: (
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    fillStyle?: FillStyle | null,
  ) => void;
  readonly handleStyleCommit: (
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    startStyle?: {
      fill?: string | null;
      stroke?: string | null;
      strokeWidth?: number | null;
      fillStyle?: FillStyle | null;
    },
    fillStyle?: FillStyle | null,
  ) => void;
}

export function useDocumentMutations(props: DocumentMutationsProps): DocumentMutations {
  const { selectedShape, rootShape, activeDeviceType, setActiveDeviceType, commit, render } = props;

  function handleSetPlatform(platform: PlatformId | ""): void {
    const targetRoot =
      selectedShape && isRootId(selectedShape.parentId) ? selectedShape : rootShape;
    if (!targetRoot) return;
    const targetPlatform = platform ? platform : null;
    const currentDesignStyle =
      (targetRoot.meta.pluginData?.[PLUGIN_DESIGN_STYLE] as DesignStyleId | undefined) ??
      targetRoot.meta.designStyle;
    if (targetPlatform === null && currentDesignStyle !== undefined) {
      commit([
        {
          type: COMMANDS.setShapePluginData,
          id: targetRoot.id,
          pluginId: PLUGIN_ROOT_PLATFORM,
          data: null,
        },
        {
          type: COMMANDS.setShapePluginData,
          id: targetRoot.id,
          pluginId: PLUGIN_DESIGN_STYLE,
          data: null,
        },
      ]);
    } else {
      commit([
        {
          type: COMMANDS.setShapePluginData,
          id: targetRoot.id,
          pluginId: PLUGIN_ROOT_PLATFORM,
          data: targetPlatform,
        },
      ]);
    }
    const nextProfile = targetPlatform !== null ? PLATFORM_PROFILES[targetPlatform] : undefined;
    if (
      activeDeviceType !== undefined &&
      (nextProfile?.deviceTypes === undefined ||
        !nextProfile.deviceTypes.includes(activeDeviceType))
    ) {
      setActiveDeviceType(undefined);
    }
    render();
  }

  function handleSetStyle(style: StyleId): void {
    const targetRoot =
      selectedShape && isRootId(selectedShape.parentId) ? selectedShape : rootShape;
    if (!targetRoot) return;
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: targetRoot.id,
        pluginId: PLUGIN_ROOT_STYLE,
        data: style,
      },
    ]);
    render();
  }

  function handleSetDesignStyle(designStyle: DesignStyleId | ""): void {
    const targetRoot =
      selectedShape && isRootId(selectedShape.parentId) ? selectedShape : rootShape;
    if (!targetRoot) return;
    const nextDesignStyle = designStyle ? designStyle : null;
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: targetRoot.id,
        pluginId: PLUGIN_DESIGN_STYLE,
        data: nextDesignStyle,
      },
    ]);
    render();
  }

  function handleSetRole(role: RootRole | ""): void {
    const targetRoot =
      selectedShape && isRootId(selectedShape.parentId) ? selectedShape : rootShape;
    if (!targetRoot) return;
    const nextRole = role ? (role as RootRole) : null;
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: targetRoot.id,
        pluginId: PLUGIN_ROOT_ROLE,
        data: nextRole,
      },
    ]);
    render();
  }

  function handleSetLabel(
    labelStr: string,
    options?: { record?: boolean; startVal?: string | null },
  ): void {
    if (!selectedShape) return;
    const label = labelStr.trim().length === 0 ? null : labelStr;
    const commitOpts: { record?: boolean; customInverse?: readonly Command[] } = {};
    if (options?.record !== undefined) commitOpts.record = options.record;
    if (options?.startVal !== undefined) {
      commitOpts.customInverse = [
        { type: COMMANDS.setShapeLabel, id: selectedShape.id, label: options.startVal },
      ];
    }
    commit([{ type: COMMANDS.setShapeLabel, id: selectedShape.id, label }], commitOpts);
    render();
  }

  function handleSetContent(
    contentStr: string,
    options?: { record?: boolean; startVal?: string | null },
  ): void {
    if (!selectedShape) return;
    const content = contentStr.trim().length === 0 ? null : contentStr;
    const commitOpts: { record?: boolean; customInverse?: readonly Command[] } = {};
    if (options?.record !== undefined) commitOpts.record = options.record;
    if (options?.startVal !== undefined) {
      commitOpts.customInverse = [
        { type: COMMANDS.setShapeContent, id: selectedShape.id, content: options.startVal },
      ];
    }
    commit([{ type: COMMANDS.setShapeContent, id: selectedShape.id, content }], commitOpts);
    render();
  }

  function handleSetSemantic(semanticIdStr: string): void {
    if (!selectedShape) return;
    if (semanticIdStr.length === 0) {
      commit([
        {
          type: COMMANDS.setShapePluginData,
          id: selectedShape.id,
          pluginId: PLUGIN_SEMANTICS,
          data: null,
        },
      ]);
    } else {
      commit([
        {
          type: COMMANDS.setShapePluginData,
          id: selectedShape.id,
          pluginId: PLUGIN_SEMANTICS,
          data: { id: semanticIdStr },
        },
      ]);
    }
    render();
  }

  function handlePropertyChange(propId: string, val: string | number | boolean): void {
    const currentSemantic = getShapeSemantic(selectedShape);
    if (!selectedShape || !currentSemantic) return;
    const nextProps = { ...currentSemantic.properties, [propId]: val };
    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: selectedShape.id,
        pluginId: PLUGIN_SEMANTICS,
        data: { ...currentSemantic, properties: nextProps },
      },
    ]);
    render();
  }

  function handleToggleHiddenOn(dt: DeviceType): void {
    if (!selectedShape) return;
    const currentResponsive =
      (selectedShape.meta.pluginData?.[PLUGIN_RESPONSIVE] as ResponsivePluginData | undefined) ??
      {};
    const currentHiddenOn = getShapeHiddenOn(selectedShape) ?? [];
    const nextHiddenOn = currentHiddenOn.includes(dt)
      ? currentHiddenOn.filter((d) => d !== dt)
      : [...currentHiddenOn, dt];
    const nextResponsive: ResponsivePluginData = {
      ...(currentResponsive.order !== undefined ? { order: currentResponsive.order } : {}),
      ...(nextHiddenOn.length > 0 ? { hiddenOn: nextHiddenOn } : {}),
    };
    const hasData =
      (nextResponsive.hiddenOn !== undefined && nextResponsive.hiddenOn.length > 0) ||
      (nextResponsive.order !== undefined && Object.keys(nextResponsive.order).length > 0);

    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: selectedShape.id,
        pluginId: PLUGIN_RESPONSIVE,
        data: hasData ? nextResponsive : null,
      },
    ]);
    render();
  }

  function handleOrderChange(dt: DeviceType, valStr: string): void {
    if (!selectedShape) return;
    const currentResponsive =
      (selectedShape.meta.pluginData?.[PLUGIN_RESPONSIVE] as ResponsivePluginData | undefined) ??
      {};
    const currentOrder: Record<string, number> = {
      ...((selectedShape.meta as { order?: Readonly<Record<string, number>> }).order ?? {}),
      ...(currentResponsive.order ?? {}),
    };

    const trimmed = valStr.trim();
    if (trimmed.length === 0) {
      delete currentOrder[dt];
    } else {
      const order = Number(trimmed);
      if (!Number.isFinite(order)) return;
      currentOrder[dt] = order;
    }

    const nextResponsive: ResponsivePluginData = {
      ...(currentResponsive.hiddenOn !== undefined ? { hiddenOn: currentResponsive.hiddenOn } : {}),
      ...(Object.keys(currentOrder).length > 0 ? { order: currentOrder } : {}),
    };
    const hasData =
      (nextResponsive.hiddenOn !== undefined && nextResponsive.hiddenOn.length > 0) ||
      (nextResponsive.order !== undefined && Object.keys(nextResponsive.order).length > 0);

    commit([
      {
        type: COMMANDS.setShapePluginData,
        id: selectedShape.id,
        pluginId: PLUGIN_RESPONSIVE,
        data: hasData ? nextResponsive : null,
      },
    ]);
    render();
  }

  function handleStyleChange(
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    fillStyle?: FillStyle | null,
  ): void {
    if (!selectedShape) return;
    commit([
      { type: COMMANDS.setShapeStyle, id: selectedShape.id, fill, stroke, strokeWidth, fillStyle },
    ]);
    render();
  }

  function handleStylePreview(
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    fillStyle?: FillStyle | null,
  ): void {
    if (!selectedShape) return;
    commit(
      [
        {
          type: COMMANDS.setShapeStyle,
          id: selectedShape.id,
          fill,
          stroke,
          strokeWidth,
          fillStyle,
        },
      ],
      {
        record: false,
      },
    );
    render();
  }

  function handleStyleCommit(
    fill?: string | null,
    stroke?: string | null,
    strokeWidth?: number | null,
    startStyle?: {
      fill?: string | null;
      stroke?: string | null;
      strokeWidth?: number | null;
      fillStyle?: FillStyle | null;
    },
    fillStyle?: FillStyle | null,
  ): void {
    if (!selectedShape) return;
    const customInverse: readonly Command[] = [
      {
        type: COMMANDS.setShapeStyle,
        id: selectedShape.id,
        fill: fill !== undefined ? (startStyle?.fill ?? null) : undefined,
        stroke: stroke !== undefined ? (startStyle?.stroke ?? null) : undefined,
        strokeWidth: strokeWidth !== undefined ? (startStyle?.strokeWidth ?? null) : undefined,
        fillStyle: fillStyle !== undefined ? (startStyle?.fillStyle ?? null) : undefined,
      },
    ];
    commit(
      [
        {
          type: COMMANDS.setShapeStyle,
          id: selectedShape.id,
          fill,
          stroke,
          strokeWidth,
          fillStyle,
        },
      ],
      {
        record: true,
        customInverse,
      },
    );
    render();
  }

  return {
    handleSetPlatform,
    handleSetStyle,
    handleSetDesignStyle,
    handleSetRole,
    handleSetLabel,
    handleSetContent,
    handleSetSemantic,
    handlePropertyChange,
    handleToggleHiddenOn,
    handleOrderChange,
    handleStyleChange,
    handleStylePreview,
    handleStyleCommit,
  };
}
