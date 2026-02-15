import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
function clean(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const body = await req.json();

  const updated = await prisma.address.update({
    where: { id },
    data: {
      street: body.street !== undefined ? clean(body.street) : undefined,
      zip: body.zip !== undefined ? clean(body.zip) : undefined,
      city: body.city !== undefined ? clean(body.city) : undefined,
      favorite: body.favorite !== undefined ? Boolean(body.favorite) : undefined,
    },
  });

  return NextResponse.json(updated);
}
