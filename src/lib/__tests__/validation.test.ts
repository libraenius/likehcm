/**
 * Unit тесты для модуля validation
 */

import { describe, it, expect } from "@jest/globals";
import {
  competenceSchema,
  profileSchema,
  safeValidate,
  getFirstError,
} from "../validation";

describe("competenceSchema", () => {
  it("должен валидировать корректную компетенцию", () => {
    const validCompetence = {
      id: "comp-1",
      name: "JavaScript",
      description: "Описание",
      type: "профессиональные компетенции" as const,
      levels: {
        level1: "Уровень 1",
        level2: "Уровень 2",
        level3: "Уровень 3",
        level4: "Уровень 4",
        level5: "Уровень 5",
      },
    };

    const result = safeValidate(competenceSchema, validCompetence);
    expect(result.success).toBe(true);
  });

  it("должен отклонять компетенцию без обязательных полей", () => {
    const invalidCompetence = {
      id: "comp-1",
      // name отсутствует
      description: "Описание",
      type: "профессиональные компетенции" as const,
      levels: {
        level1: "Уровень 1",
        level2: "Уровень 2",
        level3: "Уровень 3",
        level4: "Уровень 4",
        level5: "Уровень 5",
      },
    };

    const result = safeValidate(competenceSchema, invalidCompetence);
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("должен валидировать корректный профиль", () => {
    const validProfile = {
      id: "profile-1",
      name: "Frontend Developer",
      description: "Описание",
      requiredCompetences: [
        {
          competenceId: "comp-1",
          requiredLevel: 3 as const,
        },
      ],
    };

    const result = safeValidate(profileSchema, validProfile);
    expect(result.success).toBe(true);
  });

  it("должен отклонять профиль без компетенций", () => {
    const invalidProfile = {
      id: "profile-1",
      name: "Frontend Developer",
      description: "Описание",
      requiredCompetences: [],
    };

    const result = safeValidate(profileSchema, invalidProfile);
    expect(result.success).toBe(false);
  });
});

describe("getFirstError", () => {
  it("должен возвращать первую ошибку валидации", () => {
    const invalidData = {
      id: "comp-1",
      // name отсутствует
    };

    const result = safeValidate(competenceSchema, invalidData);
    if (!result.success) {
      const error = getFirstError(result.errors);
      expect(error).toBeTruthy();
      expect(typeof error).toBe("string");
    }
  });
});

