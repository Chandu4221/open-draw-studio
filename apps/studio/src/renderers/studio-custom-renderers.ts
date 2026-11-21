// Studio custom renderers map for documentToSvg and createEditor (R-008, R-010, R-021).
// Pure functional dispatch between minimal wireframe, hand-drawn marker, and wax crayon rendering styles.
import type { BoundingBox, Document, Editor, Shape, ShapeSvgRenderer } from "@open-draw/canvas";
import { documentToSvg, SHAPE_KINDS } from "@open-draw/canvas";
import { STYLE_PROFILE_BY_VALUE, STYLE_PROFILES, type StyleId } from "@open-draw/profiles";
import { PLUGIN_ROOT_STYLE, resolveRootStyle } from "@open-draw/semantics";
import {
  renderCrayonEllipse,
  renderCrayonLine,
  renderCrayonPenPath,
  renderCrayonRect,
  renderCrayonText,
} from "./crayon-renderers";
import {
  renderHandDrawnEllipse,
  renderHandDrawnLine,
  renderHandDrawnPenPath,
  renderHandDrawnRect,
  renderHandDrawnText,
} from "./hand-drawn-renderers";
import {
  renderStandardEllipseSvg,
  renderStandardLineSvg,
  renderStandardPenPathSvg,
} from "./standard-renderers";
import { renderPolishedRect, renderPolishedText } from "./wireframe-renderers";

function resolveActiveStyle(shape: Shape, getDocument?: () => Document | undefined): StyleId {
  if (getDocument) {
    const doc = getDocument();
    if (doc) {
      return resolveRootStyle(doc, shape.id);
    }
  }
  const raw =
    (shape.meta.pluginData?.[PLUGIN_ROOT_STYLE] as string | undefined) ??
    (shape.meta.style as string | undefined);
  if (!raw) return STYLE_PROFILES.minimal;
  return STYLE_PROFILE_BY_VALUE[raw] ?? STYLE_PROFILES.minimal;
}

/**
 * Creates the Studio custom renderers map for documentToSvg and createEditor.
 */
export function createStudioCustomRenderers(
  getDocument?: () => Document | undefined,
): Readonly<Record<string, ShapeSvgRenderer>> {
  return Object.freeze({
    [SHAPE_KINDS.rect]: (shape: Shape, box: BoundingBox) => {
      const style = resolveActiveStyle(shape, getDocument);
      if (style === STYLE_PROFILES.handDrawn) return renderHandDrawnRect(shape, box);
      if (style === STYLE_PROFILES.crayon) return renderCrayonRect(shape, box);
      return renderPolishedRect(shape, box);
    },
    [SHAPE_KINDS.ellipse]: (shape: Shape, box: BoundingBox) => {
      const style = resolveActiveStyle(shape, getDocument);
      if (style === STYLE_PROFILES.handDrawn) return renderHandDrawnEllipse(shape, box);
      if (style === STYLE_PROFILES.crayon) return renderCrayonEllipse(shape, box);
      return renderStandardEllipseSvg(shape, box);
    },
    [SHAPE_KINDS.line]: (shape: Shape, box: BoundingBox) => {
      const style = resolveActiveStyle(shape, getDocument);
      if (style === STYLE_PROFILES.handDrawn) return renderHandDrawnLine(shape, box);
      if (style === STYLE_PROFILES.crayon) return renderCrayonLine(shape, box);
      return renderStandardLineSvg(shape, box);
    },
    [SHAPE_KINDS.penPath]: (shape: Shape, box: BoundingBox) => {
      const style = resolveActiveStyle(shape, getDocument);
      if (style === STYLE_PROFILES.handDrawn) return renderHandDrawnPenPath(shape, box);
      if (style === STYLE_PROFILES.crayon) return renderCrayonPenPath(shape, box);
      return renderStandardPenPathSvg(shape, box);
    },
    [SHAPE_KINDS.text]: (shape: Shape, box: BoundingBox) => {
      const style = resolveActiveStyle(shape, getDocument);
      if (style === STYLE_PROFILES.handDrawn) return renderHandDrawnText(shape, box);
      if (style === STYLE_PROFILES.crayon) return renderCrayonText(shape, box);
      return renderPolishedText(shape, box);
    },
  });
}

/**
 * Forces complete re-rendering of the canvas document scene with active studio custom renderers.
 * Ensures children immediately reflect inherited root styles (R-021, R-026) without requiring pan/zoom gestures.
 */
export function refreshDocumentScene(editor: Editor | null): void {
  if (!editor) return;
  editor.render();
  const docScene = editor.svg.querySelector(".od-document-scene");
  if (docScene) {
    const currentDoc = editor.getDocument();
    docScene.innerHTML = documentToSvg(currentDoc, {
      customRenderers: createStudioCustomRenderers(() => currentDoc),
      wrapShapeId: true,
      instanceId: editor.canvas.getInstanceId(),
    });
  }
}
