import WorkoutLibrarySection from "@/components/WorkoutLibrarySection";
import { getMovementLayoutForDisplay } from "@/lib/movement-layout";

export default async function MovementPage() {
  const movementLayout = await getMovementLayoutForDisplay();
  return <WorkoutLibrarySection movementLayout={movementLayout} />;
}
