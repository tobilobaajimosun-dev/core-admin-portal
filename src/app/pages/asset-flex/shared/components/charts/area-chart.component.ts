import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

/**
 * Mercury-style gradient area chart. Thin brand-coloured line over a soft
 * top-down gradient fill, minimal axes, hover tooltip. Themed to the brand
 * primary; pass a `meta` array to show a second line in each point's tooltip
 * (e.g. "34 vendors served").
 */
@Component({
  selector: 'af-area-chart',
  imports: [NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<apx-chart
    [series]="options().series!"
    [chart]="options().chart!"
    [stroke]="options().stroke!"
    [fill]="options().fill!"
    [grid]="options().grid!"
    [xaxis]="options().xaxis!"
    [yaxis]="options().yaxis!"
    [dataLabels]="options().dataLabels!"
    [tooltip]="options().tooltip!"
    [colors]="options().colors!"
  />`,
})
export class AreaChartComponent {
  readonly categories = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly seriesName = input('Value');
  /** Optional formatted second tooltip line, one per point. */
  readonly meta = input<string[]>([]);
  readonly height = input(200);
  readonly color = input('#00b3ff');

  private readonly ngn = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  protected readonly options = computed<ApexOptions>(() => {
    const meta = this.meta();
    const ngn = this.ngn;
    return {
      series: [{ name: this.seriesName(), data: this.values() }],
      chart: {
        type: 'area',
        height: this.height(),
        fontFamily: 'inherit',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, speed: 400 },
        parentHeightOffset: 0,
        sparkline: { enabled: false },
      },
      colors: [this.color()],
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0, stops: [0, 100] },
      },
      grid: {
        borderColor: 'rgba(0,0,0,0.06)',
        strokeDashArray: 0,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 4, bottom: 0, left: 4 },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: this.categories(),
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
        labels: { style: { colors: '#8792a2', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          style: { colors: '#8792a2', fontSize: '11px' },
          formatter: (v: number) => (v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(0)}M` : `₦${Math.round(v / 1000)}k`),
        },
      },
      tooltip: {
        custom: ({ dataPointIndex, series, seriesIndex }) => {
          const val = series[seriesIndex][dataPointIndex] as number;
          const label = this.categories()[dataPointIndex] ?? '';
          const second = meta[dataPointIndex] ? `<span class="af-tt__sub">${meta[dataPointIndex]}</span>` : '';
          return `<div class="af-tt"><strong>${label}</strong><span>${ngn.format(val)}</span>${second}</div>`;
        },
      },
    };
  });
}
