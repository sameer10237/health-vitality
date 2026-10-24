"use client";

import React, { useRef, useEffect } from "react";
import { Activity, Volume2, VolumeX } from "lucide-react";
import { telemetryAudio } from "@/lib/audio";

interface LiveECGStripProps {
  bpm: number;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export default function LiveECGStrip({
  bpm,
  isAudioEnabled,
  onToggleAudio,
}: LiveECGStripProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Running buffer
    const points: number[] = new Array(width).fill(midY);

    let phase = 0;
    let lastBeatTime = 0;

    const render = (time: number) => {
      // Calculate interval in ms based on current bpm
      const beatInterval = (60 / Math.max(40, bpm)) * 1000;

      if (time - lastBeatTime > beatInterval) {
        lastBeatTime = time;
        phase = 0; // Trigger P-Q-R-S-T sequence
        if (isAudioEnabled) {
          telemetryAudio.playHeartbeat();
        }
      }

      // Generate P-Q-R-S-T Lead II waveform displacement
      let displacement = 0;
      if (phase >= 0 && phase < 28) {
        if (phase < 8) {
          // P Wave (atrial depolarization)
          displacement = -Math.sin((phase / 8) * Math.PI) * 9;
        } else if (phase >= 8 && phase < 11) {
          // PR segment
          displacement = 0;
        } else if (phase >= 11 && phase < 13) {
          // Q dip
          displacement = 4;
        } else if (phase >= 13 && phase < 16) {
          // R spike (ventricular depolarization)
          displacement = -28;
        } else if (phase >= 16 && phase < 19) {
          // S dip
          displacement = 9;
        } else if (phase >= 19 && phase < 28) {
          // T Wave (ventricular repolarization)
          displacement = -Math.sin(((phase - 19) / 9) * Math.PI) * 12;
        }
        phase++;
      } else {
        // Isoelectric baseline with tiny biological micro-noise
        displacement = (Math.random() - 0.5) * 1.5;
      }

      const currentY = midY + displacement;
      points[x] = currentY;

      // Draw onto canvas
      ctx.fillStyle = "#070c18";
      ctx.fillRect(0, 0, width, height);

      // Draw faint clinical grid
      ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let gx = 0; gx < width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Draw waveform path with phosphor glow
      ctx.beginPath();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 8;

      for (let i = 0; i < width; i++) {
        const drawX = i;
        const drawY = points[i];
        if (i === 0) {
          ctx.moveTo(drawX, drawY);
        } else {
          // Leave cursor gap ahead of write head
          if (Math.abs(drawX - x) < 14) {
            ctx.moveTo(drawX, drawY);
          } else {
            ctx.lineTo(drawX, drawY);
          }
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw moving scanner beam / write head
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(x, currentY, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Advance write head
      x = (x + 2) % width;

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [bpm, isAudioEnabled]);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-emerald-500/20 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-Time Oscilloscope • Lead II Telemetry
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
            250 Hz Continuous
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-400">
            {bpm} BPM
          </span>
          <button
            onClick={onToggleAudio}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              isAudioEnabled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
            title={isAudioEnabled ? "Mute Acoustic Telemetry" : "Enable Acoustic Heartbeat"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-800/90 shadow-inner">
        <canvas
          ref={canvasRef}
          width={760}
          height={90}
          className="w-full h-20 sm:h-24 bg-[#070c18] block"
        />
      </div>
    </div>
  );
}
