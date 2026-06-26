import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { PsLoaderComponent } from '@pcsl-ui/ui/ps-loader/ps-loader.component';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private overlayRef: OverlayRef | null = null;
  private requestCount = 0;

  constructor(private overlay: Overlay, private injector: Injector) {}

  show() {
    this.requestCount++;


    if (!this.overlayRef && this.requestCount === 1) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: false,
        positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
        panelClass: 'loader-panel',
      });

      const loaderPortal = new ComponentPortal(PsLoaderComponent, null, this.injector);
      this.overlayRef.attach(loaderPortal);
    }
  }

  hide() {
    if (this.requestCount > 0) {
      this.requestCount--;
    }

    // Only detach the overlay if ALL requests have finished
    if (this.requestCount === 0 && this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  // Failsafe: Call this on Logout or Route Change to force cleanup
  forceHide() {
    this.requestCount = 0;
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}