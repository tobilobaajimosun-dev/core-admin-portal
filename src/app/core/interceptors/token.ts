import { HttpContextToken } from '@angular/common/http';
// INTERCEPTOR TOKENS

// Skip Interceptor Token
export const SKIP_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
// Loader Control Token
export const SKIP_LOADER = new HttpContextToken<boolean>(() => false);

// Custom Error Message Token
export const CUSTOM_ERROR_MESSAGE = new HttpContextToken<string | null>(() => null);
// Silent Error Token
export const SILENT_ERROR = new HttpContextToken<boolean>(() => false);
