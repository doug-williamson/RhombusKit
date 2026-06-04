import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RhombusConfirmService } from './rhombus-confirm.service';
import { RhombusConfirmDialogComponent } from './rhombus-confirm-dialog.component';
import { RhombusDialogService } from '../dialog/rhombus-dialog.service';

describe('RhombusConfirmService', () => {
  let service: RhombusConfirmService;
  let openSpy: jest.Mock;

  function configureWithResult(result: unknown): void {
    const dialogRef = { afterClosed: jest.fn(() => of(result)), close: jest.fn() };
    openSpy = jest.fn(() => dialogRef);
    TestBed.configureTestingModule({
      providers: [{ provide: RhombusDialogService, useValue: { open: openSpy } }],
    });
    service = TestBed.inject(RhombusConfirmService);
  }

  it('opens the confirm dialog through RhombusDialogService at a 400px width', () => {
    configureWithResult(true);
    service.confirm({ title: 'Delete?', message: 'Gone forever.' }).subscribe();
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [component, config] = openSpy.mock.calls[0];
    expect(component).toBe(RhombusConfirmDialogComponent);
    expect(config).toMatchObject({ width: '400px' });
    expect(config.data).toEqual({ title: 'Delete?', message: 'Gone forever.' });
  });

  it('emits true when the dialog closes with true', () => {
    configureWithResult(true);
    let result: boolean | undefined;
    service.confirm({ title: 't', message: 'm' }).subscribe((r) => (result = r));
    expect(result).toBe(true);
  });

  it('maps a dismissed dialog (undefined) to false', () => {
    configureWithResult(undefined);
    let result: boolean | undefined;
    service.confirm({ title: 't', message: 'm' }).subscribe((r) => (result = r));
    expect(result).toBe(false);
  });

  it('maps a false close result to false', () => {
    configureWithResult(false);
    let result: boolean | undefined;
    service.confirm({ title: 't', message: 'm' }).subscribe((r) => (result = r));
    expect(result).toBe(false);
  });
});
