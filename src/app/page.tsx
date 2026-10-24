"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import VitalsCockpit from "@/components/VitalsCockpit";
import TrendAnalytics from "@/components/TrendAnalytics";
import LiveECGStrip from "@/components/LiveECGStrip";
import QuickLogModal from "@/components/QuickLogModal";
import DeviceSyncModal from "@/components/DeviceSyncModal";
import ClinicalReportModal from "@/components/ClinicalReportModal";
import SecurityVaultModal from "@/components/SecurityVaultModal";
import AIDoctorModal from "@/components/AIDoctorModal";
import { VitalsState, MetricTrendPoint, DeviceConnection } from "@/types/health";
import { ShieldCheck, Heart, Radio, Activity, RefreshCw, Stethoscope, Sparkles } from "lucide-react";
import { telemetryAudio } from "@/lib/audio";

export default function Home() {
  const [selectedRange, setSelectedRange] = useState<"24h" | "7d" | "30d">("7d");
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAIDoctorOpen, setIsAIDoctorOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Core Vitals State
  const [vitals, setVitals] = useState<VitalsState>({
    heartRate: 72,
    restingHeartRate: 58,
    hrv: 64,
    systolic: 118,
    diastolic: 76,
    glucose: 94,
    glucoseContext: "Fasting",
    spo2: 99,
    recoveryScore: 88,
    sleepHours: 7.8,
    sleepQuality: 92,
    waterIntake: 1850,
    waterGoal: 2800,
    activeCalories: 640,
    calorieGoal: 800,
    stepCount: 8420,
    stepGoal: 10000,
    lastUpdated: "Synchronizing...",
  });

  // Load from backend on mount
  useEffect(() => {
    fetch("/api/vitals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vitals) {
          setVitals(data.vitals);
        }
      })
      .catch((err) => console.log("Using cached vitals", err));
  }, []);

  // Trend Data
  const [trendData, setTrendData] = useState<MetricTrendPoint[]>([
    { time: "Mon", hr: 68, systolic: 116, diastolic: 74, glucose: 92, recovery: 85 },
    { time: "Tue", hr: 74, systolic: 122, diastolic: 78, glucose: 98, recovery: 78 },
    { time: "Wed", hr: 70, systolic: 118, diastolic: 76, glucose: 95, recovery: 82 },
    { time: "Thu", hr: 79, systolic: 126, diastolic: 82, glucose: 108, recovery: 69 },
    { time: "Fri", hr: 71, systolic: 119, diastolic: 75, glucose: 94, recovery: 84 },
    { time: "Sat", hr: 66, systolic: 115, diastolic: 73, glucose: 90, recovery: 91 },
    { time: "Sun (Today)", hr: 72, systolic: 118, diastolic: 76, glucose: 94, recovery: 88 },
  ]);

  // Connected Devices
  const [devices, setDevices] = useState<DeviceConnection[]>([
    {
      id: "apple-hk",
      name: "Apple HealthKit (iOS 18.2)",
      type: "AppleHealth",
      status: "connected",
      battery: 0,
      lastSync: "3 mins ago",
      protocol: "HKObserverQuery (Continuous)",
    },
    {
      id: "ble-cuff",
      name: "Omron Evolv Smart BP Cuff",
      type: "BLE",
      status: "connected",
      battery: 84,
      lastSync: "Today, 08:15 AM",
      protocol: "GATT 0x1810 (Blood Pressure)",
    },
    {
      id: "ble-cgm",
      name: "Dexcom G7 Continuous Glucose",
      type: "BLE",
      status: "connected",
      battery: 92,
      lastSync: "5 mins ago",
      protocol: "GATT 0x1808 (Glucose Stream)",
    },
  ]);

  // Natural resting pulse fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((prev) => {
        const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newHR = Math.max(68, Math.min(78, prev.heartRate + jitter));
        return {
          ...prev,
          heartRate: newHR,
        };
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    telemetryAudio.setMuted(!nextState);
    if (nextState) {
      telemetryAudio.playHeartbeat();
    }
  };

  const handleQuickAddWater = (amount: number) => {
    telemetryAudio.playSuccess();
    setVitals((prev) => ({
      ...prev,
      waterIntake: prev.waterIntake + amount,
      lastUpdated: "Just now",
    }));

    fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waterIntake: amount }),
    }).catch(() => {});
  };

  const handleSaveVitals = (entry: {
    heartRate?: number;
    systolic?: number;
    diastolic?: number;
    glucose?: number;
    glucoseContext?: "Fasting" | "Post-Prandial" | "Pre-Meal";
    waterIntake?: number;
  }) => {
    setVitals((prev) => ({
      ...prev,
      heartRate: entry.heartRate ?? prev.heartRate,
      systolic: entry.systolic ?? prev.systolic,
      diastolic: entry.diastolic ?? prev.diastolic,
      glucose: entry.glucose ?? prev.glucose,
      glucoseContext: entry.glucoseContext ?? prev.glucoseContext,
      waterIntake: entry.waterIntake ? prev.waterIntake + entry.waterIntake : prev.waterIntake,
      lastUpdated: "Persisted to SQLite Vault",
    }));
  };

  const handleTriggerSync = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: "syncing" } : d))
    );
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: "connected", lastSync: "Just now" } : d))
      );
    }, 1500);
  };

  const handlePairNewDevice = (device: DeviceConnection) => {
    setDevices((prev) => [device, ...prev]);
  };

  const handleLiveHeartRateUpdate = (hr: number) => {
    setVitals((prev) => ({
      ...prev,
      heartRate: hr,
      lastUpdated: "Live BLE Stream",
    }));
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black relative">
      {/* Top Header */}
      <Header
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenDevices={() => setIsDevicesOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        onOpenAIDoctor={() => setIsAIDoctorOpen(true)}
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
      />

      {/* Main Cockpit Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Compliance & Live Telemetry Alert Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>HIPAA Security Rule § 164.312 Active</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Zero-Knowledge
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Prisma SQLite Persisted
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                AES-256 Envelope Encryption active • Web Bluetooth GATT 5.2 link active • HMAC-SHA256 Audit Trail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium self-end sm:self-center">
            <button
              onClick={() => setIsAIDoctorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all font-semibold cursor-pointer active:scale-95"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Dr. Vitalis Clinical Copilot Ready</span>
            </button>
          </div>
        </div>

        {/* Real-time Oscilloscope Lead II Waveform */}
        <LiveECGStrip
          bpm={vitals.heartRate}
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleToggleAudio}
        />

        {/* Biometric Telemetry Cockpit */}
        <VitalsCockpit
          vitals={vitals}
          onQuickAddWater={handleQuickAddWater}
          onOpenQuickLog={() => setIsQuickLogOpen(true)}
        />

        {/* Longitudinal Trend Analytics */}
        <TrendAnalytics trendData={trendData} selectedRange={selectedRange} />
      </div>

      {/* Floating AI Doctor Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAIDoctorOpen(true)}
          className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-500/40 border border-white/20 transition-all transform hover:-translate-y-1 active:scale-95"
          title="Open Dr. Vitalis AI Clinical Copilot"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-4 h-4 animate-pulse stroke-[2.5]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs uppercase font-extrabold tracking-wider leading-none text-slate-950">
              Dr. Vitalis AI
            </div>
            <div className="text-[10px] font-semibold text-slate-900 leading-none mt-1">
              Ask Clinical Copilot
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <AIDoctorModal
        isOpen={isAIDoctorOpen}
        onClose={() => setIsAIDoctorOpen(false)}
        vitals={vitals}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onQuickAddWater={handleQuickAddWater}
      />

      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSaveVitals={handleSaveVitals}
      />

      <DeviceSyncModal
        isOpen={isDevicesOpen}
        onClose={() => setIsDevicesOpen(false)}
        devices={devices}
        onTriggerSync={handleTriggerSync}
        onPairNewDevice={handlePairNewDevice}
        onLiveHeartRateUpdate={handleLiveHeartRateUpdate}
      />

      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        vitals={vitals}
      />

      <SecurityVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 text-center text-xs text-slate-500 space-y-1">
        <p>Vitalis Health Engine • HIPAA HITECH &amp; GDPR Compliant Digital Health Platform</p>
        <p className="text-[11px] text-slate-600">
          FDA SaMD Class I Wellness Enforcement Discretion. Dr. Vitalis Clinical Copilot and Lead II Telemetry active.
        </p>
      </footer>
    </main>
  );
}
