import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="'badge--' + tone()">{{ label() }}</span>`,
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly text = input<string>('');

  /** Humanised label — turns SNAKE_CASE tokens into "Snake Case". */
  readonly label = computed(() =>
    this.text()
      .toLowerCase()
      .split('_')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' '),
  );
}
