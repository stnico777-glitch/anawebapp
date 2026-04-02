import { prisma } from "@/lib/prisma";
import WorkoutForm from "./WorkoutForm";

export default async function AdminWorkoutsPage() {
  const workouts = await prisma.workout.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Workouts
        </h1>
        <WorkoutForm />
      </div>
      <div className="mt-6 space-y-3">
        {workouts.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900"
          >
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                {w.title}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {w.instructor} • {w.category} • {w.duration} min
              </p>
            </div>
            <WorkoutForm workout={w} />
          </div>
        ))}
      </div>
    </div>
  );
}
