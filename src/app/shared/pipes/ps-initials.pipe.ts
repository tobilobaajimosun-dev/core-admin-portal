import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'psInitials',
  standalone: true
})
export class PsInitialsPipe implements PipeTransform {

  transform(value: string, slice = 1): unknown {
    return value.slice(0, slice).toUpperCase();
  }

}
