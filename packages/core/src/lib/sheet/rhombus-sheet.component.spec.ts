import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from '../../testing/axe';
import { RhombusSheetComponent } from './rhombus-sheet.component';
import { RhombusSheetActionsDirective } from './rhombus-sheet-actions.directive';
import { RhombusSheetCloseDirective } from './rhombus-sheet-close.directive';
import { RhombusSheetRef } from './rhombus-sheet-ref';

@Component({
  standalone: true,
  imports: [
    RhombusSheetComponent,
    RhombusSheetActionsDirective,
    RhombusSheetCloseDirective,
  ],
  template: `
    <rhombus-sheet [title]="title" [dismissible]="dismissible">
      <p>Body content</p>
      <div rhombusSheetActions>
        <button rhombusSheetClose>Cancel</button>
        <button>Apply</button>
      </div>
    </rhombus-sheet>
  `,
})
class HostComponent {
  title = 'Filters';
  dismissible = true;
}

interface StubRef {
  _setLabelledBy: jest.Mock;
  _activate: jest.Mock;
  close: jest.Mock;
}

function setup(configure?: (host: HostComponent) => void): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  ref: StubRef;
} {
  const ref: StubRef = {
    _setLabelledBy: jest.fn(),
    _activate: jest.fn(),
    close: jest.fn(),
  };
  TestBed.configureTestingModule({
    providers: [{ provide: RhombusSheetRef, useValue: ref }],
  });
  const fixture = TestBed.createComponent(HostComponent);
  if (configure) configure(fixture.componentInstance);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    ref,
  };
}

describe('rhombus-sheet (chrome)', () => {
  it('renders the title as an <h2> with a stable id, wired as the label', () => {
    const { el, ref } = setup();
    const h2 = el.querySelector('.rhombus-sheet__title');
    expect(h2?.textContent?.trim()).toBe('Filters');
    const id = h2?.getAttribute('id');
    expect(id).toMatch(/^rhombus-sheet-title-/);
    expect(ref._setLabelledBy).toHaveBeenCalledWith(id);
  });

  it('does not wire a label when there is no title', () => {
    const { ref } = setup((host) => (host.title = ''));
    expect(ref._setLabelledBy).not.toHaveBeenCalled();
  });

  it('shows a dismiss button that closes the sheet', () => {
    const { el, ref } = setup();
    const dismiss = el.querySelector(
      '.rhombus-sheet__dismiss'
    ) as HTMLButtonElement;
    expect(dismiss).not.toBeNull();
    expect(dismiss.getAttribute('aria-label')).toBe('Close');
    dismiss.click();
    expect(ref.close).toHaveBeenCalled();
  });

  it('hides the dismiss button when dismissible is false', () => {
    const { el } = setup((host) => (host.dismissible = false));
    expect(el.querySelector('.rhombus-sheet__dismiss')).toBeNull();
  });

  it('omits the header entirely with no title and no dismiss', () => {
    const { el } = setup((host) => {
      host.title = '';
      host.dismissible = false;
    });
    expect(el.querySelector('.rhombus-sheet__header')).toBeNull();
  });

  it('projects the body and the actions footer', () => {
    const { el } = setup();
    expect(el.querySelector('.rhombus-sheet__body')?.textContent).toContain(
      'Body content'
    );
    expect(el.querySelector('.rhombus-sheet__footer')?.textContent).toContain(
      'Cancel'
    );
  });

  it('closes the sheet from a [rhombusSheetClose] control', () => {
    const { el, ref } = setup();
    const cancel = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cancel')
    ) as HTMLButtonElement;
    cancel.click();
    expect(ref.close).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('renders and no-ops when used outside a sheet (no ref)', () => {
    // No RhombusSheetRef provided: the chrome injects it optionally and every
    // ref call short-circuits — it must still render and not throw.
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(NoRefHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    const el = fixture.nativeElement as HTMLElement;
    const dismiss = el.querySelector(
      '.rhombus-sheet__dismiss'
    ) as HTMLButtonElement;
    expect(() => dismiss.click()).not.toThrow();
  });
});

@Component({
  standalone: true,
  imports: [RhombusSheetComponent],
  template: `<rhombus-sheet title="Standalone"><p>Body</p></rhombus-sheet>`,
})
class NoRefHostComponent {}
