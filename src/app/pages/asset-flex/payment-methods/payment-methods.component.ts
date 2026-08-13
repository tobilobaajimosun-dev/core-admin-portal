import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PaymentMethodService } from '../shared/services/payment-method.service';
import { PaymentMethod } from '../shared/models/payment-method.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '@pages/asset-flex/shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-payment-methods',
  imports: [PageHeaderComponent, StatusBadgeComponent, ErrorStateComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6">
    <app-page-header title="Payment Methods" subtitle="Collection methods available across loan products." />

    <div class="pa-gtable-wrap">
      <div class="pa-gtable" style="--gt-cols: 1.4fr 1fr 1fr 2fr">
        <div class="pa-gtable__head">
          <span>Method</span>
          <span>Code</span>
          <span>Type</span>
          <span>Description</span>
        </div>

        @if (loading()) {
          @for (r of [1, 2, 3]; track r) {
            <div class="pa-gtable__loading"><span class="pa-skeleton"></span></div>
          }
        } @else if (error()) {
          <app-error-state message="Couldn't load payment methods. Check your connection and try again." (retry)="retry()" />
        } @else if (methods().length === 0) {
          <app-empty-state title="No payment methods" subtitle="Payment methods configured on your account will show up here." />
        } @else {
          @for (m of methods(); track m.code) {
            <div class="pa-gtable__row">
              <div class="pa-gtable__cell pa-cell-primary">{{ m.name }}</div>
              <div class="pa-gtable__cell code-cell">{{ m.code }}</div>
              <div class="pa-gtable__cell"><app-status-badge tone="info" [text]="m.paymentType" /></div>
              <div class="pa-gtable__cell description-cell">{{ m.description || '—' }}</div>
            </div>
          }
        }
      </div>
    </div>
    </div>
  `,
  styles: [
    `
      /*
       * Code and Description are peer columns here, not secondary annotations
       * under a primary line — .pa-mono/.pa-cell-sub's smaller muted sizing is
       * for that latter case (see loans/loan-products), so it doesn't apply.
       * Both inherit the table's 13px base; Code keeps the monospace family only.
       */
      .code-cell {
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
      }
      .description-cell {
        color: var(--ca-text-muted);
      }
    `,
  ],
})
export class PaymentMethodsComponent {
  private readonly service = inject(PaymentMethodService);
  protected readonly methods = signal<PaymentMethod[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.load();
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.service.list().subscribe({
      next: (res) => {
        this.methods.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
