import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
}

export type RangePosition = 'start' | 'end' | 'middle' | 'single' | null;

@Component({
  selector: 'ps-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ps-date-range-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class PsDateRangePickerComponent implements AfterViewChecked {
  @Output() rangeChange = new EventEmitter<DateRange | null>();
  @ViewChild('anchor')      anchorRef!:   ElementRef;
  @ViewChild('yearListRef') yearListRef!: ElementRef;

  /** Default label shown on the trigger button when no range is selected */
  placeholder = input<string>('Filter by date range');

  // ── UI State ──────────────────────────────────────────────────────────────
  isOpen         = signal(false);
  showYearPicker = signal(false);
  viewDate       = signal<Date>(new Date());
  rangeStart     = signal<Date | null>(null);
  rangeEnd       = signal<Date | null>(null);
  hoverDate      = signal<Date | null>(null);

  private shouldScrollYear = false;

  weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  shortcuts = [
    { label: 'Today',        fn: () => this.setToday()       },
    { label: 'Yesterday',    fn: () => this.setYesterday()   },
    { label: 'Last week',    fn: () => this.setLastWeek()    },
    { label: 'Last month',   fn: () => this.setLastMonth()   },
    { label: 'Last quarter', fn: () => this.setLastQuarter() },
  ];

  // ── Year picker ───────────────────────────────────────────────────────────
  readonly currentYear = new Date().getFullYear();

  years = computed<number[]>(() => {
    const years: number[] = [];
    for (let y = 1990; y <= this.currentYear + 5; y++) years.push(y);
    return years;
  });

  selectedYear = computed(() => this.viewDate().getFullYear());

  toggleYearPicker(): void {
    this.showYearPicker.update(v => !v);
    if (this.showYearPicker()) this.shouldScrollYear = true;
  }

  selectYear(year: number): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(year, d.getMonth(), 1));
    this.showYearPicker.set(false);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollYear && this.yearListRef) {
      this.shouldScrollYear = false;
      const el     = this.yearListRef.nativeElement as HTMLElement;
      const active = el.querySelector('.year-active') as HTMLElement | null;
      if (active) {
        el.scrollTop = active.offsetTop - el.clientHeight / 2 + active.clientHeight / 2;
      }
    }
  }

  // ── Outside click ─────────────────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.anchorRef?.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
      this.showYearPicker.set(false);
    }
  }

  // ── Trigger ───────────────────────────────────────────────────────────────
  toggleOpen(): void {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) this.showYearPicker.set(false);
  }

  clearRange(event: MouseEvent): void {
    event.stopPropagation();
    this.rangeStart.set(null);
    this.rangeEnd.set(null);
    this.hoverDate.set(null);
    this.rangeChange.emit(null);
  }

  hasRange = computed(() => !!this.rangeStart());

  dateRangeLabel = computed(() => {
    const start = this.rangeStart();
    const end   = this.rangeEnd();
    if (!start) return this.placeholder();          // ← uses the input
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!end || this.isSameDay(start, end)) return fmt(start);
    return `${fmt(start)} – ${fmt(end)}`;
  });

  // ── Calendar ──────────────────────────────────────────────────────────────
  monthLabel = computed(() =>
    this.viewDate().toLocaleDateString('en-US', { month: 'long' })
  );
  yearLabel = computed(() => this.viewDate().getFullYear());

  calendarDays = computed<CalendarDay[]>(() => {
    const view  = this.viewDate();
    const year  = view.getFullYear();
    const month = view.getMonth();
    const firstDay  = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const days: CalendarDay[] = [];
    for (let i = startOffset - 1; i >= 0; i--)
      days.push(this.makeDay(new Date(year, month, -i), false));
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++)
      days.push(this.makeDay(new Date(year, month, i), true));
    const remaining = 7 - (days.length % 7);
    if (remaining < 7)
      for (let i = 1; i <= remaining; i++)
        days.push(this.makeDay(new Date(year, month + 1, i), false));
    return days;
  });

  private makeDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    return {
      date, isCurrentMonth,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday:   this.isSameDay(date, new Date()),
    };
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  prevMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  nextMonth(): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  // ── Day selection ─────────────────────────────────────────────────────────
  selectDay(day: CalendarDay): void {
    const start = this.rangeStart();
    const end   = this.rangeEnd();
    if (!start || (start && end)) {
      this.rangeStart.set(day.date);
      this.rangeEnd.set(null);
    } else {
      if (day.date < start) {
        this.rangeEnd.set(start);
        this.rangeStart.set(day.date);
      } else {
        this.rangeEnd.set(day.date);
      }
      this.rangeChange.emit({ start: this.rangeStart(), end: this.rangeEnd() });
      this.isOpen.set(false);
    }
  }

  onHover(date: Date): void { this.hoverDate.set(date); }
  onLeave(): void           { this.hoverDate.set(null); }

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  setToday(): void {
    const t = this.startOfDay(new Date());
    this.applyRange(t, t);
  }
  setYesterday(): void {
    const t = this.startOfDay(new Date());
    const y = new Date(t);
    y.setDate(t.getDate() - 1);
    this.applyRange(y, y);
  }
  setLastWeek(): void {
    const today = this.startOfDay(new Date());
    const dow   = today.getDay() || 7;
    const mon   = new Date(today);
    mon.setDate(today.getDate() - dow - 6);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    this.applyRange(mon, sun);
  }
  setLastMonth(): void {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth(), 0);
    this.applyRange(start, end);
  }
  setLastQuarter(): void {
    const now        = new Date();
    const currentQ   = Math.floor(now.getMonth() / 3);
    const prevQStart = new Date(now.getFullYear(), (currentQ - 1) * 3, 1);
    const prevQEnd   = new Date(now.getFullYear(), currentQ * 3, 0);
    this.applyRange(prevQStart, prevQEnd);
  }
  private applyRange(start: Date, end: Date): void {
    this.rangeStart.set(start);
    this.rangeEnd.set(end);
    this.viewDate.set(new Date(start.getFullYear(), start.getMonth(), 1));
    this.rangeChange.emit({ start, end });
    this.isOpen.set(false);
  }
  onReset(): void {
    this.rangeStart.set(null);
    this.rangeEnd.set(null);
    this.hoverDate.set(null);
    this.rangeChange.emit(null);
    this.isOpen.set(false);
    this.showYearPicker.set(false);
  }

  // ── Day state helpers ─────────────────────────────────────────────────────
  getRangePosition(day: CalendarDay): RangePosition {
    const start  = this.rangeStart();
    const rawEnd = this.rangeEnd() ?? this.hoverDate();
    if (!start) return null;
    const effectiveStart = rawEnd && rawEnd < start ? rawEnd : start;
    const effectiveEnd   = rawEnd ? (rawEnd < start ? start : rawEnd) : null;
    if (this.isSameDay(day.date, effectiveStart) &&
        (!effectiveEnd || this.isSameDay(day.date, effectiveEnd))) return 'single';
    if (this.isSameDay(day.date, effectiveStart)) return 'start';
    if (effectiveEnd && this.isSameDay(day.date, effectiveEnd)) return 'end';
    if (effectiveEnd && day.date > effectiveStart && day.date < effectiveEnd) return 'middle';
    return null;
  }
  getDayClasses(day: CalendarDay, pos: RangePosition): string {
    if (pos === 'start' || pos === 'end' || pos === 'single') return 'bg-[#00ABF5]';
    if (!pos && day.isCurrentMonth) return 'hover:bg-[#F5F7FA]';
    return '';
  }
  getDayTextClasses(day: CalendarDay, pos: RangePosition): string {
    if (pos === 'start' || pos === 'end' || pos === 'single') return 'text-white font-semibold';
    if (pos === 'middle') return 'text-[#00B3FF] font-medium';
    if (!day.isCurrentMonth) return 'text-[#C5CDD3]';
    if (day.isToday) return 'text-[#00B3FF] font-semibold';
    return 'text-[#2B3033]';
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}