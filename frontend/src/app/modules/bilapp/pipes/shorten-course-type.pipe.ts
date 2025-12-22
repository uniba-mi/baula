import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ShortenCourseType',
    standalone: false
})
export class ShortenCourseTypePipe implements PipeTransform {
  transform(type: string): string {
    switch (type) {
        case 'Seminar':
            return 'S';
        case 'Vorlesung':
            return 'V';
        case 'Übung':
            return 'Ü';
        case 'Blockseminar':
            return 'BS';
        case 'Kolloquium':
            return 'K';
        case 'Tutorium':
            return 'Tut';
        case 'Sonstige Lehrveranstaltung':
            return 'SL';
        case 'Vertiefungsseminar':
            return 'VS';
        default:
            return type;
    }
  }
}
