import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitalis | HIPAA & GDPR Compliant Health Telemetry",
  description: "Enterprise-grade digital health cockpit uniting continuous biometric telemetry, clinical vitals, and physician-ready analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
