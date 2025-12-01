import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы CSS с помощью clsx и tailwind-merge
 * 
 * Эта функция объединяет классы CSS, разрешая конфликты классов Tailwind CSS.
 * tailwind-merge автоматически удаляет конфликтующие классы, оставляя последний.
 * 
 * @param {...ClassValue} inputs - Массив классов CSS или объектов с условиями
 * @returns {string} Объединённая строка классов CSS
 * 
 * @example
 * ```tsx
 * cn("px-2 py-1", "px-4") // "py-1 px-4" (px-2 удаляется)
 * cn("text-red-500", { "text-blue-500": isActive }) // условные классы
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
