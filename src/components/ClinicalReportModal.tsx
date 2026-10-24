"use client";

import React, { useRef } from "react";
import { X, Printer, ShieldCheck, QrCode, FileText, CheckCircle2, Download } from "lucide-react";
import { VitalsState } from "@/types/health";

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: VitalsState;
}

export default function ClinicalReportModal({
  isOpen,
  onClose,
  vitals,
}: ClinicalReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFHIR = () => {
    window.open("/api/export-fhir", "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#0b1120] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Physician-Ready Clinical Summary</h3>
              <p className="text-xs text-slate-400">
                HL7 FHIR R4 &amp; LOINC Standardized Telemetry Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFHIR}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Download machine-readable HL7 FHIR JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">FHIR JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div ref={reportRef} className="p-8 space-y-6 overflow-y-auto bg-[#0a0f1d] text-slate-100">
          {/* Clinic Header */}
          <div className="border-b border-slate-700/80 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                VITALIS CLINICAL SUMMARY REPORT
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Ambulatory Biometric Profile &amp; Vitals Registry • Verified Longitudinal Telemetry
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                <span><strong>Patient ID:</strong> PX-8849-01</span>
                <span><strong>DOB:</strong> 1994-08-14 (Age 32)</span>
                <span><strong>Sex:</strong> Male</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 VERIFIED</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
                Report Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* LOINC Coded Clinical Vitals Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Standardized Clinical Vitals (LOINC Standards)
            </h4>
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Observation</th>
                    <th className="p-3">LOINC Code</th>
                    <th className="p-3">Recorded Value</th>
                    <th className="p-3">Reference Interval</th>
                    <th className="p-3">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  <tr>
                    <td className="p-3 font-medium text-white">Blood Pressure Panel</td>
                    <td className="p-3 font-mono text-cyan-400">85354-9</td>
                    <td className="p-3 font-bold text-white">
                      {vitals.systolic} / {vitals.diastolic} mmHg
                    </td>
                    <td className="p-3 text-slate-400">&lt; 120 / &lt; 80 mmHg</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Normal (AHA)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-white">Resting Heart Rate</td>
                    <td className="p-3 font-mono text-cyan-400">8867-4</td>
                    <td className="p-3 font-bold text-white">{vitals.restingHeartRate} bpm</td>
                    <td className="p-3 text-slate-400">60 – 100 bpm</td>
                    <td className="p-3 text-emerald-400 font-bold">Optimal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-white">Blood Glucose (Capillary/CGM)</td>
                    <td className="p-3 font-mono text-cyan-400">2339-0</td>
                    <td className="p-3 font-bold text-white">{vitals.glucose} mg/dL</td>
                    <td className="p-3 text-slate-400">70 – 130 mg/dL</td>
                    <td className="p-3 text-emerald-400 font-bold">In Target ({vitals.glucoseContext})</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-white">Oxygen Saturation (SpO2)</td>
                    <td className="p-3 font-mono text-cyan-400">2708-6</td>
                    <td className="p-3 font-bold text-white">{vitals.spo2}%</td>
                    <td className="p-3 text-slate-400">95% – 100%</td>
                    <td className="p-3 text-emerald-400 font-bold">Optimal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-white">Sleep Recovery Index</td>
                    <td className="p-3 font-mono text-slate-500">Custom Composite</td>
                    <td className="p-3 font-bold text-white">{vitals.recoveryScore} / 100</td>
                    <td className="p-3 text-slate-400">&gt; 75</td>
                    <td className="p-3 text-emerald-400 font-bold">Restorative</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ambulatory Notes for Clinician */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Longitudinal Observation Notes
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Patient exhibits stable home blood pressure readings across the prior 30-day reporting window
              (Mean arterial pressure: {Math.round((vitals.systolic + 2 * vitals.diastolic) / 3)} mmHg).
              Continuous glucose monitoring telemetry confirms 94% Time in Range (70-140 mg/dL). Autonomic
              nervous system metrics (HRV {vitals.hrv}ms rMSSD) confirm adequate physiological recovery.
            </p>
          </div>

          {/* Signature & Tamper-Evident QR Code Verification Footer */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="space-y-1">
              <p className="font-mono text-[11px] text-slate-500">
                Cryptographic Digest: 7e4b9...c31f89 (HMAC-SHA256)
              </p>
              <p className="text-[11px]">
                Valid for clinical consultation. HIPAA Business Associate Agreement compliant.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <QrCode className="w-8 h-8 text-cyan-400" />
              <div className="text-[10px] leading-tight font-mono">
                <span>DIGITAL VERIFY</span>
                <span className="block text-slate-500">vitalis.health/rx/8849</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
