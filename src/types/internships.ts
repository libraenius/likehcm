// Типы для системы стажировок

export type InternshipStatus = 'planned' | 'recruiting' | 'active' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'confirmed' | 'active' | 'completed';
export type InternshipLocation = 'remote' | 'office' | 'hybrid';
export type ApprovalWorkflow = 'single' | 'two-level' | 'multi-level';

// Стажировка
export interface Internship {
  id: string;
  partnershipId: string;
  partnershipName: string;
  universityId: string;
  universityName: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;
  status: InternshipStatus;
  maxParticipants: number;
  currentParticipants: number;
  requirements: string[];
  requiredSkills: string[]; // ID компетенций
  preferredSkills: string[]; // ID компетенций
  mentorId?: string;
  mentorName?: string;
  location: InternshipLocation;
  city?: string;
  address?: string;
  salary?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Заявка студента на стажировку
export interface InternshipApplication {
  id: string;
  internshipId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  universityId: string;
  universityName: string;
  course: number; // Курс обучения
  gpa?: number; // Средний балл
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewerName?: string;
  motivationLetter?: string;
  resumeUrl?: string;
  interviewDate?: Date;
  interviewNotes?: string;
  rejectionReason?: string;
  matchScore?: number; // Релевантность 0-100
  matchFactors?: MatchingScoreFactors;
  isReserve: boolean; // В резервном списке
  confirmedAt?: Date;
  completedAt?: Date;
  finalRating?: number; // Финальная оценка 1-5
  mentorFeedback?: string;
  studentFeedback?: string;
}

// Факторы релевантности
export interface MatchingScoreFactors {
  skillsMatch: number; // Совпадение навыков 0-100
  gpa?: number; // Средний балл (если учитывается)
  experience: number; // Опыт работы/проектов 0-100
  motivationQuality?: number; // Качество мотивационного письма 0-100
  universityRank?: number; // Рейтинг вуза 0-100
}

// Промежуточная оценка студента
export interface InternshipEvaluation {
  id: string;
  applicationId: string;
  internshipId: string;
  studentId: string;
  evaluatorId: string; // ID наставника
  evaluatorName: string;
  evaluationDate: Date;
  period: 'weekly' | 'bi-weekly' | 'monthly' | 'final';
  technicalSkills: number; // 1-5
  communication: number; // 1-5
  initiative: number; // 1-5
  teamwork: number; // 1-5
  overallRating: number; // 1-5
  comments: string;
  recommendations?: string;
}

// Студент (расширенная версия для стажировок)
export interface InternshipStudent {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  universityId: string;
  universityName: string;
  course: number;
  group?: string;
  specialization?: string;
  gpa?: number;
  skills: string[]; // ID компетенций
  experience?: {
    projects?: string[];
    workExperience?: string[];
    achievements?: string[];
  };
  resumeUrl?: string;
  portfolioUrl?: string;
}

// Наставник
export interface Mentor {
  id: string;
  fullName: string;
  email: string;
  position: string;
  departmentId?: string;
  departmentName?: string;
  skills: string[]; // ID компетенций
  maxInternships: number; // Максимум одновременных стажировок
  currentInternships: number;
}

// Статистика стажировки
export interface InternshipStatistics {
  internshipId: string;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  confirmedApplications: number;
  activeStudents: number;
  completedStudents: number;
  averageMatchScore: number;
  topUniversities: Array<{
    universityId: string;
    universityName: string;
    applicationsCount: number;
    approvedCount: number;
  }>;
  topSkills: Array<{
    skillId: string;
    skillName: string;
    applicationsCount: number;
  }>;
  conversionRate: {
    applicationsToApproved: number; // %
    approvedToConfirmed: number; // %
    confirmedToCompleted: number; // %
  };
}

// Настройки стажировки
export interface InternshipSettings {
  maxApplicationsPerStudent: number; // Максимум заявок на студента
  autoCloseOnLimit: boolean; // Автоматически закрывать при достижении лимита
  requireReserveList: boolean; // Обязательный резервный список
  reserveListSize: number; // Размер резерва (% от основных мест)
  minMatchScore: number; // Минимальный порог релевантности
  approvalWorkflow: ApprovalWorkflow;
  requireInterview: boolean; // Требуется ли интервью
  autoNotifyOnStatusChange: boolean; // Автоматические уведомления
  balanceByUniversity: boolean; // Балансировать по вузам
  maxStudentsPerUniversity?: number; // Максимум студентов от одного вуза
}
