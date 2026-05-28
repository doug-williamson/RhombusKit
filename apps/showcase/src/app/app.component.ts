import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule, MatDrawerMode } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './theme-toggle.component';

interface NavItem {
  path: string;
  label: string;
}

/** Viewport below which the sidenav switches to an overlay drawer. */
const MOBILE_QUERY = '(max-width: 959.98px)';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    ThemeToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="showcase-shell__toolbar">
      <button
        matIconButton
        class="showcase-shell__menu-btn"
        (click)="toggle()"
        aria-label="Toggle navigation menu"
      >
        <mat-icon aria-hidden="true">menu</mat-icon>
      </button>
      <a routerLink="/" class="showcase-shell__brand">RhombusKit</a>
      <span class="showcase-shell__spacer"></span>
      <app-theme-toggle />
    </header>

    <mat-sidenav-container class="showcase-shell__container">
      <mat-sidenav
        class="showcase-shell__sidenav"
        [mode]="mode()"
        [opened]="opened()"
        (openedChange)="opened.set($event)"
      >
        <nav class="showcase-shell__nav">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="is-active"
              (click)="closeOnMobile()"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </mat-sidenav>

      <mat-sidenav-content class="showcase-shell__content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly navItems: NavItem[] = [
    { path: '/components/button', label: 'Button' },
    { path: '/components/badge', label: 'Badge' },
    { path: '/components/card', label: 'Card' },
    { path: '/components/chip', label: 'Chip' },
    { path: '/components/input', label: 'Input' },
    { path: '/components/textarea', label: 'Textarea' },
    { path: '/components/select', label: 'Select' },
  ];

  protected readonly isMobile = signal(false);
  protected readonly opened = signal(true);

  protected readonly mode = computed<MatDrawerMode>(() =>
    this.isMobile() ? 'over' : 'side'
  );

  constructor() {
    // Drive both the drawer mode and its default open state off one
    // breakpoint. Crossing the breakpoint resets `opened` to the natural
    // state for that viewport (open on desktop, closed on mobile); a
    // user's manual toggle persists until the next crossing.
    this.breakpointObserver
      .observe(MOBILE_QUERY)
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        this.opened.set(!result.matches);
      });
  }

  protected toggle(): void {
    this.opened.update((v) => !v);
  }

  /** In overlay mode, tapping a nav link should dismiss the drawer. */
  protected closeOnMobile(): void {
    if (this.isMobile()) {
      this.opened.set(false);
    }
  }
}
