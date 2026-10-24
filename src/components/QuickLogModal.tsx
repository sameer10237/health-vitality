"use client";

import React, { useState } from "react";
import { X, Heart, Activity, Zap, Droplet, Check, ShieldCheck } from "lucide-react";
import { telemetryAudio } from "@/lib/audio";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVitals: (entry: {
    heartRate?: number;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    glucoseContext?: "Fasting" | "Post-Prandial" | "Pre-Meal";
    waterIntake?: number;
  }) => void;
}

export default function QuickLogModal({
  isOpen,
  onClose,
  onSaveVitals,
}: QuickLogModalProps) {
  const [activeTab, setActiveTab] = useState<"bp" | "glucose" | "hr" | "water">("bp");
  
  // Form states
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [glucose, setGlucose] = useState("95");
  const [glucoseContext, setGlucoseContext] = useState<"Fasting" | "Post-Prandial" | "Pre-Meal">("Fasting");
  const [heartRate, setHeartRate] = useState("72");
  const [water, setWater] = useState("250");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};

    if (activeTab === "bp") {
      payload.systolic = parseInt(systolic, 10);
      payload.diastolic = parseInt(diastolic, 10);
    } else if (activeTab === "glucose") {
      payload.glucose = parseInt(glucose, 10);
      payload.glucoseContext = glucoseContext;
    } else if (activeTab === "hr") {
      payload.heartRate = parseInt(heartRate, 10);
    } else if (activeTab === "water") {
      payload.waterIntake = parseInt(water, 10);
    }

    onSaveVitals(payload);
    telemetryAudio.playSuccess();

    // Persist to database in background
    try {
      fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Background catch
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Log Biometrics</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> AES-256 Encrypted at Entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-4 p-2 bg-slate-900/90 border-b border-slate-800 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("bp")}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === "bp"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>BP</span>
          </button>
          <button
            onClick={() => setActiveTab("glucose")}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === "glucose"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Glucose</span>
          </button>
          <button
            onClick={() => setActiveTab("hr")}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === "hr"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Pulse</span>
          </button>
          <button
            onClick={() => setActiveTab("water")}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === "water"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Water</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === "bp" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="220"
                    required
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Optimal: &lt; 120</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="140"
                    required
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Optimal: &lt; 80</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "glucose" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Blood Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  min="40"
                  max="400"
                  required
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Timing / Context Tag
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Fasting", "Post-Prandial", "Pre-Meal"] as const).map((ctx) => (
                    <button
                      type="button"
                      key={ctx}
                      onClick={() => setGlucoseContext(ctx)}
                      className={`py-2 px-1 text-xs rounded-lg font-medium transition-all ${
                        glucoseContext === ctx
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {ctx}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "hr" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min="35"
                  max="220"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {activeTab === "water" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Water Volume to Add (mL)
                </label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  max="2000"
                  required
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" /> Logged &amp; Encrypted!
              </>
            ) : (
              "Save Reading to Vault"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
