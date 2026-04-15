import { orgUnits, users } from "./mock-data";
import type {
  Report,
  ReportType,
  ReportUser,
  VisibilityPolicy,
} from "./types";
import { roleRank } from "./types";

const userById = (userId: string): ReportUser | undefined =>
  users.find((u) => u.id === userId);

const unitById = (unitId: string) =>
  orgUnits.find((u) => u.id === unitId);

export const getManagerChain = (userId: string): string[] => {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current = userById(userId);

  while (current?.managerId) {
    if (seen.has(current.managerId)) break;
    seen.add(current.managerId);
    chain.push(current.managerId);
    current = userById(current.managerId);
  }

  return chain;
};

export const isUnitManagerInHierarchy = (
  userId: string,
  unitId: string,
): boolean => {
  const seen = new Set<string>();
  let currentUnit = unitById(unitId);

  while (currentUnit) {
    if (currentUnit.managerUserId === userId) return true;
    if (!currentUnit.parentUnitId || seen.has(currentUnit.parentUnitId)) break;
    seen.add(currentUnit.parentUnitId);
    currentUnit = unitById(currentUnit.parentUnitId);
  }

  return false;
};

export const canUserViewReport = (
  viewerUserId: string,
  report: Report,
  policies: VisibilityPolicy[],
): boolean => {
  const viewer = userById(viewerUserId);
  if (!viewer) return false;

  if (report.customViewerUserIds.includes(viewerUserId)) return true;

  const policy = policies.find((p) => p.reportType === report.type);
  if (!policy) return false;

  const viewerRoleRank = roleRank[viewer.role];

  if (policy.additionalViewerRoleRanks.includes(viewerRoleRank)) return true;

  if (policy.allowResearchCustomers && viewer.isResearchCustomer) return true;

  if (
    policy.allowSelfOwner &&
    report.ownerUserId &&
    report.ownerUserId === viewerUserId
  )
    return true;

  if (
    policy.allowOwnerManagerChain &&
    report.ownerUserId &&
    getManagerChain(report.ownerUserId).includes(viewerUserId)
  )
    return true;

  if (
    policy.allowUnitManagerHierarchy &&
    report.unitId &&
    viewerRoleRank >= policy.minimumRoleRankForUnitHierarchy &&
    isUnitManagerInHierarchy(viewerUserId, report.unitId)
  )
    return true;

  return false;
};

export const getVisibleReports = (
  viewerUserId: string,
  reports: Report[],
  policies: VisibilityPolicy[],
): Report[] =>
  reports.filter((report) => canUserViewReport(viewerUserId, report, policies));

export const getSubordinateUserIds = (managerId: string): string[] =>
  users
    .filter((u) => {
      const chain = getManagerChain(u.id);
      return chain.includes(managerId);
    })
    .map((u) => u.id);

export const policyByType = (
  type: ReportType,
  policies: VisibilityPolicy[],
): VisibilityPolicy | undefined =>
  policies.find((p) => p.reportType === type);
