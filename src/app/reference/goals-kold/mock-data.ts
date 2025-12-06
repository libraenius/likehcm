import type { Stream, MeasurementUnit, Formula } from "@/types/goals-kold";

// Моковые данные для единиц измерения
export const mockMeasurementUnits: MeasurementUnit[] = [
  { id: "1", name: "Штука", abbreviation: "шт.", description: "Единица измерения количества" },
  { id: "2", name: "Процент", abbreviation: "%", description: "Единица измерения доли" },
  { id: "3", name: "День", abbreviation: "дн.", description: "Единица измерения времени" },
  { id: "4", name: "Час", abbreviation: "час.", description: "Единица измерения времени" },
  { id: "5", name: "Минута", abbreviation: "мин.", description: "Единица измерения времени" },
];

// Моковые данные для формул
export const mockFormulas: Formula[] = [
  { id: "1", name: "Процент выполнения", formula: "(факт / план) * 100", description: "Расчет процента выполнения плана" },
  { id: "2", name: "Оценка КПЭ", formula: "min(процент_выполнения * (вес / 100), вес * 1.2)", description: "Расчет оценки КПЭ с ограничением 120%" },
];

// Функция для генерации моковых данных стримов
export const generateMockStreams = (): Stream[] => {
  const streamNames = [
    "Стрим разработки",
    "Стрим качества",
    "Стрим инфраструктуры",
    "Неплатежи и непереводы",
    "Стрим аналитики",
  ];

  const streamTypes: Array<"продуктовый" | "канальный" | "сегментный" | "платформенный" | "сервисный"> = [
    "продуктовый", "сервисный", "платформенный", "канальный", "продуктовый",
  ];

  const streams: Stream[] = [];

  for (let i = 0; i < 5; i++) {
    streams.push({
      id: `stream-${i + 1}`,
      name: streamNames[i],
      description: `Описание стрима ${i + 1}`,
      type: streamTypes[i],
      businessType: i % 2 === 0 ? "РБ" : "МСБ",
      startDate: "2024-01-15",
      endDate: "2025-12-31",
      leader: {
        name: `Лидер ${i + 1}`,
        position: "Руководитель",
      },
      teams: [],
    });
  }

  return streams;
};

// Моковые данные стримов
export const mockStreams: Stream[] = generateMockStreams();

