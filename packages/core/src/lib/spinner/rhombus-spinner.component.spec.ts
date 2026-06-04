import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import type { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { axe } from '../../testing/axe';
import { RhombusSpinnerComponent } from './rhombus-spinner.component';

@Component({
  standalone: true,
  imports: [RhombusSpinnerComponent],
  template: `<rhombus-spinner [mode]="mode" [value]="value" />`,
})
class HostComponent {
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 0;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  loader: HarnessLoader;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  const loader = TestbedHarnessEnvironment.loader(fixture);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    loader,
    el: fixture.nativeElement as HTMLElement,
  };
}

describe('rhombus-spinner', () => {
  it('is indeterminate by default', async () => {
    const { loader } = setup();
    const spinner = await loader.getHarness(MatProgressSpinnerHarness);
    expect(await spinner.getMode()).toBe('indeterminate');
  });

  it('reflects a determinate value', async () => {
    const { fixture, host, loader } = setup();
    host.mode = 'determinate';
    host.value = 60;
    fixture.detectChanges();
    const spinner = await loader.getHarness(MatProgressSpinnerHarness);
    expect(await spinner.getValue()).toBe(60);
  });

  it('has no accessibility violations', async () => {
    const { fixture, host, el } = setup();
    host.mode = 'determinate';
    host.value = 60;
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
