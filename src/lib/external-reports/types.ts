export const roleRank = {
  EMPLOYEE: 1,
  HEAD_OF_SECTION: 2,
  HEAD_OF_DIRECTORATE: 3,
  DEPUTY_DEPARTMENT_HEAD: 4,
  DEPARTMENT_HEAD: 5,
  EXECUTIVE: 6,
} as const;

export type Role = keyof typeof roleRank;

export type ReportType =
  | "INDIVIDUAL"
  | "GROUP"
  | "SUMMARY"
  | "OVERALL"
  | "ANALYTIC";

export interface ReportUser {
  id: string;
  fullName: string;
  role: Role;
  unitId: string;
  managerId: string | null;
  isResearchCustomer?: boolean;
}

export interface OrgUnit {
  id: string;
  name: string;
  parentUnitId: string | null;
  managerUserId: string;
}

export interface Report {
  id: string;
  providerId: string;
  procedureId: string;
  procedureName: string;
  type: ReportType;
  title: string;
  filePath: string;
  ownerUserId: string | null;
  unitId: string | null;
  uploadedAt: string;
  customViewerUserIds: string[];
}

export interface VisibilityPolicy {
  reportType: ReportType;
  allowSelfOwner: boolean;
  allowOwnerManagerChain: boolean;
  allowUnitManagerHierarchy: boolean;
  minimumRoleRankForUnitHierarchy: number;
  allowResearchCustomers: boolean;
  additionalViewerRoleRanks: number[];
}

export const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Сотрудник",
  HEAD_OF_SECTION: "Начальник отдела",
  HEAD_OF_DIRECTORATE: "Начальник управления",
  DEPUTY_DEPARTMENT_HEAD: "Зам. начальника департамента",
  DEPARTMENT_HEAD: "Начальник департамента",
  EXECUTIVE: "Курирующее ВДЛ",
};

export const reportTypeLabels: Record<ReportType, string> = {
  INDIVIDUAL: "Индивидуальный",
  GROUP: "Групповой",
  SUMMARY: "Сводный",
  OVERALL: "Общий",
  ANALYTIC: "Аналитический",
};

export const REPORT_TYPES: ReportType[] = [
  "INDIVIDUAL",
  "GROUP",
  "SUMMARY",
  "OVERALL",
  "ANALYTIC",
];

export const ROLES: Role[] = [
  "EMPLOYEE",
  "HEAD_OF_SECTION",
  "HEAD_OF_DIRECTORATE",
  "DEPUTY_DEPARTMENT_HEAD",
  "DEPARTMENT_HEAD",
  "EXECUTIVE",
];
