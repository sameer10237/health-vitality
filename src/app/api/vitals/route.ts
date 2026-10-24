import { NextResponse } from "next/server";
import { getOrCreateDefaultUser, getLatestVitals, insertVital, insertAuditLog } from "@/lib/sqlite";

export async function GET() {
  try {
    const user = getOrCreateDefaultUser();
    const vitals = getLatestVitals(user.id);

    const hr = vitals.find((v) => v.metric_type === "HR")?.value ?? 72;
    const sys = vitals.find((v) => v.metric_type === "BP_SYS")?.value ?? 118;
    const dia = vitals.find((v) => v.metric_type === "BP_DIA")?.value ?? 76;
    const glucose = vitals.find((v) => v.metric_type === "GLUCOSE")?.value ?? 94;
    const glucoseContext = vitals.find((v) => v.metric_type === "GLUCOSE")?.context_tag ?? "Fasting";
    const spo2 = vitals.find((v) => v.metric_type === "SPO2")?.value ?? 99;
    const water = vitals.find((v) => v.metric_type === "WATER")?.value ?? 1850;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        sex: user.sex,
      },
      vitals: {
        heartRate: Math.round(hr),
        restingHeartRate: 58,
        hrv: 64,
        systolic: Math.round(sys),
        diastolic: Math.round(dia),
        glucose: Math.round(glucose),
        glucoseContext,
        spo2: Math.round(spo2),
        recoveryScore: 88,
        sleepHours: 7.8,
        sleepQuality: 92,
        waterIntake: Math.round(water),
        waterGoal: 2800,
        activeCalories: 640,
        calorieGoal: 800,
        stepCount: 8420,
        stepGoal: 10000,
        lastUpdated: "Synchronized with dev.db (SQLite)",
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch vitals:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getOrCreateDefaultUser();
    const body = await req.json();

    if (body.heartRate !== undefined) {
      insertVital(user.id, "HR", Number(body.heartRate), "bpm", body.source || "MANUAL");
    }
    if (body.systolic !== undefined && body.diastolic !== undefined) {
      insertVital(user.id, "BP_SYS", Number(body.systolic), "mmHg", body.source || "MANUAL");
      insertVital(user.id, "BP_DIA", Number(body.diastolic), "mmHg", body.source || "MANUAL");
    }
    if (body.glucose !== undefined) {
      insertVital(user.id, "GLUCOSE", Number(body.glucose), "mg/dL", body.source || "MANUAL", body.glucoseContext || "Fasting");
    }
    if (body.waterIntake !== undefined) {
      insertVital(user.id, "WATER", Number(body.waterIntake), "mL", "MANUAL");
    }

    insertAuditLog(
      user.id,
      "PHI_WRITE",
      `Logged biometrics via API: ${Object.keys(body).join(", ")}`,
      "kms-master-01",
      "127.0.0.1"
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save vital:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
