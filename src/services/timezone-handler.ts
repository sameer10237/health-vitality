// services/timezone-handler.ts
// Resolves medication notification times for travelers

export type TimezoneStrategy = "ABSOLUTE" | "CIRCADIAN";

/**
 * Given a medication time string (e.g. "08:00"), the user's home timezone,
 * the user's current local timezone, and the strategy, returns the
 * ISO datetime string at which to send the notification.
 *
 * ABSOLUTE  → triggers at the same wall-clock offset as home (e.g. 8AM EST = 1PM GMT)
 * CIRCADIAN → triggers at 8AM in whatever timezone the user is currently in
 */
export function resolveMedicationTime(
  scheduledTime: string, // "HH:MM"
  homeTimezone: string,  // e.g. "America/New_York"
  currentTimezone: string, // e.g. "Europe/London"
  strategy: TimezoneStrategy,
  baseDate: Date = new Date()
): Date {
  const [hours, minutes] = scheduledTime.split(":").map(Number);

  const dateStr = baseDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

  if (strategy === "CIRCADIAN") {
    // Align to user's current local time (breakfast pill stays at 8AM local)
    return buildDateInTimezone(dateStr, hours, minutes, currentTimezone);
  } else {
    // ABSOLUTE: honour the original home timezone wall-clock time
    return buildDateInTimezone(dateStr, hours, minutes, homeTimezone);
  }
}

function buildDateInTimezone(
  dateStr: string,
  hours: number,
  minutes: number,
  timezone: string
): Date {
  // Build a fake ISO string and parse it with Intl to get the UTC offset
  const naive = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  
  // Use Intl.DateTimeFormat to infer the UTC offset for that timezone on that date
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(naive + "Z"));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";

  // Reconstruct the UTC equivalent
  const utcCandidate = new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`
  );

  // Shift: we want local time = hours:minutes, so we re-express as UTC
  const offset = utcCandidate.getTime() - new Date(naive + "Z").getTime();
  return new Date(new Date(naive + "Z").getTime() - offset);
}

/** Format a Date to local time string for display */
export function formatLocalTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
