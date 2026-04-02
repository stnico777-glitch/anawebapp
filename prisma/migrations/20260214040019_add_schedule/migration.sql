-- CreateTable
CREATE TABLE "WeekSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScheduleDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekScheduleId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "prayerTitle" TEXT,
    "prayerId" TEXT,
    "workoutTitle" TEXT,
    "workoutId" TEXT,
    "affirmationText" TEXT,
    CONSTRAINT "ScheduleDay_weekScheduleId_fkey" FOREIGN KEY ("weekScheduleId") REFERENCES "WeekSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserDayCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "scheduleDayId" TEXT NOT NULL,
    "prayerDone" BOOLEAN NOT NULL DEFAULT false,
    "workoutDone" BOOLEAN NOT NULL DEFAULT false,
    "affirmationDone" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    CONSTRAINT "UserDayCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserDayCompletion_scheduleDayId_fkey" FOREIGN KEY ("scheduleDayId") REFERENCES "ScheduleDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleDay_weekScheduleId_dayIndex_key" ON "ScheduleDay"("weekScheduleId", "dayIndex");

-- CreateIndex
CREATE UNIQUE INDEX "UserDayCompletion_userId_scheduleDayId_key" ON "UserDayCompletion"("userId", "scheduleDayId");
