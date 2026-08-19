import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LoanCategory, categoryMeta } from '@pages/asset-flex/shared/models/category.model';

/** Soft tinted pill for a loan category, coloured per the category meta. */
@Component({
  selector: 'af-category-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (meta(); as m) {
      <span class="af-cat" [style.color]="m.color" [style.background]="tint()">
        <span class="af-cat__dot" [style.background]="m.color"></span>{{ m.label }}
      </span>
    } @else {
      <span class="af-cat af-cat--none">—</span>
    }
  `,
  styles: [
    `
      .af-cat {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 22px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }
      .af-cat__dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        flex-shrink: 0;
      }
      .af-cat--none {
        color: var(--ca-text-faint);
        background: transparent;
        padding: 0;
      }
    `,
  ],
})
export class CategoryChipComponent {
  readonly category = input.required<LoanCategory | null | undefined>();

  protected readonly meta = computed(() => categoryMeta(this.category()));
  protected readonly tint = computed(() => {
    const m = this.meta();
    return m ? `color-mix(in srgb, ${m.color} 12%, #fff)` : 'transparent';
  });
}
