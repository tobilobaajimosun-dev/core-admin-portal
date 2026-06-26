import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { createPopper, Placement } from '@popperjs/core';

@Directive({
  selector: '[dropdownHeader]',
  standalone: true
})
export class DropdownHeaderDirective {
  constructor(public elementRef: ElementRef) { }
}

@Directive({
  selector: '[dropdownMenu]',
  standalone: true
})
export class DropdownMenuDirective {
  constructor(public templateRef: TemplateRef<any>) { }
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, DropdownHeaderDirective, DropdownMenuDirective],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  @Input() placement: Placement = 'bottom';
  @Input({ transform: booleanAttribute }) fullWidth = false;
  @Input() isStatic = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChild(DropdownHeaderDirective, { static: true }) header!: DropdownHeaderDirective;
  @ViewChild(DropdownMenuDirective, { static: true }) menu!: DropdownMenuDirective;

  isOpen = false;
  popperInstance: any;
  dropdownContainer?: HTMLDivElement;

  constructor(private vcr: ViewContainerRef) { }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isStatic) {
      return;
    }
    if (this.isOpen && !this.header.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  open() {
    const embeddedView = this.vcr.createEmbeddedView(this.menu.templateRef);
    this.dropdownContainer = document.createElement('div');
    this.header.elementRef.nativeElement.parentElement?.appendChild(this.dropdownContainer);
    this.dropdownContainer.appendChild(embeddedView.rootNodes[0]);
    this.popperInstance = createPopper(this.header.elementRef.nativeElement.parentElement, embeddedView.rootNodes[0], {
      placement: this.placement,
      strategy: this.fullWidth ? 'absolute' : 'fixed',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [4, 4]
          },
        },
        // {
        //   name: 'preventOverflow',
        //   options: {
        //     rootBoundary: 'document',
        //   },
        // },
      ],
    });

    // Add animations
    setTimeout(() => {
      embeddedView.rootNodes[0].classList.add('animate-show');
    }, 0);
  }

  close() {
    this.isOpen = false;
    this.vcr.clear();
    this.dropdownContainer?.remove();
    this.closed.emit();
    if (this.popperInstance) {
      this.popperInstance.destroy();
    }
  }
}
