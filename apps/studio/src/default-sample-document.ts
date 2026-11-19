import { createDocument, type Document, type Shape } from "@open-draw/canvas";
import { SAMPLE_NAV_SHAPES } from "./default-sample-shapes-nav";
import { SAMPLE_HERO_SHAPES } from "./default-sample-shapes-hero";
import { SAMPLE_STYLES_SHAPES } from "./default-sample-shapes-styles";
import { SAMPLE_FEATURES_SHAPES } from "./default-sample-shapes-features";
import { SAMPLE_CTA_SHAPES } from "./default-sample-shapes-cta";

export const DEFAULT_SAMPLE_AI_DIRECTIVES: readonly string[] = [
  "- **Creativity Level**: Level 3 — Balanced",
  "- **Directive**: Interpret the wireframe using standard UX best practices. Preserve all core components and structure while implementing essential missing states \\(e.g. hover states, loading skeletons, error indicators, empty states\\).",
  "- **Accessibility & Contrast (WCAG 2.1 AA)**:",
  "  - Maintain minimum 4.5:1 text-to-background contrast ratio (3:1 for large text). Validate palette pairings via tools like colorcontrast.cc.",
  "  - Interactive elements must maintain minimum 44×44px touch targets (48×48dp on mobile) and clearly visible focus rings for keyboard navigation.",
  "  - Provide semantic ARIA landmarks (header, nav, main, aside, footer) and descriptive labels on all interactive controls.",
  "- **Semantic Context & Slot Inference (Smart Semantics)**:",
  "  - Child elements inherit semantic roles from their tagged parent container. For example, text and icons nested within a navigation bar, tab row, or app bar represent navigation items; children inside a card, list item, or dialog represent header, media, body, and actions in document order.",
  "  - Do not render untagged child shapes as raw unstyled containers — map them directly into the parent component's idiomatic slots and sub-elements.",
  "- **Theme Architecture (Single Light Mode)**:",
  "  - Implement a clean single Light theme mode.",
  "- **Stack Guidance (Web)**: Detect and adapt to the host project's environment (e.g. React, Vue, Svelte, Angular, plain HTML/CSS, Tailwind, CSS Modules) using package.json and project configuration. When no framework is detected, output clean, semantic HTML5 and CSS. Ensure responsive layout behavior across device classes.",
];

/**
 * Default sample OpenDraw Studio Landing Page document pre-loaded on a fresh studio canvas.
 * Dogfoods OpenDraw Studio's own frontpage wireframe with 31 shapes and N-level nesting.
 */
export function createDefaultSampleDocument(): Document {
  const shapes: readonly Shape[] = [
    ...SAMPLE_NAV_SHAPES,
    ...SAMPLE_HERO_SHAPES,
    ...SAMPLE_STYLES_SHAPES,
    ...SAMPLE_FEATURES_SHAPES,
    ...SAMPLE_CTA_SHAPES,
  ];

  return createDocument(shapes);
}
