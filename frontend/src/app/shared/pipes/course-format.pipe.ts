import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'courseFormat',
    standalone: false
})
export class CourseFormatPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): string {
    switch (value) {
      case 'praesenz':
        return $localize`Präsenz`
      case 'both':
        return $localize`Präsenz + Online-Anteile`;
      case 'hybrid':
        return $localize`Präsenz/Online parallel`;
      case 'online':
        return $localize`Online`;
      case 'none':
        return $localize`Fällt aus`;
      default:
        return $localize`Kein Format vorhanden!`;
    }
  }
}
