import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WorkoutPlayer from "./WorkoutPlayer";
import { getSessionForApp } from "@/lib/auth";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await getSessionForApp();

  const { id } = await params;
  const workout = await prisma.workout.findUnique({ where: { id } });
  if (!workout) notFound();

  const completed = userId
    ? await prisma.userWorkoutCompletion.findUnique({
        where: {
          userId_workoutId: { userId, workoutId: id },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/workouts"
        className="mb-4 inline-flex items-center text-sm text-gray hover:text-foreground"
      >
        ← Back to Workouts
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
          poster={workout.thumbnailUrl ?? "/weekly-workouts.png"}
          title={workout.title}
          isCompleted={!!completed}
        />
      </div>
    </div>
  );
}
