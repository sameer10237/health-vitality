"use client";

import { useState } from "react";

interface UserSettingsProps {
  email: string;
  onEmailChange: (newEmail: string) => void;
}

export default function UserSettings({ email, onEmailChange }: UserSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  const handleSave = () => {
    onEmailChange(tempEmail);
    setIsEditing(false);
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          User Settings 👤
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs px-3 py-1 rounded-full bg-white/5 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold">Email Account</label>
        {isEditing ? (
          <div className="flex gap-2 mt-1">
            <input
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
              className="flex-1 bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-blue)]"
              placeholder="Enter your email"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="text-lg font-medium text-[var(--text-primary)]">
            {email || <span className="text-[var(--text-secondary)] italic">No email set</span>}
          </div>
        )}
      </div>
    </div>
  );
}
