import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'showWeekday',
    standalone: false
})
export class ShowWeekdayPipe implements PipeTransform {
  transform(value: string): string {
    const parts = value.trim().split(' ');
    let rhythm = parts[0];
    let weekday = parts[1];

    // decode rhythm
    switch (rhythm) {
      case 'w1':
        rhythm = 'wöchentlich'
        break;
      case 's1':
        rhythm = ''
        break;
      default:
        break;
    }

    // decode weekday
    switch (weekday) {
      case '0':
        weekday = 'So,';
        break;
      case '1':
        weekday = 'Mo,';
        break;
      case '2':
        weekday = 'Di,';
        break;
      case '3':
        weekday = 'Mi,';
        break;
      case '4':
        weekday = 'Do,';
        break;
      case '5':
        weekday = 'Fr,';
        break;
      case '6':
        weekday = 'Sa,';
        break;
      
      default:
        weekday = '';
        break;
    }


    return `${rhythm} ${weekday}`;
  }

}
