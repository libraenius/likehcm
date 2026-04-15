export const roleRank = {
  EMPLOYEE: 1,
  HEAD_OF_SECTION: 2,
  HEAD_OF_DIRECTORATE: 3,
  DEPUTY_DEPARTMENT_HEAD: 4,
  DEPARTMENT_HEAD: 5,
  EXECUTIVE: 6
} as const;

export type Role = keyof typeof roleRank;

export type ReportType = "INDIVIDUAL" | "GROUP" | "SUMMARY" | "OVERALL" | "ANALYTIC";

export interface User {
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
