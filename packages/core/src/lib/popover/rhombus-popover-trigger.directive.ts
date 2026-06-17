// packages/core/src/lib/popover/rhombus-popover-trigger.directive.ts
import { Directive, ElementRef, inject, input, signal } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import {
  RhombusPopoverComponent,
  RhombusPopoverTriggerHandle,
} from './rhombus-popover.component';

/**
 * Attaches a `<rhombus-popover>` to any element. Mirrors `matMenuTriggerFor`:
 * `<button [rhombusPopoverTriggerFor]="panel">`. Manages the CDK overlay,
 * reflects `aria-haspopup`/`aria-expanded`, and restores focus on close.
 */
@Directive({
  selector: '[rhombusPopoverTriggerFor]',
  standalone: true,
  exportAs: 'rhombusPopoverTrigger',
  host: {
    '[attr.aria-haspopup]': "'dialog'",
    '[attr.aria-expanded]': 'isOpen()',
    '(click)': 'toggle()',
  },
})
export class RhombusPopoverTriggerDirective implements RhombusPopoverTriggerHandle {
  /** The `<rhombus-popover>` panel this trigger controls. */
  readonly panel = input.required<RhombusPopoverComponent>({
    alias: 'rhombusPopoverTriggerFor',
  });
  /** When `true`, clicks do nothing. */
  readonly disabled = input<boolean>(false);

  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  private overlayRef?: OverlayRef;
  protected readonly isOpen = signal(false);

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.isOpen()) return;
    const panel = this.panel();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions(panel.connectedPositions())
      .withPush(true);
    const width = panel.panelWidth();
    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      width:
        width === 'trigger'
          ? this.host.nativeElement.offsetWidth
          : width === 'auto'
            ? undefined
            : width,
    });
    panel.attachTrigger(this);
    this.overlayRef.attach(panel.createPortal());
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    });
    this.isOpen.set(true);
    panel.opened.emit();
  }

  close(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.isOpen.set(false);
    this.host.nativeElement.focus();
    this.panel().closed.emit();
  }
}
