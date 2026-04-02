-- CreateTable
CREATE TABLE "PrayerRequestInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "presetKey" TEXT,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrayerRequestInteraction_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerRequestInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PraiseReportLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "praiseReportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PraiseReportLike_praiseReportId_fkey" FOREIGN KEY ("praiseReportId") REFERENCES "PraiseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PraiseReportLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PrayerRequestInteraction_prayerRequestId_userId_kind_key" ON "PrayerRequestInteraction"("prayerRequestId", "userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "PraiseReportLike_praiseReportId_userId_key" ON "PraiseReportLike"("praiseReportId", "userId");
