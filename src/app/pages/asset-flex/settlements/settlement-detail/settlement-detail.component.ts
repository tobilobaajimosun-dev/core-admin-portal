import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { SettlementService } from '../../shared/services/settlement.service';
import { Settlement } from '../../shared/models/settlement.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { statusTone } from '../../shared/utils/status-tone';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { DetailSkeletonComponent } from '@pages/asset-flex/shared/components/detail-skeleton/detail-skeleton.component';

@Component({
  selector: 'app-settlement-detail',
  imports: [
    DatePipe,
    RouterLink,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    NairaPipe,
    ErrorStateComponent,
    DetailSkeletonComponent,
  ],
  templateUrl: './settlement-detail.component.html',
  styleUrl: './settlement-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettlementDetailComponent {
  private readonly settlementService = inject(SettlementService);

  readonly id = input<string>('');

  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly statusTone = statusTone;

  protected readonly settlement = signal<Settlement | null>(null);
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
    this.settlementService.getOne(id).subscribe({
      next: (res) => {
        this.settlement.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }
}
