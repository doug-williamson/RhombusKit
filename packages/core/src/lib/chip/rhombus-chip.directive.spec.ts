import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatChipsModule } from '@angular/material/chips';
import { axe } from '../../testing/axe';
import { ChipVariant, RhombusChipDirective } from './rhombus-chip.directive';

@Component({
  standalone: true,
  imports: [MatChipsModule, RhombusChipDirective],
  template: `
    <mat-chip-listbox aria-label="Tags">
      <mat-chip-option rhombusChip [variant]="variant" value="alpha">
        Alpha
      </mat-chip-option>
    </mat-chip-listbox>
  `,
})
class HostComponent {
  variant: ChipVariant = 'default';
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  chipEl: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const de = fixture.debugElement.query(By.directive(RhombusChipDirective));
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    chipEl: de.nativeElement as HTMLElement,
  };
}

describe('rhombusChip', () => {
  it('adds the stable host class and default data-variant', () => {
    const { chipEl } = setup();
    expect(chipEl.classList).toContain('rhombus-chip');
    expect(chipEl.getAttribute('data-variant')).toBe('default');
  });

  it('reflects the variant to the data-variant host attribute', () => {
    const { fixture, host, chipEl } = setup();
    host.variant = 'success';
    fixture.detectChanges();
    expect(chipEl.getAttribute('data-variant')).toBe('success');
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
