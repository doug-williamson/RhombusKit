// Hand-rolled colour math — zero dependency. Two halves:
//   (A) WCAG contrast (parseColor / relativeLuminance / contrastRatio / alphaComposite),
//       matching apps/showcase/src/app/pages/themes/community-themes.spec.ts so the builder
//       and the showcase compute contrast identically.
//   (B) OKLCH synthesis (toOKLCH / fromOKLCH / gamutClampToSrgb) via Björn Ottosson's matrices.
// All operate on CSS value strings / channel tuples — no library, no runtime cost beyond the maths.

/** [r, g, b] in 0–255, a in 0–1. */
export type Rgba = [number, number, number, number];

const clampByte = (n: number): number => Math.min(255, Math.max(0, Math.round(n)));
const toHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map((c) => clampByte(c).toString(16).padStart(2, '0')).join('');

/**
 * Parse `#rgb` / `#rrggbb` / `#rrggbbaa` / `rgb()` / `rgba()` (space- or comma-separated,
 * optional slash or 4th-value alpha). Returns null for var()/color-mix/named/anything else —
 * such values are not contrast-checkable and are skipped by callers.
 */
export function parseColor(css: string): Rgba | null {
  const s = css.trim();

  let m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    const h = m[1];
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
      1,
    ];
  }

  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
  if (m) {
    const h = m[1];
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
      m[2] === undefined ? 1 : parseInt(m[2], 16) / 255,
    ];
  }

  m = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)(?:\s*[,/]\s*([0-9.]+))?\s*\)$/i.exec(s);
  if (m) {
    return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
  }

  return null; // var(), color-mix(), hsl(), named colours — not contrast-checkable
}

/** WCAG 2.1 relative luminance (sRGB linearisation, 0.2126/0.7152/0.0722). */
export function relativeLuminance([r, g, b]: readonly [number, number, number]): number {
  const channel = (v: number): number => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio (Lhi+0.05)/(Llo+0.05); null if either side is non-concrete. */
export function contrastRatio(fg: string, bg: string): number | null {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return null;
  const l1 = relativeLuminance([a[0], a[1], a[2]]);
  const l2 = relativeLuminance([b[0], b[1], b[2]]);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Composite a (possibly translucent) foreground over a solid background, returning the opaque
 * hex the viewer actually sees. Used before measuring contrast so alpha can never pass vacuously.
 * An opaque foreground is returned unchanged (as hex).
 */
export function alphaComposite(fg: string, bg: string): string {
  const f = parseColor(fg);
  const b = parseColor(bg);
  if (!f || !b) return fg;
  const a = f[3];
  return toHex(
    f[0] * a + b[0] * (1 - a),
    f[1] * a + b[1] * (1 - a),
    f[2] * a + b[2] * (1 - a),
  );
}

// ---- OKLCH (Ottosson) ------------------------------------------------------

export interface Oklch {
  L: number;
  C: number;
  H: number; // degrees, 0–360
}

const linearize = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const delinearize = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** linear-sRGB (0–1) → OKLab. */
function linearSrgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

/** OKLab → linear-sRGB (0–1, may fall outside gamut). */
function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function toOKLCH(hex: string): Oklch {
  const p = parseColor(hex);
  if (!p) throw new Error(`toOKLCH: unparseable colour "${hex}"`);
  const [L, a, b] = linearSrgbToOklab(
    linearize(p[0] / 255),
    linearize(p[1] / 255),
    linearize(p[2] / 255),
  );
  const C = Math.hypot(a, b);
  let H = (Math.atan2(b, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/** OKLCH → hex (channels clamped to 0–255; use gamutClampToSrgb first for faithful hues). */
export function fromOKLCH(L: number, C: number, H: number): string {
  const rad = (H * Math.PI) / 180;
  const [r, g, b] = oklabToLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
  return toHex(delinearize(r) * 255, delinearize(g) * 255, delinearize(b) * 255);
}

function inGamut(L: number, C: number, H: number): boolean {
  const rad = (H * Math.PI) / 180;
  const lin = oklabToLinearSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
  const eps = 1e-4;
  return lin.every((c) => c >= -eps && c <= 1 + eps);
}

/**
 * Reduce chroma (holding L and H) until the colour fits inside sRGB, then convert to hex.
 * An already-in-gamut colour is returned exactly. CSS Color 4 chroma reduction by bisection.
 */
export function gamutClampToSrgb(L: number, C: number, H: number): string {
  if (inGamut(L, C, H)) return fromOKLCH(L, C, H);
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, H)) lo = mid;
    else hi = mid;
  }
  return fromOKLCH(L, lo, H);
}
