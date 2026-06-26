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
import {
  debounceTime,
  distinctUntilChanged,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { PermissionService } from '@core/services/permission.service';
import { GroupedPermissionItem, GroupedPermissions } from '@core/interfaces/permission.model';

import {
  CreatePermissionPayload,
  Permission,
  PermissionListConfig,
} from '@core/interfaces/permission.model';

type PermissionState = {
  permissions: Permission[];
  groupedPermissions: GroupedPermissions; 
  listConfig: PermissionListConfig;
  selectedPermission: Permission | null;
  isLoading: boolean;
  isLoadingGrouped: boolean;
  isSubmitting: boolean;
  error: string | null;
};

const initialPermissionState: PermissionState = {
  permissions: [],
  groupedPermissions: {},
   listConfig: {
    page: 1,
    limit: 10,
    search: '',
  },
  selectedPermission: null,
  isLoading: false,
  isLoadingGrouped: false,
  isSubmitting: false,
  error: null,
};

export const PermissionStore = signalStore(
  { providedIn: 'root' },
  withState<PermissionState>(initialPermissionState),

  withComputed((store) => ({
    totalPermissions: computed(() => store.permissions().length),
  })),

  withMethods((store, permissionService = inject(PermissionService)) => {

    const fetchAllPermissions = rxMethod<PermissionListConfig>(
      pipe(
        tap((config) =>
          patchState(store, { isLoading: true, error: null, listConfig: config })
        ),
        switchMap((config) =>
          permissionService.getAllPermissions(config).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  permissions: response.data ?? [],
                  isLoading: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load permissions.',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    );

    const fetchGroupedPermissions = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoadingGrouped: true, error: null })),
        switchMap(() =>
          permissionService.getGroupedPermissions().pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  groupedPermissions: response.data ?? null,
                  isLoadingGrouped: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load grouped permissions.',
                  isLoadingGrouped: false,
                });
              },
            })
          )
        )
      )
    );

    const selectPermission = (permission: Permission | null) =>
      patchState(store, { selectedPermission: permission });

    const clearError = () => patchState(store, { error: null });

    return {
      fetchAllPermissions,
      fetchGroupedPermissions,
      selectPermission,
      clearError,
    };
  })
);