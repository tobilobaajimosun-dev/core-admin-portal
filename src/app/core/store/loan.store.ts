import { Injectable, signal, computed, inject } from '@angular/core';
import { LoanService } from '@core/services/loan.service';
import { HttpResponse } from '@angular/common/http';
import {
  LoanRaw,
  LoanView,
  LoanListParams,
  LoanDateRange,
  LoanMetricsData,
  FailedDisbursementRaw,
  FailedDisbursementView,
  FailedDisbursementListParams,
  RepaymentDueRaw,
  RepaymentDueView,
  RepaymentDueListParams,
  LoanDetailRaw,
  LoanDetailHeaderView
} from '@core/interfaces/loan.model';

const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  ACTIVE: 'Active',
  PENDING: 'Pending',
};

function toLoanView(raw: LoanRaw): LoanView {
  const createdAt = new Date(raw.createdAt);

  return {
    id: raw.id,
    applicationDate: createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ',',
    applicationTime: createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) + ' GMT',
    customerName: `${raw.customer.firstName} ${raw.customer.lastName}`,
    customerEmail: raw.customer.email,
    initials: `${(raw.customer.firstName ?? ' ').charAt(0)}${(raw.customer.lastName ?? ' ').charAt(0)}`.toUpperCase(),
    loanId: raw.unique_loan_id,
    amount: `₦${raw.loan_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    tenor: `For ${raw.loan_duration} month${raw.loan_duration === 1 ? '' : 's'}`,
    product: raw.product.title,
    status: STATUS_LABELS[raw.status] ?? raw.status,
  };
}

function toFailedDisbursementView(raw: FailedDisbursementRaw): FailedDisbursementView {
  const createdAt = new Date(raw.createdAt);
  const firstName = raw.customer?.firstName ?? '';
  const lastName = raw.customer?.lastName ?? '';

  return {
    id: raw.id,
    applicationDate: createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ',',
    applicationTime: createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) + ' GMT',
    customerName: `${firstName} ${lastName}`.trim() || '—',
    customerEmail: raw.customer?.email ?? '—',
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '—',
    loanId: raw.unique_loan_id ?? '—',
    amount: raw.loan_amount != null
      ? `₦${raw.loan_amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '—',
    tenor: raw.loan_duration != null
      ? `For ${raw.loan_duration} month${raw.loan_duration === 1 ? '' : 's'}`
      : '—',
    product: raw.product?.title ?? '—',
    product_tag: raw.product_tag ?? '—',
    reason: raw.failure_reason ?? '—',
  };
}

function toRepaymentDueView(raw: RepaymentDueRaw): RepaymentDueView {
  const dueDate = new Date(raw.due_date ?? raw.createdAt);
  const firstName = raw.customer?.firstName ?? '';
  const lastName = raw.customer?.lastName ?? '';

  return {
    id: raw.id,
    customerName: `${firstName} ${lastName}`.trim() || '—',
    customerEmail: raw.customer?.email ?? '—',
    initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '—',
    loanId: raw.unique_loan_id ?? '—',
    amountDue: raw.amount_due != null
      ? `₦${raw.amount_due.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : '—',
    product: raw.product?.title ?? '—',
    product_tag: raw.product_tag ?? '—',
    dueDate: !isNaN(dueDate.getTime())
      ? dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ','
      : '—',
  };
}

function toLoanDetailHeaderView(raw: LoanDetailRaw): LoanDetailHeaderView {
  return {
    id: raw.unique_loan_id,
    customerId: raw.customer.id,
    customerName: `${raw.customer.firstName} ${raw.customer.lastName}`,
    customerEmail: raw.customer.email,
    customerPhone: raw.customer.phone,
    customerAvatar: '',
    status: raw.status,
    walletType: raw.product?.title ?? '—',
    isNew: raw.status === 'NEW',
    amountRequested: raw.cards.amountRequested,
    amountDisbursed: raw.cards.amountDisbursed,
    outstandingBalance: raw.cards.outstandingBalance,
    totalRepaid: raw.cards.totalRepaid,
    interestRate: `${raw.cards.interest}% pa`,
    applicationDate: raw.cards.applicationDate,
    dueDate: raw.cards.dueDate,
    tenor: `${raw.cards.tenor} month${raw.cards.tenor === 1 ? '' : 's'}`,
  };
}

function extractFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? null;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}


@Injectable({ providedIn: 'root' })
export class LoanStore {
  private readonly loanService = inject(LoanService);

  // ── Raw state ─────────────────────────────────────────────────────────────
  private readonly _loans = signal<LoanRaw[]>([]);
  private readonly _total = signal(0);
  private readonly _page = signal(1);
  private readonly _limit = signal(10);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Metrics state ─────────────────────────────────────────────────────────
  private readonly _metrics = signal<LoanMetricsData | null>(null);
  private readonly _metricsLoading = signal(false);
  private readonly _metricsError = signal<string | null>(null);

  // ── Failed disbursements state ───────────────────────────────────────────
  private readonly _failedDisbursements = signal<FailedDisbursementRaw[]>([]);
  private readonly _failedDisbursementsTotal = signal(0);
  private readonly _failedDisbursementsPage = signal(1);
  private readonly _failedDisbursementsLimit = signal(10);
  private readonly _failedDisbursementsLoading = signal(false);
  private readonly _failedDisbursementsError = signal<string | null>(null);

  // ── Repayments due today state ───────────────────────────────────────────
  private readonly _repaymentsDue = signal<RepaymentDueRaw[]>([]);
  private readonly _repaymentsDueTotal = signal(0);
  private readonly _repaymentsDuePage = signal(1);
  private readonly _repaymentsDueLimit = signal(10);
  private readonly _repaymentsDueLoading = signal(false);
  private readonly _repaymentsDueError = signal<string | null>(null);

  // ── Filter state ──────────────────────────────────────────────────────────
  private readonly _search = signal('');
  private readonly _status = signal('');
  private readonly _range = signal<LoanDateRange | ''>('');
  private readonly _tenor = signal('');
  private readonly _product = signal('');
  private readonly _minAmount = signal<number | null>(null);
  private readonly _maxAmount = signal<number | null>(null);

  // ── Export state ─────────────────────────────────────────────────────────
  private readonly _isExporting = signal(false);
  private readonly _exportError = signal<string | null>(null);
  readonly isExporting = computed(() => this._isExporting());
  readonly exportError = computed(() => this._exportError());

  // Track the last params used to fetch the list, so export can reuse
  // the active filters/search without page & limit.
  private readonly _lastParams = signal<LoanListParams>({ page: 1, limit: 10 });

  // ── Public selectors ──────────────────────────────────────────────────────
  readonly loans = computed(() => this._loans());
  readonly loanViews = computed(() => this._loans().map(toLoanView));
  readonly total = computed(() => this._total());
  readonly currentPage = computed(() => this._page());
  readonly currentLimit = computed(() => this._limit());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());

  readonly metrics = computed(() => this._metrics());
  readonly metricsLoading = computed(() => this._metricsLoading());
  readonly metricsError = computed(() => this._metricsError());

  readonly failedDisbursements = computed(() => this._failedDisbursements());
  readonly failedDisbursementViews = computed(() => this._failedDisbursements().map(toFailedDisbursementView));
  readonly failedDisbursementsTotal = computed(() => this._failedDisbursementsTotal());
  readonly failedDisbursementsPage = computed(() => this._failedDisbursementsPage());
  readonly failedDisbursementsLimit = computed(() => this._failedDisbursementsLimit());
  readonly failedDisbursementsLoading = computed(() => this._failedDisbursementsLoading());
  readonly failedDisbursementsError = computed(() => this._failedDisbursementsError());

  readonly repaymentsDue = computed(() => this._repaymentsDue());
  readonly repaymentsDueViews = computed(() => this._repaymentsDue().map(toRepaymentDueView));
  readonly repaymentsDueTotal = computed(() => this._repaymentsDueTotal());
  readonly repaymentsDuePage = computed(() => this._repaymentsDuePage());
  readonly repaymentsDueLimit = computed(() => this._repaymentsDueLimit());
  readonly repaymentsDueLoading = computed(() => this._repaymentsDueLoading());
  readonly repaymentsDueError = computed(() => this._repaymentsDueError());

  private readonly _loanDetail = signal<LoanDetailRaw | null>(null);
  private readonly _loanDetailLoading = signal(false);
  private readonly _loanDetailError = signal<string | null>(null);

  readonly loanDetail = computed(() => this._loanDetail());
  readonly loanDetailLoading = computed(() => this._loanDetailLoading());
  readonly loanDetailError = computed(() => this._loanDetailError());


  readonly loanDetailHeaderView = computed(() => {
    const raw = this._loanDetail();
    return raw ? toLoanDetailHeaderView(raw) : null;
  });

  readonly loanAboutView = computed(() => this._loanDetail()?.tabs.about ?? null);

  readonly loanLiquidationView = computed(() => {
    const raw = this._loanDetail();
    if (!raw) return null;
    const summary = raw.tabs.liquidation;
    const detail = raw.tabs.about.liquidationDetails;
    return {
      totalAmount: summary.totalAmount,
      paid: summary.amountPaid,
      balance: summary.balance,
      lastUpdated: new Date(raw.updatedAt).toLocaleString(),
      releaseDate: detail.releaseDate,
      maturityDate: detail.maturityDate,
      principal: detail.principal,
      interestRate: `${detail.interestRate}% pa`,
      monthlyRepayment: detail.monthlyRepayment,
      fees: detail.fees,
      penalty: detail.penalty,
      amountDue: detail.amountDue,
      paidToDate: detail.amountPaidToDate,
      interest: detail.interest,
    };
  });

  readonly loanDocumentsView = computed(() => {
    const raw = this._loanDetail();
    if (!raw) return null;
    return {
      documents: raw.tabs.documents,
      generatedLetters: raw.tabs.loanDocuments,
    };
  });

  readonly loanScheduleView = computed(() => this._loanDetail()?.tabs.schedule ?? []);

  readonly loanLogsView = computed(() => this._loanDetail()?.tabs.logs ?? []);

  // ── Actions ───────────────────────────────────────────────────────────────

  fetchLoans(params: LoanListParams = {}): void {
    this._lastParams.set(params);
    this._isLoading.set(true);
    this._error.set(null);

    this.loanService.getLoans(params).subscribe({
      next: (res) => {
        this._loans.set(res.data.data);
        this._total.set(res.data.meta.total);
        this._page.set(res.data.meta.page);
        this._limit.set(res.data.meta.limit);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set(err?.error?.message ?? 'Failed to load loans');
        this._isLoading.set(false);
      },
    });
  }

  fetchMetrics(): void {
    this._metricsLoading.set(true);
    this._metricsError.set(null);

    this.loanService.getLoanMetrics().subscribe({
      next: (res) => {
        this._metrics.set(res.data);
        this._metricsLoading.set(false);
      },
      error: (err) => {
        this._metricsError.set(err?.error?.message ?? 'Failed to load loan metrics');
        this._metricsLoading.set(false);
      },
    });
  }

  fetchFailedDisbursements(params: FailedDisbursementListParams = {}): void {
    this._failedDisbursementsLoading.set(true);
    this._failedDisbursementsError.set(null);

    this.loanService.getFailedDisbursements(params).subscribe({
      next: (res) => {
        this._failedDisbursements.set(res.data.data);
        this._failedDisbursementsTotal.set(res.data.meta.total);
        this._failedDisbursementsPage.set(res.data.meta.page);
        this._failedDisbursementsLimit.set(res.data.meta.limit);
        this._failedDisbursementsLoading.set(false);
      },
      error: (err) => {
        this._failedDisbursementsError.set(err?.error?.message ?? 'Failed to load failed disbursements');
        this._failedDisbursementsLoading.set(false);
      },
    });
  }

fetchLoanDetail(id: string): void {
  this._loanDetailLoading.set(true);
  this._loanDetailError.set(null);
  this._loanDetail.set(null);           

  this.loanService.getLoanById(id).subscribe({
    next: (res) => {
      this._loanDetail.set(res.data);
      this._loanDetailLoading.set(false);
    },
    error: (err) => {
      this._loanDetailError.set(err?.error?.message ?? 'Failed to load loan');
      this._loanDetailLoading.set(false);
    },
  });
}

  exportLoans(): void {
    this._isExporting.set(true);
    this._exportError.set(null);

    // Only forward the params the export endpoint actually supports.
    const { search, status, start_date, end_date } = this._lastParams();

    this.loanService.getLoanExport({ search, status, start_date, end_date }).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this._isExporting.set(false);
        const blob = response.body as Blob;
        const filename =
          extractFilename(response.headers.get('content-disposition')) ??
          `loan_applications_${new Date().toISOString().slice(0, 10)}.csv`;
        downloadBlob(blob, filename);
      },
      error: (err: any) => {
        this._isExporting.set(false);
        const fallback = 'Failed to export loan applications.';

        if (err?.error instanceof Blob) {
          err.error.text().then((text: string) => {
            let message = fallback;
            try {
              message = JSON.parse(text)?.message ?? fallback;
            } catch {
              /* not JSON, use fallback */
            }
            this._exportError.set(message);
          });
        } else {
          this._exportError.set(err?.error?.message ?? fallback);
        }
      },
    });
  }


  setFailedDisbursementsSearch(query: string): void {
    this.fetchFailedDisbursements({ page: 1, limit: this._failedDisbursementsLimit(), search: query });
  }

  setFailedDisbursementsStatus(status: string): void {
    this.fetchFailedDisbursements({ page: 1, limit: this._failedDisbursementsLimit(), status: status || undefined });
  }

  setFailedDisbursementsPage(page: number): void { this.fetchFailedDisbursements({ page, limit: this._failedDisbursementsLimit() }); }
  setFailedDisbursementsPageSize(limit: number): void { this.fetchFailedDisbursements({ page: 1, limit }); }

  fetchRepaymentsDueToday(params: RepaymentDueListParams = {}): void {
    this._repaymentsDueLoading.set(true);
    this._repaymentsDueError.set(null);

    this.loanService.getRepaymentsDueToday(params).subscribe({
      next: (res) => {
        this._repaymentsDue.set(res.data.data);
        this._repaymentsDueTotal.set(res.data.meta.total);
        this._repaymentsDuePage.set(res.data.meta.page);
        this._repaymentsDueLimit.set(res.data.meta.limit);
        this._repaymentsDueLoading.set(false);
      },
      error: (err) => {
        this._repaymentsDueError.set(err?.error?.message ?? 'Failed to load repayments due today');
        this._repaymentsDueLoading.set(false);
      },
    });
  }

  setRepaymentsDueSearch(query: string): void {
    this.fetchRepaymentsDueToday({ page: 1, limit: this._repaymentsDueLimit(), search: query });
  }

  setRepaymentsDueStatus(status: string): void {
    this.fetchRepaymentsDueToday({ page: 1, limit: this._repaymentsDueLimit(), status: status || undefined });
  }

  setRepaymentsDuePage(page: number): void { this.fetchRepaymentsDueToday({ page, limit: this._repaymentsDueLimit() }); }
  setRepaymentsDuePageSize(limit: number): void { this.fetchRepaymentsDueToday({ page: 1, limit }); }

  setSearch(query: string): void {
    this._search.set(query);
    this.fetchLoans({ page: 1, limit: this._limit(), search: query });
  }

  setTimeframe(range: LoanDateRange): void {
    this._range.set(range);
    this.fetchLoans({ page: 1, limit: this._limit(), custom_range: range });
  }

  setStatus(status: string): void {
    this._status.set(status);
    this.fetchLoans({ page: 1, limit: this._limit(), status: status || undefined });
  }

  setTenor(tenor: string): void {
    this._tenor.set(tenor);
    this.fetchLoans({ page: 1, limit: this._limit(), tenor: tenor || undefined });
  }

  setProduct(product: string): void {
    this._product.set(product);
    this.fetchLoans({ page: 1, limit: this._limit(), product: product || undefined });
  }

  setAmountRange(minAmount: number | null, maxAmount: number | null): void {
    this._minAmount.set(minAmount);
    this._maxAmount.set(maxAmount);
    this.fetchLoans({
      page: 1,
      limit: this._limit(),
      min_amount: minAmount ?? undefined,
      max_amount: maxAmount ?? undefined,
    });
  }

  setPage(page: number): void { this.fetchLoans({ page, limit: this._limit() }); }
  setPageSize(limit: number): void { this.fetchLoans({ page: 1, limit }); }
}