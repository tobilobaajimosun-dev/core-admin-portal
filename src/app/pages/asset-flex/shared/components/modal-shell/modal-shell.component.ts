import { DOCUMENT } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
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

  readonly title = input('');
  /** Set false to prevent Escape / backdrop close (e.g. while saving). */
  readonly dismissable = input(true);
  readonly maxWidth = input('460px');

  readonly closed = output<void>();

  protected readonly closeIcon = Cancel01Icon;
  protected readonly titleId = `modal-title-${nextModalId++}`;

  ngOnInit(): void {
    const previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    this.destroyRef.onDestroy(() => {
      this.document.body.style.overflow = previousOverflow;
    });
  }

  protected onEscape(): void {
    if (this.dismissable()) this.closed.emit();
  }

  protected onBackdrop(): void {
    if (this.dismissable()) this.closed.emit();
  }

  protected close(): void {
    this.closed.emit();
  }
}
