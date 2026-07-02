import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { PsPaginationComponent } from '@ui/ps-pagination/ps-pagination.component';
import { LoanStore } from '@core/store/loan.store';
import { RepaymentDueView } from '@core/interfaces/loan.model';

@Component({
  selector: 'app-repayments-due',
  standalone: true,
  imports: [CommonModule, PsPaginationComponent],
  templateUrl: './repayments-due.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepaymentsDueComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(LoanStore);

  currentPage = signal(1);
  searchQuery = signal('');

  records = computed<RepaymentDueView[]>(() => this.store.repaymentsDueViews());

  readonly columns = ['Customer Details', 'Amount Due', 'Loan ID', 'Product', 'Due Date'];

  private readonly debouncedSearch$ = toObservable(this.searchQuery).pipe(
    skip(1), debounceTime(400), distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.store.fetchRepaymentsDueToday({ page: 1, limit: 10 });
    this.debouncedSearch$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => this.store.setRepaymentsDueSearch(query));
  }

  onSearch(value: string): void { this.searchQuery.set(value); }

  onPageChange(page: number): void { this.store.setRepaymentsDuePage(page); this.currentPage.set(page); }
  onPageSizeChange(size: number): void { this.store.setRepaymentsDuePageSize(size); this.currentPage.set(1); }

  goBack(): void { this.router.navigate(['/loans']); }
}