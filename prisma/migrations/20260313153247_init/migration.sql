-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weightKg" REAL NOT NULL,
    "restingHeartRate" INTEGER,
    "homeTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DailyActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "activityType" TEXT NOT NULL,
    "distanceMiles" REAL NOT NULL,
    "averageSpeedMph" REAL NOT NULL,
    "elevationGainFt" REAL,
    "caloriesBurned" REAL NOT NULL,
    "avgHeartRate" INTEGER,
    "isSynced" BOOLEAN NOT NULL DEFAULT true,
    "rawGpsBuffer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicationSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledTime" TEXT NOT NULL,
    "timezoneRule" TEXT NOT NULL DEFAULT 'CIRCADIAN',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastTakenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicationSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
