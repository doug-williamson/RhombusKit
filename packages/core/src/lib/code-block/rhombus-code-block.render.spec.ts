import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusCodeBlockComponent } from './rhombus-code-block.component';

// highlight.js is an optional peer; stub its core to a no-op so this spec is
// deterministic whether or not the peer resolves, and never depends on hljs
// internals. The block must render correct structure regardless of highlighting.
jest.mock('highlight.js/lib/core', () => ({
  __esModule: true,
  default: { registerLanguage: () => undefined, highlightElement: () => undefined },
}));

/**
 * Structure + language reflection — asserted independently of any syntax
 * highlighting, which is layered on lazily in the browser only.
 */
describe('rhombus-code-block', () => {
  let fixture: ComponentFixture<RhombusCodeBlockComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    fixture = TestBed.createComponent(RhombusCodeBlockComponent);
    fixture.componentRef.setInput('code', 'echo hi');
    fixture.componentRef.setInput('language', 'bash');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the toolbar, language label, copy button and pre/code structure', () => {
    expect(el.querySelector('.rhombus-code-block__toolbar')).toBeTruthy();
    expect(el.querySelector('.rhombus-code-block__copy-btn')).toBeTruthy();
    expect(el.querySelector('pre.rhombus-code-block__pre > code')).toBeTruthy();
  });

  it('reflects the language in the label and the code element class', () => {
    const lang = el.querySelector('.rhombus-code-block__lang');
    expect(lang?.textContent?.trim()).toBe('bash');

    const code = el.querySelector('code') as HTMLElement;
    expect(code.classList.contains('language-bash')).toBe(true);
  });

  it('renders the code text', () => {
    const code = el.querySelector('code') as HTMLElement;
    expect(code.textContent).toBe('echo hi');
  });
});
