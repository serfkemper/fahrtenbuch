import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const found = await prisma.address.findUnique({ where: { id } });
  if (!found) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: { favorite: !found.favorite },
  });

  return NextResponse.json(updated);
}
