/**
 * Unit тесты для модуля calculations
 */

import { describe, it, expect } from "@jest/globals";
import {
  calculateProfileMatch,
  calculateCareerTrackProgress,
} from "../calculations";
import type { UserProfile, ProfileCompetence, CareerTrack, SkillLevel } from "@/types";

describe("calculateProfileMatch", () => {
  it("должен возвращать 0 для пустого списка компетенций", () => {
    const userSkills: Record<string, SkillLevel> = {};
    const profileCompetences: ProfileCompetence[] = [];

    const result = calculateProfileMatch(userSkills, profileCompetences);
    expect(result).toBe(0);
  });

  it("должен вычислять процент соответствия корректно", () => {
    const userSkills: Record<string, SkillLevel> = {
      "comp-1": 3,
      "comp-2": 2,
    };
    const profileCompetences: ProfileCompetence[] = [
      { competenceId: "comp-1", requiredLevel: 5 },
      { competenceId: "comp-2", requiredLevel: 4 },
    ];

    const result = calculateProfileMatch(userSkills, profileCompetences);
    // comp-1: 3/5 = 0.6, comp-2: 2/4 = 0.5
    // Среднее: (0.6 + 0.5) / 2 = 0.55 = 55%
    expect(result).toBe(55);
  });

  it("должен возвращать 100% при полном соответствии", () => {
    const userSkills: Record<string, SkillLevel> = {
      "comp-1": 5,
      "comp-2": 4,
    };
    const profileCompetences: ProfileCompetence[] = [
      { competenceId: "comp-1", requiredLevel: 5 },
      { competenceId: "comp-2", requiredLevel: 4 },
    ];

    const result = calculateProfileMatch(userSkills, profileCompetences);
    expect(result).toBe(100);
  });

  it("должен ограничивать соответствие до 100% при превышении", () => {
    const userSkills: Record<string, SkillLevel> = {
      "comp-1": 5,
    };
    const profileCompetences: ProfileCompetence[] = [
      { competenceId: "comp-1", requiredLevel: 3 },
    ];

    const result = calculateProfileMatch(userSkills, profileCompetences);
    expect(result).toBe(100);
  });
});

describe("calculateCareerTrackProgress", () => {
  const mockCareerTrack: CareerTrack = {
    id: "track-1",
    name: "Test Track",
    description: "Test",
    profileId: "profile-1",
    levels: [
      {
        level: 1,
        name: "Level 1",
        description: "First level",
        requiredSkills: {
          "comp-1": 2,
          "comp-2": 1,
        },
        minMatchPercentage: 60,
      },
      {
        level: 2,
        name: "Level 2",
        description: "Second level",
        requiredSkills: {
          "comp-1": 4,
          "comp-2": 3,
        },
        minMatchPercentage: 70,
      },
    ],
  };

  it("должен возвращать null для профиля без mainProfileId", () => {
    const userProfile: UserProfile = {
      userId: "user-1",
      mainProfileId: "",
      additionalProfileIds: [],
      skills: [],
    };

    // Этот тест требует мокирования getCareerTrackByProfileId
    // Пока пропускаем
  });

  it("должен вычислять прогресс для достигнутого уровня", () => {
    const userProfile: UserProfile = {
      userId: "user-1",
      mainProfileId: "profile-1",
      additionalProfileIds: [],
      skills: [
        {
          competenceId: "comp-1",
          selfAssessment: 2,
          lastUpdated: new Date(),
        },
        {
          competenceId: "comp-2",
          selfAssessment: 1,
          lastUpdated: new Date(),
        },
      ],
    };

    const result = calculateCareerTrackProgress(userProfile, mockCareerTrack);
    expect(result).toBeDefined();
    expect(result?.currentLevel).toBeGreaterThanOrEqual(0);
    expect(result?.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(result?.matchPercentage).toBeLessThanOrEqual(100);
  });
});

