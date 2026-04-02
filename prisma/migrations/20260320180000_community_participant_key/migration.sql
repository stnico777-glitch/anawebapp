-- PrayerRequestInteraction: anonymous guests via participantKey (user:{id} | v:{uuid})

CREATE TABLE "PrayerRequestInteraction_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prayerRequestId" TEXT NOT NULL,
    "userId" TEXT,
    "participantKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "presetKey" TEXT,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PrayerRequestInteraction_prayerRequestId_fkey" FOREIGN KEY ("prayerRequestId") REFERENCES "PrayerRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrayerRequestInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PrayerRequestInteraction_prayerRequestId_participantKey_kind_key" ON "PrayerRequestInteraction_new"("prayerRequestId", "participantKey", "kind");

INSERT INTO "PrayerRequestInteraction_new" ("id", "prayerRequestId", "userId", "participantKey", "kind", "presetKey", "message", "createdAt", "updatedAt")
SELECT "id", "prayerRequestId", "userId", ('user:' || "userId"), "kind", "presetKey", "message", "createdAt", "updatedAt" FROM "PrayerRequestInteraction";

DROP TABLE "PrayerRequestInteraction";
ALTER TABLE "PrayerRequestInteraction_new" RENAME TO "PrayerRequestInteraction";

-- PraiseReportLike: same pattern

CREATE TABLE "PraiseReportLike_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "praiseReportId" TEXT NOT NULL,
    "userId" TEXT,
    "participantKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PraiseReportLike_praiseReportId_fkey" FOREIGN KEY ("praiseReportId") REFERENCES "PraiseReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PraiseReportLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PraiseReportLike_praiseReportId_participantKey_key" ON "PraiseReportLike_new"("praiseReportId", "participantKey");

INSERT INTO "PraiseReportLike_new" ("id", "praiseReportId", "userId", "participantKey", "createdAt")
SELECT "id", "praiseReportId", "userId", ('user:' || "userId"), "createdAt" FROM "PraiseReportLike";

DROP TABLE "PraiseReportLike";
ALTER TABLE "PraiseReportLike_new" RENAME TO "PraiseReportLike";
