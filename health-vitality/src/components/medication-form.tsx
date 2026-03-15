"use client";

import { useState, useEffect } from "react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  status: "PENDING" | "TAKEN" | "MISSED" | "SNOOZED";
  timezoneRule: "ABSOLUTE" | "CIRCADIAN";
}

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (med: Omit<Medication, "id" | "status" | "timezoneRule"> & { id?: string }) => void;
  editingMedication?: Medication | null;
}

export default function MedicationModal({ isOpen, onClose, onSave, editingMedication }: MedicationModalProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");

  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name);
      setDosage(editingMedication.dosage);
      setTime(editingMedication.scheduledTime);
    } else {
      setName("");
      setDosage("");
      setTime("08:00");
    }
  }, [editingMedication, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold mb-6 gradient-text-blue">
          {editingMedication ? "Edit Medication" : "Add Medication"}
        </h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Medication Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Magnesium Glycinate"
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-blue)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 400mg"
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-blue)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Scheduled Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-blue)] transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all border border-[var(--border)] hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ name, dosage, scheduledTime: time, id: editingMedication?.id })}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] hover:opacity-90 active:scale-[0.98]"
          >
            {editingMedication ? "Update" : "Add Medication"}
          </button>
        </div>
      </div>
    </div>
  );
}
