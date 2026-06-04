import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { RhombusDialogService } from './rhombus-dialog.service';

@Component({ standalone: true, template: '' })
class DummyDialogComponent {}

describe('RhombusDialogService', () => {
  let service: RhombusDialogService;
  let matRef: { afterClosed: jest.Mock; close: jest.Mock };
  let matDialog: { open: jest.Mock };

  beforeEach(() => {
    matRef = { afterClosed: jest.fn(() => of('result')), close: jest.fn() };
    matDialog = { open: jest.fn(() => matRef) };
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: matDialog }],
    });
    service = TestBed.inject(RhombusDialogService);
  });

  it('opens the given component with RhombusKit defaults', () => {
    service.open(DummyDialogComponent);
    expect(matDialog.open).toHaveBeenCalledTimes(1);
    const [component, config] = matDialog.open.mock.calls[0];
    expect(component).toBe(DummyDialogComponent);
    expect(config).toMatchObject({
      width: '480px',
      maxWidth: '90vw',
      autoFocus: 'dialog',
      restoreFocus: true,
    });
    expect(config.panelClass).toEqual(
      expect.arrayContaining(['rhombus-dialog-panel'])
    );
  });

  it('forwards data and merges a custom panelClass with the base panel class', () => {
    service.open(DummyDialogComponent, {
      data: { id: 7 },
      panelClass: 'custom-panel',
      width: '600px',
    });
    const [, config] = matDialog.open.mock.calls[0];
    expect(config.data).toEqual({ id: 7 });
    expect(config.width).toBe('600px');
    expect(config.panelClass).toEqual(
      expect.arrayContaining(['rhombus-dialog-panel', 'custom-panel'])
    );
  });

  it('returns a ref that proxies afterClosed() and close()', () => {
    const ref = service.open<string>(DummyDialogComponent);
    let emitted: string | undefined;
    ref.afterClosed().subscribe((value) => (emitted = value));
    expect(emitted).toBe('result');
    ref.close('done');
    expect(matRef.close).toHaveBeenCalledWith('done');
  });
});
