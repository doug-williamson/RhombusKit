import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TrackByFunction,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RhombusIconComponent } from '../icon/rhombus-icon.component';
import { RhombusReorderItemDirective } from './rhombus-reorder-item.directive';
import { RhombusReorderEmptyDirective } from './rhombus-reorder-empty.directive';
import {
  ReorderAnnounceContext,
  ReorderEvent,
  ReorderListOrientation,
} from './reorder-list.types';

/** Default: track by item reference so reordered DOM nodes MOVE (keeping focus). */
const TRACK_BY_REF: TrackByFunction<unknown> = (_index, item) => item;

/** Per-instance id seed for the aria-describedby instructions wiring. */
let nextId = 0;

/**
 * `<rhombus-reorder-list>` — a keyboard-first, accessible reorderable list. The
 * `@angular/cdk/drag-drop` layer supplies pointer dragging, but `cdkDrag` is
 * pointer-only and invisible to assistive tech, so the component *is* the
 * keyboard grab-mode + `LiveAnnouncer` layer that makes reordering usable
 * without a mouse:
 *
 * - **Move buttons** (`showButtons`) do single-step reorders.
 * - **Grab mode** — Space/Enter on a drag handle picks an item up, Arrow keys
 *   (and Home/End) move it, Space/Enter drops it, Escape cancels, and moving
 *   focus out of the list commits the in-progress move.
 *
 * Every state change is announced assertively via `LiveAnnouncer`. `reordered`
 * fires exactly once per committed reorder — never on an intermediate arrow
 * move, never on an escape-cancel. Themed off the token contract; no new peer
 * (`@angular/cdk` is already one) and no `@angular/animations`.
 *
 * Boundary: use a Reorder list to let a user *change the order* of items. For
 * navigating between destinations use a Nav list; for sorting a data grid by a
 * column use the Data table's sort headers.
 */
@Component({
  selector: 'rhombus-reorder-list',
  standalone: true,
  imports: [NgTemplateOutlet, CdkDropList, CdkDrag, CdkDragHandle, RhombusIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './rhombus-reorder-list.component.scss',
  host: {
    class: 'rhombus-reorder-list-host',
    '[class.rhombus-reorder-list-host--disabled]': 'disabled()',
  },
  template: `
    <ul
      class="rhombus-reorder-list"
      role="list"
      cdkDropList
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="instructionsId"
      [cdkDropListDisabled]="disabled()"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (item of items(); track resolveTrack($index, item); let i = $index; let count = $count) {
        <li
          #row
          class="rhombus-reorder-list__item"
          [class.rhombus-reorder-list__item--grabbed]="grabbedIndex() === i"
          cdkDrag
          [cdkDragData]="item"
          [cdkDragDisabled]="disabled()"
        >
          @if (showHandle()) {
            <button
              type="button"
              class="rhombus-reorder-list__handle"
              cdkDragHandle
              [attr.aria-label]="handleLabel(item, i)"
              [attr.aria-pressed]="grabbedIndex() === i"
              [disabled]="disabled()"
              (keydown)="onHandleKeydown($event, i)"
              (blur)="onHandleBlur($event)"
            >
              <rhombus-icon name="drag_indicator" />
            </button>
          }

          <div class="rhombus-reorder-list__content">
            <ng-container
              [ngTemplateOutlet]="itemTemplate()?.template ?? null"
              [ngTemplateOutletContext]="{ $implicit: item, index: i }"
            />
          </div>

          @if (showButtons()) {
            <div class="rhombus-reorder-list__buttons">
              <button
                type="button"
                class="rhombus-reorder-list__move"
                data-dir="up"
                [attr.aria-label]="moveLabel('up', item, i)"
                [disabled]="disabled() || i === 0"
                (click)="moveUp(i)"
              >
                <rhombus-icon name="arrow_upward" />
              </button>
              <button
                type="button"
                class="rhombus-reorder-list__move"
                data-dir="down"
                [attr.aria-label]="moveLabel('down', item, i)"
                [disabled]="disabled() || i === count - 1"
                (click)="moveDown(i)"
              >
                <rhombus-icon name="arrow_downward" />
              </button>
            </div>
          }
        </li>
      }
    </ul>

    @if (items().length === 0) {
      <div class="rhombus-reorder-list__empty">
        @if (emptyTemplate()) {
          <ng-container [ngTemplateOutlet]="emptyTemplate()!.template" />
        } @else {
          <span class="rhombus-reorder-list__empty-default">No items to reorder.</span>
        }
      </div>
    }

    <span [id]="instructionsId" class="rhombus-reorder-list__sr">{{ instructions }}</span>
  `,
})
export class RhombusReorderListComponent<T> {
  /** Two-way bound ordered list. */
  readonly items = model<T[]>([]);
  /** Resolves an item's spoken/label text for the handle + announcements. */
  readonly itemLabel = input<(item: T, index: number) => string>((item) =>
    String(item)
  );
  /** Accessible name for the list. */
  readonly ariaLabel = input<string>('Reorderable list');
  /** Disables all reordering (pointer, keyboard, and buttons). */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Whether to render the drag handle (grab-mode entry point). */
  readonly showHandle = input(true, { transform: booleanAttribute });
  /** Whether to render the up/down move buttons. */
  readonly showButtons = input(true, { transform: booleanAttribute });
  /** Layout axis (vertical-only in v1; the input is reserved). */
  readonly orientation = input<ReorderListOrientation>('vertical');
  /** `@for` track function; defaults to item reference so nodes move on reorder. */
  readonly trackBy = input<TrackByFunction<T>>(TRACK_BY_REF as TrackByFunction<T>);
  /** Accessible-name suffix for the drag handle. */
  readonly dragHandleLabel = input<string>('Drag to reorder');
  /** Optional formatter for the live-region announcements (i18n hook). */
  readonly announce = input<((ctx: ReorderAnnounceContext<T>) => string) | null>(
    null
  );

  /** Fires once per committed reorder. */
  readonly reordered = output<ReorderEvent<T>>();

  protected readonly itemTemplate = contentChild(RhombusReorderItemDirective);
  protected readonly emptyTemplate = contentChild(RhombusReorderEmptyDirective);
  private readonly rowRefs = viewChildren<ElementRef<HTMLElement>>('row');

  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  protected readonly instructionsId = `rhombus-reorder-${nextId++}`;
  protected readonly instructions =
    'Press space or enter on a drag handle to pick up an item, use the arrow ' +
    'keys or Home and End to move it, space or enter to drop, and escape to cancel.';

  /**
   * Current index of the keyboard-grabbed item, or null when not grabbing. The
   * grabbed item itself is always the one living at this index, so it never
   * needs to be tracked separately.
   */
  protected readonly grabbedIndex = signal<number | null>(null);
  private startIndex = 0;

  protected resolveTrack(index: number, item: T): unknown {
    return this.trackBy()(index, item);
  }

  protected handleLabel(item: T, index: number): string {
    return `${this.itemLabel()(item, index)}, ${this.dragHandleLabel()}`;
  }

  protected moveLabel(dir: 'up' | 'down', item: T, index: number): string {
    return `Move ${this.itemLabel()(item, index)} ${dir}`;
  }

  // ---- Button moves (single-step, immediate commit) --------------------------

  protected moveUp(index: number): void {
    this.commitMove(index, index - 1, 'up');
  }

  protected moveDown(index: number): void {
    this.commitMove(index, index + 1, 'down');
  }

  private commitMove(from: number, to: number, dir: 'up' | 'down'): void {
    if (this.disabled() || to < 0 || to >= this.items().length) return;
    const item = this.items()[from];
    const next = [...this.items()];
    moveItemInArray(next, from, to);
    this.items.set(next);
    this.announcePhase('moved', item, to);
    this.reordered.emit({
      item,
      previousIndex: from,
      currentIndex: to,
      items: [...next],
    });
    this.refocus(to, dir);
  }

  // ---- Pointer drop (from cdkDrag) -------------------------------------------

  protected onDrop(event: CdkDragDrop<T[]>): void {
    if (this.disabled() || event.previousIndex === event.currentIndex) return;
    const item = this.items()[event.previousIndex];
    const next = [...this.items()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.items.set(next);
    this.announcePhase('dropped', item, event.currentIndex);
    this.reordered.emit({
      item,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      items: [...next],
    });
  }

  // ---- Keyboard grab mode ----------------------------------------------------

  protected onHandleKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled()) return;
    const grabbed = this.grabbedIndex();
    const isEnterOrSpace =
      event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';

    if (grabbed === null) {
      if (isEnterOrSpace) {
        event.preventDefault();
        this.grab(index);
      }
      return;
    }

    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        this.commit(grabbed);
        break;
      case 'Escape':
      case 'Esc':
        event.preventDefault();
        this.cancel(grabbed);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.moveGrabbed(grabbed, grabbed - 1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.moveGrabbed(grabbed, grabbed + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveGrabbed(grabbed, 0);
        break;
      case 'End':
        event.preventDefault();
        this.moveGrabbed(grabbed, this.items().length - 1);
        break;
    }
  }

  /** Commit an in-progress grab if focus leaves the list entirely. */
  protected onHandleBlur(event: FocusEvent): void {
    const grabbed = this.grabbedIndex();
    if (grabbed === null) return;
    const related = event.relatedTarget as Node | null;
    if (related && this.host.nativeElement.contains(related)) return;
    this.commit(grabbed);
  }

  private grab(index: number): void {
    this.startIndex = index;
    this.grabbedIndex.set(index);
    this.announcePhase('grabbed', this.items()[index], index);
  }

  private moveGrabbed(from: number, to: number): void {
    const clamped = Math.max(0, Math.min(to, this.items().length - 1));
    if (clamped === from) return;
    const next = [...this.items()];
    moveItemInArray(next, from, clamped);
    this.items.set(next);
    this.grabbedIndex.set(clamped);
    this.announcePhase('moved', next[clamped], clamped);
    this.refocus(clamped, 'handle');
  }

  private commit(to: number): void {
    const from = this.startIndex;
    const item = this.items()[to];
    this.grabbedIndex.set(null);
    this.announcePhase('dropped', item, to);
    if (to !== from) {
      this.reordered.emit({
        item,
        previousIndex: from,
        currentIndex: to,
        items: [...this.items()],
      });
    }
  }

  private cancel(to: number): void {
    const from = this.startIndex;
    if (to !== from) {
      const next = [...this.items()];
      moveItemInArray(next, to, from);
      this.items.set(next);
    }
    this.grabbedIndex.set(null);
    this.announcePhase('cancelled', this.items()[from], from);
    this.refocus(from, 'handle');
  }

  private announcePhase(
    phase: ReorderAnnounceContext<T>['phase'],
    item: T,
    index: number
  ): void {
    const ctx: ReorderAnnounceContext<T> = {
      phase,
      item,
      label: this.itemLabel()(item, index),
      index,
      total: this.items().length,
    };
    const custom = this.announce();
    this.liveAnnouncer.announce(
      custom ? custom(ctx) : defaultAnnouncement(ctx),
      'assertive'
    );
  }

  /** Restore focus to a control on the moved row after the view updates. */
  private refocus(index: number, target: 'handle' | 'up' | 'down'): void {
    afterNextRender(
      () => {
        const row = this.rowRefs()[index]?.nativeElement;
        if (!row) return;
        const selector =
          target === 'handle'
            ? '.rhombus-reorder-list__handle'
            : `[data-dir="${target}"]`;
        let btn = row.querySelector<HTMLButtonElement>(selector);
        if (!btn || btn.disabled) {
          btn =
            row.querySelector<HTMLButtonElement>('.rhombus-reorder-list__handle') ??
            row.querySelector<HTMLButtonElement>('[data-dir]:not([disabled])');
        }
        btn?.focus();
      },
      { injector: this.injector }
    );
  }
}

/** Default English live-region phrasing for a reorder interaction. */
function defaultAnnouncement<T>(ctx: ReorderAnnounceContext<T>): string {
  const position = `position ${ctx.index + 1} of ${ctx.total}`;
  switch (ctx.phase) {
    case 'grabbed':
      return `${ctx.label}, grabbed. Current ${position}. Use the arrow keys to move, space or enter to drop, escape to cancel.`;
    case 'moved':
      return `${ctx.label}, moved to ${position}.`;
    case 'dropped':
      return `${ctx.label}, dropped. Final ${position}.`;
    case 'cancelled':
      return `${ctx.label}, reorder cancelled. Back at ${position}.`;
  }
}
