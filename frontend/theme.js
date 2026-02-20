(function () {
const THEME_FAMILIES = {
  "renderrig-classic": {
    dark: {
      "--bg-main": "#121b16",
      "--bg-card": "#1a2921",
      "--bg-card-strong": "#142019",
      "--bg-ambient-1": "#66cf83",
      "--bg-ambient-2": "#4db271",
      "--bg-input": "#101913",
      "--bg-render": "#0c140f",
      "--grid-line": "rgba(82, 194, 111, 0.2)",
      "--ink-main": "#e3f2e8",
      "--ink-muted": "#a3c8af",
      "--accent": "#3cae59",
      "--accent-cool": "#2a844c",
      "--border": "#2f4d3a",
      "--danger": "#ff7a59",
      "--ok": "#4eb968",
    },
    light: {
      "--bg-main": "#eef6f0",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#e4efe8",
      "--bg-ambient-1": "#8cd3a0",
      "--bg-ambient-2": "#72be8d",
      "--bg-input": "#ffffff",
      "--bg-render": "#f5fbf7",
      "--grid-line": "rgba(68, 172, 102, 0.16)",
      "--ink-main": "#173021",
      "--ink-muted": "#4e7561",
      "--accent": "#338f4e",
      "--accent-cool": "#2a7a46",
      "--border": "#9dc4af",
      "--danger": "#d85b42",
      "--ok": "#338f4e",
    },
  },
  github: {
    dark: {
      "--bg-main": "#0d1117",
      "--bg-card": "#161b22",
      "--bg-card-strong": "#10161d",
      "--bg-ambient-1": "#1f6feb",
      "--bg-ambient-2": "#8957e5",
      "--bg-input": "#0d1117",
      "--bg-render": "#010409",
      "--grid-line": "rgba(121, 192, 255, 0.14)",
      "--ink-main": "#f0f6fc",
      "--ink-muted": "#9198a1",
      "--accent": "#4493f8",
      "--accent-cool": "#79c0ff",
      "--border": "#3d444d",
      "--danger": "#f85149",
      "--ok": "#3fb950",
    },
    light: {
      "--bg-main": "#f6f8fa",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#f2f4f7",
      "--bg-ambient-1": "#7e9fd8",
      "--bg-ambient-2": "#9a8bcd",
      "--bg-input": "#ffffff",
      "--bg-render": "#f8fafc",
      "--grid-line": "rgba(74, 98, 146, 0.17)",
      "--ink-main": "#1f2328",
      "--ink-muted": "#57606a",
      "--accent": "#0969da",
      "--accent-cool": "#1f6feb",
      "--border": "#d0d7de",
      "--danger": "#cf222e",
      "--ok": "#1a7f37",
    },
  },
  ubuntu: {
    dark: {
      "--bg-main": "#1e1329",
      "--bg-card": "#241633",
      "--bg-card-strong": "#1a1025",
      "--bg-ambient-1": "#e95420",
      "--bg-ambient-2": "#77216f",
      "--bg-input": "#160e22",
      "--bg-render": "#130b1d",
      "--grid-line": "rgba(233, 84, 32, 0.18)",
      "--ink-main": "#f8f1ff",
      "--ink-muted": "#c4a7d9",
      "--accent": "#e95420",
      "--accent-cool": "#ae3f9b",
      "--border": "#5a3d74",
      "--danger": "#ff7b56",
      "--ok": "#6fdc8c",
    },
    light: {
      "--bg-main": "#fff5ef",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#f7ece6",
      "--bg-ambient-1": "#f3aa8f",
      "--bg-ambient-2": "#cfb1dd",
      "--bg-input": "#ffffff",
      "--bg-render": "#fff9f6",
      "--grid-line": "rgba(123, 62, 114, 0.15)",
      "--ink-main": "#3a243f",
      "--ink-muted": "#76507f",
      "--accent": "#d9481b",
      "--accent-cool": "#8f3d88",
      "--border": "#d9bfd7",
      "--danger": "#c83f1d",
      "--ok": "#2e9a55",
    },
  },
  dracula: {
    dark: {
      "--bg-main": "#282a36",
      "--bg-card": "#21222c",
      "--bg-card-strong": "#1e1f29",
      "--bg-ambient-1": "#bd93f9",
      "--bg-ambient-2": "#ff79c6",
      "--bg-input": "#1c1d26",
      "--bg-render": "#191a21",
      "--grid-line": "rgba(139, 233, 253, 0.16)",
      "--ink-main": "#f8f8f2",
      "--ink-muted": "#6272a4",
      "--accent": "#ff79c6",
      "--accent-cool": "#8be9fd",
      "--border": "#44475a",
      "--danger": "#ff5555",
      "--ok": "#50fa7b",
    },
    light: {
      "--bg-main": "#f7f3ff",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#f0ebff",
      "--bg-ambient-1": "#cfbdf8",
      "--bg-ambient-2": "#ffc3e8",
      "--bg-input": "#ffffff",
      "--bg-render": "#fbf9ff",
      "--grid-line": "rgba(148, 124, 201, 0.14)",
      "--ink-main": "#2f3142",
      "--ink-muted": "#6e7288",
      "--accent": "#b16ce1",
      "--accent-cool": "#5ecafc",
      "--border": "#d5cdef",
      "--danger": "#e35f87",
      "--ok": "#3eb67b",
    },
  },
  nord: {
    dark: {
      "--bg-main": "#2e3440",
      "--bg-card": "#3b4252",
      "--bg-card-strong": "#323a48",
      "--bg-ambient-1": "#5e81ac",
      "--bg-ambient-2": "#88c0d0",
      "--bg-input": "#2b313d",
      "--bg-render": "#252b36",
      "--grid-line": "rgba(136, 192, 208, 0.16)",
      "--ink-main": "#eceff4",
      "--ink-muted": "#b7c0ce",
      "--accent": "#88c0d0",
      "--accent-cool": "#81a1c1",
      "--border": "#4c566a",
      "--danger": "#bf616a",
      "--ok": "#a3be8c",
    },
    light: {
      "--bg-main": "#eceff4",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#e5e9f0",
      "--bg-ambient-1": "#9eb4d3",
      "--bg-ambient-2": "#a2c7d6",
      "--bg-input": "#ffffff",
      "--bg-render": "#f7f8fb",
      "--grid-line": "rgba(76, 86, 106, 0.14)",
      "--ink-main": "#2e3440",
      "--ink-muted": "#5b6779",
      "--accent": "#5e81ac",
      "--accent-cool": "#81a1c1",
      "--border": "#c8d2e1",
      "--danger": "#bf616a",
      "--ok": "#7aa35a",
    },
  },
  catppuccin: {
    dark: {
      "--bg-main": "#1e1e2e",
      "--bg-card": "#181825",
      "--bg-card-strong": "#11111b",
      "--bg-ambient-1": "#89b4fa",
      "--bg-ambient-2": "#f5c2e7",
      "--bg-input": "#11111b",
      "--bg-render": "#0f0f18",
      "--grid-line": "rgba(166, 173, 200, 0.18)",
      "--ink-main": "#cdd6f4",
      "--ink-muted": "#a6adc8",
      "--accent": "#89b4fa",
      "--accent-cool": "#94e2d5",
      "--border": "#45475a",
      "--danger": "#f38ba8",
      "--ok": "#a6e3a1",
    },
    light: {
      "--bg-main": "#eff1f5",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#e6e9ef",
      "--bg-ambient-1": "#a6bcf1",
      "--bg-ambient-2": "#f2c0d8",
      "--bg-input": "#ffffff",
      "--bg-render": "#f9fafc",
      "--grid-line": "rgba(114, 135, 253, 0.14)",
      "--ink-main": "#4c4f69",
      "--ink-muted": "#6c6f85",
      "--accent": "#1e66f5",
      "--accent-cool": "#179299",
      "--border": "#ccd0da",
      "--danger": "#d20f39",
      "--ok": "#40a02b",
    },
  },
  "rose-pine": {
    dark: {
      "--bg-main": "#191724",
      "--bg-card": "#1f1d2e",
      "--bg-card-strong": "#16141f",
      "--bg-ambient-1": "#c4a7e7",
      "--bg-ambient-2": "#ebbcba",
      "--bg-input": "#16141f",
      "--bg-render": "#13111b",
      "--grid-line": "rgba(196, 167, 231, 0.18)",
      "--ink-main": "#e0def4",
      "--ink-muted": "#908caa",
      "--accent": "#9ccfd8",
      "--accent-cool": "#c4a7e7",
      "--border": "#403d52",
      "--danger": "#eb6f92",
      "--ok": "#8ac6a5",
    },
    light: {
      "--bg-main": "#faf4ed",
      "--bg-card": "#fffaf3",
      "--bg-card-strong": "#f2e9de",
      "--bg-ambient-1": "#b49bcc",
      "--bg-ambient-2": "#de9e99",
      "--bg-input": "#fffaf3",
      "--bg-render": "#f7f1e7",
      "--grid-line": "rgba(111, 110, 163, 0.15)",
      "--ink-main": "#575279",
      "--ink-muted": "#797593",
      "--accent": "#56949f",
      "--accent-cool": "#907aa9",
      "--border": "#dfdad9",
      "--danger": "#b4637a",
      "--ok": "#5f8f6b",
    },
  },
  atom: {
    dark: {
      "--bg-main": "#282c34",
      "--bg-card": "#21252b",
      "--bg-card-strong": "#1b1f24",
      "--bg-ambient-1": "#61afef",
      "--bg-ambient-2": "#c678dd",
      "--bg-input": "#1e2228",
      "--bg-render": "#161a1f",
      "--grid-line": "rgba(92, 99, 112, 0.2)",
      "--ink-main": "#abb2bf",
      "--ink-muted": "#8f96a3",
      "--accent": "#98c379",
      "--accent-cool": "#56b6c2",
      "--border": "#3a404b",
      "--danger": "#e06c75",
      "--ok": "#98c379",
    },
    light: {
      "--bg-main": "#fafafa",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#f0f0f0",
      "--bg-ambient-1": "#9dc0f5",
      "--bg-ambient-2": "#e0b7ee",
      "--bg-input": "#ffffff",
      "--bg-render": "#f7f7f7",
      "--grid-line": "rgba(135, 145, 160, 0.16)",
      "--ink-main": "#383a42",
      "--ink-muted": "#696c77",
      "--accent": "#50a14f",
      "--accent-cool": "#0184bc",
      "--border": "#d7dae0",
      "--danger": "#e45649",
      "--ok": "#50a14f",
    },
  },
  "e-ink": {
    dark: {
      "--bg-main": "#000000",
      "--bg-card": "#000000",
      "--bg-card-strong": "#000000",
      "--bg-ambient-1": "#000000",
      "--bg-ambient-2": "#000000",
      "--bg-input": "#000000",
      "--bg-render": "#000000",
      "--grid-line": "rgba(255, 255, 255, 0.3)",
      "--ink-main": "#ffffff",
      "--ink-muted": "#ffffff",
      "--accent": "#ffffff",
      "--accent-cool": "#ffffff",
      "--border": "#ffffff",
      "--danger": "#ffffff",
      "--ok": "#ffffff",
    },
    light: {
      "--bg-main": "#ffffff",
      "--bg-card": "#ffffff",
      "--bg-card-strong": "#ffffff",
      "--bg-ambient-1": "#ffffff",
      "--bg-ambient-2": "#ffffff",
      "--bg-input": "#ffffff",
      "--bg-render": "#ffffff",
      "--grid-line": "rgba(0, 0, 0, 0.16)",
      "--ink-main": "#000000",
      "--ink-muted": "#000000",
      "--accent": "#000000",
      "--accent-cool": "#000000",
      "--border": "#000000",
      "--danger": "#000000",
      "--ok": "#000000",
    },
  },
};

const MODES = Object.freeze(["dark", "light"]);

function parseThemeId(themeId) {
  if (typeof themeId !== "string") {
    return null;
  }
  const match = themeId.match(/^(.*)-(dark|light)$/);
  if (!match) {
    return null;
  }
  return { family: match[1], mode: match[2] };
}

function getThemeId(family, mode) {
  const normalizedMode = mode === "light" ? "light" : "dark";
  if (!Object.prototype.hasOwnProperty.call(THEME_FAMILIES, family)) {
    const fallbackId = window.RenderRigConstants?.DEFAULT_THEME_ID || "renderrig-classic-dark";
    const fallbackParsed = parseThemeId(fallbackId) || { family: "renderrig-classic" };
    return `${fallbackParsed.family}-${normalizedMode}`;
  }
  return `${family}-${normalizedMode}`;
}

function hasTheme(themeId) {
  const parsed = parseThemeId(themeId);
  if (!parsed) {
    return false;
  }
  return Boolean(THEME_FAMILIES[parsed.family] && THEME_FAMILIES[parsed.family][parsed.mode]);
}

function normalizeThemeId(themeId, fallbackThemeId) {
  const fallbackId = fallbackThemeId || window.RenderRigConstants?.DEFAULT_THEME_ID || "renderrig-classic-dark";
  if (hasTheme(themeId)) {
    return themeId;
  }
  if (hasTheme(fallbackId)) {
    return fallbackId;
  }
  return "renderrig-classic-dark";
}

function applyThemeTokens(themeId, options = {}) {
  const rootEl = options.rootEl || document.documentElement;
  const familyButtons = Array.isArray(options.familyButtons) ? options.familyButtons : [];
  const modeButtons = Array.isArray(options.modeButtons) ? options.modeButtons : [];
  const normalizedTheme = normalizeThemeId(themeId, options.fallbackThemeId);
  const parsed = parseThemeId(normalizedTheme);
  const palette = THEME_FAMILIES[parsed.family][parsed.mode];

  Object.entries(palette).forEach(([token, value]) => {
    rootEl.style.setProperty(token, value);
  });
  rootEl.dataset.themeFamily = parsed.family;
  rootEl.dataset.themeMode = parsed.mode;

  familyButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeFamily === parsed.family);
  });

  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.themeMode === parsed.mode);
  });

  return normalizedTheme;
}

window.RenderRigTheme = Object.freeze({
  THEME_FAMILIES,
  MODES,
  parseThemeId,
  getThemeId,
  hasTheme,
  normalizeThemeId,
  applyThemeTokens,
});
})();
