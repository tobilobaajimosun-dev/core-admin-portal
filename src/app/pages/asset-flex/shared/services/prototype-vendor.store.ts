import { Injectable, signal } from '@angular/core';
import { Vendor } from '../models/vendor.model';

/** Prefix used for vendor IDs created through the prototype onboarding
 * wizard, since there's no admin create-vendor endpoint yet. */
const PROTOTYPE_PREFIX = 'demo-';

export function isPrototypeVendorId(id: string): boolean {
  return id.startsWith(PROTOTYPE_PREFIX);
}

/**
 * In-memory holding area for vendors created through the prototype
 * onboarding wizard, so their detail page (and its status actions) can be
 * viewed without a backend — navigating away from the vendors list would
 * otherwise destroy that vendor's only copy.
 */
@Injectable({ providedIn: 'root' })
export class PrototypeVendorStore {
  private readonly entries = signal<Map<string, Vendor>>(new Map());

  add(vendor: Vendor): void {
    this.entries.update((map) => new Map(map).set(vendor.id, vendor));
  }

  get(id: string): Vendor | undefined {
    return this.entries().get(id);
  }

  patch(id: string, changes: Partial<Vendor>): Vendor | undefined {
    const current = this.entries().get(id);
    if (!current) return undefined;
    const next: Vendor = { ...current, ...changes, updatedAt: new Date().toISOString() };
    this.entries.update((map) => new Map(map).set(id, next));
    return next;
  }
}
