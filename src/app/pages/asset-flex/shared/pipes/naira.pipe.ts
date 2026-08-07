import { Pipe, PipeTransform } from '@angular/core';

/** Formats a numeric string/number as Naira, e.g. "1234.5" → "₦1,234.50". */
@Pipe({ name: 'naira' })
export class NairaPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    const n = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(n)) return '—';
    return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
