import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'courseFormat',
    standalone: false
})
export class CourseFormatPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): string {
    // TODO: Can you translate the return values?
    switch (value) {
      case 'praesenz':
        return 'Präsenz'
      case 'both':
        return 'Präsenz + Online-Anteile';
      case 'hybrid':
        return 'Präsenz/Online parallel';
      case 'online':
        return 'Online';
      case 'none':
        return 'Fällt aus';
      default:
        return 'Kein Format vorhanden!';
    }
  }
}
