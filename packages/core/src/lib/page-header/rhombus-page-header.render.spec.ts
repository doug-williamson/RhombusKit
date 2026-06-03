import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusPageHeaderComponent } from './rhombus-page-header.component';

/**
 * Host exercising the page-header API. Inputs are writable signals; the badge,
 * description and the projected actions slot are gated host-side so flipping a
 * signal + `detectChanges()` adds/removes the corresponding region. Assertions
 * read the component's own `rhombus-page-header__*` markers and the composed
 * `.rhombus-chip[data-variant]` — never Material internals.
 */
@Component({
  selector: 'rk-page-header-host',
  standalone: true,
  imports: [RhombusPageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rhombus-page-header
      [title]="title()"
      [badge]="badge()"
      [description]="description()"
    >
      @if (showActions()) {
        <button slot="actions" class="host-action">New</button>
      }
    </rhombus-page-header>
  `,
})
class PageHeaderHostComponent {
  readonly title = signal('Buttons');
  readonly badge = signal<string | undefined>(undefined);
  readonly description = signal<string | undefined>(undefined);
  readonly showActions = signal(false);
}

function setup(): {
  fixture: ComponentFixture<PageHeaderHostComponent>;
  host: PageHeaderHostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(PageHeaderHostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-page-header', () => {
  it('renders the required title', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();

    const title = el.querySelector('.rhombus-page-header__title');
    expect(title?.textContent?.trim()).toBe('Buttons');
  });

  it('omits the badge when none is given and renders a primary chip when set', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-chip')).toBeNull();

    host.badge.set('Stable');
    fixture.detectChanges();

    const chip = el.querySelector('mat-chip.rhombus-chip[data-variant="primary"]');
    expect(chip).toBeTruthy();
    expect(chip?.textContent?.trim()).toBe('Stable');
  });

  it('toggles the description region with the description input', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-page-header__description')).toBeNull();

    host.description.set('Triggers an action.');
    fixture.detectChanges();

    const desc = el.querySelector('.rhombus-page-header__description');
    expect(desc?.textContent?.trim()).toBe('Triggers an action.');
  });

  it('projects actions into the actions slot only when provided', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();

    const actions = el.querySelector('.rhombus-page-header__actions');
    expect(actions).toBeTruthy();
    expect(actions?.querySelector('.host-action')).toBeNull();

    host.showActions.set(true);
    fixture.detectChanges();
    expect(actions?.querySelector('.host-action')).toBeTruthy();
  });
});
