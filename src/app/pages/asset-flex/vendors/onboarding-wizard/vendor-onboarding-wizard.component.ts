import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
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

/** Mock bank list — no real bank-lookup endpoint exists yet. */
const MOCK_BANKS = [
  'Access Bank', 'Guaranty Trust Bank', 'Zenith Bank', 'First Bank of Nigeria',
  'United Bank for Africa', 'Fidelity Bank', 'Union Bank', 'Stanbic IBTC Bank',
  'Sterling Bank', 'Wema Bank', 'Polaris Bank', 'Ecobank Nigeria',
  'Providus Bank', 'Kuda Bank', 'Moniepoint MFB', 'Opay Digital Services',
];

/**
 * Full-screen 3-step vendor onboarding wizard — prototype only.
 * There's no admin create-vendor, BVN/NIN-verification, or bank-lookup
 * endpoint yet, so verification steps are simulated with a delay and every
 * submission adds a locally-held mock Vendor rather than calling the API.
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

  protected readonly bvnStatus = signal<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  private bvnCheckedFor = '';

  // ── Step 3: Settlement bank account ─────────────────────────────────────
  protected readonly settlementForm = new FormGroup({
    bankName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    accountNumber: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{10}$/)] }),
  });
  protected readonly bankQuery = signal('');
  protected readonly bankListOpen = signal(false);
  protected readonly bankResults = computed(() => {
    const q = this.bankQuery().trim().toLowerCase();
    if (!q) return MOCK_BANKS;
    return MOCK_BANKS.filter((b) => b.toLowerCase().includes(q));
  });

  protected readonly acctStatus = signal<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  private acctCheckedFor = '';

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

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

  protected verifyBvn(): void {
    const bvn = this.ownershipForm.controls.bvn.value;
    const name = this.ownershipForm.controls.fullName.value;
    if (this.ownershipForm.controls.bvn.invalid || !name) {
      this.ownershipForm.controls.bvn.markAsTouched();
      return;
    }
    this.bvnCheckedFor = bvn;
    this.bvnStatus.set('checking');
    setTimeout(() => {
      if (this.bvnCheckedFor !== bvn) return;
      this.bvnStatus.set('verified');
    }, 1100);
  }

  protected onBvnOrNameChange(): void {
    if (this.bvnStatus() !== 'idle') this.bvnStatus.set('idle');
  }

  protected selectBank(name: string): void {
    this.settlementForm.controls.bankName.setValue(name);
    this.bankQuery.set('');
    this.bankListOpen.set(false);
    this.acctStatus.set('idle');
  }

  protected onAccountNumberChange(): void {
    if (this.acctStatus() !== 'idle') this.acctStatus.set('idle');
  }

  protected resolveAccount(): void {
    const { accountNumber, bankName } = this.settlementForm.getRawValue();
    if (this.settlementForm.controls.accountNumber.invalid || !bankName) {
      this.settlementForm.markAllAsTouched();
      return;
    }
    this.acctCheckedFor = accountNumber;
    this.acctStatus.set('checking');
    setTimeout(() => {
      if (this.acctCheckedFor !== accountNumber) return;
      this.acctStatus.set('verified');
    }, 1100);
  }

  protected get resolvedAccountName(): string {
    return this.businessForm.controls.businessName.value || 'Business account';
  }

  protected submit(): void {
    if (this.settlementForm.invalid || this.acctStatus() !== 'verified') {
      this.settlementForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      const b = this.businessForm.getRawValue();
      const s = this.settlementForm.getRawValue();
      const id = `demo-${Date.now()}`;
      const vendor: Vendor = {
        id,
        businessName: b.businessName,
        contactEmail: b.contactEmail,
        contactPhone: b.contactPhone,
        status: 'PENDING_APPROVAL',
        webhookUrl: null,
        platformFeePercentage: '0',
        settlementBankCode: '',
        settlementAccountNumber: s.accountNumber,
        settlementAccountName: this.resolvedAccountName,
        settlementSchedule: 'T_PLUS_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.submitting.set(false);
      this.submitted.set(true);
      this.created.emit(vendor);
    }, 900);
  }
}
