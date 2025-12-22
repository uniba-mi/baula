import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'courseLang',
    standalone: false
})
export class CourseLangPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    switch (value) {
      case 'de':
        return 'Deutsch';
      case 'en':
        return 'Englisch';
      case 'it':
        return 'Italienisch';
      case 'es':
        return 'Spanisch';
      case 'eg':
        return 'Deutsch/Englisch on Demand'
      default:
        return 'Sonstige Sprache'
    }
  }

}
