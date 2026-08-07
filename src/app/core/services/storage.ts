import { Injectable } from '@angular/core';
import { DynamicObjectType } from '../interfaces/generic.model';
import * as CryptoJS from 'crypto-js';
import { LoggedInUser } from '@core/interfaces/auth.model';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  encyptionKey = import.meta.env['NG_APP_ENCRYPTION_KEY'] || '';
  authSessionUser = import.meta.env['NG_APP_AUTH_SESSION_USER'] || '';
  authSessionToken = import.meta.env['NG_APP_AUTH_SESSION_TOKEN'] || '';

  private encrypt(txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.encyptionKey).toString();
  }

  private decrypt(txtToDecrypt: string): string {
    try {
      return CryptoJS.AES.decrypt(txtToDecrypt, this.encyptionKey).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return '';
    }
  }

  public getItem(key: string) {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      if (!decryptedData) return null;

      return JSON.parse(decryptedData);
    } catch (error) {
      return null;
    }
  }

  public setItem(key: string, data: DynamicObjectType | string): void {
    try {
      if (data === null || data === undefined) {
        return;
      }
      const encryptedData = this.encrypt(JSON.stringify(data));
      window.localStorage.setItem(key.toString(), encryptedData);
      
      const storedData = this.getItem(key);
      if (!storedData) {
      }
    } catch (error) {
    }
  }

  public getToken(): string {
    try {
      const tokenData = this.getItem(this.authSessionToken);
      return tokenData || '';
    } catch (error) {
      return '';
    }
  }

  public getUser(): LoggedInUser | null {
    try {
      return this.getItem(this.authSessionUser);
    } catch (error) {
      return null;
    }
  }

  public setToken(token: string): void {
    if (!token) {
      return;
    }
    this.setItem(this.authSessionToken, token);
  }

  public setUser(user: LoggedInUser): void {
    if (!user) {
      return;
    }
    this.setItem(this.authSessionUser, user);
  }

  public removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key.toString());
    } catch (error) {
    }
  }

  public clear(): void {
    try {
      window.localStorage.removeItem(this.authSessionUser);
      window.localStorage.removeItem(this.authSessionToken);
    } catch (error) {
    }
  }
}