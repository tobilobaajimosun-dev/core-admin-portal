import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Search01Icon } from '@hugeicons-pro/core-stroke-rounded';

import { CustomerService } from '../shared/services/customer.service';
import { Customer } from '../shared/models/customer.model';
import { PaginationMeta } from '@pages/asset-flex/shared/models/generic.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { statusTone } from '../shared/utils/status-tone';

@Component({
  selector: 'app-customers',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    HugeiconsIconComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly searchIcon = Search01Icon;
  protected readonly statusTone = statusTone;

  protected readonly customers = signal<Customer[]>([]);
  protected readonly pagination = signal<PaginationMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly page = signal(1);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly limit = 20;

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.page.set(Number(qp.get('page')) || 1);
    this.searchControl.setValue(qp.get('search') ?? '', { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.page.set(1);
        this.syncUrl();
        this.load();
      });
    this.load();
  }

  protected fullName(c: Customer): string {
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email || c.phoneNumber;
  }

  protected initials(c: Customer): string {
    return `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase() || c.email?.[0]?.toUpperCase() || '?';
  }

  protected goToPage(page: number): void {
    const total = this.pagination()?.totalPages ?? 1;
    if (page < 1 || page > total || page === this.page()) return;
    this.page.set(page);
    this.syncUrl();
    this.load();
  }

  protected open(c: Customer): void {
    this.router.navigate(['/asset-flex/customers', c.id]);
  }

  private syncUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchControl.value || null,
        page: this.page() > 1 ? this.page() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private load(): void {
    this.loading.set(true);
    this.customerService
      .list({ page: this.page(), limit: this.limit, search: this.searchControl.value || undefined })
      .subscribe({
        next: (res) => {
          this.customers.set(res.data?.data ?? []);
          this.pagination.set(res.data?.pagination ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.customers.set([]);
          this.loading.set(false);
        },
      });
  }
}
