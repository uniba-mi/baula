export interface Competence {
    compId: string,
    short: string,
    name: string,
    desc: string,
    parentId?: string,
    stId: string,
    aim?: number
}

export interface CompetenceFulfillment extends Fulfillment {
  cId: string,
  semester: string,
}

export interface Fulfillment {
  compId: string,
  fulfillment: number,
}