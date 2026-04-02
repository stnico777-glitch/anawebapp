-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JournalEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JournalPrompt";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PrayerJournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "answeredAt" DATETIME,
    "answerNote" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrayerJournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrayerReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prayerJournalEntryId" TEXT,
    "label" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "timeLocal" TEXT NOT NULL,
    "weekDay" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrayerReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerReminder_prayerJournalEntryId_fkey" FOREIGN KEY ("prayerJournalEntryId") REFERENCES "PrayerJournalEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyVerse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "verseDate" DATETIME NOT NULL,
    "reference" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "translation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PrayerJournalEntry_userId_status_createdAt_idx" ON "PrayerJournalEntry"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "PrayerReminder_userId_enabled_idx" ON "PrayerReminder"("userId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVerse_verseDate_key" ON "DailyVerse"("verseDate");
