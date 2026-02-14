import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // ...dein bisheriger Code, nur params.id -> id ersetzen...
}
