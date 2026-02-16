// ─────────────────────────────────────────────────────────
//  Design Tokens — Material Design 3 (Material You)
//  Seed: #1a73e8 (Google Blue)
// ─────────────────────────────────────────────────────────

export const theme = {
  /* ── M3 Color Roles ───────────────────────────────── */
  colors: {
    primary: "#0b57d0",
    primaryHover: "#0842a0",
    primaryContainer: "#d3e3fd",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#041e49",
    inversePrimary: "#a8c7fa",

    secondary: "#5f6368",
    onSecondary: "#ffffff",
    secondaryContainer: "#c2e7ff",
    onSecondaryContainer: "#001d35",

    tertiary: "#7b5ea7",
    onTertiary: "#ffffff",
    tertiaryContainer: "#eaddff",
    onTertiaryContainer: "#21005d",

    error: "#b3261e",
    onError: "#ffffff",
    errorContainer: "#f9dedc",
    onErrorContainer: "#410e0b",

    success: "#1e8e3e",
    successContainer: "#c4eed0",
    warning: "#e37400",
    warningContainer: "#ffddb5",

    surface: "#fef7ff",
    surfaceDim: "#ded8e1",
    surfaceBright: "#fef7ff",
    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f7f2fa",
    surfaceContainer: "#f3edf7",
    surfaceContainerHigh: "#ece6f0",
    surfaceContainerHighest: "#e6e0e9",
    onSurface: "#1d1b20",
    onSurfaceVariant: "#49454f",

    outline: "#79747e",
    outlineVariant: "#cac4d0",

    inverseSurface: "#322f35",
    inverseOnSurface: "#f5eff7",

    scrim: "rgba(0, 0, 0, 0.32)",
    shadow: "rgba(0, 0, 0, 0.15)",
  },

  /* ── M3 State Layer Opacities ─────────────────────── */
  stateLayer: {
    hover: 0.08,
    focus: 0.1,
    pressed: 0.1,
    dragged: 0.16,
  },

  /* ── Typography ─────────────────────────────────────── */
  fonts: {
    family: "'Google Sans', 'Segoe UI', Roboto, system-ui, sans-serif",
    familyMono: "'Google Sans Mono', 'Fira Code', 'Consolas', monospace",
  },

  typeScale: {
    displayLarge: {
      size: "3.5625rem",
      line: "4rem",
      tracking: "-0.25px",
      weight: 400,
    },
    displayMedium: {
      size: "2.8125rem",
      line: "3.25rem",
      tracking: "0",
      weight: 400,
    },
    displaySmall: {
      size: "2.25rem",
      line: "2.75rem",
      tracking: "0",
      weight: 400,
    },
    headlineLarge: { size: "2rem", line: "2.5rem", tracking: "0", weight: 400 },
    headlineMedium: {
      size: "1.75rem",
      line: "2.25rem",
      tracking: "0",
      weight: 400,
    },
    headlineSmall: { size: "1.5rem", line: "2rem", tracking: "0", weight: 400 },
    titleLarge: {
      size: "1.375rem",
      line: "1.75rem",
      tracking: "0",
      weight: 400,
    },
    titleMedium: {
      size: "1rem",
      line: "1.5rem",
      tracking: "0.15px",
      weight: 500,
    },
    titleSmall: {
      size: "0.875rem",
      line: "1.25rem",
      tracking: "0.1px",
      weight: 500,
    },
    bodyLarge: { size: "1rem", line: "1.5rem", tracking: "0.5px", weight: 400 },
    bodyMedium: {
      size: "0.875rem",
      line: "1.25rem",
      tracking: "0.25px",
      weight: 400,
    },
    bodySmall: {
      size: "0.75rem",
      line: "1rem",
      tracking: "0.4px",
      weight: 400,
    },
    labelLarge: {
      size: "0.875rem",
      line: "1.25rem",
      tracking: "0.1px",
      weight: 500,
    },
    labelMedium: {
      size: "0.75rem",
      line: "1rem",
      tracking: "0.5px",
      weight: 500,
    },
    labelSmall: {
      size: "0.6875rem",
      line: "1rem",
      tracking: "0.5px",
      weight: 500,
    },
  },

  /* ── Shape (M3 corners) ─────────────────────────────── */
  shape: {
    none: "0",
    extraSmall: "4px",
    small: "8px",
    medium: "12px",
    large: "16px",
    extraLarge: "28px",
    full: "9999px",
  },

  /* ── Spacing (4dp grid) ─────────────────────────────── */
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },

  /* ── Elevation (M3 — surface tones + shadows) ──────── */
  elevation: {
    level0: "none",
    level1: "0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)",
    level2: "0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)",
    level3: "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)",
    level4: "0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)",
    level5: "0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)",
  },

  /* ── Motion (M3 easing + durations) ─────────────────── */
  motion: {
    easing: {
      emphasized: "cubic-bezier(0.2, 0, 0, 1)",
      emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
      emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      standardDecelerate: "cubic-bezier(0, 0, 0, 1)",
      standardAccelerate: "cubic-bezier(0.3, 0, 1, 1)",
    },
    duration: {
      short1: "50ms",
      short2: "100ms",
      short3: "150ms",
      short4: "200ms",
      medium1: "250ms",
      medium2: "300ms",
      medium3: "350ms",
      medium4: "400ms",
      long1: "450ms",
      long2: "500ms",
    },
  },

  /* ── Breakpoints ───────────────────────────────────── */
  breakpoints: {
    compact: "600px",
    medium: "840px",
    expanded: "1200px",
    large: "1600px",
  },

  /* ── Z-Index ───────────────────────────────────────── */
  zIndex: {
    dropdown: 100,
    sticky: 200,
    modal: 300,
    overlay: 400,
    toast: 500,
  },
};

export default theme;
