import { describe, expect, it } from "vitest";
import { ROOT_ID, SHAPE_KINDS, type ShapeId } from "@open-draw/canvas";
import { PLATFORMS } from "@open-draw/profiles";
import {
  PLUGIN_DESIGN_STYLE,
  PLUGIN_ROOT_PLATFORM,
  PLUGIN_ROOT_ROLE,
  ROOT_ROLES,
  getShapeSemantic,
} from "@open-draw/semantics";
import { createDefaultSampleDocument } from "./default-sample-document.js";
import { normalizeStudioDocument } from "./normalize-document.js";
import { computeInspectionData } from "./use-inspection-data.js";

describe("createDefaultSampleDocument", () => {
  it("creates a valid document containing the 27 sample landing page wireframe shapes", () => {
    const doc = createDefaultSampleDocument();
    expect(doc.schema.version).toBe(1);
    expect(Object.keys(doc.shapes)).toHaveLength(27);
  });

  it("configures the root landing page shape with screen role, web platform, and brutalism style", () => {
    const doc = createDefaultSampleDocument();
    const root = doc.shapes["s-7a07" as ShapeId];
    expect(root).toBeDefined();
    expect(root?.kind).toBe(SHAPE_KINDS.rect);
    expect(root?.parentId).toBe(ROOT_ID);
    expect(root?.label).toBe("OpenDraw Studio Landing Page");
    expect(root?.meta.role).toBe(ROOT_ROLES.screen);
    expect(root?.meta.platform).toBe(PLATFORMS.web);
    expect(root?.meta.isContainer).toBe(true);
    expect(root?.meta.pluginData?.[PLUGIN_ROOT_PLATFORM]).toBe("web");
    expect(root?.meta.pluginData?.[PLUGIN_ROOT_ROLE]).toBe("screen");
    expect(root?.meta.pluginData?.[PLUGIN_DESIGN_STYLE]).toBe("brutalism");
  });

  it("nests top-level sections (navbar, hero, styles, pillars) under the root", () => {
    const doc = createDefaultSampleDocument();
    const sectionIds: ShapeId[] = [
      "s-7a09" as ShapeId, // navbar
      "s-7a11" as ShapeId, // hero
      "s-504a05" as ShapeId, // styles section
      "s-7a29" as ShapeId, // pillars section
    ];

    for (const id of sectionIds) {
      const shape = doc.shapes[id];
      expect(shape).toBeDefined();
      expect(shape?.parentId).toBe("s-7a07" as ShapeId);
      expect(shape?.meta.isContainer).toBe(true);
    }

    expect(getShapeSemantic(doc.shapes["s-7a09" as ShapeId]!)?.id).toBe("navbar");
    expect(getShapeSemantic(doc.shapes["s-7a11" as ShapeId]!)?.id).toBe("section");
    expect(getShapeSemantic(doc.shapes["s-504a05" as ShapeId]!)?.id).toBe("section");
    expect(getShapeSemantic(doc.shapes["s-7a29" as ShapeId]!)?.id).toBe("section");
    expect(doc.shapes["s-7a37" as ShapeId]).toBeUndefined();
  });

  it("supports N-level deep nesting across sections, cards, and content elements", () => {
    const doc = createDefaultSampleDocument();

    // Level 1: Root s-7a07
    // Level 2: Pillars Section s-7a29
    // Level 3: Card s-7a2b
    const card = doc.shapes["s-7a2b" as ShapeId];
    expect(card).toBeDefined();
    expect(card?.parentId).toBe("s-7a29" as ShapeId);
    expect(card?.meta.isContainer).toBe(true);
    expect(getShapeSemantic(card!)?.id).toBe("card");

    // Level 4: Header Text inside Card s-7a2c
    const headerText = doc.shapes["s-7a2c" as ShapeId];
    expect(headerText).toBeDefined();
    expect(headerText?.parentId).toBe("s-7a2b" as ShapeId);
    expect(headerText?.content).toBe("Draw on a real canvas");
    expect(getShapeSemantic(headerText!)?.id).toBe("heading");

    // Level 4: Body Text inside Card s-7a2d with explicit text semantics
    const bodyText = doc.shapes["s-7a2d" as ShapeId];
    expect(bodyText).toBeDefined();
    expect(bodyText?.parentId).toBe("s-7a2b" as ShapeId);
    expect(bodyText?.content).toBe("Build layouts with shapes, hierarchy, and structure.");
    expect(getShapeSemantic(bodyText!)?.id).toBe("text");
  });

  it("contains the style switcher section with segmented control and description", () => {
    const doc = createDefaultSampleDocument();
    const section = doc.shapes["s-504a05" as ShapeId];
    expect(section).toBeDefined();
    expect(section?.parentId).toBe("s-7a07" as ShapeId);

    const title = doc.shapes["s-504a07" as ShapeId];
    expect(title?.content).toBe("Experience This WebPage in Different Design Styles");
    expect(title?.parentId).toBe("s-504a05" as ShapeId);

    const control = doc.shapes["s-504a06" as ShapeId];
    expect(control?.content).toBe("Style Switcher Segmented Buttons");
    expect(getShapeSemantic(control!)?.id).toBe("segmented-control");
    expect(control?.parentId).toBe("s-504a05" as ShapeId);

    const subtitle = doc.shapes["s-504a08" as ShapeId];
    expect(subtitle?.content).toBe("Same content. Same structure. Different visual languages.");
    expect(subtitle?.parentId).toBe("s-504a05" as ShapeId);
  });

  it("contains hero section with updated copy and tagline", () => {
    const doc = createDefaultSampleDocument();
    const heading = doc.shapes["s-7a14" as ShapeId];
    expect(heading?.content).toBe("Draw what you imagine. Give it meaning. Build with AI.");

    const subhead = doc.shapes["s-7a12" as ShapeId];
    expect(subhead?.content).toContain("OpenDraw is a visual design canvas");

    const tagline = doc.shapes["s-504a01" as ShapeId];
    expect(tagline?.content).toBe("Simple by default. Powerful by intention.");
    expect(tagline?.parentId).toBe("s-7a11" as ShapeId);
  });

  it("normalizes and computes inspection data for the initial document without throwing", () => {
    const rawDoc = createDefaultSampleDocument();
    const doc = normalizeStudioDocument(rawDoc);
    expect(doc).toBeDefined();

    // Initial unselected state (what renders when opening studio)
    const inspection = computeInspectionData(doc, null, undefined);
    expect(inspection.rootShape).toBeUndefined();
    expect(inspection.treeNodes.length).toBeGreaterThan(0);

    // Selected root screen state
    const rootInspection = computeInspectionData(doc, "s-7a07" as ShapeId, undefined);
    expect(rootInspection.rootShape?.id).toBe("s-7a07");
    expect(rootInspection.rootPlatform).toBe("web");
    expect(rootInspection.treeNodes.length).toBe(27);
  });
});
