import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { PsToastService } from '@pcsl-ui/ui/ps-toast/ps-toast.service';
import { ApiResponse } from '@pages/asset-flex/shared/models/generic.model';
import { PageHeaderComponent } from '@pages/asset-flex/shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../shared/components/status-badge/status-badge.component';
import { IdentityProviderService, UtilityProviderService } from '../shared/services/provider.service';
import { formatLabel } from '../shared/utils/format';

interface ProviderRow {
  id: string;
  code: string;
  name: string;
  type?: string;
  isActive: boolean;
  isDefault: boolean;
}

@Component({
  selector: 'app-providers',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title()" [subtitle]="subtitle()" />

    <div class="pa-gtable-wrap">
      <div class="pa-gtable" [style.--gt-cols]="hasType() ? '1.6fr 1fr 1fr 1fr 1fr' : '1.6fr 1fr 1fr 1fr'">
        <div class="pa-gtable__head">
          <span>Provider</span>
          <span>Code</span>
          @if (hasType()) { <span>Type</span> }
          <span>Active</span>
          <span class="pa-gtable__cell--right">Default</span>
        </div>

        @if (loading()) {
          @for (r of [1, 2, 3]; track r) {
            <div class="pa-gtable__loading"><span class="pa-skeleton"></span></div>
          }
        } @else if (rows().length === 0) {
          <div class="pa-gtable__empty">
            <p class="pa-empty__title">No providers configured</p>
          </div>
        } @else {
          @for (p of rows(); track p.id) {
            <div class="pa-gtable__row">
              <div class="pa-gtable__cell pa-cell-primary">{{ p.name }}</div>
              <div class="pa-gtable__cell pa-mono">{{ p.code }}</div>
              @if (hasType()) { <div class="pa-gtable__cell">{{ roleLabel(p.type || '') || '—' }}</div> }
              <div class="pa-gtable__cell">
                <app-status-badge [tone]="p.isActive ? 'success' : 'neutral'" [text]="p.isActive ? 'ACTIVE' : 'INACTIVE'" />
              </div>
              <div class="pa-gtable__cell pa-gtable__cell--right">
                @if (p.isDefault) {
                  <app-status-badge tone="info" text="DEFAULT" />
                } @else {
                  <button
                    class="pa-btn pa-btn--white pa-btn--sm"
                    type="button"
                    [disabled]="settingId() !== null"
                    (click)="setDefault(p)"
                  >
                    {{ settingId() === p.code ? 'Setting…' : 'Set default' }}
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ProvidersComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly identity = inject(IdentityProviderService);
  private readonly utilities = inject(UtilityProviderService);
  private readonly toast = inject(PsToastService);

  protected readonly roleLabel = formatLabel;

  private readonly kind: 'identity' | 'utilities' =
    this.route.snapshot.data['kind'] === 'utilities' ? 'utilities' : 'identity';

  protected readonly title = signal(
    this.kind === 'utilities' ? 'Utilities Providers' : 'Identity Providers',
  );
  protected readonly subtitle = signal(
    this.kind === 'utilities'
      ? 'Bill-payment / utilities providers and the active default.'
      : 'Identity-verification providers and the active default.',
  );
  protected readonly hasType = signal(this.kind === 'identity');

  protected readonly rows = signal<ProviderRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly settingId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const req$: Observable<ApiResponse<ProviderRow[]>> =
      this.kind === 'utilities'
        ? (this.utilities.list() as Observable<ApiResponse<ProviderRow[]>>)
        : (this.identity.list() as Observable<ApiResponse<ProviderRow[]>>);

    req$.subscribe({
      next: (res) => {
        this.rows.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
      },
    });
  }

  protected setDefault(p: ProviderRow): void {
    this.settingId.set(p.code);
    const req$ =
      this.kind === 'utilities' ? this.utilities.setDefault(p.code) : this.identity.setDefault(p.code);
    req$.subscribe({
      next: () => {
        this.toast.success(`${p.name} set as default.`);
        this.settingId.set(null);
        this.load();
      },
      error: () => this.settingId.set(null),
    });
  }
}
