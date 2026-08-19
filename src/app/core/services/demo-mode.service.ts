import { Injectable, signal } from '@angular/core';

/**
 * Front-end demo/fixtures mode. When on, the {@link demoModeInterceptor} serves
 * realistic Asset Flex test data for endpoints the backend hasn't populated yet
 * (loans, settlements + their detail pages) so the shapes are visible end-to-end.
 * Remove this service + its interceptor once those APIs return real data.
 */
const KEY = 'afDemoMode';

@Injectable({ providedIn: 'root' })
export class DemoModeService {
  readonly enabled = signal<boolean>(this.read());

  toggle(): void {
    this.set(!this.enabled());
  }

  set(on: boolean): void {
    this.enabled.set(on);
    try {
      if (on) localStorage.setItem(KEY, '1');
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable — in-memory only */
    }
  }

  private read(): boolean {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }
}
