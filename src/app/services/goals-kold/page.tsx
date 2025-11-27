"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Target, Users, FileText, Table as TableIcon, Search, X, ChevronDown, ChevronRight, Building2, UserCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Тип для стрима
interface Stream {
  id: string;
  name: string;
  description?: string;
  leader?: string;
  itLeader?: string;
  teams: Team[];
}

// Тип для команды
interface Team {
  id: string;
  name: string;
  description?: string;
  streamId: string;
  streamName: string;
  leader?: string;
  membersCount?: number;
}

// Тип для КПЭ (ключевого показателя эффективности)
interface KPI {
  id: string;
  number: number;
  name: string;
  weight: number;
  type: string;
  unit: string;
  plan: number;
  fact: number;
  completionPercent: number;
  evaluationPercent: number;
}

// Моковые данные для годовых целей стрима
const mockStreamKPIs: Record<string, KPI[]> = {
  "stream-1": [
    {
      id: "kpi-1-1",
      number: 1,
      name: "Количество выпущенных релизов",
      weight: 25,
      type: "Количественный",
      unit: "шт.",
      plan: 12,
      fact: 10,
      completionPercent: 83.3,
      evaluationPercent: 20.8,
    },
    {
      id: "kpi-1-2",
      number: 2,
      name: "Время разработки фичи",
      weight: 20,
      type: "Количественный",
      unit: "дн.",
      plan: 5,
      fact: 4.5,
      completionPercent: 111.1,
      evaluationPercent: 22.2,
    },
    {
      id: "kpi-1-3",
      number: 3,
      name: "Качество кода",
      weight: 20,
      type: "Качественный",
      unit: "%",
      plan: 85,
      fact: 88,
      completionPercent: 103.5,
      evaluationPercent: 20.7,
    },
    {
      id: "kpi-1-4",
      number: 4,
      name: "Количество закрытых задач",
      weight: 20,
      type: "Количественный",
      unit: "шт.",
      plan: 500,
      fact: 480,
      completionPercent: 96,
      evaluationPercent: 19.2,
    },
    {
      id: "kpi-1-5",
      number: 5,
      name: "Удовлетворенность команды",
      weight: 15,
      type: "Качественный",
      unit: "%",
      plan: 80,
      fact: 82,
      completionPercent: 102.5,
      evaluationPercent: 15.4,
    },
  ],
  "stream-2": [
    {
      id: "kpi-2-1",
      number: 1,
      name: "Покрытие тестами",
      weight: 30,
      type: "Количественный",
      unit: "%",
      plan: 80,
      fact: 85,
      completionPercent: 106.3,
      evaluationPercent: 31.9,
    },
    {
      id: "kpi-2-2",
      number: 2,
      name: "Количество найденных багов",
      weight: 25,
      type: "Количественный",
      unit: "шт.",
      plan: 50,
      fact: 45,
      completionPercent: 111.1,
      evaluationPercent: 27.8,
    },
    {
      id: "kpi-2-3",
      number: 3,
      name: "Время исправления критических багов",
      weight: 20,
      type: "Количественный",
      unit: "час.",
      plan: 4,
      fact: 3.5,
      completionPercent: 114.3,
      evaluationPercent: 22.9,
    },
    {
      id: "kpi-2-4",
      number: 4,
      name: "Процент успешных тестов",
      weight: 15,
      type: "Количественный",
      unit: "%",
      plan: 95,
      fact: 97,
      completionPercent: 102.1,
      evaluationPercent: 15.3,
    },
    {
      id: "kpi-2-5",
      number: 5,
      name: "Качество документации",
      weight: 10,
      type: "Качественный",
      unit: "%",
      plan: 75,
      fact: 78,
      completionPercent: 104,
      evaluationPercent: 10.4,
    },
  ],
  "stream-3": [
    {
      id: "kpi-3-1",
      number: 1,
      name: "Время развертывания",
      weight: 30,
      type: "Количественный",
      unit: "мин.",
      plan: 10,
      fact: 8,
      completionPercent: 125,
      evaluationPercent: 37.5,
    },
    {
      id: "kpi-3-2",
      number: 2,
      name: "Доступность сервисов",
      weight: 25,
      type: "Количественный",
      unit: "%",
      plan: 99.9,
      fact: 99.95,
      completionPercent: 100.1,
      evaluationPercent: 25,
    },
    {
      id: "kpi-3-3",
      number: 3,
      name: "Количество инцидентов",
      weight: 20,
      type: "Количественный",
      unit: "шт.",
      plan: 5,
      fact: 4,
      completionPercent: 125,
      evaluationPercent: 25,
    },
    {
      id: "kpi-3-4",
      number: 4,
      name: "Время восстановления сервиса",
      weight: 15,
      type: "Количественный",
      unit: "мин.",
      plan: 30,
      fact: 25,
      completionPercent: 120,
      evaluationPercent: 18,
    },
    {
      id: "kpi-3-5",
      number: 5,
      name: "Эффективность использования ресурсов",
      weight: 10,
      type: "Количественный",
      unit: "%",
      plan: 85,
      fact: 88,
      completionPercent: 103.5,
      evaluationPercent: 10.4,
    },
  ],
  "stream-4": [
    {
      id: "kpi-4-1",
      number: 1,
      name: "Количество обработанных неплатежей",
      weight: 30,
      type: "Количественный",
      unit: "шт.",
      plan: 1000,
      fact: 950,
      completionPercent: 95,
      evaluationPercent: 28.5,
    },
    {
      id: "kpi-4-2",
      number: 2,
      name: "Время обработки неплатежа",
      weight: 25,
      type: "Количественный",
      unit: "час.",
      plan: 2,
      fact: 1.8,
      completionPercent: 111.1,
      evaluationPercent: 27.8,
    },
    {
      id: "kpi-4-3",
      number: 3,
      name: "Удовлетворенность клиентов",
      weight: 20,
      type: "Качественный",
      unit: "%",
      plan: 90,
      fact: 92,
      completionPercent: 102.2,
      evaluationPercent: 20.4,
    },
    {
      id: "kpi-4-4",
      number: 4,
      name: "Количество обработанных непереводов",
      weight: 15,
      type: "Количественный",
      unit: "шт.",
      plan: 800,
      fact: 780,
      completionPercent: 97.5,
      evaluationPercent: 14.6,
    },
    {
      id: "kpi-4-5",
      number: 5,
      name: "Точность обработки",
      weight: 10,
      type: "Качественный",
      unit: "%",
      plan: 98,
      fact: 98.5,
      completionPercent: 100.5,
      evaluationPercent: 10.1,
    },
  ],
};

// Моковые данные для квартальных КПЭ
const mockQuarterlyKPIsData: Record<string, Record<string, KPI[]>> = {
  "stream-1": {
    "q1-2025": [
      {
        id: "q1-kpi-1-1",
        number: 1,
        name: "Количество выпущенных релизов",
        weight: 25,
        type: "Количественный",
        unit: "шт.",
        plan: 3,
        fact: 2,
        completionPercent: 66.7,
        evaluationPercent: 16.7,
      },
      {
        id: "q1-kpi-1-2",
        number: 2,
        name: "Время разработки фичи",
        weight: 20,
        type: "Количественный",
        unit: "дн.",
        plan: 5,
        fact: 4.8,
        completionPercent: 104.2,
        evaluationPercent: 20.8,
      },
      {
        id: "q1-kpi-1-3",
        number: 3,
        name: "Качество кода",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 85,
        fact: 87,
        completionPercent: 102.4,
        evaluationPercent: 20.5,
      },
      {
        id: "q1-kpi-1-4",
        number: 4,
        name: "Количество закрытых задач",
        weight: 20,
        type: "Количественный",
        unit: "шт.",
        plan: 125,
        fact: 120,
        completionPercent: 96,
        evaluationPercent: 19.2,
      },
      {
        id: "q1-kpi-1-5",
        number: 5,
        name: "Удовлетворенность команды",
        weight: 15,
        type: "Качественный",
        unit: "%",
        plan: 80,
        fact: 81,
        completionPercent: 101.3,
        evaluationPercent: 15.2,
      },
    ],
    "q2-2025": [
      {
        id: "q2-kpi-1-1",
        number: 1,
        name: "Количество выпущенных релизов",
        weight: 25,
        type: "Количественный",
        unit: "шт.",
        plan: 3,
        fact: 3,
        completionPercent: 100,
        evaluationPercent: 25,
      },
      {
        id: "q2-kpi-1-2",
        number: 2,
        name: "Время разработки фичи",
        weight: 20,
        type: "Количественный",
        unit: "дн.",
        plan: 5,
        fact: 4.5,
        completionPercent: 111.1,
        evaluationPercent: 22.2,
      },
      {
        id: "q2-kpi-1-3",
        number: 3,
        name: "Качество кода",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 85,
        fact: 88,
        completionPercent: 103.5,
        evaluationPercent: 20.7,
      },
      {
        id: "q2-kpi-1-4",
        number: 4,
        name: "Количество закрытых задач",
        weight: 20,
        type: "Количественный",
        unit: "шт.",
        plan: 125,
        fact: 130,
        completionPercent: 104,
        evaluationPercent: 20.8,
      },
      {
        id: "q2-kpi-1-5",
        number: 5,
        name: "Удовлетворенность команды",
        weight: 15,
        type: "Качественный",
        unit: "%",
        plan: 80,
        fact: 82,
        completionPercent: 102.5,
        evaluationPercent: 15.4,
      },
    ],
    "q3-2025": [
      {
        id: "q3-kpi-1-1",
        number: 1,
        name: "Количество выпущенных релизов",
        weight: 25,
        type: "Количественный",
        unit: "шт.",
        plan: 3,
        fact: 3,
        completionPercent: 100,
        evaluationPercent: 25,
      },
      {
        id: "q3-kpi-1-2",
        number: 2,
        name: "Время разработки фичи",
        weight: 20,
        type: "Количественный",
        unit: "дн.",
        plan: 5,
        fact: 4.2,
        completionPercent: 119,
        evaluationPercent: 23.8,
      },
      {
        id: "q3-kpi-1-3",
        number: 3,
        name: "Качество кода",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 85,
        fact: 89,
        completionPercent: 104.7,
        evaluationPercent: 20.9,
      },
      {
        id: "q3-kpi-1-4",
        number: 4,
        name: "Количество закрытых задач",
        weight: 20,
        type: "Количественный",
        unit: "шт.",
        plan: 125,
        fact: 125,
        completionPercent: 100,
        evaluationPercent: 20,
      },
      {
        id: "q3-kpi-1-5",
        number: 5,
        name: "Удовлетворенность команды",
        weight: 15,
        type: "Качественный",
        unit: "%",
        plan: 80,
        fact: 83,
        completionPercent: 103.8,
        evaluationPercent: 15.6,
      },
    ],
    "q4-2025": [
      {
        id: "q4-kpi-1-1",
        number: 1,
        name: "Количество выпущенных релизов",
        weight: 25,
        type: "Количественный",
        unit: "шт.",
        plan: 3,
        fact: 2,
        completionPercent: 66.7,
        evaluationPercent: 16.7,
      },
      {
        id: "q4-kpi-1-2",
        number: 2,
        name: "Время разработки фичи",
        weight: 20,
        type: "Количественный",
        unit: "дн.",
        plan: 5,
        fact: 4.5,
        completionPercent: 111.1,
        evaluationPercent: 22.2,
      },
      {
        id: "q4-kpi-1-3",
        number: 3,
        name: "Качество кода",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 85,
        fact: 88,
        completionPercent: 103.5,
        evaluationPercent: 20.7,
      },
      {
        id: "q4-kpi-1-4",
        number: 4,
        name: "Количество закрытых задач",
        weight: 20,
        type: "Количественный",
        unit: "шт.",
        plan: 125,
        fact: 115,
        completionPercent: 92,
        evaluationPercent: 18.4,
      },
      {
        id: "q4-kpi-1-5",
        number: 5,
        name: "Удовлетворенность команды",
        weight: 15,
        type: "Качественный",
        unit: "%",
        plan: 80,
        fact: 82,
        completionPercent: 102.5,
        evaluationPercent: 15.4,
      },
    ],
  },
  "stream-4": {
    "q1-2025": [
      {
        id: "q1-kpi-4-1",
        number: 1,
        name: "Количество обработанных неплатежей",
        weight: 30,
        type: "Количественный",
        unit: "шт.",
        plan: 250,
        fact: 240,
        completionPercent: 96,
        evaluationPercent: 28.8,
      },
      {
        id: "q1-kpi-4-2",
        number: 2,
        name: "Время обработки неплатежа",
        weight: 25,
        type: "Количественный",
        unit: "час.",
        plan: 2,
        fact: 1.9,
        completionPercent: 105.3,
        evaluationPercent: 26.3,
      },
      {
        id: "q1-kpi-4-3",
        number: 3,
        name: "Удовлетворенность клиентов",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 90,
        fact: 91,
        completionPercent: 101.1,
        evaluationPercent: 20.2,
      },
      {
        id: "q1-kpi-4-4",
        number: 4,
        name: "Количество обработанных непереводов",
        weight: 15,
        type: "Количественный",
        unit: "шт.",
        plan: 200,
        fact: 195,
        completionPercent: 97.5,
        evaluationPercent: 14.6,
      },
      {
        id: "q1-kpi-4-5",
        number: 5,
        name: "Точность обработки",
        weight: 10,
        type: "Качественный",
        unit: "%",
        plan: 98,
        fact: 98.2,
        completionPercent: 100.2,
        evaluationPercent: 10,
      },
    ],
    "q2-2025": [
      {
        id: "q2-kpi-4-1",
        number: 1,
        name: "Количество обработанных неплатежей",
        weight: 30,
        type: "Количественный",
        unit: "шт.",
        plan: 250,
        fact: 250,
        completionPercent: 100,
        evaluationPercent: 30,
      },
      {
        id: "q2-kpi-4-2",
        number: 2,
        name: "Время обработки неплатежа",
        weight: 25,
        type: "Количественный",
        unit: "час.",
        plan: 2,
        fact: 1.8,
        completionPercent: 111.1,
        evaluationPercent: 27.8,
      },
      {
        id: "q2-kpi-4-3",
        number: 3,
        name: "Удовлетворенность клиентов",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 90,
        fact: 92,
        completionPercent: 102.2,
        evaluationPercent: 20.4,
      },
      {
        id: "q2-kpi-4-4",
        number: 4,
        name: "Количество обработанных непереводов",
        weight: 15,
        type: "Количественный",
        unit: "шт.",
        plan: 200,
        fact: 200,
        completionPercent: 100,
        evaluationPercent: 15,
      },
      {
        id: "q2-kpi-4-5",
        number: 5,
        name: "Точность обработки",
        weight: 10,
        type: "Качественный",
        unit: "%",
        plan: 98,
        fact: 98.5,
        completionPercent: 100.5,
        evaluationPercent: 10.1,
      },
    ],
    "q3-2025": [
      {
        id: "q3-kpi-4-1",
        number: 1,
        name: "Количество обработанных неплатежей",
        weight: 30,
        type: "Количественный",
        unit: "шт.",
        plan: 250,
        fact: 230,
        completionPercent: 92,
        evaluationPercent: 27.6,
      },
      {
        id: "q3-kpi-4-2",
        number: 2,
        name: "Время обработки неплатежа",
        weight: 25,
        type: "Количественный",
        unit: "час.",
        plan: 2,
        fact: 1.7,
        completionPercent: 117.6,
        evaluationPercent: 29.4,
      },
      {
        id: "q3-kpi-4-3",
        number: 3,
        name: "Удовлетворенность клиентов",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 90,
        fact: 93,
        completionPercent: 103.3,
        evaluationPercent: 20.7,
      },
      {
        id: "q3-kpi-4-4",
        number: 4,
        name: "Количество обработанных непереводов",
        weight: 15,
        type: "Количественный",
        unit: "шт.",
        plan: 200,
        fact: 195,
        completionPercent: 97.5,
        evaluationPercent: 14.6,
      },
      {
        id: "q3-kpi-4-5",
        number: 5,
        name: "Точность обработки",
        weight: 10,
        type: "Качественный",
        unit: "%",
        plan: 98,
        fact: 98.8,
        completionPercent: 100.8,
        evaluationPercent: 10.1,
      },
    ],
    "q4-2025": [
      {
        id: "q4-kpi-4-1",
        number: 1,
        name: "Количество обработанных неплатежей",
        weight: 30,
        type: "Количественный",
        unit: "шт.",
        plan: 250,
        fact: 230,
        completionPercent: 92,
        evaluationPercent: 27.6,
      },
      {
        id: "q4-kpi-4-2",
        number: 2,
        name: "Время обработки неплатежа",
        weight: 25,
        type: "Количественный",
        unit: "час.",
        plan: 2,
        fact: 1.8,
        completionPercent: 111.1,
        evaluationPercent: 27.8,
      },
      {
        id: "q4-kpi-4-3",
        number: 3,
        name: "Удовлетворенность клиентов",
        weight: 20,
        type: "Качественный",
        unit: "%",
        plan: 90,
        fact: 92,
        completionPercent: 102.2,
        evaluationPercent: 20.4,
      },
      {
        id: "q4-kpi-4-4",
        number: 4,
        name: "Количество обработанных непереводов",
        weight: 15,
        type: "Количественный",
        unit: "шт.",
        plan: 200,
        fact: 190,
        completionPercent: 95,
        evaluationPercent: 14.3,
      },
      {
        id: "q4-kpi-4-5",
        number: 5,
        name: "Точность обработки",
        weight: 10,
        type: "Качественный",
        unit: "%",
        plan: 98,
        fact: 98.5,
        completionPercent: 100.5,
        evaluationPercent: 10.1,
      },
    ],
  },
};

// Моковые данные стримов и команд
const mockStreams: Stream[] = [
  {
    id: "stream-1",
    name: "Стрим разработки",
    description: "Разработка и поддержка продуктов",
    leader: "Орлов Максим Сергеевич",
    itLeader: "Романова Юлия Дмитриевна",
    teams: [
      {
        id: "team-1",
        name: "Команда Frontend",
        description: "Разработка пользовательских интерфейсов",
        streamId: "stream-1",
        streamName: "Стрим разработки",
        leader: "Иванов Иван Иванович",
        membersCount: 8,
      },
      {
        id: "team-2",
        name: "Команда Backend",
        description: "Разработка серверной части",
        streamId: "stream-1",
        streamName: "Стрим разработки",
        leader: "Петров Петр Петрович",
        membersCount: 10,
      },
    ],
  },
  {
    id: "stream-2",
    name: "Стрим качества",
    description: "Обеспечение качества продуктов",
    leader: "Зайцева Оксана Дмитриевна",
    itLeader: "Комаров Станислав Викторович",
    teams: [
      {
        id: "team-3",
        name: "Команда QA",
        description: "Тестирование и контроль качества",
        streamId: "stream-2",
        streamName: "Стрим качества",
        leader: "Сидорова Сидора Сидоровна",
        membersCount: 6,
      },
    ],
  },
  {
    id: "stream-3",
    name: "Стрим инфраструктуры",
    description: "Поддержка инфраструктуры и DevOps",
    leader: "Григорьев Андрей Валерьевич",
    itLeader: "Ларина Марина Игоревна",
    teams: [
      {
        id: "team-4",
        name: "Команда DevOps",
        description: "Развертывание и поддержка инфраструктуры",
        streamId: "stream-3",
        streamName: "Стрим инфраструктуры",
        leader: "Козлов Козел Козлович",
        membersCount: 5,
      },
    ],
  },
  {
    id: "stream-4",
    name: "Неплатежи и непереводы",
    description: "Обработка неплатежей и непереводов",
    leader: "Помыткин Сергей Олегович",
    itLeader: "Козлова Анна Петровна",
    teams: [
      {
        id: "team-5",
        name: "Команда обработки неплатежей",
        description: "Обработка и контроль неплатежей",
        streamId: "stream-4",
        streamName: "Неплатежи и непереводы",
        leader: "Смирнов Сергей Сергеевич",
        membersCount: 12,
      },
      {
        id: "team-6",
        name: "Команда обработки непереводов",
        description: "Обработка и контроль непереводов",
        streamId: "stream-4",
        streamName: "Неплатежи и непереводы",
        leader: "Волкова Мария Александровна",
        membersCount: 10,
      },
      {
        id: "team-7",
        name: "Команда аналитики",
        description: "Аналитика и отчетность по неплатежам и непереводам",
        streamId: "stream-4",
        streamName: "Неплатежи и непереводы",
        leader: "Новиков Дмитрий Игоревич",
        membersCount: 8,
      },
      {
        id: "team-8",
        name: "Команда поддержки клиентов",
        description: "Поддержка клиентов по вопросам неплатежей и непереводов",
        streamId: "stream-4",
        streamName: "Неплатежи и непереводы",
        leader: "Петрова Анна Викторовна",
        membersCount: 15,
      },
    ],
  },
];

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

export default function GoalsKoldPage() {
  // Состояние для управления стримами и командами
  const [streams, setStreams] = useState<Stream[]>(mockStreams);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Состояние для управления КПЭ
  const [annualKPIs, setAnnualKPIs] = useState<Record<string, KPI[]>>(mockStreamKPIs);
  const [quarterlyKPIs, setQuarterlyKPIs] = useState<Record<string, Record<string, KPI[]>>>(mockQuarterlyKPIsData);
  
  // Состояние для диалогов редактирования КПЭ
  const [isKPIDialogOpen, setIsKPIDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [kpiDialogType, setKpiDialogType] = useState<"annual" | "quarterly">("annual");
  const [kpiQuarter, setKpiQuarter] = useState<string>("q1-2025");
  const [kpiFormData, setKpiFormData] = useState({
    name: "",
    weight: 0,
    type: "Количественный",
    unit: "",
    plan: 0,
    fact: 0,
  });

  // Переключение раскрытия стрима
  const toggleStream = (streamId: string, e?: MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newExpanded = new Set(expandedStreams);
    if (newExpanded.has(streamId)) {
      newExpanded.delete(streamId);
    } else {
      newExpanded.add(streamId);
    }
    setExpandedStreams(newExpanded);
  };

  // Выбор стрима
  const handleSelectStream = (stream: Stream) => {
    setSelectedStream(stream);
    setSelectedTeam(null); // Сбрасываем выбор команды при выборе стрима
  };

  // Выбор команды
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setSelectedStream(null); // Сбрасываем выбор стрима при выборе команды
  };

  // Расчет completionPercent и evaluationPercent
  const calculateKPIMetrics = (plan: number, fact: number, weight: number) => {
    const completionPercent = plan !== 0 ? (fact / plan) * 100 : 0;
    const evaluationPercent = Math.min(completionPercent * (weight / 100), weight * 1.2); // Максимум 120% от веса
    return { completionPercent, evaluationPercent };
  };

  // Открытие диалога добавления КПЭ
  const handleAddKPI = (type: "annual" | "quarterly", quarter?: string) => {
    setEditingKPI(null);
    setKpiDialogType(type);
    if (quarter) setKpiQuarter(quarter);
    setKpiFormData({
      name: "",
      weight: 0,
      type: "Количественный",
      unit: "",
      plan: 0,
      fact: 0,
    });
    setIsKPIDialogOpen(true);
  };

  // Открытие диалога редактирования КПЭ
  const handleEditKPI = (kpi: KPI, type: "annual" | "quarterly", quarter?: string) => {
    setEditingKPI(kpi);
    setKpiDialogType(type);
    if (quarter) setKpiQuarter(quarter);
    setKpiFormData({
      name: kpi.name,
      weight: kpi.weight,
      type: kpi.type,
      unit: kpi.unit,
      plan: kpi.plan,
      fact: kpi.fact,
    });
    setIsKPIDialogOpen(true);
  };

  // Сохранение КПЭ
  const handleSaveKPI = () => {
    if (!selectedStream || !kpiFormData.name.trim() || kpiFormData.weight <= 0) return;

    const { completionPercent, evaluationPercent } = calculateKPIMetrics(
      kpiFormData.plan,
      kpiFormData.fact,
      kpiFormData.weight
    );

    const newKPI: KPI = {
      id: editingKPI?.id || `kpi-${Date.now()}`,
      number: editingKPI?.number || (kpiDialogType === "annual" 
        ? (annualKPIs[selectedStream.id]?.length || 0) + 1
        : (quarterlyKPIs[selectedStream.id]?.[kpiQuarter]?.length || 0) + 1),
      name: kpiFormData.name.trim(),
      weight: kpiFormData.weight,
      type: kpiFormData.type,
      unit: kpiFormData.unit.trim(),
      plan: kpiFormData.plan,
      fact: kpiFormData.fact,
      completionPercent,
      evaluationPercent,
    };

    if (kpiDialogType === "annual") {
      if (editingKPI) {
        setAnnualKPIs({
          ...annualKPIs,
          [selectedStream.id]: annualKPIs[selectedStream.id].map(kpi => 
            kpi.id === editingKPI.id ? newKPI : kpi
          ),
        });
      } else {
        setAnnualKPIs({
          ...annualKPIs,
          [selectedStream.id]: [...(annualKPIs[selectedStream.id] || []), newKPI],
        });
      }
    } else {
      if (editingKPI) {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...quarterlyKPIs[selectedStream.id],
            [kpiQuarter]: quarterlyKPIs[selectedStream.id][kpiQuarter].map(kpi =>
              kpi.id === editingKPI.id ? newKPI : kpi
            ),
          },
        });
      } else {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...(quarterlyKPIs[selectedStream.id] || {}),
            [kpiQuarter]: [...(quarterlyKPIs[selectedStream.id]?.[kpiQuarter] || []), newKPI],
          },
        });
      }
    }

    setIsKPIDialogOpen(false);
    setEditingKPI(null);
  };

  // Удаление КПЭ
  const handleDeleteKPI = (kpiId: string, type: "annual" | "quarterly", quarter?: string) => {
    if (!selectedStream) return;

    if (type === "annual") {
      setAnnualKPIs({
        ...annualKPIs,
        [selectedStream.id]: annualKPIs[selectedStream.id].filter(kpi => kpi.id !== kpiId),
      });
    } else {
      if (quarter) {
        setQuarterlyKPIs({
          ...quarterlyKPIs,
          [selectedStream.id]: {
            ...quarterlyKPIs[selectedStream.id],
            [quarter]: quarterlyKPIs[selectedStream.id][quarter].filter(kpi => kpi.id !== kpiId),
          },
        });
      }
    }
  };

  // Фильтрация стримов и команд
  const filteredStreams = streams.filter(stream => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const streamMatches = 
      stream.name.toLowerCase().includes(query) ||
      stream.description?.toLowerCase().includes(query);
    
    const filteredTeams = stream.teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.leader?.toLowerCase().includes(query)
    );
    
    return streamMatches || filteredTeams.length > 0;
  }).map(stream => {
    if (!searchQuery.trim()) return stream;
    
    const query = searchQuery.toLowerCase();
    const streamMatches = 
      stream.name.toLowerCase().includes(query) ||
      stream.description?.toLowerCase().includes(query);
    
    const filteredTeams = stream.teams.filter(team =>
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.leader?.toLowerCase().includes(query)
    );
    
    if (streamMatches) {
      return stream;
    }
    
    if (filteredTeams.length > 0) {
      return { ...stream, teams: filteredTeams };
    }
    
    return null;
  }).filter(Boolean) as Stream[];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Целеполагание КОЛД</h1>
          <p className="text-muted-foreground">
            Управление целеполаганием стримовой деятельности
          </p>
        </div>
      </div>

      <Tabs defaultValue="streams-teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streams-teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>КР стримов и команд</span>
          </TabsTrigger>
          <TabsTrigger value="kpi-registry" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Реестр КПЭ</span>
          </TabsTrigger>
          <TabsTrigger value="pfk-table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <span>Таблица ПФК</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="streams-teams" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">КР стримов и команд</h2>
              <p className="text-muted-foreground">
                Управление ключевыми результатами стримов и команд
              </p>
            </div>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по стримам и командам..."
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

          {/* Двухколоночная структура */}
          {filteredStreams.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? "Стримы и команды не найдены" : "Нет стримов и команд"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Попробуйте изменить поисковый запрос"
                      : "Стримы и команды будут отображаться здесь"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 min-h-[calc(100vh-280px)] w-full overflow-x-hidden">
              {/* Левая колонка - иерархия стримов и команд */}
              <div className="w-[400px] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
                <div className="p-2 border-b bg-muted/30">
                  <h3 className="font-semibold text-sm">Стримы и команды</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-1 p-2">
                    {filteredStreams.map((stream) => (
                      <div key={stream.id} className="space-y-1">
                        {/* Стрим */}
                        <div
                          className={cn(
                            "p-2 rounded-md cursor-pointer transition-colors",
                            selectedStream?.id === stream.id
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => handleSelectStream(stream)}
                        >
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStream(stream.id, e);
                              }}
                            >
                              {expandedStreams.has(stream.id) ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm break-words">{stream.name}</div>
                              {stream.description && (
                                <div className="text-xs text-muted-foreground break-words mt-0.5">
                                  {stream.description.length > 40
                                    ? stream.description.substring(0, 40) + "..."
                                    : stream.description}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {stream.teams.length}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Команды стрима */}
                        {expandedStreams.has(stream.id) && (
                          <div className="ml-6 space-y-1">
                            {stream.teams.map((team) => (
                              <div
                                key={team.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectTeam(team);
                                }}
                                className={cn(
                                  "p-2 rounded-md cursor-pointer transition-colors text-sm",
                                  selectedTeam?.id === team.id
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <UserCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium break-words">{team.name}</div>
                                    {team.description && (
                                      <div className="text-xs text-muted-foreground break-words mt-0.5">
                                        {team.description.length > 35
                                          ? team.description.substring(0, 35) + "..."
                                          : team.description}
                                      </div>
                                    )}
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

              {/* Правая колонка - детальная информация о стриме или команде */}
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-280px)]">
                {selectedTeam ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1 break-words">{selectedTeam.name}</CardTitle>
                          <CardDescription className="text-base break-words">
                            {selectedTeam.description || "Описание отсутствует"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 overflow-x-hidden">
                      <div className="space-y-4 max-w-full">
                        {/* Стрим */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Стрим</Label>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedTeam.streamName}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Руководитель */}
                        {selectedTeam.leader && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Руководитель команды</Label>
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{selectedTeam.leader}</span>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        {/* Количество участников */}
                        {selectedTeam.membersCount !== undefined && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Количество участников</Label>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{selectedTeam.membersCount} человек</span>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        {/* Дополнительная информация */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Дополнительная информация</Label>
                          <p className="text-sm text-muted-foreground">
                            Здесь будет отображаться информация о ключевых результатах команды.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : selectedStream ? (
                  <Card className="w-full max-w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1 break-words">{selectedStream.name}</CardTitle>
                          <CardDescription className="text-base break-words">
                            {selectedStream.description || "Описание отсутствует"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 overflow-x-hidden">
                      <div className="space-y-4 max-w-full">
                        {/* Информация о стриме */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Информация о стриме
                          </Label>
                          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Название</Label>
                              <p className="text-sm font-medium">{selectedStream.name}</p>
                            </div>
                            {selectedStream.description && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Описание</Label>
                                <p className="text-sm">{selectedStream.description}</p>
                              </div>
                            )}
                            {selectedStream.leader && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Лидер стрима</Label>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                      {getInitials(selectedStream.leader)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">{selectedStream.leader}</p>
                                </div>
                              </div>
                            )}
                            {selectedStream.itLeader && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">ИТ лидер стрима</Label>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                      {getInitials(selectedStream.itLeader)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">{selectedStream.itLeader}</p>
                                </div>
                              </div>
                            )}
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Количество команд</Label>
                              <p className="text-sm">{selectedStream.teams.length} {selectedStream.teams.length === 1 ? 'команда' : selectedStream.teams.length < 5 ? 'команды' : 'команд'}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Команды стрима */}
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Команды стрима
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedStream.teams.map((team) => (
                              <Badge
                                key={team.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5"
                                onClick={() => handleSelectTeam(team)}
                              >
                                {team.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Годовые цели стрима */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Годовые цели стрима
                            </Label>
                            <Button
                              size="sm"
                              onClick={() => handleAddKPI("annual")}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Добавить КПЭ
                            </Button>
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[50px]">№</TableHead>
                                  <TableHead>Наименование КПЭ</TableHead>
                                  <TableHead className="w-[80px]">Вес</TableHead>
                                  <TableHead className="w-[120px]">Вид</TableHead>
                                  <TableHead className="w-[120px]">Единица измерения</TableHead>
                                  <TableHead className="w-[80px]">План</TableHead>
                                  <TableHead className="w-[80px]">Факт</TableHead>
                                  <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                                  <TableHead className="w-[100px]">Оценка, %</TableHead>
                                  <TableHead className="w-[100px]">Действия</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {annualKPIs[selectedStream.id] && annualKPIs[selectedStream.id].length > 0 ? (
                                  annualKPIs[selectedStream.id].map((kpi: KPI) => (
                                    <TableRow key={kpi.id}>
                                      <TableCell className="text-center">{kpi.number}</TableCell>
                                      <TableCell>{kpi.name}</TableCell>
                                      <TableCell className="text-center">{kpi.weight}</TableCell>
                                      <TableCell>{kpi.type}</TableCell>
                                      <TableCell>{kpi.unit}</TableCell>
                                      <TableCell className="text-center">{kpi.plan}</TableCell>
                                      <TableCell className="text-center">{kpi.fact}</TableCell>
                                      <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                                      <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEditKPI(kpi, "annual")}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteKPI(kpi.id, "annual")}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                      Нет данных о годовых целях
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          {annualKPIs[selectedStream.id] && annualKPIs[selectedStream.id].length > 0 && (
                            <div className="flex justify-end pt-3">
                              <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
                                <span className="text-lg font-bold text-primary">
                                  {annualKPIs[selectedStream.id]
                                    .reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0)
                                    .toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Квартальные цели стрима */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Квартальные цели стрима
                          </Label>
                          <Tabs defaultValue="q1-2025" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="q1-2025">1 квартал 2025</TabsTrigger>
                              <TabsTrigger value="q2-2025">2 квартал 2025</TabsTrigger>
                              <TabsTrigger value="q3-2025">3 квартал 2025</TabsTrigger>
                              <TabsTrigger value="q4-2025">4 квартал 2025</TabsTrigger>
                            </TabsList>
                            <TabsContent value="q1-2025" className="mt-4">
                              <div className="flex justify-end mb-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddKPI("quarterly", "q1-2025")}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить КПЭ
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]">№</TableHead>
                                      <TableHead>Наименование КПЭ</TableHead>
                                      <TableHead className="w-[80px]">Вес</TableHead>
                                      <TableHead className="w-[120px]">Вид</TableHead>
                                      <TableHead className="w-[120px]">Единица измерения</TableHead>
                                      <TableHead className="w-[80px]">План</TableHead>
                                      <TableHead className="w-[80px]">Факт</TableHead>
                                      <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                                      <TableHead className="w-[100px]">Оценка, %</TableHead>
                                      <TableHead className="w-[100px]">Действия</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {quarterlyKPIs[selectedStream.id]?.["q1-2025"] && quarterlyKPIs[selectedStream.id]["q1-2025"].length > 0 ? (
                                      quarterlyKPIs[selectedStream.id]["q1-2025"].map((kpi: KPI) => (
                                        <TableRow key={kpi.id}>
                                          <TableCell className="text-center">{kpi.number}</TableCell>
                                          <TableCell>{kpi.name}</TableCell>
                                          <TableCell className="text-center">{kpi.weight}</TableCell>
                                          <TableCell>{kpi.type}</TableCell>
                                          <TableCell>{kpi.unit}</TableCell>
                                          <TableCell className="text-center">{kpi.plan}</TableCell>
                                          <TableCell className="text-center">{kpi.fact}</TableCell>
                                          <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                                          <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditKPI(kpi, "quarterly", "q1-2025")}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteKPI(kpi.id, "quarterly", "q1-2025")}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                          Нет данных за 1 квартал 2025
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              {quarterlyKPIs[selectedStream.id]?.["q1-2025"] && quarterlyKPIs[selectedStream.id]["q1-2025"].length > 0 && (
                                <div className="flex justify-end pt-3">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
                                    <span className="text-lg font-bold text-primary">
                                      {quarterlyKPIs[selectedStream.id]["q1-2025"]
                                        .reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0)
                                        .toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="q2-2025" className="mt-4">
                              <div className="flex justify-end mb-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddKPI("quarterly", "q2-2025")}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить КПЭ
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]">№</TableHead>
                                      <TableHead>Наименование КПЭ</TableHead>
                                      <TableHead className="w-[80px]">Вес</TableHead>
                                      <TableHead className="w-[120px]">Вид</TableHead>
                                      <TableHead className="w-[120px]">Единица измерения</TableHead>
                                      <TableHead className="w-[80px]">План</TableHead>
                                      <TableHead className="w-[80px]">Факт</TableHead>
                                      <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                                      <TableHead className="w-[100px]">Оценка, %</TableHead>
                                      <TableHead className="w-[100px]">Действия</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {quarterlyKPIs[selectedStream.id]?.["q2-2025"] && quarterlyKPIs[selectedStream.id]["q2-2025"].length > 0 ? (
                                      quarterlyKPIs[selectedStream.id]["q2-2025"].map((kpi: KPI) => (
                                        <TableRow key={kpi.id}>
                                          <TableCell className="text-center">{kpi.number}</TableCell>
                                          <TableCell>{kpi.name}</TableCell>
                                          <TableCell className="text-center">{kpi.weight}</TableCell>
                                          <TableCell>{kpi.type}</TableCell>
                                          <TableCell>{kpi.unit}</TableCell>
                                          <TableCell className="text-center">{kpi.plan}</TableCell>
                                          <TableCell className="text-center">{kpi.fact}</TableCell>
                                          <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                                          <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditKPI(kpi, "quarterly", "q2-2025")}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteKPI(kpi.id, "quarterly", "q2-2025")}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                          Нет данных за 2 квартал 2025
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              {quarterlyKPIs[selectedStream.id]?.["q2-2025"] && quarterlyKPIs[selectedStream.id]["q2-2025"].length > 0 && (
                                <div className="flex justify-end pt-3">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
                                    <span className="text-lg font-bold text-primary">
                                      {quarterlyKPIs[selectedStream.id]["q2-2025"]
                                        .reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0)
                                        .toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="q3-2025" className="mt-4">
                              <div className="flex justify-end mb-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddKPI("quarterly", "q3-2025")}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить КПЭ
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]">№</TableHead>
                                      <TableHead>Наименование КПЭ</TableHead>
                                      <TableHead className="w-[80px]">Вес</TableHead>
                                      <TableHead className="w-[120px]">Вид</TableHead>
                                      <TableHead className="w-[120px]">Единица измерения</TableHead>
                                      <TableHead className="w-[80px]">План</TableHead>
                                      <TableHead className="w-[80px]">Факт</TableHead>
                                      <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                                      <TableHead className="w-[100px]">Оценка, %</TableHead>
                                      <TableHead className="w-[100px]">Действия</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {quarterlyKPIs[selectedStream.id]?.["q3-2025"] && quarterlyKPIs[selectedStream.id]["q3-2025"].length > 0 ? (
                                      quarterlyKPIs[selectedStream.id]["q3-2025"].map((kpi: KPI) => (
                                        <TableRow key={kpi.id}>
                                          <TableCell className="text-center">{kpi.number}</TableCell>
                                          <TableCell>{kpi.name}</TableCell>
                                          <TableCell className="text-center">{kpi.weight}</TableCell>
                                          <TableCell>{kpi.type}</TableCell>
                                          <TableCell>{kpi.unit}</TableCell>
                                          <TableCell className="text-center">{kpi.plan}</TableCell>
                                          <TableCell className="text-center">{kpi.fact}</TableCell>
                                          <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                                          <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditKPI(kpi, "quarterly", "q3-2025")}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteKPI(kpi.id, "quarterly", "q3-2025")}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                          Нет данных за 3 квартал 2025
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              {quarterlyKPIs[selectedStream.id]?.["q3-2025"] && quarterlyKPIs[selectedStream.id]["q3-2025"].length > 0 && (
                                <div className="flex justify-end pt-3">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
                                    <span className="text-lg font-bold text-primary">
                                      {quarterlyKPIs[selectedStream.id]["q3-2025"]
                                        .reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0)
                                        .toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="q4-2025" className="mt-4">
                              <div className="flex justify-end mb-3">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddKPI("quarterly", "q4-2025")}
                                  className="flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить КПЭ
                                </Button>
                              </div>
                              <div className="border rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[50px]">№</TableHead>
                                      <TableHead>Наименование КПЭ</TableHead>
                                      <TableHead className="w-[80px]">Вес</TableHead>
                                      <TableHead className="w-[120px]">Вид</TableHead>
                                      <TableHead className="w-[120px]">Единица измерения</TableHead>
                                      <TableHead className="w-[80px]">План</TableHead>
                                      <TableHead className="w-[80px]">Факт</TableHead>
                                      <TableHead className="w-[140px]">Значение выполнения, %</TableHead>
                                      <TableHead className="w-[100px]">Оценка, %</TableHead>
                                      <TableHead className="w-[100px]">Действия</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {quarterlyKPIs[selectedStream.id]?.["q4-2025"] && quarterlyKPIs[selectedStream.id]["q4-2025"].length > 0 ? (
                                      quarterlyKPIs[selectedStream.id]["q4-2025"].map((kpi: KPI) => (
                                        <TableRow key={kpi.id}>
                                          <TableCell className="text-center">{kpi.number}</TableCell>
                                          <TableCell>{kpi.name}</TableCell>
                                          <TableCell className="text-center">{kpi.weight}</TableCell>
                                          <TableCell>{kpi.type}</TableCell>
                                          <TableCell>{kpi.unit}</TableCell>
                                          <TableCell className="text-center">{kpi.plan}</TableCell>
                                          <TableCell className="text-center">{kpi.fact}</TableCell>
                                          <TableCell className="text-center">{kpi.completionPercent.toFixed(1)}</TableCell>
                                          <TableCell className="text-center">{kpi.evaluationPercent.toFixed(1)}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEditKPI(kpi, "quarterly", "q4-2025")}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteKPI(kpi.id, "quarterly", "q4-2025")}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                                          Нет данных за 4 квартал 2025
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              {quarterlyKPIs[selectedStream.id]?.["q4-2025"] && quarterlyKPIs[selectedStream.id]["q4-2025"].length > 0 && (
                                <div className="flex justify-end pt-3">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                    <Label className="text-sm font-semibold">Интегральный показатель выполнения КПЭ:</Label>
                                    <span className="text-lg font-bold text-primary">
                                      {quarterlyKPIs[selectedStream.id]["q4-2025"]
                                        .reduce((sum: number, kpi: KPI) => sum + kpi.evaluationPercent, 0)
                                        .toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Выберите стрим или команду</h3>
                      <p className="text-muted-foreground">
                        Выберите стрим или команду из списка слева, чтобы просмотреть подробную информацию
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="kpi-registry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Реестр КПЭ
              </CardTitle>
              <CardDescription>
                Реестр ключевых показателей эффективности
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Раздел находится в разработке. Здесь будет отображаться реестр ключевых показателей эффективности.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pfk-table" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Таблица ПФК
              </CardTitle>
              <CardDescription>
                Таблица показателей функциональных компетенций
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Раздел находится в разработке. Здесь будет отображаться таблица показателей функциональных компетенций.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования/добавления КПЭ */}
      <Dialog open={isKPIDialogOpen} onOpenChange={setIsKPIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingKPI ? "Редактировать КПЭ" : "Добавить КПЭ"}
            </DialogTitle>
            <DialogDescription>
              {kpiDialogType === "annual" 
                ? "Заполните информацию о годовом КПЭ"
                : `Заполните информацию о КПЭ за ${kpiQuarter === "q1-2025" ? "1" : kpiQuarter === "q2-2025" ? "2" : kpiQuarter === "q3-2025" ? "3" : "4"} квартал 2025`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kpi-name">
                Наименование КПЭ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kpi-name"
                value={kpiFormData.name}
                onChange={(e) => setKpiFormData({ ...kpiFormData, name: e.target.value })}
                placeholder="Введите наименование КПЭ"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-weight">
                  Вес <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpi-weight"
                  type="number"
                  min="0"
                  max="100"
                  value={kpiFormData.weight}
                  onChange={(e) => setKpiFormData({ ...kpiFormData, weight: Number(e.target.value) })}
                  placeholder="0-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-type">
                  Вид <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={kpiFormData.type}
                  onValueChange={(value) => setKpiFormData({ ...kpiFormData, type: value })}
                >
                  <SelectTrigger id="kpi-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Количественный">Количественный</SelectItem>
                    <SelectItem value="Качественный">Качественный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kpi-unit">
                Единица измерения <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kpi-unit"
                value={kpiFormData.unit}
                onChange={(e) => setKpiFormData({ ...kpiFormData, unit: e.target.value })}
                placeholder="шт., %, дн., час. и т.д."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kpi-plan">
                  План <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpi-plan"
                  type="number"
                  min="0"
                  value={kpiFormData.plan}
                  onChange={(e) => setKpiFormData({ ...kpiFormData, plan: Number(e.target.value) })}
                  placeholder="Плановое значение"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kpi-fact">
                  Факт <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpi-fact"
                  type="number"
                  min="0"
                  value={kpiFormData.fact}
                  onChange={(e) => setKpiFormData({ ...kpiFormData, fact: Number(e.target.value) })}
                  placeholder="Фактическое значение"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKPIDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveKPI}
              disabled={!kpiFormData.name.trim() || kpiFormData.weight <= 0 || !kpiFormData.unit.trim()}
            >
              {editingKPI ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

