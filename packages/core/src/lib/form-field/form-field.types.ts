// Shared public types for the RhombusKit form primitives (input,
// textarea, select). These three components each inline their own
// <mat-form-field> — Material's MatFormField finds its control via a
// content query that does not pierce ng-content, so a shared wrapper
// component cannot host the projected control. The shared *styling*
// lives in packages/core/scss/_form-field.scss instead.

export type FormFieldAppearance = 'outline' | 'fill';
export type FormFieldSize = 'sm' | 'md' | 'lg';
