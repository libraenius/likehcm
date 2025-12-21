import type {
  Competence,
  Profile,
  CareerTrack,
  ProfileCompetence,
  ProfileLevel,
  SkillLevel,
} from "@/types";
import { getFromStorage, saveToStorage, STORAGE_KEYS, migrateData } from "./storage";

// Ключи для localStorage (используем из constants)
const COMPETENCES_KEY = STORAGE_KEYS.COMPETENCES;
const PROFILES_KEY = STORAGE_KEYS.PROFILES;
const CAREER_TRACKS_KEY = STORAGE_KEYS.CAREER_TRACKS;

// Начальные данные по умолчанию
const defaultCompetences: Competence[] = [
  {
    id: "comp-1",
    name: "JavaScript",
    description: "Знание языка программирования JavaScript",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знакомство с основами синтаксиса, переменными, типами данных",
      level2: "Работа с функциями, объектами, массивами, базовые DOM-операции",
      level3: "Асинхронное программирование, замыкания, прототипы, ES6+",
      level4: "Продвинутые паттерны, оптимизация, архитектура приложений",
      level5: "Экспертные знания языка, создание библиотек, менторинг",
    },
    resources: {
      literature: [
        { name: "Выразительный JavaScript - Марейн Хавербеке", level: 2 },
        { name: "JavaScript: The Definitive Guide - Дэвид Флэнаган", level: 3 },
        { name: "You Don't Know JS - Кайл Симпсон", level: 4 },
        { name: "Eloquent JavaScript - Марейн Хавербеке", level: 2 },
        { name: "JavaScript: The Good Parts - Дуглас Крокфорд", level: 3 }
      ],
      videos: [
        { name: "JavaScript Crash Course - Traversy Media", level: 1 },
        { name: "Modern JavaScript Tutorial - freeCodeCamp", level: 2 },
        { name: "JavaScript Mastery - Programming with Mosh", level: 3 },
        { name: "Async JavaScript - Fun Fun Function", level: 4 },
        { name: "JavaScript Algorithms and Data Structures - freeCodeCamp", level: 3 }
      ],
      courses: [
        { name: "JavaScript для начинающих - Stepik", level: 1 },
        { name: "The Complete JavaScript Course - Udemy", level: 2 },
        { name: "JavaScript Algorithms and Data Structures - freeCodeCamp", level: 3 },
        { name: "Advanced JavaScript - Pluralsight", level: 4 },
        { name: "JavaScript: Understanding the Weird Parts - Udemy", level: 5 }
      ],
    },
  },
  {
    id: "comp-2",
    name: "TypeScript",
    description: "Знание TypeScript и типизации",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание базовых типов, интерфейсов, type annotations",
      level2: "Работа с классами, generics, utility types",
      level3: "Продвинутые типы, условные типы, mapped types",
      level4: "Создание сложных типовых систем, декларации модулей",
      level5: "Экспертные знания TypeScript, разработка типовых библиотек",
    },
    resources: {
      literature: [
        { name: "Programming TypeScript - Борис Черни", level: 3 },
        { name: "Effective TypeScript - Дэн Вандеркам", level: 4 },
        { name: "TypeScript Deep Dive - Базил Али", level: 3 },
        { name: "TypeScript Handbook - официальная документация", level: 2 },
        { name: "Learning TypeScript - Джош Голдберг", level: 2 }
      ],
      videos: [
        { name: "TypeScript Tutorial for Beginners - Programming with Mosh", level: 1 },
        { name: "TypeScript Crash Course - Traversy Media", level: 2 },
        { name: "Advanced TypeScript - Frontend Masters", level: 4 },
        { name: "TypeScript: The Complete Developer's Guide - Udemy", level: 3 },
        { name: "TypeScript Basics - freeCodeCamp", level: 2 }
      ],
      courses: [
        { name: "TypeScript для начинающих - Stepik", level: 1 },
        { name: "Understanding TypeScript - Udemy", level: 2 },
        { name: "TypeScript Fundamentals - Pluralsight", level: 3 },
        { name: "TypeScript: Complete Course - Udemy", level: 3 },
        { name: "Advanced TypeScript Patterns - Frontend Masters", level: 5 }
      ],
    },
  },
  {
    id: "comp-3",
    name: "React",
    description: "Работа с библиотекой React",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание компонентов, props, state, базовый JSX",
      level2: "Hooks (useState, useEffect), работа с событиями, формы",
      level3: "Продвинутые hooks, оптимизация, контекст, роутинг",
      level4: "Архитектура приложений, кастомные hooks, производительность",
      level5: "Экспертные знания React, создание библиотек компонентов",
    },
    resources: {
      literature: [
        { name: "React в действии - Марк Тиленс Томас", level: 3 },
        { name: "Fullstack React - Энтони Аккомандо", level: 3 },
        { name: "Learning React - Алекс Бэнкс и Ева Порселло", level: 2 },
        { name: "React Design Patterns and Best Practices - Микеле Бертоли", level: 4 },
        { name: "The Road to React - Робин Вирш", level: 2 }
      ],
      videos: [
        { name: "React Tutorial for Beginners - Programming with Mosh", level: 1 },
        { name: "React Crash Course - Traversy Media", level: 2 },
        { name: "React Hooks Tutorial - freeCodeCamp", level: 3 },
        { name: "Advanced React Patterns - Frontend Masters", level: 4 },
        { name: "React Performance Optimization - Udemy", level: 4 }
      ],
      courses: [
        { name: "React для начинающих - Stepik", level: 1 },
        { name: "The Complete React Developer Course - Udemy", level: 2 },
        { name: "React - The Complete Guide - Udemy", level: 3 },
        { name: "Advanced React and Redux - Udemy", level: 4 },
        { name: "React Patterns - Frontend Masters", level: 5 }
      ],
    },
  },
  {
    id: "comp-4",
    name: "Node.js",
    description: "Разработка серверных приложений на Node.js",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание Node.js, модули, базовый API",
      level2: "Работа с файловой системой, HTTP, npm пакеты",
      level3: "Асинхронное программирование, streams, работа с БД",
      level4: "Архитектура серверов, микросервисы, оптимизация",
      level5: "Экспертные знания Node.js, создание фреймворков",
    },
    resources: {
      literature: [
        { name: "Node.js в действии - Алекс Янг", level: 3 },
        { name: "Learning Node.js - Марк Браун", level: 2 },
        { name: "Node.js Design Patterns - Марио Каскиано", level: 4 },
        { name: "Node.js: The Complete Guide - Дэвид Херрон", level: 3 },
        { name: "Professional Node.js - Педро Тейшейра", level: 4 }
      ],
      videos: [
        { name: "Node.js Tutorial for Beginners - Programming with Mosh", level: 1 },
        { name: "Node.js Crash Course - Traversy Media", level: 2 },
        { name: "Node.js API Development - freeCodeCamp", level: 3 },
        { name: "Advanced Node.js - Frontend Masters", level: 4 },
        { name: "Node.js Best Practices - Udemy", level: 4 }
      ],
      courses: [
        { name: "Node.js для начинающих - Stepik", level: 1 },
        { name: "The Complete Node.js Developer Course - Udemy", level: 2 },
        { name: "Node.js, Express, MongoDB - Udemy", level: 3 },
        { name: "Node.js Advanced Concepts - Udemy", level: 4 },
        { name: "Node.js Microservices - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-5",
    name: "Базы данных",
    description: "Работа с базами данных (SQL, NoSQL)",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ БД, простые запросы SELECT, INSERT",
      level2: "JOIN операции, индексы, базовые оптимизации",
      level3: "Сложные запросы, транзакции, проектирование схем",
      level4: "Оптимизация производительности, репликация, шардирование",
      level5: "Экспертные знания БД, проектирование масштабируемых систем",
    },
    resources: {
      literature: [
        { name: "SQL и реляционные базы данных - Крис Фиайли", level: 2 },
        { name: "MongoDB: The Definitive Guide - Кристина Чодороу", level: 3 },
        { name: "High Performance MySQL - Барон Шварц", level: 4 },
        { name: "Database Design for Mere Mortals - Майкл Дж. Эрнандес", level: 3 },
        { name: "NoSQL Distilled - Мартин Фаулер", level: 4 }
      ],
      videos: [
        { name: "SQL Tutorial for Beginners - freeCodeCamp", level: 1 },
        { name: "MongoDB Crash Course - Traversy Media", level: 2 },
        { name: "Database Design Tutorial - freeCodeCamp", level: 3 },
        { name: "PostgreSQL Tutorial - Programming with Mosh", level: 3 },
        { name: "Redis Tutorial - Traversy Media", level: 3 }
      ],
      courses: [
        { name: "SQL для начинающих - Stepik", level: 1 },
        { name: "The Complete SQL Bootcamp - Udemy", level: 2 },
        { name: "MongoDB - The Complete Developer's Guide - Udemy", level: 3 },
        { name: "Database Design and Management - Udemy", level: 4 },
        { name: "Advanced SQL - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-6",
    name: "Архитектура",
    description: "Проектирование архитектуры приложений",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание базовых принципов архитектуры",
      level2: "Паттерны проектирования, SOLID принципы",
      level3: "Проектирование модульной архитектуры, микросервисы",
      level4: "Проектирование масштабируемых систем, распределенные системы",
      level5: "Экспертные знания архитектуры, создание архитектурных решений",
    },
    resources: {
      literature: [
        { name: "Паттерны проектирования - Банда четырех", level: 3 },
        { name: "Чистая архитектура - Роберт Мартин", level: 4 },
        { name: "Архитектура корпоративных приложений - Мартин Фаулер", level: 4 },
        { name: "Building Microservices - Сэм Ньюман", level: 4 },
        { name: "Designing Data-Intensive Applications - Мартин Клеппман", level: 5 }
      ],
      videos: [
        { name: "Software Architecture Patterns - freeCodeCamp", level: 2 },
        { name: "Microservices Architecture - Traversy Media", level: 3 },
        { name: "System Design Interview - Tech Dummies Narendra L", level: 4 },
        { name: "Clean Architecture - Uncle Bob", level: 4 },
        { name: "Distributed Systems - MIT OpenCourseWare", level: 5 }
      ],
      courses: [
        { name: "Архитектура программного обеспечения - Stepik", level: 2 },
        { name: "Software Architecture & Design - Udemy", level: 3 },
        { name: "Microservices Architecture - Pluralsight", level: 4 },
        { name: "System Design Interview - Educative", level: 5 },
        { name: "Advanced Software Architecture - Udemy", level: 5 }
      ],
    },
  },
  {
    id: "comp-7",
    name: "Тестирование",
    description: "Написание и поддержка тестов",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ тестирования, unit тесты",
      level2: "Интеграционные тесты, моки, стабы",
      level3: "E2E тесты, покрытие кода, TDD подход",
      level4: "Стратегии тестирования, производительность тестов",
      level5: "Экспертные знания тестирования, построение тестовых стратегий",
    },
    resources: {
      literature: [
        { name: "Тестирование программного обеспечения - Сэм Канер", level: 2 },
        { name: "Test Driven Development - Кент Бек", level: 3 },
        { name: "The Art of Unit Testing - Рой Ошеров", level: 3 },
        { name: "Testing JavaScript Applications - Лукас да Коста", level: 4 },
        { name: "Growing Object-Oriented Software, Guided by Tests - Стив Фриман", level: 4 }
      ],
      videos: [
        { name: "JavaScript Testing Tutorial - freeCodeCamp", level: 1 },
        { name: "Jest Testing Tutorial - Traversy Media", level: 2 },
        { name: "TDD Crash Course - Fun Fun Function", level: 3 },
        { name: "Cypress Testing Tutorial - freeCodeCamp", level: 3 },
        { name: "Unit Testing Best Practices - Udemy", level: 4 }
      ],
      courses: [
        { name: "Тестирование ПО - Stepik", level: 1 },
        { name: "Testing JavaScript with Jest - Udemy", level: 2 },
        { name: "Complete Guide to Test Driven Development - Udemy", level: 3 },
        { name: "End-to-End Testing with Cypress - Udemy", level: 4 },
        { name: "Advanced Testing Strategies - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-8",
    name: "DevOps",
    description: "CI/CD, Docker, Kubernetes",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ DevOps, базовый Docker",
      level2: "Docker Compose, базовый CI/CD, контейнеризация",
      level3: "Kubernetes основы, автоматизация деплоя, мониторинг",
      level4: "Продвинутый Kubernetes, инфраструктура как код, безопасность",
      level5: "Экспертные знания DevOps, построение CI/CD систем",
    },
    resources: {
      literature: [
        { name: "The DevOps Handbook - Джин Ким", level: 3 },
        { name: "Docker Deep Dive - Найджел Поултон", level: 4 },
        { name: "Kubernetes: Up and Running - Келси Хайтнер", level: 4 },
        { name: "Infrastructure as Code - Киф Моррис", level: 4 },
        { name: "The Phoenix Project - Джин Ким", level: 3 }
      ],
      videos: [
        { name: "Docker Tutorial for Beginners - freeCodeCamp", level: 1 },
        { name: "Kubernetes Tutorial - Traversy Media", level: 2 },
        { name: "CI/CD Pipeline Tutorial - freeCodeCamp", level: 3 },
        { name: "DevOps Crash Course - Programming with Mosh", level: 2 },
        { name: "Terraform Tutorial - freeCodeCamp", level: 3 }
      ],
      courses: [
        { name: "DevOps для начинающих - Stepik", level: 1 },
        { name: "Docker Mastery - Udemy", level: 2 },
        { name: "Kubernetes for the Absolute Beginners - Udemy", level: 2 },
        { name: "Complete CI/CD Pipeline - Udemy", level: 4 },
        { name: "DevOps Bootcamp - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-9",
    name: "Коммуникация",
    description: "Эффективное общение с коллегами, клиентами и стейкхолдерами",
    type: "корпоративные компетенции",
    levels: {
      level1: "Базовые компетенции устного и письменного общения, понимание простых инструкций",
      level2: "Умение ясно выражать мысли, активное слушание, участие в обсуждениях",
      level3: "Эффективная коммуникация в команде, умение презентовать идеи, работа с обратной связью",
      level4: "Стратегическая коммуникация, управление сложными переговорами, влияние на решения",
      level5: "Экспертные компетенции коммуникации, менторинг других, построение коммуникационных стратегий",
    },
    resources: {
      literature: [
        { name: "Как разговаривать с кем угодно - Марк Роудз", level: 2 },
        { name: "Невероятная сила эффективного общения - Дейл Карнеги", level: 2 },
        { name: "Искусство говорить и слушать - Мортимер Адлер", level: 3 },
        { name: "Crucial Conversations - Керри Паттерсон", level: 4 },
        { name: "Difficult Conversations - Дуглас Стоун", level: 4 }
      ],
      videos: [
        { name: "Effective Communication Skills - Communication Coach", level: 1 },
        { name: "How to Improve Communication Skills - Brian Tracy", level: 2 },
        { name: "Public Speaking Tips - TED", level: 3 },
        { name: "Active Listening Skills - MindTools", level: 2 },
        { name: "Business Communication - freeCodeCamp", level: 3 }
      ],
      courses: [
        { name: "Эффективная коммуникация - Stepik", level: 1 },
        { name: "Communication Skills Masterclass - Udemy", level: 2 },
        { name: "Business Communication - Coursera", level: 3 },
        { name: "Public Speaking and Presentation Skills - Udemy", level: 4 },
        { name: "Interpersonal Communication - edX", level: 4 }
      ],
    },
  },
  {
    id: "comp-10",
    name: "Работа в команде",
    description: "Способность эффективно работать в составе команды",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимание роли в команде, выполнение поставленных задач, следование инструкциям",
      level2: "Активное участие в командной работе, поддержка коллег, разделение ответственности",
      level3: "Координация работы команды, разрешение конфликтов, мотивация участников",
      level4: "Формирование эффективных команд, развитие командной культуры, управление командными процессами",
      level5: "Экспертные знания командной динамики, построение высокопроизводительных команд, менторинг лидеров",
    },
    resources: {
      literature: [
        { name: "Пять пороков команды - Патрик Ленсиони", level: 3 },
        { name: "Команда мечты - Дэниел Койл", level: 3 },
        { name: "Работа в команде - Джон Максвелл", level: 2 },
        { name: "The Five Dysfunctions of a Team - Патрик Ленсиони", level: 3 },
        { name: "Team of Teams - Стэнли Маккристал", level: 4 }
      ],
      videos: [
        { name: "Teamwork Skills - MindTools", level: 1 },
        { name: "Building High-Performance Teams - TED", level: 3 },
        { name: "Team Dynamics - Harvard Business Review", level: 3 },
        { name: "Effective Team Collaboration - LinkedIn Learning", level: 2 },
        { name: "Team Building Strategies - Udemy", level: 3 }
      ],
      courses: [
        { name: "Работа в команде - Stepik", level: 1 },
        { name: "Teamwork and Collaboration - Coursera", level: 2 },
        { name: "Building High-Performance Teams - Udemy", level: 4 },
        { name: "Team Leadership - edX", level: 4 },
        { name: "Agile Team Collaboration - Pluralsight", level: 4 }
      ],
    },
  },
  {
    id: "comp-11",
    name: "Лидерство",
    description: "Способность вести и вдохновлять других",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимание основ лидерства, выполнение роли наставника для новичков",
      level2: "Ведение небольших проектов, мотивация команды, принятие решений в рамках задач",
      level3: "Управление командой, стратегическое планирование, развитие подчиненных",
      level4: "Привлекает в команду и удерживает сотрудников с высоким уровнем экспертизы, компетенций и навыков. Вдохновляет команду. Помогает другим осознавать ценность их работы. Поощряет команду к участию в проектах и задачах, выходящих за рамки основного функционала. Признает достижения и личный вклад каждого участника команды. Организует обмен опытом в команде и возможность ознакомления с лучшими практиками. Оказывает своевременную помощь и поддержку членам команды. Способствует проявлению лучших качеств других людей. Помогает им проявить свой потенциал",
      level5: "Трансформационное лидерство, построение лидерской культуры, развитие лидеров следующего уровня. Формирует стратегическое видение и направляет организацию к достижению амбициозных целей. Создает условия для развития лидерских качеств у других и передает лидерский опыт. Разрабатывает и внедряет системы развития лидерства в организации. Влияет на формирование корпоративной культуры и ценностей на уровне всей организации",
    },
    resources: {
      literature: [
        { name: "21 неопровержимый закон лидерства - Джон Максвелл", level: 3 },
        { name: "От хорошего к великому - Джим Коллинз", level: 4 },
        { name: "Лидер без титула - Робин Шарма", level: 2 },
        { name: "The 7 Habits of Highly Effective People - Стивен Кови", level: 3 },
        { name: "Leaders Eat Last - Саймон Синек", level: 4 }
      ],
      videos: [
        { name: "Leadership Skills - TED", level: 2 },
        { name: "How to Be a Great Leader - Harvard Business Review", level: 3 },
        { name: "Leadership Development - MindTools", level: 2 },
        { name: "Transformational Leadership - Udemy", level: 4 },
        { name: "Leadership Principles - Coursera", level: 3 }
      ],
      courses: [
        { name: "Основы лидерства - Stepik", level: 1 },
        { name: "Leadership Development - Coursera", level: 2 },
        { name: "Executive Leadership - Udemy", level: 4 },
        { name: "Strategic Leadership - edX", level: 5 },
        { name: "Leadership and Management - Pluralsight", level: 4 }
      ],
    },
  },
  {
    id: "comp-12",
    name: "Решение проблем",
    description: "Способность анализировать и решать сложные задачи",
    type: "корпоративные компетенции",
    levels: {
      level1: "Идентификация простых проблем, следование стандартным процедурам решения",
      level2: "Анализ проблем средней сложности, применение известных методов решения",
      level3: "Системный анализ сложных проблем, разработка инновационных решений, оценка рисков",
      level4: "Решение комплексных бизнес-задач, стратегическое мышление, управление неопределенностью",
      level5: "Экспертные компетенции решения проблем, создание методологий, менторинг в решении сложных задач",
    },
    resources: {
      literature: [
        { name: "Искусство решения проблем - Джордж Поля", level: 3 },
        { name: "Думай медленно, решай быстро - Даниэль Канеман", level: 4 },
        { name: "Решение проблем - Томас Уэделл-Уэллс", level: 2 },
        { name: "The Art of Problem Solving - Расселл Акофф", level: 4 },
        { name: "Problem Solving 101 - Кен Ватанабе", level: 2 }
      ],
      videos: [
        { name: "Problem Solving Techniques - MindTools", level: 1 },
        { name: "Creative Problem Solving - TED", level: 2 },
        { name: "Systematic Problem Solving - Harvard Business Review", level: 3 },
        { name: "Problem Solving Skills - Udemy", level: 3 },
        { name: "Critical Thinking and Problem Solving - Coursera", level: 4 }
      ],
      courses: [
        { name: "Решение проблем - Stepik", level: 1 },
        { name: "Problem Solving and Decision Making - Coursera", level: 2 },
        { name: "Creative Problem Solving - Udemy", level: 3 },
        { name: "Systematic Problem Solving - edX", level: 4 },
        { name: "Analytical Thinking - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-13",
    name: "Управление временем",
    description: "Эффективное планирование и организация рабочего времени",
    type: "корпоративные компетенции",
    levels: {
      level1: "Базовое планирование задач, соблюдение дедлайнов, приоритизация простых задач",
      level2: "Эффективное планирование рабочего дня, управление несколькими задачами, оценка времени",
      level3: "Стратегическое планирование, управление проектами, балансировка приоритетов",
      level4: "Управление временем команды, оптимизация процессов, управление ресурсами",
      level5: "Экспертные компетенции тайм-менеджмента, построение систем управления временем, менторинг",
    },
    resources: {
      literature: [
        { name: "Как привести дела в порядок - Дэвид Аллен", level: 3 },
        { name: "7 навыков высокоэффективных людей - Стивен Кови", level: 3 },
        { name: "Тайм-менеджмент - Брайан Трейси", level: 2 },
        { name: "Getting Things Done - Дэвид Аллен", level: 3 },
        { name: "Eat That Frog - Брайан Трейси", level: 2 }
      ],
      videos: [
        { name: "Time Management Tips - Brian Tracy", level: 1 },
        { name: "Productivity Hacks - TED", level: 2 },
        { name: "Time Management Skills - MindTools", level: 2 },
        { name: "Getting Things Done - Udemy", level: 3 },
        { name: "Productivity Masterclass - Coursera", level: 4 }
      ],
      courses: [
        { name: "Управление временем - Stepik", level: 1 },
        { name: "Time Management Mastery - Udemy", level: 2 },
        { name: "Productivity and Time Management - Coursera", level: 3 },
        { name: "Getting Things Done - edX", level: 4 },
        { name: "Time Management Fundamentals - Pluralsight", level: 3 }
      ],
    },
  },
  {
    id: "comp-14",
    name: "Адаптивность",
    description: "Способность быстро адаптироваться к изменениям",
    type: "корпоративные компетенции",
    levels: {
      level1: "Принятие небольших изменений, следование новым процедурам, открытость к обучению",
      level2: "Адаптация к изменениям в работе, гибкость в подходах, быстрое освоение новых инструментов",
      level3: "Проактивная адаптация к изменениям, управление неопределенностью, поддержка изменений в команде",
      level4: "Лидерство в изменениях, управление трансформациями, создание адаптивной культуры",
      level5: "Экспертные компетенции управления изменениями, построение адаптивных организаций, менторинг",
    },
    resources: {
      literature: [
        { name: "Кто съел мою сыр? - Спенсер Джонсон", level: 1 },
        { name: "Адаптивность - Тим Харфорд", level: 3 },
        { name: "Управление изменениями - Джон Коттер", level: 4 },
        { name: "Who Moved My Cheese? - Спенсер Джонсон", level: 1 },
        { name: "The Change Masters - Розмари Кантер", level: 4 }
      ],
      videos: [
        { name: "Adapting to Change - TED", level: 2 },
        { name: "Change Management - Harvard Business Review", level: 3 },
        { name: "Building Resilience - MindTools", level: 2 },
        { name: "Change Management Skills - Udemy", level: 3 },
        { name: "Leading Change - Coursera", level: 4 }
      ],
      courses: [
        { name: "Адаптивность и изменения - Stepik", level: 1 },
        { name: "Change Management - Coursera", level: 2 },
        { name: "Leading Organizational Change - Udemy", level: 4 },
        { name: "Adaptive Leadership - edX", level: 5 },
        { name: "Change Management Fundamentals - Pluralsight", level: 3 }
      ],
    },
  },
  {
    id: "comp-15",
    name: "Критическое мышление",
    description: "Способность анализировать информацию и принимать обоснованные решения",
    type: "корпоративные компетенции",
    levels: {
      level1: "Базовый анализ информации, различение фактов и мнений, следование логике",
      level2: "Анализ данных, выявление закономерностей, оценка источников информации",
      level3: "Глубокий анализ сложных ситуаций, выявление причинно-следственных связей, синтез информации",
      level4: "Стратегическое мышление, системный анализ, принятие решений в условиях неопределенности",
      level5: "Экспертные компетенции критического мышления, создание аналитических методологий, менторинг",
    },
    resources: {
      literature: [
        { name: "Искусство мыслить критически - Ричард Пол", level: 3 },
        { name: "Думай медленно, решай быстро - Даниэль Канеман", level: 4 },
        { name: "Критическое мышление - Дайана Халперн", level: 2 },
        { name: "Thinking, Fast and Slow - Даниэль Канеман", level: 4 },
        { name: "Critical Thinking - Ричард Пол", level: 3 }
      ],
      videos: [
        { name: "Critical Thinking Skills - TED", level: 2 },
        { name: "How to Think Critically - MindTools", level: 2 },
        { name: "Logical Reasoning - Khan Academy", level: 3 },
        { name: "Critical Thinking Course - Udemy", level: 3 },
        { name: "Introduction to Critical Thinking - Coursera", level: 2 }
      ],
      courses: [
        { name: "Критическое мышление - Stepik", level: 1 },
        { name: "Critical Thinking and Problem Solving - Coursera", level: 2 },
        { name: "Introduction to Logic and Critical Thinking - edX", level: 3 },
        { name: "Critical Thinking Skills - Udemy", level: 4 },
        { name: "Analytical Thinking - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-16",
    name: "Эмоциональный интеллект",
    description: "Способность понимать и управлять эмоциями своими и других",
    type: "корпоративные компетенции",
    levels: {
      level1: "Базовое понимание эмоций, самосознание, контроль базовых эмоциональных реакций",
      level2: "Распознавание эмоций других, эмпатия, управление стрессом",
      level3: "Эффективное использование эмоций в работе, управление отношениями, разрешение конфликтов",
      level4: "Стратегическое использование эмоционального интеллекта, создание эмоционально здоровой среды",
      level5: "Экспертные компетенции эмоционального интеллекта, развитие EQ в организации, менторинг",
    },
    resources: {
      literature: [
        { name: "Эмоциональный интеллект - Дэниел Гоулман", level: 3 },
        { name: "Эмоциональный интеллект 2.0 - Трэвис Брэдберри", level: 2 },
        { name: "Сила эмоционального интеллекта - Дэниел Гоулман", level: 3 },
        { name: "Emotional Intelligence - Дэниел Гоулман", level: 3 },
        { name: "Emotional Intelligence 2.0 - Трэвис Брэдберри", level: 2 }
      ],
      videos: [
        { name: "Emotional Intelligence - TED", level: 2 },
        { name: "Developing Emotional Intelligence - MindTools", level: 2 },
        { name: "EQ Skills - Harvard Business Review", level: 3 },
        { name: "Emotional Intelligence Course - Udemy", level: 3 },
        { name: "Emotional Intelligence at Work - Coursera", level: 4 }
      ],
      courses: [
        { name: "Эмоциональный интеллект - Stepik", level: 1 },
        { name: "Emotional Intelligence - Coursera", level: 2 },
        { name: "Developing Emotional Intelligence - Udemy", level: 3 },
        { name: "Emotional Intelligence in Leadership - edX", level: 4 },
        { name: "Emotional Intelligence Fundamentals - Pluralsight", level: 3 }
      ],
    },
  },
  {
    id: "comp-17",
    name: "Perl",
    description: "Знание языка программирования Perl, включая регулярные выражения, ООП, CPAN и обработку данных",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовый синтаксис Perl, переменные, типы данных, операторы, базовые структуры данных, простые регулярные выражения",
      level2: "Работа с массивами и хешами, продвинутые регулярные выражения, функции, работа с файлами, базовое ООП, установка модулей CPAN",
      level3: "Продвинутые регулярные выражения, ссылки, пакеты и модули, обработка ошибок, ООП с Moose/Moo, работа с CPAN, парсинг JSON/XML/CSV",
      level4: "Объектно-ориентированное программирование, создание модулей CPAN, оптимизация кода, продвинутые паттерны, обработка больших объемов данных",
      level5: "Экспертные знания Perl, создание модулей CPAN, системное программирование, сложные парсеры, менторинг",
    },
    resources: {
      literature: [
        { name: "Learning Perl - Рэндал Шварц, Брайан Фой, Том Феникс", level: 1 },
        { name: "Intermediate Perl - Рэндал Шварц, Брайан Фой", level: 2 },
        { name: "Programming Perl - Ларри Уолл, Том Кристиансен, Джон Орвант", level: 3 },
        { name: "Mastering Regular Expressions - Джеффри Фридл", level: 3 },
        { name: "Effective Perl Programming - Джозеф Холл", level: 4 },
        { name: "Perl Best Practices - Дэмиан Конуэй", level: 4 },
        { name: "Data Munging with Perl - Дэвид Кросс", level: 3 }
      ],
      videos: [
        { name: "Perl Tutorial for Beginners - ProgrammingKnowledge", level: 1 },
        { name: "Perl Programming - Derek Banas", level: 2 },
        { name: "Perl Regular Expressions Tutorial - Tutorial", level: 2 },
        { name: "Advanced Perl Programming - O'Reilly", level: 3 },
        { name: "Perl Object-Oriented Programming - Tutorial", level: 3 },
        { name: "Creating Perl Modules - YouTube", level: 3 },
        { name: "JSON Parsing in Perl - YouTube", level: 2 }
      ],
      courses: [
        { name: "Perl для начинающих - Stepik", level: 1 },
        { name: "Learn Perl - Codecademy", level: 2 },
        { name: "Perl Programming - Udemy", level: 2 },
        { name: "Регулярные выражения в Perl - Stepik", level: 2 },
        { name: "Advanced Perl Programming - Pluralsight", level: 4 },
        { name: "Mastering Perl - O'Reilly", level: 5 }
      ],
    },
  },
  {
    id: "comp-18",
    name: "Веб-разработка на Perl",
    description: "Создание веб-приложений на Perl, включая работу с базами данных",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовый CGI, обработка форм, простые веб-страницы, работа с HTTP, базовое подключение к БД",
      level2: "PSGI/Plack, базовые фреймворки (Dancer, Mojolicious), роутинг, шаблонизация, работа с DBI, INSERT/UPDATE/DELETE операции",
      level3: "RESTful API, аутентификация, сессии, работа с JSON/XML, middleware, транзакции, оптимизация запросов",
      level4: "Архитектура веб-приложений, масштабирование, кэширование, безопасность, продвинутые паттерны работы с БД, пулы соединений",
      level5: "Экспертные знания веб-фреймворков, создание собственных фреймворков, оптимизация, проектирование схем БД",
    },
    resources: {
      literature: [
        { name: "Mojolicious: Perl Web Framework - официальная документация", level: 2 },
        { name: "Dancer - официальная документация", level: 2 },
        { name: "PSGI/Plack - официальная документация", level: 3 },
        { name: "Programming the Perl DBI - Тим Банс, Аллардсейс", level: 3 },
        { name: "Web Development with Perl - Дэвид Кросс", level: 3 },
        { name: "Modern Perl Web Development - О'Рейли", level: 4 }
      ],
      videos: [
        { name: "Perl CGI Tutorial - Tutorial", level: 1 },
        { name: "Perl DBI Tutorial - Tutorial", level: 2 },
        { name: "Mojolicious Web Framework - Tutorial", level: 2 },
        { name: "Dancer Framework Tutorial - YouTube", level: 2 },
        { name: "PSGI/Plack Introduction - O'Reilly", level: 3 },
        { name: "Advanced Perl Web Development - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Веб-разработка на Perl - Stepik", level: 2 },
        { name: "Perl Web Development - Udemy", level: 2 },
        { name: "Perl DBI Programming - Udemy", level: 2 },
        { name: "Mojolicious Framework - Pluralsight", level: 3 },
        { name: "Advanced Perl Web Apps - O'Reilly", level: 4 }
      ],
    },
  },
  {
    id: "comp-19",
    name: "Тестирование в Perl",
    description: "Написание тестов для Perl приложений",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовое использование Test::More, простые unit-тесты, базовые утверждения",
      level2: "Моки и стабы, тестирование модулей, Test::Simple, организация тестов",
      level3: "Продвинутые тестовые фреймворки, интеграционные тесты, покрытие кода, TAP",
      level4: "Тестирование веб-приложений, тестирование БД, производительность тестов, CI/CD",
      level5: "Экспертные знания тестирования, построение тестовых стратегий, менторинг",
    },
    resources: {
      literature: [
        { name: "Test::More - официальная документация", level: 2 },
        { name: "Perl Testing: A Developer's Notebook - Ян Лэнгворти", level: 3 },
        { name: "Test::Class - официальная документация", level: 3 },
        { name: "Prove - официальная документация", level: 2 },
        { name: "Testing Perl Applications - O'Reilly", level: 4 }
      ],
      videos: [
        { name: "Perl Testing Tutorial - Tutorial", level: 2 },
        { name: "Test::More Introduction - YouTube", level: 2 },
        { name: "Advanced Perl Testing - O'Reilly", level: 3 },
        { name: "Perl Test Frameworks - Tutorial", level: 3 },
        { name: "Testing Best Practices in Perl - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Тестирование в Perl - Stepik", level: 2 },
        { name: "Perl Testing - Udemy", level: 2 },
        { name: "Advanced Perl Testing - Pluralsight", level: 3 },
        { name: "Perl Test Expert - O'Reilly", level: 4 },
        { name: "Testing Mastery in Perl - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-20",
    name: "Автотестирование",
    description: "Разработка и поддержка автоматизированных тестов для веб, мобильных и API приложений",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ автотестирования, написание простых unit-тестов, базовое использование фреймворков (JUnit, pytest, Jest)",
      level2: "Разработка автотестов для UI (Selenium, Cypress, Playwright), работа с Page Object Model, базовые паттерны тестирования",
      level3: "Создание комплексных тестовых фреймворков, интеграционные и E2E тесты, работа с CI/CD, моки и стабы",
      level4: "Проектирование тестовой архитектуры, оптимизация тестов, параллельное выполнение, создание тестовых библиотек",
      level5: "Экспертные знания в автотестировании, построение тестовых стратегий, менторинг, создание инструментов тестирования",
    },
    resources: {
      literature: [
        { name: "Selenium WebDriver 3 - Унни Кришнан", level: 2 },
        { name: "Test Driven Development - Кент Бек", level: 3 },
        { name: "The Art of Unit Testing - Рой Ошеров", level: 3 },
        { name: "Testing JavaScript Applications - Лукас да Коста", level: 4 },
        { name: "Growing Object-Oriented Software, Guided by Tests - Стив Фриман", level: 4 },
        { name: "Continuous Delivery - Джез Хамбл", level: 4 }
      ],
      videos: [
        { name: "Selenium Tutorial for Beginners - freeCodeCamp", level: 1 },
        { name: "Cypress Testing Tutorial - Traversy Media", level: 2 },
        { name: "Playwright Testing Tutorial - freeCodeCamp", level: 2 },
        { name: "Test Automation Framework - Udemy", level: 3 },
        { name: "Advanced Test Automation - Pluralsight", level: 4 }
      ],
      courses: [
        { name: "Автотестирование для начинающих - Stepik", level: 1 },
        { name: "Selenium WebDriver with Java - Udemy", level: 2 },
        { name: "Cypress End-to-End Testing - Udemy", level: 2 },
        { name: "Complete Test Automation Framework - Udemy", level: 3 },
        { name: "Advanced Test Automation Strategies - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-21",
    name: "Ручное тестирование",
    description: "Выполнение ручного тестирования, написание тест-кейсов, баг-репортов и тест-планов",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ тестирования, выполнение простых тест-кейсов, базовое описание багов",
      level2: "Написание тест-кейсов и чек-листов, работа с баг-трекерами (Jira, Redmine), тестирование функциональности",
      level3: "Создание тест-планов, тест-дизайн, тестирование API, работа с требованиями, регрессионное тестирование",
      level4: "Проектирование тестовых стратегий, управление тестированием, анализ рисков, оптимизация процессов тестирования",
      level5: "Экспертные знания в ручном тестировании, построение процессов тестирования, менторинг, управление командой тестировщиков",
    },
    resources: {
      literature: [
        { name: "Тестирование программного обеспечения - Сэм Канер", level: 2 },
        { name: "A Practitioner's Guide to Software Test Design - Ли Копланд", level: 3 },
        { name: "Lessons Learned in Software Testing - Канер, Бах, Петтиджон", level: 3 },
        { name: "Exploratory Software Testing - Джеймс Уиттакер", level: 4 },
        { name: "Testing Computer Software - Канер, Фолк, Нгуен", level: 4 }
      ],
      videos: [
        { name: "Software Testing Tutorial for Beginners - freeCodeCamp", level: 1 },
        { name: "Test Case Design Tutorial - YouTube", level: 2 },
        { name: "Bug Reporting Best Practices - Udemy", level: 2 },
        { name: "Advanced Manual Testing - Udemy", level: 3 },
        { name: "Test Management Strategies - Pluralsight", level: 4 }
      ],
      courses: [
        { name: "Основы тестирования ПО - Stepik", level: 1 },
        { name: "Manual Testing Complete Course - Udemy", level: 2 },
        { name: "Software Testing Fundamentals - Coursera", level: 2 },
        { name: "Advanced Software Testing - Udemy", level: 3 },
        { name: "Test Management and Leadership - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-22",
    name: "Нагрузочное тестирование",
    description: "Проведение нагрузочного и производительного тестирования, анализ производительности систем",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимание основ нагрузочного тестирования, базовое использование инструментов (JMeter, Gatling), простые сценарии",
      level2: "Создание нагрузочных сценариев, анализ метрик производительности, работа с отчетами, базовое профилирование",
      level3: "Проектирование комплексных нагрузочных тестов, анализ узких мест, оптимизация производительности, работа с распределенными системами",
      level4: "Проектирование стратегий нагрузочного тестирования, анализ архитектуры на производительность, создание инструментов тестирования",
      level5: "Экспертные знания в нагрузочном тестировании, построение процессов тестирования производительности, менторинг, управление командами",
    },
    resources: {
      literature: [
        { name: "Performance Testing Guidance for Web Applications - Microsoft", level: 2 },
        { name: "The Art of Application Performance Testing - Иэн Моли", level: 3 },
        { name: "Web Performance - Илья Григорик", level: 3 },
        { name: "High Performance Browser Networking - Илья Григорик", level: 4 },
        { name: "Systems Performance - Брендан Грегг", level: 5 }
      ],
      videos: [
        { name: "JMeter Tutorial for Beginners - freeCodeCamp", level: 1 },
        { name: "Load Testing with Gatling - YouTube", level: 2 },
        { name: "Performance Testing Tutorial - Udemy", level: 2 },
        { name: "Advanced Load Testing - Pluralsight", level: 3 },
        { name: "Performance Engineering - Udemy", level: 4 }
      ],
      courses: [
        { name: "Нагрузочное тестирование - Stepik", level: 1 },
        { name: "JMeter Complete Course - Udemy", level: 2 },
        { name: "Load Testing with Gatling - Udemy", level: 2 },
        { name: "Performance Testing and Optimization - Pluralsight", level: 3 },
        { name: "Advanced Performance Engineering - Udemy", level: 5 }
      ],
    },
  },
  {
    id: "comp-23",
    name: "Понимание бизнеса",
    description: "Способность понимать бизнес-контекст, рыночные тенденции и потребности клиентов",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимает основную деятельность организации, свою роль и место в структуре. Знает базовую информацию о продуктах и услугах компании. Следует установленным процедурам и правилам работы. Понимает, как его работа связана с общими целями организации",
      level2: "Понимает основные бизнес-процессы организации и взаимосвязи между подразделениями. Знает ключевых клиентов и партнеров компании. Понимает базовые финансовые показатели и их влияние на деятельность. Умеет определять приоритеты задач с учетом интересов бизнеса. Начинает видеть связи между своей работой и результатами организации",
      level3: "Демонстрирует базовое понимание тенденций рынка, динамики финансовой отрасли и то, чем организация отличается от других. Собирает информацию, чтобы быть в курсе изменений в макроэкономической среде и отрасли. Умеет управлять основными расходами в пределах своей зоны ответственности. Собирает релевантную информацию для выявления потребностей внутренних клиентов, умеет выслушать и понять их потребности и интересы. Регулярно запрашивает обратную связь от внутренних клиентов",
      level4: "Демонстрирует глубокое понимание рынка и его влияния на бизнес, понимает отраслевой контекст и вклад HR в уникальное торговое предложение организации. Обращается к различным источникам информации, чтобы быть в курсе изменений в макроэкономической среде и отрасли. Эффективно управляет основными расходами в пределах своей зоны ответственности. Понимает и предвосхищает потребности клиента, предлагает оптимальные решения, соответствующие их ожиданиям, и новые возможности для удовлетворения потребностей. Инициирует обратную связь от клиентов, предлагает улучшения по существующим процессам. Внедряет изменения HR практик для повышения их эффективности и ценности для внутренних клиентов. Использует ключевые показатели эффективности, метрики и обратную связь для демонстрации влияния HR процессов",
      level5: "Стратегически анализирует рыночные тенденции и их влияние на бизнес. Проактивно выявляет возможности для улучшения бизнес-процессов на основе глубокого понимания потребностей клиентов и рынка. Участвует в формировании стратегических приоритетов и делится экспертизой с коллегами",
    },
    resources: {
      literature: [
        { name: "Бизнес с нуля - Эрик Райс", level: 2 },
        { name: "Бизнес-моделирование - Александр Остервальдер", level: 3 },
        { name: "Стратегия голубого океана - Чан Ким, Рене Моборн", level: 4 },
        { name: "Good to Great - Джим Коллинз", level: 4 },
        { name: "Competitive Strategy - Майкл Портер", level: 5 }
      ],
      videos: [
        { name: "Business Fundamentals - Coursera", level: 1 },
        { name: "Understanding Business Models - TED", level: 2 },
        { name: "Strategic Thinking - Harvard Business Review", level: 3 },
        { name: "Market Analysis Techniques - LinkedIn Learning", level: 4 },
        { name: "Business Strategy Masterclass - Udemy", level: 5 }
      ],
      courses: [
        { name: "Основы бизнеса - Stepik", level: 1 },
        { name: "Business Fundamentals - Coursera", level: 2 },
        { name: "Strategic Business Analysis - Udemy", level: 3 },
        { name: "Advanced Business Strategy - Coursera", level: 4 },
        { name: "Executive Business Strategy - edX", level: 5 }
      ],
    },
  },
  {
    id: "comp-24",
    name: "Управление данными",
    description: "Способность работать с данными, анализировать информацию и принимать обоснованные решения",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимает базовые понятия работы с данными и информацией. Умеет находить нужную информацию в доступных источниках. Знает основные правила работы с конфиденциальной информацией. Следует инструкциям по обработке данных. Различает типы информации и их назначение",
      level2: "Умеет собирать и систематизировать простые данные для решения рабочих задач. Применяет базовые методы анализа информации. Использует стандартные инструменты для работы с данными. Понимает важность достоверности информации. Умеет представлять данные в простых форматах (таблицы, списки)",
      level3: "Оценивает и верифицирует входящую информацию, собирает и анализирует данные для принятия решений в рамках своей зоны ответственности. Основывает свои решения на объективных данных, перепроверяет исходную информацию. Знает и соблюдает внутренние политики и законодательные/нормативные требования к этичному использованию персональных данных",
      level4: "Основывает свои решения на объективных данных, перепроверяет исходную информацию. Применяет знание внутренних политик и законодательных/нормативных требований для этичного управления данными о сотрудниках и минимизации рисков. На основе разрозненной информации выделяет ключевые моменты и проблемы, требующие решений. Регулярно предоставляет аналитические данные и повышает значимость их критического использования для принятия решений в области работы с персоналом",
      level5: "Разрабатывает стратегии работы с данными и информацией для решения сложных бизнес-задач. Создает системы сбора и анализа данных, обучает коллег эффективным методам работы с информацией. Проактивно выявляет тренды и закономерности на основе комплексного анализа данных",
    },
    resources: {
      literature: [
        { name: "Данные и аналитика - Томас Дэвенпорт", level: 2 },
        { name: "Большие данные - Виктор Майер-Шенбергер", level: 3 },
        { name: "Data Science для бизнеса - Фостер Проваст", level: 3 },
        { name: "Thinking with Data - Макс Шрон", level: 4 },
        { name: "Data Strategy - Бернард Марр", level: 5 }
      ],
      videos: [
        { name: "Data Literacy Basics - YouTube", level: 1 },
        { name: "Understanding Data - Khan Academy", level: 2 },
        { name: "Data Analysis Fundamentals - freeCodeCamp", level: 3 },
        { name: "Advanced Data Analysis - Coursera", level: 4 },
        { name: "Data Strategy and Governance - LinkedIn Learning", level: 5 }
      ],
      courses: [
        { name: "Основы работы с данными - Stepik", level: 1 },
        { name: "Data Literacy - Coursera", level: 2 },
        { name: "Data Analysis and Visualization - Udemy", level: 3 },
        { name: "Advanced Data Analytics - Pluralsight", level: 4 },
        { name: "Data Strategy and Management - edX", level: 5 }
      ],
    },
  },
  {
    id: "comp-25",
    name: "Цифровая грамотность",
    description: "Способность эффективно использовать цифровые технологии и инструменты для решения бизнес-задач",
    type: "корпоративные компетенции",
    levels: {
      level1: "Владеет базовыми цифровыми инструментами для выполнения рабочих задач (офисные приложения, почта, мессенджеры). Понимает основы работы с компьютером и мобильными устройствами. Следует инструкциям по использованию корпоративных систем. Знает основные правила информационной безопасности. Умеет находить информацию в интернете",
      level2: "Эффективно использует стандартные цифровые инструменты для выполнения рабочих задач. Применяет базовые функции программ для повышения эффективности работы. Осваивает новые инструменты по инструкциям. Использует облачные сервисы для хранения и обмена информацией. Понимает возможности автоматизации простых задач",
      level3: "Демонстрирует осведомленность о технологических разработках в своей области деятельности. Демонстрирует базовые знания об использовании технологий для поддержки своих рабочих задач. Выявляет возможности для улучшения бизнес процессов в своем направлении деятельности. Использует цифровые инструменты и современные технологии для оптимизации рабочих процессов",
      level4: "Демонстрирует глубокое понимание современных HR технологий и способствует их внедрению в организации. Уверенно применяет цифровые инструменты и современные технологии для оптимизации процессов. Отслеживает тенденции в области современных HR технологий. Хорошо знает рынок поставщиков услуг современных HR технологий. Обладает базовыми знаниями в области внедрения HR технологий, легко ориентируется в новых подходах и практиках. Самостоятельно ищет и использует возможности для саморазвития в цифровой среде. Понимает, какие цифровые компетенции необходимо развивать команде. Поддерживает других в развитии их собственной цифровой компетентности",
      level5: "Проактивно внедряет инновационные цифровые решения для трансформации бизнес-процессов. Разрабатывает стратегии цифровизации в своем направлении, оценивает эффективность технологий и делится экспертизой. Выступает как внутренний консультант по цифровым технологиям",
    },
    resources: {
      literature: [
        { name: "Цифровая трансформация - Дэвид Роджерс", level: 2 },
        { name: "Цифровое превосходство - Томас Сибе", level: 3 },
        { name: "The Digital Transformation Playbook - Дэвид Роджерс", level: 4 },
        { name: "Leading Digital - Джордж Вестерман", level: 4 },
        { name: "The Technology Fallacy - Джеральд Кейн", level: 5 }
      ],
      videos: [
        { name: "Digital Tools for Beginners - YouTube", level: 1 },
        { name: "Digital Transformation Basics - TED", level: 2 },
        { name: "HR Technology Trends - LinkedIn Learning", level: 3 },
        { name: "Digital Innovation Strategies - Coursera", level: 4 },
        { name: "Digital Leadership - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Цифровая грамотность - Stepik", level: 1 },
        { name: "Digital Skills for Business - Coursera", level: 2 },
        { name: "HR Technology Implementation - Udemy", level: 3 },
        { name: "Digital Transformation Strategy - edX", level: 4 },
        { name: "Digital Innovation Leadership - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-26",
    name: "Человекоцентричность",
    description: "Способность действовать с учетом интересов людей, демонстрировать этичность и социальную ответственность",
    type: "корпоративные компетенции",
    levels: {
      level1: "Знает основные этические принципы и ценности организации. Следует корпоративным стандартам поведения. Проявляет вежливость и уважение в общении с коллегами. Понимает важность конфиденциальности информации. Соблюдает правила профессиональной этики в повседневной работе",
      level2: "Последовательно следует этическим принципам в повседневной работе. Проявляет уважение и внимание к коллегам, учитывает их мнение. Готов помочь коллегам в рамках своих возможностей. Демонстрирует честность и открытость в коммуникации. Понимает влияние своих действий на других людей и организацию",
      level3: "Демонстрирует следование этическим принципам и ценностям Банка. Руководствуется в своих действиях ответственностью перед обществом и окружающей средой. Предлагает и оказывает помощь и поддержку коллегам, другим подразделениям. Проявляет уважение и терпимость к чужому мнению, стремится понять точку зрения других, выстраивает доверительные партнерские отношения с коллегами и заказчиками",
      level4: "Действует в соответствии с этическими принципами и ценностями, принятыми в Банке, поддерживает аналогичное поведение в команде. Поддерживает в команде культуру ответственности перед обществом и окружающей средой. Создает условия для создания среды заботы о сотрудниках, внедряет новые HR инструменты, способствующие развитию потенциала и благополучию сотрудников, в рамках своего направления. Уравновешивает потребности разных сторон и эффективно управляет конфликтами. Создает доброжелательную и доверительную атмосферу сотрудничества. Проявляет открытость и честность в отношениях, оказывает поддержку и помощь коллегам и заказчикам. Выявляет нормативные риски, связанные с управлением персоналом, помогает их минимизировать",
      level5: "Формирует культуру человекоцентричности в организации, выступает как пример для других. Разрабатывает и внедряет инициативы, направленные на благополучие сотрудников и социальную ответственность. Менторит коллег в вопросах этики и человекоцентричного подхода",
    },
    resources: {
      literature: [
        { name: "Этика бизнеса - Питер Друкер", level: 2 },
        { name: "Доверие - Стивен Кови", level: 3 },
        { name: "Give and Take - Адам Грант", level: 3 },
        { name: "The Culture Code - Дэниел Койл", level: 4 },
        { name: "Dare to Lead - Брене Браун", level: 5 }
      ],
      videos: [
        { name: "Ethics in the Workplace - YouTube", level: 1 },
        { name: "Building Trust - TED", level: 2 },
        { name: "People-Centric Leadership - Harvard Business Review", level: 3 },
        { name: "Inclusive Workplace Culture - LinkedIn Learning", level: 4 },
        { name: "Social Responsibility in Business - Coursera", level: 5 }
      ],
      courses: [
        { name: "Этика и ценности - Stepik", level: 1 },
        { name: "Workplace Ethics - Coursera", level: 2 },
        { name: "Building Trust and Relationships - Udemy", level: 3 },
        { name: "Inclusive Leadership - edX", level: 4 },
        { name: "Corporate Social Responsibility - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-27",
    name: "Управление системами и задачами",
    description: "Способность эффективно планировать, организовывать и контролировать выполнение задач и проектов",
    type: "корпоративные компетенции",
    levels: {
      level1: "Планирует выполнение простых задач на день. Следует установленным процедурам и инструкциям. Выполняет задачи последовательно, одну за другой. Отслеживает выполнение задач в простых форматах (списки, заметки). Информирует о проблемах и задержках в выполнении задач",
      level2: "Эффективно управляет несколькими задачами одновременно, соблюдает установленные дедлайны. Использует базовые инструменты планирования (календари, трекеры задач). Правильно расставляет приоритеты задач. Контролирует выполнение задач и своевременно информирует о статусе. Адаптирует план при изменении приоритетов",
      level3: "Оперативно реагирует на изменение условий, корректирует ход выполнения задач, использует разные виды контроля (промежуточный/итоговый). Эффективно использует ресурсы для выполнения задачи. Оптимально планирует свою деятельность, соотносит долгосрочные и краткосрочные задачи. Не снижает качества выполнения задач, работая параллельно с несколькими из них",
      level4: "Оперативно реагирует на изменение условий, корректирует ход выполнения задач, использует разные виды контроля (промежуточный/итоговый). Эффективно использует ресурсы для выполнения задачи. Оптимально планирует деятельность и обеспечивает ресурсами команду для выполнения поставленных задач. Обеспечивает соблюдение сроков выполнения поставленных задач и поручений. Оперативно реагирует на проблемы, связанные с нестандартными ситуациями. Каскадирует цели сотрудникам, четко формулирует задачи и критерии качественного результата, оперативно информирует об изменениях. Четко формулирует суть и последствия проблемы. Координирует работу команды со смежными подразделениями в части общих целей, процессов и ресурсов. Хорошо ориентируется в принципах проектного управления и методологии гибких подходов. Использует в работе инструменты Agile-методологии (Scrum, Kanban и т.д.). Отслеживает лучшие практики, находит инновационные, прорывные решения для внедрения в рамках своего направления. Активно участвует во всех этапах инновационного цикла: от поиска и предложения инноваций до их внедрения. Вовлекает команду в работу с инновационными решениями",
      level5: "Разрабатывает и внедряет системы управления задачами и проектами. Создает методологии работы для команды, обучает коллег эффективным подходам к управлению задачами. Стратегически планирует и оптимизирует процессы на организационном уровне",
    },
    resources: {
      literature: [
        { name: "Как привести дела в порядок - Дэвид Аллен", level: 2 },
        { name: "Scrum: гибкая разработка - Джефф Сазерленд", level: 3 },
        { name: "Project Management Body of Knowledge (PMBOK)", level: 3 },
        { name: "The Lean Startup - Эрик Райс", level: 4 },
        { name: "Critical Chain - Элияху Голдратт", level: 5 }
      ],
      videos: [
        { name: "Task Management Basics - YouTube", level: 1 },
        { name: "Getting Things Done - Дэвид Аллен", level: 2 },
        { name: "Project Management Fundamentals - Coursera", level: 3 },
        { name: "Agile Project Management - LinkedIn Learning", level: 4 },
        { name: "Strategic Project Management - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Управление задачами - Stepik", level: 1 },
        { name: "Task and Time Management - Coursera", level: 2 },
        { name: "Project Management Essentials - Udemy", level: 3 },
        { name: "Advanced Project Management - edX", level: 4 },
        { name: "Strategic Program Management - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-28",
    name: "Профессионализм",
    description: "Способность демонстрировать высокий уровень экспертизы, постоянно развиваться и делиться знаниями",
    type: "корпоративные компетенции",
    levels: {
      level1: "Владеет базовыми профессиональными навыками, необходимыми для выполнения стандартных задач в своей области. Следует установленным процедурам и инструкциям. Выполняет задачи под руководством более опытных коллег. Понимает основы своей профессии и стремится к обучению. Задает вопросы для уточнения требований к работе",
      level2: "Хорошо знает основные инструменты и методы работы в своей области. Способен самостоятельно выполнять стандартные задачи без постоянного контроля. Применяет полученные знания на практике. Активно обучается новым навыкам и инструментам. Начинает видеть связи между различными аспектами своей работы",
      level3: "Обладает глубокой экспертизой в своей сфере деятельности. Быстро и самостоятельно обучается, постоянно пополняет базу своих профессиональных знаний, использует их в работе. Ценит возможность решения новых, более сложных задач. Способен самостоятельно решать возникающие на его уровне проблемы. Запрашивает и анализирует обратную связь от других, находит проблемные зоны, ищет возможности для дальнейшего развития",
      level4: "Делится с коллегами экспертизой, консультирует, воспринимается как профессионал. Поддерживает высокую эффективность своей работы в ситуации постоянных изменений. Может находить решения и действовать в условиях неопределенности",
      level5: "Признанный эксперт в своей области, к которому обращаются за консультациями коллеги и руководство. Разрабатывает методологии и стандарты работы, менторит других специалистов. Создает инновационные решения для сложных профессиональных задач и делится знаниями на уровне организации",
    },
    resources: {
      literature: [
        { name: "Мастерство - Роберт Грин", level: 2 },
        { name: "Пик: секреты новой науки экспертизы - Андерс Эрикссон", level: 3 },
        { name: "Экспертность: как стать лучшим в своем деле - Роберт Грин", level: 3 },
        { name: "The Expert's Mind - Гэри Кляйн", level: 4 },
        { name: "Range: Why Generalists Triumph - Дэвид Эпштейн", level: 5 }
      ],
      videos: [
        { name: "Professional Development Basics - YouTube", level: 1 },
        { name: "Becoming an Expert - TED", level: 2 },
        { name: "Continuous Learning Strategies - LinkedIn Learning", level: 3 },
        { name: "Expert Thinking - Harvard Business Review", level: 4 },
        { name: "Mastery and Mentorship - Coursera", level: 5 }
      ],
      courses: [
        { name: "Профессиональное развитие - Stepik", level: 1 },
        { name: "Professional Skills Development - Coursera", level: 2 },
        { name: "Becoming a Subject Matter Expert - Udemy", level: 3 },
        { name: "Expert Knowledge Management - edX", level: 4 },
        { name: "Mastery and Leadership - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-29",
    name: "Ответственность",
    description: "Способность принимать ответственность за результаты, соблюдать договоренности и обеспечивать высокое качество работы",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимает свою ответственность за выполнение поставленных задач. Следует инструкциям и установленным процедурам. Выполняет задачи в установленные сроки. Информирует о проблемах, возникающих при выполнении задач. Принимает обратную связь и вносит необходимые корректировки",
      level2: "Надежно выполняет задачи в срок, следует инструкциям и процедурам. Придерживается договоренностей с коллегами и руководителями. Правильно понимает требования к задачам и уточняет их при необходимости. Отслеживает выполнение своих обязательств. Начинает проявлять инициативу в рамках своей зоны ответственности",
      level3: "Принимает ответственность за достижение результатов. Преодолевает препятствия, не боится трудностей. Придерживается договоренностей. Соблюдает сроки. Правильно расставляет приоритеты, учитывая важность и срочность задач. Воспринимается как надежный коллега/сотрудник, на которого можно положиться",
      level4: "Для достижения необходимого результата готов взять на себя дополнительные задачи, даже если они не входят в зону ответственности. Ориентируется на высокое качество выполнения задачи. Старается минимизировать возможные ошибки и риски, принимает взвешенные решения, стараясь предупредить возникновение проблем в будущем. Самостоятельно отслеживает результаты и качество своей работы",
      level5: "Берет на себя ответственность за стратегические результаты и сложные проекты. Создает системы контроля качества и управления рисками. Менторит коллег в вопросах ответственности и надежности. Проактивно предотвращает проблемы и формирует культуру ответственности в команде",
    },
    resources: {
      literature: [
        { name: "Ответственность и надежность - Стивен Кови", level: 2 },
        { name: "Extreme Ownership - Джоко Уиллинк", level: 3 },
        { name: "The Oz Principle - Роджер Коннорс", level: 3 },
        { name: "Accountability: The Key to Driving a High-Performance Culture - Грег Барман", level: 4 },
        { name: "The Responsibility Virus - Роджер Мартин", level: 5 }
      ],
      videos: [
        { name: "Taking Responsibility - YouTube", level: 1 },
        { name: "Accountability in the Workplace - TED", level: 2 },
        { name: "Ownership and Responsibility - LinkedIn Learning", level: 3 },
        { name: "Building Accountability Culture - Harvard Business Review", level: 4 },
        { name: "Strategic Responsibility Leadership - Coursera", level: 5 }
      ],
      courses: [
        { name: "Ответственность на работе - Stepik", level: 1 },
        { name: "Workplace Accountability - Coursera", level: 2 },
        { name: "Taking Ownership - Udemy", level: 3 },
        { name: "Accountability and Performance - edX", level: 4 },
        { name: "Responsibility Leadership - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-30",
    name: "Знание продуктов и услуг Банка",
    description: "Глубокое понимание продуктовой линейки банка, условий предоставления услуг и особенностей работы с клиентами",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знает основные продукты и услуги банка, их базовые характеристики. Понимает общую структуру продуктовой линейки. Может ответить на простые вопросы о продуктах",
      level2: "Хорошо знает основные продукты и услуги, их условия и особенности. Понимает различия между похожими продуктами. Может объяснить базовые условия предоставления услуг",
      level3: "Обладает глубокими знаниями продуктов и услуг банка, соответствующих своей области работы. Знает условия предоставления, тарифы, ограничения. Может консультировать по продуктам и использовать эти знания в обучении сотрудников",
      level4: "Экспертно знает всю продуктовую линейку банка, включая новые и специальные продукты. Понимает бизнес-логику продуктов, их взаимосвязи. Использует глубокие знания продуктов для разработки обучающих программ и консультирования",
      level5: "Признанный эксперт по продуктам банка. Знает историю развития продуктов, их эволюцию, конкурентные преимущества. Участвует в разработке новых продуктов, делится экспертизой на уровне организации. Создает методологии обучения по продуктам",
    },
    resources: {
      literature: [
        { name: "Банковские продукты и услуги - учебное пособие", level: 2 },
        { name: "Розничный банковский бизнес - Дмитрий Орлов", level: 3 },
        { name: "Банковские операции - Ольга Лаврушин", level: 3 },
        { name: "Product Management для банков - практическое руководство", level: 4 },
        { name: "Стратегия банковских продуктов - Майкл Портер", level: 5 }
      ],
      videos: [
        { name: "Основы банковских продуктов - YouTube", level: 1 },
        { name: "Банковские услуги для клиентов - образовательный канал", level: 2 },
        { name: "Анализ банковских продуктов - Coursera", level: 3 },
        { name: "Управление продуктовой линейкой - LinkedIn Learning", level: 4 },
        { name: "Стратегия развития продуктов - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Банковские продукты и услуги - Stepik", level: 1 },
        { name: "Основы банковского дела - Coursera", level: 2 },
        { name: "Банковские операции и продукты - Udemy", level: 3 },
        { name: "Product Management в банках - edX", level: 4 },
        { name: "Стратегическое управление продуктами - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-31",
    name: "Знание инструментов и методов оценки знаний и компетенций",
    description: "Владение различными инструментами и методиками для оценки уровня знаний, навыков и компетенций сотрудников",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знает базовые методы оценки знаний (тестирование, опросы). Понимает важность оценки эффективности обучения. Следует установленным процедурам оценки",
      level2: "Применяет стандартные инструменты оценки знаний и навыков. Умеет создавать простые тесты и опросники. Анализирует результаты базовых оценок",
      level3: "Знает различные инструменты и методы оценки знаний и компетенций. Применяет комплексные подходы к оценке (тесты, практические задания, наблюдение). Анализирует результаты оценки и использует их для улучшения обучения",
      level4: "Владеет широким спектром инструментов и методов оценки (360-градусная оценка, кейсы, симуляции, самооценка). Разрабатывает кастомные инструменты оценки под конкретные задачи. Использует результаты оценки для формирования индивидуальных планов развития",
      level5: "Эксперт в области оценки компетенций. Разрабатывает методологии и системы оценки для организации. Обучает других тренеров использованию инструментов оценки. Создает инновационные подходы к оценке эффективности обучения и развития",
    },
    resources: {
      literature: [
        { name: "Оценка персонала - Игорь Бархатов", level: 2 },
        { name: "Методы оценки компетенций - практическое руководство", level: 3 },
        { name: "360-градусная оценка - Дэвид Уолдман", level: 3 },
        { name: "Assessment Centers - практическое руководство", level: 4 },
        { name: "Стратегическая оценка талантов - Дэйв Ульрих", level: 5 }
      ],
      videos: [
        { name: "Основы оценки персонала - YouTube", level: 1 },
        { name: "Методы оценки компетенций - образовательный канал", level: 2 },
        { name: "Оценка эффективности обучения - Coursera", level: 3 },
        { name: "360-градусная оценка - LinkedIn Learning", level: 4 },
        { name: "Системы оценки талантов - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Оценка персонала - Stepik", level: 1 },
        { name: "Методы оценки компетенций - Coursera", level: 2 },
        { name: "Оценка эффективности обучения - Udemy", level: 3 },
        { name: "Assessment Center - edX", level: 4 },
        { name: "Стратегическая оценка талантов - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-32",
    name: "Навык публичных выступлений",
    description: "Способность эффективно проводить презентации, обучающие сессии и публичные выступления перед различной аудиторией",
    type: "профессиональные компетенции",
    levels: {
      level1: "Может провести простую презентацию перед небольшой группой. Использует базовые навыки публичного выступления. Следует подготовленному сценарию",
      level2: "Проводит презентации и обучающие сессии для групп среднего размера. Использует визуальные материалы и интерактивные элементы. Управляет временем выступления",
      level3: "Эффективно проводит публичные выступления и обучающие сессии для различных аудиторий. Владеет техниками привлечения внимания и удержания интереса аудитории. Адаптирует стиль выступления под аудиторию. Использует интерактивные методы работы с группой",
      level4: "Профессионально проводит сложные презентации и обучающие программы для больших аудиторий. Владеет продвинутыми техниками публичных выступлений. Управляет динамикой группы, разрешает конфликтные ситуации. Создает запоминающиеся и эффективные презентации",
      level5: "Признанный мастер публичных выступлений. Проводит ключевые презентации на корпоративном уровне. Разрабатывает методологии проведения обучающих сессий. Менторит других тренеров в области публичных выступлений. Создает инновационные форматы презентаций и обучения",
    },
    resources: {
      literature: [
        { name: "Искусство публичных выступлений - Дейл Карнеги", level: 2 },
        { name: "Презентации в стиле TED - Кармин Галло", level: 3 },
        { name: "Говори как Тед - Кармин Галло", level: 3 },
        { name: "Презентация: секреты успеха - Алексей Каптерев", level: 4 },
        { name: "Мастерство презентации - Нэнси Дуарте", level: 5 }
      ],
      videos: [
        { name: "Основы публичных выступлений - YouTube", level: 1 },
        { name: "Как проводить презентации - TED", level: 2 },
        { name: "Публичные выступления для тренеров - Coursera", level: 3 },
        { name: "Мастерство презентаций - LinkedIn Learning", level: 4 },
        { name: "Экспертные техники выступлений - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Публичные выступления - Stepik", level: 1 },
        { name: "Искусство презентации - Coursera", level: 2 },
        { name: "Проведение обучающих сессий - Udemy", level: 3 },
        { name: "Мастерство публичных выступлений - edX", level: 4 },
        { name: "Экспертные техники презентаций - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-33",
    name: "Знание показателей бизнеса и навык анализа показателей",
    description: "Понимание ключевых бизнес-показателей колл-центра (CSI, SL, AHT, FCR, LCR, CL, Конвертация) и умение анализировать их для улучшения работы",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знает основные показатели работы колл-центра. Понимает их базовое значение. Следует инструкциям по работе с показателями",
      level2: "Понимает основные бизнес-показатели и их взаимосвязи. Умеет читать базовые отчеты. Видит связь между показателями и результатами работы",
      level3: "Знает ключевые показатели бизнеса (CSI, SL, AHT, FCR, LCR, CL, Конвертация) и понимает их влияние на результаты. Анализирует показатели для выявления проблемных зон. Использует данные показателей в обучении сотрудников",
      level4: "Глубоко понимает все бизнес-показатели и их взаимосвязи. Проводит комплексный анализ показателей для выявления причин проблем. Разрабатывает рекомендации по улучшению показателей на основе анализа. Использует аналитику для формирования программ обучения",
      level5: "Эксперт в области анализа бизнес-показателей. Разрабатывает методологии анализа и прогнозирования показателей. Создает системы мониторинга и отчетности. Участвует в формировании целевых показателей. Обучает других специалистов работе с показателями",
    },
    resources: {
      literature: [
        { name: "KPI и показатели эффективности - Дэвид Парментер", level: 2 },
        { name: "Аналитика в колл-центре - практическое руководство", level: 3 },
        { name: "Управление по показателям - Бернард Марр", level: 3 },
        { name: "Бизнес-аналитика - Томас Дэвенпорт", level: 4 },
        { name: "Стратегическая аналитика - Дэвид Симчи-Леви", level: 5 }
      ],
      videos: [
        { name: "Основы работы с показателями - YouTube", level: 1 },
        { name: "KPI колл-центра - образовательный канал", level: 2 },
        { name: "Анализ бизнес-показателей - Coursera", level: 3 },
        { name: "Бизнес-аналитика - LinkedIn Learning", level: 4 },
        { name: "Стратегическая аналитика - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Работа с показателями - Stepik", level: 1 },
        { name: "KPI и метрики - Coursera", level: 2 },
        { name: "Анализ показателей колл-центра - Udemy", level: 3 },
        { name: "Бизнес-аналитика - edX", level: 4 },
        { name: "Стратегическая аналитика - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-34",
    name: "Понимание принципа обучения взрослых",
    description: "Знание особенностей и принципов обучения взрослых людей (андрагогика) и применение их в разработке и проведении обучающих программ",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает, что взрослые обучаются иначе, чем дети. Знает базовые принципы работы со взрослой аудиторией. Учитывает опыт обучающихся",
      level2: "Применяет основные принципы обучения взрослых в своей работе. Учитывает мотивацию и цели взрослых обучающихся. Использует практико-ориентированные подходы",
      level3: "Глубоко понимает принципы обучения взрослых (андрагогика). Применяет различные методы обучения с учетом особенностей взрослой аудитории. Учитывает опыт, мотивацию и индивидуальные особенности обучающихся. Создает практико-ориентированные программы обучения",
      level4: "Экспертно владеет принципами и методами обучения взрослых. Разрабатывает комплексные программы обучения на основе андрагогических принципов. Адаптирует методы обучения под различные типы взрослых обучающихся. Использует инновационные подходы к обучению взрослых",
      level5: "Признанный эксперт в области обучения взрослых. Разрабатывает методологии и стандарты обучения взрослых для организации. Проводит исследования эффективности различных методов. Менторит других тренеров в области андрагогики. Создает инновационные образовательные программы",
    },
    resources: {
      literature: [
        { name: "Обучение взрослых - Малкольм Ноулз", level: 2 },
        { name: "Андрагогика - основы обучения взрослых", level: 3 },
        { name: "Как обучать взрослых - Стивен Либерман", level: 3 },
        { name: "Методы обучения взрослых - практическое руководство", level: 4 },
        { name: "Современная андрагогика - Дэвид Колб", level: 5 }
      ],
      videos: [
        { name: "Основы обучения взрослых - YouTube", level: 1 },
        { name: "Принципы андрагогики - образовательный канал", level: 2 },
        { name: "Обучение взрослых - Coursera", level: 3 },
        { name: "Методы обучения взрослых - LinkedIn Learning", level: 4 },
        { name: "Современная андрагогика - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Обучение взрослых - Stepik", level: 1 },
        { name: "Андрагогика - Coursera", level: 2 },
        { name: "Методы обучения взрослых - Udemy", level: 3 },
        { name: "Современные подходы к обучению - edX", level: 4 },
        { name: "Экспертиза в обучении взрослых - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-35",
    name: "Навык работы в ПО банка",
    description: "Владение программным обеспечением банка, используемым в работе колл-центра, и умение обучать сотрудников работе с системами",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знает основные функции ПО банка, необходимые для выполнения рабочих задач. Следует инструкциям по работе с системами. Может выполнять стандартные операции",
      level2: "Хорошо владеет основными модулями ПО банка. Может работать с различными функциями систем. Помогает коллегам в решении простых вопросов по работе с ПО",
      level3: "Профессионально владеет ПО банка, используемым в колл-центре. Знает все основные функции и возможности систем. Может обучать сотрудников работе с ПО. Решает типовые проблемы при работе с системами",
      level4: "Экспертно владеет всеми модулями и функциями ПО банка. Знает скрытые возможности и продвинутые функции систем. Разрабатывает обучающие материалы по работе с ПО. Консультирует по сложным вопросам работы с системами. Участвует в тестировании новых версий ПО",
      level5: "Признанный эксперт по работе с ПО банка. Участвует в разработке требований к системам. Создает методологии обучения работе с ПО. Обучает других тренеров. Выступает как внутренний консультант по оптимизации работы с системами",
    },
    resources: {
      literature: [
        { name: "Работа с банковскими системами - руководство пользователя", level: 2 },
        { name: "Обучение работе с ПО - практическое руководство", level: 3 },
        { name: "Эффективная работа с системами - Дэвид Аллен", level: 3 },
        { name: "Оптимизация работы с ПО - методическое пособие", level: 4 },
        { name: "Системный анализ и проектирование - Ивар Якобсон", level: 5 }
      ],
      videos: [
        { name: "Основы работы с ПО - YouTube", level: 1 },
        { name: "Обучение работе с системами - образовательный канал", level: 2 },
        { name: "Работа с банковскими системами - Coursera", level: 3 },
        { name: "Оптимизация работы с ПО - LinkedIn Learning", level: 4 },
        { name: "Системный анализ - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Работа с ПО банка - Stepik", level: 1 },
        { name: "Банковские системы - Coursera", level: 2 },
        { name: "Обучение работе с ПО - Udemy", level: 3 },
        { name: "Оптимизация систем - edX", level: 4 },
        { name: "Системный анализ - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-36",
    name: "Навык снятия запроса у заказчика",
    description: "Умение выявлять и анализировать потребности заказчика в обучении, формулировать техническое задание на разработку обучающих программ",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает важность выявления потребностей заказчика. Может задать базовые вопросы для уточнения требований. Следует установленным процедурам снятия запроса",
      level2: "Умеет выявлять базовые потребности заказчика через вопросы и анализ ситуации. Может сформулировать простой запрос на обучение. Понимает связь между потребностями и решением",
      level3: "Эффективно выявляет потребности заказчика через структурированное интервью и анализ. Формулирует четкий запрос на обучение с указанием целей и ожидаемых результатов. Учитывает контекст и ограничения при снятии запроса",
      level4: "Профессионально проводит глубокий анализ потребностей заказчика, используя различные техники (интервью, наблюдение, анализ данных). Формулирует комплексный запрос с детальными требованиями. Предлагает оптимальные решения на основе выявленных потребностей",
      level5: "Эксперт в области выявления и анализа потребностей заказчика. Разрабатывает методологии снятия запроса. Обучает других тренеров техникам работы с заказчиками. Создает системы управления запросами. Участвует в стратегическом планировании обучения на основе анализа потребностей",
    },
    resources: {
      literature: [
        { name: "Выявление потребностей клиента - Нил Рэкхэм", level: 2 },
        { name: "SPIN-продажи - Нил Рэкхэм", level: 3 },
        { name: "Консультативные продажи - Майк Босворт", level: 3 },
        { name: "Анализ потребностей заказчика - практическое руководство", level: 4 },
        { name: "Стратегическое планирование обучения - Дэйв Ульрих", level: 5 }
      ],
      videos: [
        { name: "Основы работы с заказчиком - YouTube", level: 1 },
        { name: "Выявление потребностей - образовательный канал", level: 2 },
        { name: "Работа с заказчиками - Coursera", level: 3 },
        { name: "Консультативные техники - LinkedIn Learning", level: 4 },
        { name: "Стратегическое планирование - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Работа с заказчиком - Stepik", level: 1 },
        { name: "Выявление потребностей - Coursera", level: 2 },
        { name: "Снятие запроса - Udemy", level: 3 },
        { name: "Консультативные техники - edX", level: 4 },
        { name: "Стратегическое планирование обучения - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-37",
    name: "Умение сформировать трек развития сотрудника под профиль сотрудника",
    description: "Способность разрабатывать индивидуальные планы развития сотрудников на основе анализа их компетенций, профиля должности и карьерных целей",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает важность индивидуального подхода к развитию сотрудников. Знает базовые принципы формирования планов развития. Следует шаблонам планов развития",
      level2: "Умеет создавать простые планы развития на основе базового анализа компетенций. Учитывает основные потребности сотрудника в развитии. Использует стандартные форматы планов развития",
      level3: "Разрабатывает индивидуальные планы развития с учетом компетенций сотрудника и требований профиля. Анализирует разрывы в компетенциях. Формулирует конкретные цели развития и методы их достижения",
      level4: "Профессионально формирует комплексные треки развития с учетом профиля должности, текущих компетенций, карьерных целей и бизнес-потребностей. Использует различные методы развития. Отслеживает прогресс и корректирует планы. Учитывает индивидуальные особенности обучения",
      level5: "Эксперт в области разработки треков развития. Создает методологии формирования индивидуальных планов развития. Разрабатывает системы управления развитием сотрудников. Обучает других тренеров и HR-специалистов. Участвует в создании корпоративных программ развития талантов",
    },
    resources: {
      literature: [
        { name: "Развитие персонала - Дэйв Ульрих", level: 2 },
        { name: "Индивидуальные планы развития - практическое руководство", level: 3 },
        { name: "Управление талантами - Эдвард Лоулер", level: 3 },
        { name: "Карьерное планирование - Джеффри Сонненфельд", level: 4 },
        { name: "Стратегия развития талантов - Дэйв Ульрих", level: 5 }
      ],
      videos: [
        { name: "Основы развития персонала - YouTube", level: 1 },
        { name: "Планы развития сотрудников - образовательный канал", level: 2 },
        { name: "Разработка треков развития - Coursera", level: 3 },
        { name: "Управление развитием талантов - LinkedIn Learning", level: 4 },
        { name: "Стратегия развития талантов - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Развитие персонала - Stepik", level: 1 },
        { name: "Планы развития - Coursera", level: 2 },
        { name: "Треки развития сотрудников - Udemy", level: 3 },
        { name: "Управление талантами - edX", level: 4 },
        { name: "Стратегическое развитие талантов - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-36",
    name: "Грамотная письменная речь",
    description: "Способность грамотно излагать мысли в письменной форме, создавать понятные и структурированные документы",
    type: "профессиональные компетенции",
    levels: {
      level1: "Владеет основами грамматики и орфографии. Может написать простой текст без грубых ошибок. Следует базовым правилам оформления документов",
      level2: "Грамотно пишет тексты средней сложности. Использует правильную пунктуацию и стилистику. Создает структурированные документы (отчеты, письма, инструкции)",
      level3: "Создает грамотные, логично структурированные документы различной сложности. Использует профессиональную терминологию. Пишет понятные инструкции и методические материалы",
      level4: "Создает сложные профессиональные документы высокого качества. Владеет различными стилями письменной речи. Разрабатывает методологические материалы, стандарты и регламенты",
      level5: "Экспертный уровень письменной речи. Создает документы стратегического уровня. Редактирует и улучшает документы других авторов. Разрабатывает корпоративные стандарты документооборота",
    },
    resources: {
      literature: [
        { name: "Русский язык и культура речи - учебное пособие", level: 1 },
        { name: "Деловое письмо - практическое руководство", level: 2 },
        { name: "Стилистика русского языка - Д.Э. Розенталь", level: 3 },
        { name: "Профессиональное письмо - М.И. Студеникина", level: 4 },
        { name: "Искусство делового письма - Л.В. Щерба", level: 5 }
      ],
      videos: [
        { name: "Основы грамотности - YouTube", level: 1 },
        { name: "Деловое письмо - образовательный канал", level: 2 },
        { name: "Профессиональное письмо - Coursera", level: 3 },
        { name: "Стилистика и редактирование - LinkedIn Learning", level: 4 },
        { name: "Экспертное письмо - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Грамотность письма - Stepik", level: 1 },
        { name: "Деловое письмо - Coursera", level: 2 },
        { name: "Профессиональное письмо - Udemy", level: 3 },
        { name: "Редактирование текстов - edX", level: 4 },
        { name: "Экспертное письмо - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-37",
    name: "Грамотная устная речь",
    description: "Способность грамотно и понятно излагать мысли в устной форме, эффективно коммуницировать с различной аудиторией",
    type: "профессиональные компетенции",
    levels: {
      level1: "Говорит грамотно, без грубых ошибок. Может донести простую информацию до собеседника. Использует базовую профессиональную терминологию",
      level2: "Грамотно излагает мысли в устной форме. Эффективно общается в рабочих ситуациях. Использует правильную терминологию и структурирует речь",
      level3: "Владеет грамотной устной речью, использует профессиональную терминологию. Эффективно проводит презентации и совещания. Адаптирует стиль общения под аудиторию",
      level4: "Мастерски владеет устной речью. Проводит сложные презентации и переговоры. Использует различные техники убеждения и влияния. Обучает других навыкам коммуникации",
      level5: "Экспертный уровень устной речи. Выступает на конференциях и форумах. Ведет сложные переговоры стратегического уровня. Разрабатывает программы обучения коммуникативным навыкам",
    },
    resources: {
      literature: [
        { name: "Риторика - Аристотель", level: 2 },
        { name: "Искусство говорить и слушать - Мортимер Адлер", level: 3 },
        { name: "Как разговаривать с кем угодно - Марк Роудз", level: 3 },
        { name: "Мастерство публичных выступлений - Дейл Карнеги", level: 4 },
        { name: "Искусство убеждения - Роберт Чалдини", level: 5 }
      ],
      videos: [
        { name: "Основы устной речи - YouTube", level: 1 },
        { name: "Эффективная коммуникация - образовательный канал", level: 2 },
        { name: "Публичные выступления - Coursera", level: 3 },
        { name: "Мастерство переговоров - LinkedIn Learning", level: 4 },
        { name: "Экспертные выступления - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Устная речь - Stepik", level: 1 },
        { name: "Эффективная коммуникация - Coursera", level: 2 },
        { name: "Публичные выступления - Udemy", level: 3 },
        { name: "Мастерство переговоров - edX", level: 4 },
        { name: "Экспертная коммуникация - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-38",
    name: "Практический опыт в построении глоссариев данных",
    description: "Способность создавать и поддерживать глоссарии данных, обеспечивающие единообразие терминологии и понимание данных в организации",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает назначение глоссариев данных. Знает основные принципы их построения. Может использовать существующие глоссарии",
      level2: "Участвует в создании простых глоссариев данных под руководством. Понимает структуру и требования к глоссариям. Может поддерживать существующие глоссарии",
      level3: "Самостоятельно создает и поддерживает глоссарии данных для своего направления. Определяет термины, их определения и связи. Обеспечивает актуальность глоссариев",
      level4: "Разрабатывает комплексные глоссарии данных для нескольких направлений. Устанавливает стандарты и методологию построения глоссариев. Координирует работу по созданию глоссариев в команде",
      level5: "Эксперт в области построения глоссариев данных. Разрабатывает корпоративные стандарты и методологии. Обучает других специалистов. Создает интегрированные системы управления глоссариями данных",
    },
    resources: {
      literature: [
        { name: "Управление данными - Д. Лосман", level: 2 },
        { name: "Глоссарии данных - практическое руководство", level: 3 },
        { name: "Data Governance - практическое руководство", level: 4 },
        { name: "Стратегия управления данными - Д. Лосман", level: 5 }
      ],
      videos: [
        { name: "Основы глоссариев данных - YouTube", level: 1 },
        { name: "Построение глоссариев - образовательный канал", level: 2 },
        { name: "Управление глоссариями данных - Coursera", level: 3 },
        { name: "Data Governance - LinkedIn Learning", level: 4 },
        { name: "Стратегия управления данными - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Глоссарии данных - Stepik", level: 1 },
        { name: "Построение глоссариев - Coursera", level: 2 },
        { name: "Управление глоссариями - Udemy", level: 3 },
        { name: "Data Governance - edX", level: 4 },
        { name: "Стратегия управления данными - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-39",
    name: "Практический опыт в разработке ER-моделей (модель Сущность-Связь)",
    description: "Способность проектировать и разрабатывать ER-модели для представления структуры данных и их взаимосвязей",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает основы ER-моделирования. Знает основные элементы модели (сущности, атрибуты, связи). Может читать простые ER-диаграммы",
      level2: "Создает простые ER-модели под руководством. Понимает типы связей и их применение. Использует инструменты для создания ER-диаграмм",
      level3: "Самостоятельно разрабатывает ER-модели для бизнес-процессов. Правильно определяет сущности, атрибуты и связи. Создает нормализованные модели данных",
      level4: "Разрабатывает сложные ER-модели для комплексных систем. Оптимизирует модели с учетом производительности. Проводит ревью и улучшает модели других специалистов",
      level5: "Эксперт в области ER-моделирования. Разрабатывает методологии и стандарты моделирования. Проектирует архитектуру данных для крупных систем. Обучает других специалистов ER-моделированию",
    },
    resources: {
      literature: [
        { name: "Основы проектирования БД - Т. Коннолли", level: 2 },
        { name: "ER-моделирование - практическое руководство", level: 3 },
        { name: "Проектирование баз данных - К. Дейт", level: 3 },
        { name: "Продвинутое моделирование данных - С. Халпин", level: 4 },
        { name: "Архитектура данных - Д. Хейлсворт", level: 5 }
      ],
      videos: [
        { name: "Основы ER-моделирования - YouTube", level: 1 },
        { name: "ER-диаграммы - образовательный канал", level: 2 },
        { name: "Проектирование БД - Coursera", level: 3 },
        { name: "Продвинутое моделирование - LinkedIn Learning", level: 4 },
        { name: "Архитектура данных - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "ER-моделирование - Stepik", level: 1 },
        { name: "Проектирование БД - Coursera", level: 2 },
        { name: "ER-моделирование - Udemy", level: 3 },
        { name: "Продвинутое моделирование - edX", level: 4 },
        { name: "Архитектура данных - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-40",
    name: "Знание банковских процессов и терминологии",
    description: "Глубокое понимание банковских процессов, операций и профессиональной терминологии банковской сферы",
    type: "профессиональные компетенции",
    levels: {
      level1: "Знает основные банковские термины и понятия. Понимает базовые банковские операции. Следует установленным процедурам",
      level2: "Хорошо знает банковскую терминологию в своей области. Понимает основные банковские процессы. Может объяснить базовые операции",
      level3: "Обладает глубокими знаниями банковских процессов и терминологии в своей области. Понимает взаимосвязи между процессами. Использует профессиональную терминологию в работе",
      level4: "Экспертно знает банковские процессы и терминологию. Понимает бизнес-логику процессов, их взаимосвязи и влияние на деятельность банка. Консультирует других по банковским процессам",
      level5: "Признанный эксперт в области банковских процессов. Знает историю развития процессов, их эволюцию. Участвует в оптимизации и разработке новых процессов. Создает методологии описания банковских процессов",
    },
    resources: {
      literature: [
        { name: "Банковское дело - учебное пособие", level: 2 },
        { name: "Банковские операции - О. Лаврушин", level: 3 },
        { name: "Банковские процессы - практическое руководство", level: 3 },
        { name: "Управление банковскими процессами - Д. Орлов", level: 4 },
        { name: "Стратегия банковских процессов - М. Портер", level: 5 }
      ],
      videos: [
        { name: "Основы банковских процессов - YouTube", level: 1 },
        { name: "Банковская терминология - образовательный канал", level: 2 },
        { name: "Банковские операции - Coursera", level: 3 },
        { name: "Управление процессами - LinkedIn Learning", level: 4 },
        { name: "Стратегия процессов - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Банковские процессы - Stepik", level: 1 },
        { name: "Основы банковского дела - Coursera", level: 2 },
        { name: "Банковские операции - Udemy", level: 3 },
        { name: "Управление процессами - edX", level: 4 },
        { name: "Стратегия процессов - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-41",
    name: "Знание основ разработки баз данных, хранилищ данных",
    description: "Понимание принципов разработки баз данных и хранилищ данных, их архитектуры и методов проектирования",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает базовые понятия баз данных. Знает основные типы БД. Следует инструкциям по работе с БД",
      level2: "Знает основы проектирования БД. Понимает принципы нормализации. Может создавать простые структуры БД",
      level3: "Владеет принципами разработки БД и хранилищ данных. Проектирует структуры БД средней сложности. Понимает различия между OLTP и OLAP системами",
      level4: "Экспертно знает разработку БД и хранилищ данных. Проектирует сложные структуры данных. Оптимизирует производительность БД. Разрабатывает архитектуру хранилищ данных",
      level5: "Признанный эксперт в области разработки БД и хранилищ данных. Проектирует масштабируемые системы. Разрабатывает методологии и стандарты. Обучает других специалистов. Создает инновационные решения для хранения и обработки данных",
    },
    resources: {
      literature: [
        { name: "Основы баз данных - Т. Коннолли", level: 2 },
        { name: "Проектирование БД - К. Дейт", level: 3 },
        { name: "Хранилища данных - Р. Кимбалл", level: 3 },
        { name: "Продвинутое проектирование БД - С. Халпин", level: 4 },
        { name: "Архитектура хранилищ данных - Р. Кимбалл", level: 5 }
      ],
      videos: [
        { name: "Основы БД - YouTube", level: 1 },
        { name: "Проектирование БД - образовательный канал", level: 2 },
        { name: "Хранилища данных - Coursera", level: 3 },
        { name: "Продвинутое проектирование - LinkedIn Learning", level: 4 },
        { name: "Архитектура хранилищ - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы БД - Stepik", level: 1 },
        { name: "Проектирование БД - Coursera", level: 2 },
        { name: "Хранилища данных - Udemy", level: 3 },
        { name: "Продвинутое проектирование - edX", level: 4 },
        { name: "Архитектура хранилищ - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-42",
    name: "Практический опыт руководства сотрудниками нижнего звена без обособления в отдельное подразделение",
    description: "Способность эффективно руководить группой сотрудников, ставить задачи, контролировать исполнение и развивать подчиненных",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает основы управления людьми. Может давать простые инструкции. Следует установленным процедурам управления",
      level2: "Участвует в управлении небольшой группой под руководством. Ставит простые задачи. Отслеживает выполнение задач",
      level3: "Самостоятельно управляет небольшой группой сотрудников. Ставит задачи и контролирует их выполнение. Проводит регулярные встречи с командой",
      level4: "Эффективно руководит группой сотрудников нижнего звена. Ставит четкие задачи, контролирует исполнение, дает обратную связь. Развивает подчиненных. Управляет производительностью команды",
      level5: "Экспертно управляет несколькими группами сотрудников. Разрабатывает системы управления и контроля. Обучает других руководителей. Создает эффективные процессы управления командой",
    },
    resources: {
      literature: [
        { name: "Основы управления - учебное пособие", level: 2 },
        { name: "Управление командой - Д. Максвелл", level: 3 },
        { name: "Практика управления - П. Друкер", level: 3 },
        { name: "Эффективное руководство - С. Кови", level: 4 },
        { name: "Стратегия управления - М. Портер", level: 5 }
      ],
      videos: [
        { name: "Основы управления - YouTube", level: 1 },
        { name: "Управление командой - образовательный канал", level: 2 },
        { name: "Практика управления - Coursera", level: 3 },
        { name: "Эффективное руководство - LinkedIn Learning", level: 4 },
        { name: "Стратегия управления - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы управления - Stepik", level: 1 },
        { name: "Управление командой - Coursera", level: 2 },
        { name: "Практика управления - Udemy", level: 3 },
        { name: "Эффективное руководство - edX", level: 4 },
        { name: "Стратегия управления - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-43",
    name: "Практический опыт руководства проектами в роли Постановщик задач/Методолог/Бизнес-архитектор/Владелец-продукта/Руководитель проекта",
    description: "Способность эффективно управлять проектами в различных ролях, обеспечивая достижение целей проекта",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает основы управления проектами. Знает основные роли в проекте. Участвует в проектах как исполнитель",
      level2: "Участвует в управлении проектами под руководством. Выполняет отдельные задачи в рамках проекта. Понимает процессы управления проектами",
      level3: "Управляет небольшими проектами или частями крупных проектов. Выполняет роль координатора или помощника руководителя проекта. Применяет базовые методы управления проектами",
      level4: "Эффективно управляет проектами среднего масштаба. Выполняет роль постановщика задач, методолога или координатора. Планирует, контролирует и закрывает проекты",
      level5: "Экспертно управляет сложными проектами в роли постановщика задач, методолога, бизнес-архитектора, владельца продукта или руководителя проекта. Разрабатывает методологии управления проектами. Обучает других. Управляет портфелем проектов",
    },
    resources: {
      literature: [
        { name: "Основы управления проектами - PMBOK", level: 2 },
        { name: "Управление проектами - практическое руководство", level: 3 },
        { name: "Agile Project Management - Д. Сазерленд", level: 3 },
        { name: "Стратегическое управление проектами - М. Портер", level: 4 },
        { name: "Экспертное управление проектами - Д. Уилер", level: 5 }
      ],
      videos: [
        { name: "Основы проектов - YouTube", level: 1 },
        { name: "Управление проектами - образовательный канал", level: 2 },
        { name: "Agile проекты - Coursera", level: 3 },
        { name: "Стратегические проекты - LinkedIn Learning", level: 4 },
        { name: "Экспертные проекты - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы проектов - Stepik", level: 1 },
        { name: "Управление проектами - Coursera", level: 2 },
        { name: "Agile проекты - Udemy", level: 3 },
        { name: "Стратегические проекты - edX", level: 4 },
        { name: "Экспертные проекты - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-44",
    name: "Практический опыт руководства подразделениями среднего звена (отдел/группа/центр)",
    description: "Способность эффективно руководить подразделением среднего звена, обеспечивая достижение стратегических целей",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает структуру подразделений организации. Знает основные функции отделов. Участвует в работе подразделения",
      level2: "Понимает процессы управления подразделением. Участвует в планировании и контроле работы отдела. Выполняет функции заместителя руководителя",
      level3: "Управляет небольшим подразделением или частью крупного отдела. Планирует работу, распределяет задачи, контролирует выполнение. Участвует в стратегическом планировании",
      level4: "Эффективно руководит подразделением среднего звена. Разрабатывает стратегию развития отдела. Управляет ресурсами и бюджетом. Развивает команду и обеспечивает достижение целей",
      level5: "Экспертно руководит крупными подразделениями среднего звена. Разрабатывает стратегию на уровне организации. Управляет несколькими отделами или центрами. Создает эффективные системы управления. Обучает других руководителей",
    },
    resources: {
      literature: [
        { name: "Основы управления подразделениями - учебное пособие", level: 2 },
        { name: "Управление отделами - Д. Максвелл", level: 3 },
        { name: "Стратегия подразделений - М. Портер", level: 3 },
        { name: "Эффективное руководство подразделениями - С. Кови", level: 4 },
        { name: "Экспертное управление - Д. Уилер", level: 5 }
      ],
      videos: [
        { name: "Основы управления отделами - YouTube", level: 1 },
        { name: "Управление подразделениями - образовательный канал", level: 2 },
        { name: "Стратегия отделов - Coursera", level: 3 },
        { name: "Эффективное руководство - LinkedIn Learning", level: 4 },
        { name: "Экспертное управление - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы управления отделами - Stepik", level: 1 },
        { name: "Управление подразделениями - Coursera", level: 2 },
        { name: "Стратегия отделов - Udemy", level: 3 },
        { name: "Эффективное руководство - edX", level: 4 },
        { name: "Экспертное управление - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-45",
    name: "Участие и внимание к людям",
    description: "Способность проявлять заботу, внимание и участие к коллегам, подчиненным и другим людям в рабочей среде",
    type: "корпоративные компетенции",
    levels: {
      level1: "Понимает важность внимательного отношения к людям. Проявляет базовую вежливость и уважение в общении. Слушает других, когда к нему обращаются",
      level2: "Активно проявляет внимание к коллегам. Интересуется их делами и проблемами. Предлагает помощь, когда это уместно. Учитывает мнение других при принятии решений",
      level3: "Регулярно проявляет участие и заботу о коллегах. Создает атмосферу доверия и поддержки. Помогает другим в решении проблем. Учитывает эмоциональное состояние людей при общении",
      level4: "Систематически демонстрирует высокий уровень участия и внимания к людям. Развивает отношения, основанные на взаимном уважении. Создает поддерживающую рабочую среду. Менторствует и помогает в развитии других",
      level5: "Экспертно проявляет участие и внимание к людям на всех уровнях организации. Создает культуру заботы и взаимной поддержки. Разрабатывает программы развития команды. Является примером для других в проявлении человечности и эмпатии",
    },
    resources: {
      literature: [
        { name: "Эмоциональный интеллект - Дэниел Гоулман", level: 2 },
        { name: "7 навыков высокоэффективных людей - Стивен Кови", level: 3 },
        { name: "Как завоевывать друзей и оказывать влияние на людей - Дейл Карнеги", level: 2 },
        { name: "Эмпатия в бизнесе - Дэниел Пинк", level: 3 },
        { name: "Лидерство через заботу - Саймон Синек", level: 4 }
      ],
      videos: [
        { name: "Основы эмпатии в общении - YouTube", level: 1 },
        { name: "Эмоциональный интеллект на работе - Coursera", level: 2 },
        { name: "Умение слушать и понимать других - LinkedIn Learning", level: 3 },
        { name: "Создание поддерживающей среды - edX", level: 4 },
        { name: "Лидерство через заботу - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы межличностного общения - Stepik", level: 1 },
        { name: "Эмоциональный интеллект - Coursera", level: 2 },
        { name: "Эмпатия и участие в команде - Udemy", level: 3 },
        { name: "Создание культуры заботы - edX", level: 4 },
        { name: "Экспертное лидерство через внимание к людям - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-46",
    name: "Системный анализ",
    description: "Способность анализировать сложные системы, выявлять проблемы, проектировать решения и оптимизировать процессы",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает основы системного подхода. Знает основные понятия системного анализа. Может описать простую систему и её компоненты. Следует инструкциям по анализу систем",
      level2: "Умеет анализировать простые системы, выявлять основные компоненты и их взаимосвязи. Может описать процессы в системе. Применяет базовые методы системного анализа. Выявляет простые проблемы в системах",
      level3: "Проводит комплексный анализ систем средней сложности. Выявляет проблемы, узкие места и возможности для оптимизации. Проектирует решения для улучшения систем. Использует различные методы системного анализа. Документирует результаты анализа",
      level4: "Экспертно анализирует сложные системы и процессы. Проектирует комплексные решения для оптимизации систем. Разрабатывает архитектурные решения. Применяет продвинутые методы системного анализа. Создает методологии анализа систем",
      level5: "Признанный эксперт в области системного анализа. Разрабатывает стратегические решения для трансформации систем. Создает корпоративные методологии и стандарты. Менторит других аналитиков. Участвует в проектировании систем на уровне организации",
    },
    resources: {
      literature: [
        { name: "Системный анализ и проектирование - Ивар Якобсон", level: 3 },
        { name: "Системный анализ - С.В. Емельянов", level: 2 },
        { name: "Анализ систем - Джеральд Вайнберг", level: 3 },
        { name: "Системное мышление - Питер Сенге", level: 4 },
        { name: "Архитектура систем - Мартин Фаулер", level: 5 }
      ],
      videos: [
        { name: "Основы системного анализа - YouTube", level: 1 },
        { name: "Системный подход к решению задач - образовательный канал", level: 2 },
        { name: "Системный анализ - Coursera", level: 3 },
        { name: "Продвинутый системный анализ - LinkedIn Learning", level: 4 },
        { name: "Архитектура и проектирование систем - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы системного анализа - Stepik", level: 1 },
        { name: "Системный анализ - Coursera", level: 2 },
        { name: "Проектирование систем - Udemy", level: 3 },
        { name: "Архитектура систем - edX", level: 4 },
        { name: "Экспертный системный анализ - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-47",
    name: "Работа с требованиями",
    description: "Способность выявлять, анализировать, документировать и управлять требованиями к программным системам и бизнес-процессам",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает важность работы с требованиями. Знает базовые понятия (функциональные, нефункциональные требования). Может записать простые требования под руководством. Следует шаблонам документирования требований",
      level2: "Умеет выявлять и документировать базовые требования через интервью и анализ. Различает типы требований. Использует стандартные техники сбора требований. Создает простые спецификации требований. Отслеживает изменения требований",
      level3: "Эффективно выявляет и анализирует требования различной сложности. Применяет различные техники работы с требованиями (интервью, воркшопы, анализ документов). Создает детальные спецификации требований. Управляет приоритетами требований. Выявляет противоречия и неоднозначности",
      level4: "Профессионально управляет требованиями на всех этапах жизненного цикла проекта. Разрабатывает стратегии работы с требованиями. Применяет продвинутые техники (use cases, user stories, BPMN). Управляет изменениями требований и их влиянием. Валидирует требования с заинтересованными сторонами",
      level5: "Эксперт в области управления требованиями. Разрабатывает методологии и стандарты работы с требованиями для организации. Создает системы управления требованиями. Обучает других аналитиков. Участвует в стратегическом планировании на основе анализа требований",
    },
    resources: {
      literature: [
        { name: "Работа с требованиями - Карл Вигерс", level: 2 },
        { name: "Требования к программному обеспечению - Иан Соммервилл", level: 3 },
        { name: "User Stories Applied - Майк Кон", level: 3 },
        { name: "Mastering the Requirements Process - Сюзан и Джеймс Робертсон", level: 4 },
        { name: "Requirements Engineering - Клаус Поль", level: 5 }
      ],
      videos: [
        { name: "Основы работы с требованиями - YouTube", level: 1 },
        { name: "Сбор и анализ требований - образовательный канал", level: 2 },
        { name: "Работа с требованиями - Coursera", level: 3 },
        { name: "Управление требованиями - LinkedIn Learning", level: 4 },
        { name: "Экспертная работа с требованиями - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Работа с требованиями - Stepik", level: 1 },
        { name: "Сбор требований - Coursera", level: 2 },
        { name: "Анализ требований - Udemy", level: 3 },
        { name: "Управление требованиями - edX", level: 4 },
        { name: "Экспертная работа с требованиями - Pluralsight", level: 5 }
      ],
    },
  },
  {
    id: "comp-48",
    name: "UML и моделирование процессов",
    description: "Способность создавать модели систем и процессов с использованием UML, BPMN и других нотаций моделирования",
    type: "профессиональные компетенции",
    levels: {
      level1: "Понимает назначение моделирования. Знает основные понятия UML. Может читать простые диаграммы. Использует базовые инструменты моделирования под руководством",
      level2: "Создает простые UML-диаграммы (диаграммы классов, последовательности, вариантов использования). Понимает основные нотации моделирования. Использует стандартные инструменты моделирования. Моделирует простые бизнес-процессы",
      level3: "Создает комплексные модели систем с использованием различных типов UML-диаграмм. Моделирует бизнес-процессы с использованием BPMN. Применяет различные нотации моделирования. Использует модели для анализа и проектирования. Документирует модели",
      level4: "Экспертно создает сложные модели систем и процессов. Разрабатывает архитектурные модели. Применяет продвинутые техники моделирования. Использует модели для оптимизации процессов. Создает стандарты и методологии моделирования",
      level5: "Признанный эксперт в области моделирования. Разрабатывает корпоративные стандарты моделирования. Создает методологии и нотации. Обучает других аналитиков. Участвует в разработке инструментов моделирования",
    },
    resources: {
      literature: [
        { name: "UML и унифицированный процесс разработки - Гради Буч", level: 2 },
        { name: "UML 2.0 - Мартин Фаулер", level: 3 },
        { name: "BPMN 2.0 - Брюс Сильвер", level: 3 },
        { name: "Моделирование бизнес-процессов - Дмитрий Чирков", level: 4 },
        { name: "Архитектурное моделирование - Марк Ричардс", level: 5 }
      ],
      videos: [
        { name: "Основы UML - YouTube", level: 1 },
        { name: "UML для начинающих - образовательный канал", level: 2 },
        { name: "Моделирование процессов - Coursera", level: 3 },
        { name: "Продвинутое моделирование - LinkedIn Learning", level: 4 },
        { name: "Архитектурное моделирование - Harvard Business Review", level: 5 }
      ],
      courses: [
        { name: "Основы UML - Stepik", level: 1 },
        { name: "UML и моделирование - Coursera", level: 2 },
        { name: "BPMN и моделирование процессов - Udemy", level: 3 },
        { name: "Архитектурное моделирование - edX", level: 4 },
        { name: "Экспертное моделирование - Pluralsight", level: 5 }
      ],
    },
  },
];

const defaultProfiles: Profile[] = [
  {
    id: "profile-1",
    name: "Разработчик Perl",
    description: "Разработчик приложений на языке Perl",
    tfr: "разработчик",
    requiredCompetences: [], // Будет автоматически сформировано из levels
    levels: [
      {
        level: "trainee",
        name: "Стажер-разработчик Perl",
        description: "Стажер-разработчик Perl. Начальный уровень, изучение основ языка и инструментов разработки под руководством ментора.",
        responsibilities: [
          "Изучение основ синтаксиса Perl и базовых конструкций языка",
          "Выполнение простых задач по написанию скриптов под руководством",
          "Изучение работы с регулярными выражениями на базовом уровне",
          "Освоение работы с файлами и базовыми структурами данных",
          "Изучение основ работы с системой контроля версий (Git)",
          "Участие в код-ревью для изучения лучших практик",
          "Изучение основ тестирования и написание простых unit-тестов",
          "Работа с документацией и изучение существующего кода",
        ],
        education: "Среднее специальное или неоконченное высшее техническое образование",
        bankExperience: "Стаж работы в банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-17": 1, // Perl - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        taskExamples: [
          "Написать простой скрипт на Perl для подсчета количества строк в текстовом файле, используя базовые конструкции языка (переменные, циклы, работу с файлами)",
          "Создать скрипт для поиска и замены текста в файле с использованием простых регулярных выражений (например, замена email-адресов на маскированные версии)",
          "Написать простой unit-тест с использованием Test::More для функции, которая проверяет валидность формата даты (например, проверка формата DD.MM.YYYY)"
        ],
      },
      {
        level: "junior",
        name: "Младший разработчик Perl",
        description: "Младший разработчик Perl. Базовый уровень, способен выполнять задачи средней сложности под минимальным руководством.",
        responsibilities: [
          "Разработка простых скриптов и утилит на Perl",
          "Работа с регулярными выражениями для обработки текста",
          "Разработка простых веб-приложений с использованием PSGI/Plack",
          "Работа с базами данных через DBI (SELECT, INSERT, UPDATE, DELETE)",
          "Написание unit-тестов с использованием Test::More",
          "Исправление багов в существующем коде",
          "Участие в планировании задач и оценке времени",
          "Работа с модулями CPAN и их интеграция в проекты",
          "Парсинг JSON, XML, CSV файлов",
          "Участие в код-ревью и следование стандартам кодирования",
        ],
        education: "Высшее техническое образование (или неоконченное высшее)",
        bankExperience: "Опыт работы в банке от 6 месяцев до 1 года",
        externalExperience: "Опыт работы на внешнем рынке от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-17": 2, // Perl - базовый уровень
          "comp-18": 2, // Веб-разработка на Perl - базовый уровень
          "comp-19": 1, // Тестирование в Perl - начальный уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        taskExamples: [
          "Разработать утилиту на Perl для парсинга CSV-файла с данными пользователей, извлечения определенных полей (например, email и имя) и сохранения результатов в новый файл с использованием модулей CPAN (Text::CSV)",
          "Создать простое веб-приложение на PSGI/Plack с формой обратной связи, которая принимает данные пользователя (имя, email, сообщение) и сохраняет их в базу данных через DBI, включая базовую валидацию входных данных",
          "Исправить баг в существующем Perl-скрипте, который неправильно обрабатывает многострочный текст при использовании регулярных выражений, и написать unit-тесты с Test::More для проверки корректности исправления"
        ],
      },
      {
        level: "middle",
        name: "Разработчик Perl",
        description: "Разработчик Perl среднего уровня. Способен самостоятельно решать сложные задачи, проектировать модули и компоненты системы.",
        responsibilities: [
          "Разработка сложных модулей и компонентов на Perl",
          "Проектирование архитектуры отдельных частей системы",
          "Разработка RESTful API с использованием Mojolicious или Dancer",
          "Оптимизация производительности кода и запросов к БД",
          "Работа с асинхронным программированием (AnyEvent, Mojo::IOLoop)",
          "Создание и поддержка модулей CPAN",
          "Написание интеграционных тестов и организация тестового покрытия",
          "Рефакторинг legacy кода и улучшение его качества",
          "Менторинг junior разработчиков",
          "Участие в техническом планировании и архитектурных решениях",
          "Работа с системами очередей (RabbitMQ, Redis)",
          "Интеграция с внешними API и сервисами",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 1 до 3 лет",
        externalExperience: "Опыт работы на внешнем рынке от 1 до 3 лет",
        requiredSkills: {
          "comp-17": 3, // Perl - средний уровень
          "comp-18": 3, // Веб-разработка на Perl - средний уровень
          "comp-19": 2, // Тестирование в Perl - базовый уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        taskExamples: [
          "Спроектировать и реализовать RESTful API на Mojolicious для управления каталогом товаров с эндпоинтами для CRUD операций, включая аутентификацию через JWT, валидацию данных, работу с транзакциями БД и обработку ошибок",
          "Разработать модуль для обработки больших объемов данных из внешнего API (JSON), с использованием асинхронного программирования (Mojo::IOLoop), кэширования результатов в Redis и оптимизацией производительности запросов к БД",
          "Провести рефакторинг legacy Perl-кода, улучшив его архитектуру (разделение на модули, применение ООП с Moose), написать интеграционные тесты с покрытием критических сценариев и организовать тестовое покрытие с использованием TAP"
        ],
      },
      {
        level: "senior",
        name: "Старший разработчик Perl",
        description: "Старший разработчик Perl. Экспертный уровень, способен проектировать сложные системы, принимать архитектурные решения и руководить командой.",
        responsibilities: [
          "Проектирование архитектуры сложных распределенных систем",
          "Принятие ключевых технических решений и выбор технологий",
          "Разработка высоконагруженных веб-приложений и API",
          "Оптимизация производительности на уровне системы и БД",
          "Проектирование и реализация микросервисной архитектуры",
          "Создание технических стандартов и best practices для команды",
          "Проведение технических интервью и оценка кандидатов",
          "Менторинг middle и junior разработчиков",
          "Участие в стратегическом планировании продуктов",
          "Работа с legacy системами и их модернизация",
          "Внедрение CI/CD процессов и автоматизации",
          "Исследование новых технологий и их внедрение в проекты",
          "Работа с системами мониторинга и логирования",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 3 до 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 3 до 5 лет",
        requiredSkills: {
          "comp-17": 4, // Perl - продвинутый уровень
          "comp-18": 4, // Веб-разработка на Perl - продвинутый уровень
          "comp-19": 3, // Тестирование в Perl - средний уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        taskExamples: [
          "Спроектировать и реализовать архитектуру высоконагруженного микросервиса на Perl для обработки платежных транзакций с использованием очередей сообщений (RabbitMQ), репликацией БД, системой мониторинга и логирования, обеспечением отказоустойчивости и масштабируемости",
          "Оптимизировать производительность существующего веб-приложения на уровне системы (кэширование, пулы соединений БД, оптимизация запросов, профилирование кода) и БД (индексы, партиционирование, шардирование), внедрить CI/CD процессы для автоматизации развертывания",
          "Разработать технические стандарты и best practices для команды разработки, провести технический аудит legacy системы, создать план модернизации с оценкой рисков, провести менторинг middle разработчиков по архитектурным решениям"
        ],
      },
      {
        level: "lead",
        name: "Ведущий разработчик Perl",
        description: "Ведущий разработчик Perl. Экспертный уровень, отвечает за техническое направление, архитектуру систем и развитие команды разработки.",
        responsibilities: [
          "Определение технической стратегии и архитектурного видения",
          "Проектирование масштабируемых и отказоустойчивых систем",
          "Руководство командой разработчиков и распределение задач",
          "Принятие критических технических решений",
          "Разработка технических стандартов и процессов разработки",
          "Проведение технических аудитов и оценка качества кода",
          "Менторинг senior разработчиков и развитие экспертизы в команде",
          "Взаимодействие с бизнесом и стейкхолдерами по техническим вопросам",
          "Планирование технического долга и его устранение",
          "Исследование и внедрение инновационных решений",
          "Участие в конференциях и развитие профессионального сообщества",
          "Создание и поддержка open-source проектов",
          "Управление техническими рисками и их митигация",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 5 лет",
        requiredSkills: {
          "comp-17": 5, // Perl - экспертный уровень
          "comp-18": 5, // Веб-разработка на Perl - экспертный уровень
          "comp-19": 4, // Тестирование в Perl - продвинутый уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        taskExamples: [
          "Определить техническую стратегию и архитектурное видение для масштабируемой распределенной системы обработки данных на Perl, спроектировать отказоустойчивую архитектуру с учетом требований к производительности, безопасности и масштабируемости, принять критическое решение по выбору технологического стека",
          "Руководить командой разработчиков при реализации крупного проекта миграции legacy системы на современную микросервисную архитектуру, распределить задачи между senior и middle разработчиками, провести технические аудиты качества кода, управлять техническими рисками и их митигацией",
          "Создать и опубликовать open-source модуль CPAN для решения сложной задачи системного программирования, провести исследование и внедрение инновационных решений в проекты компании, выступить на конференции с докладом о лучших практиках разработки на Perl, развивать профессиональное сообщество"
        ],
      },
    ],
    experts: [
      {
        fullName: "Глебкин Роман Игоревич",
        position: "Исполнительный директор по разработке",
      },
    ],
  },
  {
    id: "profile-2",
    name: "Инженер по автотестированию",
    description: "Специалист по разработке и поддержке автоматизированных тестов для веб, мобильных и API приложений",
    tfr: "тестировщик",
    requiredCompetences: [],
    levels: [
      {
        level: "trainee",
        name: "Стажер-инженер по автотестированию",
        description: "Стажер по автотестированию. Начальный уровень, изучение основ автоматизации тестирования под руководством ментора.",
        responsibilities: [
          "Изучение основ автоматизации тестирования и инструментов",
          "Написание простых unit-тестов под руководством",
          "Изучение фреймворков тестирования (JUnit, pytest, Jest)",
          "Освоение работы с системой контроля версий (Git)",
          "Участие в код-ревью для изучения лучших практик",
          "Изучение основ тест-дизайна",
          "Работа с документацией и изучение существующих тестов",
        ],
        education: "Среднее специальное или неоконченное высшее техническое образование",
        bankExperience: "Стаж работы в банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-20": 1, // Автотестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        taskExamples: [
          "Написать простой unit-тест на pytest для функции валидации email-адреса, используя базовые утверждения (assert) и проверяя корректные и некорректные форматы адресов",
          "Изучить существующий автотест на Selenium для формы входа, понять структуру Page Object Model, выполнить тест-кейс вручную и описать найденные проблемы в баг-трекере",
          "Создать простой автотест на Jest для проверки работы функции сложения двух чисел, включая проверку граничных случаев (положительные, отрицательные числа, ноль) и написать комментарии к коду"
        ],
      },
      {
        level: "junior",
        name: "Младший инженер по автотестированию",
        description: "Младший инженер по автотестированию. Базовый уровень, способен разрабатывать простые автотесты под минимальным руководством.",
        responsibilities: [
          "Разработка автотестов для UI (Selenium, Cypress, Playwright)",
          "Работа с Page Object Model",
          "Написание unit-тестов и интеграционных тестов",
          "Работа с баг-трекерами (Jira, Redmine)",
          "Участие в планировании задач и оценке времени",
          "Рефакторинг существующих тестов",
          "Участие в код-ревью",
        ],
        education: "Высшее техническое образование (или неоконченное высшее)",
        bankExperience: "Опыт работы в банке от 6 месяцев до 1 года",
        externalExperience: "Опыт работы на внешнем рынке от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-20": 2, // Автотестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        taskExamples: [
          "Разработать автотест на Selenium WebDriver для проверки процесса регистрации пользователя на сайте, используя Page Object Model, включая заполнение формы, проверку валидации полей и успешной регистрации",
          "Создать набор интеграционных тестов на Cypress для проверки работы корзины покупок в интернет-магазине: добавление товаров, изменение количества, удаление товаров, расчет общей стоимости",
          "Исправить падающий автотест на Playwright, который нестабильно работает из-за проблем с ожиданием загрузки элементов, рефакторить код для повышения стабильности и добавить обработку исключений"
        ],
      },
      {
        level: "middle",
        name: "Инженер по автотестированию",
        description: "Инженер по автотестированию среднего уровня. Способен самостоятельно создавать комплексные тестовые фреймворки и решать сложные задачи.",
        responsibilities: [
          "Создание комплексных тестовых фреймворков",
          "Разработка E2E тестов и интеграционных тестов",
          "Работа с CI/CD, настройка автоматического запуска тестов",
          "Использование моков и стабов",
          "Оптимизация тестов и повышение их стабильности",
          "Менторинг junior инженеров",
          "Участие в техническом планировании",
          "Работа с API тестированием (REST, GraphQL)",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 1 до 3 лет",
        externalExperience: "Опыт работы на внешнем рынке от 1 до 3 лет",
        requiredSkills: {
          "comp-20": 3, // Автотестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-21": 2, // Ручное тестирование - базовый уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        taskExamples: [
          "Создать комплексный тестовый фреймворк на основе Selenium с поддержкой параллельного запуска тестов, использованием моков для внешних сервисов, интеграцией с Allure для отчетности и настройкой CI/CD для автоматического запуска тестов",
          "Разработать E2E тест-сценарий для проверки полного цикла заказа товара: выбор товара, оформление заказа, оплата, отслеживание статуса, используя API-тестирование (REST) для проверки бэкенда и UI-тестирование для фронтенда",
          "Оптимизировать производительность набора из 50 автотестов, сократив время выполнения с 2 часов до 30 минут за счет параллелизации, использования кэширования данных, оптимизации ожиданий и настройки инфраструктуры тестирования"
        ],
      },
      {
        level: "senior",
        name: "Старший инженер по автотестированию",
        description: "Старший инженер по автотестированию. Экспертный уровень, способен проектировать тестовую архитектуру и принимать архитектурные решения.",
        responsibilities: [
          "Проектирование тестовой архитектуры",
          "Оптимизация тестов и параллельное выполнение",
          "Создание тестовых библиотек и инструментов",
          "Принятие ключевых технических решений",
          "Проведение технических интервью и оценка кандидатов",
          "Менторинг middle и junior инженеров",
          "Участие в стратегическом планировании",
          "Внедрение CI/CD процессов и автоматизации",
          "Исследование новых технологий и их внедрение",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 3 до 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 3 до 5 лет",
        requiredSkills: {
          "comp-20": 4, // Автотестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-21": 3, // Ручное тестирование - средний уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-6": 3, // Архитектура - средний уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        taskExamples: [
          "Спроектировать тестовую архитектуру для микросервисного приложения с 10+ сервисами, определить стратегию тестирования (unit, integration, E2E), создать библиотеку общих утилит для тестирования, организовать параллельное выполнение тестов в CI/CD pipeline",
          "Разработать кастомный инструмент для генерации тестовых данных и создания моков API на основе OpenAPI спецификации, интегрировать его в тестовый фреймворк, провести обучение команды по использованию инструмента",
          "Провести технический аудит существующей тестовой инфраструктуры, выявить узкие места и проблемы, разработать план оптимизации, принять ключевое решение по миграции на новый фреймворк тестирования, провести менторинг middle инженеров по внедрению"
        ],
      },
      {
        level: "lead",
        name: "Ведущий инженер по автотестированию",
        description: "Ведущий инженер по автотестированию. Экспертный уровень, отвечает за техническое направление, тестовую архитектуру и развитие команды.",
        responsibilities: [
          "Определение технической стратегии автотестирования",
          "Проектирование масштабируемых тестовых систем",
          "Руководство командой инженеров по автотестированию",
          "Принятие критических технических решений",
          "Разработка технических стандартов и процессов",
          "Проведение технических аудитов",
          "Менторинг senior инженеров",
          "Взаимодействие с бизнесом и стейкхолдерами",
          "Исследование и внедрение инновационных решений",
          "Участие в конференциях и развитие профессионального сообщества",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 5 лет",
        requiredSkills: {
          "comp-20": 5, // Автотестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-21": 4, // Ручное тестирование - продвинутый уровень
          "comp-8": 4, // DevOps - продвинутый уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        taskExamples: [
          "Определить техническую стратегию автотестирования для организации с 5+ продуктами, спроектировать масштабируемую тестовую инфраструктуру, принять критическое решение по выбору технологического стека, разработать стандарты и процессы тестирования для всех команд",
          "Руководить командой из 8 инженеров по автотестированию при внедрении новой тестовой платформы, распределить задачи между senior и middle инженерами, провести технические аудиты качества тестов, управлять рисками миграции и обеспечить непрерывность тестирования",
          "Провести исследование и внедрить инновационное решение для AI-генерации тестов на основе анализа кода, выступить на конференции с докладом о лучших практиках тестирования, развивать профессиональное сообщество, взаимодействовать с бизнесом по вопросам качества продукта"
        ],
      },
    ],
    experts: [],
  },
  {
    id: "profile-3",
    name: "Инженер по ручному тестированию",
    description: "Специалист по выполнению ручного тестирования, написанию тест-кейсов, баг-репортов и тест-планов",
    tfr: "тестировщик",
    requiredCompetences: [],
    levels: [
      {
        level: "trainee",
        name: "Стажер-инженер по ручному тестированию",
        description: "Стажер по ручному тестированию. Начальный уровень, изучение основ тестирования под руководством ментора.",
        responsibilities: [
          "Изучение основ тестирования программного обеспечения",
          "Выполнение простых тест-кейсов под руководством",
          "Изучение работы с баг-трекерами",
          "Освоение базового описания багов",
          "Изучение основ тест-дизайна",
          "Работа с документацией",
        ],
        education: "Среднее специальное или неоконченное высшее техническое образование",
        bankExperience: "Стаж работы в банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        taskExamples: [
          "Выполнить простой тест-кейс для проверки функциональности формы входа на сайте: ввести корректные данные, проверить успешный вход, описать результат тестирования в баг-трекере",
          "Изучить требования к новой функции \"Добавление товара в корзину\", составить чек-лист из 5-7 пунктов для проверки функциональности, выполнить проверку и завести баг-репорт при обнаружении проблемы",
          "Провести smoke-тестирование основного функционала мобильного приложения после обновления: проверить запуск приложения, авторизацию, главный экран, описать найденные критические проблемы в баг-трекере"
        ],
      },
      {
        level: "junior",
        name: "Младший инженер по ручному тестированию",
        description: "Младший инженер по ручному тестированию. Базовый уровень, способен выполнять тестирование функциональности под минимальным руководством.",
        responsibilities: [
          "Написание тест-кейсов и чек-листов",
          "Работа с баг-трекерами (Jira, Redmine)",
          "Тестирование функциональности приложений",
          "Описание багов с подробной информацией",
          "Выполнение регрессионного тестирования",
          "Участие в планировании задач",
        ],
        education: "Высшее техническое образование (или неоконченное высшее)",
        bankExperience: "Опыт работы в банке от 6 месяцев до 1 года",
        externalExperience: "Опыт работы на внешнем рынке от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-21": 2, // Ручное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
        },
        taskExamples: [
          "Написать набор из 15 тест-кейсов для проверки функциональности регистрации пользователя, включая позитивные и негативные сценарии, граничные случаи, провести тестирование и оформить баг-репорты с подробным описанием шагов воспроизведения",
          "Выполнить регрессионное тестирование модуля \"Оплата\" после исправления багов: проверить исправленные функции, убедиться в отсутствии новых багов в связанных модулях, составить отчет о результатах тестирования",
          "Протестировать API эндпоинт для получения списка товаров через Postman: проверить корректность ответа, валидацию параметров запроса, обработку ошибок, оформить результаты тестирования в баг-трекере"
        ],
      },
      {
        level: "middle",
        name: "Инженер по ручному тестированию",
        description: "Инженер по ручному тестированию среднего уровня. Способен самостоятельно создавать тест-планы и выполнять комплексное тестирование.",
        responsibilities: [
          "Создание тест-планов и тест-стратегий",
          "Тест-дизайн и применение техник тестирования",
          "Тестирование API (REST, GraphQL)",
          "Работа с требованиями и их анализ",
          "Регрессионное и smoke тестирование",
          "Менторинг junior инженеров",
          "Участие в планировании релизов",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 1 до 3 лет",
        externalExperience: "Опыт работы на внешнем рынке от 1 до 3 лет",
        requiredSkills: {
          "comp-21": 3, // Ручное тестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        taskExamples: [
          "Создать тест-план для нового модуля \"Управление подписками\", применить техники тест-дизайна (эквивалентное разбиение, анализ граничных значений), определить приоритеты тест-кейсов, организовать тестирование API (REST) и UI, провести менторинг junior инженера",
          "Проанализировать требования к интеграции с внешним платежным сервисом, выявить риски и неоднозначности, составить тест-стратегию, провести комплексное тестирование интеграции, включая проверку обработки ошибок и таймаутов",
          "Провести smoke и регрессионное тестирование перед релизом продукта, приоритизировать найденные баги, составить отчет о готовности к релизу с рекомендациями, участвовать в планировании релиза с командой разработки"
        ],
      },
      {
        level: "senior",
        name: "Старший инженер по ручному тестированию",
        description: "Старший инженер по ручному тестированию. Экспертный уровень, способен проектировать тестовые стратегии и управлять тестированием.",
        responsibilities: [
          "Проектирование тестовых стратегий",
          "Управление тестированием проекта",
          "Анализ рисков и приоритизация тестов",
          "Оптимизация процессов тестирования",
          "Проведение технических интервью",
          "Менторинг middle и junior инженеров",
          "Участие в стратегическом планировании",
          "Взаимодействие с заказчиками и стейкхолдерами",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 3 до 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 3 до 5 лет",
        requiredSkills: {
          "comp-21": 4, // Ручное тестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        taskExamples: [
          "Спроектировать тестовую стратегию для крупного проекта с 3 командами разработки, определить подходы к тестированию для каждого модуля, провести анализ рисков и приоритизацию тестов, оптимизировать процессы тестирования для сокращения времени релиза",
          "Управлять тестированием критического релиза платежной системы: координировать работу 5 тестировщиков, проводить ежедневные синхронизации, принимать решения о блокировке/разблокировке релиза, взаимодействовать с заказчиками по вопросам качества",
          "Провести техническое интервью кандидата на позицию middle QA инженера, оценить навыки тест-дизайна и работы с требованиями, провести менторинг middle и junior инженеров по улучшению качества баг-репортов и тест-кейсов"
        ],
      },
      {
        level: "lead",
        name: "Ведущий инженер по ручному тестированию",
        description: "Ведущий инженер по ручному тестированию. Экспертный уровень, отвечает за построение процессов тестирования и развитие команды.",
        responsibilities: [
          "Построение процессов тестирования в организации",
          "Управление командой тестировщиков",
          "Разработка стандартов и методологий тестирования",
          "Проведение аудитов качества",
          "Менторинг senior инженеров",
          "Взаимодействие с бизнесом и стейкхолдерами",
          "Исследование новых подходов к тестированию",
          "Участие в конференциях и развитие профессионального сообщества",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 5 лет",
        requiredSkills: {
          "comp-21": 5, // Ручное тестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        taskExamples: [
          "Построить процессы тестирования для организации с 10+ продуктами: разработать стандарты и методологии тестирования, внедрить единые инструменты и процессы, провести аудит качества тестирования во всех командах, обучить команды новым подходам",
          "Управлять командой из 12 тестировщиков при внедрении новой методологии тестирования, распределить роли и ответственность, провести менторинг senior инженеров, взаимодействовать с бизнесом и стейкхолдерами по вопросам качества продуктов",
          "Провести исследование новых подходов к тестированию (exploratory testing, session-based testing), внедрить инновационные решения в процессы организации, выступить на конференции с докладом, развивать профессиональное сообщество тестировщиков"
        ],
      },
    ],
    experts: [],
  },
  {
    id: "profile-4",
    name: "Инженер по нагрузочному тестированию",
    description: "Специалист по проведению нагрузочного и производительного тестирования, анализу производительности систем",
    tfr: "тестировщик",
    requiredCompetences: [],
    levels: [
      {
        level: "trainee",
        name: "Стажер-инженер по нагрузочному тестированию",
        description: "Стажер по нагрузочному тестированию. Начальный уровень, изучение основ нагрузочного тестирования под руководством ментора.",
        responsibilities: [
          "Изучение основ нагрузочного тестирования",
          "Базовое использование инструментов (JMeter, Gatling)",
          "Выполнение простых нагрузочных сценариев под руководством",
          "Изучение метрик производительности",
          "Работа с документацией",
        ],
        education: "Среднее специальное или неоконченное высшее техническое образование",
        bankExperience: "Стаж работы в банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-22": 1, // Нагрузочное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        taskExamples: [
          "Изучить основы JMeter, создать простой нагрузочный сценарий для проверки главной страницы сайта с 10 одновременными пользователями, выполнить тест и проанализировать базовые метрики (время отклика, количество запросов)",
          "Выполнить простой нагрузочный тест API эндпоинта с использованием Gatling, проверить время отклика при 5 одновременных запросах, зафиксировать результаты в отчете",
          "Изучить метрики производительности (RPS, latency, throughput), провести базовое профилирование простого веб-приложения, описать найденные проблемы производительности в документации"
        ],
      },
      {
        level: "junior",
        name: "Младший инженер по нагрузочному тестированию",
        description: "Младший инженер по нагрузочному тестированию. Базовый уровень, способен создавать нагрузочные сценарии под минимальным руководством.",
        responsibilities: [
          "Создание нагрузочных сценариев (JMeter, Gatling, Locust)",
          "Анализ метрик производительности",
          "Работа с отчетами нагрузочного тестирования",
          "Базовое профилирование приложений",
          "Участие в планировании задач",
        ],
        education: "Высшее техническое образование (или неоконченное высшее)",
        bankExperience: "Опыт работы в банке от 6 месяцев до 1 года",
        externalExperience: "Опыт работы на внешнем рынке от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-22": 2, // Нагрузочное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        taskExamples: [
          "Создать нагрузочный сценарий на JMeter для проверки API регистрации пользователей с постепенным увеличением нагрузки (ramp-up) от 0 до 100 пользователей за 5 минут, проанализировать метрики производительности и выявить узкие места",
          "Провести нагрузочное тестирование веб-приложения с использованием Locust, симулируя поведение 50 пользователей, выполняющих различные действия (просмотр товаров, добавление в корзину), составить отчет с графиками производительности",
          "Выполнить базовое профилирование базы данных при нагрузочном тесте, проанализировать медленные запросы, определить индексы для оптимизации, составить рекомендации по улучшению производительности БД"
        ],
      },
      {
        level: "middle",
        name: "Инженер по нагрузочному тестированию",
        description: "Инженер по нагрузочному тестированию среднего уровня. Способен самостоятельно проектировать комплексные нагрузочные тесты.",
        responsibilities: [
          "Проектирование комплексных нагрузочных тестов",
          "Анализ узких мест производительности",
          "Оптимизация производительности приложений",
          "Работа с распределенными системами",
          "Менторинг junior инженеров",
          "Участие в техническом планировании",
          "Работа с системами мониторинга",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 1 до 3 лет",
        externalExperience: "Опыт работы на внешнем рынке от 1 до 3 лет",
        requiredSkills: {
          "comp-22": 3, // Нагрузочное тестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        taskExamples: [
          "Спроектировать комплексный нагрузочный тест для распределенной системы с микросервисной архитектурой: определить сценарии нагрузки для каждого сервиса, настроить распределенную нагрузку, провести анализ узких мест производительности, интегрировать с системами мониторинга",
          "Провести анализ производительности высоконагруженного API, выявить узкие места на уровне приложения и БД, предложить оптимизации (кэширование, оптимизация запросов, индексы), провести повторное тестирование для подтверждения улучшений",
          "Разработать стратегию нагрузочного тестирования для мобильного приложения с учетом различных типов устройств и сетевых условий, провести тестирование, проанализировать результаты, провести менторинг junior инженера по интерпретации метрик"
        ],
      },
      {
        level: "senior",
        name: "Старший инженер по нагрузочному тестированию",
        description: "Старший инженер по нагрузочному тестированию. Экспертный уровень, способен проектировать стратегии нагрузочного тестирования.",
        responsibilities: [
          "Проектирование стратегий нагрузочного тестирования",
          "Анализ архитектуры на производительность",
          "Создание инструментов тестирования",
          "Принятие ключевых технических решений",
          "Проведение технических интервью",
          "Менторинг middle и junior инженеров",
          "Участие в стратегическом планировании",
          "Исследование новых технологий",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 3 до 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 3 до 5 лет",
        requiredSkills: {
          "comp-22": 4, // Нагрузочное тестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        taskExamples: [
          "Спроектировать стратегию нагрузочного тестирования для масштабируемой платформы электронной коммерции, провести анализ архитектуры на производительность, создать кастомные инструменты для генерации реалистичной нагрузки, принять ключевые решения по оптимизации",
          "Провести комплексный анализ производительности системы после масштабирования, выявить проблемы на уровне архитектуры (балансировка нагрузки, репликация БД, кэширование), разработать план оптимизации, провести технические интервью кандидатов на позицию performance engineer",
          "Исследовать новые технологии для нагрузочного тестирования (k6, Artillery), оценить их применимость для проектов компании, внедрить инновационные решения, провести менторинг middle и junior инженеров, участвовать в стратегическом планировании производительности"
        ],
      },
      {
        level: "lead",
        name: "Ведущий инженер по нагрузочному тестированию",
        description: "Ведущий инженер по нагрузочному тестированию. Экспертный уровень, отвечает за построение процессов тестирования производительности.",
        responsibilities: [
          "Построение процессов тестирования производительности",
          "Управление командами инженеров",
          "Разработка стандартов и методологий",
          "Проведение технических аудитов",
          "Менторинг senior инженеров",
          "Взаимодействие с бизнесом и стейкхолдерами",
          "Исследование и внедрение инновационных решений",
          "Участие в конференциях и развитие профессионального сообщества",
        ],
        education: "Высшее техническое образование",
        bankExperience: "Опыт работы в банке от 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 5 лет",
        requiredSkills: {
          "comp-22": 5, // Нагрузочное тестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        taskExamples: [
          "Построить процессы тестирования производительности для организации с множеством продуктов, разработать стандарты и методологии нагрузочного тестирования, провести технические аудиты производительности всех критических систем, обучить команды новым подходам",
          "Управлять командой из 6 инженеров по нагрузочному тестированию при внедрении новой платформы тестирования производительности, распределить задачи, провести менторинг senior инженеров, взаимодействовать с бизнесом по вопросам масштабируемости и производительности",
          "Провести исследование и внедрить инновационные решения для автоматизации нагрузочного тестирования в CI/CD pipeline, выступить на конференции с докладом о лучших практиках тестирования производительности, развивать профессиональное сообщество"
        ],
      },
    ],
    experts: [],
  },
  {
    id: "profile-5",
    name: "Розничный тренер колл-центра",
    description: "Специалист по обучению и развитию сотрудников колл-центра, проведению продуктового и навыкового обучения, разработке обучающих программ и оценке компетенций",
    tfr: "тренер КЦ",
    requiredCompetences: [],
    levels: [
      {
        level: "middle",
        name: "Тренер КЦ",
        description: "Тренер колл-центра среднего уровня. Проводит продуктовое и навыковое обучение сотрудников первой линии, разрабатывает обучающие материалы, проводит оценочные процедуры",
        responsibilities: [
          "Функция 1: Проводить продуктовое обучение сотрудников\n  • Проводить вводное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит обучение сотрудников первой линии КЦ по профильному направлению действующим продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить регулярное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит корректирующие продуктовые тренинги для сотрудников первой линии КЦ по профильному направлению согласно разработанным планам обучения\n  • Проводить обучение сотрудников первой линии КЦ при возникновении изменений в продуктовой линейке Банка: • Проводит обучение сотрудников первой линии КЦ по профильному направлению новым продуктам/услугам/процедурам согласно разработанным планам обучения",
          "Функция 2: Проводить навыковое обучение сотрудников\n  • Проводить вводное навыковое обучение сотрудников: • Проводит навыковые тренинги, включенные в базовую программу обучения новых сотрудников по профильному направлению, согласно разработанным планам обучения",
          "Функция 3: Заниматься методологической работой\n  • Подготавливает и актуализирует обучающий материал для учебных мероприятий: презентация, кейсы, примеры, инструменты оценки",
          "Функция 4: Разрабатывать и проводить оценочные процедуры\n  • Проводит по запросу оценочные процедуры для замера уровня компетенций сотрудников профильных подразделений",
          "Прочее\n  • Выполняет функции другого сотрудника на время его отсутствия\n  • Предоставляет отчет Руководителю о выполненных работах и полученных результатах деятельности\n  • Выполняет иные функции по указанию Руководителя\n  • Оказывает консультационную помощь новым сотрудникам Отдела обучения по ресурсам и сервисам Банка",
        ],
        education: "Не ниже полного среднеспециального",
        bankExperience: "Без опыта работы по профилю деятельности Подразделения, но не менее 1 года работы в ГПБ",
        externalExperience: "Опыт работы по профилю деятельности Подразделения не менее 1 года",
        requiredSkills: {
          "comp-30": 3, // Знание продуктов и услуг Банка - средний уровень
          "comp-31": 3, // Знание инструментов и методов оценки - средний уровень
          "comp-34": 3, // Понимание принципа обучения взрослых - средний уровень
          "comp-23": 3, // Понимание бизнеса - средний уровень
          "comp-24": 3, // Управление данными - средний уровень
          "comp-25": 3, // Цифровая грамотность - средний уровень
          "comp-26": 3, // Человекоцентричность - средний уровень
          "comp-27": 3, // Управление системами и задачами - средний уровень
          "comp-28": 3, // Профессионализм - средний уровень
          "comp-29": 3, // Ответственность - средний уровень
        },
        taskExamples: [
          "Провести вводное продуктовое обучение для группы из 15 новых сотрудников первой линии колл-центра по кредитным продуктам Банка: подготовить презентацию с примерами, провести интерактивный тренинг с кейсами, провести оценку усвоения материала",
          "Разработать и провести корректирующий продуктовый тренинг для сотрудников первой линии по новому тарифному плану: создать обучающие материалы (презентация, кейсы, чек-лист), провести тренинг с практическими упражнениями, оценить эффективность обучения",
          "Провести оценочную процедуру для 20 сотрудников профильного подразделения по компетенциям \"Работа с клиентами\" и \"Знание продуктов\": разработать инструменты оценки, провести оценку, дать развивающую обратную связь каждому сотруднику"
        ],
      },
      {
        level: "senior",
        name: "Старший тренер КЦ",
        description: "Старший тренер колл-центра. Проводит обучение сотрудников экспертной линии и премиум, разрабатывает тренинг-планы, анализирует результаты оценочных процедур, обучает новых тренеров",
        responsibilities: [
          "Функция 1: Проводить продуктовое обучение сотрудников\n  • Проводить вводное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит обучение сотрудников первой линии КЦ по профильному направлению действующим продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить регулярное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит корректирующие продуктовые тренинги для сотрудников первой линии КЦ по профильному направлению согласно разработанным планам обучения\n  • Проводить обучение сотрудников первой линии КЦ при возникновении изменений в продуктовой линейке Банка: • Проводит обучение сотрудников первой линии КЦ по профильному направлению новым продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить вводное обучение сотрудников на навык экспертной линии/линии премиум КЦ согласно действующим программам обучения: • Проводит обучение сотрудников экспертной линии/линии премиум действующим продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить регулярное обучение сотрудников экспертной линии/линии Премиум КЦ согласно действующим программам обучения: • Проводит корректирующие продуктовые тренинги для сотрудников экспертной линии/линии Премиум КЦ согласно разработанным планам обучения\n  • Проводить обучение сотрудников экспертной линии/линии Премиум КЦ при возникновении изменений в продуктовой линейке Банка: • Проводит обучение сотрудников экспертной линии/линии премиум новым продуктам/услугам/процедурам согласно разработанным планам обучения",
          "Функция 2: Проводить навыковое обучение сотрудников\n  • Проводить вводное навыковое обучение сотрудников: • Проводит навыковые тренинги, включенные в базовую программу обучения новых сотрудников по профильному направлению, согласно разработанным планам обучения. • Проводит навыковые тренинги, включенные в карты развития профильного направления сотрудников, согласно разработанным планам обучения. • Проводит корректирующие навыковые мероприятия (тренинги/ворк-шопы/бизнес-игры) согласно разработанным планам обучения\n  • Проводить навыковое обучение сотрудников экспертной линии/линии премиум: • Проводит навыковое обучение сотрудников экспертной/премиум линии согласно разработанным планам обучения\n  • Проводить вводное обучение тренерским компетенциям новых сотрудников Отдела обучения (тренеров): • Проводит вводное обучение продуктам/услугам/процедурам соответствующего навыка новых сотрудников Отдела обучения согласно разработанным планам обучения и карте развития тренера",
          "Функция 3: Заниматься методологической работой\n  • Подготавливает и актуализирует обучающий материал для учебных мероприятий: презентация, кейсы, примеры, инструменты оценки\n  • Разрабатывает тренинг-планы для проведения вводного обучения действующим продуктам/услугам/процедурам Банка (продуктовое обучение)\n  • Разрабатывает тренинг-планы для проведения обучения по новому продукту/услуге/процедуре Банка по профильному направлению (продуктовое обучение)\n  • Разрабатывает тренинг-планы для проведения навыкового обучения",
          "Функция 4: Разрабатывать и проводить оценочные процедуры\n  • Проводит по запросу оценочные процедуры для замера уровня компетенций сотрудников профильных подразделений\n  • Анализирует результаты проведенных оценочных процедур, дает развивающую обратную связь участникам оценочных процедур, дает рекомендации по развитию компетенций, составляет ИПР\n  • Разрабатывает по запросу оценочные процедуры для замера уровня компетенций сотрудников профильных подразделений",
          "Прочее\n  • Выполняет функции другого сотрудника на время его отсутствия\n  • Предоставляет отчет Руководителю о выполненных работах и полученных результатах деятельности\n  • Выполняет иные функции по указанию Руководителя\n  • Осуществляет адаптацию нового сотрудника Отдела обучения: заведение заявок для нового сотрудника на получение доступов к системам Банка, консультационная помощь по ресурсам и сервисам Банка",
        ],
        education: "Не ниже высшего профессионального образования",
        bankExperience: "Опыт работы в должностях специалистов предшествующего иерархического уровня не менее 1 года",
        externalExperience: "Опыт работы в финансово-кредитной сфере не менее 1 года, опыт работы по профилю деятельности Подразделения не менее 2 лет",
        requiredSkills: {
          "comp-30": 4, // Знание продуктов и услуг Банка - продвинутый уровень
          "comp-31": 4, // Знание инструментов и методов оценки - продвинутый уровень
          "comp-32": 4, // Навык публичных выступлений - продвинутый уровень
          "comp-33": 4, // Знание показателей бизнеса - продвинутый уровень
          "comp-34": 4, // Понимание принципа обучения взрослых - продвинутый уровень
          "comp-35": 4, // Навык работы в ПО банка - продвинутый уровень
          "comp-23": 4, // Понимание бизнеса - продвинутый уровень
          "comp-24": 4, // Управление данными - продвинутый уровень
          "comp-25": 4, // Цифровая грамотность - продвинутый уровень
          "comp-26": 4, // Человекоцентричность - продвинутый уровень
          "comp-27": 4, // Управление системами и задачами - продвинутый уровень
          "comp-28": 4, // Профессионализм - продвинутый уровень
          "comp-29": 4, // Ответственность - продвинутый уровень
        },
        taskExamples: [
          "Разработать тренинг-план для вводного обучения сотрудников экспертной линии по новому премиум-продукту Банка: провести анализ требований, создать полный методологический комплект (презентация, кейсы, инструменты оценки), провести обучение для 25 сотрудников, проанализировать результаты",
          "Провести комплексную оценочную процедуру для 30 сотрудников профильного подразделения, проанализировать результаты, составить индивидуальные планы развития (ИПР) для каждого сотрудника, дать развивающую обратную связь, провести менторинг новых тренеров по проведению оценок",
          "Разработать и провести навыковое обучение для сотрудников экспертной линии по управлению сложными клиентскими ситуациями: создать тренинг-план с бизнес-играми, провести интерактивный тренинг, оценить эффективность обучения через анализ показателей работы сотрудников"
        ],
      },
      {
        level: "lead",
        name: "Главный тренер КЦ",
        description: "Главный тренер колл-центра. Проводит обучение руководящего состава, разрабатывает программы обучения для управленческого состава, проводит мастер-майнды и фасилитационные сессии, разрабатывает оценочные процедуры для отдела обучения, работает в АС Банка",
        responsibilities: [
          "Функция 1: Проводить продуктовое обучение сотрудников\n  • Проводить вводное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит обучение сотрудников первой линии КЦ по профильному направлению действующим продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить регулярное обучение сотрудников первой линии КЦ согласно действующим программам обучения: • Проводит корректирующие продуктовые тренинги для сотрудников первой линии КЦ по профильному направлению согласно разработанным планам обучения\n  • Проводить обучение сотрудников первой линии КЦ при возникновении изменений в продуктовой линейке Банка: • Проводит обучение сотрудников первой линии КЦ по профильному направлению новым продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить вводное обучение сотрудников на навык экспертной линии/линии премиум КЦ согласно действующим программам обучения: • Проводит обучение сотрудников экспертной линии/линии премиум действующим продуктам/услугам/процедурам согласно разработанным планам обучения\n  • Проводить регулярное обучение сотрудников экспертной линии/линии Премиум КЦ согласно действующим программам обучения: • Проводит корректирующие продуктовые тренинги для сотрудников экспертной линии/линии Премиум КЦ согласно разработанным планам обучения\n  • Проводить обучение сотрудников экспертной линии/линии Премиум КЦ при возникновении изменений в продуктовой линейке Банка: • Проводит обучение сотрудников экспертной линии/линии премиум новым продуктам/услугам/процедурам согласно разработанным планам обучения",
          "Функция 2: Проводить навыковое обучение сотрудников\n  • Проводить вводное навыковое обучение сотрудников: • Проводит навыковые тренинги, включенные в базовую программу обучения новых сотрудников по профильному направлению, согласно разработанным планам обучения. • Проводит навыковые тренинги, включенные в карты развития профильного направления сотрудников, согласно разработанным планам обучения. • Проводит корректирующие навыковые мероприятия (тренинги/ворк-шопы/бизнес-игры) согласно разработанным планам обучения\n  • Проводить навыковое обучение сотрудников экспертной линии/линии премиум: • Проводит навыковое обучение сотрудников экспертной/премиум линии согласно разработанным планам обучения\n  • Проводить обучение руководящего состава управленческим компетенциям: • Проводит обучение руководящего состава управленческим компетенциям согласно разработанным планам обучения\n  • Проводить по запросу мастер-майнды, фасилитационные сессии, брейн-штормы и иные мероприятия, направленные на решение задач заказчика: • Проводит мастер-майнды, фасилитационные сессии, брейн-штормы и иные мероприятия для сотрудников согласно разработанным планам обучения\n  • Проводить вводное обучение тренерским компетенциям новых сотрудников Отдела обучения (тренеров): • Проводит вводное обучение продуктам/услугам/процедурам соответствующего навыка новых сотрудников Отдела обучения согласно разработанным планам обучения и карте развития тренера. • Проводит вводное обучение тренерским компетенциям новых сотрудников Отдела обучения согласно разработанным планам обучения и карте развития тренера",
          "Функция 3: Заниматься методологической работой\n  • Подготавливает и актуализирует обучающий материал для учебных мероприятий: презентация, кейсы, примеры, инструменты оценки\n  • Разрабатывает тренинг-планы для проведения вводного обучения действующим продуктам/услугам/процедурам Банка (продуктовое обучение)\n  • Разрабатывает тренинг-планы для проведения обучения по новому продукту/услуге/процедуре Банка по профильному направлению (продуктовое обучение)\n  • Разрабатывает тренинг-планы для проведения навыкового обучения\n  • Разрабатывает программы обучения для управленческого обучения руководителей КЦ/РБ по действующим продуктам/услугам/процедурам Банка, формируя полный методологический комплект материалов: управляющая презентация, мануал тренера, тетрадь участника, доп. раздаточный материал в соответствии с принятой методологией",
          "Функция 4: Разрабатывать и проводить оценочные процедуры\n  • Проводит по запросу оценочные процедуры для замера уровня компетенций сотрудников профильных подразделений\n  • Анализирует результаты проведенных оценочных процедур, дает развивающую обратную связь участникам оценочных процедур, дает рекомендации по развитию компетенций, составляет ИПР\n  • Разрабатывает по запросу оценочные процедуры для замера уровня компетенций сотрудников профильных подразделений\n  • Проводит внутренние оценочные процедуры для замера уровня компетенций сотрудников Отдела обучения\n  • Разрабатывает внутренние оценочные процедуры для замера уровня компетенций сотрудников Отдела обучения",
          "Прочее\n  • Выполняет функции другого сотрудника на время его отсутствия\n  • Предоставляет отчет Руководителю о выполненных работах и полученных результатах деятельности\n  • Выполняет иные функции по указанию Руководителя\n  • Осуществляет адаптацию нового сотрудника Отдела обучения: заведение заявок для нового сотрудника на получение доступов к системам Банка, консультационная помощь по ресурсам и сервисам Банка\n  • Работает в различных АС Банка от имени Руководителя (согласование документов, утверждение)",
        ],
        education: "Не ниже высшего профессионального образования",
        bankExperience: "Опыт работы в должностях специалистов предшествующего иерархического уровня не менее 1 года",
        externalExperience: "Опыт работы в финансово-кредитной сфере не менее 1 года, опыт работы по профилю деятельности Подразделения не менее 2 лет",
        requiredSkills: {
          "comp-30": 5, // Знание продуктов и услуг Банка - экспертный уровень
          "comp-31": 5, // Знание инструментов и методов оценки - экспертный уровень
          "comp-32": 5, // Навык публичных выступлений - экспертный уровень
          "comp-33": 5, // Знание показателей бизнеса - экспертный уровень
          "comp-34": 5, // Понимание принципа обучения взрослых - экспертный уровень
          "comp-35": 5, // Навык работы в ПО банка - экспертный уровень
          "comp-36": 5, // Навык снятия запроса у заказчика - экспертный уровень
          "comp-37": 5, // Умение сформировать трек развития - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-25": 5, // Цифровая грамотность - экспертный уровень
          "comp-26": 5, // Человекоцентричность - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
          "comp-29": 5, // Ответственность - экспертный уровень
        },
        taskExamples: [
          "Разработать программу обучения для управленческого состава руководителей колл-центра по новым продуктам Банка: провести снятие запроса у заказчика, создать полный методологический комплект (управляющая презентация, мануал тренера, тетрадь участника), провести обучение для 15 руководителей, провести мастер-майнды по применению знаний",
          "Провести фасилитационную сессию для команды из 20 сотрудников экспертной линии по решению проблемы низкой конверсии продаж: выявить причины проблемы, провести брейн-шторм по решениям, разработать план действий, провести внутреннюю оценочную процедуру для отдела обучения",
          "Работать в АС Банка от имени Руководителя: согласовать документы по новым программам обучения, утвердить методологические материалы, взаимодействовать с бизнесом и стейкхолдерами по вопросам развития компетенций сотрудников, провести менторинг senior тренеров"
        ],
      },
    ],
    experts: [],
  },
  {
    id: "profile-6",
    name: "Архитектор глоссария",
    description: "Специалист по созданию и управлению глоссариями данных, обеспечивающий единообразие терминологии и понимание данных в организации",
    tfr: "архитектор глоссария",
    requiredCompetences: [],
    levels: [
      {
        level: "trainee",
        name: "Архитектор глоссария",
        description: "Начальный уровень архитектора глоссария. Изучение основ построения глоссариев данных, работы с терминологией и структурированием данных под руководством ментора.",
        responsibilities: [
          "Изучение основ построения глоссариев данных",
          "Работа с существующими глоссариями данных",
          "Изучение банковской терминологии и процессов",
          "Выполнение простых задач по поддержке глоссариев под руководством",
          "Изучение основ работы с базами данных",
          "Работа с документацией",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-36": 1, // Грамотная письменная речь - начальный уровень
          "comp-37": 1, // Грамотная устная речь - начальный уровень
          "comp-38": 1, // Практический опыт в построении глоссариев данных - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        taskExamples: [
          "Изучить существующий глоссарий данных по кредитным продуктам, найти и исправить 5 ошибок в определениях терминов, подготовить отчет о найденных несоответствиях",
          "Под руководством ментора создать простой глоссарий из 10 терминов для нового направления деятельности, определить связи между терминами, оформить документ согласно стандартам",
          "Изучить банковскую терминологию по направлению \"Платежные карты\", составить список из 15 основных терминов с их определениями, представить результаты на внутреннем совещании"
        ],
      },
      {
        level: "junior",
        name: "Старший архитектор глоссария",
        description: "Базовый уровень архитектора глоссария. Способен самостоятельно создавать и поддерживать глоссарии данных для своего направления, работать с терминологией и структурированием данных.",
        responsibilities: [
          "Создание и поддержка глоссариев данных для своего направления",
          "Определение терминов, их определений и связей",
          "Работа с банковской терминологией",
          "Поддержка актуальности глоссариев",
          "Участие в проектах по структурированию данных",
          "Взаимодействие с заинтересованными сторонами",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке: не менее 1 года в сфере аналитики по управлению данными",
        externalExperience: "Опыт работы в финансово-кредитной сфере (здесь и далее включая ИТ-сферу для финансово-кредитных организаций): не менее 1 года",
        requiredSkills: {
          "comp-36": 2, // Грамотная письменная речь - базовый уровень
          "comp-37": 2, // Грамотная устная речь - базовый уровень
          "comp-38": 2, // Практический опыт в построении глоссариев данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
        },
        taskExamples: [
          "Создать глоссарий данных для нового направления \"Цифровые продукты\" из 30 терминов, определить связи между терминами, согласовать с заинтересованными сторонами, оформить документ согласно стандартам",
          "Обновить существующий глоссарий по кредитным продуктам: добавить 10 новых терминов, актуализировать 5 устаревших определений, проверить связи между терминами, представить изменения на согласование",
          "Провести анализ терминологии в документации отдела, выявить несоответствия и дублирования, предложить единообразные определения для 15 терминов, подготовить рекомендации по унификации"
        ],
      },
      {
        level: "middle",
        name: "Ведущий архитектор глоссария",
        description: "Средний уровень архитектора глоссария. Способен самостоятельно создавать и поддерживать глоссарии данных для нескольких направлений, разрабатывать ER-модели, координировать работу по созданию глоссариев.",
        responsibilities: [
          "Создание и поддержка глоссариев данных для нескольких направлений",
          "Разработка ER-моделей (модель Сущность-Связь)",
          "Установление стандартов и методологии построения глоссариев",
          "Координация работы по созданию глоссариев в команде",
          "Анализ и оптимизация структуры глоссариев",
          "Менторинг junior архитекторов",
          "Участие в проектах по управлению данными",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке: не менее 2 лет в сфере аналитики по управлению данными",
        externalExperience: "Опыт работы в финансово-кредитной сфере: не менее 2 лет",
        requiredSkills: {
          "comp-36": 3, // Грамотная письменная речь - средний уровень
          "comp-37": 3, // Грамотная устная речь - средний уровень
          "comp-38": 3, // Практический опыт в построении глоссариев данных - средний уровень
          "comp-39": 3, // Практический опыт в разработке ER-моделей - средний уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-24": 3, // Управление данными - средний уровень
        },
        taskExamples: [
          "Разработать комплексный глоссарий данных для трех направлений (кредиты, депозиты, карты), создать ER-модель связей между терминами, установить стандарты построения глоссариев, координировать работу команды из 3 архитекторов",
          "Спроектировать ER-модель для глоссария данных по риск-менеджменту, определить 50 сущностей и их связи, согласовать модель с экспертами, создать методологию построения глоссариев для риск-направления",
          "Провести аудит существующих глоссариев данных в организации, выявить несоответствия и дублирования, разработать план унификации терминологии, провести менторинг junior архитекторов по методологии"
        ],
      },
      {
        level: "senior",
        name: "Главный архитектор глоссария",
        description: "Продвинутый уровень архитектора глоссария. Экспертный уровень, способен разрабатывать комплексные глоссарии данных, управлять командой, работать с банковскими процессами и базами данных.",
        responsibilities: [
          "Разработка комплексных глоссариев данных для нескольких направлений",
          "Управление командой архитекторов глоссариев",
          "Знание банковских процессов и терминологии",
          "Знание основ разработки баз данных и хранилищ данных",
          "Руководство сотрудниками нижнего звена",
          "Разработка корпоративных стандартов и методологий",
          "Взаимодействие с бизнесом и стейкхолдерами",
          "Менторинг middle и junior архитекторов",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке: не менее 3 лет в сфере аналитики по управлению данными",
        externalExperience: "Опыт работы в финансово-кредитной сфере: не менее 3 лет. Опыт работы в должностях специалистов предшествующего иерархического уровня: не менее 1 года",
        requiredSkills: {
          "comp-36": 4, // Грамотная письменная речь - продвинутый уровень
          "comp-37": 4, // Грамотная устная речь - продвинутый уровень
          "comp-38": 4, // Практический опыт в построении глоссариев данных - продвинутый уровень
          "comp-39": 4, // Практический опыт в разработке ER-моделей - продвинутый уровень
          "comp-40": 4, // Знание банковских процессов и терминологии - продвинутый уровень
          "comp-41": 4, // Знание основ разработки баз данных, хранилищ данных - продвинутый уровень
          "comp-42": 4, // Практический опыт руководства сотрудниками нижнего звена - продвинутый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-23": 4, // Понимание бизнеса - продвинутый уровень
          "comp-24": 4, // Управление данными - продвинутый уровень
          "comp-27": 4, // Управление системами и задачами - продвинутый уровень
        },
        taskExamples: [
          "Разработать корпоративный стандарт построения глоссариев данных для всей организации, создать методологию работы с терминологией, управлять командой из 5 архитекторов, согласовать стандарт с руководством и внедрить в практику",
          "Спроектировать комплексную ER-модель для глоссария данных по всем банковским продуктам, определить архитектуру хранилища данных для глоссариев, координировать работу с IT-подразделением по реализации, провести обучение команды",
          "Провести стратегический анализ терминологии в организации, выявить ключевые проблемы и риски, разработать план унификации на 2 года, управлять проектом внедрения, взаимодействовать с бизнес-подразделениями и стейкхолдерами"
        ],
      },
      {
        level: "lead",
        name: "Директор по архитектуре глоссария",
        description: "Экспертный уровень архитектора глоссария. Отвечает за стратегическое развитие архитектуры глоссариев данных, управление проектами, построение процессов и развитие команды.",
        responsibilities: [
          "Стратегическое развитие архитектуры глоссариев данных в организации",
          "Управление проектами по построению глоссариев",
          "Разработка корпоративных стандартов и методологий",
          "Управление командой архитекторов",
          "Руководство проектами в роли постановщика задач/методолога/бизнес-архитектора",
          "Взаимодействие с топ-менеджментом и стейкхолдерами",
          "Менторинг senior архитекторов",
          "Исследование новых подходов к управлению данными",
          "Участие в конференциях и развитие профессионального сообщества",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке: не менее 4 лет в сфере аналитики по управлению данными",
        externalExperience: "Опыт работы в финансово-кредитной сфере: не менее 4 лет. Опыт работы на позициях в роли Постановщика задач/Методолога/Бизнес-архитектора/Владельца-продукта/Руководителя проекта с погружением в специфику проекта: не менее 3 лет",
        requiredSkills: {
          "comp-36": 5, // Грамотная письменная речь - экспертный уровень
          "comp-37": 5, // Грамотная устная речь - экспертный уровень
          "comp-38": 5, // Практический опыт в построении глоссариев данных - экспертный уровень
          "comp-39": 5, // Практический опыт в разработке ER-моделей - экспертный уровень
          "comp-40": 5, // Знание банковских процессов и терминологии - экспертный уровень
          "comp-41": 5, // Знание основ разработки баз данных, хранилищ данных - экспертный уровень
          "comp-42": 5, // Практический опыт руководства сотрудниками нижнего звена - экспертный уровень
          "comp-43": 5, // Практический опыт руководства проектами - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 4, // Лидерство - продвинутый уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
        },
        taskExamples: [
          "Разработать стратегию развития архитектуры глоссариев данных на 3 года, создать корпоративную методологию и стандарты, управлять портфелем проектов по внедрению, взаимодействовать с топ-менеджментом по вопросам управления данными",
          "Управлять крупным проектом по созданию единого корпоративного глоссария данных для всех направлений банка, координировать работу 10 архитекторов, взаимодействовать с IT по разработке системы управления глоссариями, провести обучение для 50 специалистов",
          "Выступить на конференции с докладом о лучших практиках построения глоссариев данных в финансовой сфере, провести исследование новых подходов к управлению данными, разработать инновационную методологию, внедрить в организации и обучить команду"
        ],
      },
      {
        level: "lead",
        name: "Начальник центра",
        description: "Высший уровень управления архитектурой глоссариев данных. Отвечает за руководство подразделением среднего звена, стратегическое развитие направления, управление ресурсами и развитие команды.",
        responsibilities: [
          "Руководство подразделением среднего звена (центр архитектуры данных)",
          "Стратегическое развитие направления архитектуры глоссариев данных",
          "Управление ресурсами и бюджетом подразделения",
          "Разработка стратегии на уровне организации",
          "Управление несколькими командами архитекторов",
          "Создание эффективных систем управления",
          "Взаимодействие с руководством организации",
          "Обучает других руководителей",
          "Формирование корпоративной культуры работы с данными",
        ],
        education: "Не ниже высшего образования (техническое, финансово-экономическое, ИТ, физико-математическое)",
        bankExperience: "Стаж работы по профилю деятельности в Банке: не менее 5 лет в сфере аналитики по управлению данными",
        externalExperience: "Опыт работы в финансово-кредитной сфере: не менее 5 лет. Опыт работы на позициях, включающих руководство подразделениями среднего звена (отдел/группа/центр): не менее 3 лет",
        requiredSkills: {
          "comp-36": 5, // Грамотная письменная речь - экспертный уровень
          "comp-37": 5, // Грамотная устная речь - экспертный уровень
          "comp-38": 5, // Практический опыт в построении глоссариев данных - экспертный уровень
          "comp-39": 5, // Практический опыт в разработке ER-моделей - экспертный уровень
          "comp-40": 5, // Знание банковских процессов и терминологии - экспертный уровень
          "comp-41": 5, // Знание основ разработки баз данных, хранилищ данных - экспертный уровень
          "comp-42": 5, // Практический опыт руководства сотрудниками нижнего звена - экспертный уровень
          "comp-43": 5, // Практический опыт руководства проектами - экспертный уровень
          "comp-44": 5, // Практический опыт руководства подразделениями среднего звена - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
          "comp-29": 5, // Ответственность - экспертный уровень
        },
        taskExamples: [
          "Руководить центром архитектуры данных из 15 специалистов, разработать стратегию развития направления на 5 лет, управлять бюджетом подразделения, координировать работу с другими подразделениями, формировать корпоративную культуру работы с данными",
          "Разработать и внедрить корпоративную стратегию управления данными на уровне всей организации, создать систему управления глоссариями данных, обучить 100 специалистов новым подходам, взаимодействовать с топ-менеджментом по вопросам data governance",
          "Провести трансформацию процессов работы с данными в организации, создать эффективные системы управления подразделением, развить команду из 20 архитекторов, обучить других руководителей методологиям управления данными, выступить на стратегическом совещании"
        ],
      },
    ],
    experts: [],
  },
  {
    id: "profile-sys-analyst",
    name: "Системный аналитик",
    description: "Специалист по анализу, проектированию и оптимизации информационных систем и бизнес-процессов",
    tfr: "аналитик",
    requiredCompetences: [],
    levels: [
      {
        level: "trainee",
        name: "Стажер-системный аналитик",
        description: "Стажер-системный аналитик. Начальный уровень, изучение основ системного анализа, работы с требованиями и моделирования под руководством ментора.",
        responsibilities: [
          "Изучение основ системного анализа и работы с требованиями",
          "Изучение базовых UML-диаграмм и нотаций моделирования",
          "Участие в сборе требований под руководством опытного аналитика",
          "Изучение бизнес-процессов организации",
          "Документирование простых требований по шаблонам",
          "Изучение работы с базами данных на базовом уровне",
          "Участие в интервью с заинтересованными сторонами",
          "Изучение корпоративных стандартов документирования",
        ],
        education: "Высшее техническое или экономическое образование (или неоконченное высшее)",
        bankExperience: "Стаж работы в банке не требуется",
        externalExperience: "Стаж работы на внешнем рынке не требуется",
        requiredSkills: {
          "comp-46": 1, // Системный анализ - начальный уровень
          "comp-47": 1, // Работа с требованиями - начальный уровень
          "comp-48": 1, // UML и моделирование процессов - начальный уровень
          "comp-5": 1, // Базы данных - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
          "comp-36": 1, // Грамотная письменная речь - начальный уровень
        },
        taskExamples: [
          "Провести интервью с одним пользователем системы для сбора базовых требований к новой функции, задокументировать требования по шаблону, создать простую диаграмму вариантов использования (use case)",
          "Изучить существующий бизнес-процесс обработки заявок, создать простую блок-схему процесса, выявить 3-5 основных шагов процесса и задокументировать их",
          "Проанализировать простую таблицу базы данных, описать её структуру и связи с другими таблицами, создать простую ER-диаграмму с 3-4 сущностями"
        ],
      },
      {
        level: "junior",
        name: "Младший системный аналитик",
        description: "Младший системный аналитик. Базовый уровень, способен самостоятельно собирать и документировать требования, создавать простые модели систем.",
        responsibilities: [
          "Сбор и документирование функциональных и нефункциональных требований",
          "Создание UML-диаграмм (варианты использования, последовательности, классов)",
          "Моделирование простых бизнес-процессов с использованием BPMN",
          "Проведение интервью с заинтересованными сторонами",
          "Анализ существующих систем и процессов",
          "Создание спецификаций требований",
          "Участие в воркшопах по сбору требований",
          "Работа с базами данных: чтение схем, понимание структуры данных",
          "Отслеживание изменений требований",
          "Участие в тестировании на основе требований",
        ],
        education: "Высшее техническое или экономическое образование",
        bankExperience: "Опыт работы в банке от 6 месяцев до 1 года",
        externalExperience: "Опыт работы на внешнем рынке от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-46": 2, // Системный анализ - базовый уровень
          "comp-47": 2, // Работа с требованиями - базовый уровень
          "comp-48": 2, // UML и моделирование процессов - базовый уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
          "comp-23": 2, // Понимание бизнеса - базовый уровень
          "comp-24": 2, // Управление данными - базовый уровень
          "comp-36": 2, // Грамотная письменная речь - базовый уровень
          "comp-37": 2, // Грамотная устная речь - базовый уровень
        },
        taskExamples: [
          "Провести серию интервью с 5-7 заинтересованными сторонами для сбора требований к новой функциональности системы, создать детальную спецификацию требований с приоритетами, разработать диаграммы вариантов использования и последовательности",
          "Проанализировать существующий бизнес-процесс обработки кредитных заявок, создать BPMN-диаграмму процесса, выявить узкие места и предложить 3-5 улучшений процесса",
          "Изучить схему базы данных из 10-15 таблиц, создать ER-диаграмму, описать связи между таблицами, выявить недостающие индексы и предложить оптимизации"
        ],
      },
      {
        level: "middle",
        name: "Системный аналитик",
        description: "Системный аналитик среднего уровня. Способен самостоятельно анализировать сложные системы, проектировать решения, управлять требованиями на протяжении всего жизненного цикла проекта.",
        responsibilities: [
          "Комплексный анализ систем и бизнес-процессов",
          "Проектирование решений для оптимизации систем",
          "Управление требованиями на всех этапах проекта",
          "Создание архитектурных моделей систем",
          "Проведение воркшопов по сбору требований",
          "Анализ влияния изменений требований",
          "Валидация требований с заинтересованными сторонами",
          "Работа с базами данных: проектирование схем, оптимизация запросов",
          "Создание технических заданий и спецификаций",
          "Координация работы с разработчиками и тестировщиками",
          "Менторинг junior аналитиков",
          "Участие в архитектурных решениях",
        ],
        education: "Высшее техническое или экономическое образование",
        bankExperience: "Опыт работы в банке от 1 до 3 лет",
        externalExperience: "Опыт работы на внешнем рынке от 1 до 3 лет",
        requiredSkills: {
          "comp-46": 3, // Системный анализ - средний уровень
          "comp-47": 3, // Работа с требованиями - средний уровень
          "comp-48": 3, // UML и моделирование процессов - средний уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-23": 3, // Понимание бизнеса - средний уровень
          "comp-24": 3, // Управление данными - средний уровень
          "comp-27": 2, // Управление системами и задачами - базовый уровень
          "comp-28": 2, // Профессионализм - базовый уровень
          "comp-36": 3, // Грамотная письменная речь - средний уровень
          "comp-37": 3, // Грамотная устная речь - средний уровень
        },
        taskExamples: [
          "Провести комплексный анализ существующей системы обработки платежей, выявить проблемы производительности и масштабируемости, спроектировать архитектурное решение с использованием микросервисной архитектуры, создать детальные спецификации для разработки",
          "Управлять требованиями для крупного проекта внедрения новой системы: провести 10+ воркшопов с заинтересованными сторонами, создать реестр требований из 200+ пунктов, управлять приоритетами и изменениями, валидировать требования с бизнесом и IT",
          "Спроектировать новую схему базы данных для системы управления клиентами: создать ER-модель из 20+ таблиц, оптимизировать производительность запросов, спроектировать индексы и партиционирование, создать миграционные скрипты"
        ],
      },
      {
        level: "senior",
        name: "Старший системный аналитик",
        description: "Старший системный аналитик. Экспертный уровень, способен проектировать сложные системы, разрабатывать методологии, принимать архитектурные решения и руководить командой аналитиков.",
        responsibilities: [
          "Проектирование архитектуры сложных распределенных систем",
          "Разработка методологий работы с требованиями и системного анализа",
          "Принятие ключевых архитектурных решений",
          "Управление требованиями для крупных проектов",
          "Создание корпоративных стандартов и регламентов",
          "Проведение технических интервью и оценка кандидатов",
          "Менторинг middle и junior аналитиков",
          "Участие в стратегическом планировании продуктов",
          "Работа с legacy системами и их модернизация",
          "Исследование новых подходов и технологий",
          "Координация работы нескольких команд аналитиков",
          "Взаимодействие с топ-менеджментом и стейкхолдерами",
        ],
        education: "Высшее техническое или экономическое образование",
        bankExperience: "Опыт работы в банке от 3 до 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 3 до 5 лет",
        requiredSkills: {
          "comp-46": 4, // Системный анализ - продвинутый уровень
          "comp-47": 4, // Работа с требованиями - продвинутый уровень
          "comp-48": 4, // UML и моделирование процессов - продвинутый уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-23": 4, // Понимание бизнеса - продвинутый уровень
          "comp-24": 4, // Управление данными - продвинутый уровень
          "comp-27": 3, // Управление системами и задачами - средний уровень
          "comp-28": 3, // Профессионализм - средний уровень
          "comp-29": 3, // Ответственность - средний уровень
          "comp-36": 4, // Грамотная письменная речь - продвинутый уровень
          "comp-37": 4, // Грамотная устная речь - продвинутый уровень
        },
        taskExamples: [
          "Спроектировать архитектуру высоконагруженной системы обработки транзакций: разработать микросервисную архитектуру, спроектировать схемы баз данных с репликацией и шардированием, создать модели интеграции с внешними системами, разработать стратегию масштабирования",
          "Разработать корпоративную методологию работы с требованиями для организации: создать стандарты документирования, процессы управления изменениями, шаблоны спецификаций, обучить 20+ аналитиков, внедрить систему управления требованиями",
          "Провести комплексный анализ legacy системы и разработать план модернизации: проанализировать текущую архитектуру, выявить технический долг, спроектировать новую архитектуру, создать план миграции с оценкой рисков, координировать работу команды из 5 аналитиков"
        ],
      },
      {
        level: "lead",
        name: "Ведущий системный аналитик",
        description: "Ведущий системный аналитик. Экспертный уровень, отвечает за техническое направление, архитектуру систем, разработку методологий и развитие команды аналитиков.",
        responsibilities: [
          "Определение стратегии системного анализа и архитектурного видения",
          "Проектирование масштабируемых и отказоустойчивых систем",
          "Руководство командой системных аналитиков",
          "Разработка корпоративных методологий и стандартов",
          "Принятие критических архитектурных решений",
          "Участие в стратегическом планировании на уровне организации",
          "Взаимодействие с топ-менеджментом и ключевыми стейкхолдерами",
          "Создание систем управления требованиями и архитектурой",
          "Исследование новых технологий и подходов",
          "Менторинг senior аналитиков",
          "Участие в конференциях и развитие профессионального сообщества",
          "Формирование корпоративной культуры системного анализа",
        ],
        education: "Высшее техническое или экономическое образование",
        bankExperience: "Опыт работы в банке от 5 лет",
        externalExperience: "Опыт работы на внешнем рынке от 5 лет. Опыт работы на позициях, включающих руководство командами аналитиков: не менее 3 лет",
        requiredSkills: {
          "comp-46": 5, // Системный анализ - экспертный уровень
          "comp-47": 5, // Работа с требованиями - экспертный уровень
          "comp-48": 5, // UML и моделирование процессов - экспертный уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
          "comp-29": 5, // Ответственность - экспертный уровень
          "comp-36": 5, // Грамотная письменная речь - экспертный уровень
          "comp-37": 5, // Грамотная устная речь - экспертный уровень
        },
        taskExamples: [
          "Разработать стратегию трансформации архитектуры информационных систем организации на 5 лет: провести анализ текущего состояния, спроектировать целевую архитектуру, создать план миграции, управлять портфелем проектов, взаимодействовать с топ-менеджментом",
          "Создать корпоративную методологию системного анализа и управления требованиями: разработать стандарты, процессы, инструменты, обучить 50+ аналитиков, внедрить систему управления требованиями, создать центр экспертизы",
          "Руководить командой из 15 системных аналитиков, разработать стратегию развития команды, управлять архитектурными решениями для 10+ проектов одновременно, провести трансформацию процессов работы с требованиями, выступить на конференции с докладом"
        ],
      },
    ],
    experts: [],
  },
];

const defaultCareerTracks: CareerTrack[] = [
  {
    id: "track-1",
    name: "Perl Developer Track",
    description: "Карьерный трек для разработчиков Perl",
    profileId: "profile-1",
    levels: [
      {
        level: 1,
        name: "Стажер-разработчик Perl",
        description: "Стажер-разработчик Perl. Начальный уровень, изучение основ языка и инструментов разработки под руководством ментора.",
        requiredSkills: {
          "comp-17": 1, // Perl - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Младший разработчик Perl",
        description: "Младший разработчик Perl. Базовый уровень, способен выполнять задачи средней сложности под минимальным руководством.",
        requiredSkills: {
          "comp-17": 2, // Perl - базовый уровень
          "comp-18": 2, // Веб-разработка на Perl - базовый уровень
          "comp-19": 1, // Тестирование в Perl - начальный уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        minMatchPercentage: 65,
      },
      {
        level: 3,
        name: "Разработчик Perl",
        description: "Разработчик Perl среднего уровня. Способен самостоятельно решать сложные задачи, проектировать модули и компоненты системы.",
        requiredSkills: {
          "comp-17": 3, // Perl - средний уровень
          "comp-18": 3, // Веб-разработка на Perl - средний уровень
          "comp-19": 2, // Тестирование в Perl - базовый уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 4,
        name: "Старший разработчик Perl",
        description: "Старший разработчик Perl. Экспертный уровень, способен проектировать сложные системы, принимать архитектурные решения и руководить командой.",
        requiredSkills: {
          "comp-17": 4, // Perl - продвинутый уровень
          "comp-18": 4, // Веб-разработка на Perl - продвинутый уровень
          "comp-19": 3, // Тестирование в Perl - средний уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 5,
        name: "Ведущий разработчик Perl",
        description: "Ведущий разработчик Perl. Экспертный уровень, отвечает за техническое направление, архитектуру систем и развитие команды разработки.",
        requiredSkills: {
          "comp-17": 5, // Perl - экспертный уровень
          "comp-18": 5, // Веб-разработка на Perl - экспертный уровень
          "comp-19": 4, // Тестирование в Perl - продвинутый уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
  {
    id: "track-2",
    name: "QA Automation Engineer Track",
    description: "Карьерный трек для инженеров по автотестированию",
    profileId: "profile-2",
    levels: [
      {
        level: 1,
        name: "Стажер-инженер по автотестированию",
        description: "Стажер по автотестированию. Начальный уровень, изучение основ автоматизации тестирования под руководством ментора.",
        requiredSkills: {
          "comp-20": 1, // Автотестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Младший инженер по автотестированию",
        description: "Младший инженер по автотестированию. Базовый уровень, способен разрабатывать простые автотесты под минимальным руководством.",
        requiredSkills: {
          "comp-20": 2, // Автотестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        minMatchPercentage: 65,
      },
      {
        level: 3,
        name: "Инженер по автотестированию",
        description: "Инженер по автотестированию среднего уровня. Способен самостоятельно создавать комплексные тестовые фреймворки и решать сложные задачи.",
        requiredSkills: {
          "comp-20": 3, // Автотестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-21": 2, // Ручное тестирование - базовый уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 4,
        name: "Старший инженер по автотестированию",
        description: "Старший инженер по автотестированию. Экспертный уровень, способен проектировать тестовую архитектуру и принимать архитектурные решения.",
        requiredSkills: {
          "comp-20": 4, // Автотестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-21": 3, // Ручное тестирование - средний уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-6": 3, // Архитектура - средний уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 5,
        name: "Ведущий инженер по автотестированию",
        description: "Ведущий инженер по автотестированию. Экспертный уровень, отвечает за техническое направление, тестовую архитектуру и развитие команды.",
        requiredSkills: {
          "comp-20": 5, // Автотестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-21": 4, // Ручное тестирование - продвинутый уровень
          "comp-8": 4, // DevOps - продвинутый уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
  {
    id: "track-3",
    name: "Manual QA Engineer Track",
    description: "Карьерный трек для инженеров по ручному тестированию",
    profileId: "profile-3",
    levels: [
      {
        level: 1,
        name: "Стажер-инженер по ручному тестированию",
        description: "Стажер по ручному тестированию. Начальный уровень, изучение основ тестирования под руководством ментора.",
        requiredSkills: {
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Младший инженер по ручному тестированию",
        description: "Младший инженер по ручному тестированию. Базовый уровень, способен выполнять тестирование функциональности под минимальным руководством.",
        requiredSkills: {
          "comp-21": 2, // Ручное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
        },
        minMatchPercentage: 65,
      },
      {
        level: 3,
        name: "Инженер по ручному тестированию",
        description: "Инженер по ручному тестированию среднего уровня. Способен самостоятельно создавать тест-планы и выполнять комплексное тестирование.",
        requiredSkills: {
          "comp-21": 3, // Ручное тестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 4,
        name: "Старший инженер по ручному тестированию",
        description: "Старший инженер по ручному тестированию. Экспертный уровень, способен проектировать тестовые стратегии и управлять тестированием.",
        requiredSkills: {
          "comp-21": 4, // Ручное тестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 5,
        name: "Ведущий инженер по ручному тестированию",
        description: "Ведущий инженер по ручному тестированию. Экспертный уровень, отвечает за построение процессов тестирования и развитие команды.",
        requiredSkills: {
          "comp-21": 5, // Ручное тестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
  {
    id: "track-4",
    name: "Performance QA Engineer Track",
    description: "Карьерный трек для инженеров по нагрузочному тестированию",
    profileId: "profile-4",
    levels: [
      {
        level: 1,
        name: "Стажер-инженер по нагрузочному тестированию",
        description: "Стажер по нагрузочному тестированию. Начальный уровень, изучение основ нагрузочного тестирования под руководством ментора.",
        requiredSkills: {
          "comp-22": 1, // Нагрузочное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Младший инженер по нагрузочному тестированию",
        description: "Младший инженер по нагрузочному тестированию. Базовый уровень, способен создавать нагрузочные сценарии под минимальным руководством.",
        requiredSkills: {
          "comp-22": 2, // Нагрузочное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
        minMatchPercentage: 65,
      },
      {
        level: 3,
        name: "Инженер по нагрузочному тестированию",
        description: "Инженер по нагрузочному тестированию среднего уровня. Способен самостоятельно проектировать комплексные нагрузочные тесты.",
        requiredSkills: {
          "comp-22": 3, // Нагрузочное тестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 4,
        name: "Старший инженер по нагрузочному тестированию",
        description: "Старший инженер по нагрузочному тестированию. Экспертный уровень, способен проектировать стратегии нагрузочного тестирования.",
        requiredSkills: {
          "comp-22": 4, // Нагрузочное тестирование - продвинутый уровень
          "comp-7": 4, // Тестирование - продвинутый уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-8": 2, // DevOps - базовый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 5,
        name: "Ведущий инженер по нагрузочному тестированию",
        description: "Ведущий инженер по нагрузочному тестированию. Экспертный уровень, отвечает за построение процессов тестирования производительности.",
        requiredSkills: {
          "comp-22": 5, // Нагрузочное тестирование - экспертный уровень
          "comp-7": 5, // Тестирование - экспертный уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-8": 3, // DevOps - средний уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
  {
    id: "track-5",
    name: "Розничный тренер колл-центра Track",
    description: "Карьерный трек для тренеров колл-центра",
    profileId: "profile-5",
    levels: [
      {
        level: 1,
        name: "Тренер КЦ",
        description: "Тренер колл-центра среднего уровня. Проводит продуктовое и навыковое обучение сотрудников первой линии, разрабатывает обучающие материалы, проводит оценочные процедуры",
        requiredSkills: {
          "comp-30": 3, // Знание продуктов и услуг Банка - средний уровень
          "comp-31": 3, // Знание инструментов и методов оценки - средний уровень
          "comp-34": 3, // Понимание принципа обучения взрослых - средний уровень
          "comp-23": 3, // Понимание бизнеса - средний уровень
          "comp-24": 3, // Управление данными - средний уровень
          "comp-25": 3, // Цифровая грамотность - средний уровень
          "comp-26": 3, // Человекоцентричность - средний уровень
          "comp-27": 3, // Управление системами и задачами - средний уровень
          "comp-28": 3, // Профессионализм - средний уровень
          "comp-29": 3, // Ответственность - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 2,
        name: "Старший тренер КЦ",
        description: "Старший тренер колл-центра. Проводит обучение сотрудников экспертной линии и премиум, разрабатывает тренинг-планы, анализирует результаты оценочных процедур, обучает новых тренеров",
        requiredSkills: {
          "comp-30": 4, // Знание продуктов и услуг Банка - продвинутый уровень
          "comp-31": 4, // Знание инструментов и методов оценки - продвинутый уровень
          "comp-32": 4, // Навык публичных выступлений - продвинутый уровень
          "comp-33": 4, // Знание показателей бизнеса - продвинутый уровень
          "comp-34": 4, // Понимание принципа обучения взрослых - продвинутый уровень
          "comp-35": 4, // Навык работы в ПО банка - продвинутый уровень
          "comp-23": 4, // Понимание бизнеса - продвинутый уровень
          "comp-24": 4, // Управление данными - продвинутый уровень
          "comp-25": 4, // Цифровая грамотность - продвинутый уровень
          "comp-26": 4, // Человекоцентричность - продвинутый уровень
          "comp-27": 4, // Управление системами и задачами - продвинутый уровень
          "comp-28": 4, // Профессионализм - продвинутый уровень
          "comp-29": 4, // Ответственность - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 3,
        name: "Главный тренер КЦ",
        description: "Главный тренер колл-центра. Проводит обучение руководящего состава, разрабатывает программы обучения для управленческого состава, проводит мастер-майнды и фасилитационные сессии, разрабатывает оценочные процедуры для отдела обучения, работает в АС Банка",
        requiredSkills: {
          "comp-30": 5, // Знание продуктов и услуг Банка - экспертный уровень
          "comp-31": 5, // Знание инструментов и методов оценки - экспертный уровень
          "comp-32": 5, // Навык публичных выступлений - экспертный уровень
          "comp-33": 5, // Знание показателей бизнеса - экспертный уровень
          "comp-34": 5, // Понимание принципа обучения взрослых - экспертный уровень
          "comp-35": 5, // Навык работы в ПО банка - экспертный уровень
          "comp-36": 5, // Навык снятия запроса у заказчика - экспертный уровень
          "comp-37": 5, // Умение сформировать трек развития - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-25": 5, // Цифровая грамотность - экспертный уровень
          "comp-26": 5, // Человекоцентричность - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
          "comp-29": 5, // Ответственность - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
  {
    id: "track-sys-analyst",
    name: "Системный аналитик Track",
    description: "Карьерный трек для системных аналитиков",
    profileId: "profile-sys-analyst",
    levels: [
      {
        level: 1,
        name: "Стажер-системный аналитик",
        description: "Стажер-системный аналитик. Начальный уровень, изучение основ системного анализа, работы с требованиями и моделирования под руководством ментора.",
        requiredSkills: {
          "comp-46": 1, // Системный анализ - начальный уровень
          "comp-47": 1, // Работа с требованиями - начальный уровень
          "comp-48": 1, // UML и моделирование процессов - начальный уровень
          "comp-5": 1, // Базы данных - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
          "comp-36": 1, // Грамотная письменная речь - начальный уровень
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Младший системный аналитик",
        description: "Младший системный аналитик. Базовый уровень, способен самостоятельно собирать и документировать требования, создавать простые модели систем.",
        requiredSkills: {
          "comp-46": 2, // Системный анализ - базовый уровень
          "comp-47": 2, // Работа с требованиями - базовый уровень
          "comp-48": 2, // UML и моделирование процессов - базовый уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
          "comp-23": 2, // Понимание бизнеса - базовый уровень
          "comp-24": 2, // Управление данными - базовый уровень
          "comp-36": 2, // Грамотная письменная речь - базовый уровень
          "comp-37": 2, // Грамотная устная речь - базовый уровень
        },
        minMatchPercentage: 65,
      },
      {
        level: 3,
        name: "Системный аналитик",
        description: "Системный аналитик среднего уровня. Способен самостоятельно анализировать сложные системы, проектировать решения, управлять требованиями на протяжении всего жизненного цикла проекта.",
        requiredSkills: {
          "comp-46": 3, // Системный анализ - средний уровень
          "comp-47": 3, // Работа с требованиями - средний уровень
          "comp-48": 3, // UML и моделирование процессов - средний уровень
          "comp-5": 3, // Базы данных - средний уровень
          "comp-6": 2, // Архитектура - базовый уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-23": 3, // Понимание бизнеса - средний уровень
          "comp-24": 3, // Управление данными - средний уровень
          "comp-27": 2, // Управление системами и задачами - базовый уровень
          "comp-28": 2, // Профессионализм - базовый уровень
          "comp-36": 3, // Грамотная письменная речь - средний уровень
          "comp-37": 3, // Грамотная устная речь - средний уровень
        },
        minMatchPercentage: 70,
      },
      {
        level: 4,
        name: "Старший системный аналитик",
        description: "Старший системный аналитик. Экспертный уровень, способен проектировать сложные системы, разрабатывать методологии, принимать архитектурные решения и руководить командой аналитиков.",
        requiredSkills: {
          "comp-46": 4, // Системный анализ - продвинутый уровень
          "comp-47": 4, // Работа с требованиями - продвинутый уровень
          "comp-48": 4, // UML и моделирование процессов - продвинутый уровень
          "comp-5": 4, // Базы данных - продвинутый уровень
          "comp-6": 4, // Архитектура - продвинутый уровень
          "comp-9": 4, // Коммуникация - продвинутый уровень
          "comp-10": 4, // Работа в команде - продвинутый уровень
          "comp-11": 3, // Лидерство - средний уровень
          "comp-12": 4, // Решение проблем - продвинутый уровень
          "comp-13": 4, // Управление временем - продвинутый уровень
          "comp-15": 4, // Критическое мышление - продвинутый уровень
          "comp-23": 4, // Понимание бизнеса - продвинутый уровень
          "comp-24": 4, // Управление данными - продвинутый уровень
          "comp-27": 3, // Управление системами и задачами - средний уровень
          "comp-28": 3, // Профессионализм - средний уровень
          "comp-29": 3, // Ответственность - средний уровень
          "comp-36": 4, // Грамотная письменная речь - продвинутый уровень
          "comp-37": 4, // Грамотная устная речь - продвинутый уровень
        },
        minMatchPercentage: 75,
      },
      {
        level: 5,
        name: "Ведущий системный аналитик",
        description: "Ведущий системный аналитик. Экспертный уровень, отвечает за техническое направление, архитектуру систем, разработку методологий и развитие команды аналитиков.",
        requiredSkills: {
          "comp-46": 5, // Системный анализ - экспертный уровень
          "comp-47": 5, // Работа с требованиями - экспертный уровень
          "comp-48": 5, // UML и моделирование процессов - экспертный уровень
          "comp-5": 5, // Базы данных - экспертный уровень
          "comp-6": 5, // Архитектура - экспертный уровень
          "comp-9": 5, // Коммуникация - экспертный уровень
          "comp-10": 5, // Работа в команде - экспертный уровень
          "comp-11": 5, // Лидерство - экспертный уровень
          "comp-12": 5, // Решение проблем - экспертный уровень
          "comp-13": 5, // Управление временем - экспертный уровень
          "comp-15": 5, // Критическое мышление - экспертный уровень
          "comp-23": 5, // Понимание бизнеса - экспертный уровень
          "comp-24": 5, // Управление данными - экспертный уровень
          "comp-27": 5, // Управление системами и задачами - экспертный уровень
          "comp-28": 5, // Профессионализм - экспертный уровень
          "comp-29": 5, // Ответственность - экспертный уровень
          "comp-36": 5, // Грамотная письменная речь - экспертный уровень
          "comp-37": 5, // Грамотная устная речь - экспертный уровень
        },
        minMatchPercentage: 80,
      },
    ],
  },
];

// Утилиты
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// === КОМПЕТЕНЦИИ ===

export function getCompetences(): Competence[] {
  const stored = getFromStorage<Competence[]>(COMPETENCES_KEY, []);
  // Если в хранилище нет данных, используем данные по умолчанию
  if (stored.length === 0) {
    return defaultCompetences;
  }
  // Обеспечиваем обратную совместимость: если у компетенции нет уровней, добавляем пустые
  // Если у компетенции есть category вместо type, преобразуем её в type
  // Обновляем ресурсы из defaultCompetences, если их нет или они пустые
  let needsMigration = false;
  const defaultCompetencesMap = new Map(defaultCompetences.map(comp => [comp.id, comp]));
  
  const migrated = stored.map((comp: unknown) => {
    if (!comp || typeof comp !== 'object') {
      throw new Error('Invalid competence data');
    }
    const compObj = comp as Record<string, unknown>;
    if ('category' in compObj && !('type' in compObj)) {
      needsMigration = true;
    }
    
    // Получаем ресурсы из defaultCompetences, если они есть
    const compId = typeof compObj.id === 'string' ? compObj.id : '';
    const defaultComp = defaultCompetencesMap.get(compId);
    const compResources = compObj.resources as { literature?: unknown[]; videos?: unknown[]; courses?: unknown[] } | undefined;
    const hasResources = compResources && 
      ((Array.isArray(compResources.literature) && compResources.literature.length > 0) || 
       (Array.isArray(compResources.videos) && compResources.videos.length > 0) || 
       (Array.isArray(compResources.courses) && compResources.courses.length > 0));
    
    // Проверяем, есть ли ресурсы в старом формате (строки)
    const hasOldFormat = hasResources && compResources && 
      (typeof compResources.literature?.[0] === 'string' || 
       typeof compResources.videos?.[0] === 'string' || 
       typeof compResources.courses?.[0] === 'string');
    
    // Функция для конвертации старого формата (строки) в новый (объекты)
    const convertResources = (resources: { literature?: unknown[]; videos?: unknown[]; courses?: unknown[] } | undefined) => {
      if (!resources) return { literature: [], videos: [], courses: [] };
      
      const convertArray = (arr: unknown[]): Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }> => {
        if (!arr || arr.length === 0) return [];
        // Если это уже новый формат (объекты), возвращаем как есть
        if (typeof arr[0] === 'object' && arr[0] !== null && 'name' in arr[0] && arr[0].name !== undefined) {
          return arr as Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }>;
        }
        // Если это старый формат (строки), конвертируем в объекты с уровнем 2 по умолчанию
        return arr.map((item: unknown) => {
          if (typeof item === 'string') {
            return { name: item, level: 2 as 1 | 2 | 3 | 4 | 5 };
          }
          throw new Error('Invalid resource item format');
        });
      };
      
      return {
        literature: convertArray(resources.literature || []),
        videos: convertArray(resources.videos || []),
        courses: convertArray(resources.courses || []),
      };
    };
    
    // Если компетенция есть в defaultCompetences, всегда используем её ресурсы с правильными уровнями
    // Это гарантирует, что все ресурсы будут иметь правильные уровни, а не только level: 2
    let resources;
    if (defaultComp?.resources) {
      // Если компетенция есть в defaultCompetences, используем её ресурсы
      // Это гарантирует правильные уровни для всех ресурсов
      const defaultHasResources = defaultComp.resources.literature?.length > 0 || 
                                   defaultComp.resources.videos?.length > 0 || 
                                   defaultComp.resources.courses?.length > 0;
      
      if (defaultHasResources) {
        // Используем ресурсы из defaultCompetences, если они есть
        resources = defaultComp.resources;
        // Проверяем, нужно ли обновить ресурсы (если они отличаются от сохраненных)
        if (!hasResources || hasOldFormat || 
            JSON.stringify(compResources) !== JSON.stringify(defaultComp.resources)) {
          needsMigration = true;
        }
      } else if (hasResources) {
        // Если в defaultCompetences нет ресурсов, но есть сохраненные, используем их
        resources = convertResources(compResources);
        if (hasOldFormat) {
          needsMigration = true;
        }
      } else {
        // Если ресурсов нет нигде, используем пустые
        resources = {
          literature: [],
          videos: [],
          courses: [],
        };
      }
    } else if (hasResources) {
      // Если компетенции нет в defaultCompetences (пользовательская), используем сохраненные ресурсы
      resources = convertResources(compResources);
      if (hasOldFormat) {
        needsMigration = true;
      }
    } else {
      // Если ресурсов нет, используем пустые
      resources = {
        literature: [],
        videos: [],
        courses: [],
      };
    }
    
    const result: Competence = {
      ...(compObj as unknown as Competence),
      id: compId,
      type: (typeof compObj.type === 'string' ? compObj.type : ('category' in compObj ? "профессиональные компетенции" : "профессиональные компетенции")) as Competence['type'],
      levels: (compObj.levels && typeof compObj.levels === 'object' ? compObj.levels : {
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        level5: "",
      }) as Competence['levels'],
      resources: resources,
    } as Competence;
    // Удаляем category, если она есть (она не входит в тип Competence)
    if ('category' in result) {
      delete (result as Record<string, unknown>).category;
    }
    if (!compResources) {
      needsMigration = true;
    }
    return result;
  });
  
  // Создаем карту ID компетенций из defaultCompetences для быстрого поиска
  const defaultIds = new Set(defaultCompetences.map(comp => comp.id));
  
  // Обновляем существующие компетенции данными из defaultCompetences
  // Всегда обновляем компетенции из defaultCompetences, чтобы гарантировать актуальность данных
  const updated = migrated.map((comp: Competence) => {
    const defaultComp = defaultCompetencesMap.get(comp.id);
    if (defaultComp) {
      // Если компетенция есть в defaultCompetences, всегда обновляем её данными оттуда
      // Это гарантирует, что данные всегда актуальны
      // Проверяем, изменились ли данные, и если да - помечаем для миграции
      const compStr = JSON.stringify(comp);
      const defaultStr = JSON.stringify(defaultComp);
      if (compStr !== defaultStr) {
        needsMigration = true;
      }
      // Всегда возвращаем данные из defaultCompetences для гарантии актуальности
      return defaultComp;
    }
    return comp;
  });
  
  // Принудительно обновляем данные, если есть компетенции из defaultCompetences
  // Это гарантирует, что новые компетенции и обновления всегда применяются
  if (updated.some(comp => defaultCompetencesMap.has(comp.id))) {
    needsMigration = true;
  }
  
  // Удаляем компетенции, которых больше нет в defaultCompetences (кроме пользовательских)
  // Пользовательские компетенции имеют ID, которых нет в defaultCompetences
  const filtered = updated.filter((comp: Competence) => {
    // Если это компетенция из defaultCompetences, но её больше нет там - удаляем
    // Если это пользовательская компетенция (ID не начинается с comp- или не в списке) - оставляем
    const isDefaultId = comp.id.startsWith('comp-') && comp.id.match(/^comp-\d+$/);
    if (isDefaultId && !defaultIds.has(comp.id)) {
      needsMigration = true;
      return false; // Удаляем
    }
    return true; // Оставляем
  });
  
  // Добавляем недостающие компетенции из defaultCompetences
  const filteredIds = new Set(filtered.map((c: Competence) => c.id));
  const missingCompetences = defaultCompetences.filter(comp => !filteredIds.has(comp.id));
  
  if (missingCompetences.length > 0) {
    filtered.push(...missingCompetences);
    needsMigration = true;
  }
  
  // Сохраняем мигрированные данные обратно в localStorage
  if (needsMigration) {
    saveToStorage(COMPETENCES_KEY, filtered);
  }
  
  return filtered;
}

export function getCompetenceById(id: string): Competence | undefined {
  const competences = getCompetences();
  return competences.find((c) => c.id === id);
}

export function createCompetence(competence: Omit<Competence, "id">): Competence {
  const competences = getCompetences();
  const newCompetence: Competence = {
    ...competence,
    id: generateId("comp"),
    levels: competence.levels || {
      level1: "",
      level2: "",
      level3: "",
      level4: "",
      level5: "",
    },
  };
  competences.push(newCompetence);
  saveToStorage(COMPETENCES_KEY, competences);
  return newCompetence;
}

export function updateCompetence(id: string, updates: Partial<Omit<Competence, "id">>): Competence | null {
  const competences = getCompetences();
  const index = competences.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  competences[index] = { ...competences[index], ...updates };
  saveToStorage(COMPETENCES_KEY, competences);
  return competences[index];
}

export function deleteCompetence(id: string): boolean {
  const competences = getCompetences();
  const index = competences.findIndex((c) => c.id === id);
  if (index === -1) return false;
  
  competences.splice(index, 1);
  saveToStorage(COMPETENCES_KEY, competences);
  
  // Также нужно удалить эту компетенцию из всех профилей
  const profiles = getProfiles();
  profiles.forEach((profile) => {
    profile.requiredCompetences = profile.requiredCompetences.filter(
      (c) => c.competenceId !== id
    );
  });
  saveToStorage(PROFILES_KEY, profiles);
  
  // И из всех карьерных треков
  const tracks = getCareerTracks();
  tracks.forEach((track) => {
    track.levels.forEach((level) => {
      if (level.requiredSkills[id]) {
        delete level.requiredSkills[id];
      }
    });
  });
  saveToStorage(CAREER_TRACKS_KEY, tracks);
  
  return true;
}

// === ПРОФИЛИ ===

// Функция для актуализации требуемых компетенций на основе уровней профиля
function updateRequiredCompetencesFromLevels(profile: Profile): Profile {
  if (!profile.levels || profile.levels.length === 0) {
    return profile;
  }

  // Собираем все компетенции из всех уровней
  const competencesMap = new Map<string, SkillLevel>();

  profile.levels.forEach((level) => {
    Object.entries(level.requiredSkills).forEach(([competenceId, levelValue]) => {
      const currentLevel = competencesMap.get(competenceId);
      // Берем максимальный уровень для каждой компетенции
      if (!currentLevel || levelValue > currentLevel) {
        competencesMap.set(competenceId, levelValue);
      }
    });
  });

  // Формируем массив требуемых компетенций
  const requiredCompetences: ProfileCompetence[] = Array.from(competencesMap.entries()).map(
    ([competenceId, requiredLevel]) => ({
      competenceId,
      requiredLevel,
    })
  );

  return {
    ...profile,
    requiredCompetences,
  };
}

export function getProfiles(): Profile[] {
  const stored = getFromStorage<Profile[]>(PROFILES_KEY, []);
  // Если в хранилище нет данных, используем данные по умолчанию
  if (stored.length === 0) {
    return defaultProfiles.map(profile => updateRequiredCompetencesFromLevels(profile));
  }
  
  // Создаем карту ID профилей из defaultProfiles для быстрого поиска
  // Актуализируем профили перед созданием карты
  const updatedDefaultProfiles = defaultProfiles.map(profile => updateRequiredCompetencesFromLevels(profile));
  const defaultProfilesMap = new Map(updatedDefaultProfiles.map(profile => [profile.id, profile]));
  const defaultIds = new Set(updatedDefaultProfiles.map(profile => profile.id));
  
  let needsMigration = false;
  
  // Обновляем существующие профили данными из defaultProfiles
  // Также удаляем поле weight из компетенций (миграция)
  const updated = stored.map((profile: unknown) => {
    if (!profile || typeof profile !== 'object') {
      throw new Error('Invalid profile data');
    }
    const profileObj = profile as Record<string, unknown>;
    const profileId = typeof profileObj.id === 'string' ? profileObj.id : '';
    const defaultProfile = defaultProfilesMap.get(profileId);
    
    // Удаляем weight из компетенций, если оно есть
    const requiredCompetences = Array.isArray(profileObj.requiredCompetences) 
      ? profileObj.requiredCompetences as Array<Record<string, unknown>>
      : [];
    const hasWeight = requiredCompetences.some((comp) => 'weight' in comp);
    if (hasWeight) {
      needsMigration = true;
      profileObj.requiredCompetences = requiredCompetences.map((comp) => {
        const { weight, ...rest } = comp;
        return rest;
      });
    }
    
    let finalProfile: Profile;
    if (defaultProfile) {
      // Если профиль есть в defaultProfiles, обновляем его данными оттуда,
      // но сохраняем пользовательские данные (experts, education, bankExperience, externalExperience)
      needsMigration = true;
      
      // Сохраняем только пользовательских экспертов (они могут быть добавлены вручную)
      const userExperts = 'experts' in profileObj && Array.isArray(profileObj.experts) ? profileObj.experts : undefined;
      
      // Всегда используем данные из defaultProfile для гарантии актуальности
      // Это включает education, bankExperience, externalExperience, responsibilities и другие поля
      finalProfile = {
        ...defaultProfile,
        // Сохраняем пользовательских экспертов, если они есть
        experts: userExperts && userExperts.length > 0 ? userExperts : defaultProfile.experts,
      };
    } else {
      finalProfile = profileObj as unknown as Profile;
    }
    
    // Актуализируем требуемые компетенции на основе уровней профиля
    if (finalProfile.levels && finalProfile.levels.length > 0) {
      const updatedProfile = updateRequiredCompetencesFromLevels(finalProfile);
      if (JSON.stringify(updatedProfile.requiredCompetences) !== JSON.stringify(finalProfile.requiredCompetences)) {
        needsMigration = true;
        return updatedProfile;
      }
    }
    
    return finalProfile;
  });
  
  // Удаляем профили, которых больше нет в defaultProfiles (кроме пользовательских)
  // Пользовательские профили имеют ID, которых нет в defaultProfiles
  const filtered = updated.filter((profile: Profile) => {
    // Если это профиль из defaultProfiles, но его больше нет там - удаляем
    // Если это пользовательский профиль (ID не начинается с profile- или не в списке) - оставляем
    const isDefaultId = profile.id.startsWith('profile-') && profile.id.match(/^profile-\d+$/);
    if (isDefaultId && !defaultIds.has(profile.id)) {
      needsMigration = true;
      return false; // Удаляем
    }
    return true; // Оставляем
  });
  
  // Добавляем недостающие профили из defaultProfiles
  const filteredIds = new Set(filtered.map((p: Profile) => p.id));
  const missingProfiles = updatedDefaultProfiles.filter(profile => !filteredIds.has(profile.id));
  
  if (missingProfiles.length > 0) {
    filtered.push(...missingProfiles);
    needsMigration = true;
  }
  
  // Актуализируем требуемые компетенции для всех профилей на основе их уровней
  const finalProfiles = filtered.map(profile => {
    if (profile.levels && profile.levels.length > 0) {
      const updated = updateRequiredCompetencesFromLevels(profile);
      if (JSON.stringify(updated.requiredCompetences) !== JSON.stringify(profile.requiredCompetences)) {
        needsMigration = true;
        return updated;
      }
    }
    return profile;
  });
  
  // Сохраняем мигрированные данные обратно в localStorage
  if (needsMigration) {
    saveToStorage(PROFILES_KEY, finalProfiles);
  }
  
  return finalProfiles;
}

export function getProfileById(id: string): Profile | undefined {
  const profiles = getProfiles();
  return profiles.find((p) => p.id === id);
}

export function createProfile(profile: Omit<Profile, "id">): Profile {
  const profiles = getProfiles();
  const newProfile: Profile = {
    ...profile,
    id: generateId("profile"),
  };
  profiles.push(newProfile);
  saveToStorage(PROFILES_KEY, profiles);
  return newProfile;
}

export function updateProfile(id: string, updates: Partial<Omit<Profile, "id">>): Profile | null {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  profiles[index] = { ...profiles[index], ...updates };
  saveToStorage(PROFILES_KEY, profiles);
  return profiles[index];
}

export function deleteProfile(id: string): boolean {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return false;
  
  profiles.splice(index, 1);
  saveToStorage(PROFILES_KEY, profiles);
  
  // Также нужно удалить все карьерные треки, связанные с этим профилем
  const tracks = getCareerTracks();
  const filteredTracks = tracks.filter((t) => t.profileId !== id);
  saveToStorage(CAREER_TRACKS_KEY, filteredTracks);
  
  return true;
}

// === КАРЬЕРНЫЕ ТРЕКИ ===

export function getCareerTracks(): CareerTrack[] {
  const stored = getFromStorage<CareerTrack[]>(CAREER_TRACKS_KEY, []);
  // Если в хранилище нет данных, используем данные по умолчанию
  if (stored.length === 0) {
    return defaultCareerTracks;
  }
  
  // Создаем карту ID треков из defaultCareerTracks для быстрого поиска
  const defaultTracksMap = new Map(defaultCareerTracks.map(track => [track.id, track]));
  const defaultIds = new Set(defaultCareerTracks.map(track => track.id));
  
  let needsMigration = false;
  
  // Обновляем существующие треки данными из defaultCareerTracks
  // Всегда обновляем треки из defaultCareerTracks, чтобы гарантировать актуальность данных
  const updated = stored.map((track: CareerTrack) => {
    const defaultTrack = defaultTracksMap.get(track.id);
    if (defaultTrack) {
      // Если трек есть в defaultCareerTracks, всегда обновляем его данными оттуда
      // Проверяем, изменились ли данные
      const trackStr = JSON.stringify(track);
      const defaultStr = JSON.stringify(defaultTrack);
      if (trackStr !== defaultStr) {
        needsMigration = true;
      }
      // Всегда возвращаем данные из defaultCareerTracks для гарантии актуальности
      return defaultTrack;
    }
    return track;
  });
  
  // Принудительно обновляем данные, если есть треки из defaultCareerTracks
  if (updated.some(track => defaultTracksMap.has(track.id))) {
    needsMigration = true;
  }
  
  // Удаляем треки, которых больше нет в defaultCareerTracks (кроме пользовательских)
  // Пользовательские треки имеют ID, которых нет в defaultCareerTracks
  const filtered = updated.filter((track: CareerTrack) => {
    // Если это трек из defaultCareerTracks, но его больше нет там - удаляем
    // Если это пользовательский трек (ID не начинается с track- или не в списке) - оставляем
    const isDefaultId = track.id.startsWith('track-') && track.id.match(/^track-\d+$/);
    if (isDefaultId && !defaultIds.has(track.id)) {
      needsMigration = true;
      return false; // Удаляем
    }
    return true; // Оставляем
  });
  
  // Добавляем недостающие треки из defaultCareerTracks
  const filteredIds = new Set(filtered.map((t: CareerTrack) => t.id));
  const missingTracks = defaultCareerTracks.filter(track => !filteredIds.has(track.id));
  
  if (missingTracks.length > 0) {
    filtered.push(...missingTracks);
    needsMigration = true;
  }
  
  // Сохраняем мигрированные данные обратно в localStorage
  if (needsMigration) {
    saveToStorage(CAREER_TRACKS_KEY, filtered);
  }
  
  return filtered;
}

export function getCareerTrackById(id: string): CareerTrack | undefined {
  const tracks = getCareerTracks();
  return tracks.find((t) => t.id === id);
}

export function getCareerTrackByProfileId(profileId: string): CareerTrack | undefined {
  const tracks = getCareerTracks();
  return tracks.find((t) => t.profileId === profileId);
}

export function createCareerTrack(track: Omit<CareerTrack, "id">): CareerTrack {
  const tracks = getCareerTracks();
  const newTrack: CareerTrack = {
    ...track,
    id: generateId("track"),
  };
  tracks.push(newTrack);
  saveToStorage(CAREER_TRACKS_KEY, tracks);
  return newTrack;
}

export function updateCareerTrack(id: string, updates: Partial<Omit<CareerTrack, "id">>): CareerTrack | null {
  const tracks = getCareerTracks();
  const index = tracks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  
  tracks[index] = { ...tracks[index], ...updates };
  saveToStorage(CAREER_TRACKS_KEY, tracks);
  return tracks[index];
}

export function deleteCareerTrack(id: string): boolean {
  const tracks = getCareerTracks();
  const index = tracks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  
  tracks.splice(index, 1);
  saveToStorage(CAREER_TRACKS_KEY, tracks);
  return true;
}


