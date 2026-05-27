import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="showcase-shell__header">
      <a routerLink="/" class="showcase-shell__brand">RhombusKit</a>
      <nav class="showcase-shell__nav">
        <a routerLink="/components/button" routerLinkActive="is-active">Button</a>
        <a routerLink="/components/badge"  routerLinkActive="is-active">Badge</a>
        <a routerLink="/components/card"   routerLinkActive="is-active">Card</a>
        <a routerLink="/components/chip"   routerLinkActive="is-active">Chip</a>
      </nav>
    </header>
    <main class="showcase-shell__main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {}
