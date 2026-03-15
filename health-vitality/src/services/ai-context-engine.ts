// services/ai-context-engine.ts
// Synergistic AI engine: cross-references recent activity with medication schedule

import { ActivityType } from "./activity-math";

export interface RecentActivity {
  activityType: ActivityType;
  caloriesBurned: number;
  avgHeartRate?: number;
  completedMinutesAgo: number;
  durationMinutes: number;
}

export interface MedicationContext {
  medicationName: string;
  scheduledTime: string;
}

export type AiSuggestionLevel = "info" | "warning" | "delay";

export interface AiSuggestion {
  level: AiSuggestionLevel;
  message: string;
  delayMinutes?: number;
}

/**
 * Core AI rule engine — analyses recent workout data and returns
 * contextual medication guidance.
 *
 * Rules (ordered by priority):
 * 1. HIGH intensity run within 30 min → delay digestive supplements 20 min + hydration warning
 * 2. Moderate jogging within 15 min  → gentle reminder to be upright when taking pill
 * 3. User is in cool-down zone        → confirm they've rehydrated
 */
export function generateMedicationInsight(
  activity: RecentActivity,
  medication: MedicationContext
): AiSuggestion | null {
  const { activityType, caloriesBurned, avgHeartRate, completedMinutesAgo, durationMinutes } =
    activity;

  const isHighIntensity =
    activityType === "running" || (avgHeartRate !== undefined && avgHeartRate >= 160);

  const isModerate =
    activityType === "jogging" || (avgHeartRate !== undefined && avgHeartRate >= 130);

  const recentlyFinished = completedMinutesAgo <= 30;
  const justFinished = completedMinutesAgo <= 10;

  if (isHighIntensity && recentlyFinished) {
    return {
      level: "delay",
      delayMinutes: 20,
      message: `🏃 You just finished a high-intensity run (${caloriesBurned} kcal burned). Your stomach needs to settle — your ${medication.medicationName} reminder has been nudged 20 minutes. Remember to drink at least 500ml of water first.`,
    };
  }

  if (isModerate && justFinished) {
    return {
      level: "warning",
      message: `🚶 Great jog! Stay upright for a few minutes before taking your ${medication.medicationName} to maximise absorption.`,
    };
  }

  if ((isHighIntensity || isModerate) && durationMinutes >= 45 && recentlyFinished) {
    return {
      level: "info",
      message: `💧 You burned ${caloriesBurned} kcal on your ${activityType}. This is a good time for your ${medication.medicationName} — pair it with electrolytes for optimal uptake.`,
    };
  }

  return null; // No special context — proceed with normal reminder
}

/**
 * Generates hydration-specific insights based on workout and goals.
 */
export function generateHydrationInsight(
  activity: RecentActivity,
  currentWaterMl: number,
  goalMl: number
): AiSuggestion | null {
  const { activityType, durationMinutes, completedMinutesAgo } = activity;

  const pctOfGoal = (currentWaterMl / goalMl) * 100;
  const isPostWorkout = completedMinutesAgo <= 60;

  if (isPostWorkout && activityType !== "walking" && durationMinutes >= 20) {
    return {
      level: "warning",
      message: `💧 Hydration is key! You should drink an additional 500ml of water to compensate for your ${activityType}.`,
    };
  }

  if (pctOfGoal < 25 && new Date().getHours() > 12) {
    return {
      level: "info",
      message: "🥤 You've only reached 25% of your daily water goal. Keep sipping!",
    };
  }

  return null;
}
