import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

import { RouterOutlet } from '@angular/router';
import { PsMastHeadComponent } from 'src/app/ui/ps-mast-head/ps-mast-head.component';
import { PsSidebarComponent } from 'src/app/ui/ps-sidebar/ps-sidebar.component';

/** Matches Tailwind's `md` breakpoint (768px) used for the sidebar drawer collapse. */
const MOBILE_QUERY = '(max-width: 767.98px)';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PsMastHeadComponent, PsSidebarComponent],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss',
  host: {
    '(document:keydown.escape)': 'closeSidebar()',
  },
})
export class AuthenticatedLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly sidebarOpen = signal(false);
  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(MOBILE_QUERY) },
  );

  /** The drawer is only off-canvas (and thus hideable from assistive tech) below `md`. */
  protected readonly sidebarHidden = computed(() => this.isMobile() && !this.sidebarOpen());

  constructor() {
    // Lock body scroll behind the open drawer so a swipe can't scroll the page underneath it.
    effect(() => {
      document.body.style.overflow = this.isMobile() && this.sidebarOpen() ? 'hidden' : '';
    });
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
