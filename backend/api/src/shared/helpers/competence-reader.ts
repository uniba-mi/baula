import { Fulfillment } from "../../../../../interfaces/competence";

export class CompetenceReader {
    constructor() {}

    parseCompetences(text: string): Promise<Fulfillment[]> {
        const competenceSequence = this.findCompetenceSequence(text)
        let result: Promise<Fulfillment[]> = new Promise((resolve, reject) => {
            if(competenceSequence){
                resolve(competenceSequence);
            } else {
                // no competences found
                resolve([]);
            }
        })
        return result;
    }

    private findCompetenceSequence(text: string): Fulfillment[] {
        let result = []
        const found = [...text.matchAll(/(#+ \w* #+)(.[^#]+)(#+)/g)]
        for(let entry of found) {
            const competences = [...entry[2].matchAll(/((?:KMK|LPO|DGfE) [IV]+\.\d): (\d{1,3})%/g)]
            for(let competence of competences) {
                result.push({
                    compId: competence[1],
                    fulfillment: Number(competence[2])
                });
            }
        }
        return result;
    }
}