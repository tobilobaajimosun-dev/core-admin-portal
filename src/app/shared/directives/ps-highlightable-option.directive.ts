import { Highlightable } from '@angular/cdk/a11y';
import { Directive, ElementRef, HostBinding, Input, inject } from '@angular/core';

@Directive({
  selector: '[psHighlightableOption]',
  standalone: true
})
export class PsHighlightableOptionDirective implements Highlightable {
  @Input({ required: true, alias: 'psHighlightableOption' }) value!: unknown;

  @HostBinding('class.ps-highlight') highlight = false;

  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  setActiveStyles(): void {
    this.highlight = true;
  }

  setInactiveStyles(): void {
    this.highlight = false;
  }

  disabled?: boolean | undefined;

  scrollIntoElement(): void {
    this.elementRef.nativeElement.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }
}
