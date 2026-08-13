import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Standard page header: title + optional subtitle, with a projected `[actions]` slot. */
@Component({
  selector: 'app-page-header',
  template: `
    <header class="ph">
      <div class="ph__text">
        <h1 class="ph__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="ph__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="ph__actions">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
  styles: [
    `
      .ph {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .ph__title {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: var(--ca-text);
        margin: 0;
      }
      .ph__subtitle {
        font-size: 13px;
        color: var(--ca-text-muted);
        margin: 4px 0 0;
      }
      .ph__actions:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
