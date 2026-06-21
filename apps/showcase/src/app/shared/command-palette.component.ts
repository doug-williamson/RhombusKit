import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NAV_COMMANDS } from './navigation';

/**
 * `⌘K` / `Ctrl-K` command palette — fuzzy-jump to any documented page. Rendered
 * once by the app shell; the overlay is keyboard-driven (arrows + Enter, Escape
 * to close) and uses `aria-activedescendant` so focus stays on the search field.
 * The page list comes from the shared `NAV_COMMANDS`, so it can't drift from the
 * sidebar.
 */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="cmdk-root">
        <!-- Dismiss area: a real button so it's keyboard-accessible without a
             non-interactive click handler; Escape also closes (global keydown). -->
        <button
          type="button"
          class="cmdk-backdrop"
          tabindex="-1"
          aria-label="Close search"
          (click)="close()"
        ></button>

        <div
          class="cmdk-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
        >
          <input
            #searchEl
            class="cmdk-input"
            type="text"
            role="combobox"
            placeholder="Search components and pages…"
            autocomplete="off"
            aria-controls="cmdk-list"
            aria-expanded="true"
            [attr.aria-activedescendant]="
              results().length ? 'cmdk-opt-' + activeIndex() : null
            "
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKey($event)"
          />

          <div id="cmdk-list" class="cmdk-results" role="listbox">
            @for (r of results(); track r.path; let i = $index) {
              <!-- Native button: focusable + keyboard-activatable. tabindex=-1
                   keeps focus on the input (aria-activedescendant pattern). -->
              <button
                type="button"
                [id]="'cmdk-opt-' + i"
                class="cmdk-result"
                role="option"
                tabindex="-1"
                [class.is-active]="i === activeIndex()"
                [attr.aria-selected]="i === activeIndex()"
                (click)="go(r)"
                (mouseenter)="activeIndex.set(i)"
              >
                <span class="cmdk-result__label">{{ r.label }}</span>
                <span class="cmdk-result__group">{{ r.group }}</span>
              </button>
            } @empty {
              <p class="cmdk-empty">No matches for “{{ query() }}”.</p>
            }
          </div>

          <div class="cmdk-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> open</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .cmdk-root {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 12vh 1rem 1rem;
    }

    .cmdk-backdrop {
      position: absolute;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      appearance: none;
      background: rgb(0 0 0 / 0.5);
      backdrop-filter: blur(2px);
      cursor: default;
    }

    .cmdk-panel {
      position: relative;
      z-index: 1;
      width: min(640px, 100%);
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      background: var(--surface-0);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
    }

    .cmdk-input {
      width: 100%;
      box-sizing: border-box;
      padding: 1rem 1.25rem;
      border: 0;
      border-bottom: 1px solid var(--border);
      background: transparent;
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 1rem;
      outline: none;
    }
    .cmdk-input::placeholder {
      color: var(--text-muted);
    }

    .cmdk-results {
      list-style: none;
      margin: 0;
      padding: 0.4rem;
      overflow-y: auto;
    }

    .cmdk-result {
      width: 100%;
      box-sizing: border-box;
      border: 0;
      background: transparent;
      font: inherit;
      text-align: left;
      color: inherit;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.6rem 0.85rem;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .cmdk-result.is-active {
      background: var(--nav-active-bg);
    }
    .cmdk-result.is-active .cmdk-result__label {
      color: var(--nav-active-text);
    }
    .cmdk-result__label {
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    .cmdk-result__group {
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .cmdk-empty {
      list-style: none;
      padding: 1.25rem 0.85rem;
      color: var(--text-secondary);
      text-align: center;
    }

    .cmdk-footer {
      display: flex;
      gap: 1.25rem;
      padding: 0.6rem 1.25rem;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.78rem;

      kbd {
        font-family: var(--font-mono);
        font-size: 0.9em;
        color: var(--text-secondary);
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 0.05em 0.4em;
        margin-right: 0.15em;
      }
    }
  `,
})
export class CommandPaletteComponent {
  private readonly router = inject(Router);
  private readonly searchEl =
    viewChild<ElementRef<HTMLInputElement>>('searchEl');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return NAV_COMMANDS;
    return NAV_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  });

  constructor() {
    // Focus the field whenever the palette opens (input is rendered behind @if).
    effect(() => {
      if (this.open()) {
        const el = this.searchEl()?.nativeElement;
        if (el) queueMicrotask(() => el.focus());
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (this.open()) this.close();
      else this.openPalette();
    } else if (e.key === 'Escape' && this.open()) {
      this.close();
    }
  }

  /** Public entry point for the shell's search button. */
  openPalette(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onInput(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKey(e: KeyboardEvent): void {
    const n = this.results().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex.set(n ? (this.activeIndex() + 1) % n : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex.set(n ? (this.activeIndex() - 1 + n) % n : 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = this.results()[this.activeIndex()];
      if (r) this.go(r);
    }
  }

  protected go(r: { path: string }): void {
    void this.router.navigateByUrl(r.path);
    this.close();
  }
}
