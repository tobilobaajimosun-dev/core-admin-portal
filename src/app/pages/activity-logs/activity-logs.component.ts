import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ActivityLogsStore } from '@core/store/activity-logs.store';
import { ActivityLog } from '@core/interfaces/activity-logs.model';
import { PsEmptyComponent } from '@ui/ps-empty/ps-empty.component';
import { DateRange, PsDateRangePickerComponent } from '@ui/ps-date-range-picker/ps-date-range-picker.component';

interface LogGroup {
  label: string;
  logs:  ActivityLog[];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

@Component({
  selector:        'app-activity-logs',
  standalone:      true,
  imports:         [CommonModule, PsDateRangePickerComponent, PsEmptyComponent],
  templateUrl:     './activity-logs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogsComponent implements OnInit {
  protected logsStore = inject(ActivityLogsStore);

  ngOnInit(): void {
    this.logsStore.fetchActivityLogs(this.logsStore.listConfig());
  }

onRangeChange(range: DateRange | null): void {
  this.logsStore.onDateRangeChange(
    range?.start ? range.start.toISOString() : undefined,
    range?.end   ? range.end.toISOString()   : undefined,
  );
}

  logGroups = computed<LogGroup[]>(() => {
    const logs      = this.logsStore.activityLogs();
    const today     = startOfDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, ActivityLog[]> = {
      'Today':             [],
      'Yesterday':         [],
      'Earlier this week': [],
    };

    for (const log of logs) {
      const createdAt = new Date(log.created_at);
      if (isSameDay(createdAt, today)) {
        groups['Today'].push(log);
      } else if (isSameDay(createdAt, yesterday)) {
        groups['Yesterday'].push(log);
      } else {
        groups['Earlier this week'].push(log);
      }
    }

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([label, items]) => ({ label, logs: items }));
  });
}