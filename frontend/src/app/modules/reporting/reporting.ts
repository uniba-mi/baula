import { ChartConfiguration, ChartData } from "chart.js"

export interface Report {
    cards: ReportCard[]
}

export interface ReportCard {
    id: string,
    type: 'meta'|'bar'|'table',
    spacingClasses: string,
    cardData: any
}

interface CardData {
    title: string
}

export interface MetaCardData extends CardData {
    items: MetaCardItem[],
    reportData: any
}

interface MetaCardItem {
    iconClass: string,
    name: string,
    data: number,
    tooltip?: string,
}

export interface BarChartCardData extends CardData {
    data: ChartData<'bar'> | undefined, // contains labels (string[]) and datasets ({ backgroundColor: string, data: number }[])
    config: ChartConfiguration<'bar'>['options']
}

export interface TableCardData extends CardData {
    data: any[], 
    columnKeys: string[],
    columns: Column[]
}

interface Column {
    key: string,
    name: string,
}