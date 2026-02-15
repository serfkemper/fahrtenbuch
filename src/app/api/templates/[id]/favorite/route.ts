import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const found = await prisma.template.findUnique({ where: { id } });
  if (!found) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const updated = await prisma.template.update({
    where: { id },
    data: { favorite: !found.favorite },
  });

  return NextResponse.json(updated);
}
