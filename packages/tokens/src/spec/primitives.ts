// SOURCE OF TRUTH — palette scales, font families, radii, shadows, motion.
// camelCase keys for TS; generator converts to kebab-case for CSS custom property names.
// Do not hard-code values anywhere else — reference primitives from theme packs.

export const slate = {
  50:  '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

export const violet = {
  50:  '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
} as const;

export const green = {
  50:  '#f0fdf4',
  100: '#dcfce7',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
} as const;

export const amber = {
  50:  '#fffbeb',
  100: '#fef3c7',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
} as const;

export const red = {
  50:  '#fef2f2',
  100: '#fee2e2',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
} as const;

export const fontFamily = {
  sans:  '"Inter Variable", "Inter", system-ui, sans-serif',
  mono:  '"JetBrains Mono Variable", "JetBrains Mono", monospace',
  prose: '"Lora Variable", "Lora", Georgia, serif',
} as const;

export const radius = {
  none: '0',
  sm:   '0.125rem',
  // `xs` is the form-control corner (4px). NOTE: by value it sits *between* `sm`
  // (2px) and `md` (6px) — `sm` is an unusually tight 2px — so the scale is not
  // strictly monotonic by name. It exists so form fields can consume a radius
  // token at their native Material corner with zero pixel change.
  xs:   '0.25rem',
  md:   '0.375rem',
  lg:   '0.5rem',
  xl:   '0.75rem',
  full: '9999px',
} as const;

// Motion is theme-independent (a 150ms transition is 150ms in every theme), so
// it lives here as a primitive — not in the themed CONTRACT. Durations form a
// fastest→slowest scale; easings name the four standard roles. Component styles
// reference these via var(--motion-duration-*) / var(--motion-ease-*). Honoring
// prefers-reduced-motion is handled globally in styles/_reset.scss.
export const motion = {
  duration: {
    instant: '0ms',
    fast:    '120ms',
    base:    '150ms',
    slow:    '240ms',
  },
  ease: {
    standard:   'cubic-bezier(0.4, 0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// Border widths are theme-independent (a 1px hairline is 1px in every theme), so
// they live here as primitives — like radius/motion, not in the themed CONTRACT.
// `--border-width` is the default hairline (component borders / dividers);
// `--border-width-strong` is the emphasis width (e.g. a focused field outline).
// Component styles reference these via var(--border-width). Authored as top-level
// scalars so flattenPrimitives yields exactly `--border-width` /
// `--border-width-strong` (a nested object would prefix them).
export const borderWidth = '1px';
export const borderWidthStrong = '2px';

// Density is theme-independent box geometry (a 40px control is 40px in every
// theme), so it lives here as a primitive — like radius/motion/border-width, NOT
// in the themed CONTRACT. These FIVE names are the entire public density
// surface; per-component precision (paddings, per-line-count list heights,
// form-field vertical padding) is INTERNAL and lives in
// @rhombuskit/material-preset's _density.scss and in each component's own SCSS.
// Do not add a sixth name here without a very good reason: published primitives
// are append-only forever.
//
// Each family must be a TOP-LEVEL key of the `primitives` barrel — flattenPrimitives
// prefixes with the parent key at every level, so `controlHeight` is a top-level
// object ({sm,md,lg} → --control-height-*) and the other two are top-level scalars
// (a scalar at prefix '' yields the bare kebab name). Same reasoning as
// borderWidth / borderWidthStrong above.

// The DEFAULT level. These keep their `as const` literal types: they enter the
// `primitives` barrel and therefore etc/tokens.api.md, which embeds the whole
// literal type. Widening any of them churns the frozen API report.
export const controlHeight = { sm: '2rem', md: '2.5rem', lg: '3rem' } as const;
export const fieldHeight = '3.5rem';
export const rowHeight = '3.25rem';

/**
 * The single source of density key NAMES. `densityLevels` is typed against this,
 * so a typo (`fieldHight`) is a compile error rather than a custom property that
 * verify-tokens.mjs's prefix filter silently drops while CI stays green and
 * compact form fields quietly remain 56px.
 */
const densityDefaults = { controlHeight, fieldHeight, rowHeight } as const;

/**
 * Same key names as `densityDefaults`, same nesting depth, values widened to
 * string. Object-valued families become Record<their own keys, string>, so
 * `controlHeight` must carry exactly sm/md/lg — no more, no less.
 */
type DensityScale = {
  readonly [K in keyof typeof densityDefaults]: (typeof densityDefaults)[K] extends Record<
    string,
    unknown
  >
    ? { readonly [S in keyof (typeof densityDefaults)[K]]: string }
    : string;
};

// FLOOR NOTE: --control-height-sm at compact (1.75rem / 28px) is the smallest box
// the system produces. It must never drop below 1.5rem — icon-only buttons zero
// their min-width (rhombus-button.component.scss:49), so this value alone holds
// WCAG 2.2 SC 2.5.8 for them.
//
// The 'default' level IS `densityDefaults` above — there is no third entry here,
// and the generator emits no [data-density='default'] block.
export const densityLevels: Record<'compact' | 'comfortable', DensityScale> = {
  compact: {
    controlHeight: { sm: '1.75rem', md: '2.25rem', lg: '2.75rem' },
    fieldHeight: '3.25rem',
    rowHeight: '3rem',
  },
  comfortable: {
    controlHeight: { sm: '2.25rem', md: '3rem', lg: '3.5rem' },
    fieldHeight: '4rem',
    rowHeight: '3.75rem',
  },
};

export const primitives = { slate, violet, green, amber, red, fontFamily, radius, motion, borderWidth, borderWidthStrong, ...densityDefaults } as const;
export type Primitives = typeof primitives;
