"use client";

import { useState, useEffect, useCallback } from "react";
import { calculateActivityBurn, ActivityType } from "@/services/activity-math";
import { 
  generateMedicationInsight, 
  generateHydrationInsight, 
  AiSuggestion 
} from "@/services/ai-context-engine";
import MedicationModal from "@/components/medication-form";
import UserSettings from "@/components/user-settings";
import ChallengeForm, { ExerciseType, Challenge } from "@/components/challenge-form";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActivitySession {
  id: string;
  type: ActivityType;
  speedMph: number;
  durationMin: number;
  weightKg: number;
  avgHr?: number;
  calories: number;
  timestamp: Date;
  synced: boolean;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: "PENDING" | "TAKEN" | "MISSED" | "SNOOZED";
  timezoneRule: "ABSOLUTE" | "CIRCADIAN";
}

interface HydrationLog {
  id: string;
  amountMl: number;
  timestamp: Date;
}

// ─── Sample seed data ─────────────────────────────────────────────────────────
const SEED_MEDICATIONS: Medication[] = [
  { id: "1", name: "Magnesium Glycinate", dosage: "400mg", scheduledTime: "08:00", status: "PENDING", timezoneRule: "CIRCADIAN" },
  { id: "2", name: "Vitamin D3", dosage: "2000 IU", scheduledTime: "12:00", status: "TAKEN", timezoneRule: "CIRCADIAN" },
  { id: "3", name: "Metoprolol", dosage: "50mg", scheduledTime: "20:00", status: "PENDING", timezoneRule: "ABSOLUTE" },
  { id: "4", name: "Omega-3", dosage: "1000mg", scheduledTime: "21:00", status: "MISSED", timezoneRule: "CIRCADIAN" },
];

const INITIAL_CHALLENGES: Challenge[] = [
  { id: "c1", type: "push-ups", targetReps: 10, completed: false, isProgressive: true, incrementBy: 10 },
  { id: "c2", type: "squats", targetReps: 10, completed: false, isProgressive: true, incrementBy: 10 },
];

// ─── Icon components ─────────────────────────────────────────────────────────
const icons = {
  walking: "🚶",
  jogging: "🏃",
  running: "🏃‍♂️",
  cycling: "🚲",
  pushups: "💪",
  squats: "🦵",
  "push-ups": "💪",
  "chest-workout": "🏋️‍♂️",
  "shoulder-workout": "🙋‍♂️",
  plank: "🧘",
  "jumping-jacks": "🏃",
  pill: "💊",
  fire: "🔥",
  heart: "❤️",
  brain: "🧠",
  sync: "🔄",
  offline: "📴",
  check: "✓",
  clock: "🕐",
  lightning: "⚡",
  water: "💧",
  glass: "🥤",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color, icon }: {
  label: string; value: string | number; unit?: string; color: string; icon: string;
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{unit}</span>}
      </div>
    </div>
  );
}

function ActivityTypeTag({ type }: { type: ActivityType }) {
  const config = {
    walking: { label: "Walking", color: "var(--accent-cyan)", bg: "rgba(6,182,212,0.15)" },
    jogging: { label: "Jogging", color: "var(--accent-orange)", bg: "rgba(245,158,11,0.15)" },
    running: { label: "Running", color: "var(--accent-red)", bg: "rgba(239,68,68,0.15)" },
    cycling: { label: "Cycling", color: "var(--accent-purple)", bg: "rgba(139,92,246,0.15)" },
  }[type];
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full"
      style={{ color: config.color, background: config.bg }}>
      {icons[type]} {config.label}
    </span>
  );
}

function MedStatusBadge({ status }: { status: Medication["status"] }) {
  const config = {
    PENDING: { label: "Pending", color: "var(--accent-blue)", bg: "rgba(59,130,246,0.15)" },
    TAKEN: { label: "Taken", color: "var(--accent-green)", bg: "rgba(16,185,129,0.15)" },
    MISSED: { label: "Missed", color: "var(--accent-red)", bg: "rgba(239,68,68,0.15)" },
    SNOOZED: { label: "Snoozed", color: "var(--accent-purple)", bg: "rgba(139,92,246,0.15)" },
  }[status];
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full"
      style={{ color: config.color, background: config.bg }}>
      {config.label}
    </span>
  );
}

function ProgressRing({ value, max, color, size = 80 }: {
  value: number; max: number; color: string; size?: number;
}) {
  const r = (size - 10) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle
        className="progress-ring-circle"
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function AiInsightBanner({ suggestion }: { suggestion: AiSuggestion }) {
  const borderColor = {
    info: "var(--accent-cyan)",
    warning: "var(--accent-orange)",
    delay: "var(--accent-purple)",
  }[suggestion.level];
  const bg = {
    info: "rgba(6,182,212,0.08)",
    warning: "rgba(245,158,11,0.08)",
    delay: "rgba(139,92,246,0.08)",
  }[suggestion.level];
  return (
    <div className="rounded-2xl p-4 text-sm leading-relaxed"
      style={{ background: bg, border: `1px solid ${borderColor}`, color: "var(--text-primary)" }}>
      <div className="font-semibold mb-1" style={{ color: borderColor }}>
        {icons.brain} AI Health Concierge
        {suggestion.delayMinutes && (
          <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-secondary)" }}>
            · Delayed {suggestion.delayMinutes} min
          </span>
        )}
      </div>
      {suggestion.message}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // Activity tracker state
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [speedMph, setSpeedMph] = useState(5.0);
  const [durationMin, setDurationMin] = useState(30);
  const [weightKg, setWeightKg] = useState(70);
  const [avgHr, setAvgHr] = useState<number | undefined>(145);
  const [activityMode, setActivityMode] = useState<"pedestrian" | "cycling">("pedestrian");
  const [isTracking, setIsTracking] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineBuffer, setOfflineBuffer] = useState<number>(0); 

  // Medication state
  const [medications, setMedications] = useState<Medication[]>(SEED_MEDICATIONS);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  // Hydration state
  const [waterGoalMl, setWaterGoalMl] = useState(2500);
  const [hydrationLogs, setHydrationLogs] = useState<HydrationLog[]>([]);
  const currentWaterMl = hydrationLogs.reduce((sum, log) => sum + log.amountMl, 0);

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);

  // User Settings state
  const [email, setEmail] = useState("user@example.com");

  // Medication Modal state
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Challenge Modal state
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Live tracking timer
  const [elapsed, setElapsed] = useState(0);

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsed((e) => e + 1);
        if (!isOnline) setOfflineBuffer((b) => b + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isOnline]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleLogActivity = useCallback(() => {
    const result = calculateActivityBurn({
      durationHours: durationMin / 60,
      weightKg,
      speedMph,
      mode: activityMode,
      averageHeartRate: avgHr,
      restingHeartRate: 60,
    });

    const session: ActivitySession = {
      id: crypto.randomUUID(),
      type: result.activityType,
      speedMph,
      durationMin,
      weightKg,
      avgHr,
      calories: result.caloriesBurned,
      timestamp: new Date(),
      synced: isOnline,
    };

    setSessions((prev) => [session, ...prev]);

    const activityContext = {
      activityType: result.activityType,
      caloriesBurned: result.caloriesBurned,
      avgHeartRate: avgHr,
      completedMinutesAgo: 2,
      durationMinutes: durationMin,
    };

    const pending = medications.find((m) => m.status === "PENDING");
    let insight: AiSuggestion | null = null;
    
    if (pending) {
      insight = generateMedicationInsight(
        activityContext,
        { medicationName: pending.name, scheduledTime: pending.scheduledTime }
      );
    }

    const hydrationInsight = generateHydrationInsight(activityContext, currentWaterMl, waterGoalMl);
    if (hydrationInsight) insight = hydrationInsight;

    setAiSuggestion(insight);
    setIsTracking(false);
    setElapsed(0);
  }, [speedMph, durationMin, weightKg, avgHr, activityMode, medications, isOnline, currentWaterMl, waterGoalMl]);

  const handleLogWater = useCallback((amount: number) => {
    const newLog: HydrationLog = { id: crypto.randomUUID(), amountMl: amount, timestamp: new Date() };
    setHydrationLogs(prev => [newLog, ...prev]);
    if (aiSuggestion?.message.includes("Hydration is key")) setAiSuggestion(null);
  }, [aiSuggestion]);

  const handleToggleChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id) {
        const nowCompleted = !c.completed;
        const newTarget = (nowCompleted && c.isProgressive) ? c.targetReps + c.incrementBy : c.targetReps;
        return { ...c, completed: nowCompleted, targetReps: newTarget };
      }
      return c;
    }));
  }, []);

  const handleSync = useCallback(() => {
    setIsOnline(true);
    setSessions((prev) => prev.map((s) => ({ ...s, synced: true })));
    setOfflineBuffer(0);
  }, []);

  const handleMarkTaken = useCallback((id: string) => {
    setMedications((prev) => prev.map((m) => m.id === id ? { ...m, status: "TAKEN" as const } : m));
    setAiSuggestion(null);
  }, []);

  const handleSaveMedication = useCallback((data: { name: string; dosage: string; scheduledTime: string; id?: string }) => {
    if (data.id) {
      setMedications(prev => prev.map(m => m.id === data.id ? { ...m, ...data } as Medication : m));
    } else {
      const newMed: Medication = {
        id: crypto.randomUUID(),
        name: data.name,
        dosage: data.dosage,
        scheduledTime: data.scheduledTime,
        status: "PENDING",
        timezoneRule: "CIRCADIAN"
      };
        setMedications(prev => [...prev, newMed]);
    }
    setIsMedModalOpen(false);
    setEditingMed(null);
  }, []);

  const handleDeleteMedication = useCallback((id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleSaveChallenge = useCallback((data: Omit<Challenge, "id" | "completed"> & { id?: string }) => {
    if (data.id) {
      setChallenges(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as Challenge : c));
    } else {
      const newChallenge: Challenge = {
        id: crypto.randomUUID(),
        ...data,
        completed: false
      };
      setChallenges(prev => [...prev, newChallenge]);
    }
    setIsChallengeModalOpen(false);
    setEditingChallenge(null);
  }, []);

  const handleDeleteChallenge = useCallback((id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  }, []);

  // ─── Computed stats ──────────────────────────────────────────────────────────
  const totalCalories = sessions.reduce((s, a) => s + a.calories, 0);
  const totalMinutes = sessions.reduce((s, a) => s + a.durationMin, 0);
  const pendingMeds = medications.filter((m) => m.status === "PENDING").length;

  const previewResult = calculateActivityBurn({
    durationHours: durationMin / 60,
    weightKg,
    speedMph,
    mode: activityMode,
    averageHeartRate: avgHr,
    restingHeartRate: 60,
  });

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--accent-blue), transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, var(--accent-purple), transparent 70%)" }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, var(--accent-cyan), transparent 70%)" }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="gradient-text-blue">Health</span>
              <span style={{ color: "var(--text-primary)" }}> & Vitality</span>
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{dateStr} · {timeStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnline((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: isOnline ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: isOnline ? "var(--accent-green)" : "var(--accent-red)",
                border: `1px solid ${isOnline ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}>
              {isOnline ? icons.sync : icons.offline}
              {isOnline ? "Online" : `Offline · ${offlineBuffer} pts buffered`}
            </button>
            {!isOnline && (
              <button onClick={handleSync} className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: "var(--accent-blue)", color: "white" }}>Sync Now</button>
            )}
          </div>
        </div>

        {/* ── User Settings ── */}
        <div className="mb-8">
          <UserSettings email={email} onEmailChange={setEmail} />
        </div>

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Calories Burned" value={totalCalories.toLocaleString()} unit="kcal" color="var(--accent-orange)" icon={icons.fire} />
          <StatCard label="Active Time" value={totalMinutes} unit="min" color="var(--accent-cyan)" icon={icons.lightning} />
          <StatCard label="Hydration" value={currentWaterMl} unit="ml" color="var(--accent-blue)" icon={icons.water} />
          <StatCard label="Sessions" value={sessions.length} color="var(--accent-purple)" icon="📊" />
          <StatCard label="Meds Pending" value={pendingMeds} color="var(--accent-red)" icon={icons.pill} />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT: Activity Tracker ── */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Activity Tracker</h2>
              {isTracking && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--accent-green)" }}>
                  <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: "var(--accent-green)" }} />
                  Live · {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                </div>
              )}
            </div>

            {/* Mode Selector */}
            <div className="flex p-1 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)]">
              <button onClick={() => setActivityMode("pedestrian")} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: activityMode === "pedestrian" ? "rgba(255,255,255,0.1)" : "transparent", color: activityMode === "pedestrian" ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {icons.running} Pedestrian
              </button>
              <button onClick={() => setActivityMode("cycling")} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: activityMode === "cycling" ? "rgba(255,255,255,0.1)" : "transparent", color: activityMode === "cycling" ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {icons.cycling} Cycling
              </button>
            </div>

            {/* Speed slider */}
            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                <span>Speed</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {speedMph.toFixed(1)} mph — <ActivityTypeTag type={previewResult.activityType} />
                </span>
              </div>
              <input
                type="range" min={activityMode === "cycling" ? 5 : 1} max={activityMode === "cycling" ? 25 : 12} step={0.5}
                value={speedMph} onChange={(e) => setSpeedMph(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex justify-between text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                <span>Duration</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{durationMin} min</span>
              </div>
              <input
                type="range" min={5} max={180} step={5}
                value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Live preview */}
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Estimated Burn</div>
                <div className="text-3xl font-black gradient-text-orange">
                  {previewResult.caloriesBurned.toLocaleString()}
                  <span className="text-base font-normal ml-1" style={{ color: "var(--text-secondary)" }}>kcal</span>
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  MET {previewResult.met.toFixed(1)} · HR ×{previewResult.hrMultiplier}
                </div>
              </div>
              <ActivityTypeTag type={previewResult.activityType} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setIsTracking((t) => !t); if (isTracking) setElapsed(0); }}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all"
                style={{ background: isTracking ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: isTracking ? "var(--accent-red)" : "var(--accent-green)", border: `1px solid ${isTracking ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                {isTracking ? "⏹ Stop" : "▶ Start Tracking"}
              </button>
              <button onClick={handleLogActivity} className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-all"
                style={{ background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))" }}>
                Log Activity
              </button>
            </div>
          </div>

          {/* ── RIGHT: Challenges & Meds ── */}
          <div className="flex flex-col gap-6">
            {/* Daily Challenges Card */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">Daily Challenges 🏆</h2>
                <button 
                  onClick={() => { setEditingChallenge(null); setIsChallengeModalOpen(true); }}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--accent-purple)] text-white font-semibold hover:opacity-90"
                >
                  + Add
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {challenges.map(c => (
                  <div key={c.id} className="group relative">
                    <div onClick={() => handleToggleChallenge(c.id)}
                      className="cursor-pointer rounded-2xl p-4 flex items-center justify-between border transition-all overflow-hidden"
                      style={{ background: c.completed ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.03)", borderColor: c.completed ? "var(--accent-purple)" : "var(--border)" }}>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{icons[c.type as keyof typeof icons] || icons.pushups}</div>
                        <div>
                          <div className="font-semibold text-sm capitalize">{c.targetReps} {c.type.replace(/-/g, " ")}</div>
                          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {c.isProgressive ? `Progressive (+${c.incrementBy})` : "Daily Goal"}
                          </div>
                        </div>
                      </div>
                      {c.completed ? <span className="text-xl text-[var(--accent-purple)]">✅</span> : <span className="text-xl opacity-20">⭕</span>}
                    </div>
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); setEditingChallenge(c); setIsChallengeModalOpen(true); }} className="p-2 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-white transition-all">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteChallenge(c.id); }} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-bold">×</button>
                    </div>
                  </div>
                ))}
                {challenges.length === 0 && <div className="text-center py-6 text-[var(--text-secondary)] text-xs italic">No challenges set. Add one to get started!</div>}
              </div>
            </div>

            {/* Medication Card */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Medication Reminders</h2>
                <button 
                  onClick={() => { setEditingMed(null); setIsMedModalOpen(true); }}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--accent-blue)] text-white font-semibold hover:opacity-90"
                >
                  + Add
                </button>
              </div>
              {aiSuggestion && !aiSuggestion.message.includes("Hydration") && <AiInsightBanner suggestion={aiSuggestion} />}
              <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "300px" }}>
                {medications.map((med) => (
                  <div key={med.id} className="group rounded-2xl p-4 flex items-center justify-between gap-3 border border-[var(--border)] bg-[rgba(255,255,255,0.03)]" style={{ opacity: med.status === "TAKEN" ? 0.5 : 1 }}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{icons.pill}</div>
                      <div>
                        <div className="font-semibold text-sm">{med.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{med.dosage} · {icons.clock} {med.scheduledTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {med.status === "PENDING" && <button onClick={() => handleMarkTaken(med.id)} className="text-xs px-2 py-1 rounded-lg bg-[rgba(16,185,129,0.2)] text-[var(--accent-green)] hover:bg-[rgba(16,185,129,0.3)] transition-all">✓ Take</button>}
                      <button onClick={() => { setEditingMed(med); setIsMedModalOpen(true); }} className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg bg-white/5 text-[var(--text-secondary)] hover:text-white transition-all">Edit</button>
                      <button onClick={() => handleDeleteMedication(med.id)} className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-bold">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Hydration & Activity Log ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">Hydration Tracker {icons.water}</h2>
            <div className="flex items-center justify-between bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.2)] rounded-2xl p-4">
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1">Daily Intake</div>
                <div className="text-3xl font-black gradient-text-blue">{currentWaterMl} <span className="text-base font-normal">/ {waterGoalMl} ml</span></div>
              </div>
              <ProgressRing value={currentWaterMl} max={waterGoalMl} color="var(--accent-blue)" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleLogWater(250)} className="py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.1)] flex flex-col items-center"><span className="text-xl mb-1">{icons.glass}</span><span className="text-xs font-bold">250ml</span></button>
              <button onClick={() => handleLogWater(500)} className="py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.1)] flex flex-col items-center"><span className="text-xl mb-1">🥤</span><span className="text-xs font-bold">500ml</span></button>
              <button onClick={() => { const amt = prompt("Enter ml:"); if (amt) handleLogWater(parseInt(amt)); }} className="py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.1)] flex flex-col items-center"><span className="text-xl mb-1">➕</span><span className="text-xs font-bold">Custom</span></button>
            </div>
          </div>

          <div className="glass-card p-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Activity Log</h2>
            <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "250px" }}>
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 py-3 px-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <ActivityTypeTag type={s.type} />
                    <span className="text-sm text-[var(--text-secondary)]">{s.speedMph} mph · {s.durationMin} min</span>
                  </div>
                  <div className="font-bold text-[var(--accent-orange)] text-sm">{icons.fire} {s.calories} kcal</div>
                </div>
              ))}
              {sessions.length === 0 && <div className="text-center py-10 text-[var(--text-secondary)] text-sm">No activity sessions logged today.</div>}
            </div>
          </div>
        </div>

      </div>

      <MedicationModal 
        isOpen={isMedModalOpen} 
        onClose={() => { setIsMedModalOpen(false); setEditingMed(null); }} 
        onSave={handleSaveMedication}
        editingMedication={editingMed}
      />

      <ChallengeForm
        isOpen={isChallengeModalOpen}
        onClose={() => { setIsChallengeModalOpen(false); setEditingChallenge(null); }}
        onSave={handleSaveChallenge}
        editingChallenge={editingChallenge}
      />
    </div>
  );
}
