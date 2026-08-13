import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Cancel01Icon } from '@hugeicons-pro/core-stroke-rounded';
import {
  ChecklistFilterSection,
  DateRangeFilterSection,
  FilterSection,
  NumberRangeFilterSection,
} from '@pages/asset-flex/shared/components/filters/filters.component';
import { matchDatePreset, DATE_PRESETS } from '@pages/asset-flex/shared/utils/date-presets';

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

/**
 * Stripe-style row of applied-filter chips — one per active facet, each
 * removable on its own and clickable to reopen that facet in the Filters
 * panel (via a template reference to <app-filters>, see openSection()).
 * Renders nothing when no filters are applied.
 */
@Component({
  selector: 'app-active-filter-chips',
  imports: [HugeiconsIconComponent],
  templateUrl: './active-filter-chips.component.html',
  styleUrl: './active-filter-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveFilterChipsComponent {
  readonly sections = input.required<FilterSection[]>();
  readonly checklistChange = output<{ key: string; values: string[] }>();
  readonly dateRangeChange = output<{ key: string; from: string; to: string }>();
  readonly numberRangeChange = output<{ key: string; min: string; max: string }>();
  readonly clearAll = output<void>();
  readonly sectionClick = output<string>();

  protected readonly closeIcon = Cancel01Icon;

  protected readonly chips = computed<FilterChip[]>(() =>
    this.sections()
      .map((s) => this.toChip(s))
      .filter((c): c is FilterChip => c !== null),
  );

  private toChip(section: FilterSection): FilterChip | null {
    if (section.kind === 'checklist') {
      if (section.active.length === 0) return null;
      const value =
        section.active.length <= 2
          ? section.active.map((v) => section.options.find((o) => o.value === v)?.label ?? v).join(', ')
          : `${section.active.length} selected`;
      return { key: section.key, label: section.label, value };
    }
    if (section.kind === 'date-range') {
      if (!section.from && !section.to) return null;
      const preset = matchDatePreset(section.from, section.to);
      const value =
        preset !== 'custom'
          ? (DATE_PRESETS.find((p) => p.key === preset)?.label ?? 'Custom')
          : section.from && section.to
            ? `${section.from} – ${section.to}`
            : section.from
              ? `From ${section.from}`
              : `Until ${section.to}`;
      return { key: section.key, label: section.label, value };
    }
    if (!section.min && !section.max) return null;
    const unit = section.unit ? ` ${section.unit}` : '';
    const value =
      section.min && section.max
        ? `${section.min}–${section.max}${unit}`
        : section.min
          ? `≥ ${section.min}${unit}`
          : `≤ ${section.max}${unit}`;
    return { key: section.key, label: section.label, value };
  }

  protected clearChip(key: string): void {
    const section = this.sections().find((s) => s.key === key);
    if (!section) return;
    if (section.kind === 'checklist') this.checklistChange.emit({ key, values: [] });
    else if (section.kind === 'date-range') this.dateRangeChange.emit({ key, from: '', to: '' });
    else this.numberRangeChange.emit({ key, min: '', max: '' });
  }
}
