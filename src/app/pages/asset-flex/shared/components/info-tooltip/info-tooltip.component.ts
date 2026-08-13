import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { InformationCircleIcon } from '@hugeicons-pro/core-stroke-rounded';

let nextId = 0;

/**
 * Stripe-style info tooltip: hover/focus the (i) trigger to reveal a short
 * explanation directly beneath it — no click, no modal. Also toggles on
 * click/tap so it still works on touch devices that can't hover.
 */
@Component({
  selector: 'app-info-tooltip',
  imports: [HugeiconsIconComponent],
  templateUrl: './info-tooltip.component.html',
  styleUrl: './info-tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTooltipComponent {
  readonly text = input.required<string>();
  readonly label = input('More info');

  protected readonly infoIcon = InformationCircleIcon;
  protected readonly open = signal(false);
  protected readonly tooltipId = `info-tooltip-${nextId++}`;

  protected show(): void {
    this.open.set(true);
  }

  protected hide(): void {
    this.open.set(false);
  }

  protected onTriggerClick(event: Event): void {
    // Trigger sits inside clickable cards/rows in some places — never let
    // the click reach a parent routerLink or row handler.
    event.preventDefault();
    event.stopPropagation();
    this.open.update((v) => !v);
  }
}
