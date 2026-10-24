"use client";

import React from "react";
import { Activity, ShieldCheck, Bluetooth, FileText, Plus, Lock, Radio, Stethoscope, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenQuickLog: () => void;
  onOpenDevices: () => void;
  onOpenReport: () => void;
  onOpenVault: () => void;
  onOpenAIDoctor: () => void;
  selectedRange: "24h" | "7d" | "30d";
  onSelectRange: (range: "24h" | "7d" | "30d") => void;
}

export default function Header({
  onOpenQuickLog,
  onOpenDevices,
  onOpenReport,
  onOpenVault,
  onOpenAIDoctor,
  selectedRange,
  onSelectRange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0b1120] rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                VITALIS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO CLINICAL
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              E2EE Telemetry Engine • HIPAA / GDPR Active
            </p>
          </div>
        </div>

        {/* Range Selector & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Timeframe pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center text-xs font-semibold">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => onSelectRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === r
                    ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* AI Doctor Button with Pulsing Emerald Glow */}
          <button
            onClick={onOpenAIDoctor}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95 relative"
          >
            <Stethoscope className="w-4 h-4 stroke-[2.5]" />
            <span>Dr. Vitalis AI</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </button>

          {/* Quick Log Button */}
          <button
            onClick={onOpenQuickLog}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span className="hidden sm:inline">Log Vitals</span>
          </button>

          {/* Device Sync Button */}
          <button
            onClick={onOpenDevices}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all"
            title="Wearables & Ecosystem Sync"
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">Sync Hub</span>
          </button>

          {/* Clinical Export Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-all"
            title="Generate Physician-Ready PDF"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Doctor PDF</span>
          </button>

          {/* Security & Vault Button */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 text-xs sm:text-sm font-medium transition-all"
            title="Zero-Trust Security & HIPAA Privacy Console"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Vault</span>
          </button>
        </div>
      </div>
    </header>
  );
}
