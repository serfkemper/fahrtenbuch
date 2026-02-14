import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


export async function POST(_: Request, { params }: { params: { id: string } }) {
  const found = await prisma.address.findUnique({ where: { id: params.id } });
  if (!found) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: { favorite: !found.favorite },
  });

  return NextResponse.json(updated);
}
