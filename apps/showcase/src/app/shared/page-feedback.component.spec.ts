import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RhombusToastService } from '@rhombuskit/core';
import { PageFeedbackComponent } from './page-feedback.component';

describe('PageFeedbackComponent', () => {
  const toast = { success: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFeedbackComponent],
      providers: [provideRouter([]), { provide: RhombusToastService, useValue: toast }],
    }).compileComponents();
    toast.success.mockClear();
  });

  function render(component = 'Button') {
    const fixture = TestBed.createComponent(PageFeedbackComponent);
    fixture.componentRef.setInput('component', component);
    fixture.detectChanges();
    return fixture;
  }

  function links(el: HTMLElement): HTMLAnchorElement[] {
    return Array.from(el.querySelectorAll('.page-feedback__links a'));
  }

  it('deep-links "Suggest a change" to the prefilled feature-request form', () => {
    const el = render().nativeElement as HTMLElement;
    const suggest = links(el).find((a) => a.textContent?.includes('Suggest'));
    expect(suggest?.href).toContain('template=2-feature-request.yml');
    expect(suggest?.href).toContain('component=Button');
  });

  it('deep-links the accessibility report to the a11y form', () => {
    const el = render().nativeElement as HTMLElement;
    const a11y = links(el).find((a) => a.textContent?.includes('accessibility'));
    expect(a11y?.href).toContain('template=4-accessibility.yml');
  });

  it('records a helpful vote, thanks the user, and hides the prompt', () => {
    const fixture = render();
    const el = fixture.nativeElement as HTMLElement;
    const yes = Array.from(el.querySelectorAll('rhombus-button')).find((b) =>
      b.getAttribute('aria-label')?.startsWith('Yes'),
    ) as HTMLElement;

    yes.click();
    fixture.detectChanges();

    expect(toast.success).toHaveBeenCalledWith('Thanks for the feedback!');
    expect(el.querySelector('.page-feedback__thanks')?.textContent).toContain('Thanks');
    expect(el.querySelector('.page-feedback__prompt')).toBeNull();
  });
});
