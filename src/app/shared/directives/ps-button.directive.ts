import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
  inject,
} from '@angular/core';

export type Size = 'sm' | 'md' | 'lg';
export type Width = 'full' | 'auto';
export type Theme = 'primary' | 'secondary' | 'danger' | 'warning' | 'white';
export type Fill = 'block' | 'clear' | 'outline';

const BASE_CLASSES = `
  relative isolate overflow-hidden inline-flex items-center justify-center gap-x-2 
  font-medium rounded-md transition-all duration-200 ease-in-out
  disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-offset-2
`;

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

const WIDTH_CLASSES: Record<Width, string> = {
  full: 'w-full flex',
  auto: 'w-auto inline-flex',
};

const THEME_CONFIG: Record<Theme, Record<Fill, string>> = {
  primary: {
    block: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary primary-button-shadow',
    outline: 'border border-primary text-primary hover:bg-primary/10 focus:ring-primary',
    clear: 'text-primary hover:bg-primary/10 focus:ring-primary',
  },
  secondary: {
    block: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary shadow-sm',
    outline: 'border border-secondary text-secondary hover:bg-secondary/10 focus:ring-secondary',
    clear: 'text-secondary hover:bg-secondary/10 focus:ring-secondary',
  },
  danger: {
    block: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 delete-button-shadow',
    outline: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
    clear: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
  },
  warning: {
    block: 'bg-amber-400 text-black hover:bg-amber-500 focus:ring-amber-400 shadow-sm',
    outline: 'border border-amber-400 text-amber-600 hover:bg-amber-50 focus:ring-amber-400',
    clear: 'text-amber-600 hover:bg-amber-50 focus:ring-amber-400',
  },
  white: {
    block: 'bg-white border border-gray-200 hover:bg-gray-50 focus:ring-gray-200 text-shadow warning-button-shadow',
    outline: 'border border-white text-white hover:bg-white/10 focus:ring-white/50',
    clear: 'text-white hover:bg-white/10 focus:ring-white/50',
  },
};

@Directive({
  selector: 'button[psButton], a[psButton]', // Apply to button or anchor tags
  standalone: true,
})
export class PsButtonDirective implements OnChanges {
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  @Input() theme: Theme = 'primary'; 
  
  @Input() size: Size = 'md';
  @Input() width: Width = 'auto';
  @Input() fill: Fill = 'block';

  // 2. Bind the class string to the host element
  @HostBinding('class') elementClass = '';

  constructor() {
    // Initial render
    this.updateClasses();
  }

  // 3. Update classes efficiently when inputs change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['theme'] || changes['size'] || changes['width'] || changes['fill']) {
      this.updateClasses();
    }
  }

  private updateClasses(): void {
    // Logic remains the same...
    const sizeClass = SIZE_CLASSES[this.size];
    const widthClass = WIDTH_CLASSES[this.width];
    
    const themeSet = THEME_CONFIG[this.theme] || THEME_CONFIG['primary'];
    const themeClass = themeSet[this.fill] || themeSet['block'];

    this.elementClass = `${BASE_CLASSES} ${sizeClass} ${widthClass} ${themeClass}`;
  }

  @HostListener('click', ['$event'])
  createRipple(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const button = this.elementRef.nativeElement as HTMLElement;

    const circle = this.renderer.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.left - radius;
    const y = mouseEvent.clientY - rect.top - radius;

    this.renderer.setStyle(circle, 'width', `${diameter}px`);
    this.renderer.setStyle(circle, 'height', `${diameter}px`);
    this.renderer.setStyle(circle, 'left', `${x}px`);
    this.renderer.setStyle(circle, 'top', `${y}px`);
    this.renderer.addClass(circle, 'ripple');

    const existingRipple = button.getElementsByClassName('ripple')[0];
    if (existingRipple) {
      this.renderer.removeChild(button, existingRipple);
    }

    this.renderer.appendChild(button, circle);

    setTimeout(() => {
      // Check if the ripple is still attached before removing
      if (circle.parentNode === button) {
        this.renderer.removeChild(button, circle);
      }
    }, 600);
  }
}