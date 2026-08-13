import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { HugeiconsIconComponent, IconSvgObject } from '@hugeicons/angular';
import { ArrowDown01Icon, ArrowRight01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsClickOutsideDirective } from '@shared/directives/ps-click-outside.directive';
import { DATE_PRESETS, matchDatePreset } from '@pages/asset-flex/shared/utils/date-presets';

export interface FilterOption {
  label: string;
  value: string;
}

export interface ChecklistFilterSection {
  key: string;
  label: string;
  icon: IconSvgObject;
  kind: 'checklist';
  options: FilterOption[];
  active: string[];
}

export interface DateRangeFilterSection {
  key: string;
  label: string;
  icon: IconSvgObject;
  kind: 'date-range';
  from: string;
  to: string;
}

export interface NumberRangeFilterSection {
  key: string;
  label: string;
  icon: IconSvgObject;
  kind: 'number-range';
  min: string;
  max: string;
  unit?: string;
}

export type FilterSection = ChecklistFilterSection | DateRangeFilterSection | NumberRangeFilterSection;

/**
 * Single "Filters" trigger opening a rail + content panel — one section per
 * filterable facet (status, date range, and room to grow), instead of one
 * pill per facet. Self-contained (no app-dropdown/Popper dependency).
 */
@Component({
  selector: 'app-filters',
  imports: [HugeiconsIconComponent, PsClickOutsideDirective],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class FiltersComponent {
  readonly sections = input.required<FilterSection[]>();
  readonly checklistChange = output<{ key: string; values: string[] }>();
  readonly dateRangeChange = output<{ key: string; from: string; to: string }>();
  readonly numberRangeChange = output<{ key: string; min: string; max: string }>();
  readonly clearAll = output<void>();

  protected readonly open = signal(false);
  protected readonly activeSectionKey = signal<string | null>(null);
  protected readonly presetOpen = signal(false);
  protected readonly arrowIcon = ArrowDown01Icon;
  protected readonly chevronIcon = ArrowRight01Icon;
  protected readonly datePresets = DATE_PRESETS;

  protected readonly activeSection = computed<FilterSection | null>(() => {
    const sections = this.sections();
    const key = this.activeSectionKey() ?? sections[0]?.key ?? null;
    return sections.find((s) => s.key === key) ?? null;
  });

  protected readonly activeCount = computed(() =>
    this.sections().reduce((n, s) => n + this.sectionCount(s), 0),
  );

  protected readonly triggerLabel = computed(() => {
    const n = this.activeCount();
    return n > 0 ? `Filters · ${n}` : 'Filters';
  });

  protected toggle(): void {
    this.open.update((v) => !v);
    if (this.open() && !this.activeSectionKey()) {
      this.activeSectionKey.set(this.sections()[0]?.key ?? null);
    }
  }

  protected close(): void {
    this.open.set(false);
    this.presetOpen.set(false);
  }

  protected togglePreset(): void {
    this.presetOpen.update((v) => !v);
  }

  protected closePreset(): void {
    this.presetOpen.set(false);
  }

  /** Opens the panel scoped to a given section — called from the active-filter
   * chips row via a template reference to this component. */
  openSection(key: string): void {
    this.activeSectionKey.set(key);
    this.open.set(true);
  }

  protected selectSection(key: string): void {
    this.activeSectionKey.set(key);
  }

  protected sectionCount(section: FilterSection): number {
    if (section.kind === 'checklist') return section.active.length;
    if (section.kind === 'date-range') return section.from || section.to ? 1 : 0;
    return section.min || section.max ? 1 : 0;
  }

  protected asChecklist(section: FilterSection): ChecklistFilterSection {
    return section as ChecklistFilterSection;
  }

  protected asDateRange(section: FilterSection): DateRangeFilterSection {
    return section as DateRangeFilterSection;
  }

  protected asNumberRange(section: FilterSection): NumberRangeFilterSection {
    return section as NumberRangeFilterSection;
  }

  protected isChecked(section: ChecklistFilterSection, value: string): boolean {
    return section.active.includes(value);
  }

  protected toggleValue(section: ChecklistFilterSection, value: string): void {
    const next = section.active.includes(value)
      ? section.active.filter((v) => v !== value)
      : [...section.active, value];
    this.checklistChange.emit({ key: section.key, values: next });
  }

  protected setFrom(section: DateRangeFilterSection, value: string): void {
    this.dateRangeChange.emit({ key: section.key, from: value, to: section.to });
  }

  protected setTo(section: DateRangeFilterSection, value: string): void {
    this.dateRangeChange.emit({ key: section.key, from: section.from, to: value });
  }

  protected selectedPreset(section: DateRangeFilterSection): string {
    return matchDatePreset(section.from, section.to);
  }

  protected selectPreset(section: DateRangeFilterSection, presetKey: string): void {
    this.presetOpen.set(false);
    if (presetKey === 'custom') return; // keep current from/to, just reveals the manual fields
    const preset = this.datePresets.find((p) => p.key === presetKey);
    if (!preset) return;
    const { from, to } = preset.range();
    this.dateRangeChange.emit({ key: section.key, from, to });
  }

  protected presetLabel(section: DateRangeFilterSection): string {
    const key = this.selectedPreset(section);
    return this.datePresets.find((p) => p.key === key)?.label ?? 'All time';
  }

  protected setMin(section: NumberRangeFilterSection, value: string): void {
    this.numberRangeChange.emit({ key: section.key, min: value, max: section.max });
  }

  protected setMax(section: NumberRangeFilterSection, value: string): void {
    this.numberRangeChange.emit({ key: section.key, min: section.min, max: value });
  }

  protected clear(): void {
    this.clearAll.emit();
  }
}
