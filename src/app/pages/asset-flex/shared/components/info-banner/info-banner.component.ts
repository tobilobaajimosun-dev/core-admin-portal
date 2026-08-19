import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Cancel01Icon } from '@hugeicons-pro/core-stroke-rounded';

const STORAGE_PREFIX = 'pa-dismissed-banner:';

/** Dismissible tip/promo banner (Stripe's "Track invoice statuses..." pattern).
 * Dismissal persists per `key` in localStorage, so it stays closed across visits. */
@Component({
  selector: 'app-info-banner',
  imports: [HugeiconsIconComponent],
  templateUrl: './info-banner.component.html',
  styleUrl: './info-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBannerComponent {
  readonly key = input.required<string>();
  readonly message = input.required<string>();
  readonly ctaLabel = input('');
  readonly ctaClick = output<void>();

  protected readonly closeIcon = Cancel01Icon;
  protected readonly dismissed = signal(false);

  constructor() {
    this.dismissed.set(this.isDismissed());
  }

  private isDismissed(): boolean {
    try {
      return localStorage.getItem(STORAGE_PREFIX + this.key()) === '1';
    } catch {
      return false;
    }
  }

  protected dismiss(): void {
    this.dismissed.set(true);
    try {
      localStorage.setItem(STORAGE_PREFIX + this.key(), '1');
    } catch {
      // localStorage unavailable (private browsing, etc.) — dismissal just won't persist.
    }
  }
}
