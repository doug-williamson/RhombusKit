import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatTooltip, TooltipPosition } from '@angular/material/tooltip';
import { axe } from '../../testing/axe';
import { RhombusTooltipDirective } from './rhombus-tooltip.directive';

@Component({
  standalone: true,
  imports: [RhombusTooltipDirective],
  template: `
    <button
      type="button"
      [rhombusTooltip]="message"
      [rhombusTooltipPosition]="position"
    >
      Help
    </button>
  `,
})
class HostComponent {
  message = 'More info';
  position: TooltipPosition = 'above';
}

function setup() {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const de = fixture.debugElement.query(By.directive(RhombusTooltipDirective));
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    tooltip: de.injector.get(MatTooltip),
  };
}

describe('rhombus-tooltip directive', () => {
  it('forwards the message to MatTooltip', () => {
    const { tooltip } = setup();
    expect(tooltip.message).toBe('More info');
  });

  it('forwards the position to MatTooltip', () => {
    const { tooltip } = setup();
    expect(tooltip.position).toBe('above');
  });

  it('reacts to message changes', () => {
    const { fixture, host, tooltip } = setup();
    host.message = 'Updated copy';
    fixture.detectChanges();
    expect(tooltip.message).toBe('Updated copy');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
