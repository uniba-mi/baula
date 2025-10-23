

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SimilarityService {
    modulesInState$: any;

    // for status updates everywhere without reloading
    private moduleAcronymSource = new BehaviorSubject<string | null>(null);
    currentAcronym$ = this.moduleAcronymSource.asObservable();

    constructor() { }

    // calculates and returns similarity score
    calculateSimilarityScore(str1: string, str2: string): number {

        // colons and multiple whitespaces and newlines
        const reduceSpaces = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase();
        const removeColons = (str: string) => str.replace(/:/g, '');

        let strippedStr1 = removeColons(reduceSpaces(str1));
        let strippedStr2 = removeColons(reduceSpaces(str2));

        // remove content in parenthesis
        const baseStr1 = strippedStr1.replace(/\(.*?\)/g, '');
        const baseStr2 = strippedStr2.replace(/\(.*?\)/g, '');

        const distance = this.calculateLevenshteinDistance(baseStr1, baseStr2);
        const maxLength = Math.max(baseStr1.length, baseStr2.length);
        return 1 - (distance / maxLength);
    }

    // calculate levenshtein distance between strings
    calculateLevenshteinDistance(s1: string, s2: string): number {
        const a = s1.split('');
        const b = s2.split('');
        const matrix = Array.from({ length: b.length + 1 }, (_, i) => Array.from({ length: a.length + 1 }, (_, j) => i && j ? 0 : i + j));
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
        }
        return matrix[b.length][a.length];
    }
}