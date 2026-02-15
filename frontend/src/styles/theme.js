// ─────────────────────────────────────────────────────────
//  Design Tokens — Material Design 3 / Google Store
// ─────────────────────────────────────────────────────────

export const theme = {
  /* ── Colors ─────────────────────────────────────────── */
  colors: {
    primary: "#1a73e8",
    primaryHover: "#1557b0",
    primaryLight: "#e8f0fe",
    primaryContainer: "#d2e3fc",

    onPrimary: "#ffffff",

    text: "#202124",
    textSecondary: "#5f6368",
    textTertiary: "#80868b",
    textOnDark: "#ffffff",

    surface: "#ffffff",
    surfaceDim: "#f8f9fa",
    surfaceContainer: "#f1f3f4",
    surfaceContainerHigh: "#e8eaed",

    outline: "#dadce0",
    outlineVariant: "#e8eaed",

    error: "#d93025",
    errorContainer: "#fce8e6",
    success: "#1e8e3e",
    successContainer: "#e6f4ea",
    warning: "#f9ab00",
    warningContainer: "#fef7e0",

    scrim: "rgba(0, 0, 0, 0.32)",
    shadow: "rgba(0, 0, 0, 0.08)",
  },

  /* ── Typography ─────────────────────────────────────── */
  fonts: {
    family: "'Google Sans', 'Segoe UI', Roboto, sans-serif",
    familyMono: "'Google Sans Mono', 'Fira Code', monospace",
  },

  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "2rem", // 32px
    "4xl": "2.5rem", // 40px
    display: "3.5rem", // 56px
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  /* ── Spacing (8dp grid) ────────────────────────────── */
  spacing: {
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
  },

  /* ── Border Radius ─────────────────────────────────── */
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "28px",
    full: "9999px",
  },

  /* ── Elevation / Shadows ───────────────────────────── */
  shadows: {
    none: "none",
    sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    md: "0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    lg: "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
    xl: "0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
  },

  /* ── Transitions ───────────────────────────────────── */
  transitions: {
    fast: "150ms cubic-bezier(0.2, 0, 0, 1)",
    normal: "250ms cubic-bezier(0.2, 0, 0, 1)",
    slow: "350ms cubic-bezier(0.2, 0, 0, 1)",
    spring: "400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /* ── Breakpoints ───────────────────────────────────── */
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    xxl: "1440px",
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
