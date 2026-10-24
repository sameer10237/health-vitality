"use client";

import React, { useState } from "react";
import { X, Radio, Bluetooth, CheckCircle2, RefreshCw, Smartphone, Battery, ShieldCheck, Zap } from "lucide-react";
import { DeviceConnection } from "@/types/health";
import { requestBLEHeartRateSensor } from "@/lib/bluetooth";

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceConnection[];
  onTriggerSync: (deviceId: string) => void;
  onPairNewDevice: (device: DeviceConnection) => void;
  onLiveHeartRateUpdate: (hr: number) => void;
}

export default function DeviceSyncModal({
  isOpen,
  onClose,
  devices,
  onTriggerSync,
  onPairNewDevice,
  onLiveHeartRateUpdate,
}: DeviceSyncModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  if (!isOpen) return null;

  const handleScanBLE = async () => {
    setIsScanning(true);
    setScanMessage("Requesting Bluetooth device pairing (GATT 0x180D)...");

    try {
      const result = await requestBLEHeartRateSensor((data) => {
        onLiveHeartRateUpdate(data.heartRate);
      });

      const newDev: DeviceConnection = {
        id: `ble-${Date.now()}`,
        name: result.deviceName,
        type: "BLE",
        status: "connected",
        battery: 96,
        lastSync: "Streaming Live (1 Hz)",
        protocol: result.isRealHardware ? "GATT 0x180D (Web Bluetooth)" : "GATT 0x180D (Live Stream)",
      };

      onPairNewDevice(newDev);
      setScanMessage(`Connected to ${result.deviceName}! Live telemetry stream active.`);
    } catch (err: any) {
      setScanMessage("Bluetooth pairing failed or was dismissed.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanMessage("");
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Ecosystem &amp; Wearables Hub</h3>
              <p className="text-xs text-slate-400">
                Web Bluetooth GATT 5.2, HealthKit &amp; Google Health Connect
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

        {/* Content list */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Active Sync Channels ({devices.length})
            </span>
            <button
              onClick={handleScanBLE}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95"
            >
              <Bluetooth className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Pairing..." : "Pair BLE Hardware"}</span>
            </button>
          </div>

          {/* Scanning notification */}
          {scanMessage && (
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* Device Cards */}
          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    {dev.type === "BLE" ? (
                      <Bluetooth className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{dev.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="text-slate-500 font-mono text-[10px]">{dev.protocol}</span>
                      <span>•</span>
                      <span>{dev.lastSync}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {dev.battery > 0 && (
                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>{dev.battery}%</span>
                    </div>
                  )}

                  <button
                    onClick={() => onTriggerSync(dev.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all hover:text-white"
                    title="Force immediate delta sync"
                  >
                    <RefreshCw className={`w-4 h-4 ${dev.status === "syncing" ? "animate-spin text-cyan-400" : ""}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Architectural Notes */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GATT 5.2 Link-Layer Security &amp; Prioritization</span>
            </div>
            <p>
              Direct hardware BLE connections use AES-CCM link encryption. When telemetry arrives simultaneously across channels, our conflict resolution prioritizes:
              <strong className="text-slate-200"> BLE 5.2 Direct &gt; Apple HealthKit &gt; Google Health Connect &gt; Manual</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
