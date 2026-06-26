/**
* Copyright (c) 2024 Princeps Credit Systems Limited
*
* This code is the property of Princeps Credit Systems Limited. Unauthorized copying,
* sharing, or use of this code, via any medium, is strictly prohibited
* without express permission from Princeps Credit Systems Limited.
*
* @author     Michael Ashefor
* @license    Proprietary
* @version    1.0.0
* @link       https://www.princepscreditsystemslimited.com
*/

/**
 * A directive that formats input values as currency with the following features:
 * - Automatically adds thousand separators (commas)
 * - Restricts input to numbers and decimal point only
 * - Limits decimal places to 2 digits
 * - Supports configurable currency prefix (defaults to ₦)
 *
 * Usage:
 * ```html
 * <input psCurrencyFormat [currencyPrefix]="'₦'" />
 * ```
 *
 * The directive will format numbers like:
 * - 1000 -> ₦1,000
 * - 1000.50 -> ₦1,000.50
 *
 * @example
 * ```typescript
 * // In your component template
 * <input psCurrencyFormat formControlName="amount" />
 * ```
 *
 * @remarks
 * - The directive automatically handles input events to format the value
 * - It preserves the numeric value for form controls while displaying formatted text
 * - Invalid characters are automatically stripped out
 */


import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[psCurrencyFormat]',
  standalone: true
})
export class PsCurrencyFormatDirective implements OnInit, OnDestroy {
  @Input() currencyPrefix: string = '₦';
  private subscription: Subscription = new Subscription();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() @Self() private ngControl: NgControl
  ) { }

  ngOnInit() {
    if (this.ngControl) {
      this.formatAndUpdate(this.ngControl.value);

      if (this.ngControl.valueChanges) {
        this.subscription = this.ngControl.valueChanges.subscribe((value) => {
          this.formatAndUpdate(value);
        });
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Use the core formatting logic
    const formatted = this.processValue(input.value, true);
    this.renderer.setProperty(input, 'value', formatted);
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    // On blur, we add the prefix
    const formatted = this.processValue(input.value, false);
    this.renderer.setProperty(input, 'value', formatted);
  }

  @HostListener('focus')
  onFocus() {
    const input = this.el.nativeElement;
    // On focus, we remove the prefix for editing
    const rawValue = this.stripCurrency(input.value);
    const formatted = this.formatWithCommas(rawValue);
    this.renderer.setProperty(input, 'value', formatted);
  }


  private formatAndUpdate(value: any) {
    if (value === null || value === undefined) {
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      return;
    }

    const isFocused = this.el.nativeElement === document.activeElement;
    const formatted = this.processValue(String(value), isFocused);

    this.renderer.setProperty(this.el.nativeElement, 'value', formatted);
  }

  private processValue(value: string, isFocused: boolean): string {
    let cleanValue = value.replace(/[^0-9.]/g, '');

    // Decimal handling logic
    const decimalSplit = cleanValue.split('.');
    if (decimalSplit.length > 2) {
      cleanValue = `${decimalSplit[0]}.${decimalSplit[1]}`;
    }
    if (decimalSplit[1]?.length > 2) {
      decimalSplit[1] = decimalSplit[1].substring(0, 2);
      cleanValue = `${decimalSplit[0]}.${decimalSplit[1]}`;
    }

    const withCommas = this.formatWithCommas(cleanValue);

    if (isFocused) {
      return withCommas;
    } else {
      return withCommas ? `${this.currencyPrefix} ${withCommas}` : '';
    }
  }

  private formatWithCommas(value: string): string {
    if (!value) {
       return ''
    };
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  private stripCurrency(value: string): string {
    return value.replace(this.currencyPrefix, '').trim();
  }
}