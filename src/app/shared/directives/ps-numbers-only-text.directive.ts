import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[psNumbersOnlyText]',
  standalone: true,
})
export class PsNumbersOnlyTextDirective {
  @Input() allowDecimal = true;
  @Input() allowNegative = false;

  constructor(
    private el: ElementRef, 
    private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    // Sanitize input based on configuration
    const sanitizedValue = this.sanitizeInput(currentValue);

    // Update value if it has changed
    if (sanitizedValue !== currentValue) {
      input.value = sanitizedValue;
      
      // Trigger form control update
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(sanitizedValue, { 
          emitEvent: true,
          emitModelToViewChange: true 
        });
      }
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitizedText = this.sanitizeInput(pastedText);
    
    // Insert sanitized text
    document.execCommand('insertText', false, sanitizedText);
  }

  private sanitizeInput(value: string): string {
    // Regex pattern based on configuration
    let pattern = this.allowDecimal 
      ? (this.allowNegative 
        ? /[^0-9.-]/g  // Allow negative and decimal
        : /[^0-9.]/g   // Allow only decimal
      ) 
      : (this.allowNegative 
        ? /[^0-9-]/g   // Allow negative
        : /[^0-9]/g    // Numbers only
      );

    // Remove unwanted characters
    const sanitized = value.replace(pattern, '');

    // Ensure only one negative sign at the start
    if (this.allowNegative) {
      const negativeSignCount = (sanitized.match(/-/g) || []).length;
      if (negativeSignCount > 1) {
        return sanitized.replace(/-/g, '');
      }
      if (negativeSignCount === 1 && !sanitized.startsWith('-')) {
        return sanitized.replace(/-/g, '');
      }
    }

    // Ensure only one decimal point
    if (this.allowDecimal) {
      const decimalPointCount = (sanitized.match(/\./g) || []).length;
      if (decimalPointCount > 1) {
        const parts = sanitized.split('.');
        return parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
      }
    }

    return sanitized;
  }
}