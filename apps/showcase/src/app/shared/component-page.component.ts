import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { RhombusTabGroupDirective } from '@rhombuskit/core';
import { ApiTableComponent } from './api-table.component';
import { PageFeedbackComponent } from './page-feedback.component';

type TabId = 'overview' | 'usage' | 'examples' | 'api';

/**
 * Shared chrome for every component page: a title + an
 * Overview / Usage / Examples / API tab group (dogfooding `[rhombusTabGroup]`).
 * The selected tab is synced to the `?tab=` query param so tabs are deep-linkable
 * and the back button works.
 *
 * The Usage tab is opt-in via `[hasUsage]` — it appears only on pages that
 * project `[usage]` content, so the tab list (and therefore the `?tab=` →
 * index mapping) stays correct while pages are migrated to the four-tab layout.
 *
 *   <app-component-page title="Button" apiKey="RhombusButtonComponent" [hasUsage]="true">
 *     <div overview>…orientation + hero…</div>
 *     <div usage>…import, slots, theming tokens, accessibility…</div>
 *     <div examples>…showcase-section blocks…</div>
 *   </app-component-page>
 */
@Component({
  selector: 'app-component-page',
  standalone: true,
  imports: [
    MatTabsModule,
    RhombusTabGroupDirective,
    ApiTableComponent,
    PageFeedbackComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="showcase-page component-page">
      <header class="showcase-page__header component-page__header">
        <h1>{{ title() }}</h1>
      </header>

      <mat-tab-group
        rhombusTabGroup
        [selectedIndex]="selectedIndex()"
        (tabChange)="onTab($event)"
      >
        <mat-tab label="Overview">
          <div class="component-page__tab">
            <ng-content select="[overview]" />
          </div>
        </mat-tab>
        @if (hasUsage()) {
          <mat-tab label="Usage">
            <div class="component-page__tab">
              <ng-content select="[usage]" />
            </div>
          </mat-tab>
        }
        <mat-tab label="Examples">
          <div class="component-page__tab">
            <ng-content select="[examples]" />
          </div>
        </mat-tab>
        <mat-tab label="API">
          <div class="component-page__tab">
            <app-api-table [apiKey]="apiKey()" />
          </div>
        </mat-tab>
      </mat-tab-group>

      <app-page-feedback [component]="title()" />
    </div>
  `,
})
export class ComponentPageComponent {
  /** Display name shown as the page heading (e.g. "Button"). */
  readonly title = input.required<string>();
  /**
   * Public export name(s) used to look up generated API metadata. Accepts an
   * array so a feature that ships several symbols (a panel + its trigger
   * directive, a service + its components) documents them all on one page.
   */
  readonly apiKey = input<string | readonly string[]>('');
  /** Show the Usage tab; set on pages that project `[usage]` content. */
  readonly hasUsage = input<boolean>(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  /** Tab order, narrowed to what's actually rendered (Usage is opt-in). */
  protected readonly tabs = computed<TabId[]>(() =>
    this.hasUsage()
      ? ['overview', 'usage', 'examples', 'api']
      : ['overview', 'examples', 'api']
  );

  protected readonly selectedIndex = computed(() => {
    const tab = this.params().get('tab') as TabId | null;
    const i = tab ? this.tabs().indexOf(tab) : 0;
    return i < 0 ? 0 : i;
  });

  protected onTab(index: number): void {
    const tab = this.tabs()[index] ?? 'overview';
    void this.router.navigate([], {
      relativeTo: this.route,
      // Keep the default tab out of the URL for a clean canonical link.
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge',
    });
  }
}
