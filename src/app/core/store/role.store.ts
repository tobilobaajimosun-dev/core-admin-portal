import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
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
import { RoleService } from '@core/services/role.service';
import {
    CreateRolePayload,
    Role,
    RoleListConfig,
    RolePagination,
    UpdateRolePayload,
} from '@core/interfaces/role.model';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

type RoleState = {
    roles: Role[];
    rolesPagination: RolePagination;
    listConfig: RoleListConfig;
    selectedRole: Role | null;
    isLoading: boolean;
    isLoadingRole: boolean;

    isSubmitting: boolean;
    isDeleting: boolean;
    error: string | null;
};

const initialRoleState: RoleState = {
    roles: [],
    rolesPagination: {
        total: 0,
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
    },
    listConfig: {
        page: 1,
        limit: 10,
        search: '',
    },
    selectedRole: null,
    isLoading: false,
    isLoadingRole: false,
    isSubmitting: false,
    isDeleting: false,
    error: null,
};

export const RoleStore = signalStore(
    { providedIn: 'root' },
    withState<RoleState>(initialRoleState),
    withComputed((store) => ({
        rolesPaginator: computed(() => ({
            show: store.rolesPagination().total > store.listConfig().limit,
            hasPreviousPage: store.rolesPagination().currentPage > 1,
            hasNextPage:
                store.rolesPagination().currentPage < store.rolesPagination().totalPages,
        })),
        totalRoles: computed(() => store.roles().length),
    })),

    withMethods((store, roleService = inject(RoleService), toast = inject(PsToastService)) => {

        const fetchAllRoles = rxMethod<RoleListConfig>(
            pipe(
                tap((config) =>
                    patchState(store, { isLoading: true, error: null, listConfig: config })
                ),
                switchMap((config) =>
                    roleService.getAllRoles(config).pipe(
                        tapResponse({
                            next: (response) => {
                                const { items, pagination } = response.data;
                                patchState(store, {
                                    roles: items ?? [],
                                    rolesPagination: pagination
                                        ? {
                                            total: pagination.total,
                                            currentPage: pagination.page,
                                            perPage: pagination.limit,
                                            totalPages: pagination.totalPages,
                                        }
                                        : initialRoleState.rolesPagination,
                                    isLoading: false,
                                });
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    error: err?.error?.message ?? 'Failed to load roles.',
                                    isLoading: false,
                                });
                            },
                        })
                    )
                )
            )
        );

        const fetchRoleById = rxMethod<string>(
            pipe(
                tap(() => patchState(store, { isLoadingRole: true, error: null, selectedRole: null })),
                switchMap((id) =>
                    roleService.getRoleById(id).pipe(
                        tapResponse({
                            next: (response) => {
                                patchState(store, {
                                    selectedRole: response.data,
                                    isLoadingRole: false,
                                });
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    error: err?.error?.message ?? 'Failed to load role.',
                                    isLoadingRole: false,
                                });
                            },
                        })
                    )
                )
            )
        );

        const searchRoles = rxMethod<RoleListConfig>(
            pipe(
                distinctUntilChanged(),
                debounceTime(500),
                tap((config) => fetchAllRoles(config))
            )
        );

        const createRole = rxMethod<CreateRolePayload>(
            pipe(
                tap(() => patchState(store, { isSubmitting: true, error: null })),
                switchMap((payload) =>
                    roleService.createRole(payload).pipe(
                        tapResponse({
                            next: (response) => {
                                patchState(store, {
                                    roles: [response.data, ...store.roles()],
                                    selectedRole: response.data,
                                    isSubmitting: false,
                                });
                                toast.success('Role created successfully.');
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    error: err?.error?.message ?? 'Failed to create role.',
                                    isSubmitting: false,
                                });
                                toast.error(err?.error?.message ?? 'Failed to create role.');
                            },
                        })
                    )
                )
            )
        );

        const updateRole = rxMethod<{ id: string; payload: UpdateRolePayload }>(
            pipe(
                tap(() => patchState(store, { isSubmitting: true, error: null })),
                switchMap(({ id, payload }) =>
                    roleService.updateRole(id, payload).pipe(
                        tapResponse({
                            next: () => {
                                fetchAllRoles(store.listConfig());
                                patchState(store, { isSubmitting: false });
                                toast.success('Role updated successfully.');
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    error: err?.error?.message ?? 'Failed to update role.',
                                    isSubmitting: false,
                                });
                                toast.error(err?.error?.message ?? 'Failed to update role.');
                            },
                        })
                    )
                )
            )
        );

        const deleteRole = rxMethod<string>(
            pipe(
                tap(() => patchState(store, { isDeleting: true, error: null })),
                switchMap((id) =>
                    roleService.deleteRole(id).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, {
                                    roles: store.roles().filter((role) => role.id !== id),
                                    selectedRole: null,
                                    isDeleting: false,
                                });
                                toast.success('Role deleted successfully.');
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    error: err?.error?.message ?? 'Failed to delete role.',
                                    isDeleting: false,
                                });
                                toast.error(err?.error?.message ?? 'Failed to delete role.');
                            },
                        })
                    )
                )
            )
        );

        const selectRole = (role: Role | null) =>
            patchState(store, { selectedRole: role });

        const clearError = () => patchState(store, { error: null });

        return {
            fetchAllRoles,
            searchRoles,
            createRole,
            fetchRoleById,
            updateRole,
            deleteRole,
            selectRole,
            clearError,
        };
    }),
);