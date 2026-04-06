import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WorkoutPlayer from "./WorkoutPlayer";
import { getSessionForApp } from "@/lib/auth";
import { DEMO_WORKOUT_ROWS } from "@/lib/demo-preview-data";
import { WEEKLY_DAY_CARD_IMAGES } from "@/constants/schedule";

const DEMO_WORKOUT_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await getSessionForApp();

  const { id } = await params;
  let workout = null as Awaited<ReturnType<typeof prisma.workout.findUnique>>;
  try {
    workout = await prisma.workout.findUnique({ where: { id } });
  } catch {
    workout = null;
  }
  if (!workout) {
    const row = DEMO_WORKOUT_ROWS.find((w) => w.id === id);
    if (row) {
      workout = {
        id: row.id,
        title: row.title,
        instructor: row.instructor,
        duration: row.duration,
        category: row.category,
        scripture: row.scripture,
        thumbnailUrl: row.thumbnailUrl,
        videoUrl: DEMO_WORKOUT_VIDEO,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      };
    }
  }
  if (!workout) notFound();

  let completed = null as Awaited<
    ReturnType<typeof prisma.userWorkoutCompletion.findUnique>
  >;
  if (userId && !id.startsWith("demo-workout-")) {
    try {
      completed = await prisma.userWorkoutCompletion.findUnique({
        where: {
          userId_workoutId: { userId, workoutId: id },
        },
      });
    } catch {
      completed = null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/movement"
        className="mb-4 inline-flex items-center text-sm text-gray hover:text-foreground"
      >
        ← Back to Movement
      </Link>
      <h1 className="text-2xl font-medium text-foreground [font-family:var(--font-headline),sans-serif]">
        {workout.title}
      </h1>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray">
        {workout.instructor && <span>{workout.instructor}</span>}
        {workout.category && (
          <span className="rounded-sm bg-sand px-1.5 py-0.5">
            {workout.category}
          </span>
        )}
        <span>{workout.duration} min</span>
        {completed && (
          <span className="text-sky-blue">✓ Completed</span>
        )}
      </div>
      {workout.scripture && (
        <p className="mt-2 text-sm italic text-gray">
          {workout.scripture}
        </p>
      )}
      <div className="mt-6">
        <WorkoutPlayer
          workoutId={workout.id}
          src={workout.videoUrl}
          poster={workout.thumbnailUrl ?? WEEKLY_DAY_CARD_IMAGES[0]}
          title={workout.title}
          isCompleted={!!completed}
        />
      </div>
    </div>
  );
}
