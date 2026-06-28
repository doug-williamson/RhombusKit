import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusAccordionComponent } from './rhombus-accordion.component';
import { RhombusAccordionPanelComponent } from './rhombus-accordion-panel.component';
import { RhombusAccordionTitleDirective } from './rhombus-accordion-title.directive';

@Component({
  standalone: true,
  imports: [
    RhombusAccordionComponent,
    RhombusAccordionPanelComponent,
    RhombusAccordionTitleDirective,
  ],
  template: `
    <rhombus-accordion [multi]="multi">
      <rhombus-accordion-panel [title]="t1" [(expanded)]="e1" [disabled]="d1">
        <p>Panel one content</p>
      </rhombus-accordion-panel>
      <rhombus-accordion-panel>
        <span rhombusAccordionTitle>Projected two</span>
        <p>Panel two content</p>
      </rhombus-accordion-panel>
      <rhombus-accordion-panel title="Three">
        <p>Panel three content</p>
      </rhombus-accordion-panel>
    </rhombus-accordion>
  `,
})
class HostComponent {
  multi = false;
  t1 = 'One';
  e1 = false;
  d1 = false;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  // Attach to the document so focus / activeElement assertions work in jsdom.
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

afterEach(() => {
  document.body.querySelectorAll('rk-host, [ng-version]').forEach((n) => {
    if (n.querySelector('rhombus-accordion')) n.remove();
  });
});

function triggers(el: HTMLElement): HTMLButtonElement[] {
  return Array.from(el.querySelectorAll('.rhombus-accordion__trigger'));
}
function regions(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('.rhombus-accordion__region'));
}

describe('rhombus-accordion', () => {
  it('renders header text from the title input and a projected title slot', () => {
    const { el } = setup();
    const [a, b, c] = triggers(el);
    expect(a.textContent).toContain('One');
    expect(b.textContent).toContain('Projected two');
    expect(c.textContent).toContain('Three');
  });

  it('toggles aria-expanded and the region inert state on click', () => {
    const { fixture, el } = setup();
    const [first] = triggers(el);
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(regions(el)[0].hasAttribute('inert')).toBe(true);

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(regions(el)[0].hasAttribute('inert')).toBe(false);

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(regions(el)[0].hasAttribute('inert')).toBe(true);
  });

  it('single-expand: opening one panel closes the others', () => {
    const { fixture, el } = setup();
    const [a, b] = triggers(el);

    a.click();
    fixture.detectChanges();
    expect(a.getAttribute('aria-expanded')).toBe('true');

    b.click();
    fixture.detectChanges();
    fixture.detectChanges(); // settle the single-expand effect's writes
    expect(b.getAttribute('aria-expanded')).toBe('true');
    expect(a.getAttribute('aria-expanded')).toBe('false');
  });

  it('multi-expand: panels stay open independently', () => {
    const { fixture, host, el } = setup();
    host.multi = true;
    fixture.detectChanges();
    const [a, b] = triggers(el);

    a.click();
    fixture.detectChanges();
    b.click();
    fixture.detectChanges();

    expect(a.getAttribute('aria-expanded')).toBe('true');
    expect(b.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not toggle a disabled panel and marks it aria-disabled', () => {
    const { fixture, host, el } = setup();
    host.d1 = true;
    fixture.detectChanges();
    const [first] = triggers(el);
    expect(first.getAttribute('aria-disabled')).toBe('true');

    first.click();
    fixture.detectChanges();
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('moves header focus with ArrowDown/ArrowUp/Home/End', () => {
    const { el } = setup();
    const [a, b, c] = triggers(el);
    a.focus();
    expect(document.activeElement).toBe(a);

    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(b);

    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(c);

    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(a); // wraps

    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(c); // wraps backwards

    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(a);
  });

  it('wires each header to its region via aria-controls / aria-labelledby', () => {
    const { el } = setup();
    const ts = triggers(el);
    const rs = regions(el);
    const ids = new Set<string>();
    ts.forEach((trigger, i) => {
      const region = rs[i];
      expect(trigger.getAttribute('aria-controls')).toBe(region.id);
      expect(region.getAttribute('aria-labelledby')).toBe(trigger.id);
      expect(region.getAttribute('role')).toBe('region');
      ids.add(trigger.id);
      ids.add(region.id);
    });
    // All six ids (3 headers + 3 regions) are unique.
    expect(ids.size).toBe(6);
  });

  it('supports two-way [(expanded)] binding', () => {
    const { fixture, host, el } = setup();
    host.e1 = true;
    fixture.detectChanges();
    const [first] = triggers(el);
    expect(first.getAttribute('aria-expanded')).toBe('true');

    first.click(); // user collapses it
    fixture.detectChanges();
    expect(host.e1).toBe(false);
  });

  it('has no accessibility violations collapsed or expanded', async () => {
    const { fixture, el } = setup();
    expect(await axe(el)).toHaveNoViolations();

    triggers(el)[0].click();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
