import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatProgressBarHarness } from '@angular/material/progress-bar/testing';
import type { ProgressBarMode } from '@angular/material/progress-bar';
import { axe } from '../../testing/axe';
import { RhombusProgressBarComponent } from './rhombus-progress-bar.component';

@Component({
  standalone: true,
  imports: [RhombusProgressBarComponent],
  template: `<rhombus-progress-bar [mode]="mode" [value]="value" />`,
})
class HostComponent {
  mode: ProgressBarMode = 'determinate';
  value = 40;
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

describe('rhombus-progress-bar', () => {
  it('reflects a determinate value', async () => {
    const { loader } = setup();
    const bar = await loader.getHarness(MatProgressBarHarness);
    expect(await bar.getValue()).toBe(40);
  });

  it('supports indeterminate mode', async () => {
    const { fixture, host, loader } = setup();
    host.mode = 'indeterminate';
    fixture.detectChanges();
    const bar = await loader.getHarness(MatProgressBarHarness);
    expect(await bar.getMode()).toBe('indeterminate');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
