import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const found = await prisma.address.findUnique({ where: { id } });
  if (!found) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const updated = await prisma.address.update({
    where: { id },
    data: { favorite: !found.favorite },
  });

  return NextResponse.json(updated);
}
