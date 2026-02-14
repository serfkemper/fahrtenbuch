import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const templates = await prisma.template.findMany({
    include: { startAddress: true, destAddress: true },
    orderBy: [{ favorite: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });

  const startAddressId = String(body.startAddressId ?? "");
  const destAddressId = String(body.destAddressId ?? "");
  if (!startAddressId || !destAddressId) {
    return NextResponse.json({ error: "Start/Ziel fehlt" }, { status: 400 });
  }

  const tpl = await prisma.template.create({
    data: {
      name,
      purpose: body.purpose === "PRIVATE" ? "PRIVATE" : "BUSINESS",
      project: body.project ? String(body.project) : null,
      notesHint: body.notesHint ? String(body.notesHint) : null,
      startAddressId,
      destAddressId,
      favorite: Boolean(body.favorite),
    },
    include: { startAddress: true, destAddress: true },
  });

  return NextResponse.json(tpl, { status: 201 });
}
