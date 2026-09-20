export interface AdaptivePalette {
  accent: string;
  accentSoft: string;
  accentLight: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  highlight: string;
  mode: "light" | "dark";
}

interface Rgb { r: number; g: number; b: number; }
interface Sample extends Rgb { weight: number; saturation: number; }

const NEUTRAL_PALETTE: AdaptivePalette = {
  accent: "#5f6672",
  accentSoft: "#e9ebee",
  accentLight: "#f5f6f7",
  surface: "#fcfcfb",
  surfaceSecondary: "#f5f5f3",
  textPrimary: "#1e2329",
  textSecondary: "#626a73",
  border: "#dfe2e5",
  highlight: "#f0f1f2",
  mode: "light"
};

function clamp(value: number, min = 0, max = 255): number { return Math.min(max, Math.max(min, value)); }
function round(value: number): number { return Math.round(clamp(value)); }
function toHex({ r, g, b }: Rgb): string { return `#${[r, g, b].map((value) => round(value).toString(16).padStart(2, "0")).join("")}`; }
function mix(first: Rgb, second: Rgb, amount: number): Rgb { return { r: first.r + (second.r - first.r) * amount, g: first.g + (second.g - first.g) * amount, b: first.b + (second.b - first.b) * amount }; }
function luminance({ r, g, b }: Rgb): number {
  const channel = (value: number) => { const normalized = value / 255; return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; };
  return channel(r) * 0.2126 + channel(g) * 0.7152 + channel(b) * 0.0722;
}
function contrast(first: Rgb, second: Rgb): number { const light = Math.max(luminance(first), luminance(second)); const dark = Math.min(luminance(first), luminance(second)); return (light + 0.05) / (dark + 0.05); }
function parseColor(value: string): Rgb | undefined {
  const match = value.match(/rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)(?:[, /]+\s*([\d.]+))?\s*\)/i);
  if (!match || (match[4] !== undefined && Number(match[4]) === 0)) return undefined;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}
function saturation(rgb: Rgb): number { const maximum = Math.max(rgb.r, rgb.g, rgb.b); const minimum = Math.min(rgb.r, rgb.g, rgb.b); return maximum === 0 ? 0 : (maximum - minimum) / maximum; }
function isVisible(element: Element, bounds: DOMRect): boolean {
  const styles = getComputedStyle(element);
  return styles.display !== "none" && styles.visibility !== "hidden" && Number(styles.opacity) > 0.05 && bounds.width > 20 && bounds.height > 12 && bounds.bottom > 0 && bounds.right > 0 && bounds.top < window.innerHeight && bounds.left < window.innerWidth;
}
function isIgnored(element: Element): boolean {
  const marker = `${element.id} ${typeof element.className === "string" ? element.className : ""}`.toLowerCase();
  return /ad[sx]?|advert|banner|sponsor|cookie|modal|popup|avatar|icon|logo|badge/.test(marker);
}
function getSamples(): Sample[] {
  const selectors = "body, main, article, header, nav, section, [role='main'], [role='banner']";
  const samples: Sample[] = [];
  for (const element of Array.from(document.querySelectorAll(selectors)).slice(0, 80)) {
    if (isIgnored(element)) continue;
    const bounds = element.getBoundingClientRect();
    if (!isVisible(element, bounds)) continue;
    const background = parseColor(getComputedStyle(element).backgroundColor);
    if (!background) continue;
    const area = Math.min(bounds.width * bounds.height, window.innerWidth * window.innerHeight);
    samples.push({ ...background, weight: area, saturation: saturation(background) });
  }
  return samples;
}
function representativeColor(samples: Sample[], pageIsDark: boolean): Rgb {
  const buckets = new Map<string, Sample>();
  for (const sample of samples) {
    const key = [sample.r, sample.g, sample.b].map((value) => Math.round(value / 24)).join(":");
    const current = buckets.get(key);
    if (current) { current.weight += sample.weight; current.saturation = Math.max(current.saturation, sample.saturation); }
    else buckets.set(key, { ...sample });
  }
  const candidates = [...buckets.values()].filter((sample) => sample.saturation > 0.12 && (pageIsDark ? luminance(sample) < 0.7 : luminance(sample) > 0.08));
  const strongest = candidates.sort((first, second) => (second.weight * (0.65 + second.saturation)) - (first.weight * (0.65 + first.saturation)))[0];
  return strongest ? strongest : { r: 105, g: 110, b: 118 };
}
function makePalette(samples: Sample[]): AdaptivePalette {
  if (samples.length === 0) return NEUTRAL_PALETTE;
  const pageBackground = samples.sort((first, second) => second.weight - first.weight)[0];
  const pageIsDark = luminance(pageBackground) < 0.42;
  const accent = representativeColor(samples, pageIsDark);
  const base = pageIsDark ? { r: 25, g: 27, b: 30 } : { r: 252, g: 252, b: 250 };
  const secondary = pageIsDark ? { r: 34, g: 37, b: 41 } : { r: 246, g: 246, b: 243 };
  const foreground = pageIsDark ? { r: 245, g: 245, b: 242 } : { r: 29, g: 32, b: 36 };
  const muted = pageIsDark ? { r: 177, g: 181, b: 185 } : { r: 94, g: 101, b: 108 };
  const safeAccent = contrast(accent, base) >= 3 ? accent : mix(accent, foreground, pageIsDark ? 0.35 : 0.58);
  const soft = mix(base, safeAccent, pageIsDark ? 0.24 : 0.1);
  const light = mix(base, safeAccent, pageIsDark ? 0.14 : 0.055);
  const border = mix(base, safeAccent, pageIsDark ? 0.4 : 0.18);
  return { accent: toHex(safeAccent), accentSoft: toHex(soft), accentLight: toHex(light), surface: toHex(base), surfaceSecondary: toHex(secondary), textPrimary: toHex(foreground), textSecondary: toHex(muted), border: toHex(border), highlight: toHex(mix(base, safeAccent, pageIsDark ? 0.3 : 0.12)), mode: pageIsDark ? "dark" : "light" };
}

export function extractPagePalette(): AdaptivePalette {
  try { return makePalette(getSamples()); } catch { return NEUTRAL_PALETTE; }
}

export const fallbackPalette = NEUTRAL_PALETTE;
