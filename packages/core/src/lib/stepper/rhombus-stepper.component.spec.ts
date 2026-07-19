import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { axe } from '../../testing/axe';
import { RhombusStepperComponent } from './rhombus-stepper.component';
import { RhombusStepComponent } from './rhombus-step.component';
import { RhombusStepLabelDirective } from './rhombus-step-label.directive';
import {
  RhombusStepperNextDirective,
  RhombusStepperPreviousDirective,
} from './rhombus-stepper-buttons.directive';

/** Keyboard events reach the CDK FocusKeyManager, which reads `keyCode`. */
const RIGHT = 39;
const DOWN = 40;
const UP = 38;
const HOME = 36;
const END = 35;
const ENTER = 13;
const SPACE = 32;

function key(code: number): KeyboardEvent {
  return new KeyboardEvent('keydown', { keyCode: code, bubbles: true } as never);
}

@Component({
  standalone: true,
  imports: [
    RhombusStepperComponent,
    RhombusStepComponent,
    RhombusStepLabelDirective,
    RhombusStepperNextDirective,
    RhombusStepperPreviousDirective,
    ReactiveFormsModule,
  ],
  template: `
    <rhombus-stepper
      [orientation]="orientation"
      [linear]="linear"
      [labelPosition]="labelPosition"
      [(selectedIndex)]="index"
      (stepChange)="lastStepChange = $event"
    >
      <rhombus-step [label]="'Account'" [stepControl]="ctrl">
        <p>Account content</p>
        <button rhombusStepperNext>Next</button>
      </rhombus-step>
      <rhombus-step [optional]="optional">
        <ng-template rhombusStepLabel>Ship <em>here</em></ng-template>
        <p>Shipping content</p>
        <button rhombusStepperPrevious>Back</button>
        <button rhombusStepperNext>Next</button>
      </rhombus-step>
      <rhombus-step
        [label]="'Review'"
        [completed]="reviewCompleted"
        [editable]="false"
      >
        <p>Review content</p>
      </rhombus-step>
    </rhombus-stepper>
  `,
})
class HostComponent {
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  linear = false;
  labelPosition: 'end' | 'bottom' = 'end';
  optional = false;
  reviewCompleted = false;
  index = 0;
  lastStepChange = -1;
  ctrl = new FormControl('', Validators.required);
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  stepper: RhombusStepperComponent;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    stepper: fixture.debugElement.query(By.directive(RhombusStepperComponent))
      .componentInstance as RhombusStepperComponent,
  };
}

afterEach(() => {
  document.body
    .querySelectorAll('[ng-version]')
    .forEach((n) => n.parentElement?.removeChild(n));
});

function tabs(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('[role="tab"]'));
}
function panels(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('[role="tabpanel"]'));
}

describe('rhombus-stepper', () => {
  it('renders a tablist with one tab per step and one tabpanel per step', () => {
    const { el } = setup();
    expect(el.querySelectorAll('[role="tablist"]').length).toBe(1);
    expect(tabs(el).length).toBe(3);
    expect(panels(el).length).toBe(3);
  });

  it('wires each tab to its panel via aria-controls / aria-labelledby', () => {
    const { el } = setup();
    const ts = tabs(el);
    const ps = panels(el);
    const ids = new Set<string>();
    ts.forEach((tab, i) => {
      expect(tab.getAttribute('aria-controls')).toBe(ps[i].id);
      expect(ps[i].getAttribute('aria-labelledby')).toBe(tab.id);
      ids.add(tab.id);
      ids.add(ps[i].id);
    });
    expect(ids.size).toBe(6);
  });

  it('marks the selected tab and roves tabindex', () => {
    const { el } = setup();
    const [a, b] = tabs(el);
    expect(a.getAttribute('aria-selected')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('0');
    expect(b.getAttribute('aria-selected')).toBe('false');
    expect(b.getAttribute('tabindex')).toBe('-1');
  });

  it('makes only the selected panel non-inert', () => {
    const { el } = setup();
    const ps = panels(el);
    expect(ps[0].hasAttribute('inert')).toBe(false);
    expect(ps[1].hasAttribute('inert')).toBe(true);
    expect(ps[2].hasAttribute('inert')).toBe(true);
  });

  it('selects a step on tab click and updates [(selectedIndex)]', () => {
    const { fixture, host, el } = setup();
    tabs(el)[1].click();
    fixture.detectChanges();
    expect(host.index).toBe(1);
    expect(tabs(el)[1].getAttribute('aria-selected')).toBe('true');
  });

  it('uses MANUAL activation: arrows roam focus without selecting; Enter selects', () => {
    const { fixture, host, el } = setup();
    const ts = tabs(el);
    ts[0].focus();
    ts[0].dispatchEvent(key(RIGHT));
    fixture.detectChanges();
    // Focus roamed to the second header, but selection is unchanged.
    expect(document.activeElement).toBe(ts[1]);
    expect(host.index).toBe(0);
    // Enter on the focused header commits the selection.
    ts[1].dispatchEvent(key(ENTER));
    fixture.detectChanges();
    expect(host.index).toBe(1);
  });

  it('activates with Space as well', () => {
    const { fixture, host, el } = setup();
    const ts = tabs(el);
    ts[0].focus();
    ts[0].dispatchEvent(key(END)); // roam to last
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[2]);
    ts[2].dispatchEvent(key(SPACE));
    fixture.detectChanges();
    expect(host.index).toBe(2);
  });

  it('Home/End roam to the first/last header', () => {
    const { fixture, el } = setup();
    const ts = tabs(el);
    ts[0].focus();
    ts[0].dispatchEvent(key(END));
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[2]);
    ts[2].dispatchEvent(key(HOME));
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[0]);
  });

  it('advances / retreats via [rhombusStepperNext] and [rhombusStepperPrevious]', () => {
    const { fixture, host, el } = setup();
    const next = el.querySelector<HTMLButtonElement>(
      '[role="tabpanel"]:not([inert]) button[rhombusStepperNext]'
    );
    next!.click();
    fixture.detectChanges();
    expect(host.index).toBe(1);

    const prev = el.querySelector<HTMLButtonElement>(
      '[role="tabpanel"]:not([inert]) button[rhombusStepperPrevious]'
    );
    prev!.click();
    fixture.detectChanges();
    expect(host.index).toBe(0);
  });

  it('throws when assigning an out-of-range selectedIndex', () => {
    const { stepper } = setup();
    expect(() => (stepper.selectedIndex = 9)).toThrow();
    expect(() => (stepper.selectedIndex = -1)).toThrow();
  });

  it('emits stepChange with the newly selected index', () => {
    const { fixture, host, el } = setup();
    tabs(el)[1].click();
    fixture.detectChanges();
    expect(host.lastStepChange).toBe(1);
  });

  it('linear mode gates advancing past a step with an invalid control', () => {
    const { fixture, host, el } = setup();
    host.linear = true;
    fixture.detectChanges();
    // Step 0's required control is empty → cannot move forward.
    tabs(el)[2].click();
    fixture.detectChanges();
    expect(host.index).toBe(0);
    // Satisfy the control, then advance is allowed.
    host.ctrl.setValue('someone@example.com');
    fixture.detectChanges();
    tabs(el)[1].click();
    fixture.detectChanges();
    expect(host.index).toBe(1);
  });

  it('renders a projected [rhombusStepLabel] template in the header', () => {
    const { el } = setup();
    // The second step uses a rich label template.
    expect(tabs(el)[1].textContent).toContain('Ship');
    expect(tabs(el)[1].querySelector('em')?.textContent).toBe('here');
  });

  it('renders the plain-text label input in the header', () => {
    const { el } = setup();
    expect(tabs(el)[0].textContent).toContain('Account');
    expect(tabs(el)[2].textContent).toContain('Review');
  });

  it('shows the optional label for an optional step', () => {
    const { fixture, host, el } = setup();
    host.optional = true;
    fixture.detectChanges();
    expect(tabs(el)[1].textContent).toContain('Optional');
  });

  it('renders the 1-based step number for the number state', () => {
    const { el } = setup();
    // First step is neither completed nor errored → shows "1".
    expect(tabs(el)[0].textContent).toContain('1');
  });

  it('renders the done indicator for a completed, non-editable step', () => {
    const { fixture, host, el } = setup();
    host.reviewCompleted = true;
    fixture.detectChanges();
    const doneTab = tabs(el)[2];
    expect(doneTab.querySelector('rhombus-icon')).toBeTruthy();
    // A visually-hidden phrase names the state for assistive tech.
    expect(doneTab.textContent?.toLowerCase()).toContain('completed');
  });

  it('reflects orientation on the tablist and host class', () => {
    const { fixture, host, el } = setup();
    const tablist = el.querySelector('[role="tablist"]')!;
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');

    host.orientation = 'vertical';
    fixture.detectChanges();
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.querySelector('.rhombus-stepper--vertical')).toBeTruthy();

    // Vertical roaming uses Down (keyManager vertical orientation).
    const ts = tabs(el);
    ts[0].focus();
    ts[0].dispatchEvent(key(DOWN));
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[1]);
  });

  it('roams the vertical axis with Down/Up (primary axis)', () => {
    const { fixture, host, el } = setup();
    host.orientation = 'vertical';
    fixture.detectChanges();
    const ts = tabs(el);
    ts[0].focus();
    // CdkStepper enables vertical roaming on top of its always-on horizontal
    // Directionality wiring, so the primary Down/Up axis is what we assert.
    ts[0].dispatchEvent(key(DOWN));
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[1]);
    ts[1].dispatchEvent(key(UP));
    fixture.detectChanges();
    expect(document.activeElement).toBe(ts[0]);
  });

  it('has no accessibility violations (horizontal)', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations (vertical)', async () => {
    const { fixture, host, el } = setup();
    host.orientation = 'vertical';
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
