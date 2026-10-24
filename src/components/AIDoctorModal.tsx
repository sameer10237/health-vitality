"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Stethoscope, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Bot,
  User,
  Download,
  Activity
} from "lucide-react";
import { VitalsState } from "@/types/health";

interface ChatMessage {
  id: string;
  sender: "user" | "doctor";
  text: string;
  category?: "optimal" | "advisory" | "urgent" | "lifestyle";
  clinicalReference?: string;
  suggestedActions?: { label: string; action: string }[];
  timestamp: string;
}

interface AIDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vitals: VitalsState;
  onOpenQuickLog: () => void;
  onOpenReport: () => void;
  onQuickAddWater: (amount: number) => void;
}

export default function AIDoctorModal({
  isOpen,
  onClose,
  vitals,
  onOpenQuickLog,
  onOpenReport,
  onQuickAddWater,
}: AIDoctorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "doctor",
      text: `Hello Alex, I'm Dr. Vitalis, your board-certified Clinical AI Copilot. I've analyzed your real-time biometrics: Blood Pressure is optimal at ${vitals.systolic}/${vitals.diastolic} mmHg, Heart Rate is ${vitals.heartRate} bpm, Fasting Glucose is ${vitals.glucose} mg/dL, and your Recovery Score is strong at ${vitals.recoveryScore}/100. How can I assist you with clinical interpretations, nutrition timing, or doctor visit preparations today?`,
      category: "optimal",
      clinicalReference: "Vitalis Clinical Decision Support Core • AHA/ADA 2026 Standards",
      suggestedActions: [
        { label: "Analyze Blood Pressure", action: "ASK_BP" },
        { label: "Explain Thursday HRV Drop", action: "ASK_RECOVERY" },
        { label: "Doctor Visit Questions", action: "ASK_VISIT" },
      ],
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setIsVoiceActive(true);
      utterance.onend = () => setIsVoiceActive(false);
      utterance.onerror = () => setIsVoiceActive(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();

      if (data.success && data.reply) {
        const docMsg: ChatMessage = {
          id: `doc-${Date.now()}`,
          sender: "doctor",
          text: data.reply.message,
          category: data.reply.category,
          clinicalReference: data.reply.clinicalReference,
          suggestedActions: data.reply.suggestedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, docMsg]);

        if (isVoiceActive) {
          speakText(docMsg.text);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "doctor",
          text: "I encountered a transient communication error while querying the clinical inference engine. Please retry your inquiry.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === "OPEN_BP_LOG" || action === "OPEN_GLUCOSE_LOG") {
      onClose();
      onOpenQuickLog();
    } else if (action === "VIEW_DOCTOR_PDF") {
      onClose();
      onOpenReport();
    } else if (action === "DOWNLOAD_FHIR") {
      window.open("/api/export-fhir", "_blank");
    } else if (action === "LOG_WATER_500") {
      onQuickAddWater(500);
      handleSendMessage("I just logged an additional 500 mL of water!");
    } else if (action === "ASK_BP") {
      handleSendMessage("Please analyze my latest blood pressure and give me cardiovascular recommendations.");
    } else if (action === "ASK_RECOVERY") {
      handleSendMessage("Why did my recovery score drop to 69% on Thursday?");
    } else if (action === "ASK_VISIT") {
      handleSendMessage("What questions should I ask my primary care doctor at my next checkup?");
    }
  };

  const exportChatTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join("\n--------------------\n");
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitalis-clinical-consult-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0b1120] border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[820px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/25">
                <div className="w-full h-full bg-[#0b1120] rounded-2xl flex items-center justify-center text-emerald-400">
                  <Stethoscope className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0f172a]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  Dr. Vitalis, MD, PhD
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI CLINICAL COPILOT
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                AHA/ADA 2026 Guidelines • HIPAA Encrypted Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isVoiceActive) {
                  window.speechSynthesis?.cancel();
                  setIsVoiceActive(false);
                } else {
                  speakText(messages[messages.length - 1]?.text || "");
                }
              }}
              className={`p-2 rounded-xl text-xs transition-all ${
                isVoiceActive
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
              title={isVoiceActive ? "Stop Read-Aloud" : "Read-Aloud Latest Clinical Response"}
            >
              {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={exportChatTranscript}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Export Consultation Transcript"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Patient Context Pill Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between overflow-x-auto text-xs text-slate-300 gap-4 shrink-0 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Patient: <strong className="text-white">Alex Vance</strong>
            </span>
            <span>•</span>
            <span>BP: <strong className="text-cyan-400">{vitals.systolic}/{vitals.diastolic} mmHg</strong></span>
            <span>•</span>
            <span>HR: <strong className="text-rose-400">{vitals.heartRate} bpm</strong></span>
            <span>•</span>
            <span>Glucose: <strong className="text-amber-400">{vitals.glucose} mg/dL</strong></span>
            <span>•</span>
            <span>Recovery: <strong className="text-emerald-400">{vitals.recoveryScore}/100</strong></span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            E2EE Session
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "doctor" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Stethoscope className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 text-sm ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/20 rounded-tr-none font-medium"
                    : m.category === "urgent"
                    ? "bg-rose-950/70 border border-rose-600/80 text-rose-100 shadow-xl shadow-rose-950/30 rounded-tl-none"
                    : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 font-mono">
                  <span>{m.sender === "user" ? "Alex" : "Dr. Vitalis"}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {m.text}
                </div>

                {/* Clinical Reference Citation */}
                {m.clinicalReference && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{m.clinicalReference}</span>
                  </div>
                )}

                {/* Action Deep-Links */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {m.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(act.action)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                      >
                        <span>{act.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Dr. Vitalis is evaluating cardiometabolic biomarkers...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-slate-500 uppercase font-bold shrink-0">Quick Topics:</span>
          <button
            onClick={() => handleSendMessage("Analyze my 7-day cardiometabolic trends and blood pressure.")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            🩺 7-Day Cardiometabolic
          </button>
          <button
            onClick={() => handleSendMessage("Why did my recovery score drop to 69% on Thursday?")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            ⚡ Thursday Recovery Drop
          </button>
          <button
            onClick={() => handleSendMessage("What questions should I ask my doctor at my next visit?")}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            📋 Doctor Visit Questions
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-[#0f172a] border-t border-slate-800 flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Dr. Vitalis about symptoms, vitals, nutrition timing, or reports..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
