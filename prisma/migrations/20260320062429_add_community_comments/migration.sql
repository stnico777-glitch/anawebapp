-- CreateTable
CREATE TABLE "PrayerRequestComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerRequestId" TEXT NOT NULL,
    "participantKey" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerRequestComment_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerRequestComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PraiseReportComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "praiseReportId" TEXT NOT NULL,
    "participantKey" TEXT NOT NULL,
    "userId" TEXT,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PraiseReportComment_praiseReportId_fkey" FOREIGN KEY ("praiseReportId") REFERENCES "PraiseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PraiseReportComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PrayerRequestComment_prayerRequestId_createdAt_idx" ON "PrayerRequestComment"("prayerRequestId", "createdAt");

-- CreateIndex
CREATE INDEX "PraiseReportComment_praiseReportId_createdAt_idx" ON "PraiseReportComment"("praiseReportId", "createdAt");
