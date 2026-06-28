import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatChipRow } from '@angular/material/chips';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { axe } from '../../testing/axe';
import { ChipVariant } from '../chip/rhombus-chip.directive';
import { RhombusTagInputComponent } from './rhombus-tag-input.component';

@Component({
  standalone: true,
  imports: [RhombusTagInputComponent],
  template: `
    <rhombus-tag-input
      [label]="label"
      [tags]="tags"
      (tagsChange)="tags = $event"
      [variant]="variant"
      [disabled]="disabled"
      [maxTags]="maxTags"
      [control]="control"
    />
  `,
})
class HostComponent {
  label = 'Tags';
  tags: string[] = [];
  variant: ChipVariant = 'default';
  disabled = false;
  maxTags: number | null = null;
  control: FormControl<string[]> | null = null;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function tagInput(
  fixture: ComponentFixture<HostComponent>
): RhombusTagInputComponent {
  return fixture.debugElement.query(By.directive(RhombusTagInputComponent))
    .componentInstance;
}

/** Simulate the matChipInput commit (Enter / separator) with the given text. */
function add(fixture: ComponentFixture<HostComponent>, value: string): void {
  // addTag is the (matChipInputTokenEnd) handler; drive it with a minimal event.
  (tagInput(fixture) as unknown as { addTag(e: unknown): void }).addTag({
    value,
    chipInput: { clear: () => undefined },
  });
  fixture.detectChanges();
}

function removeAt(
  fixture: ComponentFixture<HostComponent>,
  index: number
): void {
  (tagInput(fixture) as unknown as { removeTag(i: number): void }).removeTag(
    index
  );
  fixture.detectChanges();
}

function chips(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>('mat-chip-row'));
}

/** The visible tag labels (excludes the remove control's icon text). */
function chipLabels(el: HTMLElement): string[] {
  return chips(el).map((c) =>
    c.querySelector('.rhombus-tag-input__label')?.textContent?.trim() ?? ''
  );
}

describe('rhombus-tag-input', () => {
  it('renders a form field + chip grid with the label', () => {
    const { el } = setup();
    expect(el.querySelector('mat-form-field')).toBeTruthy();
    expect(el.querySelector('mat-chip-grid')).toBeTruthy();
    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Tags');
  });

  it('renders one chip per lightweight tag', () => {
    const { fixture, host, el } = setup();
    host.tags = ['angular', 'signals'];
    fixture.detectChanges();
    expect(chips(el).length).toBe(2);
    expect(chipLabels(el)).toEqual(['angular', 'signals']);
  });

  it('adds a typed tag (trimmed) and emits tagsChange', () => {
    const { fixture, host, el } = setup();
    add(fixture, '  angular  ');
    expect(host.tags).toEqual(['angular']);
    expect(chips(el).length).toBe(1);
  });

  it('ignores empty / whitespace-only input', () => {
    const { fixture, host } = setup();
    add(fixture, '   ');
    expect(host.tags).toEqual([]);
  });

  it('de-duplicates: adding an existing tag is a no-op', () => {
    const { fixture, host } = setup();
    host.tags = ['x'];
    fixture.detectChanges();
    add(fixture, 'x');
    expect(host.tags).toEqual(['x']);
  });

  it('respects maxTags', () => {
    const { fixture, host } = setup();
    host.maxTags = 2;
    host.tags = ['a', 'b'];
    fixture.detectChanges();
    add(fixture, 'c');
    expect(host.tags).toEqual(['a', 'b']);
  });

  it('removes a tag and emits tagsChange', () => {
    const { fixture, host, el } = setup();
    host.tags = ['a', 'b', 'c'];
    fixture.detectChanges();
    removeAt(fixture, 1);
    expect(host.tags).toEqual(['a', 'c']);
    expect(chipLabels(el)).toEqual(['a', 'c']);
  });

  it('binds each chip its clean tag value (so a chip-grid blur write-back cannot corrupt the model)', () => {
    // MatChipGrid._propagateChanges maps chip.value back through the bound
    // control on blur; without [value], chip.value falls back to textContent
    // (which includes the remove icon's "cancel" ligature). Assert the value is
    // the clean tag so that round-trip is loss-free.
    const { fixture, host } = setup();
    host.tags = ['angular', 'signals'];
    fixture.detectChanges();
    const values = fixture.debugElement
      .queryAll(By.directive(MatChipRow))
      .map((d) => (d.componentInstance as MatChipRow).value);
    expect(values).toEqual(['angular', 'signals']);
  });

  it('reflects the variant to each chip via the rhombusChip bridge', () => {
    const { fixture, host, el } = setup();
    host.tags = ['a'];
    host.variant = 'primary';
    fixture.detectChanges();
    expect(el.querySelector('mat-chip-row')?.getAttribute('data-variant')).toBe(
      'primary'
    );
  });

  it('hides the remove control and refuses additions when disabled', () => {
    const { fixture, host, el } = setup();
    host.tags = ['a'];
    host.disabled = true;
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-tag-input__remove')).toBeNull();
    add(fixture, 'b');
    expect(host.tags).toEqual(['a']);
  });

  describe('reactive forms (control)', () => {
    it('renders chips from the control value and writes additions back', () => {
      const { fixture, host, el } = setup();
      host.control = new FormControl<string[]>(['x', 'y'], {
        nonNullable: true,
      });
      fixture.detectChanges();
      expect(chips(el).length).toBe(2);

      add(fixture, 'z');
      expect(host.control.value).toEqual(['x', 'y', 'z']);
      expect(host.control.dirty).toBe(true);
      expect(chips(el).length).toBe(3);
      // The lightweight output stays silent in reactive mode.
      expect(host.tags).toEqual([]);
    });

    it('removes from the control value', () => {
      const { fixture, host } = setup();
      host.control = new FormControl<string[]>(['x', 'y'], {
        nonNullable: true,
      });
      fixture.detectChanges();
      removeAt(fixture, 0);
      expect(host.control.value).toEqual(['y']);
    });

    it('mirrors an external control value change into the chips', () => {
      const { fixture, host, el } = setup();
      host.control = new FormControl<string[]>(['x'], { nonNullable: true });
      fixture.detectChanges();
      host.control.setValue(['x', 'y', 'z']);
      fixture.detectChanges();
      expect(chips(el).length).toBe(3);
    });
  });

  it('has no accessibility violations', async () => {
    const { fixture, host, el } = setup();
    host.tags = ['angular', 'signals'];
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
