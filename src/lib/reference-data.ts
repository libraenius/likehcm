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
        name: "Trainee Perl Developer",
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
        experience: "Стаж работы не требуется",
        requiredSkills: {
          "comp-17": 1, // Perl - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
      },
      {
        level: "junior",
        name: "Junior Perl Developer",
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
        experience: "Опыт работы от 6 месяцев до 1 года",
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
      },
      {
        level: "middle",
        name: "Middle Perl Developer",
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
        experience: "Опыт работы от 1 до 3 лет",
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
      },
      {
        level: "senior",
        name: "Senior Perl Developer",
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
        experience: "Опыт работы от 3 до 5 лет",
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
      },
      {
        level: "lead",
        name: "Lead Perl Developer",
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
        experience: "Опыт работы от 5 лет",
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
        name: "Trainee QA Automation Engineer",
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
        experience: "Стаж работы не требуется",
        requiredSkills: {
          "comp-20": 1, // Автотестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
      },
      {
        level: "junior",
        name: "Junior QA Automation Engineer",
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
        experience: "Опыт работы от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-20": 2, // Автотестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
      },
      {
        level: "middle",
        name: "Middle QA Automation Engineer",
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
        experience: "Опыт работы от 1 до 3 лет",
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
      },
      {
        level: "senior",
        name: "Senior QA Automation Engineer",
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
        experience: "Опыт работы от 3 до 5 лет",
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
      },
      {
        level: "lead",
        name: "Lead QA Automation Engineer",
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
        experience: "Опыт работы от 5 лет",
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
        name: "Trainee Manual QA Engineer",
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
        experience: "Стаж работы не требуется",
        requiredSkills: {
          "comp-21": 1, // Ручное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
      },
      {
        level: "junior",
        name: "Junior Manual QA Engineer",
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
        experience: "Опыт работы от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-21": 2, // Ручное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
          "comp-15": 2, // Критическое мышление - базовый уровень
        },
      },
      {
        level: "middle",
        name: "Middle Manual QA Engineer",
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
        experience: "Опыт работы от 1 до 3 лет",
        requiredSkills: {
          "comp-21": 3, // Ручное тестирование - средний уровень
          "comp-7": 3, // Тестирование - средний уровень
          "comp-9": 3, // Коммуникация - средний уровень
          "comp-10": 3, // Работа в команде - средний уровень
          "comp-12": 3, // Решение проблем - средний уровень
          "comp-15": 3, // Критическое мышление - средний уровень
          "comp-13": 3, // Управление временем - средний уровень
        },
      },
      {
        level: "senior",
        name: "Senior Manual QA Engineer",
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
        experience: "Опыт работы от 3 до 5 лет",
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
      },
      {
        level: "lead",
        name: "Lead Manual QA Engineer",
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
        experience: "Опыт работы от 5 лет",
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
        name: "Trainee Performance QA Engineer",
        description: "Стажер по нагрузочному тестированию. Начальный уровень, изучение основ нагрузочного тестирования под руководством ментора.",
        responsibilities: [
          "Изучение основ нагрузочного тестирования",
          "Базовое использование инструментов (JMeter, Gatling)",
          "Выполнение простых нагрузочных сценариев под руководством",
          "Изучение метрик производительности",
          "Работа с документацией",
        ],
        education: "Среднее специальное или неоконченное высшее техническое образование",
        experience: "Стаж работы не требуется",
        requiredSkills: {
          "comp-22": 1, // Нагрузочное тестирование - начальный уровень
          "comp-7": 1, // Тестирование - начальный уровень
          "comp-9": 1, // Коммуникация - начальный уровень
          "comp-10": 1, // Работа в команде - начальный уровень
          "comp-13": 1, // Управление временем - начальный уровень
        },
      },
      {
        level: "junior",
        name: "Junior Performance QA Engineer",
        description: "Младший инженер по нагрузочному тестированию. Базовый уровень, способен создавать нагрузочные сценарии под минимальным руководством.",
        responsibilities: [
          "Создание нагрузочных сценариев (JMeter, Gatling, Locust)",
          "Анализ метрик производительности",
          "Работа с отчетами нагрузочного тестирования",
          "Базовое профилирование приложений",
          "Участие в планировании задач",
        ],
        education: "Высшее техническое образование (или неоконченное высшее)",
        experience: "Опыт работы от 6 месяцев до 1 года",
        requiredSkills: {
          "comp-22": 2, // Нагрузочное тестирование - базовый уровень
          "comp-7": 2, // Тестирование - базовый уровень
          "comp-5": 2, // Базы данных - базовый уровень
          "comp-9": 2, // Коммуникация - базовый уровень
          "comp-10": 2, // Работа в команде - базовый уровень
          "comp-12": 2, // Решение проблем - базовый уровень
          "comp-13": 2, // Управление временем - базовый уровень
        },
      },
      {
        level: "middle",
        name: "Middle Performance QA Engineer",
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
        experience: "Опыт работы от 1 до 3 лет",
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
      },
      {
        level: "senior",
        name: "Senior Performance QA Engineer",
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
        experience: "Опыт работы от 3 до 5 лет",
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
      },
      {
        level: "lead",
        name: "Lead Performance QA Engineer",
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
        experience: "Опыт работы от 5 лет",
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
        name: "Trainee Perl Developer",
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
        name: "Junior Perl Developer",
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
        name: "Middle Perl Developer",
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
        name: "Senior Perl Developer",
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
        name: "Lead Perl Developer",
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
        name: "Trainee QA Automation Engineer",
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
        name: "Junior QA Automation Engineer",
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
        name: "Middle QA Automation Engineer",
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
        name: "Senior QA Automation Engineer",
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
        name: "Lead QA Automation Engineer",
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
        name: "Trainee Manual QA Engineer",
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
        name: "Junior Manual QA Engineer",
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
        name: "Middle Manual QA Engineer",
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
        name: "Senior Manual QA Engineer",
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
        name: "Lead Manual QA Engineer",
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
        name: "Trainee Performance QA Engineer",
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
        name: "Junior Performance QA Engineer",
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
        name: "Middle Performance QA Engineer",
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
        name: "Senior Performance QA Engineer",
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
        name: "Lead Performance QA Engineer",
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
  
  // Создаем карту ID компетенций из defaultCompetences для быстрого поиска
  const defaultIds = new Set(defaultCompetences.map(comp => comp.id));
  
  // Обновляем существующие компетенции данными из defaultCompetences
  const updated = migrated.map((comp: Competence) => {
    const defaultComp = defaultCompetencesMap.get(comp.id);
    if (defaultComp) {
      // Если компетенция есть в defaultCompetences, обновляем её данными оттуда
      needsMigration = true;
      return defaultComp;
    }
    return comp;
  });
  
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
  const updated = stored.map((profile: any) => {
    const defaultProfile = defaultProfilesMap.get(profile.id);
    
    // Удаляем weight из компетенций, если оно есть
    const hasWeight = profile.requiredCompetences?.some((comp: any) => 'weight' in comp);
    if (hasWeight) {
      needsMigration = true;
      profile.requiredCompetences = profile.requiredCompetences.map((comp: any) => {
        const { weight, ...rest } = comp;
        return rest;
      });
    }
    
    let finalProfile: Profile;
    if (defaultProfile) {
      // Если профиль есть в defaultProfiles, обновляем его данными оттуда,
      // но сохраняем пользовательские данные (experts, education, experience)
      needsMigration = true;
      
      // Сохраняем пользовательские данные из существующего профиля
      const userExperts = profile.experts;
      const userLevelsData = new Map<string, { education?: string; experience?: string }>();
      
      // Сохраняем education и experience из существующих уровней
      if (profile.levels) {
        profile.levels.forEach((level) => {
          if (level.education || level.experience) {
            userLevelsData.set(level.level, {
              education: level.education,
              experience: level.experience,
            });
          }
        });
      }
      
      finalProfile = {
        ...defaultProfile,
        // Сохраняем пользовательских экспертов, если они есть
        experts: userExperts && userExperts.length > 0 ? userExperts : defaultProfile.experts,
        // Сохраняем пользовательские данные об образовании и стаже в уровнях
        levels: defaultProfile.levels?.map((defaultLevel) => {
          const userData = userLevelsData.get(defaultLevel.level);
          if (userData) {
            return {
              ...defaultLevel,
              education: userData.education,
              experience: userData.experience,
            };
          }
          return defaultLevel;
        }),
      };
    } else {
      finalProfile = profile;
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
  const updated = stored.map((track: CareerTrack) => {
    const defaultTrack = defaultTracksMap.get(track.id);
    if (defaultTrack) {
      // Если трек есть в defaultCareerTracks, обновляем его данными оттуда
      needsMigration = true;
      return defaultTrack;
    }
    return track;
  });
  
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


