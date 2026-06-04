import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { axe } from '../../testing/axe';
import {
  CardPadding,
  CardVariant,
  RhombusCardComponent,
} from './rhombus-card.component';

@Component({
  standalone: true,
  imports: [RhombusCardComponent],
  template: `
    <rhombus-card [variant]="variant" [padding]="padding" [hasHeader]="hasHeader">
      <span slot="title">Card title</span>
      <span slot="subtitle">Card subtitle</span>
      <p>Body copy.</p>
      <button slot="actions" type="button">Confirm</button>
    </rhombus-card>
  `,
})
class HostComponent {
  variant: CardVariant = 'elevated';
  padding: CardPadding = 'md';
  hasHeader = true;
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
  };
}

function card(el: HTMLElement): HTMLElement {
  return el.querySelector('mat-card') as HTMLElement;
}

describe('rhombus-card', () => {
  it('renders a mat-card with the default host classes', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const cls = card(el).classList;
    expect(cls).toContain('rhombus-card');
    expect(cls).toContain('rhombus-card--elevated');
    expect(cls).toContain('rhombus-card--padding-md');
  });

  it('reflects variant and padding into the host classes', () => {
    const { fixture, host, el } = setup();
    host.variant = 'filled';
    host.padding = 'lg';
    fixture.detectChanges();
    const cls = card(el).classList;
    expect(cls).toContain('rhombus-card--filled');
    expect(cls).toContain('rhombus-card--padding-lg');
    expect(cls).not.toContain('rhombus-card--elevated');
    expect(cls).not.toContain('rhombus-card--padding-md');
  });

  it('maps the outlined variant onto Material\'s outlined appearance', () => {
    const { fixture, host, el } = setup();
    expect(card(el).classList).not.toContain('mat-mdc-card-outlined');
    host.variant = 'outlined';
    fixture.detectChanges();
    expect(card(el).classList).toContain('mat-mdc-card-outlined');
  });

  it('projects the title and subtitle into the header', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-card-title')?.textContent?.trim()).toBe(
      'Card title'
    );
    expect(el.querySelector('mat-card-subtitle')?.textContent?.trim()).toBe(
      'Card subtitle'
    );
  });

  it('projects default content into the card body', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-card-content')?.textContent?.trim()).toBe(
      'Body copy.'
    );
  });

  it('projects actions into the footer', () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    const actions = el.querySelector('mat-card-actions');
    expect(actions?.querySelector('button')?.textContent?.trim()).toBe(
      'Confirm'
    );
  });

  it('drops the header region when hasHeader is false', () => {
    const { fixture, host, el } = setup();
    fixture.detectChanges();
    expect(el.querySelector('mat-card-header')).toBeTruthy();
    host.hasHeader = false;
    fixture.detectChanges();
    expect(el.querySelector('mat-card-header')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });
});
