import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import { RhombusDialogComponent } from './rhombus-dialog.component';
import { RhombusDialogActionsDirective } from './rhombus-dialog-actions.directive';

@Component({
  standalone: true,
  imports: [RhombusDialogComponent, RhombusDialogActionsDirective],
  template: `
    <rhombus-dialog [title]="title">
      <p class="projected-body">{{ body }}</p>
      <div rhombusDialogActions>
        <button class="projected-action" type="button">OK</button>
      </div>
    </rhombus-dialog>
  `,
})
class HostComponent {
  title = 'Delete item?';
  body = 'This cannot be undone.';
}

function setup() {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host: fixture.componentInstance, el };
}

describe('rhombus-dialog (chrome)', () => {
  it('renders the title input in the title element', () => {
    const { el } = setup();
    const title = el.querySelector('.rhombus-dialog__title');
    expect(title?.textContent?.trim()).toBe('Delete item?');
  });

  it('reacts to title changes', () => {
    const { fixture, host, el } = setup();
    host.title = 'Archive item?';
    fixture.detectChanges();
    expect(el.querySelector('.rhombus-dialog__title')?.textContent?.trim()).toBe(
      'Archive item?'
    );
  });

  it('projects default content into the body', () => {
    const { el } = setup();
    const body = el.querySelector('.rhombus-dialog__content .projected-body');
    expect(body?.textContent?.trim()).toBe('This cannot be undone.');
  });

  it('projects [rhombusDialogActions] content into the actions footer', () => {
    const { el } = setup();
    const action = el.querySelector('.rhombus-dialog__actions .projected-action');
    expect(action).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });
});
