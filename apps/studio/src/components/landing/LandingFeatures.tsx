import React from "react";
import { type LandingDesignStyle, type LandingThemeTokens } from "./landing-styles.js";
import { LandingStyleSwitcher } from "./LandingStyleSwitcher.js";

export interface LandingFeaturesProps {
  readonly theme: LandingThemeTokens;
  readonly activeStyle: LandingDesignStyle;
  readonly onStyleChange: (style: LandingDesignStyle) => void;
}

export function LandingFeatures({
  theme,
  activeStyle,
  onStyleChange,
}: LandingFeaturesProps): React.JSX.Element {
  return (
    <section
      aria-labelledby="style-switcher-heading"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "48px 24px",
        maxWidth: "880px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
        gap: "20px",
      }}
    >
      {/* Section Heading (s-504a07) */}
      <h2
        id="style-switcher-heading"
        style={{
          fontFamily: theme.headingFont,
          color: theme.textPrimary,
          fontSize: "clamp(24px, 3.5vw, 36px)",
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.25,
        }}
      >
        Experience This WebPage in Different Design Styles
      </h2>

      {/* Interactive Segmented Style Switcher (s-504a06) */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <LandingStyleSwitcher
          activeStyle={activeStyle}
          onStyleChange={onStyleChange}
          theme={theme}
        />
      </div>

      {/* Subhead (s-504a08) */}
      <p
        style={{
          fontFamily: theme.bodyFont,
          color: theme.textSecondary,
          fontSize: "clamp(15px, 2vw, 18px)",
          lineHeight: 1.5,
          margin: 0,
          maxWidth: "600px",
        }}
      >
        Same content. Same structure. Different visual languages.
      </p>
    </section>
  );
}
