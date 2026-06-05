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

const TABS = ['overview', 'examples', 'api'] as const;
type TabId = (typeof TABS)[number];

/**
 * Shared chrome for every component page: a title + an Overview / Examples / API
 * tab group (dogfooding `[rhombusTabGroup]`). The selected tab is synced to the
 * `?tab=` query param so tabs are deep-linkable and the back button works.
 *
 * Pages project two slots and declare the API metadata key:
 *
 *   <app-component-page title="Button" apiKey="RhombusButtonComponent">
 *     <div overview>…prose…</div>
 *     <div examples>…showcase-section blocks…</div>
 *   </app-component-page>
 */
@Component({
  selector: 'app-component-page',
  standalone: true,
  imports: [MatTabsModule, RhombusTabGroupDirective],
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
        <mat-tab label="Examples">
          <div class="component-page__tab">
            <ng-content select="[examples]" />
          </div>
        </mat-tab>
        <mat-tab label="API">
          <div class="component-page__tab">
            <!-- Phase 2 replaces this with <app-api-table [apiKey]="apiKey()" />. -->
            <p class="component-page__api-note">
              The API reference is generated from the public type surface.
            </p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class ComponentPageComponent {
  /** Display name shown as the page heading (e.g. "Button"). */
  readonly title = input.required<string>();
  /** Public export name used to look up generated API metadata (Phase 2). */
  readonly apiKey = input<string>('');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly selectedIndex = computed(() => {
    const tab = this.params().get('tab') as TabId | null;
    const i = tab ? TABS.indexOf(tab) : 0;
    return i < 0 ? 0 : i;
  });

  protected onTab(index: number): void {
    const tab = TABS[index] ?? 'overview';
    void this.router.navigate([], {
      relativeTo: this.route,
      // Keep the default tab out of the URL for a clean canonical link.
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge',
    });
  }
}
