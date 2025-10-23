import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'decimalFormat',
    standalone: false
})

// only needed so the grade 1 can be displayed as 1.0 because the 0 is cut by default
export class DecimalFormatPipe implements PipeTransform {

    transform(value: number | string | undefined, digits: string = '1.0-1'): string {
        if (value === null || value === undefined) return '';
        const numericValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numericValue)) return '';

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: parseInt(digits.split('-')[0]),
            maximumFractionDigits: parseInt(digits.split('-')[1] || digits.split('-')[0]),
        }).format(numericValue);
    }
}
