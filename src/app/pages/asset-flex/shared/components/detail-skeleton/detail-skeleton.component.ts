import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Shimmer skeleton for a detail page's initial load — mirrors the .pa-skeleton
 * pattern every list page already uses, instead of a plain "Loading…" string. */
@Component({
  selector: 'app-detail-skeleton',
  templateUrl: './detail-skeleton.component.html',
  styleUrl: './detail-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailSkeletonComponent {
  readonly label = input('Loading…');
}
