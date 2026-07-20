import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { axe } from '../../testing/axe';
import { RhombusReorderListComponent } from './rhombus-reorder-list.component';
import { RhombusReorderItemDirective } from './rhombus-reorder-item.directive';
import { RhombusReorderEmptyDirective } from './rhombus-reorder-empty.directive';
import { ReorderEvent } from './reorder-list.types';

@Component({
  standalone: true,
  imports: [
    RhombusReorderListComponent,
    RhombusReorderItemDirective,
    RhombusReorderEmptyDirective,
  ],
  template: `
    <rhombus-reorder-list
      [(items)]="items"
      [disabled]="disabled()"
      [showButtons]="showButtons()"
      [showHandle]="showHandle()"
      [itemLabel]="label"
      [announce]="announceFn"
      (reordered)="events.push($event)"
    >
      <ng-template rhombusReorderItem let-item let-i="index">
        <span class="row-text">{{ i + 1 }}: {{ item }}</span>
      </ng-template>
      <ng-template rhombusReorderEmpty>
        <span class="empty-text">Nothing to reorder.</span>
      </ng-template>
    </rhombus-reorder-list>
  `,
})
class HostComponent {
  items = ['Alpha', 'Bravo', 'Charlie'];
  disabled = signal(false);
  showButtons = signal(true);
  showHandle = signal(true);
  events: ReorderEvent<string>[] = [];
  label = (item: string) => item;
  announceFn: ((ctx: { label: string; phase: string }) => string) | null = null;
}

function key(k: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
}

function setup(): {
  fixture: ComponentFixture<HostComponent>;
  host: HostComponent;
  el: HTMLElement;
  announcer: LiveAnnouncer;
} {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const fixture = TestBed.createComponent(HostComponent);
  document.body.appendChild(fixture.nativeElement);
  fixture.detectChanges();
  return {
    fixture,
    host: fixture.componentInstance,
    el: fixture.nativeElement as HTMLElement,
    announcer: TestBed.inject(LiveAnnouncer),
  };
}

afterEach(() => {
  document.body
    .querySelectorAll('[ng-version]')
    .forEach((n) => n.parentElement?.removeChild(n));
});

function rows(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll('[role="list"] > li'));
}
function handles(el: HTMLElement): HTMLButtonElement[] {
  return Array.from(el.querySelectorAll('.rhombus-reorder-list__handle'));
}
function rowText(el: HTMLElement): string[] {
  return rows(el).map((r) => r.querySelector('.row-text')?.textContent?.trim() ?? '');
}

describe('rhombus-reorder-list', () => {
  it('renders a role=list with one row per item from the required template', () => {
    const { el } = setup();
    expect(el.querySelectorAll('[role="list"]').length).toBe(1);
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
  });

  it('associates visually-hidden instructions via aria-describedby', () => {
    const { el } = setup();
    const list = el.querySelector('[role="list"]')!;
    const describedby = list.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();
    const instructions = el.querySelector('#' + describedby);
    expect(instructions?.textContent?.toLowerCase()).toContain('space');
  });

  it('describes each drag handle with the grab-mode instructions so AT announces them', () => {
    const { el } = setup();
    const list = el.querySelector('[role="list"]')!;
    const instructionsId = list.getAttribute('aria-describedby')!;
    // aria-describedby on the non-focusable <ul> is never announced; the
    // focusable grab entry point (the handle) must carry it so a screen-reader
    // user hears how to enter grab mode on Tab.
    handles(el).forEach((h) =>
      expect(h.getAttribute('aria-describedby')).toBe(instructionsId)
    );
  });

  it('gives each row a drag handle labelled for assistive tech', () => {
    const { el } = setup();
    const hs = handles(el);
    expect(hs.length).toBe(3);
    expect(hs[0].getAttribute('aria-label')).toContain('Alpha');
  });

  it('disables the first row up-button and the last row down-button', () => {
    const { el } = setup();
    const upFirst = rows(el)[0].querySelector<HTMLButtonElement>('[data-dir="up"]')!;
    const downLast = rows(el)[2].querySelector<HTMLButtonElement>('[data-dir="down"]')!;
    expect(upFirst.disabled).toBe(true);
    expect(downLast.disabled).toBe(true);
  });

  it('move-down button reorders, emits reordered once, and announces', () => {
    const { fixture, host, el, announcer } = setup();
    const announce = jest.spyOn(announcer, 'announce');
    const down = rows(el)[0].querySelector<HTMLButtonElement>('[data-dir="down"]')!;
    down.click();
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Bravo', '2: Alpha', '3: Charlie']);
    expect(host.events.length).toBe(1);
    expect(host.events[0]).toMatchObject({
      item: 'Alpha',
      previousIndex: 0,
      currentIndex: 1,
    });
    expect(announce).toHaveBeenCalledWith(expect.stringContaining('Alpha'), 'assertive');
  });

  it('keyboard grab-and-drop: Space grabs, ArrowDown moves, Space drops (one emit)', () => {
    const { fixture, host, el, announcer } = setup();
    const announce = jest.spyOn(announcer, 'announce');
    const handle = handles(el)[0];
    handle.focus();

    handle.dispatchEvent(key(' ')); // grab Alpha
    fixture.detectChanges();
    expect(announce).toHaveBeenLastCalledWith(
      expect.stringContaining('grabbed'),
      'assertive'
    );

    handle.dispatchEvent(key('ArrowDown')); // move down (intermediate — no emit)
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Bravo', '2: Alpha', '3: Charlie']);
    expect(host.events.length).toBe(0);

    handle.dispatchEvent(key(' ')); // drop
    fixture.detectChanges();
    expect(host.events.length).toBe(1);
    expect(host.events[0]).toMatchObject({ item: 'Alpha', previousIndex: 0, currentIndex: 1 });
  });

  it('Escape cancels a grab: order is restored and nothing is emitted', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key('Enter')); // grab
    fixture.detectChanges();
    handle.dispatchEvent(key('ArrowDown'));
    handle.dispatchEvent(key('ArrowDown'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Bravo', '2: Charlie', '3: Alpha']);

    handle.dispatchEvent(key('Escape'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
    expect(host.events.length).toBe(0);
  });

  it('Home/End jump the grabbed item to the first/last position', () => {
    const { fixture, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab Alpha at 0
    handle.dispatchEvent(key('End'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Bravo', '2: Charlie', '3: Alpha']);
    handle.dispatchEvent(key('Home'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
  });

  it('does not emit reordered when a grab is dropped in its original spot', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab
    handle.dispatchEvent(key(' ')); // drop immediately
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
  });

  it('commits an in-progress grab when focus leaves the list (grab-on-focusout)', () => {
    const { fixture, host, el } = setup();
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab
    handle.dispatchEvent(key('ArrowDown'));
    fixture.detectChanges();
    handle.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: outside })
    );
    fixture.detectChanges();
    expect(host.events.length).toBe(1);
    expect(host.events[0]).toMatchObject({ item: 'Alpha', currentIndex: 1 });
    outside.remove();
  });

  it('honours a custom itemLabel in the handle label', () => {
    const { fixture, host, el } = setup();
    host.label = (item: string) => `the ${item} track`;
    fixture.detectChanges();
    expect(handles(el)[0].getAttribute('aria-label')).toContain('the Alpha track');
  });

  it('shows the empty template when there are no items', () => {
    const { fixture, host, el } = setup();
    host.items = [];
    fixture.detectChanges();
    expect(rows(el).length).toBe(0);
    expect(el.querySelector('.empty-text')?.textContent).toContain('Nothing to reorder');
  });

  it('disables all controls when disabled', () => {
    const { fixture, host, el } = setup();
    host.disabled.set(true);
    fixture.detectChanges();
    expect(handles(el).every((h) => h.disabled)).toBe(true);
    // Keyboard grab is a no-op while disabled.
    handles(el)[0].dispatchEvent(key(' '));
    handles(el)[0].dispatchEvent(key('ArrowDown'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
  });

  it('hides the handle when showHandle is false and buttons when showButtons is false', () => {
    const { fixture, host, el } = setup();
    host.showHandle.set(false);
    host.showButtons.set(false);
    fixture.detectChanges();
    expect(handles(el).length).toBe(0);
    expect(el.querySelectorAll('[data-dir]').length).toBe(0);
  });

  it('has no accessibility violations', async () => {
    const { el } = setup();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('has no accessibility violations while grabbed', async () => {
    const { fixture, el } = setup();
    handles(el)[0].focus();
    handles(el)[0].dispatchEvent(key(' '));
    fixture.detectChanges();
    expect(await axe(el)).toHaveNoViolations();
  });

  it('move-up button reorders and emits (mirror of move-down)', () => {
    const { fixture, host, el } = setup();
    rows(el)[2].querySelector<HTMLButtonElement>('[data-dir="up"]')!.click();
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Charlie', '3: Bravo']);
    expect(host.events[0]).toMatchObject({ item: 'Charlie', previousIndex: 2, currentIndex: 1 });
  });

  it('ArrowUp in grab mode moves the item toward the start', () => {
    const { fixture, el } = setup();
    const handle = handles(el)[2];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab Charlie at 2
    handle.dispatchEvent(key('ArrowUp'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Charlie', '3: Bravo']);
  });

  it('arrow past a boundary is clamped (no-op at the ends)', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab Alpha at 0
    handle.dispatchEvent(key('ArrowUp')); // already first — clamped, no change
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
    handle.dispatchEvent(key(' ')); // drop in place — no emit
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
  });

  it('ignores non-activating keys on an un-grabbed handle', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key('ArrowDown')); // not grabbed yet → ignored
    handle.dispatchEvent(key('a'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
    expect(host.events.length).toBe(0);
  });

  it('ignores unhandled keys while grabbed', () => {
    const { fixture, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab
    handle.dispatchEvent(key('Tab')); // unhandled in the switch
    handle.dispatchEvent(key('x'));
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
  });

  it('focus leaving without an active grab does nothing', () => {
    const { fixture, host, el } = setup();
    const rlHost = el.querySelector('rhombus-reorder-list')!;
    rlHost.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })
    );
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
  });

  it('focus moving to another control inside the list keeps the grab active', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab
    handle.dispatchEvent(key('ArrowDown'));
    fixture.detectChanges();
    // Focus moves to a sibling control still inside the list → not a commit.
    handle.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: handles(el)[1] })
    );
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
    expect(handles(el).some((h) => h.getAttribute('aria-pressed') === 'true')).toBe(true);
  });

  it('commits an in-progress grab when focus leaves the list from any control', () => {
    // Regression: with the default move buttons, a natural Tab from a grabbed
    // handle lands on a same-row move button, then out of the list. The commit
    // must fire from that focus-leave — not only from the handle's own blur.
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab Alpha at 0
    handle.dispatchEvent(key('ArrowDown')); // model reorders to index 1; not yet emitted
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
    const downBtn = rows(el)[1].querySelector<HTMLButtonElement>('[data-dir="down"]')!;
    downBtn.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body })
    );
    fixture.detectChanges();
    expect(host.events.length).toBe(1);
    expect(host.events[0]).toMatchObject({
      item: 'Alpha',
      previousIndex: 0,
      currentIndex: 1,
    });
    // The grab is released — no handle left stuck in the pressed state.
    expect(handles(el).some((h) => h.getAttribute('aria-pressed') === 'true')).toBe(false);
  });

  it('cancels cleanly when Escape is pressed without moving', () => {
    const { fixture, host, el } = setup();
    const handle = handles(el)[0];
    handle.focus();
    handle.dispatchEvent(key(' ')); // grab
    handle.dispatchEvent(key('Escape')); // cancel with no move
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Alpha', '2: Bravo', '3: Charlie']);
    expect(host.events.length).toBe(0);
  });

  it('applies a pointer drop and ignores a same-position drop', () => {
    const { fixture, host, el } = setup();
    const cmp = fixture.debugElement.query(By.directive(RhombusReorderListComponent))
      .componentInstance as unknown as { onDrop(e: unknown): void };
    cmp.onDrop({ previousIndex: 2, currentIndex: 0 }); // Charlie → front
    fixture.detectChanges();
    expect(rowText(el)).toEqual(['1: Charlie', '2: Alpha', '3: Bravo']);
    expect(host.events.length).toBe(1);
    cmp.onDrop({ previousIndex: 1, currentIndex: 1 }); // no-op
    fixture.detectChanges();
    expect(host.events.length).toBe(1);
  });

  it('guards direct move calls at the list boundaries', () => {
    const { fixture, host } = setup();
    const cmp = fixture.debugElement.query(By.directive(RhombusReorderListComponent))
      .componentInstance as unknown as { moveUp(i: number): void; moveDown(i: number): void };
    cmp.moveUp(0); // would move to -1 → guarded
    cmp.moveDown(2); // would move to 3 → guarded
    fixture.detectChanges();
    expect(host.events.length).toBe(0);
  });

  it('uses a custom announce formatter when provided', () => {
    const { fixture, host, el, announcer } = setup();
    const announce = jest.spyOn(announcer, 'announce');
    host.announceFn = (ctx) => `custom ${ctx.phase} ${ctx.label}`;
    fixture.detectChanges();
    handles(el)[0].focus();
    handles(el)[0].dispatchEvent(key(' '));
    fixture.detectChanges();
    expect(announce).toHaveBeenCalledWith('custom grabbed Alpha', 'assertive');
  });

  it('restores focus to the moved control after render (refocus safety net)', async () => {
    const { fixture, el } = setup();
    const down = rows(el)[0].querySelector<HTMLButtonElement>('[data-dir="down"]')!;
    down.focus();
    down.click(); // Alpha 0 → 1
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const movedDown = rows(el)[1].querySelector<HTMLButtonElement>('[data-dir="down"]');
    expect(document.activeElement).toBe(movedDown);
  });
});

describe('rhombus-reorder-list default itemLabel', () => {
  @Component({
    standalone: true,
    imports: [RhombusReorderListComponent, RhombusReorderItemDirective],
    template: `
      <rhombus-reorder-list [(items)]="items">
        <ng-template rhombusReorderItem let-item>{{ item }}</ng-template>
      </rhombus-reorder-list>
    `,
  })
  class DefaultLabelHost {
    items = ['red', 'green'];
  }

  it('falls back to String(item) when no itemLabel is supplied', () => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(DefaultLabelHost);
    fixture.detectChanges();
    const handle = (fixture.nativeElement as HTMLElement).querySelector(
      '.rhombus-reorder-list__handle'
    );
    expect(handle?.getAttribute('aria-label')).toContain('red');
  });
});
