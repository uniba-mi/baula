import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'SemesterShort',
    standalone: false
})
// gets a univis semester as input and returns short semester (WS YEAR/YEAR)
export class SemesterShortPipe implements PipeTransform {
    transform(value: string): string {
        let year = Number(value.slice(0, 4));
        if (value.endsWith('w') && !Number.isNaN(year)) {
            return `WS ${year}/${year + 1}`;
        } else if (value.endsWith('s') && !Number.isNaN(year)) {
            return `SS ${year}`;
        }
        return '';
    }
}