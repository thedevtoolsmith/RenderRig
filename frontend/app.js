const constants = window.RenderRigConstants;
const themeApi = window.RenderRigTheme;
const detectorApi = window.RenderRigDetector;

if (!constants) {
  throw new Error("RenderRig constants are missing. Ensure constants.js is loaded before app.js.");
}
if (!themeApi) {
  throw new Error("RenderRig theme API is missing. Ensure theme.js is loaded before app.js.");
}
if (!detectorApi) {
  throw new Error("RenderRig detector API is missing. Ensure detector.js is loaded before app.js.");
}

const {
  PREVIEW_FORMAT,
  TEXT_PLAIN_HEADERS,
  DIAGRAM_CATALOG,
  DIAGRAM_SAMPLES,
  DIAGRAM_FORMAT_SUPPORT,
  DEFAULT_SERVER_URL,
  DEFAULT_DIAGRAM_TYPE,
  AUTO_DIAGRAM_TYPE_ID,
  DEFAULT_THEME_ID,
} = constants;

const { THEME_FAMILIES, hasTheme, applyThemeTokens, parseThemeId, getThemeId, normalizeThemeId } = themeApi;
const { detectDiagramType } = detectorApi;

const dom = {
  topToolbar: document.querySelector(".top-toolbar"),
  toolbarMenuToggle: document.getElementById("toolbarMenuToggle"),
  iconMenusContainer: document.querySelector(".icon-menus"),
  workspace: document.querySelector(".workspace"),
  controlsPanel: document.querySelector(".controls-panel"),
  configDetails: document.querySelector(".config-details"),
  splitHandle: document.getElementById("splitHandle"),
  previewPanel: document.querySelector(".preview-panel"),
  sourceField: document.querySelector(".source-field"),
  menus: Array.from(document.querySelectorAll(".menu")),
  menuTriggers: Array.from(document.querySelectorAll(".menu-trigger")),
  serverUrl: document.getElementById("serverUrl"),
  themeFamilyButtons: Array.from(document.querySelectorAll(".theme-family-btn")),
  themeModeButtons: Array.from(document.querySelectorAll(".theme-mode-btn")),
  diagramTypeDropdown: document.getElementById("diagramTypeDropdown"),
  diagramTypeTrigger: document.getElementById("diagramTypeTrigger"),
  diagramTypeTriggerText: document.getElementById("diagramTypeTriggerText"),
  diagramTypeList: document.getElementById("diagramTypeList"),
  diagramType: document.getElementById("diagramType"),
  diagramSource: document.getElementById("diagramSource"),
  debugModeBtn: document.getElementById("debugModeBtn"),
  requestTimeoutSeconds: document.getElementById("requestTimeoutSeconds"),
  renderStatusChip: document.getElementById("renderStatusChip"),
  renderBox: document.getElementById("renderBox"),
  debugPanel: document.getElementById("debugPanel"),
  requestTypeMeta: document.getElementById("requestTypeMeta"),
  autoDetectMeta: document.getElementById("autoDetectMeta"),
  hostedUrlMeta: document.getElementById("hostedUrlMeta"),
  endpointMeta: document.getElementById("endpointMeta"),
  requestTimeoutMeta: document.getElementById("requestTimeoutMeta"),
  timeMeta: document.getElementById("timeMeta"),
  requestDurationMeta: document.getElementById("requestDurationMeta"),
  requestRawMeta: document.getElementById("requestRawMeta"),
  statusText: document.getElementById("statusText"),
  exportFormatButtons: document.getElementById("exportFormatButtons"),
  copyFormatButtons: document.getElementById("copyFormatButtons"),
  editableLinkBtn: document.getElementById("editableLinkBtn"),
  imageLinkBtn: document.getElementById("imageLinkBtn"),
  actionCallout: document.getElementById("actionCallout"),
  focusModeToast: document.getElementById("focusModeToast"),
  focusModeExitBtn: document.getElementById("focusModeExitBtn"),
  commandPalette: document.getElementById("commandPalette"),
  commandPaletteInput: document.getElementById("commandPaletteInput"),
  commandPaletteList: document.getElementById("commandPaletteList"),
  commandPaletteCloseElements: Array.from(document.querySelectorAll("[data-command-palette-close]")),
  mobileActionSheet: document.getElementById("mobileActionSheet"),
  mobileActionSheetBody: document.getElementById("mobileActionSheetBody"),
  mobileActionSheetTitle: document.getElementById("mobileActionSheetTitle"),
  mobileActionSheetClose: document.getElementById("mobileActionSheetClose"),
  mobileActionSheetCloseElements: Array.from(document.querySelectorAll("[data-mobile-sheet-close]")),
  footerEmoji: document.getElementById("footerEmoji"),
};

const state = {
  objectUrl: "",
  renderToken: 0,
  debugMode: false,
  themeId: DEFAULT_THEME_ID,
  lastRequestType: "",
  lastRequestEndpoint: "",
  lastRequestTime: "",
  lastRequestRaw: "",
  lastRequestDurationMs: null,
  lastRequestTimedOut: false,
  resolvedDiagramType: "",
  autoDetection: null,
  exportActionButtons: [],
  copyActionButtons: [],
  renderStatusKind: "idle",
  renderStartedAt: 0,
  renderElapsedMs: 0,
  paneWidthPercent: 46,
  commandPaletteCommands: [],
  commandPaletteActiveIndex: 0,
  mobileActionSheetMode: "",
  recentCommandIds: [],
  requestTimeoutMs: 5000,
  focusMode: false,
};

let autoRenderTimer = null;
let actionCalloutTimer = null;
let actionCalloutHideTimer = null;
let focusModeToastTimer = null;
let focusModeToastHideTimer = null;
let renderStatusTimer = null;
let controlsPanelObserver = null;
let topMenuListenersAttached = false;
let visualViewportListenersAttached = false;
let tooltipRulerEl = null;
let splitResizeActive = false;
let splitPointerId = null;
let focusModeListenersAttached = false;
let footerEmojiShuffleTimer = null;
const COMPACT_UI_MEDIA_QUERY = "(max-width: 1200px), (hover: none), (pointer: coarse)";
const AUTO_DETECT_CONFIDENCE_THRESHOLD = 0.82;
const AUTO_DETECT_VALIDATION_CANDIDATES = 3;
const MENU_SHORTCUTS = Object.freeze({
  j: "copy",
  h: "export",
  g: "theme",
  o: "debug",
});
const MENU_SHORTCUT_CONFIG = Object.freeze({
  focus: { label: "Focus Mode", key: ";" },
  copy: { label: "Copy", key: "j" },
  export: { label: "Download", key: "h" },
  theme: { label: "Theme", key: "g" },
  debug: { label: "Options", key: "o" },
  command: { label: "Command Palette", key: "k" },
});
const PANEL_MIN_WIDTH_PERCENT = 28;
const PANEL_MAX_WIDTH_PERCENT = 72;
const EDGE_RESIZE_THRESHOLD_PX = 10;
const PREFS_STORAGE_PREFIX = "renderrig-ui-prefs-v1";
const COPY_IMAGE_LINK_FORMAT = "svg";
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;
const MIN_REQUEST_TIMEOUT_MS = 1000;
const MAX_REQUEST_TIMEOUT_MS = 120000;
const FOCUS_MODE_TOAST_SHOW_MS = 2200;
const FOOTER_EMOJI_OPTIONS = Object.freeze(["🤖", "💚", "☕", "🛠️", "⌨️", "✨", "🧠", "⚙️"]);
const FOOTER_EMOJI_SHUFFLE_MS = 1400;
const IS_APPLE_PLATFORM = (() => {
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
})();

function isCompactToolbarLayout() {
  return window.matchMedia(COMPACT_UI_MEDIA_QUERY).matches;
}

function getDevicePrefsBucket() {
  return isCompactToolbarLayout() ? "compact" : "desktop";
}

function getShortcutGlyph() {
  return IS_APPLE_PLATFORM ? "⌘" : "⌃";
}

function getShortcutDisplay(key) {
  return `${getShortcutGlyph()}${key.toUpperCase()}`;
}

function getShortcutAria(key) {
  if (key === ";") {
    return `${IS_APPLE_PLATFORM ? "Meta" : "Control"}+Semicolon`;
  }
  return `${IS_APPLE_PLATFORM ? "Meta" : "Control"}+${key.toUpperCase()}`;
}

function isFocusShortcut(event) {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
    return false;
  }
  return event.key === ";" || event.code === "Semicolon";
}

function startFooterEmojiShuffle() {
  if (!dom.footerEmoji) {
    return;
  }

  let previousEmoji = String(dom.footerEmoji.textContent || "").trim();
  const pickNextEmoji = () => {
    const candidates = FOOTER_EMOJI_OPTIONS.filter((emoji) => emoji !== previousEmoji);
    const pool = candidates.length ? candidates : FOOTER_EMOJI_OPTIONS;
    const nextEmoji = pool[Math.floor(Math.random() * pool.length)] || "🤖";
    dom.footerEmoji.textContent = nextEmoji;
    previousEmoji = nextEmoji;
  };

  pickNextEmoji();
  window.clearInterval(footerEmojiShuffleTimer);
  footerEmojiShuffleTimer = window.setInterval(() => {
    if (document.hidden) {
      return;
    }
    pickNextEmoji();
  }, FOOTER_EMOJI_SHUFFLE_MS);
}

function clampRequestTimeoutMs(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }
  return Math.min(MAX_REQUEST_TIMEOUT_MS, Math.max(MIN_REQUEST_TIMEOUT_MS, Math.round(numeric)));
}

function getRequestTimeoutMs() {
  return clampRequestTimeoutMs(state.requestTimeoutMs);
}

function getRequestTimeoutSeconds() {
  return Math.round(getRequestTimeoutMs() / 1000);
}

function formatRequestDurationForDebug(durationMs, timedOut = false) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "-";
  }
  const roundedMs = Math.round(durationMs);
  const base = roundedMs >= 1000 ? `${(roundedMs / 1000).toFixed(2)}s (${roundedMs} ms)` : `${roundedMs} ms`;
  return timedOut ? `${base} (timed out)` : base;
}

function refreshRequestTimingMeta() {
  if (dom.requestTimeoutMeta) {
    const timeoutMs = getRequestTimeoutMs();
    dom.requestTimeoutMeta.textContent = `${Math.round(timeoutMs / 1000)}s (${timeoutMs} ms)`;
  }
  if (dom.requestDurationMeta) {
    dom.requestDurationMeta.textContent = formatRequestDurationForDebug(
      state.lastRequestDurationMs,
      state.lastRequestTimedOut,
    );
  }
}

function syncRequestTimeoutInput() {
  if (!dom.requestTimeoutSeconds) {
    return;
  }
  dom.requestTimeoutSeconds.value = String(getRequestTimeoutSeconds());
}

function setRequestTimeoutSeconds(seconds, options = {}) {
  const { persist = true, showFeedback = false } = options;
  const numericSeconds = Number(seconds);
  if (!Number.isFinite(numericSeconds)) {
    syncRequestTimeoutInput();
    return false;
  }
  const timeoutMs = clampRequestTimeoutMs(numericSeconds * 1000);
  state.requestTimeoutMs = timeoutMs;
  syncRequestTimeoutInput();
  refreshRequestTimingMeta();
  if (persist) {
    saveStateToHash();
  }
  if (showFeedback) {
    updateStatus("ok", `Request timeout set to ${getRequestTimeoutSeconds()} seconds.`);
    showActionCallout("ok", `Request timeout set to ${getRequestTimeoutSeconds()} seconds.`);
  }
  return true;
}

function applyMenuShortcutTooltips() {
  dom.menuTriggers.forEach((trigger) => {
    const menu = trigger.closest(".menu");
    const menuName = menu?.dataset.menu || "";
    const config = MENU_SHORTCUT_CONFIG[menuName];
    if (!config) {
      return;
    }
    const tooltip = `${config.label} (${getShortcutDisplay(config.key)})`;
    trigger.dataset.tooltip = tooltip;
    trigger.removeAttribute("title");
    trigger.setAttribute("aria-keyshortcuts", getShortcutAria(config.key));
    if (menuName === "command") {
      trigger.setAttribute("aria-label", config.label);
    } else if (menuName === "focus") {
      trigger.setAttribute("aria-label", config.label);
    } else {
      trigger.setAttribute("aria-label", `${config.label} menu`);
    }
  });
  positionMenuTooltips();
}

function getTooltipRuler() {
  if (tooltipRulerEl && document.body.contains(tooltipRulerEl)) {
    return tooltipRulerEl;
  }
  const ruler = document.createElement("span");
  ruler.className = "menu-tooltip-ruler";
  document.body.appendChild(ruler);
  tooltipRulerEl = ruler;
  return ruler;
}

function measureMenuTooltipWidth(text) {
  if (!text) {
    return 0;
  }
  const ruler = getTooltipRuler();
  ruler.textContent = text;
  return Math.ceil(ruler.getBoundingClientRect().width);
}

function getTooltipOverflow(left, right, viewportWidth, margin) {
  const maxRight = viewportWidth - margin;
  let overflow = 0;
  if (left < margin) {
    overflow += margin - left;
  }
  if (right > maxRight) {
    overflow += right - maxRight;
  }
  return overflow;
}

function positionMenuTooltips() {
  if (!dom.menuTriggers.length) {
    return;
  }

  if (isCompactToolbarLayout()) {
    dom.menus.forEach((menu) => {
      delete menu.dataset.tooltipAlign;
    });
    return;
  }

  const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
  const margin = 8;
  if (!viewportWidth) {
    return;
  }

  dom.menuTriggers.forEach((trigger) => {
    const menu = trigger.closest(".menu");
    if (!menu) {
      return;
    }
    const tooltipText = trigger.dataset.tooltip || "";
    const tooltipWidth = measureMenuTooltipWidth(tooltipText);
    if (!tooltipWidth) {
      delete menu.dataset.tooltipAlign;
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const centeredLeft = rect.left + (rect.width - tooltipWidth) / 2;
    const centeredRight = centeredLeft + tooltipWidth;
    const centeredOverflow = getTooltipOverflow(centeredLeft, centeredRight, viewportWidth, margin);

    if (centeredOverflow <= 0) {
      delete menu.dataset.tooltipAlign;
      return;
    }

    const leftAlignedLeft = rect.left;
    const leftAlignedRight = leftAlignedLeft + tooltipWidth;
    const rightAlignedRight = rect.right;
    const rightAlignedLeft = rightAlignedRight - tooltipWidth;

    const leftOverflow = getTooltipOverflow(leftAlignedLeft, leftAlignedRight, viewportWidth, margin);
    const rightOverflow = getTooltipOverflow(rightAlignedLeft, rightAlignedRight, viewportWidth, margin);

    menu.dataset.tooltipAlign = leftOverflow <= rightOverflow ? "left" : "right";
  });
}

function isTypingElement(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function getPrefsStorageKey() {
  return `${PREFS_STORAGE_PREFIX}:${getDevicePrefsBucket()}`;
}

function readUiPrefs() {
  try {
    const raw = window.localStorage.getItem(getPrefsStorageKey());
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function writeUiPrefs(nextPrefs) {
  try {
    window.localStorage.setItem(getPrefsStorageKey(), JSON.stringify(nextPrefs));
  } catch {
    // Ignore storage errors in restricted browser contexts.
  }
}

function getMenuByName(menuName) {
  return dom.menus.find((menu) => menu.dataset.menu === menuName) || null;
}

function updateFocusModeMenuUi() {
  const focusMenu = getMenuByName("focus");
  if (!focusMenu) {
    return;
  }
  focusMenu.classList.toggle("is-toggled", Boolean(state.focusMode));
  const trigger = focusMenu.querySelector(".menu-trigger");
  if (trigger instanceof HTMLElement) {
    trigger.setAttribute("aria-pressed", String(Boolean(state.focusMode)));
  }
}

function setFocusMode(enabled, options = {}) {
  const { focusSource = false } = options;
  const nextValue = Boolean(enabled);
  if (state.focusMode === nextValue) {
    return;
  }
  state.focusMode = nextValue;
  document.body.classList.toggle("is-focus-mode", nextValue);
  updateFocusModeMenuUi();
  if (nextValue) {
    showFocusModeToast();
  } else {
    hideFocusModeToast(true);
  }
  window.requestAnimationFrame(() => {
    syncRenderBoxHeight();
    updateSourceScrollState();
    updateRenderScrollState();
    positionOpenMenus();
    positionResponsiveToolbarToVisibleViewport();
    positionMenuTooltips();
    if (focusSource) {
      dom.diagramSource?.focus();
    }
  });
}

function toggleFocusMode(options = {}) {
  setFocusMode(!state.focusMode, options);
}

function collectOpenMenuNames() {
  return dom.menus
    .filter((menu) => menu.classList.contains("is-open"))
    .map((menu) => menu.dataset.menu)
    .filter(Boolean);
}

function persistUiPrefs() {
  const prefs = {
    paneWidthPercent: state.paneWidthPercent,
    openMenus: collectOpenMenuNames(),
    toolbarOpen: Boolean(dom.topToolbar?.classList.contains("is-open")),
    mobileActionSheetMode: state.mobileActionSheetMode || "",
    recentCommandIds: state.recentCommandIds.slice(0, 10),
  };
  writeUiPrefs(prefs);
}

function closeToolbarDropdown(persist = true) {
  if (!dom.topToolbar) {
    return;
  }
  dom.topToolbar.classList.remove("is-open");
  if (dom.toolbarMenuToggle) {
    dom.toolbarMenuToggle.setAttribute("aria-expanded", "false");
  }
  if (persist) {
    persistUiPrefs();
  }
}

function clearResponsiveToolbarInlinePosition() {
  if (dom.toolbarMenuToggle) {
    dom.toolbarMenuToggle.style.removeProperty("left");
    dom.toolbarMenuToggle.style.removeProperty("top");
    dom.toolbarMenuToggle.style.removeProperty("right");
  }
  if (dom.iconMenusContainer) {
    dom.iconMenusContainer.style.removeProperty("left");
    dom.iconMenusContainer.style.removeProperty("top");
    dom.iconMenusContainer.style.removeProperty("right");
  }
}

function positionResponsiveToolbarToVisibleViewport() {
  if (!dom.toolbarMenuToggle || !dom.iconMenusContainer) {
    return;
  }

  if (!isCompactToolbarLayout()) {
    clearResponsiveToolbarInlinePosition();
    return;
  }

  const vv = window.visualViewport;
  const viewportLeft = vv ? vv.offsetLeft : 0;
  const viewportTop = vv ? vv.offsetTop : 0;
  const viewportWidth = vv ? vv.width : window.innerWidth;
  const inset = 14;
  const gap = 6;

  const toggleRect = dom.toolbarMenuToggle.getBoundingClientRect();
  const toggleWidth = toggleRect.width || dom.toolbarMenuToggle.offsetWidth || 88;
  const toggleHeight = toggleRect.height || dom.toolbarMenuToggle.offsetHeight || 42;
  const toggleLeft = Math.max(inset, Math.round(viewportLeft + viewportWidth - inset - toggleWidth));
  const toggleTop = Math.max(inset, Math.round(viewportTop + inset));

  dom.toolbarMenuToggle.style.left = `${toggleLeft}px`;
  dom.toolbarMenuToggle.style.top = `${toggleTop}px`;
  dom.toolbarMenuToggle.style.right = "auto";

  const menuWidth = dom.iconMenusContainer.offsetWidth || 192;
  const menuLeft = Math.max(inset, Math.round(viewportLeft + viewportWidth - inset - menuWidth));
  const menuTop = toggleTop + toggleHeight + gap;
  dom.iconMenusContainer.style.left = `${menuLeft}px`;
  dom.iconMenusContainer.style.top = `${menuTop}px`;
  dom.iconMenusContainer.style.right = "auto";
  positionMenuTooltips();
}

function syncToolbarDropdownForViewport() {
  if (!isCompactToolbarLayout()) {
    closeToolbarDropdown(false);
    closeAllMenus(null, false);
    closeMobileActionSheet(false);
  }
  positionResponsiveToolbarToVisibleViewport();
  positionMenuTooltips();
}

function normalizeServerUrl(urlText) {
  return urlText.replace(/\/+$/, "").trim();
}

function getDefaultKrokiServerUrl() {
  try {
    const currentUrl = new URL(window.location.href);
    const isHttpOrigin = currentUrl.protocol === "http:" || currentUrl.protocol === "https:";
    if (isHttpOrigin && currentUrl.hostname) {
      return `${currentUrl.origin.replace(/\/+$/, "")}/kroki`;
    }
  } catch {
    // Fall through to static default.
  }
  return "https://kroki.io";
}

function getCurrentAppUrl() {
  try {
    const current = new URL(window.location.href);
    current.hash = "";
    current.search = "";
    return current.toString();
  } catch {
    return "";
  }
}

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((item) => {
    binary += String.fromCharCode(item);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toDataBase64(value) {
  const bytes = new TextEncoder().encode(value);
  return toBase64Url(bytes);
}

function fromDataBase64(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const normalized = padded + "===".slice((padded.length + 3) % 4);
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function updateStatus(kind, message) {
  if (!dom.statusText) {
    return;
  }
  dom.statusText.textContent = message;
  dom.statusText.className = `status ${kind}`;
}

function showActionCallout(kind, message) {
  if (!dom.actionCallout) {
    return;
  }

  window.clearTimeout(actionCalloutTimer);
  window.clearTimeout(actionCalloutHideTimer);

  dom.actionCallout.hidden = false;
  dom.actionCallout.textContent = message;
  dom.actionCallout.className = `action-callout ${kind}`;

  window.requestAnimationFrame(() => {
    dom.actionCallout.classList.add("is-visible");
  });

  actionCalloutTimer = window.setTimeout(() => {
    dom.actionCallout.classList.remove("is-visible");
    actionCalloutHideTimer = window.setTimeout(() => {
      if (!dom.actionCallout.classList.contains("is-visible")) {
        dom.actionCallout.hidden = true;
      }
    }, 180);
  }, 2700);
}

function hideFocusModeToast(immediate = false) {
  if (!dom.focusModeToast) {
    return;
  }

  window.clearTimeout(focusModeToastTimer);
  window.clearTimeout(focusModeToastHideTimer);

  if (immediate) {
    dom.focusModeToast.classList.remove("is-visible");
    dom.focusModeToast.hidden = true;
    return;
  }

  dom.focusModeToast.classList.remove("is-visible");
  focusModeToastHideTimer = window.setTimeout(() => {
    if (!dom.focusModeToast.classList.contains("is-visible")) {
      dom.focusModeToast.hidden = true;
    }
  }, 180);
}

function showFocusModeToast() {
  if (!dom.focusModeToast) {
    return;
  }

  window.clearTimeout(focusModeToastTimer);
  window.clearTimeout(focusModeToastHideTimer);

  dom.focusModeToast.hidden = false;
  dom.focusModeToast.classList.remove("is-visible");

  window.requestAnimationFrame(() => {
    dom.focusModeToast.classList.add("is-visible");
  });

  focusModeToastTimer = window.setTimeout(() => {
    hideFocusModeToast(false);
  }, FOCUS_MODE_TOAST_SHOW_MS);
}

function updateRenderScrollState() {
  if (!dom.renderBox) {
    return;
  }

  const clientHeight = dom.renderBox.clientHeight;
  const scrollHeight = dom.renderBox.scrollHeight;
  const scrollTop = dom.renderBox.scrollTop;
  const hasOverflow = scrollHeight - clientHeight > 1;

  dom.renderBox.classList.toggle("is-scrollable", hasOverflow);
  if (!hasOverflow) {
    dom.renderBox.style.setProperty("--indicator-size", "24px");
    dom.renderBox.style.setProperty("--indicator-top", "0px");
    return;
  }

  const trackHeight = Math.max(24, clientHeight - 18);
  const thumbSize = Math.max(24, Math.round((clientHeight / scrollHeight) * trackHeight));
  const scrollMax = Math.max(1, scrollHeight - clientHeight);
  const thumbTravel = Math.max(0, trackHeight - thumbSize);
  const thumbTop = Math.round((scrollTop / scrollMax) * thumbTravel);

  dom.renderBox.style.setProperty("--indicator-size", `${thumbSize}px`);
  dom.renderBox.style.setProperty("--indicator-top", `${thumbTop}px`);
}

function updateSourceScrollState() {
  if (!dom.diagramSource || !dom.sourceField) {
    return;
  }

  const textarea = dom.diagramSource;
  const hasOverflow = textarea.scrollHeight - textarea.clientHeight > 1;
  dom.sourceField.classList.toggle("is-scrollable", hasOverflow);

  const fieldRect = dom.sourceField.getBoundingClientRect();
  const textareaRect = textarea.getBoundingClientRect();
  const offsetTop = Math.max(0, Math.round(textareaRect.top - fieldRect.top + 3));
  const offsetBottom = Math.max(0, Math.round(fieldRect.bottom - textareaRect.bottom + 3));

  dom.sourceField.style.setProperty("--source-indicator-offset-top", `${offsetTop}px`);
  dom.sourceField.style.setProperty("--source-indicator-offset-bottom", `${offsetBottom}px`);

  if (!hasOverflow) {
    dom.sourceField.style.setProperty("--source-indicator-size", "24px");
    dom.sourceField.style.setProperty("--source-indicator-top", "0px");
    return;
  }

  const clientHeight = textarea.clientHeight;
  const scrollHeight = textarea.scrollHeight;
  const scrollTop = textarea.scrollTop;
  const trackHeight = Math.max(24, clientHeight - 6);
  const thumbSize = Math.max(24, Math.round((clientHeight / scrollHeight) * trackHeight));
  const scrollMax = Math.max(1, scrollHeight - clientHeight);
  const thumbTravel = Math.max(0, trackHeight - thumbSize);
  const thumbTop = Math.round((scrollTop / scrollMax) * thumbTravel);

  dom.sourceField.style.setProperty("--source-indicator-size", `${thumbSize}px`);
  dom.sourceField.style.setProperty("--source-indicator-top", `${thumbTop}px`);
}

function clampPaneWidthPercent(value) {
  return Math.min(PANEL_MAX_WIDTH_PERCENT, Math.max(PANEL_MIN_WIDTH_PERCENT, value));
}

function applyPaneWidthPercent(value, persist = true) {
  if (!dom.workspace) {
    return;
  }
  const nextValue = clampPaneWidthPercent(value);
  state.paneWidthPercent = nextValue;
  dom.workspace.style.setProperty("--workspace-left", String(nextValue));
  if (dom.splitHandle) {
    dom.splitHandle.setAttribute("aria-valuenow", String(Math.round(nextValue)));
  }
  syncRenderBoxHeight();
  if (persist) {
    persistUiPrefs();
  }
}

function updatePaneWidthFromPointerClientX(clientX, persist = false) {
  if (!dom.workspace) {
    return;
  }
  const rect = dom.workspace.getBoundingClientRect();
  if (!rect.width) {
    return;
  }
  const relativeX = clientX - rect.left;
  const percent = (relativeX / rect.width) * 100;
  applyPaneWidthPercent(percent, persist);
}

function isPointerNearResizeEdge(clientX, clientY) {
  if (isCompactToolbarLayout() || !dom.controlsPanel || !dom.previewPanel) {
    return false;
  }

  const controlsRect = dom.controlsPanel.getBoundingClientRect();
  const previewRect = dom.previewPanel.getBoundingClientRect();

  const nearControlsEdge =
    clientY >= controlsRect.top &&
    clientY <= controlsRect.bottom &&
    clientX >= controlsRect.left &&
    clientX <= controlsRect.right &&
    Math.abs(clientX - controlsRect.right) <= EDGE_RESIZE_THRESHOLD_PX;

  const nearPreviewEdge =
    clientY >= previewRect.top &&
    clientY <= previewRect.bottom &&
    clientX >= previewRect.left &&
    clientX <= previewRect.right &&
    Math.abs(clientX - previewRect.left) <= EDGE_RESIZE_THRESHOLD_PX;

  return nearControlsEdge || nearPreviewEdge;
}

function setResizeEdgeHover(active) {
  dom.controlsPanel?.classList.toggle("is-edge-resize", active);
  dom.previewPanel?.classList.toggle("is-edge-resize", active);
}

function setSplitResizeMode(active) {
  document.body.classList.toggle("is-split-resizing", active);
}

function formatElapsedMs(elapsedMs) {
  const safeMs = Math.max(0, elapsedMs);
  if (safeMs < 10000) {
    return `${(safeMs / 1000).toFixed(2)}s`;
  }
  return `${(safeMs / 1000).toFixed(1)}s`;
}

function refreshRenderStatusChip() {
  if (!dom.renderStatusChip) {
    return;
  }
  dom.renderStatusChip.className = `render-status-chip ${state.renderStatusKind}`;
  if (state.renderStatusKind === "loading") {
    const elapsed = Date.now() - state.renderStartedAt;
    dom.renderStatusChip.textContent = `Rendering... ${formatElapsedMs(elapsed)}`;
    return;
  }
  if (state.renderStatusKind === "ok") {
    dom.renderStatusChip.textContent = `Rendered ${formatElapsedMs(state.renderElapsedMs)}`;
    return;
  }
  if (state.renderStatusKind === "error") {
    dom.renderStatusChip.textContent = `Error ${formatElapsedMs(state.renderElapsedMs)}`;
    return;
  }
  if (state.renderStatusKind === "timeout") {
    dom.renderStatusChip.textContent = `Timed out ${formatElapsedMs(state.renderElapsedMs)}`;
    return;
  }
  dom.renderStatusChip.textContent = "Idle";
}

function stopRenderStatusTimer() {
  window.clearInterval(renderStatusTimer);
  renderStatusTimer = null;
}

function beginRenderStatus(renderToken) {
  stopRenderStatusTimer();
  state.renderStatusKind = "loading";
  state.renderStartedAt = Date.now();
  state.renderElapsedMs = 0;
  state.renderToken = renderToken;
  refreshRenderStatusChip();
  renderStatusTimer = window.setInterval(() => {
    refreshRenderStatusChip();
  }, 120);
}

function completeRenderStatus(kind, renderToken) {
  if (renderToken !== state.renderToken) {
    return;
  }
  stopRenderStatusTimer();
  state.renderStatusKind = kind;
  state.renderElapsedMs = Math.max(0, Date.now() - state.renderStartedAt);
  refreshRenderStatusChip();
}

function setIdleRenderStatus() {
  stopRenderStatusTimer();
  state.renderStatusKind = "idle";
  state.renderStartedAt = 0;
  state.renderElapsedMs = 0;
  refreshRenderStatusChip();
}

function setInstantRenderStatus(kind) {
  stopRenderStatusTimer();
  state.renderStatusKind = kind;
  state.renderStartedAt = 0;
  state.renderElapsedMs = 0;
  refreshRenderStatusChip();
}

function setMenuOpenState(menu, shouldOpen) {
  if (!menu) {
    return;
  }
  menu.classList.toggle("is-open", shouldOpen);
  const trigger = menu.querySelector(".menu-trigger");
  if (trigger) {
    trigger.setAttribute("aria-expanded", String(shouldOpen));
  }
  if (!shouldOpen) {
    const panel = menu.querySelector(".menu-panel");
    if (panel) {
      delete panel.dataset.align;
      panel.style.removeProperty("left");
      panel.style.removeProperty("right");
    }
  }
}

function isFormatActionEnabled(action, format) {
  const list = action === "export" ? state.exportActionButtons : state.copyActionButtons;
  const match = list.find((button) => button.dataset.format === format);
  return Boolean(match && !match.disabled);
}

function closeMobileActionSheet(persist = true) {
  if (dom.mobileActionSheet) {
    dom.mobileActionSheet.hidden = true;
  }
  state.mobileActionSheetMode = "";
  if (persist) {
    persistUiPrefs();
  }
}

function buildMobileActionSheetButtons(mode) {
  const type = getActionDiagramType();
  const formats = mode === "copy" ? getCopySupportedFormatsForDiagram(type) : getSupportedFormatsForDiagram(type);
  const fragment = document.createDocumentFragment();

  if (mode === "copy") {
    formats.forEach((format) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost";
      button.textContent = `Copy ${getFormatDisplayName(format)}`;
      button.disabled = !isFormatActionEnabled("copy", format);
      button.addEventListener("click", () => {
        copyDiagramToClipboard(format);
        closeMobileActionSheet();
      });
      fragment.appendChild(button);
    });

    if (!dom.imageLinkBtn.hidden) {
      const imageLinkButton = document.createElement("button");
      imageLinkButton.type = "button";
      imageLinkButton.className = "btn btn-ghost";
      imageLinkButton.textContent = "Copy image link";
      imageLinkButton.disabled = dom.imageLinkBtn.disabled;
      imageLinkButton.addEventListener("click", () => {
        copyRenderedImageLink();
        closeMobileActionSheet();
      });
      fragment.appendChild(imageLinkButton);
    }

    const linkButton = document.createElement("button");
    linkButton.type = "button";
    linkButton.className = "btn btn-ghost";
    linkButton.textContent = "Copy editable link";
    linkButton.disabled = dom.editableLinkBtn.disabled;
    linkButton.addEventListener("click", () => {
      exportEditableLink();
      closeMobileActionSheet();
    });
    fragment.appendChild(linkButton);
  } else if (mode === "export") {
    formats.forEach((format) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-ghost";
      button.textContent = `Download ${getFormatDisplayName(format)}`;
      button.disabled = !isFormatActionEnabled("export", format);
      button.addEventListener("click", () => {
        exportDiagram(format);
        closeMobileActionSheet();
      });
      fragment.appendChild(button);
    });
  }

  return fragment;
}

function openMobileActionSheet(mode) {
  if (!dom.mobileActionSheet || !dom.mobileActionSheetBody || !dom.mobileActionSheetTitle) {
    return;
  }
  state.mobileActionSheetMode = mode;
  dom.mobileActionSheetTitle.textContent = mode === "copy" ? "Copy Actions" : "Download Actions";
  dom.mobileActionSheetBody.replaceChildren(buildMobileActionSheetButtons(mode));
  dom.mobileActionSheet.hidden = false;
  persistUiPrefs();
}

function recordRecentCommand(commandId) {
  if (!commandId) {
    return;
  }
  state.recentCommandIds = [commandId, ...state.recentCommandIds.filter((id) => id !== commandId)].slice(0, 10);
  persistUiPrefs();
}

function closeAllMenus(exceptMenu = null, persist = true) {
  dom.menus.forEach((menu) => {
    if (menu === exceptMenu) {
      return;
    }
    setMenuOpenState(menu, false);
  });
  if (persist) {
    persistUiPrefs();
  }
}

function positionMenuPanel(menu) {
  if (isCompactToolbarLayout()) {
    const panel = menu.querySelector(".menu-panel");
    if (panel) {
      delete panel.dataset.align;
      panel.style.removeProperty("left");
      panel.style.removeProperty("right");
    }
    return;
  }

  const panel = menu.querySelector(".menu-panel");
  if (!panel) {
    return;
  }

  delete panel.dataset.align;
  panel.style.removeProperty("left");
  panel.style.removeProperty("right");

  const menuRect = menu.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const panelWidth = panelRect.width;
  const viewportWidth = document.documentElement.clientWidth;
  const viewportMargin = 8;

  if (!panelWidth || !viewportWidth) {
    return;
  }

  const rightAlignedLeft = menuRect.left;
  const rightAlignedRight = rightAlignedLeft + panelWidth;
  const leftAlignedLeft = menuRect.right - panelWidth;
  const leftAlignedRight = menuRect.right;

  const rightFits = rightAlignedLeft >= viewportMargin && rightAlignedRight <= viewportWidth - viewportMargin;
  const leftFits = leftAlignedLeft >= viewportMargin && leftAlignedRight <= viewportWidth - viewportMargin;

  if (rightFits && !leftFits) {
    panel.dataset.align = "right";
    return;
  }

  if (leftFits && !rightFits) {
    panel.dataset.align = "left";
    return;
  }

  if (rightFits && leftFits) {
    const availableToRight = viewportWidth - viewportMargin - menuRect.left;
    const availableToLeft = menuRect.right - viewportMargin;
    panel.dataset.align = availableToRight >= availableToLeft ? "right" : "left";
    return;
  }

  const minLeft = viewportMargin;
  const maxLeft = Math.max(viewportMargin, viewportWidth - viewportMargin - panelWidth);
  const clampedLeft = Math.min(Math.max(menuRect.left, minLeft), maxLeft);
  const offsetLeft = clampedLeft - menuRect.left;

  panel.dataset.align = "custom";
  panel.style.left = `${Math.round(offsetLeft)}px`;
  panel.style.right = "auto";
}

function positionOpenMenus() {
  dom.menus.forEach((menu) => {
    if (!menu.classList.contains("is-open")) {
      return;
    }
    positionMenuPanel(menu);
  });
}

function focusAdjacentMenuTrigger(currentTrigger, direction) {
  const triggerIndex = dom.menuTriggers.indexOf(currentTrigger);
  if (triggerIndex < 0) {
    return;
  }
  const nextIndex = (triggerIndex + direction + dom.menuTriggers.length) % dom.menuTriggers.length;
  dom.menuTriggers[nextIndex]?.focus();
}

function focusFirstMenuButton(menu) {
  const firstButton = menu.querySelector(".menu-panel button:not([disabled])");
  if (firstButton instanceof HTMLElement) {
    firstButton.focus();
  }
}

function runMenuShortcut(menuName) {
  if (!menuName) {
    return;
  }
  if (menuName === "command") {
    closeAllMenus();
    closeToolbarDropdown();
    closeMobileActionSheet();
    openCommandPalette();
    return;
  }
  if (menuName === "focus") {
    closeAllMenus();
    closeToolbarDropdown();
    closeMobileActionSheet();
    toggleFocusMode();
    return;
  }

  const menu = getMenuByName(menuName);
  if (!menu) {
    return;
  }
  const trigger = menu.querySelector(".menu-trigger");
  if (trigger instanceof HTMLElement) {
    trigger.click();
  }
}

function focusPanelButtonFrom(currentButton, direction) {
  if (!(currentButton instanceof HTMLElement)) {
    return;
  }
  const panel = currentButton.closest(".menu-panel");
  if (!panel) {
    return;
  }
  const buttons = Array.from(panel.querySelectorAll("button:not([disabled])"));
  const index = buttons.indexOf(currentButton);
  if (index < 0 || buttons.length === 0) {
    return;
  }
  const nextIndex = (index + direction + buttons.length) % buttons.length;
  const nextButton = buttons[nextIndex];
  if (nextButton instanceof HTMLElement) {
    nextButton.focus();
  }
}

function setupTopMenuInteractions() {
  if (topMenuListenersAttached) {
    return;
  }
  topMenuListenersAttached = true;

  if (dom.toolbarMenuToggle && dom.topToolbar) {
    dom.toolbarMenuToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !dom.topToolbar.classList.contains("is-open");
      dom.topToolbar.classList.toggle("is-open", shouldOpen);
      dom.toolbarMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
      if (!shouldOpen) {
        closeAllMenus();
        closeMobileActionSheet();
      }
      persistUiPrefs();
      window.requestAnimationFrame(() => {
        positionResponsiveToolbarToVisibleViewport();
      });
    });

    dom.toolbarMenuToggle.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      if (!dom.topToolbar?.classList.contains("is-open")) {
        dom.toolbarMenuToggle?.click();
      }
      const firstTrigger = dom.menuTriggers[0];
      if (firstTrigger instanceof HTMLElement) {
        window.requestAnimationFrame(() => {
          firstTrigger.focus();
        });
      }
    });
  }

  dom.menuTriggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", () => {
      positionMenuTooltips();
    });
    trigger.addEventListener("focus", () => {
      positionMenuTooltips();
    });

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const menu = trigger.closest(".menu");
      if (!menu) {
        return;
      }
      const menuName = menu.dataset.menu || "";
      if (menuName === "command") {
        closeAllMenus();
        closeToolbarDropdown();
        closeMobileActionSheet();
        openCommandPalette();
        persistUiPrefs();
        return;
      }
      if (menuName === "focus") {
        closeAllMenus();
        closeToolbarDropdown();
        closeMobileActionSheet();
        toggleFocusMode();
        persistUiPrefs();
        return;
      }
      if (isCompactToolbarLayout() && (menuName === "copy" || menuName === "export")) {
        closeAllMenus(null, false);
        closeToolbarDropdown();
        if (state.mobileActionSheetMode === menuName && dom.mobileActionSheet && !dom.mobileActionSheet.hidden) {
          closeMobileActionSheet();
        } else {
          openMobileActionSheet(menuName);
        }
        trigger.setAttribute("aria-expanded", "false");
        return;
      }

      const shouldOpen = !menu.classList.contains("is-open");
      if (!shouldOpen) {
        setMenuOpenState(menu, false);
        persistUiPrefs();
        return;
      }
      closeAllMenus(menu);
      closeMobileActionSheet();
      setMenuOpenState(menu, true);
      persistUiPrefs();
      window.requestAnimationFrame(() => {
        positionMenuPanel(menu);
      });
    });

    trigger.addEventListener("keydown", (event) => {
      const menu = trigger.closest(".menu");
      if (!menu) {
        return;
      }
      const menuName = menu.dataset.menu || "";
      if (menuName === "command" || menuName === "focus") {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          runMenuShortcut(menuName);
        }
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusAdjacentMenuTrigger(trigger, 1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusAdjacentMenuTrigger(trigger, -1);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!menu.classList.contains("is-open")) {
          trigger.click();
        }
        focusFirstMenuButton(menu);
      }
    });
  });

  dom.menus.forEach((menu) => {
    const panel = menu.querySelector(".menu-panel");
    if (!panel) {
      return;
    }
    panel.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const clickedButton = event.target.closest("button");
      if (!clickedButton || !panel.contains(clickedButton)) {
        return;
      }
      if (menu.dataset.menu === "theme") {
        persistUiPrefs();
        return;
      }
      closeAllMenus();
      persistUiPrefs();
    });

    panel.addEventListener("keydown", (event) => {
      const targetButton = event.target instanceof HTMLElement ? event.target : null;
      if (!targetButton || targetButton.tagName !== "BUTTON") {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusPanelButtonFrom(targetButton, 1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusPanelButtonFrom(targetButton, -1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        const first = panel.querySelector("button:not([disabled])");
        if (first instanceof HTMLElement) {
          first.focus();
        }
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        const buttons = Array.from(panel.querySelectorAll("button:not([disabled])"));
        const last = buttons[buttons.length - 1];
        if (last instanceof HTMLElement) {
          last.focus();
        }
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (!event.target.closest(".menu")) {
      closeAllMenus();
    }
    if (!event.target.closest(".top-toolbar")) {
      closeToolbarDropdown();
    }
    if (!event.target.closest(".mobile-action-sheet-panel")) {
      closeMobileActionSheet();
    }
    positionResponsiveToolbarToVisibleViewport();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      const menuName = MENU_SHORTCUTS[event.key.toLowerCase()];
      if (menuName) {
        if (isTypingElement(event.target)) {
          return;
        }
        event.preventDefault();
        runMenuShortcut(menuName);
        return;
      }
    }
    if (event.key === "Escape") {
      closeAllMenus();
      closeToolbarDropdown();
      closeMobileActionSheet();
      positionResponsiveToolbarToVisibleViewport();
    }
  });

  if (dom.mobileActionSheetClose) {
    dom.mobileActionSheetClose.addEventListener("click", () => {
      closeMobileActionSheet();
    });
  }
  dom.mobileActionSheetCloseElements.forEach((element) => {
    element.addEventListener("click", () => {
      closeMobileActionSheet();
    });
  });
}

function setupFocusModeInteractions() {
  if (focusModeListenersAttached) {
    return;
  }
  focusModeListenersAttached = true;

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (isFocusShortcut(event)) {
      event.preventDefault();
      runMenuShortcut("focus");
      return;
    }

    if (event.key === "Escape" && state.focusMode) {
      event.preventDefault();
      setFocusMode(false, { focusSource: true });
    }
  });

  document.addEventListener("pointerdown", () => {
    if (!dom.focusModeToast || dom.focusModeToast.hidden) {
      return;
    }
    hideFocusModeToast(false);
  });
}

function getThemeFamilyLabel(family) {
  const button = dom.themeFamilyButtons.find((item) => item.dataset.themeFamily === family);
  if (button) {
    return button.textContent?.trim() || family;
  }
  return family
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function getCommandPaletteCommands() {
  const currentTheme = getThemeSelection(state.themeId);
  const sortedDiagramCatalog = [...DIAGRAM_CATALOG].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );

  const actionType = getActionDiagramType();
  const exportFormats = getSupportedFormatsForDiagram(actionType);
  const copyFormats = getCopySupportedFormatsForDiagram(actionType);
  const copyCommands = [];
  const downloadCommands = [];
  const themeCommands = [];
  const diagramCommands = [];
  const focusServerUrlCommand = {
    id: "focus-server-url",
    group: "Navigation",
    label: "Focus Kroki Server URL",
    keywords: "focus server kroki url backend",
    run: () => {
      if (dom.configDetails && !dom.configDetails.open) {
        dom.configDetails.open = true;
      }
      if (dom.serverUrl) {
        dom.serverUrl.focus();
        dom.serverUrl.select();
      }
    },
  };
  const focusModeCommand = {
    id: "toggle-focus-mode",
    group: "View",
    label: state.focusMode ? "Exit Focus Mode" : "Enter Focus Mode",
    keywords: "focus mode toggle fullscreen zen",
    run: () => {
      toggleFocusMode();
    },
  };

  copyFormats.forEach((format) => {
    copyCommands.push({
      id: `copy-${format}`,
      group: "Copy",
      label: `Copy ${getFormatDisplayName(format)}`,
      keywords: `copy ${format}`,
      run: () => {
        copyDiagramToClipboard(format);
      },
    });
  });

  if (!dom.imageLinkBtn.hidden && !dom.imageLinkBtn.disabled) {
    copyCommands.push({
      id: "copy-image-link",
      group: "Copy",
      label: "Copy image link",
      keywords: "copy image link svg",
      run: () => {
        copyRenderedImageLink();
      },
    });
  }
  if (!dom.editableLinkBtn.disabled) {
    copyCommands.push({
      id: "copy-editable-link",
      group: "Copy",
      label: "Copy editable link",
      keywords: "copy editable link share",
      run: () => {
        exportEditableLink();
      },
    });
  }

  exportFormats.forEach((format) => {
    downloadCommands.push({
      id: `export-${format}`,
      group: "Download",
      label: `Download ${getFormatDisplayName(format)}`,
      keywords: `export download ${format}`,
      run: () => {
        exportDiagram(format);
      },
    });
  });

  Object.keys(THEME_FAMILIES).forEach((family) => {
    const familyLabel = getThemeFamilyLabel(family);
    themeCommands.push({
      id: `theme-family-${family}`,
      group: "Theme",
      label: `Theme family: ${familyLabel}`,
      keywords: `theme family ${familyLabel} ${family}`,
      run: () => {
        applyTheme(getThemeId(family, currentTheme.mode));
      },
    });
  });

  themeCommands.push({
    id: "theme-mode-dark",
    group: "Theme",
    label: "Theme mode: Dark",
    keywords: "theme mode dark",
    run: () => {
      applyTheme(getThemeId(currentTheme.family, "dark"));
    },
  });
  themeCommands.push({
    id: "theme-mode-light",
    group: "Theme",
    label: "Theme mode: Light",
    keywords: "theme mode light",
    run: () => {
      applyTheme(getThemeId(currentTheme.family, "light"));
    },
  });

  diagramCommands.push({
    id: "diagram-auto",
    group: "Diagram Type",
    label: "Use Auto Detect",
    keywords: "diagram type auto detect",
    run: () => {
      dom.diagramType.value = AUTO_DIAGRAM_TYPE_ID;
      dom.diagramType.dispatchEvent(new Event("change", { bubbles: true }));
    },
  });

  sortedDiagramCatalog.forEach((diagram) => {
    diagramCommands.push({
      id: `diagram-${diagram.id}`,
      group: "Diagram Type",
      label: `Use ${diagram.label}`,
      keywords: `diagram type ${diagram.label} ${diagram.id}`,
      run: () => {
        dom.diagramType.value = diagram.id;
        dom.diagramType.dispatchEvent(new Event("change", { bubbles: true }));
      },
    });
  });

  const orderedCommands = [
    focusServerUrlCommand,
    focusModeCommand,
    ...copyCommands,
    ...downloadCommands,
    ...themeCommands,
    ...diagramCommands,
  ];
  const byId = new Map(orderedCommands.map((command) => [command.id, command]));
  const recentCommands = state.recentCommandIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((command) => ({
      ...command,
      group: "Recent",
    }));

  return [
    ...recentCommands,
    focusServerUrlCommand,
    focusModeCommand,
    ...copyCommands,
    ...downloadCommands,
    ...themeCommands,
    ...diagramCommands,
  ];
}

function renderCommandPaletteResults(filteredCommands) {
  if (!dom.commandPaletteList) {
    return;
  }
  dom.commandPaletteList.replaceChildren();

  if (filteredCommands.length === 0) {
    const empty = document.createElement("li");
    empty.className = "command-palette-empty";
    empty.textContent = "No matching commands";
    dom.commandPaletteList.appendChild(empty);
    return;
  }

  filteredCommands.forEach((command, index) => {
    const item = document.createElement("li");
    item.role = "presentation";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-palette-option";
    if (index === state.commandPaletteActiveIndex) {
      button.classList.add("is-active");
    }
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === state.commandPaletteActiveIndex));
    button.id = `commandPaletteOption-${index}`;
    button.tabIndex = index === state.commandPaletteActiveIndex ? 0 : -1;
    button.dataset.index = String(index);
    button.innerHTML = `<span class="command-palette-group">${command.group}</span><span class="command-palette-label">${command.label}</span>`;
    button.addEventListener("click", () => {
      state.commandPaletteActiveIndex = index;
      executeCommandPaletteCommand(command);
    });

    item.appendChild(button);
    dom.commandPaletteList.appendChild(item);
  });

  const activeOption = dom.commandPaletteList.querySelector(".command-palette-option.is-active");
  if (activeOption instanceof HTMLElement) {
    dom.commandPaletteList.setAttribute("aria-activedescendant", activeOption.id);
  } else {
    dom.commandPaletteList.removeAttribute("aria-activedescendant");
  }
}

function executeCommandPaletteCommand(command) {
  if (!command || typeof command.run !== "function") {
    return;
  }
  closeCommandPalette(false);
  recordRecentCommand(command.id);
  command.run();
}

function getFilteredCommandPaletteCommands(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return state.commandPaletteCommands;
  }
  return state.commandPaletteCommands.filter((command) => {
    const haystack = `${command.group} ${command.label} ${command.keywords}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

function refreshCommandPalette() {
  if (!dom.commandPaletteInput) {
    return;
  }
  const filtered = getFilteredCommandPaletteCommands(dom.commandPaletteInput.value);
  if (state.commandPaletteActiveIndex >= filtered.length) {
    state.commandPaletteActiveIndex = Math.max(0, filtered.length - 1);
  }
  renderCommandPaletteResults(filtered);
  scrollActiveCommandPaletteOptionIntoView();
}

function focusActiveCommandPaletteOption() {
  if (!dom.commandPaletteList) {
    return;
  }
  const activeOption = dom.commandPaletteList.querySelector(".command-palette-option.is-active");
  if (activeOption instanceof HTMLElement) {
    activeOption.focus();
    activeOption.scrollIntoView({ block: "nearest" });
  }
}

function scrollActiveCommandPaletteOptionIntoView() {
  if (!dom.commandPaletteList) {
    return;
  }
  const activeOption = dom.commandPaletteList.querySelector(".command-palette-option.is-active");
  if (activeOption instanceof HTMLElement) {
    activeOption.scrollIntoView({ block: "nearest" });
  }
}

function moveCommandPaletteSelection(nextIndex) {
  const filtered = getFilteredCommandPaletteCommands(dom.commandPaletteInput?.value || "");
  if (filtered.length === 0) {
    return;
  }
  const boundedIndex = Math.min(filtered.length - 1, Math.max(0, nextIndex));
  state.commandPaletteActiveIndex = boundedIndex;
  refreshCommandPalette();
}

function closeCommandPalette(refocusEditor = true) {
  if (!dom.commandPalette || dom.commandPalette.hidden) {
    return;
  }
  dom.commandPalette.hidden = true;
  state.commandPaletteCommands = [];
  state.commandPaletteActiveIndex = 0;
  if (refocusEditor && dom.diagramSource) {
    dom.diagramSource.focus();
  }
}

function openCommandPalette() {
  if (!dom.commandPalette || !dom.commandPaletteInput) {
    return;
  }
  state.commandPaletteCommands = getCommandPaletteCommands();
  state.commandPaletteActiveIndex = 0;
  dom.commandPaletteInput.value = "";
  dom.commandPalette.hidden = false;
  refreshCommandPalette();
  window.requestAnimationFrame(() => {
    dom.commandPaletteInput?.focus();
  });
}

function applyUiPrefs() {
  const prefs = readUiPrefs();
  closeAllMenus(null, false);
  closeMobileActionSheet(false);
  if (Array.isArray(prefs.recentCommandIds)) {
    state.recentCommandIds = prefs.recentCommandIds.filter((id) => typeof id === "string").slice(0, 10);
  } else {
    state.recentCommandIds = [];
  }
  if (typeof prefs.paneWidthPercent === "number" && !Number.isNaN(prefs.paneWidthPercent)) {
    applyPaneWidthPercent(prefs.paneWidthPercent, false);
  } else {
    applyPaneWidthPercent(state.paneWidthPercent, false);
  }

  const openMenus = Array.isArray(prefs.openMenus) ? prefs.openMenus : [];
  openMenus.forEach((menuName) => {
    if (isCompactToolbarLayout() && (menuName === "copy" || menuName === "export")) {
      return;
    }
    const menu = getMenuByName(menuName);
    if (menu) {
      setMenuOpenState(menu, true);
      positionMenuPanel(menu);
    }
  });

  if (isCompactToolbarLayout() && dom.topToolbar && prefs.toolbarOpen) {
    dom.topToolbar.classList.add("is-open");
    if (dom.toolbarMenuToggle) {
      dom.toolbarMenuToggle.setAttribute("aria-expanded", "true");
    }
  }

  if (
    isCompactToolbarLayout() &&
    (prefs.mobileActionSheetMode === "copy" || prefs.mobileActionSheetMode === "export")
  ) {
    openMobileActionSheet(prefs.mobileActionSheetMode);
  }
}

function setupSplitPaneInteractions() {
  if (!dom.workspace || !dom.controlsPanel || !dom.previewPanel) {
    return;
  }

  dom.workspace.addEventListener("pointermove", (event) => {
    if (splitResizeActive && event.pointerId === splitPointerId) {
      updatePaneWidthFromPointerClientX(event.clientX);
      return;
    }
    setResizeEdgeHover(isPointerNearResizeEdge(event.clientX, event.clientY));
  });

  dom.workspace.addEventListener("pointerleave", () => {
    if (!splitResizeActive) {
      setResizeEdgeHover(false);
    }
  });

  dom.workspace.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || isCompactToolbarLayout()) {
      return;
    }
    if (!(event.target instanceof Element)) {
      return;
    }
    const panelTarget = event.target.closest(".controls-panel, .preview-panel");
    if (!panelTarget || !isPointerNearResizeEdge(event.clientX, event.clientY)) {
      return;
    }
    splitResizeActive = true;
    splitPointerId = event.pointerId;
    if (typeof dom.workspace.setPointerCapture === "function") {
      dom.workspace.setPointerCapture(event.pointerId);
    }
    setResizeEdgeHover(true);
    setSplitResizeMode(true);
    updatePaneWidthFromPointerClientX(event.clientX);
    event.preventDefault();
  });

  const endResize = (event) => {
    if (!splitResizeActive || event.pointerId !== splitPointerId) {
      return;
    }
    splitResizeActive = false;
    setSplitResizeMode(false);
    setResizeEdgeHover(false);
    splitPointerId = null;
    if (
      typeof dom.workspace.releasePointerCapture === "function" &&
      typeof dom.workspace.hasPointerCapture === "function" &&
      dom.workspace.hasPointerCapture(event.pointerId)
    ) {
      dom.workspace.releasePointerCapture(event.pointerId);
    }
    updatePaneWidthFromPointerClientX(event.clientX, true);
  };

  dom.workspace.addEventListener("pointerup", endResize);
  dom.workspace.addEventListener("pointercancel", endResize);

  if (!dom.splitHandle) {
    return;
  }
  dom.splitHandle.addEventListener("keydown", (event) => {
    if (isCompactToolbarLayout()) {
      return;
    }
    const step = event.shiftKey ? 5 : 2;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      applyPaneWidthPercent(state.paneWidthPercent - step);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      applyPaneWidthPercent(state.paneWidthPercent + step);
    }
  });
}

function setupCommandPaletteInteractions() {
  if (!dom.commandPalette || !dom.commandPaletteInput) {
    return;
  }

  dom.commandPaletteCloseElements.forEach((item) => {
    item.addEventListener("click", () => {
      closeCommandPalette();
    });
  });

  dom.commandPaletteInput.addEventListener("input", () => {
    state.commandPaletteActiveIndex = 0;
    refreshCommandPalette();
  });

  dom.commandPaletteInput.addEventListener("keydown", (event) => {
    const filtered = getFilteredCommandPaletteCommands(dom.commandPaletteInput.value);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (filtered.length === 0) {
        return;
      }
      moveCommandPaletteSelection((state.commandPaletteActiveIndex + 1) % filtered.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (filtered.length === 0) {
        return;
      }
      moveCommandPaletteSelection((state.commandPaletteActiveIndex - 1 + filtered.length) % filtered.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveCommandPaletteSelection(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      moveCommandPaletteSelection(filtered.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = filtered[state.commandPaletteActiveIndex];
      if (!selected) {
        return;
      }
      executeCommandPaletteCommand(selected);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeCommandPalette();
      return;
    }
    if (event.key === "Tab" && !event.shiftKey) {
      if (filtered.length === 0) {
        return;
      }
      event.preventDefault();
      focusActiveCommandPaletteOption();
    }
  });

  if (dom.commandPaletteList) {
    dom.commandPaletteList.addEventListener("keydown", (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest(".command-palette-option") : null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const filtered = getFilteredCommandPaletteCommands(dom.commandPaletteInput?.value || "");
      const currentIndex = Number.parseInt(target.dataset.index || "-1", 10);
      if (currentIndex >= 0 && currentIndex !== state.commandPaletteActiveIndex) {
        state.commandPaletteActiveIndex = currentIndex;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (filtered.length === 0) {
          return;
        }
        moveCommandPaletteSelection((state.commandPaletteActiveIndex + 1) % filtered.length);
        focusActiveCommandPaletteOption();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (filtered.length === 0) {
          return;
        }
        moveCommandPaletteSelection((state.commandPaletteActiveIndex - 1 + filtered.length) % filtered.length);
        focusActiveCommandPaletteOption();
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        moveCommandPaletteSelection(0);
        focusActiveCommandPaletteOption();
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        moveCommandPaletteSelection(filtered.length - 1);
        focusActiveCommandPaletteOption();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const selected = filtered[state.commandPaletteActiveIndex];
        if (selected) {
          executeCommandPaletteCommand(selected);
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeCommandPalette();
        return;
      }
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        dom.commandPaletteInput?.focus();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (isShortcut) {
      event.preventDefault();
      if (dom.commandPalette.hidden) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
      return;
    }

    if (event.key === "Escape" && dom.commandPalette && !dom.commandPalette.hidden) {
      event.preventDefault();
      closeCommandPalette();
    }
  });
}

function syncRenderBoxHeight() {
  if (!dom.renderBox || !dom.controlsPanel || !dom.previewPanel) {
    return;
  }

  if (window.matchMedia(COMPACT_UI_MEDIA_QUERY).matches) {
    dom.renderBox.style.maxHeight = "";
    updateRenderScrollState();
    return;
  }

  const controlsHeight = dom.controlsPanel.getBoundingClientRect().height;
  const previewStyles = window.getComputedStyle(dom.previewPanel);
  const paddingTop = Number.parseFloat(previewStyles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(previewStyles.paddingBottom) || 0;

  let availableHeight = controlsHeight - paddingTop - paddingBottom;

  if (dom.debugPanel && !dom.debugPanel.hidden) {
    const debugHeight = dom.debugPanel.getBoundingClientRect().height;
    const debugStyles = window.getComputedStyle(dom.debugPanel);
    const debugMarginTop = Number.parseFloat(debugStyles.marginTop) || 0;
    availableHeight -= debugHeight + debugMarginTop;
  }

  const nextMax = Math.max(220, Math.floor(availableHeight));
  dom.renderBox.style.maxHeight = `${nextMax}px`;
  updateRenderScrollState();
}

function getDiagramLabel(diagramType) {
  if (diagramType === AUTO_DIAGRAM_TYPE_ID) {
    return "Auto detect";
  }
  const diagram = DIAGRAM_CATALOG.find((item) => item.id === diagramType);
  return diagram?.label || diagramType;
}

function getDiagramTypeOptionLabel(diagramType) {
  if (diagramType === AUTO_DIAGRAM_TYPE_ID) {
    if (dom.diagramType.value === AUTO_DIAGRAM_TYPE_ID && state.resolvedDiagramType) {
      return `Auto Detect (${getDiagramLabel(state.resolvedDiagramType)})`;
    }
    return "Auto Detect";
  }
  return getDiagramLabel(diagramType);
}

function closeDiagramTypeDropdown(focusTrigger = false) {
  if (!dom.diagramTypeDropdown || !dom.diagramTypeTrigger) {
    return;
  }
  dom.diagramTypeDropdown.classList.remove("is-open");
  dom.diagramTypeTrigger.setAttribute("aria-expanded", "false");
  if (focusTrigger) {
    dom.diagramTypeTrigger.focus();
  }
}

function refreshDiagramTypeDropdownUi() {
  if (!dom.diagramTypeTriggerText || !dom.diagramTypeList || !dom.diagramType) {
    return;
  }

  const selectedValue = dom.diagramType.value;
  dom.diagramTypeTriggerText.textContent = getDiagramTypeOptionLabel(selectedValue);
  const optionButtons = Array.from(dom.diagramTypeList.querySelectorAll(".diagram-type-option"));
  optionButtons.forEach((button) => {
    const value = button.dataset.value || "";
    button.classList.toggle("is-selected", value === selectedValue);
    button.setAttribute("aria-selected", String(value === selectedValue));
    if (value === AUTO_DIAGRAM_TYPE_ID) {
      button.textContent = getDiagramTypeOptionLabel(AUTO_DIAGRAM_TYPE_ID);
    }
  });
}

function setupDiagramTypeDropdownInteractions() {
  if (!dom.diagramTypeDropdown || !dom.diagramTypeTrigger || !dom.diagramTypeList || !dom.diagramType) {
    return;
  }

  dom.diagramTypeTrigger.addEventListener("click", () => {
    const shouldOpen = !dom.diagramTypeDropdown.classList.contains("is-open");
    if (shouldOpen) {
      dom.diagramTypeDropdown.classList.add("is-open");
      dom.diagramTypeTrigger.setAttribute("aria-expanded", "true");
      const selectedOption = dom.diagramTypeList.querySelector(".diagram-type-option.is-selected");
      (selectedOption || dom.diagramTypeList.querySelector(".diagram-type-option"))?.focus();
      return;
    }
    closeDiagramTypeDropdown();
  });

  dom.diagramTypeTrigger.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    if (!dom.diagramTypeDropdown.classList.contains("is-open")) {
      dom.diagramTypeTrigger.click();
    }
  });

  dom.diagramTypeList.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target.closest(".diagram-type-option") : null;
    if (!target) {
      return;
    }
    const nextValue = target.dataset.value || "";
    if (!nextValue) {
      return;
    }
    if (nextValue === dom.diagramType.value) {
      closeDiagramTypeDropdown(true);
      return;
    }
    dom.diagramType.value = nextValue;
    dom.diagramType.dispatchEvent(new Event("change", { bubbles: true }));
    closeDiagramTypeDropdown(true);
  });

  dom.diagramTypeList.addEventListener("keydown", (event) => {
    const buttons = Array.from(dom.diagramTypeList.querySelectorAll(".diagram-type-option"));
    if (!buttons.length) {
      return;
    }
    const current = event.target instanceof HTMLElement ? event.target.closest(".diagram-type-option") : null;
    const index = current ? buttons.indexOf(current) : -1;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDiagramTypeDropdown(true);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = index < 0 ? 0 : (index + direction + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      current?.click();
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    if (!event.target.closest("#diagramTypeDropdown")) {
      closeDiagramTypeDropdown();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (dom.diagramTypeDropdown.classList.contains("is-open")) {
      closeDiagramTypeDropdown(true);
    }
  });
}

function getMenuDiagramType() {
  if (dom.diagramType.value === AUTO_DIAGRAM_TYPE_ID) {
    return state.resolvedDiagramType || "";
  }
  return dom.diagramType.value;
}

function getActionDiagramType() {
  return getMenuDiagramType();
}

function refreshAutoDetectionUi() {
  const autoOption = dom.diagramType?.querySelector(`option[value="${AUTO_DIAGRAM_TYPE_ID}"]`);
  if (autoOption) {
    autoOption.textContent = getDiagramTypeOptionLabel(AUTO_DIAGRAM_TYPE_ID);
  }
  refreshDiagramTypeDropdownUi();

  if (!dom.autoDetectMeta) {
    return;
  }

  if (dom.diagramType.value !== AUTO_DIAGRAM_TYPE_ID) {
    dom.autoDetectMeta.textContent = "-";
    return;
  }

  if (!dom.diagramSource.value.trim()) {
    dom.autoDetectMeta.textContent = "Enabled";
    return;
  }

  if (!state.resolvedDiagramType) {
    dom.autoDetectMeta.textContent = "Waiting for renderable match";
    return;
  }

  const detection = state.autoDetection;
  const resolvedLabel = getDiagramLabel(state.resolvedDiagramType);
  if (detection && typeof detection.confidence === "number") {
    const confidencePercent = Math.round(detection.confidence * 100);
    const via = detection.validated ? ", validated" : "";
    dom.autoDetectMeta.textContent = `${resolvedLabel} (${confidencePercent}%)${via}`;
    return;
  }

  dom.autoDetectMeta.textContent = resolvedLabel;
}

function updateResolvedDiagramType(diagramType, detection = null) {
  state.resolvedDiagramType = diagramType || "";
  state.autoDetection = detection;
  refreshAutoDetectionUi();
}

function getSupportedFormatsForDiagram(diagramType) {
  if (!diagramType) {
    return [];
  }
  return DIAGRAM_FORMAT_SUPPORT[diagramType] || [];
}

function getCopySupportedFormatsForDiagram(diagramType) {
  return getSupportedFormatsForDiagram(diagramType).filter((format) => format !== "pdf");
}

function supportsDiagramFormat(diagramType, format) {
  return getSupportedFormatsForDiagram(diagramType).includes(format);
}

function getPreferredPreviewFormat(diagramType) {
  if (supportsDiagramFormat(diagramType, "svg")) {
    return "svg";
  }
  if (supportsDiagramFormat(diagramType, "png")) {
    return "png";
  }
  return PREVIEW_FORMAT;
}

function getFormatDisplayName(format) {
  return format.toUpperCase();
}

function getFormatMimeType(format) {
  const map = {
    svg: "image/svg+xml",
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    pdf: "application/pdf",
    txt: "text/plain; charset=utf-8",
    base64: "text/plain; charset=utf-8",
  };
  return map[format] || "application/octet-stream";
}

function isTextualFormat(format) {
  return format === "svg" || format === "txt" || format === "base64";
}

function createFormatActionButton(action, format) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-ghost";
  button.dataset.format = format;

  const formatName = getFormatDisplayName(format);
  if (action === "export") {
    button.textContent = `Download ${formatName}`;
    button.title = `Download diagram as ${formatName}`;
    button.addEventListener("click", () => {
      exportDiagram(format);
    });
  } else {
    button.textContent = `Copy ${formatName}`;
    button.title = `Copy ${formatName} to clipboard`;
    button.addEventListener("click", () => {
      copyDiagramToClipboard(format);
    });
  }

  return button;
}

function rebuildFormatActionButtons() {
  if (!dom.exportFormatButtons || !dom.copyFormatButtons) {
    return;
  }

  const diagramType = getMenuDiagramType();
  const exportFormats = getSupportedFormatsForDiagram(diagramType);
  const copyFormats = getCopySupportedFormatsForDiagram(diagramType);
  state.exportActionButtons = [];
  state.copyActionButtons = [];

  dom.exportFormatButtons.replaceChildren();
  dom.copyFormatButtons.replaceChildren();

  exportFormats.forEach((format) => {
    const exportButton = createFormatActionButton("export", format);
    dom.exportFormatButtons.appendChild(exportButton);
    state.exportActionButtons.push(exportButton);
  });

  copyFormats.forEach((format) => {
    const copyButton = createFormatActionButton("copy", format);
    dom.copyFormatButtons.appendChild(copyButton);
    state.copyActionButtons.push(copyButton);
  });

  positionOpenMenus();
}

function setActionButtonsEnabled(enabled) {
  const diagramType = getActionDiagramType();
  const supportsImageLinkFormat = supportsDiagramFormat(diagramType, COPY_IMAGE_LINK_FORMAT);
  const hasServerAndSource = Boolean(normalizeServerUrl(dom.serverUrl.value || "") && dom.diagramSource.value.trim());
  state.exportActionButtons.forEach((button) => {
    const format = button.dataset.format || "";
    button.disabled = !enabled || !supportsDiagramFormat(diagramType, format);
  });
  state.copyActionButtons.forEach((button) => {
    const format = button.dataset.format || "";
    button.disabled = !enabled || !supportsDiagramFormat(diagramType, format);
  });
  dom.editableLinkBtn.disabled = !enabled;
  dom.imageLinkBtn.hidden = !diagramType || !supportsImageLinkFormat;
  dom.imageLinkBtn.disabled = !diagramType || !supportsImageLinkFormat || !hasServerAndSource;
}

function populateDiagramTypeOptions() {
  dom.diagramType.replaceChildren();
  if (dom.diagramTypeList) {
    dom.diagramTypeList.replaceChildren();
  }
  const autoOption = document.createElement("option");
  autoOption.value = AUTO_DIAGRAM_TYPE_ID;
  autoOption.textContent = "Auto Detect";
  dom.diagramType.appendChild(autoOption);

  if (dom.diagramTypeList) {
    const autoButtonItem = document.createElement("li");
    autoButtonItem.setAttribute("role", "presentation");
    const autoButton = document.createElement("button");
    autoButton.type = "button";
    autoButton.className = "diagram-type-option";
    autoButton.dataset.value = AUTO_DIAGRAM_TYPE_ID;
    autoButton.setAttribute("role", "option");
    autoButton.textContent = "Auto Detect";
    autoButtonItem.appendChild(autoButton);
    dom.diagramTypeList.appendChild(autoButtonItem);
  }

  const sortedCatalog = [...DIAGRAM_CATALOG].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );

  sortedCatalog.forEach((diagram) => {
    const option = document.createElement("option");
    option.value = diagram.id;
    option.textContent = diagram.label;
    dom.diagramType.appendChild(option);

    if (dom.diagramTypeList) {
      const item = document.createElement("li");
      item.setAttribute("role", "presentation");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "diagram-type-option";
      button.dataset.value = diagram.id;
      button.setAttribute("role", "option");
      button.textContent = diagram.label;
      item.appendChild(button);
      dom.diagramTypeList.appendChild(item);
    }
  });

  refreshDiagramTypeDropdownUi();
}

function getSampleForDiagramType(diagramType) {
  return DIAGRAM_SAMPLES.get(diagramType) || "";
}

function applySampleForDiagramType(diagramType, options = {}) {
  const { persist = true, render = true } = options;
  if (diagramType === AUTO_DIAGRAM_TYPE_ID) {
    if (persist) {
      saveStateToHash();
    }
    if (render) {
      scheduleAutoRender();
    }
    return;
  }

  dom.diagramSource.value = getSampleForDiagramType(diagramType);
  updateSourceScrollState();

  if (persist) {
    saveStateToHash();
  }
  if (render) {
    scheduleAutoRender();
  }
}

function getThemeSelection(themeId) {
  const normalized = normalizeThemeId(themeId, DEFAULT_THEME_ID);
  return parseThemeId(normalized) || { family: "renderrig-classic", mode: "light" };
}

function applyTheme(themeId, persist = true) {
  const normalizedTheme = applyThemeTokens(themeId, {
    rootEl: document.documentElement,
    familyButtons: dom.themeFamilyButtons,
    modeButtons: dom.themeModeButtons,
    fallbackThemeId: DEFAULT_THEME_ID,
  });
  state.themeId = normalizedTheme;

  if (persist) {
    saveStateToHash();
  }
}

function cleanupObjectUrl() {
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = "";
  }
}

function refreshDebugModeUi() {
  dom.debugPanel.hidden = !state.debugMode;
  dom.debugModeBtn.textContent = `Debug: ${state.debugMode ? "On" : "Off"}`;
  dom.debugModeBtn.classList.toggle("is-active", state.debugMode);
  if (dom.hostedUrlMeta) {
    dom.hostedUrlMeta.textContent = getCurrentAppUrl() || "-";
  }
  refreshRequestTimingMeta();
  syncRenderBoxHeight();
}

function setDebugMode(enabled, persist = true) {
  state.debugMode = enabled;
  refreshDebugModeUi();

  if (persist) {
    saveStateToHash();
  }
}

function formatRequestDetails(requestDetails) {
  if (!requestDetails) {
    return "-";
  }

  const method = requestDetails.method || "GET";
  const url = requestDetails.url || "";
  const headers = requestDetails.headers || {};
  const body = requestDetails.body;
  const lines = [];

  lines.push(`${method} ${url}`);
  const headerEntries = Object.entries(headers);
  if (headerEntries.length === 0) {
    lines.push("Headers: (none)");
  } else {
    lines.push("Headers:");
    headerEntries.forEach(([name, value]) => {
      lines.push(`  ${name}: ${value}`);
    });
  }

  if (body === undefined || body === null || body === "") {
    lines.push("Body: (empty)");
  } else {
    lines.push("Body:");
    lines.push(String(body));
  }

  return lines.join("\n");
}

function setEndpointMeta(endpoint, requestType, requestDetails = null) {
  state.lastRequestEndpoint = endpoint || "";
  state.lastRequestType = requestType || "";
  state.lastRequestTime = endpoint ? new Date().toLocaleString() : "";
  state.lastRequestRaw = formatRequestDetails(requestDetails);

  if (dom.hostedUrlMeta) {
    dom.hostedUrlMeta.textContent = getCurrentAppUrl() || "-";
  }
  dom.endpointMeta.textContent = state.lastRequestEndpoint || "-";
  dom.requestTypeMeta.textContent = state.lastRequestType || "-";
  dom.timeMeta.textContent = state.lastRequestTime || "-";
  dom.requestRawMeta.textContent = state.lastRequestRaw || "-";
  refreshRequestTimingMeta();
}

function buildRenderUrl(server, type, format) {
  return `${server}/${type}/${format}`;
}

function saveStateToHash() {
  const payload = {
    server: dom.serverUrl.value.trim(),
    theme: state.themeId,
    type: dom.diagramType.value,
    source: dom.diagramSource.value,
    debugMode: state.debugMode,
    requestTimeoutMs: getRequestTimeoutMs(),
  };

  window.history.replaceState({}, "", `#state=${toDataBase64(JSON.stringify(payload))}`);
}

function loadStateFromHash() {
  if (!window.location.hash.startsWith("#state=")) {
    return { loaded: false, hasSource: false };
  }

  const encoded = window.location.hash.slice(7);
  try {
    const parsed = JSON.parse(fromDataBase64(encoded));
    let hasSource = false;

    if (typeof parsed.server === "string") {
      dom.serverUrl.value = parsed.server;
    }
    if (typeof parsed.theme === "string" && hasTheme(parsed.theme)) {
      state.themeId = parsed.theme;
    }
    if (
      typeof parsed.type === "string" &&
      (parsed.type === AUTO_DIAGRAM_TYPE_ID || DIAGRAM_SAMPLES.has(parsed.type))
    ) {
      dom.diagramType.value = parsed.type;
    }
    if (typeof parsed.source === "string") {
      dom.diagramSource.value = parsed.source;
      hasSource = parsed.source.trim().length > 0;
    }
    if (typeof parsed.debugMode === "boolean") {
      state.debugMode = parsed.debugMode;
    }
    if (typeof parsed.requestTimeoutMs === "number") {
      state.requestTimeoutMs = clampRequestTimeoutMs(parsed.requestTimeoutMs);
    }

    return { loaded: true, hasSource };
  } catch {
    updateStatus("error", "Could not read state from URL hash");
    return { loaded: false, hasSource: false };
  }
}

async function encodeDiagramForGet(source) {
  if (!("CompressionStream" in window)) {
    throw new Error("GET encoding is not supported by this browser");
  }

  const compressor = new CompressionStream("deflate");
  // Start reading before writing to avoid backpressure deadlocks on larger inputs.
  const compressedPromise = new Response(compressor.readable).arrayBuffer();
  const writer = compressor.writable.getWriter();
  await writer.write(new TextEncoder().encode(source));
  await writer.close();
  const compressed = await compressedPromise;
  return toBase64Url(new Uint8Array(compressed));
}

async function buildGetRenderUrl(server, type, format, source) {
  const encoded = await encodeDiagramForGet(source);
  return `${server}/${type}/${format}/${encoded}`;
}

async function fetchKrokiBlob(endpoint, requestInit = {}) {
  const controller = new AbortController();
  const timeoutMs = getRequestTimeoutMs();
  const startedAt = performance.now();
  let timeoutId = 0;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      controller.abort();
      const timeoutError = new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds`);
      timeoutError.name = "TimeoutError";
      reject(timeoutError);
    }, timeoutMs);
  });

  const fetchPromise = (async () => {
    const response = await fetch(endpoint, {
      ...requestInit,
      signal: controller.signal,
    });

    if (!response.ok) {
      let text = "";
      try {
        text = await response.text();
      } catch {
        text = "";
      }
      const httpError = new Error(text || `Render failed with status ${response.status}`);
      httpError.name = "KrokiHttpError";
      httpError.status = response.status;
      httpError.responseBody = text || "";
      throw httpError;
    }

    return await response.blob();
  })();

  try {
    const blob = await Promise.race([fetchPromise, timeoutPromise]);
    state.lastRequestDurationMs = Math.max(0, Math.round(performance.now() - startedAt));
    state.lastRequestTimedOut = false;
    refreshRequestTimingMeta();
    return blob;
  } catch (error) {
    const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
    state.lastRequestDurationMs = durationMs;

    if (
      error instanceof DOMException &&
      error.name === "AbortError" &&
      controller.signal.aborted
    ) {
      const timeoutError = new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds`);
      timeoutError.name = "TimeoutError";
      state.lastRequestTimedOut = true;
      refreshRequestTimingMeta();
      throw timeoutError;
    }

    state.lastRequestTimedOut = isTimeoutError(error);
    refreshRequestTimingMeta();
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchRender(endpoint, source) {
  return fetchKrokiBlob(endpoint, {
    method: "POST",
    headers: TEXT_PLAIN_HEADERS,
    body: source,
  });
}

async function fetchRenderGet(endpoint) {
  return fetchKrokiBlob(endpoint, {
    method: "GET",
  });
}

function isConnectivityError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = (error.message || "").toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("econnrefused") ||
    message.includes("dns")
  );
}

function isTimeoutError(error) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "TimeoutError" || (error.message || "").toLowerCase().includes("timed out");
}

function isKrokiHttpError(error) {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.name === "KrokiHttpError" && Number.isInteger(error.status);
}

function getKrokiErrorMessage(error) {
  if (!isKrokiHttpError(error)) {
    return error instanceof Error ? error.message : String(error);
  }
  const status = Number(error.status);
  const body = typeof error.responseBody === "string" ? error.responseBody.trim() : "";
  const firstLine = body ? body.split(/\r?\n/)[0].trim() : "";
  if (firstLine) {
    return `Kroki ${status}: ${firstLine}`;
  }
  return `Kroki ${status}: Request failed`;
}

function getTimeoutMessage() {
  return `Request timed out after ${getRequestTimeoutSeconds()} seconds.`;
}

async function checkServerReachability(server) {
  const target = `${server}/health`;
  const controller = new AbortController();
  let timeoutId = 0;
  const timeoutMs = getRequestTimeoutMs();
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeoutMs);
  });

  const fetchPromise = (async () => {
    await fetch(target, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function renderPreviewFromBlob(blob) {
  cleanupObjectUrl();
  state.objectUrl = URL.createObjectURL(blob);
  dom.renderBox.innerHTML = "";

  const image = document.createElement("img");
  image.alt = "Rendered diagram preview";
  image.addEventListener("load", () => {
    syncRenderBoxHeight();
    window.requestAnimationFrame(() => {
      updateRenderScrollState();
    });
  });
  image.src = state.objectUrl;
  dom.renderBox.appendChild(image);
  syncRenderBoxHeight();
  window.requestAnimationFrame(() => {
    updateRenderScrollState();
  });
}

function renderError(message) {
  const pre = document.createElement("pre");
  pre.className = "render-error-message";
  pre.textContent = message;
  dom.renderBox.replaceChildren(pre);
  syncRenderBoxHeight();
}

function handleRenderTimeout(renderToken) {
  const message = getTimeoutMessage();
  resetRenderedState();
  renderError(message);
  completeRenderStatus("timeout", renderToken);
  updateStatus("error", message);
  showActionCallout("error", message);
}

function resetRenderedState() {
  cleanupObjectUrl();
  setActionButtonsEnabled(false);
  updateRenderScrollState();
}

function scheduleAutoRender() {
  clearTimeout(autoRenderTimer);
  autoRenderTimer = setTimeout(() => {
    renderDiagram();
  }, 420);
}

function buildEditableLink() {
  const appBase = getCurrentAppUrl();
  if (!appBase) {
    throw new Error("Could not determine hosted RenderRig URL from browser address");
  }

  const payload = {
    server: dom.serverUrl.value.trim(),
    theme: state.themeId,
    type: dom.diagramType.value,
    source: dom.diagramSource.value,
    debugMode: state.debugMode,
    requestTimeoutMs: getRequestTimeoutMs(),
  };

  return `${appBase}#state=${toDataBase64(JSON.stringify(payload))}`;
}

function downloadBlob(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

async function copyToClipboard(text, successMessage) {
  const writeTextWithFallback = async () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Continue to execCommand fallback below.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    } finally {
      document.body.removeChild(textarea);
    }
    return copied;
  };

  try {
    const copied = await writeTextWithFallback();
    if (copied) {
      updateStatus("ok", successMessage);
      showActionCallout("ok", successMessage);
      return true;
    }

    updateStatus("error", "Clipboard access was blocked by the browser");
    showActionCallout("error", "Clipboard access was blocked by the browser");
    return false;
  } catch {
    updateStatus("error", "Clipboard access was blocked by the browser");
    showActionCallout("error", "Clipboard access was blocked by the browser");
    return false;
  }
}

async function copyBlobToClipboard(blob, mimeType, successMessage) {
  const textBlobFormats = ["text/plain", "text/markdown", "image/svg+xml"];
  if (textBlobFormats.some((item) => mimeType.startsWith(item))) {
    try {
      const text = await blob.text();
      return copyToClipboard(text, successMessage);
    } catch {
      updateStatus("error", "Could not read text response for clipboard copy");
      showActionCallout("error", "Could not read text response for clipboard copy");
      return false;
    }
  }

  if (
    navigator.clipboard &&
    typeof navigator.clipboard.write === "function" &&
    typeof window.ClipboardItem === "function"
  ) {
    try {
      const item = new ClipboardItem({ [mimeType]: blob });
      await navigator.clipboard.write([item]);
      updateStatus("ok", successMessage);
      showActionCallout("ok", successMessage);
      return true;
    } catch {
      // Fallback handled below.
    }
  }

  updateStatus("error", "Image clipboard is not supported in this browser context");
  showActionCallout("error", "Image clipboard is not supported in this browser context");
  return false;
}

async function copyDiagramToClipboard(format) {
  const server = normalizeServerUrl(dom.serverUrl.value || "");
  const type = getActionDiagramType();
  const source = dom.diagramSource.value;

  if (!type) {
    updateStatus("error", "No diagram type resolved yet. Render once in Auto mode first.");
    showActionCallout("error", "No diagram type resolved yet. Render once in Auto mode first.");
    return;
  }

  if (!server || !source.trim()) {
    updateStatus("error", "Cannot copy without server URL and diagram source");
    showActionCallout("error", "Cannot copy without server URL and diagram source");
    return;
  }
  if (!supportsDiagramFormat(type, format)) {
    updateStatus("error", `${type} does not support ${format.toUpperCase()} copy`);
    showActionCallout("error", `${type} does not support ${format.toUpperCase()} copy`);
    return;
  }

  const endpoint = buildRenderUrl(server, type, format);
  setEndpointMeta(endpoint, `POST /{type}/${format} (copy)`, {
    method: "POST",
    url: endpoint,
    headers: TEXT_PLAIN_HEADERS,
    body: source,
  });
  updateStatus("loading", `Copying ${format.toUpperCase()}...`);

  try {
    const blob = await fetchRender(endpoint, source);
    const mimeType = blob.type || getFormatMimeType(format);
    const formatName = getFormatDisplayName(format);
    if (isTextualFormat(format)) {
      const text = await blob.text();
      await copyToClipboard(text, `${formatName} copied to clipboard`);
      return;
    }
    await copyBlobToClipboard(blob, mimeType, `${formatName} copied to clipboard`);
  } catch (postError) {
    if (isTimeoutError(postError)) {
      const message = getTimeoutMessage();
      updateStatus("error", message);
      showActionCallout("error", message);
      return;
    }

    if (isKrokiHttpError(postError)) {
      const message = getKrokiErrorMessage(postError);
      updateStatus("error", message);
      showActionCallout("error", message);
      return;
    }

    if (isConnectivityError(postError)) {
      const reachable = await checkServerReachability(server);
      if (!reachable) {
        updateStatus("error", "Server URL is not reachable.");
        showActionCallout("error", "Server URL is not reachable.");
        return;
      }
    }

    updateStatus("error", `Copy ${format.toUpperCase()} failed`);
    showActionCallout("error", `Copy ${format.toUpperCase()} failed`);
  }
}

function buildAutoDetectionCandidates(source) {
  const allowedTypes = Object.keys(DIAGRAM_FORMAT_SUPPORT);
  const detection = detectDiagramType(source, { allowedTypes });
  const fallbackType = DEFAULT_DIAGRAM_TYPE;

  if (!detection.primaryType) {
    return {
      detection: { confidence: 0, validated: false, candidates: [] },
      candidates: [fallbackType],
    };
  }

  const ranked = detection.candidates.map((candidate) => candidate.type);
  if (!ranked.includes(fallbackType)) {
    ranked.push(fallbackType);
  }

  return {
    detection: { confidence: detection.confidence, validated: false, candidates: detection.candidates },
    candidates: ranked,
  };
}

async function resolveAutoDiagramType(server, source, renderToken) {
  const { detection, candidates } = buildAutoDetectionCandidates(source);
  const primaryCandidate = candidates[0] || DEFAULT_DIAGRAM_TYPE;
  const confidence = detection.confidence || 0;

  if (confidence >= AUTO_DETECT_CONFIDENCE_THRESHOLD) {
    return {
      diagramType: primaryCandidate,
      previewFormat: getPreferredPreviewFormat(primaryCandidate),
      detection,
      prefetchedBlob: null,
      endpoint: "",
      requestType: "",
      requestDetails: null,
    };
  }

  let lastError = null;
  const validationCandidates = candidates.slice(0, AUTO_DETECT_VALIDATION_CANDIDATES);

  for (const candidateType of validationCandidates) {
    if (renderToken !== state.renderToken) {
      return null;
    }

    const previewFormat = getPreferredPreviewFormat(candidateType);
    const endpoint = buildRenderUrl(server, candidateType, previewFormat);
    const requestDetails = {
      method: "POST",
      url: endpoint,
      headers: TEXT_PLAIN_HEADERS,
      body: source,
    };

    try {
      const blob = await fetchRender(endpoint, source);
      return {
        diagramType: candidateType,
        previewFormat,
        detection: { ...detection, validated: true },
        prefetchedBlob: blob,
        endpoint,
        requestType: `POST /{auto->${candidateType}}/${previewFormat}`,
        requestDetails,
      };
    } catch (error) {
      lastError = error;
      if (isConnectivityError(error) || isTimeoutError(error)) {
        throw error;
      }
    }
  }

  return {
    diagramType: primaryCandidate,
    previewFormat: getPreferredPreviewFormat(primaryCandidate),
    detection,
    prefetchedBlob: null,
    endpoint: "",
    requestType: "",
    requestDetails: null,
    lastError,
  };
}

async function renderDiagram() {
  const renderToken = ++state.renderToken;
  const server = normalizeServerUrl(dom.serverUrl.value || "");
  const selectedType = dom.diagramType.value;
  let type = selectedType;
  let previewFormat = getPreferredPreviewFormat(type);
  const source = dom.diagramSource.value;

  saveStateToHash();

  if (!server) {
    resetRenderedState();
    setInstantRenderStatus("error");
    updateStatus("error", "Enter a Kroki server URL first");
    return;
  }

  if (!source.trim()) {
    resetRenderedState();
    setIdleRenderStatus();
    updateResolvedDiagramType(selectedType === AUTO_DIAGRAM_TYPE_ID ? "" : selectedType, null);
    rebuildFormatActionButtons();
    updateStatus("idle", "Diagram source is empty");
    dom.renderBox.innerHTML = `<p class="empty-state">Rendered output will appear here.</p>`;
    setEndpointMeta("", "");
    syncRenderBoxHeight();
    return;
  }

  beginRenderStatus(renderToken);

  let prefetchedAutoBlob = null;
  let prefetchedEndpoint = "";
  let prefetchedRequestType = "";
  let prefetchedRequestDetails = null;

  if (selectedType === AUTO_DIAGRAM_TYPE_ID) {
    try {
      const autoResolution = await resolveAutoDiagramType(server, source, renderToken);
      if (renderToken !== state.renderToken || !autoResolution) {
        return;
      }

      type = autoResolution.diagramType;
      previewFormat = autoResolution.previewFormat;
      prefetchedAutoBlob = autoResolution.prefetchedBlob;
      prefetchedEndpoint = autoResolution.endpoint || "";
      prefetchedRequestType = autoResolution.requestType || "";
      prefetchedRequestDetails = autoResolution.requestDetails || null;
      updateResolvedDiagramType(type, autoResolution.detection || null);
      rebuildFormatActionButtons();
    } catch (autoError) {
      if (isTimeoutError(autoError)) {
        updateResolvedDiagramType("", null);
        rebuildFormatActionButtons();
        handleRenderTimeout(renderToken);
        return;
      }

      if (isConnectivityError(autoError)) {
        const reachable = await checkServerReachability(server);
        if (!reachable) {
          resetRenderedState();
          updateResolvedDiagramType("", null);
          rebuildFormatActionButtons();
          renderError("Server URL is not reachable.");
          completeRenderStatus("error", renderToken);
          updateStatus("error", "Server URL is not reachable.");
          return;
        }
      }
      updateResolvedDiagramType(DEFAULT_DIAGRAM_TYPE, null);
      rebuildFormatActionButtons();
      type = DEFAULT_DIAGRAM_TYPE;
      previewFormat = getPreferredPreviewFormat(type);
    }
  } else {
    updateResolvedDiagramType(type, null);
    rebuildFormatActionButtons();
  }

  const endpoint = buildRenderUrl(server, type, previewFormat);

  if (prefetchedAutoBlob) {
    renderPreviewFromBlob(prefetchedAutoBlob);
    setActionButtonsEnabled(true);
    setEndpointMeta(prefetchedEndpoint || endpoint, prefetchedRequestType || `POST /{type}/${previewFormat}`, prefetchedRequestDetails || {
      method: "POST",
      url: prefetchedEndpoint || endpoint,
      headers: TEXT_PLAIN_HEADERS,
      body: source,
    });
    completeRenderStatus("ok", renderToken);
    updateStatus("ok", `Preview rendered (auto: ${getDiagramLabel(type)})`);
    return;
  }

  updateStatus("loading", "Rendering preview...");
  setEndpointMeta(endpoint, `POST /{type}/${previewFormat}`, {
    method: "POST",
    url: endpoint,
    headers: TEXT_PLAIN_HEADERS,
    body: source,
  });

  try {
    const blob = await fetchRender(endpoint, source);
    if (renderToken !== state.renderToken) {
      return;
    }

    renderPreviewFromBlob(blob);
    setActionButtonsEnabled(true);
    completeRenderStatus("ok", renderToken);
    updateStatus("ok", "Preview rendered (POST)");
    return;
  } catch (postError) {
    if (renderToken !== state.renderToken) {
      return;
    }

    if (isTimeoutError(postError)) {
      handleRenderTimeout(renderToken);
      return;
    }

    if (isKrokiHttpError(postError)) {
      resetRenderedState();
      renderError(getKrokiErrorMessage(postError));
      completeRenderStatus("error", renderToken);
      updateStatus("error", "Kroki returned an error response.");
      showActionCallout("error", getKrokiErrorMessage(postError));
      return;
    }

    if (isConnectivityError(postError)) {
      const reachable = await checkServerReachability(server);
      if (!reachable) {
        resetRenderedState();
        renderError("Server URL is not reachable.");
        completeRenderStatus("error", renderToken);
        updateStatus("error", "Server URL is not reachable.");
        return;
      }
    }

    try {
      const getUrl = await buildGetRenderUrl(server, type, previewFormat, source);
      if (renderToken !== state.renderToken) {
        return;
      }

      setEndpointMeta(getUrl, `GET /{type}/${previewFormat}/{encoded}`, {
        method: "GET",
        url: getUrl,
        headers: {},
        body: "",
      });
      const fallbackBlob = await fetchRenderGet(getUrl);
      if (renderToken !== state.renderToken) {
        return;
      }

      renderPreviewFromBlob(fallbackBlob);
      setActionButtonsEnabled(true);
      completeRenderStatus("ok", renderToken);
      updateStatus("ok", "Preview rendered (GET fallback)");
      return;
    } catch (getError) {
      if (renderToken !== state.renderToken) {
        return;
      }
      if (isTimeoutError(getError)) {
        handleRenderTimeout(renderToken);
        return;
      }
      resetRenderedState();
      const message = getError instanceof Error ? getError.message : String(getError);
      renderError(message);
      completeRenderStatus("error", renderToken);
      updateStatus("error", "Render failed. Check server URL and diagram syntax.");
    }
  }
}

async function exportDiagram(format) {
  const server = normalizeServerUrl(dom.serverUrl.value || "");
  const type = getActionDiagramType();
  const source = dom.diagramSource.value;

  if (!type) {
    updateStatus("error", "No diagram type resolved yet. Render once in Auto mode first.");
    showActionCallout("error", "No diagram type resolved yet. Render once in Auto mode first.");
    return;
  }

  if (!server || !source.trim()) {
    updateStatus("error", "Cannot export without server URL and diagram source");
    showActionCallout("error", "Cannot export without server URL and diagram source");
    return;
  }
  if (!supportsDiagramFormat(type, format)) {
    updateStatus("error", `${type} does not support ${format.toUpperCase()} export`);
    showActionCallout("error", `${type} does not support ${format.toUpperCase()} export`);
    return;
  }

  const endpoint = buildRenderUrl(server, type, format);
  setEndpointMeta(endpoint, `POST /{type}/${format} (export)`, {
    method: "POST",
    url: endpoint,
    headers: TEXT_PLAIN_HEADERS,
    body: source,
  });
  updateStatus("loading", `Exporting ${format.toUpperCase()}...`);

  try {
    const blob = await fetchRender(endpoint, source);
    downloadBlob(blob, `${type}-diagram.${format}`);
    updateStatus("ok", `Exported ${format.toUpperCase()}`);
    showActionCallout("ok", `Exported ${format.toUpperCase()}`);
  } catch (postError) {
    if (isTimeoutError(postError)) {
      const message = getTimeoutMessage();
      updateStatus("error", message);
      showActionCallout("error", message);
      return;
    }

    if (isKrokiHttpError(postError)) {
      const message = getKrokiErrorMessage(postError);
      updateStatus("error", message);
      showActionCallout("error", message);
      return;
    }

    if (isConnectivityError(postError)) {
      const reachable = await checkServerReachability(server);
      if (!reachable) {
        updateStatus("error", "Server URL is not reachable.");
        showActionCallout("error", "Server URL is not reachable.");
        return;
      }
    }

    try {
      const getUrl = await buildGetRenderUrl(server, type, format, source);
      setEndpointMeta(getUrl, `GET /{type}/${format}/{encoded} (export fallback)`, {
        method: "GET",
        url: getUrl,
        headers: {},
        body: "",
      });
      const fallbackBlob = await fetchRenderGet(getUrl);
      downloadBlob(fallbackBlob, `${type}-diagram.${format}`);
      updateStatus("ok", `Exported ${format.toUpperCase()} (GET fallback)`);
      showActionCallout("ok", `Exported ${format.toUpperCase()} (GET fallback)`);
    } catch (getError) {
      if (isTimeoutError(getError)) {
        const message = getTimeoutMessage();
        updateStatus("error", message);
        showActionCallout("error", message);
        return;
      }
      updateStatus("error", `Export failed for ${format.toUpperCase()}`);
      showActionCallout("error", `Export failed for ${format.toUpperCase()}`);
    }
  }
}

async function exportEditableLink() {
  try {
    const link = buildEditableLink();
    await copyToClipboard(link, "Editable link copied");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    updateStatus("error", message);
    showActionCallout("error", message);
  }
}

async function copyRenderedImageLink() {
  const server = normalizeServerUrl(dom.serverUrl.value || "");
  const type = getActionDiagramType();
  const source = dom.diagramSource.value;

  if (!type) {
    updateStatus("error", "No diagram type resolved yet. Render once in Auto mode first.");
    showActionCallout("error", "No diagram type resolved yet. Render once in Auto mode first.");
    return;
  }

  if (!server || !source.trim()) {
    updateStatus("error", "Cannot copy image link without server URL and diagram source");
    showActionCallout("error", "Cannot copy image link without server URL and diagram source");
    return;
  }
  if (!supportsDiagramFormat(type, COPY_IMAGE_LINK_FORMAT)) {
    updateStatus("error", `${type} does not support ${COPY_IMAGE_LINK_FORMAT.toUpperCase()}`);
    showActionCallout("error", `${type} does not support ${COPY_IMAGE_LINK_FORMAT.toUpperCase()}`);
    return;
  }

  updateStatus("loading", "Building image link...");
  showActionCallout("loading", "Building image link...");

  let imageUrl = "";
  try {
    imageUrl = await buildGetRenderUrl(server, type, COPY_IMAGE_LINK_FORMAT, source);
    setEndpointMeta(imageUrl, "GET /{type}/svg/{encoded} (image link)", {
      method: "GET",
      url: imageUrl,
      headers: {},
      body: "",
    });
  } catch {
    updateStatus("error", "Could not build image link URL in this browser");
    showActionCallout("error", "Could not build image link URL in this browser");
    return;
  }
  await copyToClipboard(imageUrl, "Image link copied");
}

dom.debugModeBtn.addEventListener("click", () => {
  setDebugMode(!state.debugMode);
});

if (dom.requestTimeoutSeconds) {
  const commitTimeoutValue = (showFeedback = false) => {
    const next = Number(dom.requestTimeoutSeconds.value);
    setRequestTimeoutSeconds(next, { persist: true, showFeedback });
  };

  dom.requestTimeoutSeconds.addEventListener("change", () => {
    commitTimeoutValue(true);
  });

  dom.requestTimeoutSeconds.addEventListener("blur", () => {
    commitTimeoutValue(false);
  });

  dom.requestTimeoutSeconds.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    commitTimeoutValue(true);
  });
}

dom.editableLinkBtn.addEventListener("click", () => {
  exportEditableLink();
});

dom.imageLinkBtn.addEventListener("click", () => {
  copyRenderedImageLink();
});

if (dom.focusModeExitBtn) {
  dom.focusModeExitBtn.addEventListener("click", () => {
    if (state.focusMode) {
      setFocusMode(false);
    }
  });
}

dom.renderBox.addEventListener("scroll", () => {
  updateRenderScrollState();
});

dom.diagramSource.addEventListener("scroll", () => {
  updateSourceScrollState();
});

dom.diagramType.addEventListener("change", () => {
  closeDiagramTypeDropdown();
  refreshDiagramTypeDropdownUi();
  const selectedType = dom.diagramType.value;
  if (selectedType === AUTO_DIAGRAM_TYPE_ID) {
    updateResolvedDiagramType("", null);
    rebuildFormatActionButtons();
    setActionButtonsEnabled(false);
    saveStateToHash();
    scheduleAutoRender();
    return;
  }

  updateResolvedDiagramType(selectedType, null);
  applySampleForDiagramType(selectedType);
  rebuildFormatActionButtons();
  setActionButtonsEnabled(false);
});

dom.themeFamilyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selection = getThemeSelection(state.themeId);
    const nextFamily = button.dataset.themeFamily || selection.family;
    const nextThemeId = getThemeId(nextFamily, selection.mode);
    applyTheme(nextThemeId);
  });
});

dom.themeModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selection = getThemeSelection(state.themeId);
    const nextMode = button.dataset.themeMode === "light" ? "light" : "dark";
    const nextThemeId = getThemeId(selection.family, nextMode);
    applyTheme(nextThemeId);
  });
});

[dom.serverUrl, dom.diagramSource].forEach((element) => {
  element.addEventListener("input", () => {
    if (element === dom.diagramSource && dom.diagramType.value === AUTO_DIAGRAM_TYPE_ID) {
      updateResolvedDiagramType("", null);
      rebuildFormatActionButtons();
      setActionButtonsEnabled(false);
    }
    saveStateToHash();
    if (element === dom.diagramSource) {
      updateSourceScrollState();
    }
    scheduleAutoRender();
  });

  element.addEventListener("change", () => {
    if (element === dom.diagramSource && dom.diagramType.value === AUTO_DIAGRAM_TYPE_ID) {
      updateResolvedDiagramType("", null);
      rebuildFormatActionButtons();
      setActionButtonsEnabled(false);
    }
    saveStateToHash();
    if (element === dom.diagramSource) {
      updateSourceScrollState();
    }
    scheduleAutoRender();
  });
});

function init() {
  setupTopMenuInteractions();
  setupDiagramTypeDropdownInteractions();
  setupSplitPaneInteractions();
  setupCommandPaletteInteractions();
  setupFocusModeInteractions();
  applyMenuShortcutTooltips();
  populateDiagramTypeOptions();
  dom.serverUrl.value = getDefaultKrokiServerUrl();
  dom.diagramType.value = DEFAULT_DIAGRAM_TYPE;
  dom.diagramSource.value = "";
  state.requestTimeoutMs = clampRequestTimeoutMs(state.requestTimeoutMs);
  syncRequestTimeoutInput();
  refreshRequestTimingMeta();

  resetRenderedState();
  updateStatus("idle", "Ready");

  const stateFromHash = loadStateFromHash();
  syncRequestTimeoutInput();
  refreshRequestTimingMeta();
  if (!stateFromHash.loaded) {
    applySampleForDiagramType(dom.diagramType.value, { persist: false, render: false });
    saveStateToHash();
  } else if (!stateFromHash.hasSource) {
    applySampleForDiagramType(dom.diagramType.value, { persist: false, render: false });
  }

  if (dom.diagramType.value === AUTO_DIAGRAM_TYPE_ID) {
    updateResolvedDiagramType("", null);
  } else {
    updateResolvedDiagramType(dom.diagramType.value, null);
  }
  rebuildFormatActionButtons();
  applyTheme(state.themeId, false);
  setDebugMode(state.debugMode, false);
  updateFocusModeMenuUi();
  setIdleRenderStatus();
  updateSourceScrollState();
  syncRenderBoxHeight();
  syncToolbarDropdownForViewport();
  positionResponsiveToolbarToVisibleViewport();
  applyUiPrefs();
  positionOpenMenus();
  positionMenuTooltips();
  startFooterEmojiShuffle();

  if ("ResizeObserver" in window && dom.controlsPanel) {
    controlsPanelObserver = new ResizeObserver(() => {
      syncRenderBoxHeight();
    });
    controlsPanelObserver.observe(dom.controlsPanel);
  }

  window.addEventListener("resize", syncRenderBoxHeight);
  window.addEventListener("resize", updateSourceScrollState);
  window.addEventListener("resize", positionOpenMenus);
  window.addEventListener("resize", syncToolbarDropdownForViewport);
  window.addEventListener("scroll", positionResponsiveToolbarToVisibleViewport, { passive: true });

  if (window.visualViewport && !visualViewportListenersAttached) {
    visualViewportListenersAttached = true;
    window.visualViewport.addEventListener("resize", positionResponsiveToolbarToVisibleViewport);
    window.visualViewport.addEventListener("scroll", positionResponsiveToolbarToVisibleViewport);
  }
  persistUiPrefs();
  scheduleAutoRender();
}

window.addEventListener("beforeunload", () => {
  cleanupObjectUrl();
  setSplitResizeMode(false);
  setResizeEdgeHover(false);
  if (controlsPanelObserver) {
    controlsPanelObserver.disconnect();
  }
  window.removeEventListener("resize", syncRenderBoxHeight);
  window.removeEventListener("resize", updateSourceScrollState);
  window.removeEventListener("resize", positionOpenMenus);
  window.removeEventListener("resize", syncToolbarDropdownForViewport);
  window.removeEventListener("scroll", positionResponsiveToolbarToVisibleViewport);
  if (window.visualViewport && visualViewportListenersAttached) {
    window.visualViewport.removeEventListener("resize", positionResponsiveToolbarToVisibleViewport);
    window.visualViewport.removeEventListener("scroll", positionResponsiveToolbarToVisibleViewport);
    visualViewportListenersAttached = false;
  }
  stopRenderStatusTimer();
  window.clearTimeout(actionCalloutTimer);
  window.clearTimeout(actionCalloutHideTimer);
  window.clearTimeout(focusModeToastTimer);
  window.clearTimeout(focusModeToastHideTimer);
  window.clearInterval(footerEmojiShuffleTimer);
  footerEmojiShuffleTimer = null;
  if (tooltipRulerEl && document.body.contains(tooltipRulerEl)) {
    tooltipRulerEl.remove();
  }
  tooltipRulerEl = null;
  persistUiPrefs();
});

init();
