import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Genuinely-empty state (as opposed to app-error-state, which is for a failed load). */
@Component({
  selector: 'app-empty-state',
  imports: [],
  template: `
    <div class="empty" role="status">
      <img class="empty__illustration" src="images/illustrations/empty-state.svg" alt="" width="93" height="48" />
      <p class="empty__title">{{ title() }}</p>
      @if (subtitle()) {
        <p class="empty__text">{{ subtitle() }}</p>
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
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 44px 16px;
      }

      .empty__illustration {
        margin-bottom: 12px;
      }

      .empty__title {
        font-size: 16px;
        font-weight: 600;
        color: var(--ca-text-strong, #2b3033);
        margin: 0 0 4px;
      }

      .empty__text {
        font-size: 13px;
        color: var(--ca-text-muted, #51575b);
        margin: 0 0 12px;
        max-width: 360px;
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
