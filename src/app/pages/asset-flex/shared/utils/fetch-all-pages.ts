import { EMPTY, Observable, expand, reduce } from 'rxjs';
import { PaginatedResponse } from '@pages/asset-flex/shared/models/generic.model';

/**
 * Pages through every result for a single server-side-filtered request (e.g. one
 * status value) and flattens it into one array. Used for client-side multi-select
 * filtering: the Asset Flex admin API only accepts one `status` value per request,
 * so a multi-status filter fetches each status's full result set (still
 * server-filtered, just not server-paginated across the selection) and merges them.
 */
export function fetchAllPages<T>(
  fetchPage: (page: number) => Observable<PaginatedResponse<T>>,
): Observable<T[]> {
  return fetchPage(1).pipe(
    expand((res) =>
      res.data.pagination.page < res.data.pagination.totalPages
        ? fetchPage(res.data.pagination.page + 1)
        : EMPTY,
    ),
    reduce<PaginatedResponse<T>, T[]>((acc, res) => [...acc, ...res.data.data], []),
  );
}
