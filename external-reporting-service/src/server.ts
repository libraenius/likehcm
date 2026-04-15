import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { canUserViewReport, policyByType } from "./access.js";
import { orgUnits, policies, reports, users } from "./data.js";
import { ReportType, roleRank } from "./types.js";

const app = express();
app.use(express.json());

const uploadDirectory = path.resolve(process.cwd(), "uploads");
const publicDirectory = path.resolve(process.cwd(), "public");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({ dest: uploadDirectory });
app.use(express.static(publicDirectory));

const reportTypeSchema = z.enum(["INDIVIDUAL", "GROUP", "SUMMARY", "OVERALL", "ANALYTIC"]);

const uploadPayloadSchema = z.object({
  providerId: z.string().min(1),
  type: reportTypeSchema,
  title: z.string().min(3),
  ownerUserId: z.string().nullable().optional(),
  unitId: z.string().nullable().optional()
});

const updatePolicySchema = z.object({
  allowSelfOwner: z.boolean(),
  allowOwnerManagerChain: z.boolean(),
  allowUnitManagerHierarchy: z.boolean(),
  minimumRoleRankForUnitHierarchy: z.number().int().min(1).max(6),
  allowResearchCustomers: z.boolean(),
  additionalViewerRoleRanks: z.array(z.number().int().min(1).max(6))
});

app.get("/", (_req, res) => {
  res.json({
    service: "external-reporting-service",
    status: "ok",
    docs: {
      health: "/health",
      users: "/api/users",
      policies: "/api/policies",
      reports: "/api/reports",
      reportTypes: "/api/reference/report-types",
      roles: "/api/reference/roles"
    }
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/users", (_req, res) => {
  res.json(users);
});

app.get("/api/policies", (_req, res) => {
  res.json(policies);
});

app.put("/api/policies/:reportType", (req, res) => {
  const reportType = reportTypeSchema.safeParse(req.params.reportType);
  if (!reportType.success) {
    return res.status(400).json({ error: "Unsupported report type." });
  }

  const payload = updatePolicySchema.safeParse(req.body);
  if (!payload.success) {
    return res.status(400).json({ error: payload.error.flatten() });
  }

  const policy = policyByType(reportType.data);
  if (!policy) {
    return res.status(404).json({ error: "Policy not found." });
  }

  policy.allowSelfOwner = payload.data.allowSelfOwner;
  policy.allowOwnerManagerChain = payload.data.allowOwnerManagerChain;
  policy.allowUnitManagerHierarchy = payload.data.allowUnitManagerHierarchy;
  policy.minimumRoleRankForUnitHierarchy = payload.data.minimumRoleRankForUnitHierarchy;
  policy.allowResearchCustomers = payload.data.allowResearchCustomers;
  policy.additionalViewerRoleRanks = payload.data.additionalViewerRoleRanks;

  return res.json(policy);
});

app.post("/api/reports/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  const payload = uploadPayloadSchema.safeParse({
    providerId: req.body.providerId,
    type: req.body.type,
    title: req.body.title,
    ownerUserId: req.body.ownerUserId ?? null,
    unitId: req.body.unitId ?? null
  });

  if (!payload.success) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: payload.error.flatten() });
  }

  if (payload.data.ownerUserId && !users.find((user) => user.id === payload.data.ownerUserId)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Unknown ownerUserId." });
  }

  const report = {
    id: randomUUID(),
    providerId: payload.data.providerId,
    type: payload.data.type,
    title: payload.data.title,
    filePath: req.file.path,
    ownerUserId: payload.data.ownerUserId ?? null,
    unitId: payload.data.unitId ?? null,
    uploadedAt: new Date().toISOString(),
    customViewerUserIds: []
  };

  reports.push(report);
  return res.status(201).json(report);
});

app.post("/api/reports/mock-seed", (_req, res) => {
  if (reports.length > 0) {
    return res.status(409).json({
      error: "Reports already exist. Clear current reports first or use existing dataset."
    });
  }

  const createMockFile = (name: string, body: string) => {
    const filePath = path.join(uploadDirectory, name);
    fs.writeFileSync(filePath, body, "utf-8");
    return filePath;
  };

  const now = new Date().toISOString();
  const seeded = [
    {
      id: randomUUID(),
      providerId: "provider-mock",
      type: "INDIVIDUAL" as ReportType,
      title: "Индивидуальный отчет сотрудника отдела оценки",
      filePath: createMockFile("mock-individual-u-employee.txt", "Mock individual report for u-employee"),
      ownerUserId: "u-employee",
      unitId: "unit-assessment",
      uploadedAt: now,
      customViewerUserIds: []
    },
    {
      id: randomUUID(),
      providerId: "provider-mock",
      type: "GROUP" as ReportType,
      title: "Групповой отчет отдела оценки персонала",
      filePath: createMockFile("mock-group-unit-assessment.txt", "Mock group report for unit-assessment"),
      ownerUserId: null,
      unitId: "unit-assessment",
      uploadedAt: now,
      customViewerUserIds: []
    },
    {
      id: randomUUID(),
      providerId: "provider-mock",
      type: "SUMMARY" as ReportType,
      title: "Сводный отчет по управлению",
      filePath: createMockFile("mock-summary-unit-directorate.txt", "Mock summary report for unit-directorate"),
      ownerUserId: null,
      unitId: "unit-directorate",
      uploadedAt: now,
      customViewerUserIds: []
    },
    {
      id: randomUUID(),
      providerId: "provider-mock",
      type: "OVERALL" as ReportType,
      title: "Общий отчет по департаменту",
      filePath: createMockFile("mock-overall-unit-department.txt", "Mock overall report for unit-department"),
      ownerUserId: null,
      unitId: "unit-department",
      uploadedAt: now,
      customViewerUserIds: []
    },
    {
      id: randomUUID(),
      providerId: "provider-mock",
      type: "ANALYTIC" as ReportType,
      title: "Аналитический отчет по кросс-функциональным командам",
      filePath: createMockFile("mock-analytic-cross-functional.txt", "Mock analytic report"),
      ownerUserId: null,
      unitId: "unit-department",
      uploadedAt: now,
      customViewerUserIds: ["u-customer"]
    }
  ];

  reports.push(...seeded);
  return res.status(201).json({ created: seeded.length, reports: seeded });
});

app.delete("/api/reports", (_req, res) => {
  reports.splice(0, reports.length);
  return res.json({ ok: true });
});

app.post("/api/reports/:reportId/grants", (req, res) => {
  const schema = z.object({ userId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const report = reports.find((item) => item.id === req.params.reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  if (!users.find((user) => user.id === parsed.data.userId)) {
    return res.status(400).json({ error: "Unknown userId." });
  }

  if (!report.customViewerUserIds.includes(parsed.data.userId)) {
    report.customViewerUserIds.push(parsed.data.userId);
  }

  return res.json(report);
});

app.get("/api/reports", (_req, res) => {
  res.json(reports);
});

app.get("/api/reports/:reportId/access/:userId", (req, res) => {
  const report = reports.find((item) => item.id === req.params.reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  return res.json({
    reportId: report.id,
    userId: req.params.userId,
    canView: canUserViewReport(req.params.userId, report)
  });
});

app.get("/api/users/:userId/reports", (req, res) => {
  if (!users.find((user) => user.id === req.params.userId)) {
    return res.status(404).json({ error: "User not found." });
  }

  const visibleReports = reports.filter((report) => canUserViewReport(req.params.userId, report));
  res.json(visibleReports);
});

app.get("/api/reports/:reportId/download", (req, res) => {
  const report = reports.find((item) => item.id === req.params.reportId);
  if (!report) {
    return res.status(404).json({ error: "Report not found." });
  }

  const viewerUserId = String(req.query.userId || "");
  if (!viewerUserId) {
    return res.status(400).json({ error: "Query parameter userId is required." });
  }

  if (!canUserViewReport(viewerUserId, report)) {
    return res.status(403).json({ error: "Access denied." });
  }

  return res.download(report.filePath, `${report.title}.pdf`);
});

app.get("/api/reference/roles", (_req, res) => {
  const map = Object.entries(roleRank).map(([role, rank]) => ({ role, rank }));
  res.json(map);
});

app.get("/api/reference/report-types", (_req, res) => {
  const reportTypes: ReportType[] = ["INDIVIDUAL", "GROUP", "SUMMARY", "OVERALL", "ANALYTIC"];
  res.json(reportTypes);
});

app.get("/api/reference/org-units", (_req, res) => {
  res.json(orgUnits);
});

const port = Number(process.env.PORT || 4010);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`External reporting service started on port ${port}`);
});
