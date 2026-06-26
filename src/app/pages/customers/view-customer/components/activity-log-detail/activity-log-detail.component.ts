import { Component, inject, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-activity-log-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './activity-log-detail.component.html',
})
export class ActivityLogDetailComponent {
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  // Read the log passed via router state (Navigation extras)
  log = computed(() => history.state?.log ?? null);

  goBack() {
    this.router.navigate(['../..'], { relativeTo: this.route });
  }

  formatPayload(payload: Record<string, unknown>): string {
    return JSON.stringify(payload, null, 2);
  }
}