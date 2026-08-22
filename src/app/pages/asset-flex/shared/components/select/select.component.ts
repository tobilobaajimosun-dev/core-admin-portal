import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: string;
}

let uid = 0;

/**
 * Styled select that opens a dropdown *under* the field, replacing the native
 * <select> (whose OS-rendered option list looked out of place). Works as a
 * reactive-forms control via ControlValueAccessor.
 *
 * With [searchable]="true" it becomes a combobox: the trigger turns into a
 * search input and the option list renders in-flow (so a host modal grows to
 * fit rather than clipping an overlay). Follows the APG combobox pattern —
 * role="combobox" input driving a role="listbox" via aria-activedescendant.
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
    <div class="afs" [class.afs--open]="open()" [class.afs--searchable]="searchable()">
      @if (searchable() && open()) {
        <div class="afs__searchwrap">
          <svg class="afs__searchicon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.6" />
            <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            #searchInput
            type="text"
            class="afs__trigger afs__search"
            role="combobox"
            aria-autocomplete="list"
            [attr.id]="inputId() || null"
            [attr.aria-expanded]="true"
            [attr.aria-controls]="listId"
            [attr.aria-activedescendant]="activeDescendant()"
            [attr.aria-label]="ariaLabel() || null"
            [placeholder]="searchPlaceholder()"
            [value]="query()"
            (input)="onQuery($event)"
            (keydown)="onKeydown($event)"
          />
        </div>
      } @else {
        <button
          #trigger
          type="button"
          class="afs__trigger"
          [attr.id]="inputId() || null"
          [disabled]="disabled()"
          [attr.aria-expanded]="open()"
          [attr.aria-label]="ariaLabel() || null"
          aria-haspopup="listbox"
          (click)="toggle()"
        >
          <span class="afs__value" [class.afs__value--placeholder]="!selectedLabel()">{{ selectedLabel() || placeholder() }}</span>
          <svg class="afs__caret" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      }

      @if (open()) {
        <div #menu class="afs__menu" [class.afs__menu--inline]="searchable()" role="listbox" [id]="listId">
          @for (o of visibleOptions(); track o.value; let i = $index) {
            <button
              type="button"
              class="afs__option"
              [id]="optionId(i)"
              [class.afs__option--active]="o.value === value()"
              [class.afs__option--focus]="searchable() && i === activeIndex()"
              [attr.tabindex]="searchable() ? -1 : null"
              role="option"
              [attr.aria-selected]="o.value === value()"
              (mouseenter)="onHover(i)"
              (mousedown)="$event.preventDefault()"
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
  readonly searchable = input(false);
  readonly searchPlaceholder = input('Search…');
  /** Applied as the control's `id` so a sibling `<label for>` can target it. */
  readonly inputId = input('');
  readonly ariaLabel = input('');

  protected readonly listId = `afs-list-${uid++}`;
  protected readonly open = signal(false);
  protected readonly value = signal<string>('');
  protected readonly disabled = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');

  protected readonly selectedLabel = computed(() => this.options().find((o) => o.value === this.value())?.label ?? '');

  protected readonly visibleOptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    const opts = this.options();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  });

  protected readonly activeDescendant = computed(() => {
    const list = this.visibleOptions();
    const i = this.activeIndex();
    return list.length > 0 && i >= 0 && i < list.length ? this.optionId(i) : null;
  });

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // Move focus into the search field when the combobox opens.
    effect(() => {
      if (this.open() && this.searchable()) this.searchInput()?.nativeElement.focus();
    });
    // Keep the keyboard-active option scrolled into view.
    effect(() => {
      if (!this.open() || !this.searchable()) return;
      const el = this.menu()?.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(this.optionId(this.activeIndex()))}`);
      el?.scrollIntoView({ block: 'nearest' });
    });
  }

  protected optionId(i: number): string {
    return `${this.listId}-opt-${i}`;
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
    if (this.open()) this.activeIndex.set(0);
  }

  protected close(): void {
    const wasSearchOpen = this.open() && this.searchable();
    this.open.set(false);
    this.query.set('');
    // Restore focus to the trigger after the search input unmounts (a11y: focus
    // must not fall to <body> when the combobox closes).
    if (wasSearchOpen) setTimeout(() => this.trigger()?.nativeElement.focus());
  }

  protected select(v: string): void {
    this.value.set(v);
    this.onChange(v);
    this.onTouched();
    this.close();
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  /** Sync the keyboard-active row to the hovered one so only one option highlights. */
  protected onHover(i: number): void {
    if (this.searchable()) this.activeIndex.set(i);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.visibleOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) return this.open.set(true);
        this.activeIndex.set(Math.min(this.activeIndex() + 1, Math.max(list.length - 1, 0)));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(this.activeIndex() - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.activeIndex.set(Math.max(list.length - 1, 0));
        break;
      case 'Enter': {
        event.preventDefault();
        const o = list[this.activeIndex()];
        if (o) this.select(o.value);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
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
