import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'ps-empty',
  standalone: true,
  imports: [ CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ps-empty.component.html',
  styleUrl: './ps-empty.component.scss'
})
export class PsEmptyComponent {
  emptyStateImageUrl = input('assets/images/empty-state.png', {alias: 'imageUrl'});
  emptyStateDescription = input('No Data', {alias: 'description'});
  emptyDescriptionTemplate = input<TemplateRef<any> | null>(null, {alias: 'descriptionTemplate'});
  emptyfooterTemplate = input<TemplateRef<any> | null>(null, {alias: 'footerTemplate'});
}
