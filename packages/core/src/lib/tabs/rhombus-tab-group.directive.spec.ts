import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { axe } from '../../testing/axe';
import { RhombusTabGroupDirective } from './rhombus-tab-group.directive';

@Component({
  standalone: true,
  imports: [MatTabsModule, RhombusTabGroupDirective],
  template: `
    <mat-tab-group rhombusTabGroup (tabChange)="lastIndex = $event">
      <mat-tab label="Overview"><p>Overview content</p></mat-tab>
      <mat-tab label="Details"><p>Details content</p></mat-tab>
      <mat-tab label="History"><p>History content</p></mat-tab>
    </mat-tab-group>
  `,
})
class HostComponent {
  lastIndex = -1;
}

describe('rhombus-tab-group directive', () => {
  let fixture: ComponentFixture<HostComponent>;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(HostComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('adds the rhombus-tab-group host class', () => {
    const group = (fixture.nativeElement as HTMLElement).querySelector(
      'mat-tab-group'
    );
    expect(group?.classList.contains('rhombus-tab-group')).toBe(true);
  });

  it('renders one tab per <mat-tab>', async () => {
    const group = await loader.getHarness(MatTabGroupHarness);
    expect((await group.getTabs()).length).toBe(3);
  });

  it('emits tabChange with the newly selected index', async () => {
    const group = await loader.getHarness(MatTabGroupHarness);
    await group.selectTab({ label: 'Details' });
    expect(fixture.componentInstance.lastIndex).toBe(1);
  });

  it('has no accessibility violations', async () => {
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
