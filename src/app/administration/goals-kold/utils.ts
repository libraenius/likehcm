import type { Leader, KPI } from "./types";

// Функция для получения инициалов из ФИО или объекта Leader
export const getInitials = (fullNameOrLeader: string | Leader) => {
  const fullName = typeof fullNameOrLeader === "string" ? fullNameOrLeader : fullNameOrLeader.name;
  const parts = fullName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "??";
};

// Функция для форматирования даты в формат дд.мм.гггг
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Расчет completionPercent и evaluationPercent
export const calculateKPIMetrics = (plan: number, fact: number, weight: number) => {
  const completionPercent = plan !== 0 ? (fact / plan) * 100 : 0;
  const evaluationPercent = Math.min(completionPercent * (weight / 100), weight * 1.2); // Максимум 120% от веса
  return { completionPercent, evaluationPercent };
};

