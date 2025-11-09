import type {
  Competence,
  Profile,
  CareerTrack,
  ProfileCompetence,
  SkillLevel,
} from "@/types";

// Ключи для localStorage
const COMPETENCES_KEY = "skillmap_competences";
const PROFILES_KEY = "skillmap_profiles";
const CAREER_TRACKS_KEY = "skillmap_career_tracks";

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
      level1: "Базовые навыки устного и письменного общения, понимание простых инструкций",
      level2: "Умение ясно выражать мысли, активное слушание, участие в обсуждениях",
      level3: "Эффективная коммуникация в команде, умение презентовать идеи, работа с обратной связью",
      level4: "Стратегическая коммуникация, управление сложными переговорами, влияние на решения",
      level5: "Экспертные навыки коммуникации, менторинг других, построение коммуникационных стратегий",
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
      level4: "Лидерство на уровне организации, формирование видения, управление изменениями",
      level5: "Трансформационное лидерство, построение лидерской культуры, развитие лидеров следующего уровня",
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
      level5: "Экспертные навыки решения проблем, создание методологий, менторинг в решении сложных задач",
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
      level5: "Экспертные навыки тайм-менеджмента, построение систем управления временем, менторинг",
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
      level5: "Экспертные навыки управления изменениями, построение адаптивных организаций, менторинг",
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
      level5: "Экспертные навыки критического мышления, создание аналитических методологий, менторинг",
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
      level5: "Экспертные навыки эмоционального интеллекта, развитие EQ в организации, менторинг",
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
    description: "Знание языка программирования Perl",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовый синтаксис Perl, переменные, типы данных, операторы, базовые структуры данных",
      level2: "Работа с массивами и хешами, регулярные выражения, функции, работа с файлами",
      level3: "Продвинутые регулярные выражения, ссылки, пакеты и модули, обработка ошибок",
      level4: "Объектно-ориентированное программирование, работа с CPAN, оптимизация кода, продвинутые паттерны",
      level5: "Экспертные знания Perl, создание модулей CPAN, системное программирование, менторинг",
    },
    resources: {
      literature: [
        { name: "Learning Perl - Рэндал Шварц, Брайан Фой, Том Феникс", level: 1 },
        { name: "Intermediate Perl - Рэндал Шварц, Брайан Фой", level: 2 },
        { name: "Programming Perl - Ларри Уолл, Том Кристиансен, Джон Орвант", level: 3 },
        { name: "Effective Perl Programming - Джозеф Холл", level: 4 },
        { name: "Perl Best Practices - Дэмиан Конуэй", level: 4 }
      ],
      videos: [
        { name: "Perl Tutorial for Beginners - ProgrammingKnowledge", level: 1 },
        { name: "Perl Programming - Derek Banas", level: 2 },
        { name: "Advanced Perl Programming - O'Reilly", level: 3 },
        { name: "Perl Regular Expressions - Tutorial", level: 3 },
        { name: "Perl Object-Oriented Programming - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Perl для начинающих - Stepik", level: 1 },
        { name: "Learn Perl - Codecademy", level: 2 },
        { name: "Perl Programming - Udemy", level: 2 },
        { name: "Advanced Perl Programming - Pluralsight", level: 4 },
        { name: "Mastering Perl - O'Reilly", level: 5 }
      ],
    },
  },
  {
    id: "comp-18",
    name: "Регулярные выражения в Perl",
    description: "Владение регулярными выражениями в Perl",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовые регулярные выражения, простые паттерны, метасимволы, квантификаторы",
      level2: "Группировка, захват групп, модификаторы, работа с Unicode, замена текста",
      level3: "Продвинутые конструкции, lookahead/lookbehind, рекурсивные паттерны, оптимизация",
      level4: "Сложные регулярные выражения, парсинг сложных структур, производительность, отладка",
      level5: "Экспертные знания regex, создание сложных парсеров, оптимизация производительности",
    },
    resources: {
      literature: [
        { name: "Mastering Regular Expressions - Джеффри Фридл", level: 3 },
        { name: "Regular Expressions Cookbook - Ян Гойвертс, Стивен Левитан", level: 3 },
        { name: "Learning Perl - глава о regex - Рэндал Шварц", level: 2 },
        { name: "Programming Perl - глава о регулярных выражениях - Ларри Уолл", level: 3 },
        { name: "Perl Regular Expressions - официальная документация", level: 2 }
      ],
      videos: [
        { name: "Perl Regular Expressions Tutorial - Tutorial", level: 2 },
        { name: "Advanced Perl Regex - O'Reilly", level: 3 },
        { name: "Regex Mastery in Perl - YouTube", level: 4 },
        { name: "Perl Regex Patterns - Tutorial", level: 2 },
        { name: "Complex Regex in Perl - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Регулярные выражения в Perl - Stepik", level: 2 },
        { name: "Perl Regular Expressions - Udemy", level: 2 },
        { name: "Mastering Regex in Perl - Pluralsight", level: 3 },
        { name: "Advanced Perl Regex - O'Reilly", level: 4 },
        { name: "Regex Expert in Perl - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-19",
    name: "Работа с базами данных в Perl",
    description: "Владение Perl DBI и работой с базами данных",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовое подключение к БД, простые SELECT запросы, работа с DBI",
      level2: "INSERT, UPDATE, DELETE операции, подготовленные запросы, обработка ошибок",
      level3: "Транзакции, работа с несколькими БД, оптимизация запросов, использование ORM",
      level4: "Продвинутые паттерны работы с БД, пулы соединений, репликация, производительность",
      level5: "Экспертные знания DBI, проектирование схем БД, оптимизация на уровне БД",
    },
    resources: {
      literature: [
        { name: "Programming the Perl DBI - Тим Банс, Аллардсейс", level: 3 },
        { name: "Perl DBI - официальная документация", level: 2 },
        { name: "Database Programming with Perl - Дэвид Розенберг", level: 3 },
        { name: "Perl and MySQL - Tutorial", level: 2 },
        { name: "Advanced DBI Programming - O'Reilly", level: 4 }
      ],
      videos: [
        { name: "Perl DBI Tutorial - Tutorial", level: 2 },
        { name: "Database Programming with Perl - YouTube", level: 3 },
        { name: "Perl MySQL Connection - Tutorial", level: 2 },
        { name: "Advanced DBI Techniques - O'Reilly", level: 4 },
        { name: "Perl Database Best Practices - Tutorial", level: 3 }
      ],
      courses: [
        { name: "Работа с БД в Perl - Stepik", level: 2 },
        { name: "Perl DBI Programming - Udemy", level: 2 },
        { name: "Database Programming with Perl - Pluralsight", level: 3 },
        { name: "Advanced Perl DBI - O'Reilly", level: 4 },
        { name: "Perl Database Expert - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-20",
    name: "Веб-разработка на Perl",
    description: "Создание веб-приложений на Perl",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовый CGI, обработка форм, простые веб-страницы, работа с HTTP",
      level2: "PSGI/Plack, базовые фреймворки (Dancer, Mojolicious), роутинг, шаблонизация",
      level3: "RESTful API, аутентификация, сессии, работа с JSON/XML, middleware",
      level4: "Архитектура веб-приложений, масштабирование, кэширование, безопасность",
      level5: "Экспертные знания веб-фреймворков, создание собственных фреймворков, оптимизация",
    },
    resources: {
      literature: [
        { name: "Mojolicious: Perl Web Framework - официальная документация", level: 2 },
        { name: "Dancer - официальная документация", level: 2 },
        { name: "PSGI/Plack - официальная документация", level: 3 },
        { name: "Web Development with Perl - Дэвид Кросс", level: 3 },
        { name: "Modern Perl Web Development - О'Рейли", level: 4 }
      ],
      videos: [
        { name: "Perl CGI Tutorial - Tutorial", level: 1 },
        { name: "Mojolicious Web Framework - Tutorial", level: 2 },
        { name: "Dancer Framework Tutorial - YouTube", level: 2 },
        { name: "PSGI/Plack Introduction - O'Reilly", level: 3 },
        { name: "Advanced Perl Web Development - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Веб-разработка на Perl - Stepik", level: 2 },
        { name: "Perl Web Development - Udemy", level: 2 },
        { name: "Mojolicious Framework - Pluralsight", level: 3 },
        { name: "Advanced Perl Web Apps - O'Reilly", level: 4 },
        { name: "Perl Web Expert - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-21",
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
    id: "comp-22",
    name: "Модули CPAN",
    description: "Работа с модулями CPAN и создание собственных модулей",
    type: "профессиональные компетенции",
    levels: {
      level1: "Установка модулей через cpan/cpanm, базовое использование модулей, поиск модулей",
      level2: "Понимание структуры модулей, работа с зависимостями, версионирование, документация",
      level3: "Создание простых модулей, публикация на CPAN, работа с PAUSE, тестирование модулей",
      level4: "Создание сложных модулей, XS модули, оптимизация, поддержка модулей",
      level5: "Экспертные знания CPAN, создание популярных модулей, менторинг сообщества",
    },
    resources: {
      literature: [
        { name: "CPAN - официальный сайт", level: 1 },
        { name: "How to Contribute to CPAN - документация", level: 3 },
        { name: "Perl Module Development - документация", level: 3 },
        { name: "Extending and Embedding Perl - Тим Дженс, Саймон Коузенс", level: 4 },
        { name: "Advanced Perl Programming - Саймон Коузенс", level: 4 }
      ],
      videos: [
        { name: "CPAN Introduction - Tutorial", level: 1 },
        { name: "Creating Perl Modules - YouTube", level: 3 },
        { name: "Publishing to CPAN - Tutorial", level: 3 },
        { name: "Advanced Module Development - O'Reilly", level: 4 },
        { name: "Perl XS Programming - Tutorial", level: 5 }
      ],
      courses: [
        { name: "Работа с CPAN - Stepik", level: 1 },
        { name: "Perl Module Development - Udemy", level: 3 },
        { name: "Creating CPAN Modules - Pluralsight", level: 3 },
        { name: "Advanced Perl Modules - O'Reilly", level: 4 },
        { name: "CPAN Expert - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-23",
    name: "Обработка данных и парсинг в Perl",
    description: "Обработка и парсинг различных форматов данных в Perl",
    type: "профессиональные компетенции",
    levels: {
      level1: "Работа с текстовыми файлами, простой парсинг CSV, базовые операции с данными",
      level2: "Парсинг JSON, XML, CSV, работа с кодировками, обработка больших файлов",
      level3: "Сложный парсинг, работа с бинарными форматами, потоковая обработка, оптимизация",
      level4: "Парсинг сложных структур, ETL процессы, работа с большими объемами данных",
      level5: "Экспертные знания парсинга, создание парсеров, оптимизация производительности",
    },
    resources: {
      literature: [
        { name: "Perl Data Structures - документация", level: 2 },
        { name: "JSON::XS - официальная документация", level: 2 },
        { name: "XML::LibXML - официальная документация", level: 3 },
        { name: "Text::CSV - официальная документация", level: 2 },
        { name: "Data Munging with Perl - Дэвид Кросс", level: 3 }
      ],
      videos: [
        { name: "Perl Data Processing - Tutorial", level: 2 },
        { name: "JSON Parsing in Perl - YouTube", level: 2 },
        { name: "XML Parsing with Perl - Tutorial", level: 3 },
        { name: "Advanced Data Processing - O'Reilly", level: 4 },
        { name: "Perl ETL Processes - Tutorial", level: 4 }
      ],
      courses: [
        { name: "Обработка данных в Perl - Stepik", level: 2 },
        { name: "Perl Data Processing - Udemy", level: 2 },
        { name: "Advanced Parsing in Perl - Pluralsight", level: 3 },
        { name: "Data Munging with Perl - O'Reilly", level: 4 },
        { name: "Perl Data Expert - Coursera", level: 5 }
      ],
    },
  },
  {
    id: "comp-24",
    name: "Объектно-ориентированное программирование в Perl",
    description: "ООП в Perl и использование Moose/Moo",
    type: "профессиональные компетенции",
    levels: {
      level1: "Базовое ООП в Perl, пакеты, bless, методы, конструкторы",
      level2: "Наследование, инкапсуляция, полиморфизм, работа с классами и объектами",
      level3: "Moose/Moo фреймворки, атрибуты, роли, метаклассы, продвинутые паттерны",
      level4: "Сложные ООП паттерны, создание фреймворков, оптимизация, архитектура",
      level5: "Экспертные знания ООП в Perl, проектирование систем, менторинг",
    },
    resources: {
      literature: [
        { name: "Intermediate Perl - глава об ООП - Рэндал Шварц", level: 2 },
        { name: "Moose - официальная документация", level: 3 },
        { name: "Moo - официальная документация", level: 3 },
        { name: "Modern Perl - Хроман", level: 3 },
        { name: "Object Oriented Perl - Дэмиан Конуэй", level: 4 }
      ],
      videos: [
        { name: "Perl OOP Tutorial - Tutorial", level: 2 },
        { name: "Moose Framework Introduction - YouTube", level: 3 },
        { name: "Advanced Perl OOP - O'Reilly", level: 3 },
        { name: "Moo vs Moose - Tutorial", level: 3 },
        { name: "Perl OOP Patterns - Tutorial", level: 4 }
      ],
      courses: [
        { name: "ООП в Perl - Stepik", level: 2 },
        { name: "Perl Object-Oriented Programming - Udemy", level: 2 },
        { name: "Moose Framework - Pluralsight", level: 3 },
        { name: "Advanced Perl OOP - O'Reilly", level: 4 },
        { name: "Perl OOP Expert - Coursera", level: 5 }
      ],
    },
  },
];

const defaultProfiles: Profile[] = [
  {
    id: "profile-1",
    name: "Frontend Developer",
    description: "Разработчик фронтенд приложений",
    requiredCompetences: [
      { competenceId: "comp-1", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-2", requiredLevel: 3, weight: 8 },
      { competenceId: "comp-3", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-7", requiredLevel: 3, weight: 6 },
    ],
  },
  {
    id: "profile-2",
    name: "Backend Developer",
    description: "Разработчик бэкенд приложений",
    requiredCompetences: [
      { competenceId: "comp-1", requiredLevel: 4, weight: 9 },
      { competenceId: "comp-4", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-5", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-6", requiredLevel: 3, weight: 8 },
      { competenceId: "comp-7", requiredLevel: 3, weight: 7 },
      { competenceId: "comp-8", requiredLevel: 2, weight: 6 },
    ],
  },
  {
    id: "profile-3",
    name: "Fullstack Developer",
    description: "Полноценный разработчик",
    requiredCompetences: [
      { competenceId: "comp-1", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-2", requiredLevel: 4, weight: 9 },
      { competenceId: "comp-3", requiredLevel: 4, weight: 9 },
      { competenceId: "comp-4", requiredLevel: 4, weight: 9 },
      { competenceId: "comp-5", requiredLevel: 4, weight: 9 },
      { competenceId: "comp-6", requiredLevel: 3, weight: 8 },
      { competenceId: "comp-7", requiredLevel: 3, weight: 7 },
      { competenceId: "comp-8", requiredLevel: 2, weight: 6 },
    ],
  },
  {
    id: "profile-4",
    name: "DevOps Engineer",
    description: "Инженер по инфраструктуре",
    requiredCompetences: [
      { competenceId: "comp-4", requiredLevel: 3, weight: 8 },
      { competenceId: "comp-5", requiredLevel: 3, weight: 7 },
      { competenceId: "comp-6", requiredLevel: 4, weight: 10 },
      { competenceId: "comp-8", requiredLevel: 5, weight: 10 },
    ],
  },
];

const defaultCareerTracks: CareerTrack[] = [
  {
    id: "track-1",
    name: "Frontend Developer Track",
    description: "Карьерный трек для фронтенд разработчиков",
    profileId: "profile-1",
    levels: [
      {
        level: 1,
        name: "Junior Frontend Developer",
        description: "Начальный уровень фронтенд разработки",
        requiredSkills: {
          "comp-1": 2,
          "comp-3": 2,
          "comp-7": 1,
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Middle Frontend Developer",
        description: "Средний уровень фронтенд разработки",
        requiredSkills: {
          "comp-1": 3,
          "comp-2": 3,
          "comp-3": 3,
          "comp-7": 2,
        },
        minMatchPercentage: 70,
      },
      {
        level: 3,
        name: "Senior Frontend Developer",
        description: "Высокий уровень фронтенд разработки",
        requiredSkills: {
          "comp-1": 4,
          "comp-2": 4,
          "comp-3": 4,
          "comp-7": 3,
        },
        minMatchPercentage: 80,
      },
      {
        level: 4,
        name: "Lead Frontend Developer",
        description: "Ведущий фронтенд разработчик",
        requiredSkills: {
          "comp-1": 5,
          "comp-2": 5,
          "comp-3": 5,
          "comp-6": 4,
          "comp-7": 4,
        },
        minMatchPercentage: 85,
      },
    ],
  },
  {
    id: "track-2",
    name: "Backend Developer Track",
    description: "Карьерный трек для бэкенд разработчиков",
    profileId: "profile-2",
    levels: [
      {
        level: 1,
        name: "Junior Backend Developer",
        description: "Начальный уровень бэкенд разработки",
        requiredSkills: {
          "comp-1": 2,
          "comp-4": 2,
          "comp-5": 2,
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Middle Backend Developer",
        description: "Средний уровень бэкенд разработки",
        requiredSkills: {
          "comp-1": 3,
          "comp-4": 3,
          "comp-5": 3,
          "comp-7": 2,
        },
        minMatchPercentage: 70,
      },
      {
        level: 3,
        name: "Senior Backend Developer",
        description: "Высокий уровень бэкенд разработки",
        requiredSkills: {
          "comp-1": 4,
          "comp-4": 4,
          "comp-5": 4,
          "comp-6": 3,
          "comp-7": 3,
          "comp-8": 2,
        },
        minMatchPercentage: 80,
      },
      {
        level: 4,
        name: "Lead Backend Developer",
        description: "Ведущий бэкенд разработчик",
        requiredSkills: {
          "comp-1": 5,
          "comp-4": 5,
          "comp-5": 5,
          "comp-6": 4,
          "comp-7": 4,
          "comp-8": 3,
        },
        minMatchPercentage: 85,
      },
    ],
  },
];

// Утилиты для работы с localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to ${key}:`, e);
  }
}

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
  
  const migrated = stored.map((comp: any) => {
    if (comp.category && !comp.type) {
      needsMigration = true;
    }
    
    // Получаем ресурсы из defaultCompetences, если они есть
    const defaultComp = defaultCompetencesMap.get(comp.id);
    const hasResources = comp.resources && 
      (comp.resources.literature?.length > 0 || 
       comp.resources.videos?.length > 0 || 
       comp.resources.courses?.length > 0);
    
    // Проверяем, есть ли ресурсы в старом формате (строки)
    const hasOldFormat = hasResources && comp.resources && 
      (typeof comp.resources.literature?.[0] === 'string' || 
       typeof comp.resources.videos?.[0] === 'string' || 
       typeof comp.resources.courses?.[0] === 'string');
    
    // Функция для конвертации старого формата (строки) в новый (объекты)
    const convertResources = (resources: any) => {
      if (!resources) return { literature: [], videos: [], courses: [] };
      
      const convertArray = (arr: any[]): Array<{ name: string; level: 1 | 2 | 3 | 4 | 5 }> => {
        if (!arr || arr.length === 0) return [];
        // Если это уже новый формат (объекты), возвращаем как есть
        if (typeof arr[0] === 'object' && arr[0].name !== undefined) {
          return arr;
        }
        // Если это старый формат (строки), конвертируем в объекты с уровнем 2 по умолчанию
        return arr.map((item: string) => ({ name: item, level: 2 as 1 | 2 | 3 | 4 | 5 }));
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
            JSON.stringify(comp.resources) !== JSON.stringify(defaultComp.resources)) {
          needsMigration = true;
        }
      } else if (hasResources) {
        // Если в defaultCompetences нет ресурсов, но есть сохраненные, используем их
        resources = convertResources(comp.resources);
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
      resources = convertResources(comp.resources);
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
      ...comp,
      type: comp.type || (comp.category ? "профессиональные компетенции" : "профессиональные компетенции"),
      levels: comp.levels || {
        level1: "",
        level2: "",
        level3: "",
        level4: "",
        level5: "",
      },
      resources: resources,
    };
    // Удаляем category, если она есть
    if ('category' in result) {
      delete (result as any).category;
    }
    if (!comp.resources) {
      needsMigration = true;
    }
    return result;
  });
  
  // Добавляем недостающие компетенции из defaultCompetences
  const storedIds = new Set(migrated.map((c: Competence) => c.id));
  const missingCompetences = defaultCompetences.filter(comp => !storedIds.has(comp.id));
  
  if (missingCompetences.length > 0) {
    migrated.push(...missingCompetences);
    needsMigration = true;
  }
  
  // Сохраняем мигрированные данные обратно в localStorage
  if (needsMigration) {
    saveToStorage(COMPETENCES_KEY, migrated);
  }
  
  return migrated;
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

export function getProfiles(): Profile[] {
  return getFromStorage(PROFILES_KEY, defaultProfiles);
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
  return getFromStorage(CAREER_TRACKS_KEY, defaultCareerTracks);
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


