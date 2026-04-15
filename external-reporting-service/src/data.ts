import { OrgUnit, Report, User, VisibilityPolicy } from "./types.js";

export const users: User[] = [
  { id: "u-employee", fullName: "Сотрудник отдела оценки персонала", role: "EMPLOYEE", unitId: "unit-assessment", managerId: "u-head-section" },
  { id: "u-head-section", fullName: "Начальник отдела", role: "HEAD_OF_SECTION", unitId: "unit-assessment", managerId: "u-head-directorate" },
  { id: "u-head-directorate", fullName: "Начальник управления", role: "HEAD_OF_DIRECTORATE", unitId: "unit-directorate", managerId: "u-deputy-department-head" },
  { id: "u-deputy-department-head", fullName: "Заместитель начальника департамента", role: "DEPUTY_DEPARTMENT_HEAD", unitId: "unit-department", managerId: "u-department-head" },
  { id: "u-department-head", fullName: "Начальник департамента", role: "DEPARTMENT_HEAD", unitId: "unit-department", managerId: "u-executive" },
  { id: "u-executive", fullName: "Курирующее ВДЛ", role: "EXECUTIVE", unitId: "unit-company", managerId: null },
  { id: "u-customer", fullName: "Заказчик исследования", role: "HEAD_OF_DIRECTORATE", unitId: "unit-directorate", managerId: "u-deputy-department-head", isResearchCustomer: true }
];

export const orgUnits: OrgUnit[] = [
  { id: "unit-company", name: "Компания", parentUnitId: null, managerUserId: "u-executive" },
  { id: "unit-department", name: "Департамент", parentUnitId: "unit-company", managerUserId: "u-department-head" },
  { id: "unit-directorate", name: "Управление", parentUnitId: "unit-department", managerUserId: "u-head-directorate" },
  { id: "unit-assessment", name: "Отдел оценки персонала", parentUnitId: "unit-directorate", managerUserId: "u-head-section" }
];

export const reports: Report[] = [];

export const policies: VisibilityPolicy[] = [
  {
    reportType: "INDIVIDUAL",
    allowSelfOwner: true,
    allowOwnerManagerChain: true,
    allowUnitManagerHierarchy: false,
    minimumRoleRankForUnitHierarchy: 1,
    allowResearchCustomers: false,
    additionalViewerRoleRanks: []
  },
  {
    reportType: "GROUP",
    allowSelfOwner: false,
    allowOwnerManagerChain: false,
    allowUnitManagerHierarchy: true,
    minimumRoleRankForUnitHierarchy: 2,
    allowResearchCustomers: false,
    additionalViewerRoleRanks: []
  },
  {
    reportType: "SUMMARY",
    allowSelfOwner: false,
    allowOwnerManagerChain: false,
    allowUnitManagerHierarchy: true,
    minimumRoleRankForUnitHierarchy: 3,
    allowResearchCustomers: false,
    additionalViewerRoleRanks: []
  },
  {
    reportType: "OVERALL",
    allowSelfOwner: false,
    allowOwnerManagerChain: false,
    allowUnitManagerHierarchy: true,
    minimumRoleRankForUnitHierarchy: 4,
    allowResearchCustomers: false,
    additionalViewerRoleRanks: []
  },
  {
    reportType: "ANALYTIC",
    allowSelfOwner: false,
    allowOwnerManagerChain: false,
    allowUnitManagerHierarchy: false,
    minimumRoleRankForUnitHierarchy: 1,
    allowResearchCustomers: true,
    additionalViewerRoleRanks: []
  }
];
