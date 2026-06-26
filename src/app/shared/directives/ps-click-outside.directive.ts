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
 * Directive that emits an event when a click occurs outside of the host element.
 *
 * @example
 * ```html
 * <div (clickOutside)="onClickOutside($event)">
 *   Content that needs click outside detection
 * </div>
 * ```
 */


import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class PsClickOutsideDirective {
  /**
   * Event emitter that fires when a click occurs outside the host element
   */
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) { }

  /**
   * Click handler that checks if click was outside the host element
   * @param event The mouse click event
   * @param targetElement The HTML element that was clicked
   */
  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: EventTarget | null): void {
      if (!targetElement || !(targetElement instanceof HTMLElement)) {
          return;
      }
      const clickedInside = this.elementRef.nativeElement.contains(targetElement);
      if (!clickedInside) {
          this.clickOutside.emit(event);
      }
  }
}
