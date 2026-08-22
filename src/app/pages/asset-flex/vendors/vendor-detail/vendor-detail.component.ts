import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { minTrimmedLength } from '../../shared/utils/validators';
import { RouterLink } from '@angular/router';

import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon, File01Icon } from '@hugeicons-pro/core-stroke-rounded';
import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';

import { VendorService } from '../../shared/services/vendor.service';
import { LoanProductService } from '../../shared/services/loan-product.service';
import { LoanService } from '../../shared/services/loan.service';
import { LoanProduct } from '../../shared/models/loan-product.model';
import { Loan } from '../../shared/models/loan.model';
import { Vendor, VendorDocument, VendorStatus } from '../../shared/models/vendor.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CategoryChipComponent } from '../../shared/components/category-chip/category-chip.component';
import { NairaPipe } from '../../shared/pipes/naira.pipe';
import { statusTone } from '../../shared/utils/status-tone';
import { fetchAllPages } from '@pages/asset-flex/shared/utils/fetch-all-pages';
import { ModalShellComponent } from '@pages/asset-flex/shared/components/modal-shell/modal-shell.component';
import { ErrorStateComponent } from '@pages/asset-flex/shared/components/error-state/error-state.component';
import { DetailSkeletonComponent } from '@pages/asset-flex/shared/components/detail-skeleton/detail-skeleton.component';

type DialogType = 'approve' | 'reject' | 'blacklist' | 'suspend' | 'activate';

@Component({
  selector: 'app-vendor-detail',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    HugeiconsIconComponent,
    StatusBadgeComponent,
    CategoryChipComponent,
    NairaPipe,
    ModalShellComponent,
    ErrorStateComponent,
    DetailSkeletonComponent,
  ],
  templateUrl: './vendor-detail.component.html',
  styleUrl: './vendor-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorDetailComponent {
  private readonly vendorService = inject(VendorService);
  private readonly loanProductService = inject(LoanProductService);
  private readonly loanService = inject(LoanService);
  private readonly toast = inject(PsToastService);

  protected readonly loans = signal<Loan[]>([]);
  protected readonly loansDisbursed = computed(() =>
    this.loans().reduce((s, l) => s + Number(l.amountDisbursed || l.principalAmount || 0), 0),
  );

  /** Bound from the :id route param via withComponentInputBinding. */
  readonly id = input<string>('');

  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly fileIcon = File01Icon;
  protected readonly statusTone = statusTone;

  protected readonly vendor = signal<Vendor | null>(null);
  protected readonly documents = signal<VendorDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly acting = signal(false);
  protected readonly dialog = signal<DialogType | null>(null);
  protected readonly rejectReason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, minTrimmedLength(5)],
  });

  protected readonly isPending = computed(() => this.vendor()?.status === 'PENDING_APPROVAL');
  protected readonly isBlacklisted = computed(() => this.vendor()?.status === 'BLACKLISTED');
  protected readonly isSuspended = computed(() => this.vendor()?.status === 'SUSPENDED');

  // Assign-products modal
  protected readonly assignOpen = signal(false);
  protected readonly assigning = signal(false);
  protected readonly loanProducts = signal<LoanProduct[]>([]);
  protected readonly assignSelected = signal<Set<string>>(new Set());

  protected isProductSelected(id: string): boolean {
    return this.assignSelected().has(id);
  }

  protected toggleProduct(id: string, checked: boolean): void {
    this.assignSelected.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected openAssign(): void {
    this.assignSelected.set(new Set());
    this.assignOpen.set(true);
    this.loanProductService.list().subscribe({ next: (res) => this.loanProducts.set(res.data ?? []) });
  }

  protected closeAssign(): void {
    if (this.assigning()) return;
    this.assignOpen.set(false);
  }

  protected confirmAssign(): void {
    const id = this.id();
    const ids = [...this.assignSelected()];
    if (!id || ids.length === 0) return;
    this.assigning.set(true);
    this.vendorService.assignProducts(id, ids).subscribe({
      next: () => {
        this.toast.success(`Assigned ${ids.length} product(s) to this vendor.`);
        this.assigning.set(false);
        this.assignOpen.set(false);
      },
      error: () => {
        this.assigning.set(false);
        this.toast.error('Could not assign these products to the vendor. Please try again.');
      },
    });
  }

  constructor() {
    effect(() => {
      this.id();
      this.load();
    });
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    const id = this.id();
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(false);
    this.vendorService.getOne(id).subscribe({
      next: (res) => {
        this.vendor.set(res.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
    this.vendorService.getDocuments(id).subscribe({
      next: (res) => this.documents.set(res.data ?? []),
      error: () => this.documents.set([]),
    });
    this.loans.set([]);
    fetchAllPages((page) => this.loanService.list({ page, limit: 100 })).subscribe({
      next: (loans) => this.loans.set(loans.filter((l) => l.vendorId === id)),
      error: () => this.loans.set([]),
    });
  }

  protected dialogTitle(type: DialogType | null): string {
    switch (type) {
      case 'approve': return 'Approve vendor';
      case 'reject': return 'Reject KYC';
      case 'blacklist': return 'Blacklist vendor';
      case 'suspend': return 'Suspend vendor';
      case 'activate': return 'Reactivate vendor';
      default: return '';
    }
  }

  protected openDialog(type: DialogType): void {
    this.rejectReason.reset('');
    this.dialog.set(type);
  }

  protected closeDialog(): void {
    if (this.acting()) return;
    this.dialog.set(null);
  }

  protected confirm(): void {
    const id = this.id();
    const type = this.dialog();
    if (!id || !type) return;

    if (type === 'reject' && this.rejectReason.invalid) {
      this.rejectReason.markAsTouched();
      return;
    }

    // Captured before the action so a reversible change can be undone.
    const prevStatus = this.vendor()?.status;

    this.acting.set(true);
    // `undo`, when provided, shows a dark Undo toast that restores the prior status.
    const done = (message: string, undo?: () => void) => {
      if (undo) this.toast.undo(message, undo);
      else this.toast.success(message);
      this.acting.set(false);
      this.dialog.set(null);
      this.load();
    };
    const fail = () => {
      this.acting.set(false);
      this.toast.error(`Could not ${this.dialogTitle(type).toLowerCase()}. Please try again.`);
    };

    const restore = prevStatus
      ? () =>
          this.vendorService.updateStatus(id, { status: prevStatus }).subscribe({
            next: () => {
              this.toast.success('Change reverted.');
              this.load();
            },
            error: () => this.toast.error('Could not undo. Please try again.'),
          })
      : undefined;

    switch (type) {
      case 'approve':
        this.vendorService.approve(id).subscribe({ next: () => done('Vendor approved.'), error: fail });
        break;
      case 'reject':
        this.vendorService
          .rejectKyc(id, { reason: this.rejectReason.value.trim() })
          .subscribe({ next: () => done('Vendor KYC rejected.'), error: fail });
        break;
      case 'blacklist':
        this.vendorService.blacklist(id).subscribe({ next: () => done('Vendor blacklisted.', restore), error: fail });
        break;
      case 'suspend':
        this.setStatus(id, 'SUSPENDED', 'Vendor suspended.', (m) => done(m, restore), fail);
        break;
      case 'activate':
        this.setStatus(id, 'APPROVED', 'Vendor reactivated.', done, fail);
        break;
    }
  }

  private setStatus(
    id: string,
    status: VendorStatus,
    message: string,
    done: (m: string) => void,
    fail: () => void,
  ): void {
    this.vendorService.updateStatus(id, { status }).subscribe({
      next: () => done(message),
      error: fail,
    });
  }
}
