import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RHOMBUS_SHEET_DATA,
  RhombusButtonComponent,
  RhombusCodeBlockComponent,
  RhombusSheetActionsDirective,
  RhombusSheetCloseDirective,
  RhombusSheetComponent,
  RhombusSheetRef,
  RhombusSheetService,
  type SheetSide,
  type SheetSize,
} from '@rhombuskit/core';
import { ComponentPageComponent } from '../../shared/component-page.component';

interface InfoData {
  title: string;
  body: string;
}

/** A simple content sheet used by the side / size demos. */
@Component({
  standalone: true,
  imports: [
    RhombusSheetComponent,
    RhombusSheetActionsDirective,
    RhombusSheetCloseDirective,
    RhombusButtonComponent,
  ],
  template: `
    <rhombus-sheet [title]="data.title">
      <p>{{ data.body }}</p>
      <p>
        Focus is trapped here, Escape closes it (animated), and focus returns to
        the trigger. The scrim blocks the page behind.
      </p>
      <div rhombusSheetActions>
        <rhombus-button appearance="text" rhombusSheetClose>Close</rhombus-button>
      </div>
    </rhombus-sheet>
  `,
})
class InfoSheetComponent {
  protected readonly data = inject<InfoData>(RHOMBUS_SHEET_DATA);
}

/** A form sheet that returns a result via the ref. */
@Component({
  standalone: true,
  imports: [
    RhombusSheetComponent,
    RhombusSheetActionsDirective,
    RhombusSheetCloseDirective,
    RhombusButtonComponent,
  ],
  template: `
    <rhombus-sheet title="Rename project">
      <label class="field">
        <span>Project name</span>
        <input
          class="field__input"
          type="text"
          [value]="name()"
          (input)="name.set($any($event.target).value)"
        />
      </label>
      <div rhombusSheetActions>
        <rhombus-button appearance="text" rhombusSheetClose>Cancel</rhombus-button>
        <rhombus-button (click)="save()">Save</rhombus-button>
      </div>
    </rhombus-sheet>
  `,
  styles: `
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .field__input {
      padding: 0.5rem 0.625rem;
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius-md);
      background: var(--surface-0);
      color: var(--text-primary);
      font: inherit;
    }
    .field__input:focus-visible {
      outline: 2px solid var(--focus-border);
      outline-offset: 1px;
    }
  `,
})
class RenameSheetComponent {
  private readonly ref = inject<RhombusSheetRef<string>>(RhombusSheetRef);
  protected readonly name = signal(
    inject<string>(RHOMBUS_SHEET_DATA) ?? 'Untitled'
  );

  protected save(): void {
    this.ref.close(this.name());
  }
}

@Component({
  selector: 'app-sheet-page',
  standalone: true,
  imports: [
    RouterLink,
    RhombusButtonComponent,
    RhombusCodeBlockComponent,
    ComponentPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-component-page
      title="Sheet"
      [hasUsage]="true"
      [apiKey]="apiKeys"
    >
      <div overview class="overview">
        <p class="overview__lead">
          A sheet (or drawer) is a modal panel that slides in from an edge of the
          screen for a focused, temporary task — filters, details, a quick form.
          RhombusKit's <code>RhombusSheetService</code> opens one on
          <code>&#64;angular/cdk/dialog</code> + overlay (scrim, focus-trap,
          focus-restore, scroll-block), <strong>not</strong> <code>MatDialog</code>
          — so it slides from an edge and carries no
          <code>&#64;angular/animations</code> dependency. No new tokens.
        </p>

        <section class="showcase-section">
          <h2>Example</h2>
          <div class="sheet-triggers">
            <rhombus-button (click)="openInfo('right')">Open sheet</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>When to use — and what else to reach for</h2>
          <ul>
            <li>
              <strong>Sheet</strong> — a <em>temporary, modal</em> panel anchored to
              an edge for a side task (filters, a record's detail, a short form). It
              traps focus and dims the page; you finish and dismiss it.
            </li>
            <li>
              <strong><a routerLink="/components/app-shell">App Shell</a> sidenav</strong>
              — a <em>persistent</em> layout frame for primary navigation, part of
              the page, not a modal overlay.
            </li>
            <li>
              <strong><a routerLink="/components/dialog">Dialog</a></strong> — a
              <em>centred</em> modal for a confirmation or a compact form that
              isn't tied to an edge.
            </li>
            <li>
              <strong><a routerLink="/components/popover">Popover</a></strong> — a
              small, <em>non-modal</em> panel anchored to the trigger that
              summoned it; the page stays interactive.
            </li>
          </ul>
        </section>

        <section class="showcase-section">
          <h2>Migrating from Material</h2>
          <p>
            Replaces <code>MatBottomSheet</code> (and covers the edge-drawer use of
            <code>mat-sidenav</code> opened as an overlay). For a
            <em>persistent</em> sidenav, use the App Shell instead.
          </p>
        </section>
      </div>

      <div usage class="usage">
        <p class="overview__lead">
          Inject <code>RhombusSheetService</code>, open a component, and wrap that
          component's template in <code>&lt;rhombus-sheet&gt;</code> for the
          standard chrome. Read the result from <code>afterClosed()</code>.
        </p>

        <section class="showcase-section">
          <h2>Import &amp; setup</h2>
          <rhombus-code-block language="typescript" [code]="usage" />
        </section>

        <section class="showcase-section">
          <h2>Config &amp; anatomy</h2>
          <ul>
            <li><code>side</code> — <code>left</code> / <code>right</code> (default) / <code>bottom</code>; <code>size</code> — <code>sm</code>/<code>md</code>/<code>lg</code> or a raw CSS length (width for side sheets, height for a bottom sheet).</li>
            <li><code>data</code> — injected into the opened component via <code>RHOMBUS_SHEET_DATA</code>; <code>afterClosed()</code> emits the <code>ref.close(result)</code> value.</li>
            <li><code>disableClose</code> — block Escape / backdrop dismissal; <code>hasBackdrop</code>, <code>ariaLabel</code>, <code>autoFocus</code>, <code>restoreFocus</code>, <code>panelClass</code>.</li>
            <li><strong>Chrome</strong> — <code>&lt;rhombus-sheet [title]&gt;</code> (drives the accessible name), <code>[dismissible]</code> header ×; project actions via <code>[rhombusSheetActions]</code>; close any control with <code>[rhombusSheetClose]</code>.</li>
          </ul>
        </section>

        <section class="usage__a11y">
          <h2>Accessibility</h2>
          <p>
            The CDK dialog container already provides <code>role="dialog"</code> and
            <code>aria-modal="true"</code>, focus-trapping, Escape-to-close, and
            focus restore — the chrome does <strong>not</strong> re-declare them. A
            sheet <strong>must</strong> have an accessible name: either a
            <code>&lt;rhombus-sheet [title]&gt;</code> (wired as
            <code>aria-labelledby</code>) or a <code>config.ariaLabel</code>. Opening
            one with neither fails loud in development. The slide is a
            compositor-only <code>transform</code> and is dropped under
            <code>prefers-reduced-motion</code>.
          </p>
        </section>
      </div>

      <div examples>
        <section class="showcase-section">
          <h2>Sides</h2>
          <div class="sheet-triggers">
            <rhombus-button appearance="outlined" (click)="openInfo('left')">From left</rhombus-button>
            <rhombus-button appearance="outlined" (click)="openInfo('right')">From right</rhombus-button>
            <rhombus-button appearance="outlined" (click)="openInfo('bottom')">From bottom</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Sizes</h2>
          <div class="sheet-triggers">
            <rhombus-button appearance="outlined" (click)="openSized('sm')">Small</rhombus-button>
            <rhombus-button appearance="outlined" (click)="openSized('md')">Medium</rhombus-button>
            <rhombus-button appearance="outlined" (click)="openSized('lg')">Large</rhombus-button>
          </div>
        </section>

        <section class="showcase-section">
          <h2>Returning a result</h2>
          <p class="showcase-section__lead">
            A form sheet returns a value via <code>ref.close(result)</code>, read
            from <code>afterClosed()</code>.
          </p>
          <div class="sheet-triggers">
            <rhombus-button (click)="openForm()">Rename project…</rhombus-button>
          </div>
          <p class="sheet-result">
            Last result: <strong>{{ lastResult() ?? '—' }}</strong>
          </p>
        </section>

        <section class="showcase-section">
          <h2>Non-dismissible</h2>
          <p class="showcase-section__lead">
            <code>disableClose: true</code> blocks Escape / backdrop; the user must
            use an explicit control.
          </p>
          <div class="sheet-triggers">
            <rhombus-button appearance="outlined" (click)="openLocked()">Open (locked)</rhombus-button>
          </div>
        </section>
      </div>
    </app-component-page>
  `,
  styles: `
    .sheet-triggers {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .showcase-section__lead {
      color: var(--text-secondary);
      margin: 0 0 0.75rem 0;
    }
    .sheet-result {
      margin-top: 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }
  `,
})
export default class SheetPageComponent {
  private readonly sheet = inject(RhombusSheetService);

  protected readonly apiKeys = [
    'RhombusSheetService',
    'RhombusSheetComponent',
    'RhombusSheetRef',
    'RhombusSheetActionsDirective',
    'RhombusSheetCloseDirective',
  ];

  protected readonly lastResult = signal<string | null>(null);

  protected openInfo(side: SheetSide): void {
    const body =
      side === 'bottom'
        ? 'A bottom sheet is handy on mobile for quick actions.'
        : `A ${side} sheet is the usual home for filters or a record's detail.`;
    this.sheet.open<void, InfoData>(InfoSheetComponent, {
      side,
      data: { title: `${side[0].toUpperCase()}${side.slice(1)} sheet`, body },
    });
  }

  protected openSized(size: SheetSize): void {
    this.sheet.open<void, InfoData>(InfoSheetComponent, {
      size,
      data: {
        title: `Size: ${size}`,
        body: `This sheet was opened with size="${size}".`,
      },
    });
  }

  protected openForm(): void {
    const ref = this.sheet.open<string, string>(RenameSheetComponent, {
      data: this.lastResult() ?? 'My project',
    });
    ref.afterClosed().subscribe((result) => {
      if (result != null) this.lastResult.set(result);
    });
  }

  protected openLocked(): void {
    this.sheet.open<void, InfoData>(InfoSheetComponent, {
      disableClose: true,
      data: {
        title: 'Locked sheet',
        body: 'Escape and backdrop clicks are disabled — use Close.',
      },
    });
  }

  protected readonly usage = `import { inject } from '@angular/core';
import {
  RhombusSheetService,
  RhombusSheetComponent,
  RhombusSheetActionsDirective,
  RhombusSheetCloseDirective,
  RHOMBUS_SHEET_DATA,
  RhombusSheetRef,
} from '@rhombuskit/core';

// 1. The sheet content, wrapped in the chrome:
@Component({
  imports: [RhombusSheetComponent, RhombusSheetActionsDirective, RhombusSheetCloseDirective],
  template: \`
    <rhombus-sheet title="Filters">
      <!-- body -->
      <div rhombusSheetActions>
        <rhombus-button appearance="text" rhombusSheetClose>Cancel</rhombus-button>
        <rhombus-button (click)="apply()">Apply</rhombus-button>
      </div>
    </rhombus-sheet>
  \`,
})
export class FilterSheetComponent {
  private ref = inject<RhombusSheetRef<Filters>>(RhombusSheetRef);
  data = inject(RHOMBUS_SHEET_DATA);
  apply() { this.ref.close(this.selected); }
}

// 2. Open it:
private sheet = inject(RhombusSheetService);

const ref = this.sheet.open<Filters>(FilterSheetComponent, {
  side: 'right',
  data: { applied },
});
ref.afterClosed().subscribe((filters) => { /* ... */ });`;
}
