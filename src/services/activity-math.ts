// services/activity-math.ts
// MET (Metabolic Equivalent of Task) calorie burn engine

export type ActivityType = "walking" | "jogging" | "running" | "cycling";

export interface ActivityMetrics {
  durationHours: number;
  weightKg: number;
  speedMph: number;
  mode?: "pedestrian" | "cycling"; // Explicit mode to distinguish between types
  averageHeartRate?: number;
  restingHeartRate?: number;
}

export interface ActivityResult {
  caloriesBurned: number;
  activityType: ActivityType;
  met: number;
  hrMultiplier: number;
}

/**
 * Classify activity type and compute base MET from speed thresholds.
 */
function classifyAndMet(metrics: ActivityMetrics): { activityType: ActivityType; baseMet: number } {
  const { speedMph, mode = "pedestrian" } = metrics;

  if (mode === "cycling") {
    // Cycling MET values (Source: Compendium of Physical Activities)
    if (speedMph < 10) {
      return { activityType: "cycling", baseMet: 4.0 }; // Leisurely
    } else if (speedMph < 12) {
      return { activityType: "cycling", baseMet: 6.8 }; // Moderate
    } else if (speedMph < 14) {
      return { activityType: "cycling", baseMet: 8.0 }; // Vigorous
    } else if (speedMph < 16) {
      return { activityType: "cycling", baseMet: 10.0 }; // Fast
    } else {
      return { activityType: "cycling", baseMet: 12.0 }; // Racing
    }
  }

  // Pedestrian logic
  if (speedMph < 3.5) {
    return { activityType: "walking", baseMet: 3.5 };
  } else if (speedMph < 4.0) {
    return { activityType: "walking", baseMet: 5.0 }; // brisk walk transition
  } else if (speedMph <= 6.0) {
    const baseMet = 7.0 + (speedMph - 4.0) * 1.0;
    return { activityType: "jogging", baseMet };
  } else {
    const baseMet = 11.0 + (speedMph - 6.0) * 1.5;
    return { activityType: "running", baseMet };
  }
}

/**
 * Compute Heart Rate Reserve multiplier for users with wearables.
 */
function computeHrMultiplier(avgHr?: number, restingHr?: number): number {
  if (!avgHr || !restingHr) return 1.0;
  const hrr = avgHr - restingHr;
  if (hrr >= 100) return 1.15; // anaerobic / HIIT zone
  if (hrr >= 70) return 1.05;  // aerobic threshold zone
  return 1.0;
}

/**
 * Main entry point: calculateActivityBurn
 */
export function calculateActivityBurn(metrics: ActivityMetrics): ActivityResult {
  const { durationHours, weightKg, averageHeartRate, restingHeartRate } = metrics;

  const { activityType, baseMet } = classifyAndMet(metrics);
  const hrMultiplier = computeHrMultiplier(averageHeartRate, restingHeartRate);

  // WHO / ACSM formula: Calories = MET × weight(kg) × duration(h)
  const caloriesBurned = baseMet * weightKg * durationHours * hrMultiplier;

  return {
    caloriesBurned: Math.round(caloriesBurned),
    activityType,
    met: baseMet,
    hrMultiplier,
  };
}
