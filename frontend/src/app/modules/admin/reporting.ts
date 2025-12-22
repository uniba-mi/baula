import { ChartConfiguration, ChartData } from "chart.js"

export interface AdminReport {
    allUsers: number,
    activeUsers: number,
    lastActiveUsersHistory: Frequency[],
    frequencyModuleStatus: Frequency[],
    frequencyStudyProgrammes: Frequency[],
    frequencyDuration: Frequency[],
    frequencyStartSemester: Frequency[],
    frequencyCompletedModules: Frequency[],
    frequencyModulesAsCompleted: Frequency[],
    frequencyStudyPlans: number,
    frequencyStudyPlansClustered: Frequency[],
    frequencyPlannedCourses: CourseFrequency[],
}

interface CourseFrequency extends Frequency {
    id: string,
    semester: string,
}

interface Frequency {
    name: string,
    count: number,
}

interface CardData {
    title: string
}

export interface MetaCardData extends CardData {
    items: MetaCardItem[],
    reportData: JSON
}

interface MetaCardItem {
    iconClass: string,
    name: string,
    data: number,
    tooltip?: string,
}

export interface BarChartCardData extends CardData {
    id: string,
    data: ChartData<'bar'> | undefined,
    config: ChartConfiguration<'bar'>
}

export interface TableCardData extends CardData {
    data: any[],
    columns: Column[]
}

interface Column {
    key: string,
    name: string,
}