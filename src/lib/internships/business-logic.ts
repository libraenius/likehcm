// Бизнес-логика для системы стажировок

import type {
  Internship,
  InternshipApplication,
  InternshipStatus,
  ApplicationStatus,
  MatchingScoreFactors,
  InternshipStudent,
  InternshipSettings,
} from '@/types/internships';

// Проверка возможности перехода статуса стажировки
export function canChangeInternshipStatus(
  currentStatus: InternshipStatus,
  newStatus: InternshipStatus,
  internship: Internship
): { allowed: boolean; reason?: string } {
  const transitions: Record<InternshipStatus, InternshipStatus[]> = {
    planned: ['recruiting'],
    recruiting: ['active'],
    active: ['completed'],
    completed: [], // Финальный статус
  };

  if (!transitions[currentStatus].includes(newStatus)) {
    return {
      allowed: false,
      reason: `Переход из статуса "${currentStatus}" в "${newStatus}" не разрешен`,
    };
  }

  // Дополнительные проверки
  if (newStatus === 'active' && internship.currentParticipants < 1) {
    return {
      allowed: false,
      reason: 'Нельзя начать стажировку без одобренных участников',
    };
  }

  if (newStatus === 'active' && new Date() < internship.startDate) {
    return {
      allowed: false,
      reason: 'Нельзя начать стажировку до даты начала',
    };
  }

  return { allowed: true };
}

// Проверка возможности перехода статуса заявки
export function canChangeApplicationStatus(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  application: InternshipApplication
): { allowed: boolean; reason?: string } {
  const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    pending: ['approved', 'rejected', 'withdrawn'],
    approved: ['confirmed', 'rejected', 'withdrawn'],
    rejected: [], // Финальный статус
    withdrawn: [], // Финальный статус
    confirmed: ['active', 'withdrawn'],
    active: ['completed', 'withdrawn'],
    completed: [], // Финальный статус
  };

  if (!transitions[currentStatus].includes(newStatus)) {
    return {
      allowed: false,
      reason: `Переход из статуса "${currentStatus}" в "${newStatus}" не разрешен`,
    };
  }

  return { allowed: true };
}

// Расчет релевантности заявки
export function calculateMatchScore(
  student: InternshipStudent,
  internship: Internship,
  factors?: Partial<MatchingScoreFactors>
): { score: number; factors: MatchingScoreFactors } {
  const resultFactors: MatchingScoreFactors = {
    skillsMatch: 0,
    experience: 0,
    ...factors,
  };

  // 1. Совпадение навыков (0-100)
  const requiredSkillsCount = internship.requiredSkills.length;
  const preferredSkillsCount = internship.preferredSkills.length;
  const studentSkills = student.skills || [];

  const matchedRequired = internship.requiredSkills.filter(skill =>
    studentSkills.includes(skill)
  ).length;
  const matchedPreferred = internship.preferredSkills.filter(skill =>
    studentSkills.includes(skill)
  ).length;

  const requiredMatch = requiredSkillsCount > 0
    ? (matchedRequired / requiredSkillsCount) * 100
    : 0;
  const preferredMatch = preferredSkillsCount > 0
    ? (matchedPreferred / preferredSkillsCount) * 50
    : 0;

  resultFactors.skillsMatch = Math.min(100, requiredMatch + preferredMatch);

  // 2. Опыт (0-100)
  const projectsCount = student.experience?.projects?.length || 0;
  const workCount = student.experience?.workExperience?.length || 0;
  const achievementsCount = student.experience?.achievements?.length || 0;

  resultFactors.experience = Math.min(100, (projectsCount * 15) + (workCount * 25) + (achievementsCount * 10));

  // 3. GPA (если есть)
  if (student.gpa !== undefined) {
    resultFactors.gpa = (student.gpa / 5) * 100; // Предполагаем 5-балльную систему
  }

  // 4. Качество мотивационного письма (если есть фактор)
  if (factors?.motivationQuality !== undefined) {
    resultFactors.motivationQuality = factors.motivationQuality;
  }

  // 5. Рейтинг вуза (если есть фактор)
  if (factors?.universityRank !== undefined) {
    resultFactors.universityRank = factors.universityRank;
  }

  // Итоговый балл (взвешенная сумма)
  const weights = {
    skillsMatch: 0.4,
    experience: 0.3,
    gpa: 0.1,
    motivationQuality: 0.1,
    universityRank: 0.1,
  };

  let totalScore = 0;
  totalScore += resultFactors.skillsMatch * weights.skillsMatch;
  totalScore += resultFactors.experience * weights.experience;
  if (resultFactors.gpa !== undefined) {
    totalScore += resultFactors.gpa * weights.gpa;
  }
  if (resultFactors.motivationQuality !== undefined) {
    totalScore += resultFactors.motivationQuality * weights.motivationQuality;
  }
  if (resultFactors.universityRank !== undefined) {
    totalScore += resultFactors.universityRank * weights.universityRank;
  }

  return {
    score: Math.round(totalScore),
    factors: resultFactors,
  };
}

// Проверка возможности подачи заявки
export function canSubmitApplication(
  student: InternshipStudent,
  internship: Internship,
  existingApplications: InternshipApplication[],
  settings: InternshipSettings
): { allowed: boolean; reason?: string } {
  // Проверка 1: Дедлайн
  if (new Date() > internship.applicationDeadline) {
    return {
      allowed: false,
      reason: 'Срок подачи заявок истек',
    };
  }

  // Проверка 2: Статус стажировки
  if (internship.status !== 'recruiting') {
    return {
      allowed: false,
      reason: 'Стажировка не принимает заявки',
    };
  }

  // Проверка 3: Лимит заявок на студента
  const studentApplications = existingApplications.filter(
    app => app.studentId === student.id && app.status !== 'rejected' && app.status !== 'withdrawn'
  );
  if (studentApplications.length >= settings.maxApplicationsPerStudent) {
    return {
      allowed: false,
      reason: `Достигнут лимит заявок (${settings.maxApplicationsPerStudent})`,
    };
  }

  // Проверка 4: Уже есть заявка на эту стажировку
  const existingApplication = existingApplications.find(
    app => app.internshipId === internship.id && app.studentId === student.id
  );
  if (existingApplication && !['rejected', 'withdrawn'].includes(existingApplication.status)) {
    return {
      allowed: false,
      reason: 'Заявка на эту стажировку уже подана',
    };
  }

  // Проверка 5: Обязательные навыки
  const hasRequiredSkills = internship.requiredSkills.every(skill =>
    student.skills.includes(skill)
  );
  if (!hasRequiredSkills && internship.requiredSkills.length > 0) {
    return {
      allowed: false,
      reason: 'Не хватает обязательных навыков',
    };
  }

  // Проверка 6: Минимальная релевантность
  const matchResult = calculateMatchScore(student, internship);
  if (matchResult.score < settings.minMatchScore) {
    return {
      allowed: false,
      reason: `Релевантность слишком низкая (${matchResult.score}% < ${settings.minMatchScore}%)`,
    };
  }

  return { allowed: true };
}

// Формирование списка участников с учетом квот
export function formParticipantList(
  applications: InternshipApplication[],
  internship: Internship,
  settings: InternshipSettings
): {
  mainList: InternshipApplication[];
  reserveList: InternshipApplication[];
} {
  // Сортируем по релевантности и дате подачи
  const sorted = [...applications]
    .filter(app => app.status === 'approved' || app.status === 'confirmed')
    .sort((a, b) => {
      // Сначала по релевантности
      if (a.matchScore !== b.matchScore) {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      // Затем по дате подачи
      return a.appliedAt.getTime() - b.appliedAt.getTime();
    });

  // Основной список
  const mainList = sorted.slice(0, internship.maxParticipants);

  // Резервный список
  const reserveSize = settings.requireReserveList
    ? Math.ceil(internship.maxParticipants * (settings.reserveListSize / 100))
    : 0;
  const reserveList = sorted.slice(
    internship.maxParticipants,
    internship.maxParticipants + reserveSize
  );

  // Балансировка по вузам (если включена)
  if (settings.balanceByUniversity && settings.maxStudentsPerUniversity) {
    const universityCounts = new Map<string, number>();
    const balancedMain: InternshipApplication[] = [];
    const remaining: InternshipApplication[] = [];

    for (const app of sorted) {
      const count = universityCounts.get(app.universityId) || 0;
      if (balancedMain.length < internship.maxParticipants) {
        if (count < (settings.maxStudentsPerUniversity || Infinity)) {
          balancedMain.push(app);
          universityCounts.set(app.universityId, count + 1);
        } else {
          remaining.push(app);
        }
      } else {
        remaining.push(app);
      }
    }

    return {
      mainList: balancedMain,
      reserveList: remaining.slice(0, reserveSize),
    };
  }

  return { mainList, reserveList };
}

// Проверка возможности автоматического закрытия приема заявок
export function shouldAutoCloseApplications(
  internship: Internship,
  applications: InternshipApplication[],
  settings: InternshipSettings
): boolean {
  if (!settings.autoCloseOnLimit) return false;

  const confirmedCount = applications.filter(
    app => app.status === 'confirmed'
  ).length;

  return confirmedCount >= internship.maxParticipants;
}

// Расчет конверсии
export function calculateConversionRate(
  applications: InternshipApplication[]
): {
  applicationsToApproved: number;
  approvedToConfirmed: number;
  confirmedToCompleted: number;
} {
  const total = applications.length;
  const approved = applications.filter(app => ['approved', 'confirmed', 'active', 'completed'].includes(app.status)).length;
  const confirmed = applications.filter(app => ['confirmed', 'active', 'completed'].includes(app.status)).length;
  const completed = applications.filter(app => app.status === 'completed').length;

  return {
    applicationsToApproved: total > 0 ? Math.round((approved / total) * 100) : 0,
    approvedToConfirmed: approved > 0 ? Math.round((confirmed / approved) * 100) : 0,
    confirmedToCompleted: confirmed > 0 ? Math.round((completed / confirmed) * 100) : 0,
  };
}

// Проверка возможности перехода стажировки в статус "active"
export function canStartInternship(
  internship: Internship,
  applications: InternshipApplication[]
): { allowed: boolean; reason?: string } {
  if (internship.status !== 'recruiting') {
    return {
      allowed: false,
      reason: 'Стажировка должна быть в статусе "Набор"',
    };
  }

  const confirmedCount = applications.filter(
    app => app.status === 'confirmed'
  ).length;

  if (confirmedCount < 1) {
    return {
      allowed: false,
      reason: 'Нет подтвержденных участников',
    };
  }

  if (new Date() < internship.startDate) {
    return {
      allowed: false,
      reason: 'Дата начала стажировки еще не наступила',
    };
  }

  return { allowed: true };
}

// Получение следующего студента из резерва
export function getNextReserveStudent(
  reserveList: InternshipApplication[]
): InternshipApplication | null {
  const available = reserveList
    .filter(app => app.status === 'approved' && !app.isReserve)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return available.length > 0 ? available[0] : null;
}
