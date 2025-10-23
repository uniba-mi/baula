import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'expandCourseType',
    standalone: false
})
export class ExpandCourseTypePipe implements PipeTransform {

  transform(type: string): string {
    switch (type) {
        case 'S':
            return 'Seminar';
        case 'V':
            return 'Vorlesung';
        case 'SU':
            return 'Seminaristischer Unterricht';
        case 'PS':
            return 'Proseminar';
        case 'S/HS':
            return 'Seminar/Hauptseminar';
        case 'E':
            return 'Exkursion';
        case 'Ü':
            return 'Übung';
        case 'BS':
            return 'Blockseminar';
        case 'K':
            return 'Kolloquium';
        case 'Tut':
            return 'Tutorium';
        case 'VS': 
            return 'Vertiefungsseminar';
        default:
            return type;
    }
  }

}
