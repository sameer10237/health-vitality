"use client";

import React from "react";
import { 
  Heart, 
  Activity, 
  Droplet, 
  Moon, 
  Flame, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Plus, 
  ArrowUpRight 
} from "lucide-react";
import { VitalsState } from "@/types/health";

interface VitalsCockpitProps {
  vitals: VitalsState;
  onQuickAddWater: (amount: number) => void;
  onOpenQuickLog: () => void;
}

export default function VitalsCockpit({
  vitals,
  onQuickAddWater,
  onOpenQuickLog,
}: VitalsCockpitProps) {
  // Blood Pressure AHA category classification
  const getBPCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: "Optimal / Normal", color: "emerald", code: "AHA-0" };
    if (sys >= 120 && sys <= 129 && dia < 80) return { label: "Elevated", color: "amber", code: "AHA-1" };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: "Stage 1 HTN", color: "amber", code: "AHA-2" };
    if (sys >= 140 || dia >= 90) return { label: "Stage 2 HTN", color: "rose", code: "AHA-3" };
    return { label: "Normal", color: "emerald", code: "AHA-0" };
  };

  const bpStatus = getBPCategory(vitals.systolic, vitals.diastolic);
  const waterPct = Math.min(100, Math.round((vitals.waterIntake / vitals.waterGoal) * 100));
  const caloriePct = Math.min(100, Math.round((vitals.activeCalories / vitals.calorieGoal) * 100));

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Biometric Telemetry Cockpit
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-sensor telemetry stream • Updated {vitals.lastUpdated}
          </p>
        </div>

        <button
          onClick={onOpenQuickLog}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group py-1 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40"
        >
          <span>Manual Entry Override</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Heart Rate & HRV */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Heart Rate & HRV
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {vitals.heartRate}
                </span>
                <span className="text-xs font-semibold text-slate-400">BPM</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm">
              <Heart className="w-5 h-5 animate-pulse text-rose-500" />
            </div>
          </div>

          {/* Mini pulse graphic */}
          <div className="my-4 h-9 flex items-center justify-between px-1 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <svg className="w-full h-7 stroke-rose-500 fill-none" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path
                d="M0,10 L25,10 L30,4 L35,16 L40,2 L45,18 L50,10 L75,10 L80,5 L85,15 L90,10 L100,10"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Resting HR</span>
              <span className="font-bold text-slate-200">{vitals.restingHeartRate} bpm</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">HRV (rMSSD)</span>
              <span className="font-bold text-emerald-400">{vitals.hrv} ms</span>
            </div>
          </div>
        </div>

        {/* Card 2: Blood Pressure */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Blood Pressure
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {vitals.systolic}
                </span>
                <span className="text-2xl font-light text-slate-500">/</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {vitals.diastolic}
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-1">mmHg</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          {/* AHA Badge Status */}
          <div className="my-4">
            <div className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold ${
              bpStatus.color === "emerald" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : bpStatus.color === "amber"
                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
            }`}>
              {bpStatus.color === "emerald" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>{bpStatus.label}</span>
              <span className="ml-auto text-[10px] opacity-75 font-mono">AHA 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Mean Arterial</span>
              <span className="font-bold text-slate-200">
                {Math.round((vitals.systolic + 2 * vitals.diastolic) / 3)} mmHg
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Pulse Pressure</span>
              <span className="font-bold text-slate-200">{vitals.systolic - vitals.diastolic} mmHg</span>
            </div>
          </div>
        </div>

        {/* Card 3: Blood Glucose & SpO2 */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Blood Glucose
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {vitals.glucose}
                </span>
                <span className="text-xs font-semibold text-slate-400">mg/dL</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Context pill & target band */}
          <div className="my-4 flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
              {vitals.glucoseContext}
            </span>
            <span className="text-slate-400 text-[11px]">Target: 70–130</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">SpO2 Saturation</span>
              <span className="font-bold text-emerald-400">{vitals.spo2}%</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">CGM Drift</span>
              <span className="font-bold text-slate-300">±1.2 mg/dL</span>
            </div>
          </div>
        </div>

        {/* Card 4: Sleep & Recovery Index */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Recovery Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {vitals.recoveryScore}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          {/* Sleep hours & quality bar */}
          <div className="my-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">{vitals.sleepHours} hrs sleep</span>
              <span className="text-indigo-400 font-bold">{vitals.sleepQuality}% Efficiency</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${vitals.recoveryScore}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Deep Sleep</span>
              <span className="font-bold text-slate-200">1h 48m (24%)</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">REM Sleep</span>
              <span className="font-bold text-slate-200">2h 10m (28%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Activity, Steps & Hydration Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity & Caloric Burn */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Active Caloric Expenditure</h3>
                <p className="text-xs text-slate-400">Step goal: {vitals.stepCount.toLocaleString()} / {vitals.stepGoal.toLocaleString()} steps</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/30">
              {caloriePct}% Goal
            </span>
          </div>

          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{vitals.activeCalories} kcal burned</span>
              <span className="text-slate-400">Goal: {vitals.calorieGoal} kcal</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${caloriePct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Hydration with Quick Add Buttons */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Hydration Tracker</h3>
                <p className="text-xs text-slate-400">
                  {vitals.waterIntake} mL logged of {vitals.waterGoal} mL daily baseline
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {waterPct}% Complete
            </span>
          </div>

          <div className="space-y-3">
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${waterPct}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Quick Log:</span>
              <button
                onClick={() => onQuickAddWater(250)}
                className="px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-cyan-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 250 mL
              </button>
              <button
                onClick={() => onQuickAddWater(500)}
                className="px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-cyan-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> 500 mL
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
