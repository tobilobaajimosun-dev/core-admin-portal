import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PaymentMethodService } from '../shared/services/payment-method.service';
import { PaymentMethod } from '../shared/models/payment-method.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-payment-methods',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
        } @else if (methods().length === 0) {
          <div class="pa-gtable__empty">
            <p class="pa-empty__title">No payment methods</p>
          </div>
        } @else {
          @for (m of methods(); track m.code) {
            <div class="pa-gtable__row">
              <div class="pa-gtable__cell pa-cell-primary">{{ m.name }}</div>
              <div class="pa-gtable__cell pa-mono">{{ m.code }}</div>
              <div class="pa-gtable__cell"><app-status-badge tone="info" [text]="m.paymentType" /></div>
              <div class="pa-gtable__cell pa-cell-sub">{{ m.description || '—' }}</div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PaymentMethodsComponent {
  private readonly service = inject(PaymentMethodService);
  protected readonly methods = signal<PaymentMethod[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.service.list().subscribe({
      next: (res) => {
        this.methods.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
