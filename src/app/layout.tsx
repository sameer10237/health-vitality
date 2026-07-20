import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health & Vitality — Smart Activity & Medication Tracker",
  description:
    "A 2026 health platform tracking activity burn (Walking/Jogging/Running) with MET-based calorie math, smart medication reminders with timezone intelligence, and an AI Health Concierge that connects your workout to your pill schedule.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
