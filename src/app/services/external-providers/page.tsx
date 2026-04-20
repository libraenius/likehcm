"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Building2, ClipboardCheck, Users, Settings, ExternalLink, QrCode, FileText, Calendar, Link2, Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, X, ChevronLeft, ChevronsLeft, ChevronsRight, AlertCircle, Mail, Send, CheckCircle2, Clock, Upload, Download, User, ShieldCheck, BarChart3, Eye, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { getStatusBadgeColor } from "@/lib/badge-colors";
import { RoleSwitcher } from "@/components/external-reports/role-switcher";
import { ReportUploadDialog } from "@/components/external-reports/report-upload-dialog";
import { VisibilityPolicyEditor } from "@/components/external-reports/visibility-policy-editor";
import { ReportsList } from "@/components/external-reports/reports-list";
import { AddParticipantsDialog } from "@/components/external-reports/add-participants-dialog";
import { ProcedureInfoDialog } from "@/components/external-reports/procedure-info-dialog";
import { ProcedureResultDialog } from "@/components/external-reports/procedure-result-dialog";
import { RequestAssessmentDialog } from "@/components/external-reports/request-assessment-dialog";
import type { ProcedureInfo } from "@/components/external-reports/procedure-info-dialog";
import type { ProcedureResult } from "@/components/external-reports/procedure-result-dialog";
import { seedReports, defaultPolicies, users as reportUsers, orgUnits as reportOrgUnits } from "@/lib/external-reports/mock-data";
import { getVisibleReports, getSubordinateUserIds } from "@/lib/external-reports/access";
import { roleLabels, reportTypeLabels } from "@/lib/external-reports/types";
import type { Report, VisibilityPolicy } from "@/lib/external-reports/types";

// Тип для провайдера
interface ExternalProvider {
  id: string;
  name: string;
  description?: string;
  procedures: AssessmentProcedure[];
}

// Тип для участника процедуры
interface ProcedureParticipant {
  id: string;
  fullName: string;
  position: string;
  email: string;
  status: "invited" | "in-progress" | "completed" | "not-started";
  reportUrl?: string;
  departmentId?: string;
  uniqueLink?: string;
}

// Структура подразделений
interface Department {
  id: string;
  name: string;
  parentId?: string;
}

// Моковые данные подразделений
const mockDepartments: Department[] = [
  { id: "dept-1", name: "Департамент автоматизации внутренних сервисов" },
  { id: "dept-2", name: "Управление развития общекорпоративных систем", parentId: "dept-1" },
  { id: "dept-3", name: "Управление разработки банковских продуктов", parentId: "dept-1" },
  { id: "dept-4", name: "Департамент информационной безопасности" },
  { id: "dept-5", name: "Управление качества и тестирования" },
];

// Интерфейс сотрудника из штатного расписания
interface Employee {
  id: string;
  fullName: string;
  position: string;
  email: string;
  departmentId?: string;
}

// Моковые данные сотрудников из штатного расписания
const mockEmployees: Employee[] = [
  { id: "emp-1", fullName: "Петров Иван Сергеевич", position: "Главный инженер", email: "ivan.petrov@example.com", departmentId: "dept-2" },
  { id: "emp-2", fullName: "Сидорова Мария Александровна", position: "Ведущий разработчик", email: "maria.sidorova@example.com", departmentId: "dept-2" },
  { id: "emp-3", fullName: "Иванов Алексей Дмитриевич", position: "Старший разработчик", email: "alexey.ivanov@example.com", departmentId: "dept-3" },
  { id: "emp-4", fullName: "Смирнова Елена Викторовна", position: "QA инженер", email: "elena.smirnova@example.com", departmentId: "dept-4" },
  { id: "emp-5", fullName: "Помыткин Сергей Олегович", position: "Руководитель разработки", email: "s.pomytkin@example.com", departmentId: "dept-1" },
  { id: "emp-6", fullName: "Козлова Анна Петровна", position: "Менеджер проектов", email: "anna.kozlova@example.com", departmentId: "dept-1" },
  { id: "emp-7", fullName: "Морозов Дмитрий Александрович", position: "Специалист", email: "dmitry.morozov@example.com", departmentId: "dept-3" },
  { id: "emp-8", fullName: "Волков Сергей Петрович", position: "Разработчик", email: "sergey.volkov@example.com", departmentId: "dept-2" },
  { id: "emp-9", fullName: "Новикова Анна Игоревна", position: "Аналитик", email: "anna.novikova@example.com", departmentId: "dept-4" },
  { id: "emp-10", fullName: "Лебедев Павел Олегович", position: "Тестировщик", email: "pavel.lebedev@example.com", departmentId: "dept-5" },
  { id: "emp-11", fullName: "Соколова Ольга Владимировна", position: "Дизайнер", email: "olga.sokolova@example.com", departmentId: "dept-2" },
  { id: "emp-12", fullName: "Орлов Максим Сергеевич", position: "Архитектор", email: "maxim.orlov@example.com", departmentId: "dept-1" },
  { id: "emp-13", fullName: "Федорова Татьяна Николаевна", position: "Руководитель команды", email: "tatiana.fedorova@example.com", departmentId: "dept-3" },
  { id: "emp-14", fullName: "Григорьев Андрей Валерьевич", position: "DevOps инженер", email: "andrey.grigoriev@example.com", departmentId: "dept-4" },
  { id: "emp-15", fullName: "Романова Юлия Дмитриевна", position: "Product Manager", email: "yulia.romanova@example.com", departmentId: "dept-1" },
];

// Интерфейс для уведомления
interface Notification {
  id: string;
  subject: string;
  message: string;
  recipientIds: string[];
  recipientEmails: string[];
  sentAt: Date;
  status: "sent" | "pending" | "failed";
}

// Моковые данные для истории уведомлений
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    subject: "Приглашение на оценочную процедуру",
    message: "Уважаемые коллеги, приглашаем вас принять участие в оценочной процедуре...",
    recipientIds: ["emp-1", "emp-2", "emp-3"],
    recipientEmails: ["ivan.petrov@example.com", "maria.sidorova@example.com", "alexey.ivanov@example.com"],
    sentAt: new Date("2024-01-15T10:30:00"),
    status: "sent",
  },
  {
    id: "notif-2",
    subject: "Напоминание о завершении оценки",
    message: "Напоминаем о необходимости завершить оценочную процедуру до...",
    recipientIds: ["emp-4", "emp-5"],
    recipientEmails: ["elena.smirnova@example.com", "s.pomytkin@example.com"],
    sentAt: new Date("2024-01-20T14:15:00"),
    status: "sent",
  },
];

// Тип для оценочной процедуры
interface AssessmentProcedure {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  link: string;
  qrCodeLink: string;
  status: "planned" | "in-progress" | "completed" | "cancelled" | "request";
  reportUrl?: string;
  participants?: ProcedureParticipant[];
}

// Моковые данные провайдеров
const mockProviders: ExternalProvider[] = [
  {
    id: "provider-1",
    name: "Hogan Assessment Systems",
    description: "Ведущий провайдер психометрических оценок",
    procedures: [
      {
        id: "1",
        name: "Оценка лидерских компетенций",
        providerId: "provider-1",
        providerName: "Hogan Assessment Systems",
        description: "Комплексная оценка лидерских качеств и компетенций",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-01-20"),
        link: "https://assessment.example.com/procedure/1",
        qrCodeLink: "https://assessment.example.com/qr/1",
        status: "completed",
        reportUrl: "/reports/assessment-1.pdf",
        participants: [
          { id: "p1-1", fullName: "Иванов Иван Иванович", position: "Руководитель отдела", email: "ivanov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p1.pdf", departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-1" },
          { id: "p1-2", fullName: "Петрова Мария Сергеевна", position: "Ведущий специалист", email: "petrova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p2.pdf", departmentId: "dept-2", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-2" },
          { id: "p1-3", fullName: "Сидоров Алексей Дмитриевич", position: "Старший менеджер", email: "sidorov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p3.pdf", departmentId: "dept-2", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-3" },
          { id: "p1-4", fullName: "Козлова Елена Викторовна", position: "Менеджер проектов", email: "kozlova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p4.pdf", departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-4" },
          { id: "p1-5", fullName: "Морозов Дмитрий Александрович", position: "Специалист", email: "morozov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p5.pdf", departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-5" },
          { id: "p1-6", fullName: "Волков Сергей Петрович", position: "Разработчик", email: "volkov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p6.pdf", departmentId: "dept-4", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-6" },
          { id: "p1-7", fullName: "Новикова Анна Игоревна", position: "Аналитик", email: "novikova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p7.pdf", departmentId: "dept-4", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-7" },
          { id: "p1-8", fullName: "Лебедев Павел Олегович", position: "Тестировщик", email: "lebedev@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p8.pdf", departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-8" },
          { id: "p1-9", fullName: "Соколова Ольга Владимировна", position: "Дизайнер", email: "sokolova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p9.pdf", departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-9" },
          { id: "p1-10", fullName: "Орлов Максим Сергеевич", position: "Архитектор", email: "orlov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p10.pdf", departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-10" },
          { id: "p1-11", fullName: "Федорова Татьяна Николаевна", position: "Руководитель команды", email: "fedorova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p11.pdf", departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-11" },
          { id: "p1-12", fullName: "Григорьев Андрей Валерьевич", position: "DevOps инженер", email: "grigoriev@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p12.pdf", departmentId: "dept-2", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-12" },
          { id: "p1-13", fullName: "Романова Юлия Дмитриевна", position: "Product Manager", email: "romanova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p13.pdf", departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-13" },
          { id: "p1-14", fullName: "Кузнецов Игорь Анатольевич", position: "Бизнес-аналитик", email: "kuznetsov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p14.pdf", departmentId: "dept-4", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-14" },
          { id: "p1-15", fullName: "Васильева Светлана Петровна", position: "HR-менеджер", email: "vasilieva@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p15.pdf", departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-15" },
          { id: "p1-16", fullName: "Михайлов Роман Игоревич", position: "Финансовый аналитик", email: "mikhailov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p16.pdf", departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-16" },
          { id: "p1-17", fullName: "Андреева Екатерина Викторовна", position: "Маркетолог", email: "andreeva@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p17.pdf", departmentId: "dept-2", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-17" },
          { id: "p1-18", fullName: "Тихонов Артем Сергеевич", position: "Системный администратор", email: "tikhonov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p18.pdf", departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-18" },
          { id: "p1-19", fullName: "Смирнова Наталья Александровна", position: "Контент-менеджер", email: "smirnova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p19.pdf", departmentId: "dept-4", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-19" },
          { id: "p1-20", fullName: "Борисов Владимир Олегович", position: "Руководитель разработки", email: "borisov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p20.pdf", departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-20" },
          { id: "p1-21", fullName: "Зайцева Оксана Дмитриевна", position: "QA Lead", email: "zaitseva@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p21.pdf", departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-21" },
          { id: "p1-22", fullName: "Комаров Станислав Викторович", position: "Frontend разработчик", email: "komarov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p22.pdf", departmentId: "dept-2", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-22" },
          { id: "p1-23", fullName: "Ларина Марина Игоревна", position: "Backend разработчик", email: "larina@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p23.pdf", departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-23" },
          { id: "p1-24", fullName: "Рыбаков Денис Сергеевич", position: "Мобильный разработчик", email: "rybakov@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p24.pdf", departmentId: "dept-4", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-24" },
          { id: "p1-25", fullName: "Горшкова Анастасия Петровна", position: "UX/UI дизайнер", email: "gorshkova@example.com", status: "completed" as const, reportUrl: "/reports/assessment-1-p25.pdf", departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/1?participant=p1-25" },
        ],
      },
      {
        id: "hogan-2",
        name: "Оценка деструкторов лидерства (HDS)",
        providerId: "provider-1",
        providerName: "Hogan Assessment Systems",
        description: "Оценка рисков деструктивного поведения в стрессовых условиях",
        startDate: new Date("2024-03-10"),
        endDate: new Date("2024-03-15"),
        link: "https://assessment.example.com/procedure/hogan-2",
        qrCodeLink: "https://assessment.example.com/qr/hogan-2",
        status: "in-progress",
        participants: [
          { id: "p1-1", fullName: "Иванов Иван Иванович", position: "Руководитель отдела", email: "ivanov@example.com", status: "in-progress" as const, departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/hogan-2?participant=p1-1" },
          { id: "p1-5", fullName: "Морозов Дмитрий Александрович", position: "Специалист", email: "morozov@example.com", status: "in-progress" as const, departmentId: "dept-3", uniqueLink: "https://assessment.example.com/procedure/hogan-2?participant=p1-5" },
          { id: "p1-10", fullName: "Орлов Максим Сергеевич", position: "Архитектор", email: "orlov@example.com", status: "not-started" as const, departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/hogan-2?participant=p1-10" },
          { id: "p1-11", fullName: "Федорова Татьяна Николаевна", position: "Руководитель команды", email: "fedorova@example.com", status: "not-started" as const, departmentId: "dept-1", uniqueLink: "https://assessment.example.com/procedure/hogan-2?participant=p1-11" },
          { id: "p1-20", fullName: "Борисов Владимир Олегович", position: "Руководитель разработки", email: "borisov@example.com", status: "invited" as const, departmentId: "dept-5", uniqueLink: "https://assessment.example.com/procedure/hogan-2?participant=p1-20" },
        ],
      },
    ],
  },
  {
    id: "provider-2",
    name: "SHL Talent Assessment",
    description: "Оценка талантов и потенциала сотрудников",
    procedures: [
      {
        id: "2",
        name: "Психологическое тестирование",
        providerId: "provider-2",
        providerName: "SHL Talent Assessment",
        description: "Психологическое тестирование для оценки личностных качеств",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-05"),
        link: "https://assessment.example.com/procedure/2",
        qrCodeLink: "https://assessment.example.com/qr/2",
        status: "in-progress",
        participants: [
          { id: "p2-1", fullName: "Козлова Елена Викторовна", position: "Менеджер проектов", email: "kozlova@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-1" },
          { id: "p2-2", fullName: "Морозов Дмитрий Александрович", position: "Специалист", email: "morozov@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-2" },
          { id: "p2-3", fullName: "Семенов Артем Владимирович", position: "Руководитель направления", email: "semenov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-3" },
          { id: "p2-4", fullName: "Попова Ирина Сергеевна", position: "Ведущий аналитик", email: "popova@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-4" },
          { id: "p2-5", fullName: "Власов Константин Игоревич", position: "Разработчик", email: "vlasov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-5" },
          { id: "p2-6", fullName: "Медведева Ольга Александровна", position: "Тестировщик", email: "medvedeva@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-6" },
          { id: "p2-7", fullName: "Носов Дмитрий Петрович", position: "DevOps инженер", email: "nosov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-7" },
          { id: "p2-8", fullName: "Белова Анна Викторовна", position: "Дизайнер интерфейсов", email: "belova@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-8" },
          { id: "p2-9", fullName: "Степанов Игорь Дмитриевич", position: "Архитектор решений", email: "stepanov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-9" },
          { id: "p2-10", fullName: "Маркова Елена Олеговна", position: "Product Owner", email: "markova@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-10" },
          { id: "p2-11", fullName: "Филиппов Сергей Валерьевич", position: "Старший разработчик", email: "filippov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-11" },
          { id: "p2-12", fullName: "Данилова Мария Николаевна", position: "Бизнес-аналитик", email: "danilova@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-12" },
          { id: "p2-13", fullName: "Жуков Павел Анатольевич", position: "Системный аналитик", email: "zhukov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-13" },
          { id: "p2-14", fullName: "Сорокина Татьяна Игоревна", position: "QA инженер", email: "sorokina@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-14" },
          { id: "p2-15", fullName: "Виноградов Алексей Сергеевич", position: "Full Stack разработчик", email: "vinogradov@example.com", status: "in-progress" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-15" },
          { id: "p2-16", fullName: "Крылова Юлия Дмитриевна", position: "UX исследователь", email: "krylova@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-16" },
          { id: "p2-17", fullName: "Соколов Максим Викторович", position: "Менеджер по продукту", email: "sokolov@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-17" },
          { id: "p2-18", fullName: "Лебедева Оксана Петровна", position: "Контент-стратег", email: "lebedeva@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-18" },
          { id: "p2-19", fullName: "Горбунов Роман Олегович", position: "Инженер по качеству", email: "gorbunov@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-19" },
          { id: "p2-20", fullName: "Егорова Надежда Александровна", position: "Специалист по данным", email: "egorova@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-20" },
          { id: "p2-21", fullName: "Тарасов Виктор Игоревич", position: "Руководитель проектов", email: "tarasov@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-21" },
          { id: "p2-22", fullName: "Беляева Светлана Сергеевна", position: "Маркетинг-менеджер", email: "belyaeva@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-22" },
          { id: "p2-23", fullName: "Кудрявцев Андрей Дмитриевич", position: "Технический писатель", email: "kudryavtsev@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-23" },
          { id: "p2-24", fullName: "Орлова Екатерина Валерьевна", position: "Специалист по безопасности", email: "orlova@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-24" },
          { id: "p2-25", fullName: "Макаров Илья Петрович", position: "Инженер по автоматизации", email: "makarov@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-25" },
          { id: "p2-26", fullName: "Сергеева Анастасия Николаевна", position: "Data Engineer", email: "sergeeva@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-26" },
          { id: "p2-27", fullName: "Николаев Денис Олегович", position: "Cloud инженер", email: "nikolaev@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-27" },
          { id: "p2-28", fullName: "Петрова Вероника Игоревна", position: "Scrum Master", email: "petrova2@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-28" },
          { id: "p2-29", fullName: "Волков Артем Викторович", position: "Мобильный разработчик", email: "volkov2@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-29" },
          { id: "p2-30", fullName: "Ковалева Дарья Сергеевна", position: "Frontend Lead", email: "kovaleva@example.com", status: "invited" as const, uniqueLink: "https://assessment.example.com/procedure/2?participant=p2-30" },
        ],
      },
    ],
  },
  {
    id: "provider-3",
    name: "Codility",
    description: "Оценка технических навыков программирования",
    procedures: [
      {
        id: "3",
        name: "Оценка технических навыков",
        providerId: "provider-3",
        providerName: "Codility",
        description: "Оценка навыков программирования и решения задач",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-02-20"),
        link: "https://assessment.example.com/procedure/3",
        qrCodeLink: "https://assessment.example.com/qr/3",
        status: "planned",
        participants: [
          { id: "p3-1", fullName: "Волков Сергей Петрович", position: "Разработчик", email: "volkov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-1" },
          { id: "p3-2", fullName: "Иванова Людмила Александровна", position: "Junior разработчик", email: "ivanova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-2" },
          { id: "p3-3", fullName: "Кузнецов Роман Игоревич", position: "Стажер", email: "kuznetsov2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-3" },
          { id: "p3-4", fullName: "Новиков Павел Дмитриевич", position: "Middle разработчик", email: "novikov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-4" },
          { id: "p3-5", fullName: "Смирнова Елена Викторовна", position: "QA инженер", email: "smirnova2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-5" },
          { id: "p3-6", fullName: "Федоров Игорь Сергеевич", position: "DevOps стажер", email: "fedorov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-6" },
          { id: "p3-7", fullName: "Антонова Мария Олеговна", position: "Дизайнер-стажер", email: "antonova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-7" },
          { id: "p3-8", fullName: "Борисов Станислав Петрович", position: "Аналитик данных", email: "borisov2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-8" },
          { id: "p3-9", fullName: "Григорьева Виктория Николаевна", position: "Контент-менеджер", email: "grigorieva@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-9" },
          { id: "p3-10", fullName: "Дмитриев Артем Валерьевич", position: "Младший разработчик", email: "dmitriev@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-10" },
          { id: "p3-11", fullName: "Ефимова Ольга Игоревна", position: "Тестировщик", email: "efimova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-11" },
          { id: "p3-12", fullName: "Жданов Максим Александрович", position: "Системный администратор", email: "zhdanov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-12" },
          { id: "p3-13", fullName: "Зайцева Анастасия Сергеевна", position: "UX дизайнер", email: "zaitseva2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-13" },
          { id: "p3-14", fullName: "Ильин Денис Дмитриевич", position: "Backend разработчик", email: "ilin@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-14" },
          { id: "p3-15", fullName: "Калинина Татьяна Петровна", position: "Frontend разработчик", email: "kalinina@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-15" },
          { id: "p3-16", fullName: "Логинов Роман Викторович", position: "Мобильный разработчик", email: "loginov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-16" },
          { id: "p3-17", fullName: "Максимова Екатерина Олеговна", position: "Product Manager", email: "maximova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-17" },
          { id: "p3-18", fullName: "Никитин Андрей Игоревич", position: "Бизнес-аналитик", email: "nikitin@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-18" },
          { id: "p3-19", fullName: "Осипова Марина Николаевна", position: "HR-специалист", email: "osipova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-19" },
          { id: "p3-20", fullName: "Петров Владимир Сергеевич", position: "Финансовый аналитик", email: "petrov2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-20" },
          { id: "p3-21", fullName: "Романова Ирина Дмитриевна", position: "Маркетолог", email: "romanova2@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-21" },
          { id: "p3-22", fullName: "Савельев Константин Валерьевич", position: "Архитектор", email: "saveliev@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-22" },
          { id: "p3-23", fullName: "Титова Юлия Петровна", position: "Контент-стратег", email: "titova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-23" },
          { id: "p3-24", fullName: "Ушаков Илья Александрович", position: "Инженер по тестированию", email: "ushakov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-24" },
          { id: "p3-25", fullName: "Фомина Наталья Игоревна", position: "Специалист по данным", email: "fomina@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-25" },
          { id: "p3-26", fullName: "Харитонов Павел Олегович", position: "Cloud инженер", email: "kharitonov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-26" },
          { id: "p3-27", fullName: "Цветкова Анна Викторовна", position: "Scrum Master", email: "tsvetkova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-27" },
          { id: "p3-28", fullName: "Чернов Дмитрий Сергеевич", position: "Технический писатель", email: "chernov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-28" },
          { id: "p3-29", fullName: "Шевцова Елена Дмитриевна", position: "Специалист по безопасности", email: "shevtsova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-29" },
          { id: "p3-30", fullName: "Щербаков Артем Николаевич", position: "Инженер по автоматизации", email: "shcherbakov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-30" },
          { id: "p3-31", fullName: "Юдина Мария Петровна", position: "Data Scientist", email: "yudina@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-31" },
          { id: "p3-32", fullName: "Яковлев Игорь Валерьевич", position: "ML инженер", email: "yakovlev@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-32" },
          { id: "p3-33", fullName: "Абрамова Светлана Олеговна", position: "Аналитик BI", email: "abramova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-33" },
          { id: "p3-34", fullName: "Богданов Роман Игоревич", position: "Инженер по интеграциям", email: "bogdanov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-34" },
          { id: "p3-35", fullName: "Власова Оксана Александровна", position: "Системный инженер", email: "vlasova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-35" },
          { id: "p3-36", fullName: "Гаврилов Максим Сергеевич", position: "Сетевой инженер", email: "gavrilov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-36" },
          { id: "p3-37", fullName: "Давыдова Татьяна Дмитриевна", position: "Инженер по инфраструктуре", email: "davydova@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-37" },
          { id: "p3-38", fullName: "Егоров Виктор Петрович", position: "Инженер по мониторингу", email: "egorov@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-38" },
          { id: "p3-39", fullName: "Журавлева Надежда Викторовна", position: "Инженер по производительности", email: "zhuravleva@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-39" },
          { id: "p3-40", fullName: "Зимин Андрей Николаевич", position: "Инженер по надежности", email: "zimin@example.com", status: "not-started" as const, uniqueLink: "https://assessment.example.com/procedure/3?participant=p3-40" },
        ],
      },
    ],
  },
  {
    id: "provider-4",
    name: "Zetic",
    description: "Оценка когнитивных способностей и потенциала",
    procedures: [],
  },
  {
    id: "provider-5",
    name: "Azimut",
    description: "Комплексная оценка персонала и развитие компетенций",
    procedures: [],
  },
  {
    id: "provider-6",
    name: "HT Lab",
    description: "Психометрическая оценка и профилирование",
    procedures: [],
  },
];

// Моковые данные для вкладки "Мои оценочные процедуры"
const mockProcedures: AssessmentProcedure[] = [
  {
    id: "1",
    name: "Оценка лидерских компетенций",
    providerId: "provider-1",
    providerName: "Hogan Assessment Systems",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-20"),
    link: "https://assessment.example.com/procedure/1",
    qrCodeLink: "https://assessment.example.com/qr/1",
    status: "completed",
    reportUrl: "/reports/assessment-1.pdf",
  },
  {
    id: "2",
    name: "Психологическое тестирование",
    providerId: "provider-2",
    providerName: "SHL Talent Assessment",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-05"),
    link: "https://assessment.example.com/procedure/2",
    qrCodeLink: "https://assessment.example.com/qr/2",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Оценка технических навыков",
    providerId: "provider-3",
    providerName: "Codility",
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-02-20"),
    link: "https://assessment.example.com/procedure/3",
    qrCodeLink: "https://assessment.example.com/qr/3",
    status: "planned",
  },
];

// ===== Внутренние оценки (360/ФКР, ассессмент-центр, ЦОР) =====
type InternalAssessmentType = "360_FKR" | "ASSESSMENT_CENTER" | "COR";
type InternalAssessmentStatus = "active" | "completed" | "planned";

interface InternalAssessment {
  id: string;
  type: InternalAssessmentType;
  name: string;
  status: InternalAssessmentStatus;
  startDate: Date;
  endDate: Date;
  score?: number;
  scoreUnit?: "points" | "percent";
  scoreLabel?: string;
  details?: { label: string; value: string }[];
  resultUrl?: string;
}

interface EmployeeAssessmentRecord {
  employeeId: string;
  fullName: string;
  position: string;
  departmentId: string;
  employeeCategory: "A" | "B" | "C" | "D";
  attritionRisk: "low" | "medium" | "high";
  externalProcedures: { procedure: AssessmentProcedure; participantStatus: ProcedureParticipant["status"] }[];
  internalAssessments: InternalAssessment[];
}

const INTERNAL_ASSESSMENT_LABELS: Record<InternalAssessmentType, string> = {
  "360_FKR": "Оценка 360 (ФКР)",
  "ASSESSMENT_CENTER": "Ассессмент-центр",
  "COR": "Оценка результативности (ЦОР)",
};

const mockEmployeeAssessments: EmployeeAssessmentRecord[] = [
  {
    employeeId: "emp-1",
    fullName: "Петров Иван Сергеевич",
    position: "Главный инженер",
    departmentId: "dept-2",
    employeeCategory: "A",
    attritionRisk: "low",
    externalProcedures: [
      {
        procedure: mockProviders[0].procedures[0],
        participantStatus: "completed",
      },
      {
        procedure: mockProviders[0].procedures[1],
        participantStatus: "in-progress",
      },
    ],
    internalAssessments: [
      {
        id: "ia-1",
        type: "360_FKR",
        name: "ФКР 2024",
        status: "completed",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-31"),
        score: 4,
        scoreUnit: "points",
        scoreLabel: "Превосходит ожидания",
        resultUrl: "/results/fkr-2024-emp1.pdf",
      },
      {
        id: "ia-2",
        type: "COR",
        name: "КР1Q2025",
        status: "active",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        score: 108,
        scoreUnit: "percent",
      },
      {
        id: "ia-2b",
        type: "COR",
        name: "КР2Q2025",
        status: "completed",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        score: 101,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr2-emp1.pdf",
      },
    ],
  },
  {
    employeeId: "emp-2",
    fullName: "Сидорова Мария Александровна",
    position: "Ведущий разработчик",
    departmentId: "dept-2",
    employeeCategory: "B",
    attritionRisk: "medium",
    externalProcedures: [
      {
        procedure: mockProviders[1].procedures[0],
        participantStatus: "in-progress",
      },
    ],
    internalAssessments: [
      {
        id: "ia-3",
        type: "360_FKR",
        name: "ФКР 2025",
        status: "completed",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-31"),
        score: 3,
        scoreUnit: "points",
        scoreLabel: "Соответствует ожиданиям",
        resultUrl: "/results/fkr-2025-emp2.pdf",
      },
      {
        id: "ia-4",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "planned",
        startDate: new Date("2025-04-15"),
        endDate: new Date("2025-04-20"),
        details: [
          { label: "Профиль", value: "Профиль Backend разработчика" },
          { label: "Soft skills", value: "Senior" },
          { label: "Hard skills", value: "Senior+" },
        ],
      },
    ],
  },
  {
    employeeId: "emp-3",
    fullName: "Иванов Алексей Дмитриевич",
    position: "Старший разработчик",
    departmentId: "dept-3",
    employeeCategory: "B",
    attritionRisk: "low",
    externalProcedures: [
      {
        procedure: mockProviders[0].procedures[0],
        participantStatus: "completed",
      },
    ],
    internalAssessments: [
      {
        id: "ia-5",
        type: "COR",
        name: "КР2Q2025",
        status: "active",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        score: 96,
        scoreUnit: "percent",
      },
      {
        id: "ia-6",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "completed",
        startDate: new Date("2025-02-10"),
        endDate: new Date("2025-02-15"),
        details: [
          { label: "Профиль", value: "Профиль Frontend разработчика" },
          { label: "Soft skills", value: "Expert" },
          { label: "Hard skills", value: "Senior+" },
        ],
        resultUrl: "/results/ac-profile-emp3.pdf",
      },
    ],
  },
  {
    employeeId: "emp-4",
    fullName: "Смирнова Елена Викторовна",
    position: "QA инженер",
    departmentId: "dept-4",
    employeeCategory: "C",
    attritionRisk: "high",
    externalProcedures: [
      { procedure: mockProviders[2].procedures[0], participantStatus: "completed" },
    ],
    internalAssessments: [
      {
        id: "ia-12",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "completed",
        startDate: new Date("2025-03-05"),
        endDate: new Date("2025-03-06"),
        details: [
          { label: "Профиль", value: "Профиль QA Engineer" },
          { label: "Soft skills", value: "Senior" },
          { label: "Hard skills", value: "Expert" },
        ],
        resultUrl: "/results/ac-profile-emp4.pdf",
      },
      {
        id: "ia-13",
        type: "360_FKR",
        name: "ФКР 2025",
        status: "completed",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-31"),
        score: 3,
        scoreUnit: "points",
        scoreLabel: "Соответствует ожиданиям",
        resultUrl: "/results/fkr-2025-emp4.pdf",
      },
    ],
  },
  {
    employeeId: "emp-5",
    fullName: "Помыткин Сергей Олегович",
    position: "Руководитель разработки",
    departmentId: "dept-1",
    employeeCategory: "A",
    attritionRisk: "high",
    externalProcedures: [
      {
        procedure: mockProviders[0].procedures[0],
        participantStatus: "completed",
      },
      {
        procedure: mockProviders[1].procedures[0],
        participantStatus: "invited",
      },
    ],
    internalAssessments: [
      {
        id: "ia-7",
        type: "360_FKR",
        name: "ФКР 2024",
        status: "completed",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-31"),
        score: 5,
        scoreUnit: "points",
        scoreLabel: "Выдающийся результат",
        resultUrl: "/results/fkr-2024-emp5.pdf",
      },
      {
        id: "ia-8",
        type: "COR",
        name: "КР3Q2025",
        status: "active",
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-09-30"),
        score: 112,
        scoreUnit: "percent",
      },
      {
        id: "ia-8b",
        type: "COR",
        name: "КР1Q2025",
        status: "completed",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        score: 98,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr1-emp5.pdf",
      },
      {
        id: "ia-8c",
        type: "COR",
        name: "КР2Q2025",
        status: "completed",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        score: 104,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr2-emp5.pdf",
      },
      {
        id: "ia-9",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "completed",
        startDate: new Date("2025-02-10"),
        endDate: new Date("2025-02-15"),
        details: [
          { label: "Профиль", value: "Профиль DevOps" },
          { label: "Soft skills", value: "Senior+" },
          { label: "Hard skills", value: "Expert+" },
        ],
        resultUrl: "/results/ac-profile-emp5.pdf",
      },
    ],
  },
  {
    employeeId: "emp-7",
    fullName: "Морозов Дмитрий Александрович",
    position: "Специалист",
    departmentId: "dept-3",
    employeeCategory: "C",
    attritionRisk: "medium",
    externalProcedures: [
      {
        procedure: mockProviders[2].procedures[0],
        participantStatus: "not-started",
      },
    ],
    internalAssessments: [
      {
        id: "ia-10",
        type: "360_FKR",
        name: "ФКР 2025",
        status: "completed",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-31"),
        score: 2,
        scoreUnit: "points",
        scoreLabel: "Не соответствует ожиданиям",
        resultUrl: "/results/fkr-2025-emp7.pdf",
      },
    ],
  },
  {
    employeeId: "emp-6",
    fullName: "Козлова Анна Петровна",
    position: "Менеджер проектов",
    departmentId: "dept-1",
    employeeCategory: "B",
    attritionRisk: "medium",
    externalProcedures: [
      { procedure: mockProviders[0].procedures[1], participantStatus: "invited" },
    ],
    internalAssessments: [
      {
        id: "ia-14",
        type: "360_FKR",
        name: "ФКР 2024",
        status: "completed",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-31"),
        score: 4,
        scoreUnit: "points",
        scoreLabel: "Превосходит ожидания",
        resultUrl: "/results/fkr-2024-emp6.pdf",
      },
      {
        id: "ia-15",
        type: "COR",
        name: "КР1Q2025",
        status: "completed",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        score: 95,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr1-emp6.pdf",
      },
    ],
  },
  {
    employeeId: "emp-8",
    fullName: "Волков Сергей Петрович",
    position: "Разработчик",
    departmentId: "dept-2",
    employeeCategory: "D",
    attritionRisk: "low",
    externalProcedures: [],
    internalAssessments: [
      {
        id: "ia-16",
        type: "360_FKR",
        name: "ФКР 2025",
        status: "planned",
        startDate: new Date("2025-05-10"),
        endDate: new Date("2025-05-31"),
      },
    ],
  },
  {
    employeeId: "emp-9",
    fullName: "Новикова Анна Игоревна",
    position: "Аналитик",
    departmentId: "dept-4",
    employeeCategory: "C",
    attritionRisk: "medium",
    externalProcedures: [
      { procedure: mockProviders[1].procedures[0], participantStatus: "completed" },
    ],
    internalAssessments: [
      {
        id: "ia-17",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "completed",
        startDate: new Date("2025-02-10"),
        endDate: new Date("2025-02-15"),
        details: [
          { label: "Профиль", value: "Профиль системного аналитика" },
          { label: "Soft skills", value: "Expert" },
          { label: "Hard skills", value: "Expert+" },
        ],
        resultUrl: "/results/ac-profile-emp9.pdf",
      },
      {
        id: "ia-18",
        type: "COR",
        name: "КР4Q2025",
        status: "planned",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-12-31"),
        score: 100,
        scoreUnit: "percent",
      },
    ],
  },
  {
    employeeId: "emp-10",
    fullName: "Лебедев Павел Олегович",
    position: "Тестировщик",
    departmentId: "dept-5",
    employeeCategory: "D",
    attritionRisk: "low",
    externalProcedures: [],
    internalAssessments: [
      {
        id: "ia-19",
        type: "COR",
        name: "КР1Q2025",
        status: "completed",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        score: 92,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr1-emp10.pdf",
      },
    ],
  },
  {
    employeeId: "emp-11",
    fullName: "Соколова Ольга Владимировна",
    position: "Дизайнер",
    departmentId: "dept-2",
    employeeCategory: "C",
    attritionRisk: "medium",
    externalProcedures: [
      { procedure: mockProviders[0].procedures[0], participantStatus: "invited" },
    ],
    internalAssessments: [
      {
        id: "ia-20",
        type: "360_FKR",
        name: "ФКР 2024",
        status: "completed",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-31"),
        score: 5,
        scoreUnit: "points",
        scoreLabel: "Выдающийся результат",
        resultUrl: "/results/fkr-2024-emp11.pdf",
      },
    ],
  },
  {
    employeeId: "emp-12",
    fullName: "Орлов Максим Сергеевич",
    position: "Архитектор",
    departmentId: "dept-1",
    employeeCategory: "D",
    attritionRisk: "low",
    externalProcedures: [
      {
        procedure: mockProviders[0].procedures[1],
        participantStatus: "not-started",
      },
    ],
    internalAssessments: [
      {
        id: "ia-11",
        type: "COR",
        name: "КР4Q2025",
        status: "planned",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2025-12-31"),
        score: 100,
        scoreUnit: "percent",
      },
    ],
  },
  {
    employeeId: "emp-13",
    fullName: "Федорова Татьяна Николаевна",
    position: "Руководитель команды",
    departmentId: "dept-3",
    employeeCategory: "A",
    attritionRisk: "low",
    externalProcedures: [
      { procedure: mockProviders[0].procedures[0], participantStatus: "completed" },
    ],
    internalAssessments: [
      {
        id: "ia-21",
        type: "360_FKR",
        name: "ФКР 2025",
        status: "completed",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-31"),
        score: 4,
        scoreUnit: "points",
        scoreLabel: "Превосходит ожидания",
        resultUrl: "/results/fkr-2025-emp13.pdf",
      },
      {
        id: "ia-22",
        type: "COR",
        name: "КР3Q2025",
        status: "active",
        startDate: new Date("2025-07-01"),
        endDate: new Date("2025-09-30"),
        score: 110,
        scoreUnit: "percent",
      },
    ],
  },
  {
    employeeId: "emp-14",
    fullName: "Григорьев Андрей Валерьевич",
    position: "DevOps инженер",
    departmentId: "dept-4",
    employeeCategory: "B",
    attritionRisk: "medium",
    externalProcedures: [
      { procedure: mockProviders[2].procedures[0], participantStatus: "in-progress" },
    ],
    internalAssessments: [
      {
        id: "ia-23",
        type: "ASSESSMENT_CENTER",
        name: "Ассессмент-центр",
        status: "planned",
        startDate: new Date("2025-05-15"),
        endDate: new Date("2025-05-20"),
        details: [
          { label: "Профиль", value: "Профиль DevOps" },
          { label: "Soft skills", value: "Senior" },
          { label: "Hard skills", value: "Expert" },
        ],
      },
      {
        id: "ia-24",
        type: "COR",
        name: "КР2Q2025",
        status: "completed",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-06-30"),
        score: 120,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr2-emp14.pdf",
      },
    ],
  },
  {
    employeeId: "emp-15",
    fullName: "Романова Юлия Дмитриевна",
    position: "Product Manager",
    departmentId: "dept-1",
    employeeCategory: "A",
    attritionRisk: "high",
    externalProcedures: [
      { procedure: mockProviders[1].procedures[0], participantStatus: "in-progress" },
    ],
    internalAssessments: [
      {
        id: "ia-25",
        type: "360_FKR",
        name: "ФКР 2024",
        status: "completed",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2024-01-31"),
        score: 2,
        scoreUnit: "points",
        scoreLabel: "Не соответствует ожиданиям",
        resultUrl: "/results/fkr-2024-emp15.pdf",
      },
      {
        id: "ia-26",
        type: "COR",
        name: "КР1Q2025",
        status: "completed",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        score: 90,
        scoreUnit: "percent",
        resultUrl: "/results/cor-kr1-emp15.pdf",
      },
    ],
  },
];

const getInternalAssessmentStatusText = (status: InternalAssessmentStatus) => {
  switch (status) {
    case "active": return "В процессе";
    case "completed": return "Завершено";
    case "planned": return "Запланировано";
    default: return status;
  }
};

// Функция для получения цвета статуса
// Использует централизованные цвета из badge-colors.ts
const getStatusColor = (status: AssessmentProcedure["status"]) => {
  return getStatusBadgeColor(status);
};

// Функция для получения текста статуса
const getStatusText = (status: AssessmentProcedure["status"]) => {
  switch (status) {
    case "planned":
      return "Запланировано";
    case "in-progress":
      return "В процессе";
    case "completed":
      return "Завершено";
    case "cancelled":
      return "Отменено";
    case "request":
      return "Заявка";
    default:
      return status;
  }
};

// Форматирование даты
const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Функция для получения цвета статуса участника (использует централизованные цвета)
const getParticipantStatusColor = (status: ProcedureParticipant["status"]) => {
  return getStatusBadgeColor(status);
};

// Функция для получения текста статуса участника
const getParticipantStatusText = (status: ProcedureParticipant["status"]) => {
  switch (status) {
    case "not-started":
      return "Не начато";
    case "invited":
      return "Приглашен";
    case "in-progress":
      return "В процессе";
    case "completed":
      return "Завершено";
    default:
      return status;
  }
};

// Функция для получения инициалов из ФИО
const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
};

const getEmployeePulseMetrics = (employeeId: string) => {
  const seed = Number(employeeId.replace(/\D/g, "")) || 1;
  const engagement = 62 + (seed * 7) % 35; // 62..96
  const loyalty = 58 + (seed * 11) % 39; // 58..96
  const happyIndex = 60 + (seed * 13) % 37; // 60..96
  return { engagement, loyalty, happyIndex };
};

export default function ExternalProvidersPage() {
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  
  // Состояние для администрирования
  const [providers, setProviders] = useState<ExternalProvider[]>(mockProviders);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<AssessmentProcedure | null>(null);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<"provider" | "procedure" | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<AssessmentProcedure | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState<"all" | "request" | "active" | "completed">("all");
  
  // Состояние для пагинации таблицы участников
  const [participantsCurrentPage, setParticipantsCurrentPage] = useState(1);
  const [participantsItemsPerPage, setParticipantsItemsPerPage] = useState(10);
  
  // Состояние для формы создания провайдера
  const [providerFormData, setProviderFormData] = useState({
    name: "",
    description: "",
  });
  
  // Состояние для формы создания процедуры
  const [procedureFormData, setProcedureFormData] = useState({
    name: "",
    providerId: "",
    description: "",
    startDate: "",
    endDate: "",
    link: "",
    qrCodeLink: "",
    status: "planned" as "planned" | "in-progress" | "completed" | "cancelled" | "request",
  });
  
  // Состояние для модального окна добавления участников
  const [isAddParticipantsDialogOpen, setIsAddParticipantsDialogOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [participantSearchQuery, setParticipantSearchQuery] = useState("");
  
  // Состояние для модального окна управления нотификациями
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationFormData, setNotificationFormData] = useState({
    subject: "",
    message: "",
    recipientIds: [] as string[],
  });
  const [notificationSearchQuery, setNotificationSearchQuery] = useState("");
  
  // Состояние для отчетов внешних провайдеров
  const [currentUserId, setCurrentUserId] = useState("u-employee");
  const [reports, setReports] = useState<Report[]>(seedReports);
  const [policies, setPolicies] = useState<VisibilityPolicy[]>(defaultPolicies);
  const [isReportUploadOpen, setIsReportUploadOpen] = useState(false);

  // Модалки оценочных процедур: data !== null → открыта, null → закрыта.
  const [procedureInfoData, setProcedureInfoData] = useState<ProcedureInfo | null>(null);
  const [procedureResultData, setProcedureResultData] = useState<ProcedureResult | null>(null);
  const [isRequestAssessmentOpen, setIsRequestAssessmentOpen] = useState(false);

  const openProcedureInfo = (data: ProcedureInfo) => {
    setProcedureResultData(null);
    setProcedureInfoData(data);
  };
  const openProcedureResult = (data: ProcedureResult) => {
    setProcedureInfoData(null);
    setProcedureResultData(data);
  };
  const [employeeAssessments, setEmployeeAssessments] = useState<EmployeeAssessmentRecord[]>(mockEmployeeAssessments);
  
  // Фильтры по колонкам таблицы оценочных процедур сотрудников
  const [empFilterName, setEmpFilterName] = useState("");
  const [empFilterDept, setEmpFilterDept] = useState<string>("all");
  const [empFilterExtStatus, setEmpFilterExtStatus] = useState<string>("all");
  const [empFilter360, setEmpFilter360] = useState<string>("all");
  const [empFilterAC, setEmpFilterAC] = useState<string>("all");
  const [empFilterCOR, setEmpFilterCOR] = useState<string>("all");
  const [isEmpFiltersOpen, setIsEmpFiltersOpen] = useState(false);
  const [teamDepartmentId, setTeamDepartmentId] = useState<string>("all");
  const [selectedTeamEmployeeId, setSelectedTeamEmployeeId] = useState<string | null>(null);

  const handleReportUpload = (newReports: Report[]) => {
    setReports((prev) => [...prev, ...newReports]);
  };

  const allProcedures = useMemo(() =>
    providers.flatMap((p) =>
      p.procedures.map((proc) => ({
        id: proc.id,
        name: proc.name,
        providerId: p.id,
        providerName: p.name,
        participants: proc.participants?.map((part) => ({
          id: part.id,
          fullName: part.fullName,
          position: part.position,
          email: part.email,
        })),
      })),
    ),
    [providers],
  );

  const visibleReports = useMemo(
    () => getVisibleReports(currentUserId, reports, policies),
    [currentUserId, reports, policies],
  );

  const subordinateIds = useMemo(
    () => getSubordinateUserIds(currentUserId),
    [currentUserId],
  );

  const handleAddParticipants = (employeeIds: string[]) => {
    if (!selectedProcedure) return;
    const participants: ProcedureParticipant[] = employeeIds.map((eid) => {
      const emp = mockEmployees.find((e) => e.id === eid);
      const existing = selectedProcedure.participants?.find(
        (p) => p.id === eid || p.email === emp?.email,
      );
      if (existing) return existing;
      return {
        id: eid,
        fullName: emp?.fullName ?? eid,
        position: emp?.position ?? "",
        email: emp?.email ?? "",
        status: "not-started" as const,
        departmentId: emp?.departmentId,
        uniqueLink: `https://assess.example.com/p/${eid}`,
      };
    });
    const updated: AssessmentProcedure = { ...selectedProcedure, participants };
    setSelectedProcedure(updated);
    setProviders((prev) =>
      prev.map((p) =>
        p.procedures.some((pr) => pr.id === updated.id)
          ? { ...p, procedures: p.procedures.map((pr) => (pr.id === updated.id ? updated : pr)) }
          : p,
      ),
    );
  };

  const handleRequestAssessment = (data: {
    type: "external" | "360_FKR" | "ASSESSMENT_CENTER" | "COR";
    providerId?: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    participantIds: string[];
    comment: string;
  }) => {
    if (data.type === "external" && data.providerId) {
      const newProcedure: AssessmentProcedure = {
        id: `req-${Date.now()}`,
        name: data.name,
        providerId: data.providerId,
        providerName: providers.find((p) => p.id === data.providerId)?.name ?? "",
        description: data.description || undefined,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        link: "",
        qrCodeLink: "",
        status: "request",
        participants: data.participantIds.map((eid) => {
          const emp = mockEmployees.find((e) => e.id === eid);
          return {
            id: eid,
            fullName: emp?.fullName ?? eid,
            position: emp?.position ?? "",
            email: emp?.email ?? "",
            status: "not-started" as const,
            departmentId: emp?.departmentId,
          };
        }),
      };
      setProviders((prev) =>
        prev.map((p) =>
          p.id === data.providerId
            ? { ...p, procedures: [...p.procedures, newProcedure] }
            : p,
        ),
      );
    }
  };

  // Переключение раскрытия провайдера
  const toggleProvider = (providerId: string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };
  
  // Выбор процедуры
  const handleSelectProcedure = (procedure: AssessmentProcedure) => {
    setSelectedProcedure(procedure);
    // Сбрасываем пагинацию при выборе новой процедуры
    setParticipantsCurrentPage(1);
  };
  
  // Сбрасываем пагинацию при изменении количества элементов на странице
  useEffect(() => {
    setParticipantsCurrentPage(1);
  }, [participantsItemsPerPage]);
  
  // Открытие диалога создания
  const handleCreate = () => {
    setIsCreateDialogOpen(true);
    setCreateType(null);
    setEditingProcedure(null);
    // Сбрасываем формы
    setProviderFormData({ name: "", description: "" });
    setProcedureFormData({
      name: "",
      providerId: "",
      description: "",
      startDate: "",
      endDate: "",
      link: "",
      qrCodeLink: "",
      status: "planned",
    });
  };
  
  // Создание провайдера
  const handleCreateProvider = () => {
    if (!providerFormData.name.trim()) {
      return;
    }
    
    const newProvider: ExternalProvider = {
      id: `provider-${Date.now()}`,
      name: providerFormData.name.trim(),
      description: providerFormData.description.trim() || undefined,
      procedures: [],
    };
    
    setProviders([...providers, newProvider]);
    setIsCreateDialogOpen(false);
    setCreateType(null);
    setProviderFormData({ name: "", description: "" });
  };
  
  // Создание или обновление процедуры
  const handleCreateProcedure = () => {
    if (!procedureFormData.name.trim() || !procedureFormData.providerId || !procedureFormData.startDate || !procedureFormData.endDate || !procedureFormData.link.trim() || !procedureFormData.qrCodeLink.trim()) {
      return;
    }
    
    const provider = providers.find(p => p.id === procedureFormData.providerId);
    if (!provider) return;
    
    if (editingProcedure) {
      // Редактирование существующей процедуры
      const updatedProcedure: AssessmentProcedure = {
        ...editingProcedure,
        name: procedureFormData.name.trim(),
        providerId: procedureFormData.providerId,
        providerName: provider.name,
        description: procedureFormData.description.trim() || undefined,
        startDate: new Date(procedureFormData.startDate),
        endDate: new Date(procedureFormData.endDate),
        link: procedureFormData.link.trim(),
        qrCodeLink: procedureFormData.qrCodeLink.trim(),
        status: procedureFormData.status,
        // Сохраняем существующих участников
        participants: editingProcedure.participants,
      };
      
      const providerChanged = editingProcedure.providerId !== procedureFormData.providerId;
      
      const finalProviders = providers.map(p => {
        if (providerChanged) {
          // Если провайдер изменился, удаляем из старого и добавляем в новый
          if (p.id === editingProcedure.providerId) {
            return {
              ...p,
              procedures: p.procedures.filter(proc => proc.id !== editingProcedure.id),
            };
          }
          if (p.id === procedureFormData.providerId) {
            return {
              ...p,
              procedures: [...p.procedures, updatedProcedure],
            };
          }
        } else {
          // Если провайдер не изменился, просто обновляем процедуру
          if (p.id === procedureFormData.providerId) {
            return {
              ...p,
              procedures: p.procedures.map(proc => 
                proc.id === editingProcedure.id ? updatedProcedure : proc
              ),
            };
          }
        }
        return p;
      });
      
      setProviders(finalProviders);
      
      // Обновляем выбранную процедуру, если она была отредактирована
      if (selectedProcedure?.id === editingProcedure.id) {
        setSelectedProcedure(updatedProcedure);
      }
    } else {
      // Создание новой процедуры
      const newProcedure: AssessmentProcedure = {
        id: `procedure-${Date.now()}`,
        name: procedureFormData.name.trim(),
        providerId: procedureFormData.providerId,
        providerName: provider.name,
        description: procedureFormData.description.trim() || undefined,
        startDate: new Date(procedureFormData.startDate),
        endDate: new Date(procedureFormData.endDate),
        link: procedureFormData.link.trim(),
        qrCodeLink: procedureFormData.qrCodeLink.trim(),
        status: procedureFormData.status,
        participants: [],
      };
      
      const updatedProviders = providers.map(p => {
        if (p.id === procedureFormData.providerId) {
          return {
            ...p,
            procedures: [...p.procedures, newProcedure],
          };
        }
        return p;
      });
      
      setProviders(updatedProviders);
    }
    
    setIsCreateDialogOpen(false);
    setCreateType(null);
    setEditingProcedure(null);
    setProcedureFormData({
      name: "",
      providerId: "",
      description: "",
      startDate: "",
      endDate: "",
      link: "",
      qrCodeLink: "",
      status: "planned",
    });
  };
  
  // Фильтрация провайдеров и процедур
  const filteredData = useMemo(() => {
    let result = providers;

    if (adminStatusFilter !== "all") {
      const statusSet = adminStatusFilter === "active"
        ? new Set(["planned", "in-progress", "request"])
        : adminStatusFilter === "request"
          ? new Set(["request"])
          : new Set(["completed"]);

      result = result.map((provider) => {
        const filtered = provider.procedures.filter((proc) => statusSet.has(proc.status));
        if (filtered.length > 0) return { ...provider, procedures: filtered };
        return null;
      }).filter(Boolean) as ExternalProvider[];
    }

    if (!searchQuery.trim()) return result;
    
    const query = searchQuery.toLowerCase();
    return result.map(provider => {
      const providerMatches = 
        provider.name.toLowerCase().includes(query) ||
        provider.description?.toLowerCase().includes(query);
      
      const filteredProcedures = provider.procedures.filter(proc =>
        proc.name.toLowerCase().includes(query) ||
        proc.description?.toLowerCase().includes(query)
      );
      
      if (providerMatches || filteredProcedures.length > 0) {
        return { ...provider, procedures: providerMatches ? provider.procedures : filteredProcedures };
      }
      return null;
    }).filter(Boolean) as ExternalProvider[];
  }, [providers, searchQuery, adminStatusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Оценка внешние провайдеры</h1>
          <p className="text-muted-foreground">
            Управление оценкой внешних провайдеров
          </p>
        </div>
      </div>

      <RoleSwitcher
        currentUserId={currentUserId}
        onUserChange={setCurrentUserId}
      />

      <Tabs defaultValue="my-procedures" className="w-full">
        <TabsList variant="grid3">
          <TabsTrigger value="my-procedures">
            Мои оценочные процедуры
          </TabsTrigger>
          <TabsTrigger value="employees-procedures">
            Оценочные процедуры сотрудников
          </TabsTrigger>
          <TabsTrigger value="administration">
            Администрирование
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-procedures" className="mt-4 space-y-6">
          {mockProcedures.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  У вас пока нет оценочных процедур
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Активные процедуры */}
              {(() => {
                const activeProcedures = mockProcedures.filter(
                  (p) => p.status === "planned" || p.status === "in-progress"
                );
                if (activeProcedures.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Активные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeProcedures.map((procedure) => (
                <Card key={procedure.id} className="border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base">{procedure.name}</h3>
                          <Badge
                            variant="outline"
                            className={cn("text-xs px-2 py-0.5 flex-shrink-0", getStatusColor(procedure.status))}
                          >
                            {getStatusText(procedure.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{procedure.providerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {formatDate(procedure.startDate)} - {formatDate(procedure.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ссылка на процедуру оценки и QR код в одну строку */}
                    <div className="py-3 px-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">Ссылка на процедуру оценки:</span>
                          <a
                            href={procedure.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                          >
                            {procedure.link}
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          </a>
                        </div>
                        <button
                          onClick={() => setSelectedQrCode(procedure.qrCodeLink)}
                          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 flex-shrink-0"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          QR код
                        </button>
                      </div>
                    </div>
                    
                    {/* Отчет внутри блока */}
                    {procedure.reportUrl && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">Отчет по процедуре</h4>
                              <p className="text-xs text-muted-foreground">
                                Результаты оценки доступны для скачивания
                              </p>
                            </div>
                          </div>
                          <a
                            href={procedure.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex-shrink-0"
                          >
                            <FileText className="h-4 w-4" />
                            Скачать PDF
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Завершенные процедуры */}
              {(() => {
                const completedProcedures = mockProcedures.filter(
                  (p) => p.status === "completed" || p.status === "cancelled"
                );
                if (completedProcedures.length === 0) return null;
                return (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Завершенные</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedProcedures.map((procedure) => (
                        <Card key={procedure.id} className="border">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-base">{procedure.name}</h3>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs px-2 py-0.5 flex-shrink-0", getStatusColor(procedure.status))}
                                  >
                                    {getStatusText(procedure.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{procedure.providerName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {formatDate(procedure.startDate)} - {formatDate(procedure.endDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Ссылка на процедуру оценки и QR код в одну строку */}
                            <div className="py-3 px-4 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">Ссылка на процедуру оценки:</span>
                                  <a
                                    href={procedure.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                                  >
                                    {procedure.link}
                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                  </a>
                                </div>
                                <button
                                  onClick={() => setSelectedQrCode(procedure.qrCodeLink)}
                                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 flex-shrink-0"
                                >
                                  <QrCode className="h-3.5 w-3.5" />
                                  QR код
                                </button>
                              </div>
                            </div>
                            
                            {/* Отчет внутри блока */}
                            {procedure.reportUrl && (
                              <div className="pt-3 border-t">
                                <div className="flex items-center justify-between gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm">Отчет по процедуре</h4>
                                      <p className="text-xs text-muted-foreground">
                                        Результаты оценки доступны для скачивания
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={procedure.reportUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex-shrink-0"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Скачать PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Секция отчетов от внешних провайдеров */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Отчеты от внешних провайдеров
              </h2>
              <Badge variant="outline" className="text-xs">
                Доступно: {visibleReports.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Отчеты отображаются в соответствии с вашей ролью и уровнем доступа.
              Переключите роль выше, чтобы увидеть отчеты от лица другого пользователя.
            </p>
            <ReportsList
              reports={reports}
              policies={policies}
              currentUserId={currentUserId}
              providers={providers.map((p) => ({ id: p.id, name: p.name }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="employees-procedures" className="mt-4 space-y-4">
          {(() => {
            const currentUser = reportUsers.find((u) => u.id === currentUserId);
            const isEmployee = currentUser?.role === "EMPLOYEE";

            if (isEmployee) {
              return (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Нет подчиненных</h3>
                      <p className="text-sm text-muted-foreground">
                        Для роли &laquo;Сотрудник&raquo; данный раздел недоступен.
                        Выберите руководящую роль, чтобы увидеть оценки подчиненных.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            const internalStatusMatch = (list: InternalAssessment[], filter: string) => {
              if (filter === "all") return true;
              if (filter === "none") return list.length === 0;
              if (filter === "has") return list.length > 0;
              return list.some((ia) => ia.status === filter);
            };

            const filteredAssessments = employeeAssessments.filter((rec) => {
              if (empFilterName) {
                const q = empFilterName.toLowerCase();
                if (!rec.fullName.toLowerCase().includes(q) && !rec.position.toLowerCase().includes(q)) return false;
              }
              if (empFilterDept !== "all" && rec.departmentId !== empFilterDept) return false;
              if (empFilterExtStatus !== "all") {
                if (empFilterExtStatus === "none" && rec.externalProcedures.length > 0) return false;
                if (empFilterExtStatus === "has" && rec.externalProcedures.length === 0) return false;
                if (empFilterExtStatus !== "none" && empFilterExtStatus !== "has") {
                  const hasMatchingStatus = rec.externalProcedures.some((ep) => ep.participantStatus === empFilterExtStatus);
                  if (!hasMatchingStatus) return false;
                }
              }
              const a360 = rec.internalAssessments.filter((ia) => ia.type === "360_FKR");
              if (!internalStatusMatch(a360, empFilter360)) return false;
              const aAC = rec.internalAssessments.filter((ia) => ia.type === "ASSESSMENT_CENTER");
              if (!internalStatusMatch(aAC, empFilterAC)) return false;
              const aCOR = rec.internalAssessments.filter((ia) => ia.type === "COR");
              if (!internalStatusMatch(aCOR, empFilterCOR)) return false;
              return true;
            });

            const activeFilterCount = [empFilterDept, empFilterExtStatus, empFilter360, empFilterAC, empFilterCOR].filter((v) => v !== "all").length;
            const hasActiveFilters = empFilterName !== "" || activeFilterCount > 0;

            const internalFilterSelect = (label: string, value: string, onChange: (v: string) => void) => (
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="has">Есть</SelectItem>
                    <SelectItem value="none">Нет</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="active">В процессе</SelectItem>
                    <SelectItem value="planned">Запланировано</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );

            return (
              <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="employees">Сотрудники</TabsTrigger>
                  <TabsTrigger value="team">Команда</TabsTrigger>
                </TabsList>

                <TabsContent value="employees" className="mt-4">
                  <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Оценочные процедуры сотрудников
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Дашборд руководителя · роль &laquo;{currentUser ? roleLabels[currentUser.role] : ""}&raquo;
                        {hasActiveFilters && (
                          <span className="ml-2 text-primary">
                            · показано {filteredAssessments.length} из {employeeAssessments.length}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button type="button" className="gap-1.5" onClick={(e) => { e.stopPropagation(); setIsRequestAssessmentOpen(true); }}>
                      <Send className="h-4 w-4" />
                      Подать заявку на оценку
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Строка поиска + кнопка фильтров */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={empFilterName}
                        onChange={(e) => setEmpFilterName(e.target.value)}
                        placeholder="Поиск по ФИО или должности..."
                        className="h-9 pl-9"
                      />
                      {empFilterName && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                          onClick={() => setEmpFilterName("")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant={activeFilterCount > 0 ? "default" : "outline"}
                      size="sm"
                      className="h-9 gap-1.5 px-3 shrink-0"
                      onClick={() => setIsEmpFiltersOpen(true)}
                    >
                      <Filter className="h-4 w-4" />
                      Фильтры
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-[10px] rounded-full bg-primary-foreground/20 text-primary-foreground">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs gap-1 text-muted-foreground shrink-0"
                        onClick={() => {
                          setEmpFilterName("");
                          setEmpFilterDept("all");
                          setEmpFilterExtStatus("all");
                          setEmpFilter360("all");
                          setEmpFilterAC("all");
                          setEmpFilterCOR("all");
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Сбросить
                      </Button>
                    )}
                  </div>

                  {/* Активные фильтры — бейджи */}
                  {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {empFilterDept !== "all" && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          Подразделение: {mockDepartments.find((d) => d.id === empFilterDept)?.name ?? empFilterDept}
                          <button type="button" className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => setEmpFilterDept("all")}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {empFilter360 !== "all" && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          360 (ФКР): {empFilter360 === "has" ? "Есть" : empFilter360 === "none" ? "Нет" : empFilter360 === "completed" ? "Завершено" : empFilter360 === "active" ? "В процессе" : "Запланировано"}
                          <button type="button" className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => setEmpFilter360("all")}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {empFilterAC !== "all" && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          Ассессмент: {empFilterAC === "has" ? "Есть" : empFilterAC === "none" ? "Нет" : empFilterAC === "completed" ? "Завершено" : empFilterAC === "active" ? "В процессе" : "Запланировано"}
                          <button type="button" className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => setEmpFilterAC("all")}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {empFilterCOR !== "all" && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          ЦОР: {empFilterCOR === "has" ? "Есть" : empFilterCOR === "none" ? "Нет" : empFilterCOR === "completed" ? "Завершено" : empFilterCOR === "active" ? "В процессе" : "Запланировано"}
                          <button type="button" className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => setEmpFilterCOR("all")}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                      {empFilterExtStatus !== "all" && (
                        <Badge variant="secondary" className="gap-1 pr-1">
                          Внеш. процедуры: {empFilterExtStatus === "has" ? "Есть" : empFilterExtStatus === "none" ? "Нет" : empFilterExtStatus === "completed" ? "Завершено" : empFilterExtStatus === "in-progress" ? "В процессе" : empFilterExtStatus === "invited" ? "Приглашен" : "Не начато"}
                          <button type="button" className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5" onClick={() => setEmpFilterExtStatus("all")}><X className="h-3 w-3" /></button>
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Модалка фильтров */}
                  <Dialog open={isEmpFiltersOpen} onOpenChange={setIsEmpFiltersOpen}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Filter className="h-5 w-5" />
                          Фильтры таблицы
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Подразделение</label>
                          <Select value={empFilterDept} onValueChange={setEmpFilterDept}>
                            <SelectTrigger className="h-9 text-sm w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Все подразделения</SelectItem>
                              {mockDepartments.map((d) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          {internalFilterSelect("360 (ФКР)", empFilter360, setEmpFilter360)}
                          {internalFilterSelect("Ассессмент-центр", empFilterAC, setEmpFilterAC)}
                          {internalFilterSelect("ЦОР", empFilterCOR, setEmpFilterCOR)}
                          <div>
                            <label className="text-xs font-medium text-foreground mb-1.5 block">Внеш. процедуры</label>
                            <Select value={empFilterExtStatus} onValueChange={setEmpFilterExtStatus}>
                              <SelectTrigger className="h-9 text-sm w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="has">Есть</SelectItem>
                                <SelectItem value="none">Нет</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                                <SelectItem value="in-progress">В процессе</SelectItem>
                                <SelectItem value="invited">Приглашен</SelectItem>
                                <SelectItem value="not-started">Не начато</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground gap-1"
                            onClick={() => {
                              setEmpFilterDept("all");
                              setEmpFilterExtStatus("all");
                              setEmpFilter360("all");
                              setEmpFilterAC("all");
                              setEmpFilterCOR("all");
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                            Сбросить все
                          </Button>
                          <Button type="button" onClick={() => setIsEmpFiltersOpen(false)}>
                            Применить
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Таблица */}
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[200px]">Сотрудник</TableHead>
                          <TableHead className="w-[140px]">Подразделение</TableHead>
                          <TableHead className="w-[110px]">360 (ФКР)</TableHead>
                          <TableHead className="w-[110px]">Ассессмент</TableHead>
                          <TableHead className="w-[110px]">ЦОР</TableHead>
                          <TableHead>Внешние процедуры</TableHead>
                          <TableHead className="w-[170px]">Категория сотрудника</TableHead>
                          <TableHead className="w-[170px]">Вероятность увольнения</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssessments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Нет сотрудников по заданным фильтрам</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAssessments.map((rec) => {
                            const dept = mockDepartments.find((d) => d.id === rec.departmentId);
                            const a360 = rec.internalAssessments.filter((ia) => ia.type === "360_FKR");
                            const aAC = rec.internalAssessments.filter((ia) => ia.type === "ASSESSMENT_CENTER");
                            const aCOR = rec.internalAssessments.filter((ia) => ia.type === "COR");

                            const renderInternalCell = (list: InternalAssessment[], type: InternalAssessmentType) => {
                              if (list.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
                              return (
                                <div className="flex flex-col gap-2">
                                  {list
                                    .slice()
                                    .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
                                    .map((ia) => {
                                      const isDone = ia.status === "completed";
                                      const scoreText =
                                        ia.score === undefined
                                          ? undefined
                                          : ia.scoreUnit === "percent"
                                            ? `${ia.score}%`
                                            : `${ia.score}`;

                                      const profileName =
                                        ia.type !== "ASSESSMENT_CENTER"
                                          ? undefined
                                          : ia.details?.find((d) => d.label === "Профиль")?.value;

                                      return (
                                        <div key={ia.id} className="rounded-md border bg-muted/10 px-2 py-1.5">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                              {(type === "360_FKR" || type === "COR") && (
                                                <div className="text-[11px] font-medium leading-tight truncate" title={ia.name}>
                                                  {ia.name}
                                                </div>
                                              )}
                                              {type === "ASSESSMENT_CENTER" && profileName && (
                                                <div className="text-[11px] font-medium leading-tight truncate" title={profileName}>
                                                  {profileName}
                                                </div>
                                              )}
                                              {type === "ASSESSMENT_CENTER" && !profileName && (
                                                <div className="text-[11px] font-medium leading-tight truncate" title={ia.name}>
                                                  {ia.name}
                                                </div>
                                              )}
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[10px] h-5 px-1.5 shrink-0",
                                                getStatusBadgeColor(ia.status === "active" ? "in-progress" : ia.status),
                                              )}
                                            >
                                              {getInternalAssessmentStatusText(ia.status)}
                                            </Badge>
                                          </div>

                                          <div className="flex items-center justify-between gap-2 mt-1">
                                            <div className="min-w-0">
                                              {scoreText && (
                                                <span className="text-xs font-semibold text-primary">{scoreText}</span>
                                              )}
                                              {ia.scoreLabel && (
                                                <div className="text-[11px] text-muted-foreground leading-tight">{ia.scoreLabel}</div>
                                              )}
                                              {ia.type === "ASSESSMENT_CENTER" && ia.details && (
                                                <div className="text-[11px] text-muted-foreground leading-tight">
                                                  {ia.details
                                                    .filter((d) => d.label === "Soft skills" || d.label === "Hard skills")
                                                    .map((d) => `${d.label}: ${d.value}`)
                                                    .join(" · ")}
                                                </div>
                                              )}
                                            </div>
                                            <button
                                              type="button"
                                              className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded-md hover:bg-muted transition-colors shrink-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (isDone) {
                                                  openProcedureResult({
                                                    name: ia.name,
                                                    kind: "internal",
                                                    providerOrTypeLabel: INTERNAL_ASSESSMENT_LABELS[type],
                                                    endDate: ia.endDate,
                                                    score: ia.score,
                                                    scoreUnit: ia.scoreUnit,
                                                    scoreLabel: ia.scoreLabel,
                                                    details: ia.details,
                                                    resultUrl: ia.resultUrl,
                                                  });
                                                } else {
                                                  openProcedureInfo({
                                                    kind: "internal",
                                                    name: ia.name,
                                                    type,
                                                    typeLabel: INTERNAL_ASSESSMENT_LABELS[type],
                                                    status: ia.status === "active" ? "in-progress" : ia.status,
                                                    statusLabel: getInternalAssessmentStatusText(ia.status),
                                                    startDate: ia.startDate,
                                                    endDate: ia.endDate,
                                                  });
                                                }
                                              }}
                                            >
                                              {isDone ? <><FileText className="h-3 w-3" />Результат</> : <><Eye className="h-3 w-3" />Просмотр</>}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              );
                            };

                            const riskLabel = rec.attritionRisk === "low" ? "Низкая" : rec.attritionRisk === "medium" ? "Средняя" : "Высокая";
                            const riskColor =
                              rec.attritionRisk === "low"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                                : rec.attritionRisk === "medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700";

                            return (
                              <TableRow key={rec.employeeId}>
                                <TableCell className="align-top">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                        {getInitials(rec.fullName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm leading-tight">{rec.fullName}</div>
                                      <div className="text-xs text-muted-foreground">{rec.position}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground align-top">{dept?.name ?? "—"}</TableCell>
                                <TableCell className="align-top">{renderInternalCell(a360, "360_FKR")}</TableCell>
                                <TableCell className="align-top">{renderInternalCell(aAC, "ASSESSMENT_CENTER")}</TableCell>
                                <TableCell className="align-top">{renderInternalCell(aCOR, "COR")}</TableCell>
                                <TableCell className="align-top py-2">
                                  {rec.externalProcedures.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-2">
                                      {rec.externalProcedures.map((ep) => {
                                        const isDone = ep.procedure.status === "completed" || ep.participantStatus === "completed";
                                        const epReports = reports.filter((r) => r.procedureId === ep.procedure.id);
                                        const hasIndividual = epReports.some((r) => r.type === "INDIVIDUAL");
                                        const otherTypes = [...new Set(epReports.filter((r) => r.type !== "INDIVIDUAL").map((r) => reportTypeLabels[r.type]))];

                                        return (
                                          <div
                                            key={ep.procedure.id}
                                            className={cn(
                                              "rounded-lg border p-3 w-[300px] flex flex-col gap-2 transition-colors",
                                              isDone ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" : "bg-card hover:bg-muted/30"
                                            )}
                                          >
                                            {/* Верхняя строка: даты слева, статус справа */}
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(ep.procedure.startDate)} — {formatDate(ep.procedure.endDate)}
                                              </span>
                                              <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 shrink-0", getStatusBadgeColor(ep.participantStatus === "not-started" ? "not-started" : ep.participantStatus))}>
                                                {getParticipantStatusText(ep.participantStatus)}
                                              </Badge>
                                            </div>

                                            {/* Название + провайдер */}
                                            <div>
                                              <div className="text-sm font-semibold leading-tight truncate" title={ep.procedure.name}>
                                                {ep.procedure.name}
                                              </div>
                                              <div className="text-xs text-muted-foreground truncate">{ep.procedure.providerName}</div>
                                            </div>

                                            {/* Отчёты */}
                                            {(hasIndividual || otherTypes.length > 0) && (
                                              <div className="flex flex-wrap gap-1">
                                                {hasIndividual && (
                                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                                                    <FileText className="h-3 w-3 mr-0.5" />Индивид.
                                                  </Badge>
                                                )}
                                                {otherTypes.map((lbl) => (
                                                  <Badge key={lbl} variant="outline" className="text-[10px] h-5 px-1.5 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700">
                                                    <FileText className="h-3 w-3 mr-0.5" />{lbl}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}

                                            {/* Кнопка действия */}
                                            <div className="flex gap-1.5 pt-1.5 border-t">
                                              <button
                                                type="button"
                                                className={cn(
                                                  "inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md transition-colors flex-1 justify-center",
                                                  isDone
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "bg-muted hover:bg-muted/80 text-foreground"
                                                )}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (isDone) {
                                                    const empReports = reports.filter(
                                                      (r) => r.procedureId === ep.procedure.id && r.type === "INDIVIDUAL",
                                                    );
                                                    openProcedureResult({
                                                      name: ep.procedure.name,
                                                      kind: "external",
                                                      providerOrTypeLabel: ep.procedure.providerName,
                                                      endDate: ep.procedure.endDate,
                                                      resultUrl: ep.procedure.reportUrl,
                                                      reports: empReports.map((r) => ({ id: r.id, title: r.title, type: r.type })),
                                                    });
                                                  } else {
                                                    openProcedureInfo({
                                                      kind: "external",
                                                      name: ep.procedure.name,
                                                      providerName: ep.procedure.providerName,
                                                      status: ep.procedure.status,
                                                      startDate: ep.procedure.startDate,
                                                      endDate: ep.procedure.endDate,
                                                      link: ep.procedure.link,
                                                      qrCodeLink: ep.procedure.qrCodeLink,
                                                      description: ep.procedure.description,
                                                      participantStatus: ep.participantStatus,
                                                    });
                                                  }
                                                }}
                                              >
                                                {isDone ? <><FileText className="h-4 w-4" />Результат</> : <><Eye className="h-4 w-4" />Подробнее</>}
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="align-top py-2">
                                  <Select
                                    value={rec.employeeCategory}
                                    onValueChange={(v) => {
                                      setEmployeeAssessments((prev) =>
                                        prev.map((x) => x.employeeId === rec.employeeId ? { ...x, employeeCategory: v as EmployeeAssessmentRecord["employeeCategory"] } : x),
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="h-9 text-sm w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="A">A</SelectItem>
                                      <SelectItem value="B">B</SelectItem>
                                      <SelectItem value="C">C</SelectItem>
                                      <SelectItem value="D">D</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="align-top py-2">
                                  <Badge variant="outline" className={cn("text-xs h-9 px-3 w-fit", riskColor)}>
                                    {riskLabel}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="team" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>Команда</CardTitle>
                          <CardDescription className="mt-1">
                            Матрица команды по категории сотрудника и риску увольнения
                          </CardDescription>
                        </div>
                        {currentUser?.role === "DEPARTMENT_HEAD" && (
                          <div className="w-[260px]">
                            <Label className="text-xs text-muted-foreground mb-1 block">Управление</Label>
                            <Select value={teamDepartmentId} onValueChange={setTeamDepartmentId}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Выберите управление" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Все управления</SelectItem>
                                {mockDepartments
                                  .filter((d) => d.name.includes("Управление"))
                                  .map((d) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const categoryOrder: EmployeeAssessmentRecord["employeeCategory"][] = ["A", "B", "C", "D"];
                        const riskOrder: EmployeeAssessmentRecord["attritionRisk"][] = ["high", "medium", "low"];
                        const riskLabel: Record<EmployeeAssessmentRecord["attritionRisk"], string> = {
                          low: "Низкая",
                          medium: "Средняя",
                          high: "Высокая",
                        };
                        const selectedDeptName =
                          teamDepartmentId === "all"
                            ? "Все управления"
                            : (mockDepartments.find((d) => d.id === teamDepartmentId)?.name ?? teamDepartmentId);

                        const teamEmployees = employeeAssessments.filter(
                          (e) => teamDepartmentId === "all" || e.departmentId === teamDepartmentId,
                        );

                        const grouped = teamEmployees.reduce<Record<string, EmployeeAssessmentRecord[]>>((acc, e) => {
                          const key = `${e.attritionRisk}:${e.employeeCategory}`;
                          (acc[key] ??= []).push(e);
                          return acc;
                        }, {});

                        const selectedEmployee = selectedTeamEmployeeId
                          ? teamEmployees.find((e) => e.employeeId === selectedTeamEmployeeId) ?? employeeAssessments.find((e) => e.employeeId === selectedTeamEmployeeId)
                          : null;
                        const pulse = selectedEmployee ? getEmployeePulseMetrics(selectedEmployee.employeeId) : null;
                        const latestByType = (type: InternalAssessmentType) =>
                          selectedEmployee?.internalAssessments
                            .filter((ia) => ia.type === type)
                            .slice()
                            .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())[0];
                        const latest360 = latestByType("360_FKR");
                        const latestAC = latestByType("ASSESSMENT_CENTER");
                        const latestCOR = latestByType("COR");

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                Управление: <span className="font-medium text-foreground">{selectedDeptName}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Сотрудников: {teamEmployees.length}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-5 gap-3 items-stretch">
                              <div />
                              {categoryOrder.map((c) => (
                                <div key={c} className="text-xs font-semibold text-muted-foreground text-center">
                                  Категория {c}
                                </div>
                              ))}

                              {riskOrder.map((r) => (
                                <div key={r} className="contents">
                                  <div className="flex items-center justify-end pr-1 text-xs font-semibold text-muted-foreground">
                                    {riskLabel[r]}
                                  </div>
                                  {categoryOrder.map((c) => {
                                    const list = (grouped[`${r}:${c}`] ?? []).slice().sort((a, b) => a.fullName.localeCompare(b.fullName, "ru-RU"));
                                    return (
                                      <BentoGrid key={`${r}-${c}`} className="grid-cols-1">
                                        <BentoGridItem
                                          title={`${list.length} сотрудн.`}
                                          description={list.length === 0 ? "Пусто" : "Состав ячейки"}
                                          className="min-h-[110px]"
                                        >
                                          {list.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                              {list.slice(0, 6).map((e) => (
                                                <button
                                                  key={e.employeeId}
                                                  type="button"
                                                  className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                  onClick={() => setSelectedTeamEmployeeId(e.employeeId)}
                                                  title={e.fullName}
                                                >
                                                  <Avatar className="h-8 w-8 border">
                                                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                                                      {getInitials(e.fullName)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                </button>
                                              ))}
                                              {list.length > 6 && (
                                                <Badge variant="outline" className="text-[11px] text-muted-foreground">
                                                  +{list.length - 6}
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                        </BentoGridItem>
                                      </BentoGrid>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              По вертикали — вероятность увольнения, по горизонтали — категория сотрудника.
                            </div>

                            <Dialog open={selectedTeamEmployeeId !== null} onOpenChange={(open) => { if (!open) setSelectedTeamEmployeeId(null); }}>
                              <DialogContent className="max-w-xl">
                                <DialogHeader>
                                  <DialogTitle>Карточка сотрудника</DialogTitle>
                                  <DialogDescription>
                                    Сводная информация по оценкам и метрикам команды
                                  </DialogDescription>
                                </DialogHeader>
                                {!selectedEmployee || !pulse ? (
                                  <div className="text-sm text-muted-foreground">Нет данных</div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 border">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                          {getInitials(selectedEmployee.fullName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0">
                                        <div className="font-medium truncate">{selectedEmployee.fullName}</div>
                                        <div className="text-sm text-muted-foreground truncate">
                                          {selectedEmployee.position} · {mockDepartments.find((d) => d.id === selectedEmployee.departmentId)?.name ?? selectedEmployee.departmentId}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {[
                                        { label: "Вовлечённость", value: pulse.engagement },
                                        { label: "Лояльность", value: pulse.loyalty },
                                        { label: "Happy index", value: pulse.happyIndex },
                                      ].map((m) => (
                                        <div key={m.label} className="rounded-lg border p-3">
                                          <div className="text-xs text-muted-foreground mb-1">{m.label}</div>
                                          <div className="text-lg font-semibold">{m.value}%</div>
                                          <Progress value={m.value} className="h-1.5 mt-2" />
                                        </div>
                                      ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                      <div className="rounded-lg border p-3">
                                        <div className="text-xs text-muted-foreground mb-1">360 (ФКР)</div>
                                        <div className="font-medium">{latest360?.name ?? "—"}</div>
                                        <div className="text-muted-foreground">{latest360?.score !== undefined ? `${latest360.score}` : "Нет оценки"}</div>
                                      </div>
                                      <div className="rounded-lg border p-3">
                                        <div className="text-xs text-muted-foreground mb-1">Ассессмент</div>
                                        <div className="font-medium">{latestAC?.details?.find((d) => d.label === "Профиль")?.value ?? latestAC?.name ?? "—"}</div>
                                        <div className="text-muted-foreground">{latestAC?.status ? getInternalAssessmentStatusText(latestAC.status) : "Нет оценки"}</div>
                                      </div>
                                      <div className="rounded-lg border p-3">
                                        <div className="text-xs text-muted-foreground mb-1">ЦОР</div>
                                        <div className="font-medium">{latestCOR?.name ?? "—"}</div>
                                        <div className="text-muted-foreground">{latestCOR?.score !== undefined ? `${latestCOR.score}%` : "Нет оценки"}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            );
          })()}
        </TabsContent>

        <TabsContent value="administration" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Администрирование</h2>
              <p className="text-muted-foreground">
                Управление провайдерами и оценочными процедурами
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => setIsReportUploadOpen(true)} size="lg" variant="outline" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить отчет
              </Button>
              <Button onClick={handleCreate} size="lg" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Добавить провайдера/процедуру
              </Button>
            </div>
          </div>

          {/* Поиск и фильтр */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по провайдерам и процедурам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            </div>
            <Select value={adminStatusFilter} onValueChange={(v) => setAdminStatusFilter(v as typeof adminStatusFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="request">Заявки</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Двухколоночная структура */}
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "Провайдеры не найдены" : "Нет провайдеров"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Создайте первого провайдера, чтобы начать работу"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreate} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить провайдера
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 min-h-[calc(100vh-280px)] w-full overflow-x-hidden">
              {/* Левая колонка - иерархия провайдеров и процедур */}
              <div className="w-[480px] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
                <div className="p-2 border-b bg-muted/30">
                  <h3 className="font-semibold text-sm">Провайдеры и процедуры</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredData.map((provider) => (
                      <div key={provider.id} className="space-y-1">
                        {/* Провайдер */}
                        <div
                          className="p-2 rounded-md cursor-pointer transition-colors hover:bg-muted"
                          onClick={() => toggleProvider(provider.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProvider(provider.id);
                              }}
                            >
                              {expandedProviders.has(provider.id) ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm break-words">{provider.name}</div>
                              {provider.description && (
                                <div className="text-xs text-muted-foreground break-words mt-0.5">
                                  {provider.description.length > 40
                                    ? provider.description.substring(0, 40) + "..."
                                    : provider.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {provider.procedures.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Процедуры провайдера */}
                        {expandedProviders.has(provider.id) && (
                          <div className="ml-6 space-y-1">
                            {provider.procedures.map((procedure) => (
                              <div
                                key={procedure.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectProcedure(procedure);
                                }}
                                className={cn(
                                  "p-2 rounded-md cursor-pointer transition-colors text-sm",
                                  selectedProcedure?.id === procedure.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <ClipboardCheck className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium break-words">{procedure.name}</div>
                                    <Badge
                                      variant="outline"
                                      className={cn("text-xs mt-1", getStatusColor(procedure.status))}
                                    >
                                      {getStatusText(procedure.status)}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Правая колонка - детальная информация о процедуре */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)]">
                {selectedProcedure ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1 break-words">{selectedProcedure.name}</CardTitle>
                          <CardDescription className="text-base break-words">
                            {selectedProcedure.description || "Описание отсутствует"}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingProcedure(selectedProcedure);
                            setProcedureFormData({
                              name: selectedProcedure.name,
                              providerId: selectedProcedure.providerId,
                              description: selectedProcedure.description || "",
                              startDate: selectedProcedure.startDate.toISOString().split('T')[0],
                              endDate: selectedProcedure.endDate.toISOString().split('T')[0],
                              link: selectedProcedure.link,
                              qrCodeLink: selectedProcedure.qrCodeLink,
                              status: selectedProcedure.status,
                            });
                            setCreateType("procedure");
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 overflow-x-hidden">
                      <div className="space-y-4 max-w-full">
                        {/* Провайдер */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Провайдер</Label>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedProcedure.providerName}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Статус */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Статус</Label>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn("text-sm px-3 py-1", getStatusColor(selectedProcedure.status))}
                            >
                              {getStatusText(selectedProcedure.status)}
                            </Badge>
                            {selectedProcedure.status === "request" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="gap-1.5"
                                  onClick={() => {
                                    const updated: AssessmentProcedure = { ...selectedProcedure, status: "planned" };
                                    setSelectedProcedure(updated);
                                    setProviders((prev) =>
                                      prev.map((p) =>
                                        p.procedures.some((pr) => pr.id === updated.id)
                                          ? { ...p, procedures: p.procedures.map((pr) => (pr.id === updated.id ? updated : pr)) }
                                          : p,
                                      ),
                                    );
                                  }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Принять в работу
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1.5"
                                  onClick={() => {
                                    const updated: AssessmentProcedure = { ...selectedProcedure, status: "cancelled" };
                                    setSelectedProcedure(updated);
                                    setProviders((prev) =>
                                      prev.map((p) =>
                                        p.procedures.some((pr) => pr.id === updated.id)
                                          ? { ...p, procedures: p.procedures.map((pr) => (pr.id === updated.id ? updated : pr)) }
                                          : p,
                                      ),
                                    );
                                  }}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Отклонить
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Даты */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Период проведения</Label>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(selectedProcedure.startDate)} - {formatDate(selectedProcedure.endDate)}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Ссылки */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Ссылка на процедуру</Label>
                            <div className="flex items-center gap-2">
                              <a
                                href={selectedProcedure.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                              >
                                {selectedProcedure.link}
                                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Ссылка для QR кода</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono break-all text-muted-foreground">
                                {selectedProcedure.qrCodeLink}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedQrCode(selectedProcedure.qrCodeLink)}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Показать QR
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Участники */}
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Участники ({selectedProcedure.participants?.length || 0})
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsNotificationsDialogOpen(true)}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Управление нотификациями
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Получаем ID уже добавленных участников
                                  const existingParticipantIds = selectedProcedure.participants?.map(p => {
                                    // Ищем сотрудника по email или fullName
                                    const employee = mockEmployees.find(emp => 
                                      emp.email === p.email || emp.fullName === p.fullName
                                    );
                                    return employee?.id;
                                  }).filter(Boolean) as string[] || [];
                                  setSelectedEmployeeIds(existingParticipantIds);
                                  setIsAddParticipantsDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить участников
                              </Button>
                            </div>
                          </div>
                          {selectedProcedure.participants && selectedProcedure.participants.length > 0 ? (
                              <div className="space-y-3">
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                      <TableHead className="w-[250px]">Сотрудник</TableHead>
                                      <TableHead className="w-[200px]">Должность / Подразделение</TableHead>
                                      <TableHead className="w-[300px]">Уникальная ссылка на процедуру оценки</TableHead>
                                        <TableHead className="w-[150px]">Статус</TableHead>
                                        <TableHead className="w-[180px]">Отчет по процедуре</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(() => {
                                        // Логика пагинации
                                        const totalPages = Math.ceil((selectedProcedure.participants?.length || 0) / participantsItemsPerPage);
                                        const startIndex = (participantsCurrentPage - 1) * participantsItemsPerPage;
                                        const endIndex = startIndex + participantsItemsPerPage;
                                        const paginatedParticipants = selectedProcedure.participants?.slice(startIndex, endIndex) || [];
                                        
                                        return paginatedParticipants.length === 0 ? (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                              Нет участников
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          paginatedParticipants.map((participant) => (
                                            <TableRow key={participant.id}>
                                              <TableCell className="px-4 whitespace-normal">
                                                <div className="flex items-center gap-3">
                                                  <Avatar className="h-10 w-10 shrink-0">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                      {getInitials(participant.fullName)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="font-medium">{participant.fullName}</span>
                                                  </div>
                                                </div>
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {(() => {
                                                  const department = participant.departmentId 
                                                    ? mockDepartments.find((d) => d.id === participant.departmentId)
                                                    : null;
                                                  return (
                                                    <div className="flex flex-col gap-1">
                                                      <span className="font-medium">{participant.position}</span>
                                                      {department && (
                                                        <div className="text-sm text-muted-foreground">
                                                          {department.name}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                })()}
                                              </TableCell>
                                              <TableCell className="px-4 whitespace-normal">
                                                {participant.uniqueLink ? (
                                                  <a
                                                    href={participant.uniqueLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline font-mono break-all flex items-center gap-1"
                                                  >
                                                    {participant.uniqueLink}
                                                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                                  </a>
                                                ) : (
                                                  <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <Badge
                                                  variant="outline"
                                                  className={cn(
                                                    "text-xs px-2 py-0.5",
                                                    getParticipantStatusColor(participant.status)
                                                  )}
                                                >
                                                  {getParticipantStatusText(participant.status)}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {participant.reportUrl ? (
                                                  <a
                                                    href={participant.reportUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                                                  >
                                                    <FileText className="h-4 w-4" />
                                                    Скачать PDF
                                                  </a>
                                                ) : (
                                                  <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        );
                                      })()}
                                    </TableBody>
                                  </Table>
                                </div>
                                
                                {/* Пагинация */}
                                {selectedProcedure.participants && selectedProcedure.participants.length > 0 && (() => {
                                  const totalPages = Math.ceil(selectedProcedure.participants.length / participantsItemsPerPage);
                                  
                                  return (
                                    <div className="flex items-center justify-between px-2">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor="participants-items-per-page" className="text-sm text-muted-foreground">
                                          Показать:
                                        </Label>
                                        <Select
                                          value={participantsItemsPerPage.toString()}
                                          onValueChange={(value) => {
                                            setParticipantsItemsPerPage(Number(value));
                                            setParticipantsCurrentPage(1);
                                          }}
                                        >
                                          <SelectTrigger id="participants-items-per-page" className="w-[80px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <span className="text-sm text-muted-foreground">
                                          из {selectedProcedure.participants.length}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                          Страница {participantsCurrentPage} из {totalPages}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setParticipantsCurrentPage(1)}
                                            disabled={participantsCurrentPage === 1}
                                          >
                                            <ChevronsLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setParticipantsCurrentPage(participantsCurrentPage - 1)}
                                            disabled={participantsCurrentPage === 1}
                                          >
                                            <ChevronLeft className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setParticipantsCurrentPage(participantsCurrentPage + 1)}
                                            disabled={participantsCurrentPage === totalPages}
                                          >
                                            <ChevronRight className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setParticipantsCurrentPage(totalPages)}
                                            disabled={participantsCurrentPage === totalPages}
                                          >
                                            <ChevronsRight className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <div className="border rounded-lg p-8 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">
                                  Участники не добавлены
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedEmployeeIds([]);
                                    setIsAddParticipantsDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Добавить участников
                                </Button>
                              </div>
                            )}
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите процедуру</h3>
                      <p className="text-muted-foreground">
                        Выберите процедуру из списка слева, чтобы просмотреть подробную информацию
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Загруженные отчеты */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Загруженные отчеты ({reports.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportUploadOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Загрузить отчет
              </Button>
            </div>
            {reports.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Отчеты еще не загружены
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsReportUploadOpen(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить первый отчет
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead className="w-[120px]">Тип</TableHead>
                      <TableHead className="w-[180px]">Подразделение</TableHead>
                      <TableHead className="w-[150px]">Владелец</TableHead>
                      <TableHead className="w-[200px]">Доп. доступ</TableHead>
                      <TableHead className="w-[90px]">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const unit = report.unitId
                        ? reportOrgUnits.find((u) => u.id === report.unitId)
                        : null;
                      const owner = report.ownerUserId
                        ? reportUsers.find((u) => u.id === report.ownerUserId)
                        : null;

                      return (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{report.title}</div>
                            <div className="text-xs text-muted-foreground">{report.procedureName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                report.type === "INDIVIDUAL" && "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
                                report.type === "GROUP" && "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
                                report.type === "SUMMARY" && "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700",
                                report.type === "OVERALL" && "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
                                report.type === "ANALYTIC" && "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900 dark:text-rose-200 dark:border-rose-700",
                              )}
                            >
                              {reportTypeLabels[report.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={report.unitId ?? ""}
                              onValueChange={(v) => {
                                setReports((prev) =>
                                  prev.map((r) => r.id === report.id ? { ...r, unitId: v || null } : r),
                                );
                              }}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Не указано" />
                              </SelectTrigger>
                              <SelectContent>
                                {reportOrgUnits.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {owner?.fullName ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1">
                              {report.customViewerUserIds.map((uid) => {
                                const u = reportUsers.find((x) => x.id === uid);
                                return (
                                  <Badge key={uid} variant="secondary" className="text-[10px] gap-0.5 pr-0.5">
                                    {u?.fullName.split(" ").slice(0, 2).join(" ") ?? uid}
                                    <X
                                      className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                                      onClick={() => {
                                        setReports((prev) =>
                                          prev.map((r) =>
                                            r.id === report.id
                                              ? { ...r, customViewerUserIds: r.customViewerUserIds.filter((id) => id !== uid) }
                                              : r,
                                          ),
                                        );
                                      }}
                                    />
                                  </Badge>
                                );
                              })}
                              <Select
                                onValueChange={(uid) => {
                                  setReports((prev) =>
                                    prev.map((r) =>
                                      r.id === report.id && !r.customViewerUserIds.includes(uid)
                                        ? { ...r, customViewerUserIds: [...r.customViewerUserIds, uid] }
                                        : r,
                                    ),
                                  );
                                }}
                              >
                                <SelectTrigger className="h-6 w-6 p-0 border-dashed [&>svg:last-child]:hidden">
                                  <Plus className="h-3 w-3" />
                                </SelectTrigger>
                                <SelectContent>
                                  {reportUsers
                                    .filter((u) => !report.customViewerUserIds.includes(u.id))
                                    .map((u) => (
                                      <SelectItem key={u.id} value={u.id}>
                                        {u.fullName} — {roleLabels[u.role]}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(report.uploadedAt).toLocaleDateString("ru-RU")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Настройка видимости */}
          <Separator />
          <VisibilityPolicyEditor
            policies={policies}
            onPoliciesChange={setPolicies}
            reports={reports}
            onReportsChange={setReports}
            employees={mockEmployees.map((e) => ({ id: e.id, fullName: e.fullName, position: e.position }))}
          />

          {/* Диалог загрузки отчетов */}
          <ReportUploadDialog
            open={isReportUploadOpen}
            onOpenChange={setIsReportUploadOpen}
            onUpload={handleReportUpload}
            procedures={allProcedures}
          />

          {/* Диалог добавления участников */}
          <AddParticipantsDialog
            open={isAddParticipantsDialogOpen}
            onOpenChange={setIsAddParticipantsDialogOpen}
            employees={mockEmployees}
            departments={mockDepartments}
            existingParticipantIds={selectedEmployeeIds}
            onAddParticipants={handleAddParticipants}
          />

          {/* Модальное окно создания провайдера или процедуры */}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setCreateType(null);
              setEditingProcedure(null);
              setProviderFormData({ name: "", description: "" });
              setProcedureFormData({
                name: "",
                providerId: "",
                description: "",
                startDate: "",
                endDate: "",
                link: "",
                qrCodeLink: "",
                status: "planned",
              });
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {!createType 
                    ? "Добавить" 
                    : createType === "provider" 
                    ? "Добавить провайдера" 
                    : editingProcedure 
                    ? "Редактировать процедуру" 
                    : "Добавить процедуру"}
                </DialogTitle>
                <DialogDescription>
                  {!createType 
                    ? "Выберите, что вы хотите добавить"
                    : createType === "provider"
                    ? "Заполните информацию о внешнем провайдере"
                    : editingProcedure
                    ? "Внесите изменения в оценочную процедуру"
                    : "Заполните информацию об оценочной процедуре"}
                </DialogDescription>
              </DialogHeader>
              {!createType ? (
                <div className="space-y-3 py-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setCreateType("provider")}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Провайдер</div>
                        <div className="text-sm text-muted-foreground">
                          Добавить нового внешнего провайдера
                        </div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => setCreateType("procedure")}
                    disabled={providers.length === 0}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-semibold">Процедура</div>
                        <div className="text-sm text-muted-foreground">
                          Добавить новую оценочную процедуру
                        </div>
                      </div>
                    </div>
                  </Button>
                  {providers.length === 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-muted">
                      <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Сначала добавьте провайдера
                      </p>
                    </div>
                  )}
                </div>
              ) : createType === "provider" ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">
                      Название провайдера <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="provider-name"
                      value={providerFormData.name}
                      onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })}
                      placeholder="Например, Hogan Assessment Systems"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-description">Описание</Label>
                    <Textarea
                      id="provider-description"
                      value={providerFormData.description}
                      onChange={(e) => setProviderFormData({ ...providerFormData, description: e.target.value })}
                      placeholder="Описание провайдера и его услуг"
                      rows={4}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCreateType(null);
                      setEditingProcedure(null);
                      setProcedureFormData({
                        name: "",
                        providerId: "",
                        description: "",
                        startDate: "",
                        endDate: "",
                        link: "",
                        qrCodeLink: "",
                        status: "planned",
                      });
                    }}>
                      Назад
                    </Button>
                    <Button 
                      onClick={handleCreateProvider}
                      disabled={!providerFormData.name.trim()}
                    >
                      Добавить провайдера
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="procedure-name">
                      Название процедуры <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="procedure-name"
                      value={procedureFormData.name}
                      onChange={(e) => setProcedureFormData({ ...procedureFormData, name: e.target.value })}
                      placeholder="Например, Оценка лидерских компетенций"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedure-provider">
                      Провайдер <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={procedureFormData.providerId}
                      onValueChange={(value) => setProcedureFormData({ ...procedureFormData, providerId: value })}
                    >
                      <SelectTrigger id="procedure-provider">
                        <SelectValue placeholder="Выберите провайдера" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedure-description">Описание</Label>
                    <Textarea
                      id="procedure-description"
                      value={procedureFormData.description}
                      onChange={(e) => setProcedureFormData({ ...procedureFormData, description: e.target.value })}
                      placeholder="Описание оценочной процедуры"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="procedure-start-date">
                        Дата начала <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="procedure-start-date"
                        type="date"
                        value={procedureFormData.startDate}
                        onChange={(e) => setProcedureFormData({ ...procedureFormData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="procedure-end-date">
                        Дата окончания <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="procedure-end-date"
                        type="date"
                        value={procedureFormData.endDate}
                        onChange={(e) => setProcedureFormData({ ...procedureFormData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedure-link">
                      Ссылка на процедуру <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="procedure-link"
                      type="url"
                      value={procedureFormData.link}
                      onChange={(e) => setProcedureFormData({ ...procedureFormData, link: e.target.value })}
                      placeholder="https://assessment.example.com/procedure/1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedure-qr-link">
                      Ссылка для QR кода <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="procedure-qr-link"
                      type="url"
                      value={procedureFormData.qrCodeLink}
                      onChange={(e) => setProcedureFormData({ ...procedureFormData, qrCodeLink: e.target.value })}
                      placeholder="https://assessment.example.com/qr/1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="procedure-status">
                      Статус <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={procedureFormData.status}
                      onValueChange={(value: "planned" | "in-progress" | "completed" | "cancelled") => 
                        setProcedureFormData({ ...procedureFormData, status: value })
                      }
                    >
                      <SelectTrigger id="procedure-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Запланировано</SelectItem>
                        <SelectItem value="in-progress">В процессе</SelectItem>
                        <SelectItem value="completed">Завершено</SelectItem>
                        <SelectItem value="cancelled">Отменено</SelectItem>
                        <SelectItem value="request">Заявка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCreateType(null);
                      setEditingProcedure(null);
                      setProcedureFormData({
                        name: "",
                        providerId: "",
                        description: "",
                        startDate: "",
                        endDate: "",
                        link: "",
                        qrCodeLink: "",
                        status: "planned",
                      });
                    }}>
                      Назад
                    </Button>
                    <Button 
                      onClick={handleCreateProcedure}
                      disabled={
                        !procedureFormData.name.trim() ||
                        !procedureFormData.providerId ||
                        !procedureFormData.startDate ||
                        !procedureFormData.endDate ||
                        !procedureFormData.link.trim() ||
                        !procedureFormData.qrCodeLink.trim()
                      }
                    >
                      {editingProcedure ? "Сохранить изменения" : "Добавить процедуру"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Модалки оценочных процедур сотрудников — вне Tabs, чтобы работали с любой вкладки */}
      <ProcedureInfoDialog
        open={procedureInfoData !== null}
        onOpenChange={(open) => { if (!open) setProcedureInfoData(null); }}
        procedure={procedureInfoData}
      />
      <ProcedureResultDialog
        open={procedureResultData !== null}
        onOpenChange={(open) => { if (!open) setProcedureResultData(null); }}
        result={procedureResultData}
      />
      <RequestAssessmentDialog
        open={isRequestAssessmentOpen}
        onOpenChange={setIsRequestAssessmentOpen}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
        employees={mockEmployees.map((e) => ({ id: e.id, fullName: e.fullName, position: e.position }))}
        onSubmit={handleRequestAssessment}
      />

      {/* Модальное окно управления нотификациями */}
      <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Управление нотификациями
            </DialogTitle>
            <DialogDescription>
              Выберите сотрудников и отправьте им уведомления на почту
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="send" className="w-full">
            <TabsList variant="grid2">
              <TabsTrigger value="send">Отправить уведомление</TabsTrigger>
              <TabsTrigger value="history">История отправленных</TabsTrigger>
            </TabsList>
            
            <TabsContent value="send" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-subject">
                    Тема письма <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="notification-subject"
                    value={notificationFormData.subject}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, subject: e.target.value })}
                    placeholder="Например, Приглашение на оценочную процедуру"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-message">
                    Текст сообщения <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="notification-message"
                    value={notificationFormData.message}
                    onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })}
                    placeholder="Введите текст уведомления..."
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>
                    Получатели <span className="text-destructive">*</span>
                  </Label>
                  <MultiSelect
                    options={mockEmployees.map((emp) => ({
                      value: emp.id,
                      label: `${emp.fullName} (${emp.position})`,
                    }))}
                    selected={notificationFormData.recipientIds}
                    onChange={(selected) => setNotificationFormData({ ...notificationFormData, recipientIds: selected })}
                    placeholder="Выберите сотрудников..."
                  />
                  {notificationFormData.recipientIds.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Выбрано сотрудников: {notificationFormData.recipientIds.length}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNotificationFormData({
                        subject: "",
                        message: "",
                        recipientIds: [],
                      });
                    }}
                  >
                    Очистить
                  </Button>
                  <Button
                    onClick={() => {
                      if (!notificationFormData.subject.trim() || !notificationFormData.message.trim() || notificationFormData.recipientIds.length === 0) {
                        return;
                      }
                      
                      const selectedEmployees = mockEmployees.filter(emp => 
                        notificationFormData.recipientIds.includes(emp.id)
                      );
                      
                      const newNotification: Notification = {
                        id: `notif-${Date.now()}`,
                        subject: notificationFormData.subject.trim(),
                        message: notificationFormData.message.trim(),
                        recipientIds: notificationFormData.recipientIds,
                        recipientEmails: selectedEmployees.map(emp => emp.email),
                        sentAt: new Date(),
                        status: "sent",
                      };
                      
                      setNotifications([newNotification, ...notifications]);
                      setNotificationFormData({
                        subject: "",
                        message: "",
                        recipientIds: [],
                      });
                    }}
                    disabled={
                      !notificationFormData.subject.trim() ||
                      !notificationFormData.message.trim() ||
                      notificationFormData.recipientIds.length === 0
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить уведомления
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4 space-y-4">
              <div className="space-y-4">
                {/* Поиск по истории */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по теме или получателям..."
                    value={notificationSearchQuery}
                    onChange={(e) => setNotificationSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {notificationSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setNotificationSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Список уведомлений */}
                <div className="space-y-3">
                  {(() => {
                    const filteredNotifications = notifications.filter(notif => {
                      if (!notificationSearchQuery.trim()) return true;
                      const query = notificationSearchQuery.toLowerCase();
                      return (
                        notif.subject.toLowerCase().includes(query) ||
                        notif.message.toLowerCase().includes(query) ||
                        notif.recipientEmails.some(email => email.toLowerCase().includes(query))
                      );
                    });
                    
                    if (filteredNotifications.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">
                            {notificationSearchQuery ? "Уведомления не найдены" : "Нет отправленных уведомлений"}
                          </p>
                        </div>
                      );
                    }
                    
                    return filteredNotifications.map((notification) => {
                      const recipients = mockEmployees.filter(emp => 
                        notification.recipientIds.includes(emp.id)
                      );
                      
                      return (
                        <Card key={notification.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{notification.subject}</h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        notification.status === "sent" && "bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
                                        notification.status === "pending" && "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
                                        notification.status === "failed" && "bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                      )}
                                    >
                                      {notification.status === "sent" && (
                                        <>
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Отправлено
                                        </>
                                      )}
                                      {notification.status === "pending" && (
                                        <>
                                          <Clock className="h-3 w-3 mr-1" />
                                          В очереди
                                        </>
                                      )}
                                      {notification.status === "failed" && "Ошибка"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(notification.sentAt)} {notification.sentAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                  Получатели ({recipients.length}):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {recipients.map((recipient) => (
                                    <Badge key={recipient.id} variant="secondary" className="text-xs">
                                      {recipient.fullName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Модальное окно для QR кода */}
      <Dialog open={selectedQrCode !== null} onOpenChange={() => setSelectedQrCode(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR код для доступа
            </DialogTitle>
            <DialogDescription>
              Отсканируйте QR код для быстрого доступа к оценочной процедуре
            </DialogDescription>
          </DialogHeader>
          {selectedQrCode && (
            <div className="space-y-6">
              {/* QR код */}
              <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="relative w-64 h-64 bg-white rounded-lg p-6 shadow-sm border-2">
                  {/* Имитация QR кода с более реалистичным паттерном */}
                  <div className="w-full h-full relative">
                    {/* Угловые маркеры */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-foreground">
                      <div className="absolute top-1 left-1 w-10 h-10 border-2 border-foreground" />
                      <div className="absolute top-3 left-3 w-6 h-6 bg-foreground" />
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 border-4 border-foreground">
                      <div className="absolute top-1 right-1 w-10 h-10 border-2 border-foreground" />
                      <div className="absolute top-3 right-3 w-6 h-6 bg-foreground" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-4 border-foreground">
                      <div className="absolute bottom-1 left-1 w-10 h-10 border-2 border-foreground" />
                      <div className="absolute bottom-3 left-3 w-6 h-6 bg-foreground" />
                    </div>
                    
                    {/* Центральная область с паттерном */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="grid grid-cols-12 gap-0.5 w-3/4 h-3/4">
                        {Array.from({ length: 144 }).map((_, i) => {
                          // Создаем более реалистичный паттерн QR кода
                          const row = Math.floor(i / 12);
                          const col = i % 12;
                          const shouldFill = 
                            (row < 2 || row >= 10 || col < 2 || col >= 10) ||
                            (row >= 4 && row < 8 && col >= 4 && col < 8) ||
                            (i % 3 === 0) ||
                            (row % 2 === 0 && col % 2 === 0);
                          
                          return (
                            <div
                              key={i}
                              className={cn(
                                "aspect-square",
                                shouldFill ? "bg-foreground" : "bg-transparent"
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Отсканируйте QR код</p>
                  <p className="text-xs text-muted-foreground">
                    Используйте камеру вашего устройства для сканирования
                  </p>
                </div>
              </div>

              {/* Информация о ссылке */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Link2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Ссылка для доступа:</p>
                    <p className="text-sm break-all font-mono bg-background p-2 rounded border">
                      {selectedQrCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedQrCode);
                  }}
                >
                  Копировать ссылку
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => window.open(selectedQrCode, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть ссылку
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

