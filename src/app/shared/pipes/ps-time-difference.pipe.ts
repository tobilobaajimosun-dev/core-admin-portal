import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'psTimeDifference',
  standalone: true
})
export class PsTimeDifferencePipe implements PipeTransform {
  transform(
    startTime: string | null | undefined,
    endTime: string | null | undefined
  ): string {
    if (!startTime || !endTime) return '0 min';

    let startTimeMs: number;
    let endTimeMs: number;
    try {
      startTimeMs = new Date(startTime.replace(' ', 'T').replace(/\.\d+Z$/, 'Z')).getTime();
      endTimeMs = new Date(endTime.replace(' ', 'T') + 'Z').getTime();
    } catch (error) {
      return 'Invalid date';
    }

    const timeDifferenceMs = endTimeMs - startTimeMs;
    if (timeDifferenceMs <= 0) return '0 min';

    const totalMinutes = Math.ceil(timeDifferenceMs / 60000);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    if (totalHours < 1) {
      return `${totalMinutes} min${totalMinutes !== 1 ? 's' : ''}`;
    }

    if (totalHours < 24) {
      const minutes = totalMinutes % 60;
      return minutes
        ? `${totalHours} hr${totalHours !== 1 ? 's' : ''} ${minutes} min`
        : `${totalHours} hr${totalHours !== 1 ? 's' : ''}`;
    }

    const remainingHours = totalHours % 24;
    return remainingHours
      ? `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hr`
      : `${days} day${days !== 1 ? 's' : ''}`;
}
}

