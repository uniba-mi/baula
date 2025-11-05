import { Fulfillment } from "../../competence";
export declare class CompetenceReader {
    constructor();
    parseCompetences(text: string): Promise<Fulfillment[]>;
    private findCompetenceSequence;
}
