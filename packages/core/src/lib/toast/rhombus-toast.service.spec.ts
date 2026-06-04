import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  MatSnackBar,
  MatSnackBarRef,
  type TextOnlySnackBar,
} from '@angular/material/snack-bar';
import { EMPTY } from 'rxjs';
import { axe } from '../../testing/axe';
import { RhombusToastService } from './rhombus-toast.service';

@Component({ standalone: true, template: '' })
class HostComponent {}

function stubRef(): MatSnackBarRef<TextOnlySnackBar> {
  return {
    dismiss: jest.fn(),
    afterDismissed: jest.fn(() => EMPTY),
    onAction: jest.fn(() => EMPTY),
  } as unknown as MatSnackBarRef<TextOnlySnackBar>;
}

describe('RhombusToastService', () => {
  let service: RhombusToastService;
  let snackBar: MatSnackBar;
  let liveAnnouncer: LiveAnnouncer;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    service = TestBed.inject(RhombusToastService);
    snackBar = TestBed.inject(MatSnackBar);
    liveAnnouncer = TestBed.inject(LiveAnnouncer);
  });

  afterEach(() => {
    snackBar.dismiss();
    jest.restoreAllMocks();
  });

  it('opens a snackbar tagged with the base + variant panelClass', () => {
    const open = jest
      .spyOn(snackBar, 'open')
      .mockReturnValue(stubRef());
    service.success('Saved');
    expect(open).toHaveBeenCalledTimes(1);
    const [message, , config] = open.mock.calls[0];
    expect(message).toBe('Saved');
    expect(config?.panelClass).toEqual(
      expect.arrayContaining(['rhombus-toast', 'rhombus-toast--success'])
    );
  });

  it('suppresses the built-in live region and announces once via LiveAnnouncer', () => {
    const open = jest
      .spyOn(snackBar, 'open')
      .mockReturnValue(stubRef());
    const announce = jest.spyOn(liveAnnouncer, 'announce');
    service.info('Heads up');
    expect(open.mock.calls[0][2]?.politeness).toBe('off');
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Heads up', 'polite');
  });

  it('announces errors and warnings assertively, info and success politely', () => {
    jest.spyOn(snackBar, 'open').mockReturnValue(stubRef());
    const announce = jest.spyOn(liveAnnouncer, 'announce');
    service.error('Boom');
    service.warning('Careful');
    service.success('Done');
    expect(announce).toHaveBeenNthCalledWith(1, 'Boom', 'assertive');
    expect(announce).toHaveBeenNthCalledWith(2, 'Careful', 'assertive');
    expect(announce).toHaveBeenNthCalledWith(3, 'Done', 'polite');
  });

  it('defaults the variant to info and the duration to 5000ms', () => {
    const open = jest
      .spyOn(snackBar, 'open')
      .mockReturnValue(stubRef());
    service.show({ message: 'Plain' });
    const config = open.mock.calls[0][2];
    expect(config?.panelClass).toEqual(
      expect.arrayContaining(['rhombus-toast--info'])
    );
    expect(config?.duration).toBe(5000);
  });

  it('forwards the action label and honours an explicit politeness override', () => {
    const open = jest
      .spyOn(snackBar, 'open')
      .mockReturnValue(stubRef());
    const announce = jest.spyOn(liveAnnouncer, 'announce');
    service.show({ message: 'Undo me', action: 'Undo', politeness: 'assertive' });
    expect(open.mock.calls[0][1]).toBe('Undo');
    expect(announce).toHaveBeenCalledWith('Undo me', 'assertive');
  });

  it('returns a ref whose dismiss() dismisses the underlying snackbar', () => {
    const ref = stubRef();
    jest.spyOn(snackBar, 'open').mockReturnValue(ref);
    service.success('Saved').dismiss();
    expect(ref.dismiss).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // duration: 0 keeps the toast sticky so the zone can stabilise (no pending timer).
    service.show({ message: 'Accessible toast', duration: 0 });
    await fixture.whenStable();
    const container = TestBed.inject(OverlayContainer).getContainerElement();
    expect(container.textContent).toContain('Accessible toast');
    expect(await axe(container)).toHaveNoViolations();
  });
});
