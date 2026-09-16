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

// Corner radius — the M3 baseline shape scale (0 / 4 / 8 / 12 / 16 / 28 / pill).
// RETUNED to M3: RhombusKit's own components and the Angular Material bridge
// previously ran two different corner ramps (this scale vs. the bridge's literal
// --mat-sys-corner-* values), which is why shape never read as M3. The NAMES are
// frozen and unchanged — only the values moved, which types.ts explicitly places
// outside the semver contract. The scale is now strictly monotonic, retiring the
// old `sm` (2px) < `xs` (4px) inversion.
export const radius = {
  none: '0',
  xs:   '0.25rem', //  4px — M3 corner-extra-small (form-control corner)
  sm:   '0.5rem',  //  8px — M3 corner-small
  md:   '0.75rem', // 12px — M3 corner-medium (cards)
  lg:   '1rem',    // 16px — M3 corner-large
  xl:   '1.75rem', // 28px — M3 corner-extra-large (dialogs)
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

// M3 typescale — 15 roles x {size, line-height, weight, tracking}, plus the two
// `weight-prominent` variants Angular Material reads. Type geometry is
// theme-independent (a 14px label is 14px in every theme), so like radius / motion /
// border-width / density it lives here as a PRIMITIVE, not in the themed CONTRACT.
// The font FAMILY is themed (--font-sans is a CONTRACT alias); the ramp is not. That
// split is also what keeps @rhombuskit/theme-builder — a colour tool — working
// untouched: it derives a theme from seed colours and has no way to derive a ramp.
//
// Values are the M3 baseline in exact rem at a 16px root. Angular Material emits the
// same ramp rounded to three decimals (0.031rem for body-large tracking, i.e. 0.496px
// against a 0.5px spec), so ours are strictly more faithful and the bridge overrides
// Material's rounding rather than inheriting it.
//
// Authored as a 15-row table of plain object literals so `as const` survives into
// etc/tokens.api.md. flattenPrimitives + toKebab in tools/generate-tokens.mjs turn each
// row into --type-<role>-{size,line-height,weight,tracking} with NO generator changes;
// role keys are already kebab-case for exactly that reason.
//
// NOTE: title-large is weight 400, not 500. It is the one that trips people up.
export const typeScale = {
  // M3's three named weight constants. Angular Material reads these as
  // --mat-sys-{regular,medium,bold}-font-weight independently of any role, so they
  // are system constants rather than a property of one role — sourcing them from a
  // role (say title-medium's weight) would make the global "medium" weight move
  // whenever that role was retuned. Namespaced under `type` so they flatten to
  // --type-weight-*; no role is named `weight`, so there is no collision.
  weight: { regular: '400', medium: '500', bold: '700' },

  'display-large':   { size: '3.5625rem', lineHeight: '4rem',    weight: '400', tracking: '-0.015625rem' },
  'display-medium':  { size: '2.8125rem', lineHeight: '3.25rem', weight: '400', tracking: '0'           },
  'display-small':   { size: '2.25rem',   lineHeight: '2.75rem', weight: '400', tracking: '0'           },
  'headline-large':  { size: '2rem',      lineHeight: '2.5rem',  weight: '400', tracking: '0'           },
  'headline-medium': { size: '1.75rem',   lineHeight: '2.25rem', weight: '400', tracking: '0'           },
  'headline-small':  { size: '1.5rem',    lineHeight: '2rem',    weight: '400', tracking: '0'           },
  'title-large':     { size: '1.375rem',  lineHeight: '1.75rem', weight: '400', tracking: '0'           },
  'title-medium':    { size: '1rem',      lineHeight: '1.5rem',  weight: '500', tracking: '0.009375rem' },
  'title-small':     { size: '0.875rem',  lineHeight: '1.25rem', weight: '500', tracking: '0.00625rem'  },
  'body-large':      { size: '1rem',      lineHeight: '1.5rem',  weight: '400', tracking: '0.03125rem'  },
  'body-medium':     { size: '0.875rem',  lineHeight: '1.25rem', weight: '400', tracking: '0.015625rem' },
  'body-small':      { size: '0.75rem',   lineHeight: '1rem',    weight: '400', tracking: '0.025rem'    },
  'label-large':     { size: '0.875rem',  lineHeight: '1.25rem', weight: '500', tracking: '0.00625rem',  weightProminent: '700' },
  'label-medium':    { size: '0.75rem',   lineHeight: '1rem',    weight: '500', tracking: '0.03125rem',  weightProminent: '700' },
  'label-small':     { size: '0.6875rem', lineHeight: '1rem',    weight: '500', tracking: '0.03125rem'  },
} as const;

// Spacing rhythm — a 4px grid on a numeric multiplier scale. Theme-independent box
// geometry, so it belongs here alongside radius and density rather than in CONTRACT.
// There is deliberately no `7` or other odd step: if a component needs 14px, the
// component is wrong. Authored in rem so it scales with the user's root font size.
export const space = {
  0:  '0',
  1:  '0.25rem', //  4px
  2:  '0.5rem',  //  8px
  3:  '0.75rem', // 12px
  4:  '1rem',    // 16px
  5:  '1.25rem', // 20px
  6:  '1.5rem',  // 24px
  8:  '2rem',    // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
} as const;

// Interaction state-layer opacities. Their absence is what makes controls feel flat
// and un-Material even when the colours are right.
//
// WHY 0.12 AND NOT 0.10 for focus/pressed: current M3 (the Compose token set) specifies
// 0.10, but Angular Material through v21 hard-codes 0.12 in its own
// core/tokens/m3/_md-sys-state.scss — its token file is stamped against an older
// design-system version. RhombusKit WRAPS Material primitives, so matching Material is
// what keeps an unwrapped control and a wrapped one visually consistent. This will look
// like a bug to whoever reads it next; it is not. Revisit if Angular resyncs to 0.10.
//
// Disabled-state opacities are deliberately absent: 0.38 content / 0.12 container is a
// per-component M3 convention, not a system token (Angular Material has no --mat-sys-*
// disabled opacity at all, and the filled form-field container is a real exception at
// 0.04). Disabled is handled in the per-component mat.*-overrides() blocks.
export const state = {
  hoverOpacity:   '0.08',
  focusOpacity:   '0.12',
  pressedOpacity: '0.12',
  draggedOpacity: '0.16',
} as const;

export const primitives = { slate, violet, green, amber, red, fontFamily, radius, type: typeScale, space, state, motion, borderWidth, borderWidthStrong, ...densityDefaults } as const;
export type Primitives = typeof primitives;
