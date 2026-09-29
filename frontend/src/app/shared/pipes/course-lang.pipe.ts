import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'courseLang',
    standalone: false
})
export class CourseLangPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): string {
    switch (value) {
      case 'de':
        return $localize`Deutsch`;
      case 'en':
        return $localize`Englisch`;
      case 'it':
        return $localize`Italienisch`;
      case 'es':
        return $localize`Spanisch`;
      case 'eg':
        return $localize`Deutsch/Englisch on Demand`
      default:
        return $localize`Sonstige Sprache`
    }
  }

}
