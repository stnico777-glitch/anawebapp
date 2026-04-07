import { prisma } from "@/lib/prisma";
import { publicJson, publicOptions } from "@/lib/public-json";

export async function OPTIONS() {
  return publicOptions();
}

/** List week schedules (newest first) for week pickers on mobile. */
export async function GET() {
  const rows = await prisma.weekSchedule.findMany({
    select: { id: true, weekStart: true },
    orderBy: { weekStart: "desc" },
    take: 52,
  });
  return publicJson({
    schedules: rows.map((r) => ({
      id: r.id,
      weekStart: r.weekStart.toISOString(),
    })),
  });
}
