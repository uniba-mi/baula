"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetenceReader = void 0;
class CompetenceReader {
    constructor() { }
    parseCompetences(text) {
        const competenceSequence = this.findCompetenceSequence(text);
        let result = new Promise((resolve, reject) => {
            if (competenceSequence) {
                resolve(competenceSequence);
            }
            else {
                // no competences found
                resolve([]);
            }
        });
        return result;
    }
    findCompetenceSequence(text) {
        let result = [];
        const found = [...text.matchAll(/(#+ \w* #+)(.[^#]+)(#+)/g)];
        for (let entry of found) {
            const competences = [...entry[2].matchAll(/((?:KMK|LPO|DGfE) [IV]+\.\d): (\d{1,3})%/g)];
            for (let competence of competences) {
                result.push({
                    compId: competence[1],
                    fulfillment: Number(competence[2])
                });
            }
        }
        return result;
    }
}
exports.CompetenceReader = CompetenceReader;
