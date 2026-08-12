import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsClickOutsideDirective } from '@shared/directives/ps-click-outside.directive';

export interface StatusFilterOption {
  label: string;
  value: string;
}

/**
 * Single-trigger status filter, replacing an always-expanded pill row once the
 * option count grows past a handful. Self-contained (no app-dropdown/Popper
 * dependency) — a signal toggles a plain absolutely-positioned menu, closed via
 * clickOutside or Escape.
 */
@Component({
  selector: 'app-status-filter',
  imports: [HugeiconsIconComponent, PsClickOutsideDirective],
  templateUrl: './status-filter.component.html',
  styleUrl: './status-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class StatusFilterComponent {
  readonly options = input.required<StatusFilterOption[]>();
  readonly active = input<string>('');
  /** Label shown when no filter is applied, e.g. "All statuses". */
  readonly allLabel = input('All statuses');
  readonly statusChange = output<string>();

  protected readonly open = signal(false);

  protected readonly arrowIcon = ArrowDown01Icon;
  protected readonly tickIcon = Tick02Icon;

  protected readonly triggerLabel = computed(() => {
    const match = this.options().find((o) => o.value === this.active());
    return match && match.value !== '' ? match.label : this.allLabel();
  });

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected select(value: string): void {
    this.statusChange.emit(value);
    this.close();
  }
}
