"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar
} from "lucide-react";
import { MetricTrendPoint } from "@/types/health";

interface TrendAnalyticsProps {
  trendData: MetricTrendPoint[];
  selectedRange: "24h" | "7d" | "30d";
}

export default function TrendAnalytics({ trendData, selectedRange }: TrendAnalyticsProps) {
  const [activeMetric, setActiveMetric] = useState<"hr" | "bp" | "glucose">("hr");

  // Chart min/max scaling
  const getChartValues = () => {
    if (activeMetric === "hr") {
      return {
        values: trendData.map((d) => d.hr),
        unit: "BPM",
        label: "Heart Rate",
        color: "#f43f5e", // Rose
        min: 50,
        max: 110,
        normalRange: [60, 90],
      };
    }
    if (activeMetric === "bp") {
      return {
        values: trendData.map((d) => d.systolic),
        secondary: trendData.map((d) => d.diastolic),
        unit: "mmHg",
        label: "Blood Pressure (Systolic / Diastolic)",
        color: "#06b6d4", // Cyan
        min: 60,
        max: 150,
        normalRange: [75, 120],
      };
    }
    return {
      values: trendData.map((d) => d.glucose),
      unit: "mg/dL",
      label: "Blood Glucose",
      color: "#f59e0b", // Amber
      min: 60,
      max: 160,
      normalRange: [70, 130],
    };
  };

  const chart = getChartValues();

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 30;

  const getX = (index: number) => {
    if (trendData.length <= 1) return paddingX;
    return paddingX + (index / (trendData.length - 1)) * (svgWidth - 2 * paddingX);
  };

  const getY = (val: number) => {
    const clamped = Math.max(chart.min, Math.min(chart.max, val));
    const ratio = (clamped - chart.min) / (chart.max - chart.min);
    return svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
  };

  // Build SVG path
  const points = chart.values.map((v, i) => `${getX(i)},${getY(v)}`);
  const pathD = points.length > 0 ? `M ${points.join(" L ")}` : "";

  // Secondary path for Diastolic if BP
  const secondaryPoints = chart.secondary ? chart.secondary.map((v, i) => `${getX(i)},${getY(v)}`) : [];
  const secondaryPathD = secondaryPoints.length > 0 ? `M ${secondaryPoints.join(" L ")}` : "";

  return (
    <section className="space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Longitudinal Trend Analytics
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              TimescaleDB Aggregation
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Continuous multi-interval telemetry analysis with normal physiological baseline bands
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveMetric("hr")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === "hr"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Heart Rate
          </button>
          <button
            onClick={() => setActiveMetric("bp")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === "bp"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setActiveMetric("glucose")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeMetric === "glucose"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Glucose
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Card */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: chart.color }}></span>
            <span className="text-sm font-bold text-white">{chart.label}</span>
            <span className="text-xs text-slate-400">({chart.unit})</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
              <span>Healthy Baseline Band</span>
            </div>
            {chart.secondary && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-400/50"></span>
                <span>Diastolic</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56">
              {/* Healthy Target Shaded Band */}
              <rect
                x={paddingX}
                y={getY(chart.normalRange[1])}
                width={svgWidth - 2 * paddingX}
                height={Math.abs(getY(chart.normalRange[0]) - getY(chart.normalRange[1]))}
                fill="rgba(16, 185, 129, 0.07)"
                rx={4}
              />

              {/* Grid Lines */}
              {[chart.min, Math.round((chart.min + chart.max) / 2), chart.max].map((lvl) => (
                <g key={lvl}>
                  <line
                    x1={paddingX}
                    y1={getY(lvl)}
                    x2={svgWidth - paddingX}
                    y2={getY(lvl)}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={getY(lvl) + 4}
                    fill="#64748b"
                    fontSize="11"
                    textAnchor="end"
                    fontWeight="500"
                  >
                    {lvl}
                  </text>
                </g>
              ))}

              {/* Primary Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={chart.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Secondary Line (Diastolic) */}
              {secondaryPathD && (
                <path
                  d={secondaryPathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                />
              )}

              {/* Data Node Dots */}
              {trendData.map((d, i) => {
                const val = chart.values[i];
                const cx = getX(i);
                const cy = getY(val);
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={chart.color}
                      className="transition-all duration-200 group-hover:r-7"
                    />
                    <circle cx={cx} cy={cy} r="8" fill={chart.color} opacity="0.25" />
                    <text
                      x={cx}
                      y={svgHeight - 8}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="500"
                    >
                      {d.time}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* AI Cross-Metric Correlation Engine */}
      <div className="glass-panel-elevated rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Biometric Correlation Engine
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Statistical Model (p &lt; 0.05)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cross-referencing lifestyle inputs against physiological recovery markers
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1: Late Meal vs Resting HR */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> High Negative Impact
              </span>
              <span className="text-slate-400 font-mono text-[11px]">r = +0.78</span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">Late Dinners (&gt; 21:00) vs Sleeping Heart Rate</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              On nights with meals logged after 21:00, your overnight resting heart rate rose by an average of{" "}
              <strong className="text-slate-200">+5.4 bpm</strong>, causing a{" "}
              <strong className="text-rose-400">22% deficit</strong> in restorative slow-wave deep sleep.
            </p>
          </div>

          {/* Insight 2: Hydration vs HRV Recovery */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong Positive Correlation
              </span>
              <span className="text-slate-400 font-mono text-[11px]">r = +0.84</span>
            </div>
            <h4 className="font-bold text-slate-100 text-sm">2,500+ mL Hydration vs Morning HRV</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consistently meeting your daily water goal yields an average{" "}
              <strong className="text-emerald-300">+14 ms higher rMSSD HRV</strong> the following morning,
              accelerating athletic and central nervous system recovery.
            </p>
          </div>
        </div>

        {/* Clinical Safety Disclaimer Guardrail */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong>Clinical Safety Notice:</strong> Statistical correlations are computed for wellness optimization
            and lifestyle awareness. They do not constitute a clinical diagnosis or treatment recommendation. Always
            consult with a licensed healthcare provider before making major medical or dietary changes.
          </p>
        </div>
      </div>
    </section>
  );
}
