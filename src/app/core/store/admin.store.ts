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
import { AdminService } from '@core/services/admin.service';
import {
  Admin,
  AdminListParams,
  AdminPagination,
  CreateAdminPayload,
  UpdateAdminPayload,
} from '@core/interfaces/admin.model';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

// ─── State ────

type AdminState = {
  admins: Admin[];
  adminsPagination: AdminPagination;
  listConfig: AdminListParams;
  selectedAdmin: Admin | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isLoadingAdmin: boolean;
  isDeleting: boolean;
  error: string | null;
};

const initialAdminState: AdminState = {
  admins: [],
  adminsPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  listConfig: {
    page: 1,
    limit: 10,
    search: '',
  },
  selectedAdmin: null,
  isLoading: false,
  isSubmitting: false,
  isLoadingAdmin: false,
  isDeleting: false,
  error: null,
};

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState<AdminState>(initialAdminState),

withComputed((store) => ({
  adminsPaginator: computed(() => {
    const pagination = store.adminsPagination();
    const config = store.listConfig();

    return {
      show: pagination.total > (config.limit ?? 10),
      hasPreviousPage: pagination.page > 1,
      hasNextPage: pagination.page < pagination.totalPages,
    };
  }),

  totalAdmins: computed(() => store.admins()?.length ?? 0),

  activeAdmins: computed(() =>
    (store.admins() ?? []).filter(admin => admin.is_active)
  ),
})),


withMethods((store, adminService = inject(AdminService), toast = inject(PsToastService)) => {
    const fetchAllAdmins = rxMethod<AdminListParams>(
      pipe(
        tap((config) =>
          patchState(store, { isLoading: true, error: null, listConfig: config })
        ),
        switchMap((config) =>
          adminService.getAllAdmins(config).pipe(
            tapResponse({
              next: (response) => {
                const { items, pagination } = response.data;
                patchState(store, {
                  admins: items ?? [],
                  adminsPagination: pagination
                    ? {
                      total: pagination.total,
                      page: pagination.page,
                      limit: pagination.limit,
                      totalPages: pagination.totalPages,
                    }
                    : initialAdminState.adminsPagination,
                  isLoading: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load admins.',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    );

    const fetchAdminById = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoadingAdmin: true, error: null })),
        switchMap((id) =>
          adminService.getAdminById(id).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  selectedAdmin: response.data,
                  isLoadingAdmin: false,
                });
              },
              error: (err: any) => {
                patchState(store, {
                  error: err?.error?.message ?? 'Failed to load admin.',
                  isLoadingAdmin: false,
                });
              },
            })
          )
        )
      )
    );

 const searchAdmins = rxMethod<AdminListParams>(
      pipe(
        distinctUntilChanged(),
        debounceTime(500),
        tap((config) => fetchAllAdmins(config))
      )
    );

const createAdmin = rxMethod<CreateAdminPayload>(
  pipe(
    tap(() => patchState(store, { isSubmitting: true, error: null })),
    switchMap((payload) =>
      adminService.createAdmin(payload).pipe(
        tapResponse({
          next: (response) => {
            patchState(store, {
              admins: [response.data, ...store.admins()],
              selectedAdmin: response.data,
              isSubmitting: false,
            });
            toast.success('Admin created successfully.');
          },
          error: (err: any) => {
            patchState(store, {
              error: err?.error?.message ?? 'Failed to create admin.',
              isSubmitting: false,
            });
            toast.error(err?.error?.message ?? 'Failed to create admin.');
          },
        })
      )
    )
  )
);

const updateAdmin = rxMethod<{ id: string; payload: UpdateAdminPayload }>(
  pipe(
    tap(() => patchState(store, { isSubmitting: true, error: null })),
    switchMap(({ id, payload }) =>
      adminService.updateAdmin(id, payload).pipe(
        tapResponse({
          next: (response) => {
            const updated = response.data;
            patchState(store, {
              admins: store.admins().map((admin) => (admin.id === id ? { ...admin, ...updated } : admin)),
              selectedAdmin: { ...store.selectedAdmin()!, ...updated },
              isSubmitting: false,
            });
            toast.success('Admin updated successfully.');
          },
          error: (err: any) => {
            patchState(store, {
              error: err?.error?.message ?? 'Failed to update admin.',
              isSubmitting: false,
            });
            toast.error(err?.error?.message ?? 'Failed to update admin.');
          },
        })
      )
    )
  )
);

const deleteAdmin = rxMethod<string>(
  pipe(
    tap(() => patchState(store, { isDeleting: true, error: null })),
    switchMap((id) =>
      adminService.deleteAdmin(id).pipe(
        tapResponse({
          next: () => {
            patchState(store, {
              admins: store.admins().filter((admin) => admin.id !== id),
              selectedAdmin: null,
              isDeleting: false,
            });
            toast.success('Admin deleted successfully.');
          },
          error: (err: any) => {
            patchState(store, {
              error: err?.error?.message ?? 'Failed to delete admin.',
              isDeleting: false,
            });
            toast.error(err?.error?.message ?? 'Failed to delete admin.');
          },
        })
      )
    )
  )
);

    const selectAdmin = (admin: Admin) =>
      patchState(store, { selectedAdmin: admin });

    const clearError = () => patchState(store, { error: null });

    return {
      fetchAllAdmins,
      fetchAdminById,
      searchAdmins,
      createAdmin,
      updateAdmin,
      deleteAdmin,
      selectAdmin,
      clearError,
    };
  })
);