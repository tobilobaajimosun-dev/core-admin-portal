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
import { NotificationService } from '@core/services/notification.service';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { Observable } from 'rxjs'; 
import {
  NotificationDailyBreakdown,
  NotificationHistoryItemRaw,
  NotificationHistoryParams,
  NotificationMetricsCustomRange,
  NotificationMetricsData,
  NotificationMetricsParams,
  NotificationTemplateRaw,
  NotificationTemplateParams,
  NotificationTemplateUpsertPayload,
  NotificationSendResponse,
  NotificationSendPayload 

} from '@core/interfaces/notification.model';

// ─── State ────────────────────────────────────────────────────────────────────

type NotificationState = {
  metrics: NotificationMetricsData | null;
  metricsParams: NotificationMetricsParams;
  metricsActiveRange: NotificationMetricsCustomRange | null;
  isLoading: boolean;
  error: string | null;

  historyItems: NotificationHistoryItemRaw[];
  historyTotal: number;
  historyTotalPages: number;
  historyListConfig: NotificationHistoryParams;
  isLoadingHistory: boolean;
  historyError: string | null;

  templates: NotificationTemplateRaw[];
  templatesTotal: number;
  templatesTotalPages: number;
  templateListConfig: NotificationTemplateParams;
  isLoadingTemplates: boolean;
  templatesError: string | null;

  isSavingTemplate: boolean;
  saveTemplateError: string | null;
  
  isSendingNotification: boolean;
  sendNotificationError: string | null;

  isExportingHistory: boolean;
  exportHistoryError: string | null;
};

const initialNotificationState: NotificationState = {
  metrics: null,
  metricsParams: {},
  metricsActiveRange: null,
  isLoading: false,
  error: null,

  historyItems: [],
  historyTotal: 0,
  historyTotalPages: 0,
  historyListConfig: { page: 1, limit: 10 },
  isLoadingHistory: false,
  historyError: null,

  templates: [],
  templatesTotal: 0,
  templatesTotalPages: 0,
  templateListConfig: { page: 1, limit: 10, sortField: 'createdAt', sortOrder: 'DESC' },
  isLoadingTemplates: false,
  templatesError: null,

  isSavingTemplate: false,
  saveTemplateError: null,

 isSendingNotification: false,
 sendNotificationError: null,

 isExportingHistory: false,
 exportHistoryError: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the most recent day in the breakdown that actually has activity
 * (sent > 0), paired with the day immediately before it, so the trend isn't
 * skewed by trailing zero-activity days.
 */
function getTrendPair(
  breakdown: NotificationDailyBreakdown[]
): { current: NotificationDailyBreakdown; previous: NotificationDailyBreakdown | null } | null {
  const activeDays = breakdown.filter((d) => d.sent > 0);
  if (activeDays.length === 0) return null;

  const current = activeDays[activeDays.length - 1];
  const currentIndex = breakdown.findIndex((d) => d.date === current.date);
  const previous = currentIndex > 0 ? breakdown[currentIndex - 1] : null;

  return { current, previous };
}

function percentChange(current: number, previous: number): number | null {
  if (!previous) return null; // no baseline to compare against
  return Math.round(((current - previous) / previous) * 1000) / 10; // 1dp
}

/** Converts a preset timeframe into YYYY-MM-DD start/end strings for the API. */
function resolvePresetRange(
  range: Exclude<NotificationMetricsCustomRange, 'custom'>
): { start: string; end: string } {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date();

  switch (range) {
    case 'today':
      return { start: fmt(today), end: fmt(today) };
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { start: fmt(y), end: fmt(y) };
    }
    case 'past_7_days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start: fmt(start), end: fmt(today) };
    }
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: fmt(start), end: fmt(today) };
    }
  }
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

// ─── Store ────────────────────────────────────────────────────────────────────

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationState>(initialNotificationState),

  // ── Computed ──────────────────────────────────────────────────────────────
  withComputed((store) => ({
    hasMetrics: computed(() => store.metrics() !== null),

    dailyBreakdown: computed(() => store.metrics()?.dailyBreakdown ?? []),

    historyCurrentPage:  computed(() => store.historyListConfig().page ?? 1),
    historyCurrentLimit: computed(() => store.historyListConfig().limit ?? 10),

    templateCurrentPage:  computed(() => store.templateListConfig().page ?? 1),
    templateCurrentLimit: computed(() => store.templateListConfig().limit ?? 10),

    // Trend vs. the previous active day, per field. Null when there's no
    // usable baseline (e.g. previous day had 0 sent), so the component can
    // decide to hide the pill.
    sentTrend: computed(() => {
      const pair = getTrendPair(store.metrics()?.dailyBreakdown ?? []);
      if (!pair?.previous) return null;
      return percentChange(pair.current.sent, pair.previous.sent);
    }),
    deliveredTrend: computed(() => {
      const pair = getTrendPair(store.metrics()?.dailyBreakdown ?? []);
      if (!pair?.previous) return null;
      return percentChange(pair.current.delivered, pair.previous.delivered);
    }),
    failedTrend: computed(() => {
      const pair = getTrendPair(store.metrics()?.dailyBreakdown ?? []);
      if (!pair?.previous) return null;
      return percentChange(pair.current.failed, pair.previous.failed);
    }),
    rateTrend: computed(() => {
      const pair = getTrendPair(store.metrics()?.dailyBreakdown ?? []);
      if (!pair?.previous) return null;
      return percentChange(pair.current.rate, pair.previous.rate);
    }),
  })),

  // ── Methods ───────────────────────────────────────────────────────────────
  withMethods((store, notificationService = inject(NotificationService), toast = inject(PsToastService)) => {

    const fetchMetrics = rxMethod<NotificationMetricsParams>(
      pipe(
        distinctUntilChanged(),
        tap((params) =>
          patchState(store, { isLoading: true, error: null, metricsParams: params })
        ),
        switchMap((params) =>
          notificationService.getMetrics(params).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  metrics: response.data,
                  isLoading: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load notification metrics.',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    );

    const fetchHistory = rxMethod<NotificationHistoryParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, {
            isLoadingHistory: true,
            historyError: null,
            historyListConfig: config,
          })
        ),
        switchMap((config) =>
          notificationService.getHistory(config).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  historyItems: response.data.items,
                  historyTotal: response.data.total,
                  historyTotalPages: response.data.totalPages,
                  isLoadingHistory: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  historyError: err?.error?.message ?? 'Failed to load notification history.',
                  isLoadingHistory: false,
                });
              },
            })
          )
        )
      )
    );

    const fetchTemplates = rxMethod<NotificationTemplateParams>(
      pipe(
        distinctUntilChanged(),
        tap((config) =>
          patchState(store, {
            isLoadingTemplates: true,
            templatesError: null,
            templateListConfig: config,
          })
        ),
        switchMap((config) =>
          notificationService.getTemplates(config).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  templates: response.data.items,
                  templatesTotal: response.data.total,
                  templatesTotalPages: response.data.totalPages,
                  isLoadingTemplates: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  templatesError: err?.error?.message ?? 'Failed to load templates.',
                  isLoadingTemplates: false,
                });
              },
            })
          )
        )
      )
    );

const createTemplate = (payload: NotificationTemplateUpsertPayload) => {
  patchState(store, { isSavingTemplate: true, saveTemplateError: null });

  return notificationService.createTemplate(payload).pipe(
    tapResponse({
      next: (response) => {
        patchState(store, { isSavingTemplate: false });
        // Spread into a new object so distinctUntilChanged doesn't
        // treat this as a duplicate of the last fetch and skip it.
        fetchTemplates({ ...store.templateListConfig() });
        toast.success(response.message ?? 'Template saved successfully.');
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Failed to save template.';
        patchState(store, {
          isSavingTemplate: false,
          saveTemplateError: message,
        });
        toast.error(message);
      },
    })
  );
};

const sendNotification = (payload: NotificationSendPayload): Observable<NotificationSendResponse> => {
  patchState(store, { isSendingNotification: true, sendNotificationError: null });

  return notificationService.sendNotification(payload).pipe(
    tapResponse({
      next: (response) => {
        patchState(store, { isSendingNotification: false });
        toast.success(response.message ?? 'Notification sent successfully.');
      },
      error: (err: any) => {
        const message = err?.error?.message ?? 'Failed to send notification.';
        patchState(store, { isSendingNotification: false, sendNotificationError: message });
        toast.error(message);
      },
    })
  );
};

const exportHistory = () => {
  patchState(store, { isExportingHistory: true, exportHistoryError: null });

  // Export whatever the table is currently filtered/searched to —
  // page/limit aren't relevant here since export is the full result set.
  const { page, limit, ...filters } = store.historyListConfig();

  return notificationService.exportHistory(filters).pipe(
    tapResponse({
      next: (response) => {
        patchState(store, { isExportingHistory: false });
        const blob = response.body as Blob;
        const filename =
          extractFilename(response.headers.get('content-disposition')) ??
          `notification_history_${new Date().toISOString().slice(0, 10)}.csv`;
        downloadBlob(blob, filename);
      },
      error: (err: any) => {
        patchState(store, { isExportingHistory: false });
        const fallback = 'Failed to export notification history.';

        if (err?.error instanceof Blob) {
          // Blob responseType means error bodies come back as a Blob too —
          // read it to see if the server sent a JSON error message.
          err.error.text().then((text: string) => {
            let message = fallback;
            try {
              message = JSON.parse(text)?.message ?? fallback;
            } catch {
              /* not JSON, use fallback */
            }
            patchState(store, { exportHistoryError: message });
            toast.error(message);
          });
        } else {
          const message = err?.error?.message ?? fallback;
          patchState(store, { exportHistoryError: message });
          toast.error(message);
        }
      },
    })
  );
};
    const setDateRange = (startDate: string, endDate: string) => {
      fetchMetrics({ ...store.metricsParams(), startDate, endDate });
    };

    const clearDateRange = () => {
      patchState(store, { metricsActiveRange: null });
      fetchMetrics({});
    };

    const setMetricsTimeframe = (range: Exclude<NotificationMetricsCustomRange, 'custom'>) => {
      const { start, end } = resolvePresetRange(range);
      patchState(store, { metricsActiveRange: range });
      fetchMetrics({ startDate: start, endDate: end });
    };

    const setMetricsCustomRange = (startDate: string, endDate: string) => {
      patchState(store, { metricsActiveRange: 'custom' });
      fetchMetrics({ startDate, endDate });
    };

    const clearError = () => patchState(store, { error: null });

     const setHistoryPage = (page: number) => {
      fetchHistory({ ...store.historyListConfig(), page });
    };

    const setHistoryPageSize = (limit: number) => {
      fetchHistory({ ...store.historyListConfig(), limit, page: 1 });
    };

    const setHistorySearch = (search: string) => {
      fetchHistory({ ...store.historyListConfig(), search: search || undefined, page: 1 });
    };

   const setHistoryTypeFilter = (type: string) => {
      fetchHistory({
        page: 1,
        limit: store.historyCurrentLimit(),
        search: store.historyListConfig().search,
        type: type || undefined,
        channel: undefined,
        status: undefined,
      });
    };

    const setHistoryChannelFilter = (channel: string) => {
      fetchHistory({
        page: 1,
        limit: store.historyCurrentLimit(),
        search: store.historyListConfig().search,
        type: undefined,
        channel: channel || undefined,
        status: undefined,
      });
    };

    const setHistoryStatusFilter = (status: string) => {
      fetchHistory({
        page: 1,
        limit: store.historyCurrentLimit(),
        search: store.historyListConfig().search,
        type: undefined,
        channel: undefined,
        status: status || undefined,
      });
    };

    const setHistoryDateRange = (startDate: string, endDate: string) => {
      fetchHistory({ ...store.historyListConfig(), startDate, endDate, page: 1 });
    };

    const clearHistoryFilters = () => {
      fetchHistory({ page: 1, limit: store.historyCurrentLimit() });
    };

    const setTemplatePage = (page: number) => {
      fetchTemplates({ ...store.templateListConfig(), page });
    };

    const setTemplatePageSize = (limit: number) => {
      fetchTemplates({ ...store.templateListConfig(), limit, page: 1 });
    };

    const setTemplateSearch = (search: string) => {
      fetchTemplates({ ...store.templateListConfig(), search: search || undefined, page: 1 });
    };

     const setTemplateChannelFilter = (channel: string) => {
      fetchTemplates({
        page: 1,
        limit: store.templateCurrentLimit(),
        search: store.templateListConfig().search,
        channel: channel || undefined,
        startDate: undefined,
        endDate: undefined,
      });
    };

    const setTemplateDateRange = (startDate: string, endDate: string) => {
      fetchTemplates({
        page: 1,
        limit: store.templateCurrentLimit(),
        search: store.templateListConfig().search,
        channel: undefined,
        startDate,
        endDate,
      });
    };

    const clearTemplateFilters = () => {
      fetchTemplates({ page: 1, limit: store.templateCurrentLimit() });
    };

    return {
      fetchMetrics,
      setDateRange,
      clearDateRange,
      setMetricsTimeframe,
      setMetricsCustomRange,
      clearError,

      fetchHistory,
      setHistoryPage,
      setHistoryPageSize,
      setHistorySearch,
      setHistoryTypeFilter,
      setHistoryChannelFilter,
      setHistoryStatusFilter,
      setHistoryDateRange,
      clearHistoryFilters,

      fetchTemplates,
      setTemplatePage,
      setTemplatePageSize,
      setTemplateSearch,
      setTemplateChannelFilter,
      setTemplateDateRange,
      clearTemplateFilters,
      createTemplate,
      sendNotification,
      exportHistory
    };
  })
);