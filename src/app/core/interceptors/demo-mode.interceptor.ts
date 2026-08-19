import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DemoModeService } from '@core/services/demo-mode.service';
import {
  DEMO_LOANS,
  DEMO_SETTLEMENTS,
  DEMO_CUSTOMERS,
  DEMO_PRODUCTS,
  findDemoLoan,
  findDemoSettlement,
  findDemoCustomer,
  findDemoProduct,
} from '@pages/asset-flex/demo/asset-flex-demo-data';
import { Loan } from '@pages/asset-flex/shared/models/loan.model';

/**
 * When demo mode is on, serves Asset Flex fixture data for endpoints the backend
 * hasn't populated (loans + settlements and their detail/actions). Everything
 * else falls through to the real API. Remove once those endpoints return data.
 */
function ok(body: unknown) {
  return of(new HttpResponse({ status: 200, body })).pipe(delay(180));
}

function paginate<T>(rows: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    message: 'OK',
    data: {
      data: rows.slice(start, start + limit),
      pagination: { total: rows.length, page, limit, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
    },
  };
}

export const demoModeInterceptor: HttpInterceptorFn = (req, next) => {
  const demo = inject(DemoModeService);
  if (!demo.enabled()) return next(req);

  const path = req.url.split('?')[0];
  const method = req.method.toUpperCase();

  // ── Loans ────────────────────────────────────────────────────────────────
  const loanStatusMatch = path.match(/\/api\/v1\/admin\/loans\/([^/]+)\/status$/);
  if (loanStatusMatch && method === 'PATCH') {
    const loan = findDemoLoan(loanStatusMatch[1]);
    const status = (req.body as { status?: Loan['status'] })?.status;
    return ok({ message: 'OK', data: loan ? { ...loan, status: status ?? loan.status } : null });
  }

  const loanDetailMatch = path.match(/\/api\/v1\/admin\/loans\/([^/]+)$/);
  if (loanDetailMatch && method === 'GET') {
    return ok({ message: 'OK', data: findDemoLoan(loanDetailMatch[1]) ?? null });
  }

  if (/\/api\/v1\/admin\/loans$/.test(path) && method === 'GET') {
    const statusParam = req.params.get('status');
    const search = (req.params.get('search') ?? '').toLowerCase();
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    const statuses = statusParam ? statusParam.split(',').filter(Boolean) : [];
    let rows = DEMO_LOANS;
    if (statuses.length) rows = rows.filter((l) => statuses.includes(l.status));
    if (search) rows = rows.filter((l) => l.loanReference.toLowerCase().includes(search));
    return ok(paginate(rows, page, limit));
  }

  // ── Loan products ──────────────────────────────────────────────────────────
  const productDetailMatch = path.match(/\/api\/v1\/loan-products\/([^/]+)$/);
  if (productDetailMatch && method === 'GET' && productDetailMatch[1] !== 'caltos-catalog') {
    return ok({ message: 'OK', data: findDemoProduct(productDetailMatch[1]) ?? null });
  }
  if (/\/api\/v1\/loan-products$/.test(path) && method === 'GET') {
    return ok({ message: 'OK', data: DEMO_PRODUCTS });
  }

  // ── Customers ──────────────────────────────────────────────────────────────
  const customerDetailMatch = path.match(/\/api\/v1\/admin\/customers\/([^/]+)$/);
  if (customerDetailMatch && method === 'GET' && !/customers$/.test(path)) {
    return ok({ message: 'OK', data: findDemoCustomer(customerDetailMatch[1]) ?? null });
  }

  if (/\/api\/v1\/admin\/customers$/.test(path) && method === 'GET') {
    const search = (req.params.get('search') ?? '').toLowerCase();
    const page = Number(req.params.get('page') ?? 1);
    const limit = Number(req.params.get('limit') ?? 20);
    let rows = DEMO_CUSTOMERS;
    if (search) {
      rows = rows.filter(
        (c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) || c.email.toLowerCase().includes(search),
      );
    }
    return ok(paginate(rows, page, limit));
  }

  // ── Settlements ────────────────────────────────────────────────────────────
  if (/\/api\/v1\/admin\/settlements\/mark-settled$/.test(path) && method === 'POST') {
    const ids = (req.body as { settlement_ids?: string[] })?.settlement_ids ?? [];
    const ref = (req.body as { batch_payout_reference?: string })?.batch_payout_reference ?? '';
    return ok({ message: 'OK', data: { settledCount: ids.length, batchPayoutReference: ref, settledAt: new Date().toISOString() } });
  }

  if (/\/api\/v1\/admin\/settlements\/trigger-t1-cutoff$/.test(path) && method === 'POST') {
    const due = DEMO_SETTLEMENTS.filter((s) => s.status !== 'SETTLED').length;
    return ok({ message: 'OK', data: { processedCount: due, statusTransitionedTo: 'DUE' } });
  }

  const settlementDetailMatch = path.match(/\/api\/v1\/admin\/settlements\/([^/]+)$/);
  if (settlementDetailMatch && method === 'GET' && !/settlements$/.test(path)) {
    return ok({ message: 'OK', data: findDemoSettlement(settlementDetailMatch[1]) ?? null });
  }

  if (/\/api\/v1\/admin\/settlements$/.test(path) && method === 'GET') {
    const statusParam = req.params.get('status');
    const rows = statusParam ? DEMO_SETTLEMENTS.filter((s) => s.status === statusParam) : DEMO_SETTLEMENTS;
    return ok({ message: 'OK', data: rows });
  }

  return next(req);
};
