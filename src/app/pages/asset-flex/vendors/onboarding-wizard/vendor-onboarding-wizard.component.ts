import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PsClickOutsideDirective } from '@shared/directives/ps-click-outside.directive';
import {
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Search01Icon,
  Upload01Icon,
  Building01Icon,
  UserAccountIcon,
  BankIcon,
} from '@hugeicons-pro/core-stroke-rounded';

import { Vendor } from '@pages/asset-flex/shared/models/vendor.model';
import { VendorService } from '@pages/asset-flex/shared/services/vendor.service';
import { Bank, IdentityService, IdentityVerifyResult } from '@pages/asset-flex/shared/services/identity.service';

interface WizardStep {
  key: 'business' | 'ownership' | 'settlement';
  label: string;
  icon: typeof Building01Icon;
}

const STEPS: WizardStep[] = [
  { key: 'business', label: 'Business details', icon: Building01Icon },
  { key: 'ownership', label: 'Ownership details', icon: UserAccountIcon },
  { key: 'settlement', label: 'Settlement account', icon: BankIcon },
];

type VerifyStatus = 'idle' | 'checking' | 'verified' | 'failed';

/** Pull a human name out of a provider's identity payload — field names
 * vary by provider, and the live response nests differently than the
 * (stale) swagger doc, so check both `data` and the raw provider payload
 * before giving up and showing "verified" with no name. */
function extractName(...sources: (Record<string, unknown> | null | undefined)[]): string | null {
  for (const data of sources) {
    if (!data) continue;
    const full = data['full_name'] ?? data['fullName'];
    if (typeof full === 'string' && full.trim()) return full;
    const first = data['first_name'] ?? data['firstName'];
    const last = data['last_name'] ?? data['lastName'];
    if (typeof first === 'string' || typeof last === 'string') {
      const joined = [first, last].filter(Boolean).join(' ');
      if (joined) return joined;
    }
    const acctName = data['account_name'] ?? data['accountName'];
    if (typeof acctName === 'string' && acctName.trim()) return acctName;
  }
  return null;
}

/**
 * Full-screen 3-step vendor onboarding wizard, mirroring Mercury's step-flow
 * KYB UI. Wired to the real Asset Flex API where it exists:
 *  - POST /vendors/onboard creates the vendor account for real.
 *  - GET /utilities/banks, POST /identity/account/verify,
 *    /identity/bvn/verify and /identity/nin/verify are live identity checks.
 * CAC number, address, and the ownership person's BVN/NIN have nowhere to
 * be stored — the vendor API models one contact identity per business, not
 * a separate business + owner. Those fields are still captured and verified
 * live for KYC purposes, but aren't persisted anywhere; the banner below
 * says so.
 */
@Component({
  selector: 'app-vendor-onboarding-wizard',
  imports: [ReactiveFormsModule, A11yModule, HugeiconsIconComponent, PsClickOutsideDirective],
  templateUrl: './vendor-onboarding-wizard.component.html',
  styleUrl: './vendor-onboarding-wizard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class VendorOnboardingWizardComponent {
  private readonly vendorService = inject(VendorService);
  private readonly identityService = inject(IdentityService);

  readonly closed = output<void>();
  readonly created = output<Vendor>();

  protected readonly steps = STEPS;
  protected readonly closeIcon = Cancel01Icon;
  protected readonly backIcon = ArrowLeft01Icon;
  protected readonly nextIcon = ArrowRight01Icon;
  protected readonly checkIcon = CheckmarkCircle02Icon;
  protected readonly loadingIcon = Loading03Icon;
  protected readonly searchIcon = Search01Icon;
  protected readonly uploadIcon = Upload01Icon;

  protected readonly stepIndex = signal(0);
  protected readonly currentStep = computed(() => this.steps[this.stepIndex()]);

  // ── Step 1: Business details ────────────────────────────────────────────
  protected readonly businessForm = new FormGroup({
    businessName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cacNumber: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contactPhone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contactEmail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  // ── Step 2: Ownership details ───────────────────────────────────────────
  protected readonly ownershipForm = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bvn: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{11}$/)] }),
    ninNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{11}$/)] }),
  });
  protected readonly ninImageName = signal<string | null>(null);

  protected readonly bvnStatus = signal<VerifyStatus>('idle');
  protected readonly bvnMatchedName = signal<string | null>(null);
  protected readonly bvnError = signal<string | null>(null);
  protected readonly bvnPendingOtp = signal(false);
  protected readonly bvnOtp = new FormControl('', { nonNullable: true });
  private bvnSessionId = '';
  private bvnCheckedFor = '';

  protected readonly ninStatus = signal<VerifyStatus>('idle');
  protected readonly ninMatchedName = signal<string | null>(null);
  protected readonly ninError = signal<string | null>(null);
  private ninCheckedFor = '';

  // ── Step 3: Settlement bank account ─────────────────────────────────────
  protected readonly settlementForm = new FormGroup({
    bankName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bankCode: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    accountNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{10}$/)] }),
  });
  protected readonly banks = signal<Bank[]>([]);
  protected readonly banksLoading = signal(true);
  protected readonly bankQuery = signal('');
  protected readonly bankListOpen = signal(false);
  protected readonly bankResults = computed(() => {
    const q = this.bankQuery().trim().toLowerCase();
    const all = this.banks();
    if (!q) return all;
    return all.filter((b) => b.name.toLowerCase().includes(q));
  });
  protected readonly bankActiveIndex = signal(-1);

  protected onBankSearchKeydown(event: KeyboardEvent): void {
    const results = this.bankResults();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.bankListOpen()) {
        this.bankListOpen.set(true);
        return;
      }
      this.bankActiveIndex.update((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.bankActiveIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      const active = results[this.bankActiveIndex()];
      if (active) {
        event.preventDefault();
        this.selectBank(active);
      }
    } else if (event.key === 'Escape' && this.bankListOpen()) {
      event.stopPropagation();
      this.bankListOpen.set(false);
    }
  }

  protected readonly acctStatus = signal<VerifyStatus>('idle');
  protected readonly resolvedAccountName = signal<string | null>(null);
  protected readonly acctError = signal<string | null>(null);
  private acctCheckedFor = '';

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  constructor() {
    this.identityService.listBanks().subscribe({
      next: (res) => {
        this.banks.set(res.data ?? []);
        this.banksLoading.set(false);
      },
      error: () => this.banksLoading.set(false),
    });
  }

  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected goToStep(index: number): void {
    if (index >= this.stepIndex()) return; // only allow going back via the stepper
    this.stepIndex.set(index);
  }

  protected back(): void {
    if (this.stepIndex() > 0) this.stepIndex.update((i) => i - 1);
  }

  protected next(): void {
    const step = this.currentStep().key;
    if (step === 'business') {
      if (this.businessForm.invalid) {
        this.businessForm.markAllAsTouched();
        return;
      }
      this.stepIndex.set(1);
      return;
    }
    if (step === 'ownership') {
      if (this.ownershipForm.invalid || this.bvnStatus() !== 'verified') {
        this.ownershipForm.markAllAsTouched();
        return;
      }
      this.stepIndex.set(2);
      return;
    }
  }

  protected onNinImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.ninImageName.set(input.files?.[0]?.name ?? null);
  }

  private readResult(res: { data?: IdentityVerifyResult | null } | null): IdentityVerifyResult | null {
    return res?.data ?? null;
  }

  protected verifyBvn(): void {
    const bvn = this.ownershipForm.controls.bvn.value;
    if (this.ownershipForm.controls.bvn.invalid) {
      this.ownershipForm.controls.bvn.markAsTouched();
      return;
    }
    this.bvnCheckedFor = bvn;
    this.bvnStatus.set('checking');
    this.bvnError.set(null);
    this.identityService.verifyBvn(bvn).subscribe({
      next: (res) => this.applyBvnResult(bvn, this.readResult(res)),
      error: () => {
        if (this.bvnCheckedFor !== bvn) return;
        this.bvnStatus.set('failed');
        this.bvnError.set('Could not reach the verification provider. Please try again.');
      },
    });
  }

  protected submitBvnOtp(): void {
    const bvn = this.ownershipForm.controls.bvn.value;
    const otp = this.bvnOtp.value.trim();
    if (!otp || !this.bvnSessionId) return;
    this.bvnStatus.set('checking');
    this.identityService.verifyBvn(bvn, otp, this.bvnSessionId).subscribe({
      next: (res) => this.applyBvnResult(bvn, this.readResult(res)),
      error: () => {
        this.bvnStatus.set('failed');
        this.bvnError.set('OTP verification failed. Please try again.');
      },
    });
  }

  private applyBvnResult(bvn: string, result: IdentityVerifyResult | null): void {
    if (this.bvnCheckedFor !== bvn || !result) return;
    if (result.status === 'PENDING') {
      const sessionId = result.data?.['session_id'];
      this.bvnSessionId = typeof sessionId === 'string' ? sessionId : '';
      this.bvnPendingOtp.set(true);
      this.bvnStatus.set('idle');
      return;
    }
    this.bvnPendingOtp.set(false);
    if (result.status === 'SUCCESS') {
      this.bvnStatus.set('verified');
      this.bvnMatchedName.set(extractName(result.data, result.rawResponse));
    } else {
      this.bvnStatus.set('failed');
      this.bvnError.set(result.errorMessage ?? 'This BVN could not be verified.');
    }
  }

  protected onBvnOrNameChange(): void {
    if (this.bvnStatus() !== 'idle') this.bvnStatus.set('idle');
    this.bvnPendingOtp.set(false);
  }

  protected verifyNin(): void {
    const nin = this.ownershipForm.controls.ninNumber.value;
    if (this.ownershipForm.controls.ninNumber.invalid) {
      this.ownershipForm.controls.ninNumber.markAsTouched();
      return;
    }
    this.ninCheckedFor = nin;
    this.ninStatus.set('checking');
    this.ninError.set(null);
    this.identityService.verifyNin(nin).subscribe({
      next: (res) => {
        const result = this.readResult(res);
        if (this.ninCheckedFor !== nin || !result) return;
        if (result.status === 'SUCCESS') {
          this.ninStatus.set('verified');
          this.ninMatchedName.set(extractName(result.data, result.rawResponse));
        } else {
          this.ninStatus.set('failed');
          this.ninError.set(result.errorMessage ?? 'This NIN could not be verified.');
        }
      },
      error: () => {
        if (this.ninCheckedFor !== nin) return;
        this.ninStatus.set('failed');
        this.ninError.set('Could not reach the verification provider. Please try again.');
      },
    });
  }

  protected onNinChange(): void {
    if (this.ninStatus() !== 'idle') this.ninStatus.set('idle');
  }

  protected selectBank(bank: Bank): void {
    this.settlementForm.controls.bankName.setValue(bank.name);
    this.settlementForm.controls.bankCode.setValue(bank.bank_code);
    this.bankQuery.set('');
    this.bankListOpen.set(false);
    this.bankActiveIndex.set(-1);
    this.acctStatus.set('idle');
    this.resolvedAccountName.set(null);
  }

  protected onAccountNumberChange(): void {
    if (this.acctStatus() !== 'idle') {
      this.acctStatus.set('idle');
      this.resolvedAccountName.set(null);
    }
  }

  protected resolveAccount(): void {
    const { accountNumber, bankCode } = this.settlementForm.getRawValue();
    if (this.settlementForm.controls.accountNumber.invalid || !bankCode) {
      this.settlementForm.markAllAsTouched();
      return;
    }
    this.acctCheckedFor = accountNumber;
    this.acctStatus.set('checking');
    this.acctError.set(null);
    this.identityService.verifyAccount(accountNumber, bankCode).subscribe({
      next: (res) => {
        const result = this.readResult(res);
        if (this.acctCheckedFor !== accountNumber || !result) return;
        if (result.status === 'SUCCESS') {
          this.acctStatus.set('verified');
          this.resolvedAccountName.set(
            extractName(result.data, result.rawResponse) ?? this.businessForm.controls.businessName.value,
          );
        } else {
          this.acctStatus.set('failed');
          this.acctError.set(result.errorMessage ?? 'Could not resolve an account name for this number.');
        }
      },
      error: () => {
        if (this.acctCheckedFor !== accountNumber) return;
        this.acctStatus.set('failed');
        this.acctError.set('Could not reach the account-verification provider. Please try again.');
      },
    });
  }

  protected submit(): void {
    if (this.settlementForm.invalid || this.acctStatus() !== 'verified' || !this.resolvedAccountName()) {
      this.settlementForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);

    const b = this.businessForm.getRawValue();
    const s = this.settlementForm.getRawValue();

    this.vendorService
      .onboard({
        business_name: b.businessName,
        contact_email: b.contactEmail,
        password: b.password,
        contact_phone: b.contactPhone,
        settlement_bank_code: s.bankCode,
        settlement_account_number: s.accountNumber,
        settlement_account_name: this.resolvedAccountName()!,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitted.set(true);
          if (res.data) this.created.emit(res.data);
          else this.close();
        },
        error: (err) => {
          this.submitting.set(false);
          const message: string | undefined = err?.error?.message;
          this.submitError.set(message ?? 'Could not create this vendor. Please check the details and try again.');
        },
      });
  }
}
