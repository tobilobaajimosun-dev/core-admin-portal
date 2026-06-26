import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap } from 'rxjs';
import { ActivityLogsService } from '@core/services/activity-logs.service';
import {
  ActivityLog,
  ActivityLogPagination,
  ListActivityLogsConfig,
} from '@core/interfaces/activity-logs.model';

interface ActivityLogsState {
  activityLogs: ActivityLog[];
  pagination:   ActivityLogPagination;
  isLoading:    boolean;
  listConfig:   ListActivityLogsConfig;
}

const initialState: ActivityLogsState = {
  activityLogs: [],
  pagination: {
    total:      0,
    page:       1,
    limit:      10,
    totalPages: 1,
  },
  isLoading:  false,
  listConfig: { page: 1, limit: 10 },
};

export const ActivityLogsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const service = inject(ActivityLogsService);

    const fetchActivityLogs = rxMethod<ListActivityLogsConfig>(
      pipe(
        switchMap((listConfig) => {
          patchState(store, { isLoading: true });
          return service.fetchActivityLogs(listConfig).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  activityLogs: response.data.items,
                  pagination:   response.data.pagination,
                  isLoading:    false,
                });
              },
              error: () => {
                patchState(store, { activityLogs: [], isLoading: false });
              },
            })
          );
        })
      )
    );

    const onPageChange = (page: number) => {
      const nextConfig = { ...store.listConfig(), page };
      patchState(store, { listConfig: nextConfig });
      fetchActivityLogs(nextConfig);
    };

    const onPageSizeChange = (limit: number) => {
      const nextConfig = { ...store.listConfig(), page: 1, limit };
      patchState(store, { listConfig: nextConfig });
      fetchActivityLogs(nextConfig);
    };

    const onSearch = (search: string) => {
      const nextConfig = { ...store.listConfig(), page: 1, search };
      patchState(store, { listConfig: nextConfig });
      fetchActivityLogs(nextConfig);
    };

    const onDateRangeChange = (start_date?: string, end_date?: string) => {
      const nextConfig = { ...store.listConfig(), page: 1, start_date, end_date };
      patchState(store, { listConfig: nextConfig });
      fetchActivityLogs(nextConfig);
    };

    return { fetchActivityLogs, onPageChange, onPageSizeChange, onSearch, onDateRangeChange };
  }),
  withComputed((store) => ({
    paginator: computed(() => {
      const limit = store.listConfig().limit ?? 10;
      return {
        show:            store.pagination.total() > limit,
        hasPreviousPage: store.pagination.page() > 1,
        hasNextPage:     store.pagination.page() < store.pagination.totalPages(),
      };
    }),
  }))
);