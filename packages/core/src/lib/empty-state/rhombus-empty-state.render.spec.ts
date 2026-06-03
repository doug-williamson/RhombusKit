import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusEmptyStateComponent } from './rhombus-empty-state.component';

describe('rhombus-empty-state', () => {
  let fixture: ComponentFixture<RhombusEmptyStateComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(RhombusEmptyStateComponent);
    fixture.componentRef.setInput('heading', 'No drafts');
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the required heading', () => {
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-empty-state__heading')?.textContent?.trim()).toBe('No drafts');
  });

  it('defaults the icon to a ligature "inbox" (no svgIcon)', () => {
    fixture.detectChanges();
    const icon = el.querySelector('mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('inbox');
    // A ligature renders text, not an <svg>; confirm we didn't go down the svgIcon path.
    expect(icon.querySelector('svg')).toBeNull();
  });

  it('reflects a custom ligature icon name', () => {
    fixture.componentRef.setInput('icon', 'edit_note');
    fixture.detectChanges();
    expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('edit_note');
  });

  it('toggles the body with the body input', () => {
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-empty-state__body')).toBeNull();

    fixture.componentRef.setInput('body', 'Posts you are working on appear here.');
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-empty-state__body')?.textContent?.trim()).toBe(
      'Posts you are working on appear here.',
    );
  });

  it('gates the CTA on ctaLabel', () => {
    fixture.detectChanges();
    expect(el.querySelector('rhombus-button')).toBeNull();

    fixture.componentRef.setInput('ctaLabel', 'New post');
    fixture.detectChanges();
    const cta = el.querySelector('rhombus-button');
    expect(cta).toBeTruthy();
    expect(cta?.textContent?.trim()).toBe('New post');
  });

  it('emits ctaClick when the CTA is clicked', () => {
    let emitted = 0;
    fixture.componentInstance.ctaClick.subscribe(() => (emitted += 1));
    fixture.componentRef.setInput('ctaLabel', 'New post');
    fixture.detectChanges();

    (el.querySelector('rhombus-button button') as HTMLButtonElement).click();
    expect(emitted).toBe(1);
  });
});
