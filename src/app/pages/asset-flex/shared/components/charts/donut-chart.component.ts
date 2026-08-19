import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

/**
 * Clean donut for categorical breakdowns (e.g. loan status). Colours are
 * passed in so they stay in sync with the legend rendered alongside it.
 * The centre shows the total.
 */
@Component({
  selector: 'af-donut-chart',
  imports: [NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<apx-chart
    [series]="series()"
    [chart]="options().chart!"
    [labels]="labels()"
    [colors]="colors()"
    [stroke]="options().stroke!"
    [dataLabels]="options().dataLabels!"
    [legend]="options().legend!"
    [plotOptions]="options().plotOptions!"
    [tooltip]="options().tooltip!"
  />`,
})
export class DonutChartComponent {
  readonly values = input.required<number[]>();
  readonly labels = input.required<string[]>();
  readonly colors = input.required<string[]>();
  readonly height = input(220);
  readonly centerLabel = input('Total');

  protected readonly series = computed(() => this.values());

  protected readonly options = computed<ApexOptions>(() => ({
    chart: { type: 'donut', height: this.height(), fontFamily: 'inherit', animations: { enabled: true, speed: 400 } },
    stroke: { width: 2, colors: ['#fff'] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: this.centerLabel(),
              color: '#8792a2',
              fontSize: '12px',
              formatter: (w: { globals: { seriesTotals: number[] } }) =>
                String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
            value: { color: '#1a1f36', fontSize: '20px', fontWeight: 600 },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v: number) => String(v) } },
  }));
}
