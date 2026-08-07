import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Genuinely-empty state (as opposed to app-error-state, which is for a failed load). */
@Component({
  selector: 'app-empty-state',
  imports: [],
  template: `
    <div class="pa-gtable__empty" role="status">
      <img class="empty-illustration" src="images/illustrations/empty-state.svg" alt="" width="93" height="48" />
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
