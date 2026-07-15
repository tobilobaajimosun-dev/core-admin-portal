import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-view-loan-skeleton',
  imports: [CommonModule],
  templateUrl: './view-loan-skeleton.component.html',
  styleUrl: './view-loan-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewLoanSkeletonComponent {}
