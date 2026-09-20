import { createRoot, type Root } from "react-dom/client";
import { DefinitionPanel } from "../components/DefinitionPanel";
import { contextFromSelection } from "../utils/context";
import { normaliseWord } from "../utils/word";
import { panelCss } from "./panel.css";
import { DEFAULT_SETTINGS, type DictionaryEntry, type Settings } from "../types";
import { extractPagePalette, fallbackPalette, type AdaptivePalette } from "../utils/adaptiveTheme";

let root: Root | undefined;
let host: HTMLDivElement | undefined;
let lookupVersion = 0;
let noticeTimer: number | undefined;
const offlineBuckets = new Map<string, Promise<Record<string, DictionaryEntry>>>();

let stopPaletteUpdates: (() => void) | undefined;

function unmountPanel() { stopPaletteUpdates?.(); stopPaletteUpdates = undefined; root?.unmount(); host?.remove(); root = undefined; host = undefined; }
function render(word: string, context: string, theme: Settings["theme"], palette: AdaptivePalette, entry?: DictionaryEntry, error?: string) { root?.render(<DefinitionPanel word={word} context={context} theme={theme} palette={palette} entry={entry} error={error} onClose={unmountPanel} />); }

function lookupOffline(word: string): Promise<DictionaryEntry | undefined> {
  const bucket = /^[a-z]{3}/.test(word) ? word.slice(0, 3) : "other";
  let request = offlineBuckets.get(bucket);
  if (!request) {
    request = fetch(chrome.runtime.getURL(`data/wordnet-v2/bucket-${bucket}.json`))
      .then((response) => response.ok ? response.json() as Promise<Record<string, DictionaryEntry>> : {})
      .catch(() => ({}));
    offlineBuckets.set(bucket, request);
  }
  return request.then((entries) => {
    for (const form of wordForms(word)) {
      if (entries[form]) return entries[form];
    }
    return undefined;
  });
}

function wordForms(word: string): string[] {
  const forms = [word];
  if (word.endsWith("ies") && word.length > 4) forms.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 3) forms.push(word.slice(0, -2));
  if (word.endsWith("s") && word.length > 3) forms.push(word.slice(0, -1));
  if (word.endsWith("ing") && word.length > 5) {
    const stem = word.slice(0, -3); forms.push(stem, `${stem}e`);
  }
  if (word.endsWith("ed") && word.length > 4) {
    const stem = word.slice(0, -2); forms.push(stem, `${stem}e`);
  }
  return [...new Set(forms)];
}

function showNotice(message: string) {
  unmountPanel();
  host = document.createElement("div");
  host.style.cssText = "all: initial !important; display: block !important; position: fixed !important; z-index: 2147483647 !important;";
  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style"); style.textContent = panelCss;
  const notice = document.createElement("div"); notice.className = "cw-notice"; notice.setAttribute("role", "status"); notice.textContent = message;
  shadow.append(style, notice); document.documentElement.append(host);
  window.clearTimeout(noticeTimer); noticeTimer = window.setTimeout(unmountPanel, 2600);
}

function showLookup(word: string, context: string, theme: Settings["theme"], settings: Promise<Settings>) {
  unmountPanel();
  host = document.createElement("div");
  host.style.cssText = "all: initial !important; display: block !important; position: fixed !important; z-index: 2147483647 !important;";
  host.setAttribute("data-contextword-root", "");
  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style"); style.textContent = panelCss;
  const mount = document.createElement("div"); shadow.append(style, mount); document.documentElement.append(host);
  root = createRoot(mount);
  let view: { entry?: DictionaryEntry; error?: string } = {};
  let palette = fallbackPalette;
  const rerender = () => render(word, context, theme, palette, view.entry, view.error);
  const refreshPalette = () => {
    palette = extractPagePalette();
    rerender();
  };
  refreshPalette();
  let paletteTimer: number | undefined;
  const schedulePaletteRefresh = () => {
    window.clearTimeout(paletteTimer);
    paletteTimer = window.setTimeout(refreshPalette, 180);
  };
  const observer = new MutationObserver(schedulePaletteRefresh);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
  window.addEventListener("resize", schedulePaletteRefresh, { passive: true });
  window.addEventListener("scroll", schedulePaletteRefresh, { passive: true });
  stopPaletteUpdates = () => { window.clearTimeout(paletteTimer); observer.disconnect(); window.removeEventListener("resize", schedulePaletteRefresh); window.removeEventListener("scroll", schedulePaletteRefresh); };
  const version = ++lookupVersion;
  lookupOffline(word).then((offlineEntry) => {
    if (version !== lookupVersion || !root) return;
    if (offlineEntry) {
      view = { entry: offlineEntry }; rerender();
      chrome.runtime.sendMessage({ type: "record", record: { word, context, lookedUpAt: new Date().toISOString() } });
      return;
    }
    settings.then((currentSettings) => {
      if (version !== lookupVersion || !root) return;
      if (!currentSettings.apiFallback) {
        view = { error: "This word is not available in the offline dictionary." }; rerender();
        return;
      }
      chrome.runtime.sendMessage({ type: "lookup", word }, (response: { ok: boolean; entry?: DictionaryEntry; error?: string }) => {
    if (version !== lookupVersion || !root) return;
    if (chrome.runtime.lastError) { view = { error: "Unable to contact ContextWord. Please try again." }; rerender(); return; }
    if (response.ok && response.entry) {
      view = { entry: response.entry }; rerender();
      chrome.runtime.sendMessage({ type: "record", record: { word, context, lookedUpAt: new Date().toISOString() } });
    } else { view = { error: response.error ?? "Dictionary lookup failed." }; rerender(); }
      });
    });
  });
}

function readSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "settings" }, (response: { ok?: boolean; settings?: Settings }) => {
      if (chrome.runtime.lastError || !response?.ok || !response.settings) resolve(DEFAULT_SETTINGS);
      else resolve(response.settings);
    });
  });
}

document.addEventListener("dblclick", async (event) => {
  if ((event.target as Element | null)?.closest("input, textarea, select, [contenteditable='true'], [data-contextword-root]")) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount !== 1) return;
  const selectedText = selection.toString();
  const word = normaliseWord(selectedText);
  if (!word) { if (selectedText.trim()) showNotice("Select one regular word, for example “ephemeral”."); return; }
  const context = contextFromSelection(selection.getRangeAt(0), word);
  if (!context) return;
  const settings = readSettings();
  showLookup(word, context, DEFAULT_SETTINGS.theme, settings);
  settings.then((currentSettings) => { if (!currentSettings.enabled) unmountPanel(); });
});
