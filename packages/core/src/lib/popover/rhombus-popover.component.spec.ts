// packages/core/src/lib/popover/rhombus-popover.component.spec.ts
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusPopoverComponent } from './rhombus-popover.component';
import { RhombusPopoverTriggerDirective } from './rhombus-popover-trigger.directive';

@Component({
  standalone: true,
  imports: [RhombusPopoverComponent, RhombusPopoverTriggerDirective],
  template: `
    <button [rhombusPopoverTriggerFor]="pop" aria-label="Open">Open</button>
    <rhombus-popover #pop ariaLabel="Calendar">
      <p>Panel body</p>
    </rhombus-popover>
  `,
})
class HostComponent {}

function setup() {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const trigger = el.querySelector('button[aria-label="Open"]') as HTMLButtonElement;
  const overlay = () => TestBed.inject(OverlayContainer).getContainerElement();
  return { fixture, el, trigger, overlay };
}

describe('rhombus-popover', () => {
  it('advertises a dialog popup and starts collapsed', () => {
    const { trigger } = setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on click, renders projected content in the overlay as a labelled dialog', () => {
    const { fixture, trigger, overlay } = setup();
    trigger.click();
    fixture.detectChanges();
    const panel = overlay().querySelector('.rhombus-popover__panel');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('dialog');
    expect(panel?.getAttribute('aria-label')).toBe('Calendar');
    expect(panel?.textContent).toContain('Panel body');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles closed on a second click', () => {
    const { fixture, trigger, overlay } = setup();
    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(overlay().querySelector('.rhombus-popover__panel')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('disposes the overlay when the trigger is destroyed while open', () => {
    const { fixture, trigger, overlay } = setup();
    trigger.click();
    fixture.detectChanges();
    expect(overlay().querySelector('.rhombus-popover__panel')).not.toBeNull();
    fixture.destroy();
    expect(overlay().querySelector('.rhombus-popover__panel')).toBeNull();
    expect(overlay().querySelector('.cdk-overlay-backdrop')).toBeNull();
  });

  it('has no accessibility violations on the trigger or the open panel', async () => {
    const { fixture, el, trigger, overlay } = setup();
    expect(await axe(el)).toHaveNoViolations();
    trigger.click();
    fixture.detectChanges();
    expect(await axe(overlay())).toHaveNoViolations();
  });
});
