import { orgUnits, policies, users } from "./data.js";
import { Report, ReportType, User, VisibilityPolicy, roleRank } from "./types.js";

const userById = (userId: string): User | undefined => users.find((user) => user.id === userId);
const unitById = (unitId: string) => orgUnits.find((unit) => unit.id === unitId);

export const policyByType = (type: ReportType): VisibilityPolicy | undefined =>
  policies.find((policy) => policy.reportType === type);

export const getManagerChain = (userId: string): string[] => {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current = userById(userId);

  while (current?.managerId) {
    if (seen.has(current.managerId)) {
      break;
    }

    seen.add(current.managerId);
    chain.push(current.managerId);
    current = userById(current.managerId);
  }

  return chain;
};

export const isUnitManagerInHierarchy = (userId: string, unitId: string): boolean => {
  const seen = new Set<string>();
  let currentUnit = unitById(unitId);

  while (currentUnit) {
    if (currentUnit.managerUserId === userId) {
      return true;
    }

    if (!currentUnit.parentUnitId || seen.has(currentUnit.parentUnitId)) {
      break;
    }

    seen.add(currentUnit.parentUnitId);
    currentUnit = unitById(currentUnit.parentUnitId);
  }

  return false;
};

export const canUserViewReport = (viewerUserId: string, report: Report): boolean => {
  const viewer = userById(viewerUserId);
  if (!viewer) {
    return false;
  }

  if (report.customViewerUserIds.includes(viewerUserId)) {
    return true;
  }

  const policy = policyByType(report.type);
  if (!policy) {
    return false;
  }

  const viewerRoleRank = roleRank[viewer.role];
  if (policy.additionalViewerRoleRanks.includes(viewerRoleRank)) {
    return true;
  }

  if (
    policy.allowResearchCustomers &&
    viewer.isResearchCustomer
  ) {
    return true;
  }

  if (
    policy.allowSelfOwner &&
    report.ownerUserId &&
    report.ownerUserId === viewerUserId
  ) {
    return true;
  }

  if (
    policy.allowOwnerManagerChain &&
    report.ownerUserId &&
    getManagerChain(report.ownerUserId).includes(viewerUserId)
  ) {
    return true;
  }

  if (
    policy.allowUnitManagerHierarchy &&
    report.unitId &&
    viewerRoleRank >= policy.minimumRoleRankForUnitHierarchy &&
    isUnitManagerInHierarchy(viewerUserId, report.unitId)
  ) {
    return true;
  }

  return false;
};
