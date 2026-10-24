import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import crypto from "node:crypto";

const dbPath = path.resolve(process.cwd(), "dev.db");
const db = new DatabaseSync(dbPath);

// Initialize tables if not existing
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    sex TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS biometric_vitals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    context_tag TEXT,
    source TEXT NOT NULL,
    recorded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event TEXT NOT NULL,
    detail TEXT NOT NULL,
    key_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export function getOrCreateDefaultUser() {
  const selectStmt = db.prepare("SELECT * FROM users LIMIT 1");
  let user = selectStmt.get() as any;

  if (!user) {
    const userId = crypto.randomUUID();
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, name, dob, sex, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      userId,
      "alex.vance@vitalis.health",
      "Alex Vance",
      "1994-08-14",
      "Male",
      new Date().toISOString()
    );

    // Initial audit log
    const auditStmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, event, detail, key_id, ip_address, hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    auditStmt.run(
      crypto.randomUUID(),
      userId,
      "CONSENT_RECORDED",
      "Patient initialized with HIPAA § 164.312 and GDPR Art. 9 consent.",
      "kms-master-01",
      "127.0.0.1",
      crypto.createHash("sha256").update("init-consent").digest("hex"),
      new Date().toISOString()
    );

    user = {
      id: userId,
      email: "alex.vance@vitalis.health",
      name: "Alex Vance",
      dob: "1994-08-14",
      sex: "Male",
    };
  }

  return user;
}

export function getLatestVitals(userId: string) {
  const stmt = db.prepare(`
    SELECT * FROM biometric_vitals 
    WHERE user_id = ? 
    ORDER BY recorded_at DESC 
    LIMIT 50
  `);
  return stmt.all(userId) as any[];
}

export function insertVital(userId: string, metricType: string, value: number, unit: string, source = "MANUAL", contextTag?: string) {
  const stmt = db.prepare(`
    INSERT INTO biometric_vitals (id, user_id, metric_type, value, unit, context_tag, source, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const id = crypto.randomUUID();
  const recordedAt = new Date().toISOString();
  stmt.run(id, userId, metricType, value, unit, contextTag || null, source, recordedAt);
  return { id, userId, metricType, value, unit, contextTag, source, recordedAt };
}

export function insertAuditLog(userId: string, event: string, detail: string, keyId = "kms-master-01", ipAddress = "127.0.0.1") {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, user_id, event, detail, key_id, ip_address, hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const hash = crypto.createHash("sha256").update(`${id}-${event}-${createdAt}`).digest("hex");
  stmt.run(id, userId, event, detail, keyId, ipAddress, hash, createdAt);
  return { id, userId, event, detail, keyId, ipAddress, hash, createdAt };
}

export function getAuditLogs() {
  const stmt = db.prepare(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 25
  `);
  return stmt.all() as any[];
}
