import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { HugeiconsIconComponent, IconSvgObject } from '@hugeicons/angular';
import { ArrowDown01Icon, Add01Icon, Cancel01Icon } from '@hugeicons-pro/core-stroke-rounded';
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
 * One independent pill per filterable facet, each opening its own small
 * dropdown directly beneath itself — matches Mercury's Date/Keyword/Amount
 * toolbar pills and Stripe's dashed-when-unset/solid-when-set chip pattern,
 * rather than a single "Filters" button hiding every facet behind one rail.
 * Self-contained (no app-dropdown/Popper dependency).
 */
@Component({
  selector: 'app-filters',
  imports: [HugeiconsIconComponent, PsClickOutsideDirective],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  readonly sections = input.required<FilterSection[]>();
  readonly checklistChange = output<{ key: string; values: string[] }>();
  readonly dateRangeChange = output<{ key: string; from: string; to: string }>();
  readonly numberRangeChange = output<{ key: string; min: string; max: string }>();

  protected readonly openKey = signal<string | null>(null);
  protected readonly presetOpen = signal(false);
  protected readonly addIcon = Add01Icon;
  protected readonly removeIcon = Cancel01Icon;
  protected readonly arrowIcon = ArrowDown01Icon;
  protected readonly datePresets = DATE_PRESETS;

  protected readonly totalActiveCount = computed(() =>
    this.sections().reduce((n, s) => n + this.sectionCount(s), 0),
  );

  protected sectionCount(section: FilterSection): number {
    if (section.kind === 'checklist') return section.active.length;
    if (section.kind === 'date-range') return section.from || section.to ? 1 : 0;
    return section.min || section.max ? 1 : 0;
  }

  protected chipValue(section: FilterSection): string {
    if (section.kind === 'checklist') {
      return section.active.length <= 2
        ? section.active.map((v) => section.options.find((o) => o.value === v)?.label ?? v).join(', ')
        : `${section.active.length} selected`;
    }
    if (section.kind === 'date-range') {
      const preset = matchDatePreset(section.from, section.to);
      if (preset !== 'custom') return this.datePresets.find((p) => p.key === preset)?.label ?? '';
      if (section.from && section.to) return `${section.from} – ${section.to}`;
      return section.from ? `From ${section.from}` : `Until ${section.to}`;
    }
    const unit = section.unit ? ` ${section.unit}` : '';
    if (section.min && section.max) return `${section.min}–${section.max}${unit}`;
    return section.min ? `≥ ${section.min}${unit}` : `≤ ${section.max}${unit}`;
  }

  protected toggleOpen(key: string): void {
    const next = this.openKey() === key ? null : key;
    this.openKey.set(next);
    this.presetOpen.set(false);
  }

  protected closeIfOpen(key: string): void {
    if (this.openKey() === key) {
      this.openKey.set(null);
      this.presetOpen.set(false);
    }
  }

  /** Opens a given facet's dropdown — called from elsewhere (e.g. a chip click). */
  openSection(key: string): void {
    this.openKey.set(key);
  }

  protected togglePreset(): void {
    this.presetOpen.update((v) => !v);
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

  protected presetLabel(section: DateRangeFilterSection): string {
    const key = this.selectedPreset(section);
    return this.datePresets.find((p) => p.key === key)?.label ?? 'All time';
  }

  protected selectPreset(section: DateRangeFilterSection, presetKey: string): void {
    this.presetOpen.set(false);
    if (presetKey === 'custom') return;
    const preset = this.datePresets.find((p) => p.key === presetKey);
    if (!preset) return;
    const { from, to } = preset.range();
    this.dateRangeChange.emit({ key: section.key, from, to });
  }

  protected setMin(section: NumberRangeFilterSection, value: string): void {
    this.numberRangeChange.emit({ key: section.key, min: value, max: section.max });
  }

  protected setMax(section: NumberRangeFilterSection, value: string): void {
    this.numberRangeChange.emit({ key: section.key, min: section.min, max: value });
  }

  protected clearSection(section: FilterSection, event: Event): void {
    event.stopPropagation();
    if (section.kind === 'checklist') this.checklistChange.emit({ key: section.key, values: [] });
    else if (section.kind === 'date-range') this.dateRangeChange.emit({ key: section.key, from: '', to: '' });
    else this.numberRangeChange.emit({ key: section.key, min: '', max: '' });
    this.closeIfOpen(section.key);
  }

  protected clearAllSections(): void {
    for (const section of this.sections()) {
      if (this.sectionCount(section) === 0) continue;
      if (section.kind === 'checklist') this.checklistChange.emit({ key: section.key, values: [] });
      else if (section.kind === 'date-range') this.dateRangeChange.emit({ key: section.key, from: '', to: '' });
      else this.numberRangeChange.emit({ key: section.key, min: '', max: '' });
    }
    this.openKey.set(null);
  }
}
