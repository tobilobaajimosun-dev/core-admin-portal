import { Injectable } from '@angular/core';

export type AppKey = 'core' | 'asset-flex';

const SESSION_KEY = 'ngAppActiveApp';
const PERSISTED_KEY = 'ngAppPreferredApp';

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
