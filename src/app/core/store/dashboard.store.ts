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
import { DashboardService } from '@core/services/dashboard.service';
import {
  CARD_DEFINITIONS,
  DailyPerformanceData,
  DailyPerformanceProduct,
  DashboardCardParams,
  DashboardCardsData,
  DashboardCustomRange,
  DashboardStatCard,
  RecentLoan,
  RecentLoansMeta,
  RecentLoansParams,
  Transaction,
  TransactionsMeta,
  TransactionsParams,
} from '@core/interfaces/dashboard.model';

// ─── State ────────────────────────────────────────────────────────────────────

type DashboardState = {
  // Stat cards
  cardsData:  Partial<DashboardCardsData>;
  listConfig: DashboardCardParams;
  isLoading:  boolean;
  error:      string | null;

  // Daily performance
  dailyPerformance:              DailyPerformanceData | null;
  isDailyPerformanceLoading:     boolean;
  dailyPerformanceError:         string | null;
  lastDailyPerformanceFetchedAt: string | null;

  // Recent loan applications
  recentLoans:          RecentLoan[];
  recentLoansMeta:      RecentLoansMeta | null;
  recentLoansConfig:    RecentLoansParams;
  isRecentLoansLoading: boolean;
  recentLoansError:     string | null;

  // Transaction history
  transactions:          Transaction[];
  transactionsMeta:      TransactionsMeta | null;
  transactionsConfig:    TransactionsParams;
  isTransactionsLoading: boolean;
  transactionsError:     string | null;
};

const initialDashboardState: DashboardState = {
  cardsData:  {},
  listConfig: {
    page:         1,
    limit:        10,
    custom_range: 'today',
  },
  isLoading: false,
  error:     null,

  dailyPerformance:              null,
  isDailyPerformanceLoading:     false,
  dailyPerformanceError:         null,
  lastDailyPerformanceFetchedAt: null,

  recentLoans:          [],
  recentLoansMeta:      null,
  recentLoansConfig:    { page: 1, limit: 10 },
  isRecentLoansLoading: false,
  recentLoansError:     null,

  transactions:          [],
  transactionsMeta:      null,
  transactionsConfig:    { page: 1, limit: 10 },
  isTransactionsLoading: false,
  transactionsError:     null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>(initialDashboardState),

  // ── Computed ────────────────────────────────────────────────────────────────
  withComputed((store) => ({

    activeRange: computed(() => store.listConfig().custom_range ?? 'today'),

    stats: computed<DashboardStatCard[]>(() => {
      const data = store.cardsData() as DashboardCardsData;

      return CARD_DEFINITIONS
        .map((def): DashboardStatCard | null => {
          const extracted = def.extract(data);
          if (extracted == null) return null;

          return {
            key:      def.key,
            label:    def.label,
            value:    extracted.value,
            trend:    extracted.trend,
            trendUp:  (extracted.trend ?? 0) >= 0,
            isAmount: def.isAmount,
          };
        })
        .filter((card): card is DashboardStatCard => card !== null);
    }),

    /** Product rows for the performance banner table. */
    productPerformance: computed<DailyPerformanceProduct[]>(() => {
      return store.dailyPerformance()?.data ?? [];
    }),

    /** Formatted timestamp of the last successful daily-performance fetch. */
    lastUpdated: computed<string>(() => {
      const ts = store.lastDailyPerformanceFetchedAt();
      if (!ts) return '—';
      return new Date(ts).toLocaleString('en-US', {
        month:   'short',
        day:     '2-digit',
        year:    'numeric',
        hour:    '2-digit',
        minute:  '2-digit',
        hour12:  true,
      });
    }),

    // ── Recent loans computed ─────────────────────────────────────────────────

    recentLoansTotalItems:   computed<number>(() => store.recentLoansMeta()?.total ?? 0),
    recentLoansCurrentPage:  computed<number>(() => store.recentLoansConfig().page ?? 1),
    recentLoansPageSize:     computed<number>(() => store.recentLoansConfig().limit ?? 10),

    // ── Transactions computed ─────────────────────────────────────────────────

    transactionsTotalItems:  computed<number>(() => store.transactionsMeta()?.total ?? 0),
    transactionsCurrentPage: computed<number>(() => store.transactionsConfig().page ?? 1),
    transactionsPageSize:    computed<number>(() => store.transactionsConfig().limit ?? 10),
  })),

  // ── Methods ─────────────────────────────────────────────────────────────────
  withMethods((store, dashboardService = inject(DashboardService)) => {

    // ── Stat cards ────────────────────────────────────────────────────────────

    const fetchDashboardCards = rxMethod<DashboardCardParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, { isLoading: true, error: null, listConfig: config })
        ),
        switchMap((config) =>
          dashboardService.getDashboardCards(config).pipe(
            tapResponse({
              next: (response) =>
                patchState(store, { cardsData: response.data, isLoading: false }),
              error: (err: any) =>
                patchState(store, {
                  error:     err?.error?.message ?? 'Failed to load dashboard cards.',
                  isLoading: false,
                }),
            })
          )
        )
      )
    );

    const setTimeframe = (custom_range: DashboardCustomRange): void => {
      fetchDashboardCards({
        ...store.listConfig(),
        custom_range,
        start_date: undefined,
        end_date:   undefined,
        page:       1,
      });
    };

    const setCustomDateRange = (start_date: string, end_date: string): void => {
      fetchDashboardCards({
        ...store.listConfig(),
        custom_range: 'custom',
        start_date,
        end_date,
        page: 1,
      });
    };

    const clearError = (): void => patchState(store, { error: null });

    // ── Daily performance ─────────────────────────────────────────────────────

    const fetchDailyPerformance = rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, {
            isDailyPerformanceLoading: true,
            dailyPerformanceError:     null,
          })
        ),
        switchMap(() =>
          dashboardService.getDailyPerformance().pipe(
            tapResponse({
              next: (response) =>
                patchState(store, {
                  dailyPerformance:              response.data,
                  isDailyPerformanceLoading:     false,
                  lastDailyPerformanceFetchedAt: new Date().toISOString(),
                }),
              error: (err: any) =>
                patchState(store, {
                  dailyPerformanceError:     err?.error?.message ?? 'Failed to load daily performance.',
                  isDailyPerformanceLoading: false,
                }),
            })
          )
        )
      )
    );

    const clearDailyPerformanceError = (): void =>
      patchState(store, { dailyPerformanceError: null });

    // ── Recent loan applications ──────────────────────────────────────────────

    const fetchRecentLoans = rxMethod<RecentLoansParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, {
            isRecentLoansLoading: true,
            recentLoansError:     null,
            recentLoansConfig:    config,
          })
        ),
        switchMap((config) =>
          dashboardService.getRecentLoanApplications(config).pipe(
            tapResponse({
              next: (response) =>
                patchState(store, {
                  recentLoans:          response.data?.data ?? [],
                  recentLoansMeta:      response.data?.meta ?? null,
                  isRecentLoansLoading: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  recentLoansError:     err?.error?.message ?? 'Failed to load recent loan applications.',
                  isRecentLoansLoading: false,
                }),
            })
          )
        )
      )
    );

    const setRecentLoansPage = (page: number): void => {
      fetchRecentLoans({ ...store.recentLoansConfig(), page });
    };

    const setRecentLoansPageSize = (limit: number): void => {
      fetchRecentLoans({ ...store.recentLoansConfig(), limit, page: 1 });
    };

    const setRecentLoansFilters = (filters: Partial<RecentLoansParams>): void => {
      fetchRecentLoans({ ...store.recentLoansConfig(), ...filters, page: 1 });
    };

    const clearRecentLoansError = (): void =>
      patchState(store, { recentLoansError: null });

    // ── Transaction history ───────────────────────────────────────────────────

    const fetchTransactions = rxMethod<TransactionsParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, {
            isTransactionsLoading: true,
            transactionsError:     null,
            transactionsConfig:    config,
          })
        ),
        switchMap((config) =>
          dashboardService.getTransactionHistories(config).pipe(
            tapResponse({
              next: (response) =>
                patchState(store, {
                  transactions:          response.data?.data ?? [],
                  transactionsMeta:      response.data?.meta ?? null,
                  isTransactionsLoading: false,
                }),
              error: (err: any) =>
                patchState(store, {
                  transactionsError:     err?.error?.message ?? 'Failed to load transaction history.',
                  isTransactionsLoading: false,
                }),
            })
          )
        )
      )
    );

    const setTransactionsPage = (page: number): void => {
      fetchTransactions({ ...store.transactionsConfig(), page });
    };

    const setTransactionsPageSize = (limit: number): void => {
      fetchTransactions({ ...store.transactionsConfig(), limit, page: 1 });
    };

    const setTransactionsFilters = (filters: Partial<TransactionsParams>): void => {
      fetchTransactions({ ...store.transactionsConfig(), ...filters, page: 1 });
    };

    const clearTransactionsError = (): void =>
      patchState(store, { transactionsError: null });

    return {
      // Stat cards
      fetchDashboardCards,
      setTimeframe,
      setCustomDateRange,
      clearError,
      // Daily performance
      fetchDailyPerformance,
      clearDailyPerformanceError,
      // Recent loans
      fetchRecentLoans,
      setRecentLoansPage,
      setRecentLoansPageSize,
      setRecentLoansFilters,
      clearRecentLoansError,
      // Transactions
      fetchTransactions,
      setTransactionsPage,
      setTransactionsPageSize,
      setTransactionsFilters,
      clearTransactionsError,
    };
  })
);