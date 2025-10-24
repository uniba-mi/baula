import { Fulfillment } from "../../../../interfaces/competence";
export declare class CompetenceReader {
    constructor();
    parseCompetences(text: string): Promise<Fulfillment[]>;
    private findCompetenceSequence;
}
