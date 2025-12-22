export interface Option {
  value: string | boolean;
  name: string;
  key: string;
  selected?: boolean;
  metadata?: boolean;
}

export interface OptionGroup {
  name: string;
  options: Option[];
}

export interface SearchSettings {
  term: string;
  searchIn: string[];
  advancedSearch?: AdvancedSearchSettings;
  filter?: Option[];
  selectedGrouping?: string
}

export interface AdvancedSearchSettings {
  searchInFields?: string[] | null;
  detailSearch?: DetailSearchOption[];
  filter?: CourseSearchFilters;
}

export interface DetailSearchOption {
  term?: string | null;
  searchIn?: string | null;
}

export interface CourseSearchFilters {
  time?: TimeOptions;
  types?: string[] | string | null;
  departments?: string[] | string | null;
  onlyModuleCourses?: boolean | null;
  onlySelectedCourses?: boolean | null;
}

export interface TimeOptions {
  day?: string | null;
  timeStart?: string | null;
  timeEnd?: string | null;
}
