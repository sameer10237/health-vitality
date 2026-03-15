"use client";

import { useState, useEffect } from "react";

export type ExerciseType = "push-ups" | "squats" | "chest-workout" | "shoulder-workout" | "plank" | "jumping-jacks";

export interface Challenge {
  id: string;
  type: ExerciseType;
  targetReps: number;
  completed: boolean;
  isProgressive: boolean;
  incrementBy: number;
}

interface ChallengeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (challenge: Omit<Challenge, "id" | "completed"> & { id?: string }) => void;
  editingChallenge?: Challenge | null;
}

export default function ChallengeForm({ isOpen, onClose, onSave, editingChallenge }: ChallengeFormProps) {
  const [type, setType] = useState<ExerciseType>("push-ups");
  const [targetReps, setTargetReps] = useState(10);
  const [isProgressive, setIsProgressive] = useState(false);
  const [incrementBy, setIncrementBy] = useState(5);

  useEffect(() => {
    if (editingChallenge) {
      setType(editingChallenge.type);
      setTargetReps(editingChallenge.targetReps);
      setIsProgressive(editingChallenge.isProgressive);
      setIncrementBy(editingChallenge.incrementBy);
    } else {
      setType("push-ups");
      setTargetReps(10);
      setIsProgressive(false);
      setIncrementBy(5);
    }
  }, [editingChallenge, isOpen]);

  if (!isOpen) return null;

  const exerciseOptions: { value: ExerciseType; label: string; icon: string }[] = [
    { value: "push-ups", label: "Push-ups", icon: "💪" },
    { value: "squats", label: "Squats", icon: "🦵" },
    { value: "chest-workout", label: "Chest Workout", icon: "🏋️‍♂️" },
    { value: "shoulder-workout", label: "Shoulder Workout", icon: "🙋‍♂️" },
    { value: "plank", label: "Plank", icon: "🧘" },
    { value: "jumping-jacks", label: "Jumping Jacks", icon: "🏃" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-bold mb-6 gradient-text-purple">
          {editingChallenge ? "Edit Challenge" : "Add Challenge"}
        </h2>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Exercise Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ExerciseType)}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-all appearance-none"
            >
              {exerciseOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1c20]">{opt.icon} {opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Target Reps / Seconds</label>
            <input
              type="number"
              value={targetReps}
              onChange={(e) => setTargetReps(Number(e.target.value))}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-all"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-[var(--border)]">
            <div>
              <div className="text-sm font-bold">Progressive Mode</div>
              <div className="text-xs text-[var(--text-secondary)]">Increments target after completion</div>
            </div>
            <button
              onClick={() => setIsProgressive(!isProgressive)}
              className={`w-12 h-6 rounded-full transition-all relative ${isProgressive ? "bg-[var(--accent-purple)]" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isProgressive ? "left-7" : "left-1"}`} />
            </button>
          </div>

          {isProgressive && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">Increment By</label>
              <input
                type="number"
                value={incrementBy}
                onChange={(e) => setIncrementBy(Number(e.target.value))}
                className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-all"
                placeholder="e.g. 5"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all border border-[var(--border)] hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ type, targetReps, isProgressive, incrementBy, id: editingChallenge?.id })}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] hover:opacity-90 active:scale-[0.98]"
          >
            {editingChallenge ? "Update" : "Add Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}
