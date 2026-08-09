import { Injectable } from '@angular/core';

export type AppKey = 'core' | 'asset-flex';

const SESSION_KEY = 'ngAppActiveApp';
const PERSISTED_KEY = 'ngAppPreferredApp';
const RECENT_KEY = 'ngAppRecentApps';

@Injectable({ providedIn: 'root' })
export class AppPreferenceService {
  getActiveApp(): AppKey | null {
    return this.read(sessionStorage, SESSION_KEY) ?? this.read(localStorage, PERSISTED_KEY);
  }

  chooseApp(app: AppKey, remember: boolean): void {
    try {
      sessionStorage.setItem(SESSION_KEY, app);
      if (remember) {
        localStorage.setItem(PERSISTED_KEY, app);
      }
    } catch (error) { }
    this.trackRecent(app);
  }

  /** Switches the active app in place, preserving whether the previous choice was remembered. */
  switchApp(app: AppKey): void {
    const wasRemembered = this.read(localStorage, PERSISTED_KEY) !== null;
    this.chooseApp(app, wasRemembered);
  }

  /** Apps ordered most-recently-used first, current app always leading. */
  getRecentApps(): AppKey[] {
    const active = this.getActiveApp();
    let recent: AppKey[] = [];
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      recent = raw ? (JSON.parse(raw) as AppKey[]).filter((a) => a === 'core' || a === 'asset-flex') : [];
    } catch (error) {
      recent = [];
    }
    if (active) recent = [active, ...recent.filter((a) => a !== active)];
    return recent;
  }

  private trackRecent(app: AppKey): void {
    try {
      const existing = this.getRecentApps().filter((a) => a !== app);
      localStorage.setItem(RECENT_KEY, JSON.stringify([app, ...existing].slice(0, 5)));
    } catch (error) { }
  }

  clearAll(): void {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PERSISTED_KEY);
    } catch (error) { }
  }

  private read(storage: Storage, key: string): AppKey | null {
    try {
      const value = storage.getItem(key);
      return value === 'core' || value === 'asset-flex' ? value : null;
    } catch (error) {
      return null;
    }
  }
}
