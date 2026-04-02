import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/auth";

const createSchema = z.object({
  content: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(100).trim(),
});

export async function GET() {
  const reports = await prisma.praiseReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const praiseReport = await prisma.praiseReport.create({
    data: {
      content: parsed.data.content,
      authorName: parsed.data.authorName,
      userId,
    },
  });

  return NextResponse.json(praiseReport);
}
