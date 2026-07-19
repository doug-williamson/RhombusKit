import { Component, inject } from '@angular/core';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusSheetService } from './rhombus-sheet.service';
import { RHOMBUS_SHEET_DATA } from './rhombus-sheet-ref';

@Component({ standalone: true, template: `<p>Bare sheet body</p>` })
class BareComponent {}

let capturedData: unknown;
@Component({ standalone: true, template: '' })
class DataProbeComponent {
  constructor() {
    capturedData = inject(RHOMBUS_SHEET_DATA);
  }
}

function setup() {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const service = TestBed.inject(RhombusSheetService);
  const overlayContainer = TestBed.inject(OverlayContainer);
  const overlay = () => overlayContainer.getContainerElement();
  const pane = () =>
    overlay().querySelector('.cdk-overlay-pane') as HTMLElement | null;
  const dialog = () =>
    overlay().querySelector('[role="dialog"]') as HTMLElement | null;
  return { service, overlay, pane, dialog };
}

function transitionEnd(el: HTMLElement, property = 'transform'): void {
  el.dispatchEvent(
    Object.assign(new Event('transitionend'), { propertyName: property })
  );
}

describe('RhombusSheetService', () => {
  it('opens a right sheet with the base + side panel classes and slides open', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    expect(pane()?.classList).toContain('rhombus-sheet-panel');
    expect(pane()?.classList).toContain('rhombus-sheet-panel--right');
    expect(pane()?.classList).toContain('rhombus-sheet-panel--open');
  }));

  it('applies the requested side', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { side: 'bottom', ariaLabel: 'X' });
    flush();
    expect(pane()?.classList).toContain('rhombus-sheet-panel--bottom');
  }));

  it('anchors a left sheet', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { side: 'left', ariaLabel: 'X' });
    flush();
    expect(pane()?.classList).toContain('rhombus-sheet-panel--left');
  }));

  it('merges a custom panelClass with the base classes', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X', panelClass: 'my-panel' });
    flush();
    expect(pane()?.classList).toContain('rhombus-sheet-panel');
    expect(pane()?.classList).toContain('my-panel');
  }));

  it('merges an array of custom panel classes', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X', panelClass: ['a', 'b'] });
    flush();
    expect(pane()?.classList).toContain('a');
    expect(pane()?.classList).toContain('b');
  }));

  it('resolves named sizes to the size CSS var', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X', size: 'lg' });
    flush();
    expect(pane()?.style.getPropertyValue('--rhombus-sheet-size').trim()).toBe(
      '40rem'
    );
  }));

  it('resolves the small named size', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X', size: 'sm' });
    flush();
    expect(pane()?.style.getPropertyValue('--rhombus-sheet-size').trim()).toBe(
      '20rem'
    );
  }));

  it('passes a raw CSS size through verbatim', fakeAsync(() => {
    const { service, pane } = setup();
    service.open(BareComponent, { ariaLabel: 'X', size: '50vw' });
    flush();
    expect(pane()?.style.getPropertyValue('--rhombus-sheet-size').trim()).toBe(
      '50vw'
    );
  }));

  it('renders a backdrop by default and omits it when hasBackdrop is false', fakeAsync(() => {
    const { service, overlay } = setup();
    service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    expect(overlay().querySelector('.cdk-overlay-backdrop')).not.toBeNull();
  }));

  it('omits the backdrop when hasBackdrop is false', fakeAsync(() => {
    const { service, overlay } = setup();
    service.open(BareComponent, { ariaLabel: 'X', hasBackdrop: false });
    flush();
    expect(overlay().querySelector('.cdk-overlay-backdrop')).toBeNull();
  }));

  it('names the dialog via config.ariaLabel (CDK owns role + aria-modal)', fakeAsync(() => {
    const { service, dialog } = setup();
    service.open(BareComponent, { ariaLabel: 'Filters' });
    flush();
    expect(dialog()?.getAttribute('role')).toBe('dialog');
    expect(dialog()?.getAttribute('aria-modal')).toBe('true');
    expect(dialog()?.getAttribute('aria-label')).toBe('Filters');
  }));

  it('wires aria-labelledby from the chrome and clears aria-label', fakeAsync(() => {
    const { service, dialog } = setup();
    const ref = service.open(BareComponent, { ariaLabel: 'temp' });
    flush();
    // Simulate <rhombus-sheet title>'s call.
    (ref as unknown as { _setLabelledBy(id: string): void })._setLabelledBy(
      'sheet-title-1'
    );
    expect(dialog()?.getAttribute('aria-labelledby')).toBe('sheet-title-1');
    expect(dialog()?.getAttribute('aria-label')).toBeNull();
  }));

  it('fails loud when opened with neither a title nor an ariaLabel', fakeAsync(() => {
    const { service } = setup();
    const ref = service.open(BareComponent) as unknown as {
      _activate(): void;
    };
    expect(() => ref._activate()).toThrow(/accessible name/i);
    flush(); // drain the deferred (now no-op) activation + focus timers
  }));

  it('injects config.data via RHOMBUS_SHEET_DATA', fakeAsync(() => {
    const { service } = setup();
    capturedData = undefined;
    service.open(DataProbeComponent, { ariaLabel: 'X', data: { id: 7 } });
    flush();
    expect(capturedData).toEqual({ id: 7 });
  }));

  it('close() removes --open, awaits transitionend, then closes with the result', fakeAsync(() => {
    const { service, pane, dialog } = setup();
    const ref = service.open<string>(BareComponent, { ariaLabel: 'X' });
    flush();
    let result: string | undefined = 'PENDING';
    ref.afterClosed().subscribe((r) => (result = r));

    const container = dialog() as HTMLElement;
    ref.close('done');
    // Slide-out started: --open gone, but the dialog is still mounted.
    expect(pane()?.classList).not.toContain('rhombus-sheet-panel--open');
    expect(dialog()).not.toBeNull();

    transitionEnd(container);
    flush();
    expect(dialog()).toBeNull();
    expect(result).toBe('done');
  }));

  it('closes via the fallback timeout when transitionend never fires', fakeAsync(() => {
    const { service, dialog } = setup();
    const ref = service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    ref.close();
    expect(dialog()).not.toBeNull();
    tick(400);
    flush();
    expect(dialog()).toBeNull();
  }));

  it('closes cleanly when close() races before activation (no slide-open)', fakeAsync(() => {
    const { service, dialog } = setup();
    const ref = service.open(BareComponent, { ariaLabel: 'X' });
    // Abort the open synchronously, before the deferred activation runs.
    ref.close();
    flush();
    // Activation was skipped (never slid in) and the dialog is gone.
    expect((ref as unknown as { activated: boolean }).activated).toBe(false);
    expect(dialog()).toBeNull();
  }));

  it('is idempotent: a second close() does not throw', fakeAsync(() => {
    const { service } = setup();
    const ref = service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    ref.close();
    expect(() => ref.close()).not.toThrow();
    tick(400);
    flush();
  }));

  it('closes (animated) on Escape', fakeAsync(() => {
    const { service, dialog } = setup();
    service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    const container = dialog() as HTMLElement;
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    tick(400);
    flush();
    expect(dialog()).toBeNull();
  }));

  it('does not close on Escape when disableClose is set', fakeAsync(() => {
    const { service, dialog } = setup();
    service.open(BareComponent, { ariaLabel: 'X', disableClose: true });
    flush();
    const container = dialog() as HTMLElement;
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    tick(400);
    flush();
    expect(dialog()).not.toBeNull();
  }));

  it('closes (animated) on backdrop click', fakeAsync(() => {
    const { service, overlay, dialog } = setup();
    service.open(BareComponent, { ariaLabel: 'X' });
    flush();
    const backdrop = overlay().querySelector(
      '.cdk-overlay-backdrop'
    ) as HTMLElement;
    backdrop.click();
    tick(400);
    flush();
    expect(dialog()).toBeNull();
  }));
});
