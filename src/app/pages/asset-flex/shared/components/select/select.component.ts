import { ChangeDetectionStrategy, Component, computed, ElementRef, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Styled select that opens a normal dropdown *under* the field, replacing the
 * native <select> (whose OS-rendered option list looked out of place). Works as
 * a reactive-forms control via ControlValueAccessor.
 */
@Component({
  selector: 'af-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
  template: `
    <div class="afs" [class.afs--open]="open()">
      <button
        type="button"
        class="afs__trigger"
        [disabled]="disabled()"
        [attr.aria-expanded]="open()"
        aria-haspopup="listbox"
        (click)="toggle()"
      >
        <span class="afs__value" [class.afs__value--placeholder]="!selectedLabel()">{{ selectedLabel() || placeholder() }}</span>
        <svg class="afs__caret" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      @if (open()) {
        <div class="afs__menu" role="listbox">
          @for (o of options(); track o.value) {
            <button
              type="button"
              class="afs__option"
              [class.afs__option--active]="o.value === value()"
              role="option"
              [attr.aria-selected]="o.value === value()"
              (click)="select(o.value)"
            >
              {{ o.label }}
            </button>
          } @empty {
            <p class="afs__empty">No options</p>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './select.component.scss',
})
export class SelectComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('Select…');

  protected readonly open = signal(false);
  protected readonly value = signal<string>('');
  protected readonly disabled = signal(false);

  protected readonly selectedLabel = computed(() => this.options().find((o) => o.value === this.value())?.label ?? '');

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected toggle(): void {
    if (!this.disabled()) this.open.update((v) => !v);
  }
  protected close(): void {
    this.open.set(false);
  }
  protected select(v: string): void {
    this.value.set(v);
    this.onChange(v);
    this.onTouched();
    this.open.set(false);
  }
  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  writeValue(v: string): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled.set(d);
  }
}
