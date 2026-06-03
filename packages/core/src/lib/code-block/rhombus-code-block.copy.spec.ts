import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusCodeBlockComponent } from './rhombus-code-block.component';

// Stub the optional highlight.js core to a no-op so the browser-only highlight
// path runs cleanly and this spec stays focused on copy behaviour.
jest.mock('highlight.js/lib/core', () => ({
  __esModule: true,
  default: { registerLanguage: () => undefined, highlightElement: () => undefined },
}));

/**
 * Copy behaviour (browser platform — TestBed's default). The clipboard is mocked
 * so we can assert the visible state: the copy button's icon flips to `check`
 * once the write resolves, then reverts to `content_copy` after the 2s timeout.
 */
describe('rhombus-code-block copy', () => {
  let fixture: ComponentFixture<RhombusCodeBlockComponent>;
  let el: HTMLElement;
  let writeText: jest.Mock;

  const tick = () => Promise.resolve();
  const iconText = () => el.querySelector('mat-icon')?.textContent?.trim();

  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(RhombusCodeBlockComponent);
    fixture.componentRef.setInput('code', 'copy me');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('writes the code, flips to "check", then resets after 2s', async () => {
    jest.useFakeTimers();
    expect(iconText()).toBe('content_copy');

    (el.querySelector('.rhombus-code-block__copy-btn') as HTMLButtonElement).click();
    // flush the clipboard promise + its .then before asserting the flip
    await tick();
    await tick();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(iconText()).toBe('check');

    jest.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(iconText()).toBe('content_copy');
  });
});
