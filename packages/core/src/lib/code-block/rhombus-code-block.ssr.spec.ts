import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RhombusCodeBlockComponent } from './rhombus-code-block.component';

/**
 * Server platform: the block must render the plain code (so SSR output isn't an
 * empty `<code>`), and must NOT attempt the browser-only highlight enhancement.
 * highlight.js adds the `hljs` class when it runs; its absence here confirms the
 * enhancement was skipped.
 */
describe('rhombus-code-block (server platform)', () => {
  let fixture: ComponentFixture<RhombusCodeBlockComponent>;

  const CODE = 'const answer = 42;';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), { provide: PLATFORM_ID, useValue: 'server' }],
    });
    fixture = TestBed.createComponent(RhombusCodeBlockComponent);
    fixture.componentRef.setInput('code', CODE);
    fixture.componentRef.setInput('language', 'typescript');
    fixture.detectChanges();
  });

  it('renders the plain code text', () => {
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(code.textContent).toBe(CODE);
  });

  it('does not run syntax highlighting on the server', () => {
    const code = fixture.nativeElement.querySelector('code') as HTMLElement;
    expect(code.classList.contains('hljs')).toBe(false);
  });
});
