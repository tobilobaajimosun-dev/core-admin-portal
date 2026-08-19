import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { LoanProductService } from '../../shared/services/loan-product.service';
import { LoanProduct } from '../../shared/models/loan-product.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { DetailSkeletonComponent } from '@pages/asset-flex/shared/components/detail-skeleton/detail-skeleton.component';

@Component({
  selector: 'app-loan-product-detail',
  imports: [
    DatePipe,
    RouterLink,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    NairaPipe,
    ErrorStateComponent,
    DetailSkeletonComponent,
  ],
  templateUrl: './loan-product-detail.component.html',
  styleUrl: './loan-product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoanProductDetailComponent {
  private readonly productService = inject(LoanProductService);

  readonly id = input<string>('');

  protected readonly backIcon = ArrowLeft01Icon;

  protected readonly product = signal<LoanProduct | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  constructor() {
    effect(() => {
      this.id();
      this.load();
    });
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    this.productService.getOne(id).subscribe({
      next: (res) => {
        this.product.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
