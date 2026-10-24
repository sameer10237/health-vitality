import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/sqlite";

export async function GET() {
  try {
    const logs = getAuditLogs();
    const formatted = logs.map((l) => ({
      id: l.id,
      event: l.event,
      detail: l.detail,
      keyId: l.key_id,
      ipAddress: l.ip_address,
      createdAt: l.created_at,
    }));
    return NextResponse.json({ success: true, logs: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
