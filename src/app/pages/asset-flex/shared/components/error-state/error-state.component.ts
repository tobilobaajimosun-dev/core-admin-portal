import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Shown instead of an empty state when a load fails, so "no results" and "couldn't load" never look the same. */
@Component({
  selector: 'app-error-state',
  imports: [],
  template: `
    <div class="pa-gtable__empty" role="alert">
      <p class="pa-empty__title">Couldn't load this</p>
      <p class="pa-empty__text">{{ message() }}</p>
      <button type="button" class="pa-btn pa-btn--white pa-btn--sm" (click)="retry.emit()">Try again</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorStateComponent {
  readonly message = input('Check your connection and try again.');
  readonly retry = output<void>();
}
