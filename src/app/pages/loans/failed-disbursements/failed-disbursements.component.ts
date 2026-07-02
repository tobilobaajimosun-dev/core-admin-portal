import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { PsEmptyComponent } from '@pcsl-ui/ui/ps-empty/ps-empty.component';
import { LoanStore } from '@core/store/loan.store';
import { FailedDisbursementView } from '@core/interfaces/loan.model';

@Component({
  selector: 'app-failed-disbursements',
  standalone: true,
  imports: [CommonModule, PsPaginationComponent, PsEmptyComponent],
  templateUrl: './failed-disbursements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailedDisbursementsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(LoanStore);

  currentPage = signal(1);
  searchQuery = signal('');

  records = computed<FailedDisbursementView[]>(() => this.store.failedDisbursementViews());

  readonly columns = ['Application Date', 'Customer Details', 'Amount & Tenor', 'Loan ID', 'Product', 'Reason'];

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), debounceTime(400), distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchFailedDisbursements({ page: 1, limit: 10 });
    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.store.setFailedDisbursementsSearch(query));
  }

  onSearch(value: string): void { this.searchQuery.set(value); }

  onPageChange(page: number): void { this.store.setFailedDisbursementsPage(page); this.currentPage.set(page); }
  onPageSizeChange(size: number): void { this.store.setFailedDisbursementsPageSize(size); this.currentPage.set(1); }

  goBack(): void { this.router.navigate(['/loans']); }
}