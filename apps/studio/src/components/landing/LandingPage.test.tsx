import { describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LANDING_DESIGN_STYLES } from "./landing-styles.js";
import { LandingPage } from "./LandingPage.js";
import { LandingHero } from "./LandingHero.js";
import { LandingShowcase } from "./LandingShowcase.js";
import { LandingFeatures } from "./LandingFeatures.js";
import { LandingPillars } from "./LandingPillars.js";
import { LandingFooter } from "./LandingFooter.js";
import { LandingStyleSwitcher } from "./LandingStyleSwitcher.js";
import { LANDING_THEMES } from "./landing-themes.js";

describe("LandingPage", () => {
  it("renders the landing page with minimal style active by default", () => {
    const onLaunch = vi.fn();
    const html = renderToString(<LandingPage onLaunch={onLaunch} />);

    expect(html).toContain('data-landing-style="minimal"');
    expect(html).toContain("OpenDraw Studio");
    expect(html).not.toContain("v0.");
    expect(html).toContain("Draw what you imagine. Give it meaning. Build with AI.");
    expect(html).toContain(
      "OpenDraw is a visual design canvas that lets you sketch freely, add intent when needed, and give AI the context to turn your ideas into real interfaces.",
    );
    expect(html).toContain("Simple by default. Powerful by intention.");
    expect(html).toContain("Try OpenDraw");
    expect(html).toContain("From Wireframe to Production UI");
    expect(html).toContain("/assets/showcase/showcase-wireframe.png");
    expect(html).toContain("/assets/showcase/showcase-rendered.png");
    expect(html).toContain("Experience This WebPage in Different Design Styles");
    expect(html).toContain("Same content. Same structure. Different visual languages.");
    expect(html).toContain("More than shapes on a canvas.");
    expect(html).toContain("Draw on a real canvas");
    expect(html).not.toContain("Start drawing. Add meaning. Ship the interface.");
    expect(html).not.toContain("Open Draw is the canvas between visual design and working markup.");
  });

  it("renders with a custom initial design style when specified", () => {
    const onLaunch = vi.fn();
    const html = renderToString(
      <LandingPage onLaunch={onLaunch} initialStyle={LANDING_DESIGN_STYLES.brutalist} />,
    );

    expect(html).toContain('data-landing-style="brutalist"');
  });

  it("renders all 5 design styles distinctly", () => {
    const styles = [
      LANDING_DESIGN_STYLES.minimal,
      LANDING_DESIGN_STYLES.glass,
      LANDING_DESIGN_STYLES.editorial,
      LANDING_DESIGN_STYLES.brutalist,
      LANDING_DESIGN_STYLES.soft,
    ];

    for (const style of styles) {
      const html = renderToString(<LandingPage onLaunch={vi.fn()} initialStyle={style} />);
      expect(html).toContain(`data-landing-style="${style}"`);
    }
  });

  it("renders top navigation bar without design style switcher", () => {
    const onLaunch = vi.fn();
    const html = renderToString(<LandingPage onLaunch={onLaunch} />);

    const headerHtml = html.match(/<header[^>]*>([\s\S]*?)<\/header>/)?.[1] ?? "";
    expect(headerHtml).toContain("OpenDraw Studio");
    expect(headerHtml).toContain("Try OpenDraw");
    expect(headerHtml).not.toContain("STYLE:");
    expect(headerHtml).not.toContain('aria-label="Design Style Switcher"');
  });
});

describe("LandingHero", () => {
  it("renders the hero headline, kicker, and try open draw action", () => {
    const onLaunch = vi.fn();
    const theme = LANDING_THEMES.minimal;
    const html = renderToString(<LandingHero theme={theme} onLaunch={onLaunch} />);

    expect(html).toContain("Draw what you imagine. Give it meaning. Build with AI.");
    expect(html).toContain(
      "OpenDraw is a visual design canvas that lets you sketch freely, add intent when needed, and give AI the context to turn your ideas into real interfaces.",
    );
    expect(html).toContain("Simple by default. Powerful by intention.");
    expect(html).toContain("Try OpenDraw");
  });
});

describe("LandingFeatures", () => {
  it("renders style switcher section with title, switcher, and subtitle", () => {
    const theme = LANDING_THEMES.minimal;
    const onStyleChange = vi.fn();
    const html = renderToString(
      <LandingFeatures
        theme={theme}
        activeStyle={LANDING_DESIGN_STYLES.minimal}
        onStyleChange={onStyleChange}
      />,
    );

    expect(html).toContain("Experience This WebPage in Different Design Styles");
    expect(html).toContain("Same content. Same structure. Different visual languages.");
    expect(html).toContain("Minimal");
    expect(html).toContain("Glass");
    expect(html).toContain("Editorial");
    expect(html).toContain("Brutalist");
    expect(html).toContain("Soft");
  });
});

describe("LandingPillars", () => {
  it("renders the four numbered capabilities matching the wireframe", () => {
    const theme = LANDING_THEMES.minimal;
    const html = renderToString(<LandingPillars theme={theme} />);

    expect(html).toContain("More than shapes on a canvas.");
    expect(html).toContain("01 —");
    expect(html).toContain("Draw on a real canvas");
    expect(html).toContain("Build layouts with shapes, hierarchy, and structure.");
    expect(html).toContain("02 —");
    expect(html).toContain("Tag components with meaning");
    expect(html).toContain("Mark what each element is—button, nav, form, screen.");
    expect(html).toContain("03 —");
    expect(html).toContain("Export structured markup");
    expect(html).toContain("Turn the document into specs and frontend-ready output.");
    expect(html).toContain("04 —");
    expect(html).toContain("Swap styles without redrawing");
    expect(html).toContain("Explore visual languages on the same underlying structure.");
  });
});

describe("LandingFooter", () => {
  it("renders centered made with love with a11y label and without opendraw or npm link", () => {
    const theme = LANDING_THEMES.minimal;
    const html = renderToString(<LandingFooter theme={theme} />);

    expect(html).toContain("MADE WITH LOVE");
    expect(html).toContain('role="img" aria-label="love"');
    expect(html).not.toContain("OpenDraw");
    expect(html).not.toContain("npm");
    expect(html).not.toContain("GitHub");
    expect(html).not.toContain("MIT License");
  });
});

describe("LandingStyleSwitcher", () => {
  it("marks the active style with aria-pressed attribute", () => {
    const theme = LANDING_THEMES.glass;
    const onStyleChange = vi.fn();
    const html = renderToString(
      <LandingStyleSwitcher
        theme={theme}
        activeStyle={LANDING_DESIGN_STYLES.glass}
        onStyleChange={onStyleChange}
      />,
    );

    expect(html).toContain('aria-label="Design Style Switcher"');
    expect(html).not.toContain("Style:");
    expect(html).not.toContain("STYLE:");
    // Button for Glass should be aria-pressed="true"
    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>\s*Glass\s*<\/button>/);
  });
});

describe("LandingShowcase", () => {
  it("renders the wireframe-to-rendered UI comparison with both images and captions", () => {
    const theme = LANDING_THEMES.minimal;
    const html = renderToString(<LandingShowcase theme={theme} />);

    expect(html).toContain("From Wireframe to Production UI");
    expect(html).toContain("Semantic structure. Production output.");
    expect(html).toContain("/assets/showcase/showcase-wireframe.png");
    expect(html).toContain("/assets/showcase/showcase-rendered.png");
    expect(html).toContain('alt="OpenDraw canvas wireframe with semantic tags"');
    expect(html).toContain('alt="Rendered production UI component"');
    expect(html).toContain("Sketch Structure &amp; Assign Meaning");
    expect(html).toContain("Realized, Production-Ready Markup");
  });
});
