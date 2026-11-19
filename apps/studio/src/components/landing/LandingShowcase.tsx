import React from "react";
import type { LandingThemeTokens } from "./landing-styles.js";

export interface LandingShowcaseProps {
  readonly theme: LandingThemeTokens;
}

export function LandingShowcase({ theme }: LandingShowcaseProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="showcase-heading"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px",
        maxWidth: "1080px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        gap: "32px",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "12px",
          maxWidth: "760px",
        }}
      >
        <span
          style={{
            fontFamily: theme.headingFont,
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: theme.accent,
          }}
        >
          From Wireframe to Production UI
        </span>
        <h2
          id="showcase-heading"
          style={{
            fontFamily: theme.headingFont,
            color: theme.textPrimary,
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Semantic structure. Production output.
        </h2>
        <p
          style={{
            fontFamily: theme.bodyFont,
            color: theme.textSecondary,
            fontSize: "clamp(15px, 2vw, 18px)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          Draw intuitive shapes, tag them with semantic roles, and let AI translate your wireframe
          into a fully realized, styled component.
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {/* Left Card: Wireframe with Semantics */}
        <div
          style={{
            ...theme.card,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: theme.headingFont,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: theme.accent,
                textTransform: "uppercase",
              }}
            >
              Step 1 · Canvas Wireframe
            </span>
            <span
              style={{
                fontFamily: theme.bodyFont,
                fontSize: "12px",
                color: theme.textMuted,
              }}
            >
              Semantic tags assigned
            </span>
          </div>

          <div
            style={{
              backgroundColor: theme.id === "glass" ? "rgba(0, 0, 0, 0.4)" : "#ffffff",
              borderRadius: theme.card.borderRadius ?? "8px",
              border:
                theme.id === "brutalist" ? "2px solid #000000" : "1px solid rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "280px",
              padding: "12px",
            }}
          >
            <img
              src="/assets/showcase/showcase-wireframe.png"
              alt="OpenDraw canvas wireframe with semantic tags"
              style={{
                maxWidth: "100%",
                maxHeight: "360px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h3
              style={{
                fontFamily: theme.headingFont,
                fontSize: "16px",
                fontWeight: 700,
                color: theme.textPrimary,
                margin: 0,
              }}
            >
              Sketch Structure &amp; Assign Meaning
            </h3>
            <p
              style={{
                fontFamily: theme.bodyFont,
                fontSize: "13px",
                lineHeight: 1.5,
                color: theme.textSecondary,
                margin: 0,
              }}
            >
              Draw freehand or snap boxes. Add tags like <code>Heading</code>, <code>Button</code>,
              and <code>user image</code> directly on the canvas without leaving your flow.
            </p>
          </div>
        </div>

        {/* Right Card: Rendered Production UI */}
        <div
          style={{
            ...theme.card,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: theme.headingFont,
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: theme.accent,
                textTransform: "uppercase",
              }}
            >
              Step 2 · Generated Component
            </span>
            <span
              style={{
                fontFamily: theme.bodyFont,
                fontSize: "12px",
                color: theme.textMuted,
              }}
            >
              Accessible &amp; token-driven
            </span>
          </div>

          <div
            style={{
              backgroundColor: theme.id === "glass" ? "rgba(0, 0, 0, 0.4)" : "#ffffff",
              borderRadius: theme.card.borderRadius ?? "8px",
              border:
                theme.id === "brutalist" ? "2px solid #000000" : "1px solid rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "280px",
              padding: "12px",
            }}
          >
            <img
              src="/assets/showcase/showcase-rendered.png"
              alt="Rendered production UI component"
              style={{
                maxWidth: "100%",
                maxHeight: "360px",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h3
              style={{
                fontFamily: theme.headingFont,
                fontSize: "16px",
                fontWeight: 700,
                color: theme.textPrimary,
                margin: 0,
              }}
            >
              Realized, Production-Ready Markup
            </h3>
            <p
              style={{
                fontFamily: theme.bodyFont,
                fontSize: "13px",
                lineHeight: 1.5,
                color: theme.textSecondary,
                margin: 0,
              }}
            >
              AI and design engines read the semantic blueprint to generate responsive,
              high-fidelity components with WCAG contrast and proper hierarchy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
