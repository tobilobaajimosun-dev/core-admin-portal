import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { CustomerService } from '@core/services/customer.service';
import {
  CustomerCustomRange,
  CustomerListParams,
  CustomerRaw,
  CustomerDetailData,
  CustomerFinancialSummaryData,
  CustomerLoanListParams,
  CustomerLoanRaw,
  CustomerTransactionRaw,
  CustomerTransactionListParams,
  CustomerActivityRaw,
  CustomerActivityListParams,
  CustomerUpdatePayload,

} from '@core/interfaces/customer.model';

// ─── State ────────────────────────────────────────────────────────────────────

type CustomerState = {
  customers: CustomerRaw[];
  total: number;
  totalPages: number;
  listConfig: CustomerListParams;
  isLoading: boolean;
  error: string | null;
  selectedCustomer: CustomerDetailData | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  financialSummary: CustomerFinancialSummaryData | null;
  isLoadingFinancialSummary: boolean;
  financialSummaryError: string | null;

  customerLoans: CustomerLoanRaw[];
  customerLoansTotal: number;
  customerLoansTotalPages: number;
  loanListConfig: CustomerLoanListParams;
  isLoadingLoans: boolean;
  loansError: string | null;

  customerTransactions: CustomerTransactionRaw[];
  customerTransactionsTotal: number;
  customerTransactionsTotalPages: number;
  transactionListConfig: CustomerTransactionListParams;
  isLoadingTransactions: boolean;
  transactionsError: string | null;

  isSuspending: boolean;
  suspendError: string | null;

  customerActivity: CustomerActivityRaw[];
  customerActivityTotal: number;
  customerActivityTotalPages: number;
  activityListConfig: CustomerActivityListParams;
  isLoadingActivity: boolean;
  activityError: string | null;

  isExporting: boolean;
  exportError: string | null;

  isExportingLoans: boolean;
  exportLoansError: string | null;

  isExportingTransactions: boolean;
  exportTransactionsError: string | null;

  isExportingActivity: boolean;
  exportActivityError: string | null;

  isUpdatingCustomer: boolean;
  updateCustomerError: string | null;
};

const initialCustomerState: CustomerState = {
  customers: [],
  total: 0,
  totalPages: 0,
  listConfig: { page: 1, limit: 10 },
  isLoading: false,
  error: null,
  selectedCustomer: null,
  isLoadingDetail: false,
  detailError: null,

  financialSummary: null,
  isLoadingFinancialSummary: false,
  financialSummaryError: null,

  customerLoans: [],
  customerLoansTotal: 0,
  customerLoansTotalPages: 0,
  loanListConfig: { page: 1, limit: 10 },
  isLoadingLoans: false,
  loansError: null,

  customerTransactions: [],
  customerTransactionsTotal: 0,
  customerTransactionsTotalPages: 0,
  transactionListConfig: { page: 1, limit: 10 },
  isLoadingTransactions: false,
  transactionsError: null,

  isSuspending: false,
  suspendError: null,

  customerActivity: [],
  customerActivityTotal: 0,
  customerActivityTotalPages: 0,
  activityListConfig: { page: 1, limit: 10 },
  isLoadingActivity: false,
  activityError: null,

  isExporting: false,
  exportError: null,

  isExportingLoans: false,
  exportLoansError: null,

  isExportingTransactions: false,
  exportTransactionsError: null,

  isExportingActivity: false,
  exportActivityError: null,

  isUpdatingCustomer: false,
  updateCustomerError: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withState<CustomerState>(initialCustomerState),

  // ── Computed ──────────────────────────────────────────────────────────────
  withComputed((store) => ({
    currentPage: computed(() => store.listConfig().page ?? 1),
    currentLimit: computed(() => store.listConfig().limit ?? 10),
    activeRange: computed(() => store.listConfig().custom_range ?? null),
    hasCustomers: computed(() => store.customers().length > 0),
  })),

  // ── Methods ───────────────────────────────────────────────────────────────
  withMethods((store, customerService = inject(CustomerService)) => {

    const fetchCustomers = rxMethod<CustomerListParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, { isLoading: true, error: null, listConfig: config })
        ),
        switchMap((config) =>
          customerService.getCustomers(config).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  customers: response.data.data,
                  total: response.data.meta.total,
                  totalPages: response.data.meta.totalPages,
                  isLoading: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load customers.',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    );

    const fetchCustomerById = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoadingDetail: true, detailError: null })),
        switchMap((id) =>
          customerService.getCustomerById(id).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  selectedCustomer: res.data,
                  isLoadingDetail: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  detailError: err?.error?.message ?? 'Failed to load customer.',
                  isLoadingDetail: false,
                }),
            })
          )
        )
      )
    );

    const fetchCustomerLoans = rxMethod<{ customerId: string; params: CustomerLoanListParams }>(
      pipe(
        distinctUntilChanged(),
        tap(({ params }) =>
          patchState(store, {
            isLoadingLoans: true,
            loansError: null,
            loanListConfig: params,
          })
        ),
        switchMap(({ customerId, params }) =>
          customerService.getCustomerLoans(customerId, params).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  customerLoans: res.data.data,
                  customerLoansTotal: res.data.meta.total,
                  customerLoansTotalPages: res.data.meta.totalPages,
                  isLoadingLoans: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  loansError: err?.error?.message ?? 'Failed to load loans.',
                  isLoadingLoans: false,
                }),
            })
          )
        )
      )
    );

    const fetchFinancialSummary = rxMethod<string>(
      pipe(
        distinctUntilChanged(),
        tap(() =>
          patchState(store, {
            isLoadingFinancialSummary: true,
            financialSummaryError: null,
          })
        ),
        switchMap((customerId) =>
          customerService.getFinancialSummary(customerId).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  financialSummary: res.data,
                  isLoadingFinancialSummary: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  financialSummaryError: err?.error?.message ?? 'Failed to load financial summary.',
                  isLoadingFinancialSummary: false,
                }),
            })
          )
        )
      )
    );

    const fetchCustomerTransactions = rxMethod<{ customerId: string; params: CustomerTransactionListParams }>(
      pipe(
        distinctUntilChanged(),
        tap(({ params }) =>
          patchState(store, {
            isLoadingTransactions: true,
            transactionsError: null,
            transactionListConfig: params,
          })
        ),
        switchMap(({ customerId, params }) =>
          customerService.getCustomerTransactions(customerId, params).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  customerTransactions: res.data.data,
                  customerTransactionsTotal: res.data.meta.total,
                  customerTransactionsTotalPages: res.data.meta.totalPages,
                  isLoadingTransactions: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  transactionsError: err?.error?.message ?? 'Failed to load transactions.',
                  isLoadingTransactions: false,
                }),
            })
          )
        )
      )
    );

    const updateCustomer = rxMethod<{ customerId: string; payload: CustomerUpdatePayload }>(
      pipe(
        tap(() => patchState(store, { isUpdatingCustomer: true, updateCustomerError: null })),
        switchMap(({ customerId, payload }) =>
          customerService.updateCustomer(customerId, payload).pipe(
            tapResponse({
              next: () => {
                const current = store.selectedCustomer();
                patchState(store, {
                  isUpdatingCustomer: false,
                  selectedCustomer: current
                    ? { ...current, customer: { ...current.customer, ...payload } }
                    : current,
                  customers: store.customers().map((c) =>
                    c.id === customerId ? { ...c, ...payload } : c
                  ),
                });
              },
              error: (err: any) => {
                patchState(store, {
                  updateCustomerError: err?.error?.message ?? 'Failed to update customer.',
                  isUpdatingCustomer: false,
                });
              },
            })
          )
        )
      )
    );

    const exportCustomers = (params?: CustomerListParams) => {
      patchState(store, { isExporting: true, exportError: null });

      customerService.exportCustomers(params ?? store.listConfig()).subscribe({
        next: (response) => {
          const blob = response.body;
          if (!blob) {
            patchState(store, { isExporting: false, exportError: 'Export failed: empty response.' });
            return;
          }

          const disposition = response.headers.get('content-disposition');
          const match = disposition?.match(/filename="?([^"]+)"?/);
          const filename = match?.[1] ?? `customers_export_${Date.now()}.csv`;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          patchState(store, { isExporting: false });
        },
        error: (err: any) => {
          patchState(store, {
            isExporting: false,
            exportError: err?.error?.message ?? 'Failed to export customers.',
          });
        },
      });
    };

    /**
     * Exports the customer's loan list as a CSV, using the currently active
     * loan filters (search/status/date range) unless overrides are passed in.
     * Pagination is intentionally dropped — export always returns the full
     * filtered set, not just the current page.
     */
    const exportCustomerLoans = (customerId: string, params?: CustomerLoanListParams) => {
      patchState(store, { isExportingLoans: true, exportLoansError: null });

      const { page, limit, ...filters } = params ?? store.loanListConfig();

      customerService.exportCustomerLoans(customerId, { ...filters, export: true }).subscribe({
        next: (response) => {
          const blob = response.body;
          if (!blob) {
            patchState(store, { isExportingLoans: false, exportLoansError: 'Export failed: empty response.' });
            return;
          }

          const disposition = response.headers.get('content-disposition');
          const match = disposition?.match(/filename="?([^"]+)"?/);
          const filename = match?.[1] ?? `customer_loans_export_${Date.now()}.csv`;

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          patchState(store, { isExportingLoans: false });
        },
        error: (err: any) => {
          patchState(store, {
            isExportingLoans: false,
            exportLoansError: err?.error?.message ?? 'Failed to export loans.',
          });
        },
      });
    };

    /**
 * Exports the customer's activity log as a CSV, using currently active
 * filters (search/module/date range) unless overrides are passed.
 * Pagination is dropped — export returns the full filtered set.
 */
const exportCustomerActivity = (customerId: string, params?: CustomerActivityListParams) => {
  patchState(store, { isExportingActivity: true, exportActivityError: null });

  const { page, limit, ...filters } = params ?? store.activityListConfig();

  customerService.exportCustomerActivity(customerId, { ...filters, export: true }).subscribe({
    next: (response) => {
      const blob = response.body;
      if (!blob) {
        patchState(store, { isExportingActivity: false, exportActivityError: 'Export failed: empty response.' });
        return;
      }

      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `customer_activity_export_${Date.now()}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      patchState(store, { isExportingActivity: false });
    },
    error: (err: any) => {
      patchState(store, {
        isExportingActivity: false,
        exportActivityError: err?.error?.message ?? 'Failed to export activity.',
      });
    },
  });
};

    const exportCustomerTransactions = (customerId: string, params?: CustomerTransactionListParams) => {
  patchState(store, { isExportingTransactions: true, exportTransactionsError: null });

  const { page, limit, ...filters } = params ?? store.transactionListConfig();

  customerService.exportCustomerTransactions(customerId, { ...filters, export: true }).subscribe({
    next: (response) => {
      const blob = response.body;
      if (!blob) {
        patchState(store, { isExportingTransactions: false, exportTransactionsError: 'Export failed: empty response.' });
        return;
      }

      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `customer_transactions_export_${Date.now()}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      patchState(store, { isExportingTransactions: false });
    },
    error: (err: any) => {
      patchState(store, {
        isExportingTransactions: false,
        exportTransactionsError: err?.error?.message ?? 'Failed to export transactions.',
      });
    },
  });
};

    const toggleCustomerSuspension = (
      customerId: string,
      reason: string,
      onSuccess?: (isSuspended: boolean) => void,
      onError?: (message: string) => void
    ) => {
      patchState(store, { isSuspending: true, suspendError: null });

      customerService.toggleCustomerSuspension(customerId, { reason }).subscribe({
        next: (res) => {
          const { is_suspended } = res.data;

          patchState(store, {
            isSuspending: false,
            // Best-effort optimistic update for the list view, if it carries this field.
            customers: store.customers().map((c) =>
              c.id === customerId ? { ...c, is_suspended } : c
            ),
          });

          // The button relies on `auth_user.is_suspended`, which only comes back
          // from the full customer-detail endpoint — re-fetch it so the banner
          // reflects the true post-toggle state rather than a manual patch.
          fetchCustomerById(customerId);

          onSuccess?.(is_suspended);
        },
        error: (err: any) => {
          const message = err?.error?.message ?? 'Failed to update suspension status.';
          patchState(store, { isSuspending: false, suspendError: message });
          onError?.(message);
        },
      });
    };

    const performNeedsActionResolution = (
      customerId: string,
      onSuccess?: (message: string) => void,
      onError?: (message: string) => void
    ) => {
      customerService.performNeedsActionResolution(customerId).subscribe({
        next: (res) => onSuccess?.(res.message),
        error: (err: any) => {
          const message = err?.error?.message ?? 'Failed to complete action.';
          onError?.(message);
        },
      });
    };

    const fetchCustomerActivity = rxMethod<{ customerId: string; params: CustomerActivityListParams }>(
      pipe(
        distinctUntilChanged(),
        tap(({ params }) =>
          patchState(store, {
            isLoadingActivity: true,
            activityError: null,
            activityListConfig: params,
          })
        ),
        switchMap(({ customerId, params }) =>
          customerService.getCustomerRecentActivity(customerId, params).pipe(
            tapResponse({
              next: (res) =>
                patchState(store, {
                  customerActivity: res.data.data,
                  customerActivityTotal: res.data.meta.total,
                  customerActivityTotalPages: res.data.meta.totalPages,
                  isLoadingActivity: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  activityError: err?.error?.message ?? 'Failed to load activity.',
                  isLoadingActivity: false,
                }),
            })
          )
        )
      )
    );
    const patchSelectedCustomer = (patch: Partial<CustomerRaw>) => {
      const current = store.selectedCustomer();
      if (!current) return;
      patchState(store, {
        selectedCustomer: {
          ...current,
          customer: { ...current.customer, ...patch },
        },
      });
    };

    const setPage = (page: number) => {
      fetchCustomers({ ...store.listConfig(), page });
    };

    const setPageSize = (limit: number) => {
      fetchCustomers({ ...store.listConfig(), limit, page: 1 });
    };

    const setSearch = (search: string) => {
      fetchCustomers({ ...store.listConfig(), search: search || undefined, page: 1 });
    };

    const setKycFilter = (kyc_status: string) => {
      fetchCustomers({ ...store.listConfig(), kyc_status: kyc_status || undefined, page: 1 });
    };

    const setLoanFilter = (loan_status: string) => {
      fetchCustomers({ ...store.listConfig(), loan_status: loan_status || undefined, page: 1 });
    };

    const setTimeframe = (custom_range: CustomerCustomRange) => {
      fetchCustomers({
        ...store.listConfig(),
        custom_range,
        start_date: undefined,
        end_date: undefined,
        page: 1,
      });
    };

    const setCustomDateRange = (start_date: string, end_date: string) => {
      fetchCustomers({
        ...store.listConfig(),
        custom_range: 'custom',
        start_date,
        end_date,
        page: 1,
      });
    };

    const setLoanPage = (customerId: string, page: number) => {
      fetchCustomerLoans({ customerId, params: { ...store.loanListConfig(), page } });
    };

    const setLoanPageSize = (customerId: string, limit: number) => {
      fetchCustomerLoans({ customerId, params: { ...store.loanListConfig(), limit, page: 1 } });
    };

    const setLoanSearch = (customerId: string, search: string) => {
      fetchCustomerLoans({ customerId, params: { ...store.loanListConfig(), search: search || undefined, page: 1 } });
    };

    const setLoanStatusFilter = (customerId: string, status: string) => {
      fetchCustomerLoans({ customerId, params: { ...store.loanListConfig(), status: status || undefined, page: 1 } });
    };

    const setLoanDateRange = (customerId: string, start_date: string, end_date: string) => {
      fetchCustomerLoans({ customerId, params: { ...store.loanListConfig(), start_date, end_date, page: 1 } });
    };

    const setTransactionPage = (customerId: string, page: number) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), page } });
    };

    const setTransactionPageSize = (customerId: string, limit: number) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), limit, page: 1 } });
    };

    const setTransactionSearch = (customerId: string, search: string) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), search: search || undefined, page: 1 } });
    };

    const setTransactionStatusFilter = (customerId: string, status: string) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), status: status || undefined, page: 1 } });
    };

    const setTransactionTypeFilter = (customerId: string, type: string) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), type: type || undefined, page: 1 } });
    };

    const setTransactionDateRange = (customerId: string, start_date: string, end_date: string) => {
      fetchCustomerTransactions({ customerId, params: { ...store.transactionListConfig(), start_date, end_date, page: 1 } });
    };
    const clearError = () => patchState(store, { error: null });


    const setActivityPage = (customerId: string, page: number) => {
      fetchCustomerActivity({ customerId, params: { ...store.activityListConfig(), page } });
    };

    const setActivityPageSize = (customerId: string, limit: number) => {
      fetchCustomerActivity({ customerId, params: { ...store.activityListConfig(), limit, page: 1 } });
    };

    const setActivitySearch = (customerId: string, search: string) => {
      fetchCustomerActivity({ customerId, params: { ...store.activityListConfig(), search: search || undefined, page: 1 } });
    };

    const setActivityModuleFilter = (customerId: string, module: string) => {
      fetchCustomerActivity({ customerId, params: { ...store.activityListConfig(), module: module || undefined, page: 1 } });
    };

    return {
      fetchCustomers,
      fetchCustomerById,
      fetchFinancialSummary,
      patchSelectedCustomer,
      setPage,
      setPageSize,
      setSearch,
      setKycFilter,
      setLoanFilter,
      setTimeframe,
      setCustomDateRange,
      clearError,
      fetchCustomerLoans,
      setLoanPage,
      setLoanPageSize,
      setLoanSearch,
      setLoanStatusFilter,
      setLoanDateRange,
      exportCustomerLoans,
      fetchCustomerTransactions,
      setTransactionPage,
      setTransactionPageSize,
      setTransactionSearch,
      setTransactionStatusFilter,
      setTransactionTypeFilter,
      setTransactionDateRange,
      exportCustomerTransactions,
      toggleCustomerSuspension,
      fetchCustomerActivity,
      setActivityPage,
      setActivityPageSize,
      setActivitySearch,
      setActivityModuleFilter,
      exportCustomerActivity,
      exportCustomers,
      updateCustomer,
      performNeedsActionResolution,
    };
  })
);