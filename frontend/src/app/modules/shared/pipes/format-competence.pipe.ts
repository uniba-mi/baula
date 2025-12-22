import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatCompetence',
    standalone: false
})
export class FormatCompetencePipe implements PipeTransform {
  /**
   * Own Pipe thats transforms the competenceID (e.g. KMK_I_1) into a "human readable" form (e.g. KMK I.1)
   * @param competenceID
   * @returns transformed competenceID
   */
  transform(competenceID: string): string {
    if (competenceID) {
      if (competenceID.split('_').length == 3) {
        return (
          competenceID.split('_')[0] +
          ' ' +
          competenceID.split('_')[1] +
          '.' +
          competenceID.split('_')[2]
        );
      } else {
        return competenceID.split('_')[0] + ' ' + competenceID.split('_')[1];
      }
    } else {
      return '';
    }
  }
}
