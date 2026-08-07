import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Genuinely-empty state (as opposed to app-error-state, which is for a failed load).
 * Illustration is a placeholder pending the final asset — see conversation.
 */
@Component({
  selector: 'app-empty-state',
  imports: [],
  template: `
    <div class="pa-gtable__empty" role="status">
      <svg class="empty-illustration" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="10" y="22" width="44" height="30" rx="6" fill="#F5F7FA" stroke="#E2E8F0" stroke-width="1.5" />
        <path d="M10 30h44" stroke="#E2E8F0" stroke-width="1.5" />
        <circle cx="32" cy="16" r="8" fill="#F5F7FA" stroke="#E2E8F0" stroke-width="1.5" />
      </svg>
      <p class="pa-empty__title">{{ title() }}</p>
      @if (subtitle()) {
        <p class="pa-empty__text">{{ subtitle() }}</p>
      }
      @if (actionLabel()) {
        <button type="button" class="pa-btn pa-btn--primary pa-btn--sm" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .empty-illustration {
        margin: 0 auto 12px;
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input('Nothing here yet');
  readonly subtitle = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
