import { NextResponse } from "next/server";
src/app/api/templates/[id]/favorite/route.ts

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const found = await prisma.template.findUnique({ where: { id: params.id } });
  if (!found) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const updated = await prisma.template.update({
    where: { id: params.id },
    data: { favorite: !found.favorite },
    include: { startAddress: true, destAddress: true },
  });

  return NextResponse.json(updated);
}
