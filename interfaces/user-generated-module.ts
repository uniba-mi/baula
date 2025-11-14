export interface UserGeneratedModule extends UserGeneratedModuleTemplate {
  _id: string;
}

export interface UserGeneratedModuleTemplate {
  acronym: string;
  name: string;
  ects: number;
  status: string | undefined;
  notes?: string;
  mgId: string | undefined;
  flexNowImported: boolean;
}