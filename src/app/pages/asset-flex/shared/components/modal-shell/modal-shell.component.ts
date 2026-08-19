import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Cancel01Icon } from '@hugeicons-pro/core-stroke-rounded';

let nextModalId = 0;

/**
 * Accessible modal shell: focus trap with auto-capture + focus restore (cdkTrapFocus),
 * Escape-to-close, backdrop click, body scroll-lock, role="dialog" + aria-modal.
 * Project body content directly; project footer actions with `[modalFooter]`.
 */
@Component({
  selector: 'app-modal-shell',
  imports: [A11yModule, HugeiconsIconComponent],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ModalShellComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly title = input('');
  /** Set false to prevent Escape / backdrop close (e.g. while saving). */
  readonly dismissable = input(true);
  readonly maxWidth = input('460px');

  readonly closed = output<void>();

  protected readonly closeIcon = Cancel01Icon;
  protected readonly titleId = `modal-title-${nextModalId++}`;

  ngOnInit(): void {
    // Lock the *actual* scroll container (the app scrolls a nested
    // <main overflow-y-auto>, not <body>). Locking it prevents the background
    // from scrolling behind the modal AND stops the focus-into-view jump that
    // otherwise scatters the page when the dialog (rendered late in the DOM)
    // auto-captures focus. Compensate the removed scrollbar so content doesn't
    // shift when the scrollbar disappears.
    const scroller = this.findScrollContainer(this.host.nativeElement) ?? this.document.body;
    const previousOverflow = scroller.style.overflow;
    const previousPaddingRight = scroller.style.paddingRight;
    const scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
    scroller.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const current = parseFloat(getComputedStyle(scroller).paddingRight) || 0;
      scroller.style.paddingRight = `${current + scrollbarWidth}px`;
    }
    this.destroyRef.onDestroy(() => {
      scroller.style.overflow = previousOverflow;
      scroller.style.paddingRight = previousPaddingRight;
    });
  }

  /** Nearest scrollable ancestor of the modal host, or null. */
  private findScrollContainer(from: HTMLElement): HTMLElement | null {
    let el: HTMLElement | null = from.parentElement;
    while (el && el !== this.document.body) {
      const overflowY = getComputedStyle(el).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  protected onEscape(): void {
    if (this.dismissable()) this.closed.emit();
  }

  protected onBackdrop(): void {
    if (this.dismissable()) this.closed.emit();
  }

  protected close(): void {
    if (this.dismissable()) this.closed.emit();
  }
}
