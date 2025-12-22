import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Semester',
  standalone: false
})

// gets a univis semester as input and returns full semester (Wintersemester YEAR/YEAR)
export class SemesterPipe implements PipeTransform {
  transform(value: string): string {
    let year = Number(value.slice(0, 4))
    let result = '';
    if ((value.endsWith('w') || value.endsWith('2')) && !Number.isNaN(year)) {
      result = `Wintersemester ${year}/${year + 1}`;
    } else if ((value.endsWith('s') || value.endsWith('1')) && !Number.isNaN(year)) {
      result = `Sommersemester ${year}`;
    }
    return result;
  }
}
