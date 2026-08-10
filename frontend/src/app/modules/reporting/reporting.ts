export interface Report {
    cards: ReportCard[]
}

export interface ReportCard {
    id: string,
    type: 'meta'|'bar'|'boxplot'|'line'|'table'|'quote',
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
    data: number | string,
    tooltip?: string,
}

export interface BarChartCardData extends CardData {
    xLabels: string[],
    series: BarChartSeries[]
}

interface BarChartSeries {
    name?: string,
    data: (number | BarChartDataPoint)[],
    color?: string, // default color for the whole series
}

interface BarChartDataPoint {
    value: number,
    color?: string, // overrides the series color for this single bar
}

export interface BoxplotCardData extends CardData {
    categories: string[], // construct/metric names (e.g. PU, PEOU, BI, NPS) - drive box color and the legend
    groups: string[], // outer x-axis groups, e.g. semester labels; a single '' entry means "no outer grouping"
    data: (number[] | null)[][], // [groupIndex][categoryIndex] -> [min, Q1, median, Q3, max] (Tukey-clamped), or null if that group/category has no data
    outliers: number[][][], // [groupIndex][categoryIndex] -> values lying outside the Tukey fences (empty if none)
}

export interface LineChartCardData extends CardData {
    xLabels: string[],
    series: LineChartSeries[]
}

interface LineChartSeries {
    name: string,
    data: number[],
}

export interface QuoteCardData extends CardData {
    quotes: Quote[]
}

interface Quote {
    text: string,
    meta?: string,
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

export interface BoxplotStats {
    stats: number[], // [min, Q1, median, Q3, max], whiskers clamped to the Tukey fences
    outliers: number[], // values lying outside the Tukey fences
}

/**
 * Computes [min, Q1, median, Q3, max] for a set of numeric values (linear-interpolation quartiles).
 * Whiskers follow the Tukey convention: they extend only to the most extreme value still within
 * 1.5*IQR of Q1/Q3; values beyond that are reported separately as outliers instead of stretching the whisker.
 */
export function computeBoxplotStats(values: number[]): BoxplotStats {
    const sorted = [...values].sort((a, b) => a - b);
    const quantile = (q: number): number => {
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        return sorted[base + 1] !== undefined
            ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
            : sorted[base];
    };
    const q1 = quantile(0.25);
    const q3 = quantile(0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const inRange = sorted.filter((v) => v >= lowerFence && v <= upperFence);
    const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

    return {
        stats: [
            inRange.length ? inRange[0] : sorted[0],
            q1,
            quantile(0.5),
            q3,
            inRange.length ? inRange[inRange.length - 1] : sorted[sorted.length - 1],
        ],
        outliers,
    };
}
