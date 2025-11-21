"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Users, 
  Briefcase,
  Sparkles,
  Copy,
  X,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile, ProfileCompetence, SkillLevel, ProfileLevel } from "@/types";
import { getCompetenceById, getCompetences } from "@/lib/data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: {
    name: string;
    description: string;
    tfr?: string;
    requiredCompetences: ProfileCompetence[];
    experts?: Array<{ avatar?: string; fullName: string; position: string }>;
    levels?: ProfileLevel[];
  }) => void;
  editingProfile?: Profile | null;
  existingProfiles?: Profile[];
}

const STEPS = [
  { id: 1, title: "Основная информация", description: "Название и описание профиля" },
  { id: 2, title: "Компетенции", description: "Выберите обязательные компетенции" },
  { id: 3, title: "Уровни профиля", description: "Настройте уровни развития (опционально)" },
  { id: 4, title: "Эксперты", description: "Добавьте владельцев профиля (опционально)" },
  { id: 5, title: "Проверка", description: "Проверьте данные перед сохранением" },
];

const levelOptions: Array<{ value: "trainee" | "junior" | "middle" | "senior" | "lead"; label: string }> = [
  { value: "trainee", label: "Стажер (Trainee)" },
  { value: "junior", label: "Младший (Junior)" },
  { value: "middle", label: "Средний (Middle)" },
  { value: "senior", label: "Старший (Senior)" },
  { value: "lead", label: "Ведущий (Lead)" },
];

export function ProfileCreationWizard({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  existingProfiles = [],
}: ProfileCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tfr: "",
    requiredCompetences: [] as ProfileCompetence[],
    experts: [] as Array<{ avatar: string; fullName: string; position: string }>,
    levels: [] as Array<{
      level: "trainee" | "junior" | "middle" | "senior" | "lead";
      name: string;
      description: string;
      responsibilities: string[];
      education?: string;
      experience?: string;
      requiredSkills: Record<string, SkillLevel>;
    }>,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplateProfile, setSelectedTemplateProfile] = useState<string>("");
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{ 
    title: string; 
    description: string; 
    examples?: string[]; 
    tips?: string[];
    commonMistakes?: string[];
    additionalInfo?: string;
  } | null>(null);

  const competences = getCompetences();

  // Подсказки для полей
  const fieldHelpContent: Record<string, { 
    title: string; 
    description: string; 
    examples?: string[]; 
    tips?: string[];
    commonMistakes?: string[];
    additionalInfo?: string;
  }> = {
    name: {
      title: "Название профиля",
      description: "Краткое и понятное название профиля разработчика. Должно отражать основную специализацию и технологии. Это обязательное поле, которое будет отображаться в списке профилей и использоваться для поиска.",
      examples: [
        "Разработчик Perl",
        "Frontend Developer",
        "Backend Python Developer",
        "DevOps Engineer",
        "Full Stack Developer",
        "QA Automation Engineer",
        "Mobile iOS Developer",
        "Data Engineer"
      ],
      tips: [
        "Используйте конкретные технологии в названии (например, 'Perl', 'React', 'Python')",
        "Избегайте слишком общих названий типа 'Программист'",
        "Максимальная длина - 100 символов",
        "Название должно быть уникальным и легко узнаваемым"
      ],
      commonMistakes: [
        "Слишком длинное название (более 100 символов)",
        "Использование аббревиатур без расшифровки",
        "Дублирование названий существующих профилей"
      ],
      additionalInfo: "Название профиля является основным идентификатором и используется во всех разделах системы. Выберите название, которое точно отражает специализацию и будет понятно всем пользователям системы."
    },
    description: {
      title: "Описание профиля",
      description: "Подробное описание профиля, включающее основные задачи, область применения, ключевые технологии и навыки. Помогает понять назначение профиля и его место в организации. Это обязательное поле, которое должно содержать минимум 10 символов.",
      examples: [
        "Профиль разработчика на языке Perl. Основные задачи: разработка и поддержка серверных приложений, работа с базами данных, оптимизация производительности. Работа с legacy-кодом, рефакторинг, написание тестов. Требуется знание Perl 5, SQL, Linux, Git.",
        "Профиль frontend-разработчика. Создание пользовательских интерфейсов, работа с React, TypeScript, адаптивная верстка. Разработка компонентов, интеграция с API, оптимизация производительности приложений. Работа в команде с дизайнерами и backend-разработчиками.",
        "Профиль DevOps инженера. Настройка CI/CD пайплайнов, управление инфраструктурой, мониторинг и логирование. Работа с Docker, Kubernetes, облачными платформами. Обеспечение надежности и масштабируемости систем."
      ],
      tips: [
        "Опишите основные задачи и обязанности специалиста",
        "Укажите ключевые технологии и инструменты",
        "Упомяните область применения (веб, мобильные приложения, серверные системы и т.д.)",
        "Опишите взаимодействие с другими ролями в команде",
        "Максимальная длина - 500 символов, используйте их эффективно"
      ],
      commonMistakes: [
        "Слишком краткое описание (менее 10 символов)",
        "Копирование названия профиля в описание",
        "Использование технического жаргона без объяснений",
        "Отсутствие информации о технологиях и задачах"
      ],
      additionalInfo: "Хорошее описание помогает новым сотрудникам понять, подходит ли им этот профиль, а HR-специалистам - правильно формулировать вакансии. Используйте конкретные примеры задач и технологий."
    },
    tfr: {
      title: "ТФР (Типовая функциональная роль)",
      description: "Типовая функциональная роль определяет общую категорию должности в организации. ТФР используется для классификации позиций и может быть использована в HR-процессах, планировании бюджета и организационной структуре. Это опциональное поле, но его заполнение рекомендуется для лучшей систематизации.",
      examples: [
        "Разработчик",
        "Аналитик",
        "Тестировщик",
        "Архитектор",
        "Руководитель разработки",
        "DevOps инженер",
        "Data Engineer",
        "Product Manager"
      ],
      tips: [
        "Используйте стандартные названия ролей, принятые в вашей организации",
        "ТФР должна быть достаточно общей, чтобы охватывать разные специализации",
        "Если в организации нет стандарта, используйте общепринятые термины",
        "Максимальная длина - 100 символов"
      ],
      commonMistakes: [
        "Смешивание ТФР с конкретной специализацией (например, 'Frontend React Developer' вместо 'Разработчик')",
        "Использование слишком узких терминов",
        "Дублирование названия профиля"
      ],
      additionalInfo: "ТФР помогает группировать похожие роли и анализировать структуру команды. Например, все профили разработчиков (Frontend, Backend, Full Stack) могут иметь одну ТФР 'Разработчик'."
    },
    competences: {
      title: "Обязательные компетенции",
      description: "Выберите компетенции, которые обязательны для данного профиля. Компетенции делятся на профессиональные (специфичные для роли, например, знание конкретных технологий) и корпоративные (общие для всех сотрудников, например, коммуникация, работа в команде). Минимум 1 компетенция обязательна. Компетенции определяют, какие навыки должен иметь специалист для работы по данному профилю.",
      examples: [
        "Для разработчика Perl: Perl (профессиональная), SQL (профессиональная), Git (профессиональная), Linux (профессиональная), Работа в команде (корпоративная)",
        "Для frontend-разработчика: JavaScript (профессиональная), React (профессиональная), HTML/CSS (профессиональная), TypeScript (профессиональная), Коммуникация (корпоративная)",
        "Для DevOps инженера: Docker (профессиональная), Kubernetes (профессиональная), CI/CD (профессиональная), Мониторинг (профессиональная), Лидерство (корпоративная)"
      ],
      tips: [
        "Выбирайте компетенции, которые действительно необходимы для работы по профилю",
        "Включайте как профессиональные, так и корпоративные компетенции",
        "Не добавляйте слишком много компетенций - фокусируйтесь на ключевых",
        "Учитывайте разные уровни профиля - некоторые компетенции могут быть обязательны только для старших уровней"
      ],
      commonMistakes: [
        "Добавление всех доступных компетенций без разбора",
        "Игнорирование корпоративных компетенций",
        "Выбор компетенций, не связанных с профилем",
        "Добавление одной и той же компетенции дважды"
      ],
      additionalInfo: "Компетенции используются для оценки сотрудников, планирования обучения и карьерного развития. Выбранные компетенции должны отражать реальные требования к специалисту на данной позиции."
    },
    levelType: {
      title: "Тип уровня",
      description: "Выберите тип уровня профиля. Уровни идут от стажера (trainee) до ведущего (lead). Каждый уровень определяет карьерную ступень и требования к специалисту. В одном профиле может быть до 5 уровней, каждый тип уровня можно использовать только один раз.",
      examples: [
        "Trainee (Стажер) - начальный уровень, стажер, только начинает изучать технологии",
        "Junior (Младший) - младший специалист, может работать под руководством, решает типовые задачи",
        "Middle (Средний) - средний специалист, работает самостоятельно, решает сложные задачи",
        "Senior (Старший) - старший специалист, может принимать архитектурные решения, наставничество",
        "Lead (Ведущий) - ведущий специалист, может руководить командой, стратегическое планирование"
      ],
      tips: [
        "Начните с определения, какие уровни нужны для вашего профиля",
        "Не обязательно создавать все 5 уровней - создавайте только те, которые используются в организации",
        "Уровни должны отражать реальную карьерную лестницу в вашей компании",
        "Порядок уровней важен - они должны идти от младшего к старшему"
      ],
      commonMistakes: [
        "Создание всех 5 уровней, даже если они не используются",
        "Использование одного типа уровня дважды в одном профиле",
        "Неправильный порядок уровней (например, Senior перед Junior)",
        "Смешивание уровней из разных систем грейдинга"
      ],
      additionalInfo: "Уровни профиля определяют карьерную прогрессию специалиста. Каждый уровень должен иметь четкие различия в требованиях, обязанностях и компетенциях. Это помогает сотрудникам понимать, что нужно для перехода на следующий уровень."
    },
    levelName: {
      title: "Название уровня",
      description: "Уникальное название для данного уровня профиля. Обычно включает тип уровня и специализацию. Название должно быть понятным и отражать как уровень (Trainee, Junior и т.д.), так и специализацию профиля. Это обязательное поле.",
      examples: [
        "Trainee Perl Developer",
        "Junior Frontend Developer",
        "Middle Backend Developer",
        "Senior Full Stack Developer",
        "Lead DevOps Engineer",
        "Junior QA Automation Engineer",
        "Middle Data Engineer",
        "Senior Mobile iOS Developer"
      ],
      tips: [
        "Используйте формат: [Уровень] + [Специализация] + [Роль]",
        "Название должно быть уникальным в рамках профиля",
        "Избегайте слишком длинных названий (максимум 100 символов)",
        "Используйте английские термины для уровней (Trainee, Junior, Middle, Senior, Lead)",
        "Специализацию можно указать на русском или английском"
      ],
      commonMistakes: [
        "Использование только типа уровня без специализации",
        "Слишком длинные или сложные названия",
        "Дублирование названий разных уровней",
        "Использование нестандартных терминов для уровней"
      ],
      additionalInfo: "Название уровня используется в карьерных треках, вакансиях и при оценке сотрудников. Оно должно быть понятным как для HR, так и для технических специалистов."
    },
    levelDescription: {
      title: "Описание уровня",
      description: "Подробное описание уровня, его основных характеристик, ожидаемых навыков и компетенций на данном этапе карьеры. Описание должно четко отличать данный уровень от других уровней профиля. Это обязательное поле, которое должно содержать минимум информацию о том, что умеет специалист на этом уровне.",
      examples: [
        "Начинающий разработчик, изучающий основы языка Perl и фреймворков. Работает под руководством более опытных коллег. Выполняет простые задачи, изучает best practices, участвует в code review как наблюдатель. Знаком с базовым синтаксисом, может писать простые скрипты.",
        "Самостоятельный разработчик, способный решать типовые задачи средней сложности. Имеет базовые знания архитектуры и паттернов проектирования. Может работать с существующим кодом, добавлять новые функции, писать unit-тесты. Участвует в планировании задач и может оценивать сложность.",
        "Опытный разработчик, способный решать сложные задачи и принимать архитектурные решения. Может проектировать новые модули, оптимизировать производительность, проводить code review. Наставничает младших коллег, участвует в техническом планировании."
      ],
      tips: [
        "Опишите, какие задачи может решать специалист на этом уровне",
        "Укажите степень самостоятельности (работа под руководством / самостоятельно / руководит командой)",
        "Опишите ожидаемые навыки и компетенции",
        "Упомяните взаимодействие с командой и коллегами",
        "Максимальная длина - 500 символов, используйте их для детального описания"
      ],
      commonMistakes: [
        "Слишком общее описание, не отличающее уровень от других",
        "Копирование описания из другого уровня",
        "Отсутствие конкретики о навыках и задачах",
        "Слишком краткое описание (менее 50 символов)"
      ],
      additionalInfo: "Хорошее описание уровня помогает сотрудникам понять, соответствуют ли они требованиям уровня, и что нужно изучить для перехода на следующий уровень. Также это помогает HR правильно оценивать кандидатов и сотрудников."
    },
    responsibilities: {
      title: "Обязанности",
      description: "Список типовых должностных обязанностей для данного уровня. Каждая обязанность описывает конкретную задачу или область ответственности. Обязанности должны отражать реальные задачи, которые выполняет специалист на данном уровне. Можно добавить неограниченное количество обязанностей.",
      examples: [
        "Разработка новых функций согласно техническому заданию",
        "Участие в code review других разработчиков",
        "Написание unit-тестов для нового функционала",
        "Работа с системой контроля версий Git, создание веток, merge requests",
        "Участие в планировании спринтов и оценке задач",
        "Исправление багов и технического долга",
        "Написание технической документации",
        "Взаимодействие с дизайнерами и product-менеджерами",
        "Оптимизация производительности приложений",
        "Наставничество младших разработчиков"
      ],
      tips: [
        "Начинайте каждую обязанность с глагола действия (разрабатывать, участвовать, писать и т.д.)",
        "Будьте конкретными - избегайте общих фраз",
        "Описывайте обязанности, характерные именно для этого уровня",
        "Добавляйте обязанности по мере необходимости - можно начать с 3-5 основных",
        "Максимальная длина одной обязанности - 200 символов"
      ],
      commonMistakes: [
        "Слишком общие формулировки (например, 'Работать с кодом')",
        "Копирование обязанностей из другого уровня без изменений",
        "Слишком длинные обязанности (более 200 символов)",
        "Отсутствие конкретики о том, что именно делает специалист"
      ],
      additionalInfo: "Обязанности используются в должностных инструкциях, вакансиях и при оценке эффективности сотрудника. Они должны точно отражать, что ожидается от специалиста на данном уровне."
    },
    education: {
      title: "Требования к образованию",
      description: "Требования к образованию для данного уровня. Может включать уровень образования, специальность или конкретные требования. Это опциональное поле, но его заполнение рекомендуется для четкого понимания требований к кандидатам. Требования к образованию обычно становятся менее строгими с ростом опыта.",
      examples: [
        "Среднее специальное или неоконченное высшее техническое образование",
        "Высшее техническое образование",
        "Высшее техническое образование, предпочтительно в области информационных технологий",
        "Высшее техническое образование или эквивалентный опыт работы",
        "Образование не имеет значения при наличии соответствующего опыта",
        "Высшее образование в области компьютерных наук, математики или смежных областях"
      ],
      tips: [
        "Для младших уровней (Trainee, Junior) обычно указываются более строгие требования к образованию",
        "Для старших уровней (Senior, Lead) опыт работы часто важнее образования",
        "Можно указать альтернативы (например, 'высшее образование или эквивалентный опыт')",
        "Будьте гибкими - талантливые самоучки могут быть ценными сотрудниками",
        "Максимальная длина - 200 символов"
      ],
      commonMistakes: [
        "Слишком строгие требования для младших уровней",
        "Игнорирование альтернатив (только опыт или только образование)",
        "Использование устаревших формулировок",
        "Отсутствие гибкости в требованиях"
      ],
      additionalInfo: "Требования к образованию помогают HR правильно фильтровать кандидатов, но не должны быть единственным критерием. Опыт работы, портфолио и технические навыки часто важнее формального образования."
    },
    experience: {
      title: "Требования к стажу",
      description: "Требования к опыту работы для данного уровня. Указывается минимальный стаж или диапазон опыта. Это опциональное поле, но его заполнение помогает правильно оценивать кандидатов и планировать карьерное развитие сотрудников. Стаж обычно увеличивается с ростом уровня.",
      examples: [
        "Стаж работы не требуется",
        "Опыт работы от 6 месяцев",
        "Опыт работы от 1 года",
        "Опыт работы от 1 до 2 лет",
        "Опыт работы от 2 до 4 лет",
        "Опыт работы от 3 до 5 лет",
        "Опыт работы от 5 лет",
        "Опыт работы от 5 до 8 лет",
        "Опыт работы от 7 лет"
      ],
      tips: [
        "Для Trainee обычно указывается 'Стаж работы не требуется'",
        "Для Junior - обычно от 6 месяцев до 1 года",
        "Для Middle - обычно от 2 до 4 лет",
        "Для Senior - обычно от 4 до 7 лет",
        "Для Lead - обычно от 5-7 лет и более",
        "Можно указать диапазон (например, 'от 2 до 4 лет')",
        "Учитывайте специфику вашей отрасли и компании"
      ],
      commonMistakes: [
        "Слишком высокие требования для младших уровней",
        "Игнорирование диапазонов (только минимальный стаж)",
        "Несоответствие требований реальной практике в компании",
        "Слишком жесткие рамки без учета индивидуальных случаев"
      ],
      additionalInfo: "Требования к стажу - это ориентир, а не жесткое правило. Талантливый специалист может достичь высокого уровня быстрее, а опытный специалист может не соответствовать уровню, если не развивался профессионально. Стаж должен сочетаться с оценкой реальных навыков и компетенций."
    },
    expertFullName: {
      title: "ФИО эксперта",
      description: "Полное имя эксперта (владельца профиля) в формате 'Фамилия Имя Отчество'. Эксперт - это человек, который является авторитетом в данной области и может подтвердить корректность профиля. Эксперты обычно имеют значительный опыт работы по данному профилю и могут выступать как владельцы или ревьюеры профиля.",
      examples: [
        "Глебкин Роман Игоревич",
        "Иванов Иван Иванович",
        "Петров Петр Петрович",
        "Сидоров Сидор Сидорович"
      ],
      tips: [
        "Указывайте полное ФИО в формате 'Фамилия Имя Отчество'",
        "Экспертом должен быть реальный сотрудник организации",
        "Эксперт должен иметь достаточный опыт и авторитет в данной области",
        "Можно указать несколько экспертов (до 10)",
        "Максимальная длина - 100 символов"
      ],
      commonMistakes: [
        "Использование только имени или фамилии",
        "Указание несуществующих людей",
        "Неправильный порядок (Имя Фамилия вместо Фамилия Имя)",
        "Использование сокращений без расшифровки"
      ],
      additionalInfo: "Эксперты помогают поддерживать актуальность профиля и могут консультировать по вопросам, связанным с профилем. Их имена и должности отображаются в профиле, что повышает доверие к информации."
    },
    expertPosition: {
      title: "Должность эксперта",
      description: "Должность эксперта в организации. Помогает понять уровень экспертизы и авторитетность профиля. Должность должна отражать реальную позицию эксперта в компании и его уровень ответственности. Это поле рекомендуется заполнять для повышения доверия к профилю.",
      examples: [
        "Исполнительный директор по разработке",
        "Технический директор",
        "Руководитель направления",
        "Ведущий разработчик",
        "Senior Software Engineer",
        "Head of Engineering",
        "Team Lead",
        "Архитектор решений",
        "Руководитель отдела разработки"
      ],
      tips: [
        "Указывайте актуальную должность эксперта",
        "Должность должна соответствовать уровню экспертизы",
        "Можно использовать как русские, так и английские названия",
        "Избегайте слишком общих формулировок",
        "Максимальная длина - 100 символов"
      ],
      commonMistakes: [
        "Указание устаревшей должности",
        "Использование слишком общих терминов (например, 'Разработчик')",
        "Несоответствие должности уровню экспертизы",
        "Отсутствие конкретики о роли в организации"
      ],
      additionalInfo: "Должность эксперта показывает его авторитет и компетентность в области профиля. Высокая должность (например, Технический директор) повышает доверие к профилю, но важно, чтобы эксперт действительно имел релевантный опыт."
    },
    expertAvatar: {
      title: "URL аватарки",
      description: "Ссылка на изображение аватара эксперта. Должна начинаться с http:// или https://. Это опциональное поле, но добавление аватарки делает профиль более персонализированным и узнаваемым. Изображение должно быть доступно по указанному URL и иметь формат JPG, PNG или GIF.",
      examples: [
        "https://example.com/avatars/ivanov.jpg",
        "https://company.com/photos/employee123.png",
        "https://cdn.company.com/images/experts/glebkin.jpg",
        "https://storage.googleapis.com/avatars/employee456.png"
      ],
      tips: [
        "Используйте HTTPS для безопасности",
        "Убедитесь, что изображение доступно публично или через аутентификацию",
        "Рекомендуемый размер изображения: 200x200 или 400x400 пикселей",
        "Поддерживаемые форматы: JPG, PNG, GIF",
        "Изображение должно быть квадратным для лучшего отображения",
        "Максимальная длина URL - не ограничена, но рекомендуется до 500 символов"
      ],
      commonMistakes: [
        "Использование HTTP вместо HTTPS",
        "Неправильный формат URL (отсутствие http:// или https://)",
        "Указание недоступного URL",
        "Использование слишком больших изображений (более 2MB)",
        "Неправильный формат файла"
      ],
      additionalInfo: "Аватарка помогает визуально идентифицировать эксперта и делает профиль более живым и персонализированным. Если у эксперта нет публичного аватара, можно использовать корпоративное фото или пропустить это поле."
    }
  };

  const openHelp = (fieldKey: string) => {
    const content = fieldHelpContent[fieldKey];
    if (content) {
      setHelpContent(content);
      setHelpDialogOpen(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        setFormData({
          name: editingProfile.name,
          description: editingProfile.description,
          tfr: editingProfile.tfr || "",
          requiredCompetences: [...editingProfile.requiredCompetences],
          experts: editingProfile.experts
            ? editingProfile.experts.map((expert) => ({
                avatar: expert.avatar || "",
                fullName: expert.fullName || "",
                position: expert.position || "",
              }))
            : [],
          levels: editingProfile.levels
            ? editingProfile.levels.map((level) => ({
                level: level.level,
                name: level.name,
                description: level.description,
                responsibilities: [...level.responsibilities],
                education: level.education || "",
                experience: level.experience || "",
                requiredSkills: { ...level.requiredSkills },
              }))
            : [],
        });
        setCurrentStep(1);
      } else {
        setFormData({
          name: "",
          description: "",
          tfr: "",
          requiredCompetences: [],
          experts: [],
          levels: [],
        });
        setCurrentStep(1);
      }
      setErrors({});
      setSelectedTemplateProfile("");
    }
  }, [isOpen, editingProfile]);

  // Валидация шага
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Название профиля обязательно";
      } else if (formData.name.length < 3) {
        newErrors.name = "Название должно содержать минимум 3 символа";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Описание профиля обязательно";
      } else if (formData.description.length < 10) {
        newErrors.description = "Описание должно содержать минимум 10 символов";
      }
    }

    if (step === 2) {
      if (formData.requiredCompetences.length === 0) {
        newErrors.competences = "Добавьте хотя бы одну компетенцию";
      }
      const competenceIds = formData.requiredCompetences.map((c) => c.competenceId);
      const uniqueIds = new Set(competenceIds);
      if (uniqueIds.size !== competenceIds.length) {
        newErrors.competences = "Нельзя добавлять одну и ту же компетенцию дважды";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Копирование из шаблона
  const handleCopyFromTemplate = (profileId: string) => {
    const template = existingProfiles.find((p) => p.id === profileId);
    if (template) {
      setFormData({
        name: `${template.name} (копия)`,
        description: template.description,
        tfr: template.tfr || "",
        requiredCompetences: [...template.requiredCompetences],
        experts: template.experts
          ? template.experts.map((expert) => ({
              avatar: expert.avatar || "",
              fullName: expert.fullName || "",
              position: expert.position || "",
            }))
          : [],
        levels: template.levels
          ? template.levels.map((level) => ({
              level: level.level,
              name: level.name,
              description: level.description,
              responsibilities: [...level.responsibilities],
              education: level.education || "",
              experience: level.experience || "",
              requiredSkills: { ...level.requiredSkills },
            }))
          : [],
      });
      setSelectedTemplateProfile(profileId);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSave = () => {
    if (validateStep(1) && validateStep(2)) {
      const profileData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tfr: formData.tfr.trim() || undefined,
        requiredCompetences: formData.requiredCompetences,
        experts: formData.experts
          .filter((expert) => expert.fullName.trim() || expert.position.trim())
          .map((expert) => ({
            avatar: expert.avatar.trim() || undefined,
            fullName: expert.fullName.trim(),
            position: expert.position.trim(),
          })),
        levels: formData.levels
          .filter((level) => level.name.trim() && level.description.trim())
          .map((level) => ({
            level: level.level,
            name: level.name.trim(),
            description: level.description.trim(),
            responsibilities: level.responsibilities.filter((r) => r.trim()),
            education: level.education?.trim() || undefined,
            experience: level.experience?.trim() || undefined,
            requiredSkills: level.requiredSkills,
          })),
      };
      onSave(profileData);
    }
  };

  const canGoNext = currentStep < STEPS.length;
  const canGoBack = currentStep > 1;

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === currentStep) {
      // Клик на текущий шаг - ничего не делаем
      return;
    }
    
    if (stepNumber < currentStep) {
      // Переход назад - без валидации
      setCurrentStep(stepNumber);
      setErrors({});
    } else {
      // Переход вперед - проверяем валидацию всех шагов до целевого
      let canProceed = true;
      for (let step = currentStep; step < stepNumber; step++) {
        if (!validateStep(step)) {
          canProceed = false;
          break;
        }
      }
      
      if (canProceed) {
        setCurrentStep(stepNumber);
        setErrors({});
      }
    }
  };

  return (
    <div className={cn("space-y-6", !isOpen && "hidden")}>
      {/* Список шагов с названиями */}
      <div className="space-y-4">
        {/* Горизонтальный список шагов */}
        <div className="flex items-center gap-2 w-full">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isAccessible = stepNumber <= currentStep;
            
            return (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!isAccessible && stepNumber !== currentStep + 1}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full justify-center",
                    "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    isCurrent && "bg-primary/10 ring-2 ring-primary shadow-sm",
                    isCompleted && "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30",
                    !isCurrent && !isCompleted && isAccessible && "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors flex-shrink-0",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div
                      className={cn(
                        "text-base font-medium truncate",
                        isCurrent && "text-primary font-semibold",
                        isCompleted && "text-green-700 dark:text-green-300",
                        !isCurrent && !isCompleted && "text-muted-foreground"
                      )}
                      title={step.title}
                    >
                      {step.title}
                    </div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Заголовок шага */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{STEPS[currentStep - 1].title}</h3>
        <p className="text-muted-foreground">{STEPS[currentStep - 1].description}</p>
      </div>

      {/* Содержимое шагов */}
      <div className="min-h-[400px]">
        {/* Шаг 1: Основная информация */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Копирование из шаблона */}
            {!editingProfile && existingProfiles.length > 0 && (
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Создать на основе существующего профиля
                  </CardTitle>
                  <CardDescription>
                    Выберите профиль для копирования как шаблона
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTemplateProfile} onValueChange={handleCopyFromTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите профиль для копирования..." />
                    </SelectTrigger>
                    <SelectContent>
                      {existingProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplateProfile && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ Данные скопированы. Вы можете изменить их по необходимости.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="name">
                      Название профиля <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => openHelp("name")}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.name && (
                    <span className="text-xs text-muted-foreground">{formData.name.length}/100</span>
                  )}
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Например, Разработчик Perl"
                  className={cn("text-base", errors.name && "border-destructive")}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">
                      Описание <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => openHelp("description")}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.description && (
                    <span className="text-xs text-muted-foreground">{formData.description.length}/500</span>
                  )}
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) setErrors({ ...errors, description: "" });
                  }}
                  placeholder="Опишите профиль: основные задачи, область применения, ключевые технологии..."
                  rows={5}
                  className={cn("text-base resize-none", errors.description && "border-destructive")}
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tfr">ТФР (Типовая функциональная роль)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 text-muted-foreground hover:text-foreground"
                      onClick={() => openHelp("tfr")}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tfr && (
                    <span className="text-xs text-muted-foreground">{formData.tfr.length}/100</span>
                  )}
                </div>
                <Input
                  id="tfr"
                  value={formData.tfr}
                  onChange={(e) => setFormData({ ...formData, tfr: e.target.value })}
                  placeholder="Например, Разработчик, Аналитик, Тестировщик"
                  className="text-base"
                  maxLength={100}
                />
              </div>
            </div>
          </div>
        )}

        {/* Шаг 2: Компетенции */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Выберите компетенции, которые обязательны для данного профиля. Минимум 1 компетенция.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Выберите компетенции <span className="text-destructive">*</span></Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => openHelp("competences")}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              <MultiSelect
                options={competences
                  .filter((c): c is NonNullable<typeof c> => c !== null && c !== undefined && c.id !== undefined)
                  .map((c) => ({
                    value: c.id!,
                    label: c.name,
                    badge: c.type === "корпоративные компетенции" ? "Корп." : "Проф.",
                    badgeClassName: c.type === "корпоративные компетенции"
                      ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                      : "bg-purple-50 text-purple-700 border-purple-300",
                  }))}
                selected={formData.requiredCompetences.map((c) => c.competenceId)}
                onChange={(selectedIds) => {
                  const currentIds = new Set(formData.requiredCompetences.map((c) => c.competenceId));
                  const newIds = selectedIds.filter((id) => !currentIds.has(id));
                  const removedIds = formData.requiredCompetences
                    .map((c) => c.competenceId)
                    .filter((id) => !selectedIds.includes(id));

                  let updated = formData.requiredCompetences.filter(
                    (c) => !removedIds.includes(c.competenceId)
                  );

                  newIds.forEach((id) => {
                    updated.push({
                      competenceId: id,
                      requiredLevel: 1 as SkillLevel,
                    });
                  });

                  setFormData({ ...formData, requiredCompetences: updated });
                  if (errors.competences) setErrors({ ...errors, competences: "" });
                }}
                placeholder="Выберите компетенции..."
                className="w-full"
              />
              {errors.competences && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.competences}
                </p>
              )}
            </div>

            {formData.requiredCompetences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Выбранные компетенции</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Всего: <span className="font-semibold text-foreground">{formData.requiredCompetences.length}</span>
                      </span>
                      {(() => {
                        const professional = formData.requiredCompetences.filter((reqComp) => {
                          const comp = getCompetenceById(reqComp.competenceId);
                          return comp && comp.type === "профессиональные компетенции";
                        }).length;
                        const corporate = formData.requiredCompetences.length - professional;
                        return (
                          <>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                              Проф.: {professional}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-cyan-50 text-cyan-700 border-cyan-300">
                              Корп.: {corporate}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredCompetences.map((reqComp) => {
                        const comp = getCompetenceById(reqComp.competenceId);
                        if (!comp) return null;
                        return (
                          <Badge
                            key={reqComp.competenceId}
                            variant="outline"
                            className={cn(
                              "text-sm",
                              comp.type === "корпоративные компетенции"
                                ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                                : "bg-purple-50 text-purple-700 border-purple-300"
                            )}
                          >
                            {comp.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Шаг 3: Уровни профиля */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Уровни профиля определяют карьерную прогрессию. Это опциональный шаг - вы можете пропустить его.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Уровни профиля</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const usedLevels = new Set(formData.levels.map((l) => l.level));
                  const availableLevel = levelOptions.find((opt) => !usedLevels.has(opt.value));
                  
                  if (availableLevel) {
                    setFormData({
                      ...formData,
                      levels: [
                        ...formData.levels,
                        {
                          level: availableLevel.value,
                          name: "",
                          description: "",
                          responsibilities: [],
                          education: "",
                          experience: "",
                          requiredSkills: {},
                        },
                      ],
                    });
                  }
                }}
                disabled={formData.levels.length >= 5}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Добавить уровень ({formData.levels.length}/5)
              </Button>
            </div>

            {formData.levels.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Нет добавленных уровней</p>
                  <p className="text-xs text-muted-foreground">
                    Нажмите "Добавить уровень" для создания уровней профиля
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.levels.map((level, levelIndex) => {
                  const levelOption = levelOptions.find((opt) => opt.value === level.level);
                  const usedLevels = new Set(formData.levels.map((l, i) => i !== levelIndex ? l.level : null).filter(Boolean));
                  const availableLevelOptions = levelOptions.filter((opt) => !usedLevels.has(opt.value) || opt.value === level.level);

                  return (
                    <Card key={levelIndex}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Уровень {levelIndex + 1}: {levelOption?.label || level.level}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                levels: formData.levels.filter((_, i) => i !== levelIndex),
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Тип уровня</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("levelType")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Select
                            value={level.level}
                            onValueChange={(value) => {
                              const updated = [...formData.levels];
                              updated[levelIndex] = { ...updated[levelIndex], level: value as typeof level.level };
                              setFormData({ ...formData, levels: updated });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLevelOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Название уровня</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("levelName")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={level.name}
                            onChange={(e) => {
                              const updated = [...formData.levels];
                              updated[levelIndex] = { ...updated[levelIndex], name: e.target.value };
                              setFormData({ ...formData, levels: updated });
                            }}
                            placeholder="Например, Trainee Perl Developer"
                            maxLength={100}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Описание уровня</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("levelDescription")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={level.description}
                            onChange={(e) => {
                              const updated = [...formData.levels];
                              updated[levelIndex] = { ...updated[levelIndex], description: e.target.value };
                              setFormData({ ...formData, levels: updated });
                            }}
                            placeholder="Опишите уровень и его основные характеристики"
                            rows={3}
                            maxLength={500}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-semibold">Обязанности</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => openHelp("responsibilities")}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updated = [...formData.levels];
                                updated[levelIndex].responsibilities.push("");
                                setFormData({ ...formData, levels: updated });
                              }}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Добавить обязанность
                            </Button>
                          </div>
                          
                          {level.responsibilities.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Нет обязанностей. Нажмите "Добавить обязанность" для добавления.</p>
                          ) : (
                            <div className="space-y-2">
                              {level.responsibilities.map((resp, respIndex) => (
                                <div key={respIndex} className="flex items-center gap-2">
                                  <Input
                                    value={resp}
                                    onChange={(e) => {
                                      const updated = [...formData.levels];
                                      updated[levelIndex].responsibilities[respIndex] = e.target.value;
                                      setFormData({ ...formData, levels: updated });
                                    }}
                                    placeholder="Введите обязанность"
                                    className="text-sm"
                                    maxLength={200}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      const updated = [...formData.levels];
                                      updated[levelIndex].responsibilities = updated[levelIndex].responsibilities.filter((_, i) => i !== respIndex);
                                      setFormData({ ...formData, levels: updated });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Требования</Label>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>Образование</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => openHelp("education")}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={level.education || ""}
                              onChange={(e) => {
                                const updated = [...formData.levels];
                                updated[levelIndex] = { ...updated[levelIndex], education: e.target.value };
                                setFormData({ ...formData, levels: updated });
                              }}
                              placeholder="Например, Среднее специальное или неоконченное высшее техническое образование"
                              maxLength={200}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>Стаж</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => openHelp("experience")}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={level.experience || ""}
                              onChange={(e) => {
                                const updated = [...formData.levels];
                                updated[levelIndex] = { ...updated[levelIndex], experience: e.target.value };
                                setFormData({ ...formData, levels: updated });
                              }}
                              placeholder="Например, Стаж работы не требуется"
                              maxLength={200}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Шаг 4: Эксперты */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Добавьте экспертов (владельцев профиля). Это опциональный шаг.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Эксперты</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (formData.experts.length < 10) {
                    setFormData({
                      ...formData,
                      experts: [
                        ...formData.experts,
                        { avatar: "", fullName: "", position: "" },
                      ],
                    });
                  }
                }}
                disabled={formData.experts.length >= 10}
              >
                <Users className="mr-2 h-4 w-4" />
                Добавить эксперта ({formData.experts.length}/10)
              </Button>
            </div>

            {formData.experts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Нет добавленных экспертов</p>
                  <p className="text-xs text-muted-foreground">
                    Нажмите "Добавить эксперта" для добавления владельца профиля
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.experts.map((expert, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Эксперт {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              experts: formData.experts.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>ФИО эксперта</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("expertFullName")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={expert.fullName}
                            onChange={(e) => {
                              const updated = [...formData.experts];
                              updated[index] = { ...updated[index], fullName: e.target.value };
                              setFormData({ ...formData, experts: updated });
                            }}
                            placeholder="Например, Глебкин Роман Игоревич"
                            maxLength={100}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>Должность</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-foreground"
                              onClick={() => openHelp("expertPosition")}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={expert.position}
                            onChange={(e) => {
                              const updated = [...formData.experts];
                              updated[index] = { ...updated[index], position: e.target.value };
                              setFormData({ ...formData, experts: updated });
                            }}
                            placeholder="Например, Исполнительный директор по разработке"
                            maxLength={100}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>URL аватарки (необязательно)</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                            onClick={() => openHelp("expertAvatar")}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          value={expert.avatar}
                          onChange={(e) => {
                            const updated = [...formData.experts];
                            updated[index] = { ...updated[index], avatar: e.target.value };
                            setFormData({ ...formData, experts: updated });
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          type="url"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Шаг 5: Проверка */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Проверьте все данные перед сохранением. Вы можете вернуться к любому шагу для редактирования.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Название</Label>
                    <p className="font-semibold">{formData.name || "Не указано"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Описание</Label>
                    <p className="text-sm">{formData.description || "Не указано"}</p>
                  </div>
                  {formData.tfr && (
                    <div>
                      <Label className="text-xs text-muted-foreground">ТФР</Label>
                      <p className="text-sm">{formData.tfr}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Компетенции</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">
                      {formData.requiredCompetences.length} компетенций
                    </Badge>
                    {(() => {
                      const professional = formData.requiredCompetences.filter((reqComp) => {
                        const comp = getCompetenceById(reqComp.competenceId);
                        return comp && comp.type === "профессиональные компетенции";
                      }).length;
                      const corporate = formData.requiredCompetences.length - professional;
                      return (
                        <>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            Проф.: {professional}
                          </Badge>
                          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                            Корп.: {corporate}
                          </Badge>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredCompetences.map((reqComp) => {
                      const comp = getCompetenceById(reqComp.competenceId);
                      if (!comp) return null;
                      return (
                        <Badge
                          key={reqComp.competenceId}
                          variant="outline"
                          className={cn(
                            comp.type === "корпоративные компетенции"
                              ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                              : "bg-purple-50 text-purple-700 border-purple-300"
                          )}
                        >
                          {comp.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {formData.levels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Уровни профиля</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.levels.map((level, index) => {
                        const levelOption = levelOptions.find((opt) => opt.value === level.level);
                        return (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{levelOption?.label}</Badge>
                              <span className="font-semibold text-sm">{level.name || "Без названия"}</span>
                            </div>
                            {level.description && (
                              <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {formData.experts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Эксперты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.experts.map((expert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar className="h-10 w-10">
                            {expert.avatar ? (
                              <AvatarImage src={expert.avatar} alt={expert.fullName} />
                            ) : null}
                            <AvatarFallback>
                              {expert.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{expert.fullName || "Без имени"}</p>
                            <p className="text-xs text-muted-foreground">{expert.position || "Без должности"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Навигация */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          {canGoBack && (
            <Button variant="outline" onClick={handleBack} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} size="sm">
              Далее
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} size="sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {editingProfile ? "Сохранить изменения" : "Создать профиль"}
            </Button>
          )}
        </div>
      </div>

      {/* Модальное окно с подсказками */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {helpContent?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              {helpContent?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Примеры заполнения */}
            {helpContent?.examples && helpContent.examples.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Примеры заполнения:
                </Label>
                <div className="space-y-2">
                  {helpContent.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
                      <p className="text-sm">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Советы */}
            {helpContent?.tips && helpContent.tips.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Советы по заполнению:
                </Label>
                <ul className="space-y-2">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Частые ошибки */}
            {helpContent?.commonMistakes && helpContent.commonMistakes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Частые ошибки:
                </Label>
                <ul className="space-y-2">
                  {helpContent.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-600 mt-1">⚠</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Дополнительная информация */}
            {helpContent?.additionalInfo && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-sm font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Info className="h-4 w-4" />
                  Дополнительная информация:
                </Label>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {helpContent.additionalInfo}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

