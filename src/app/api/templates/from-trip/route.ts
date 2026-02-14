import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const tripId = String(body.tripId ?? "");
  if (!tripId) return NextResponse.json({ error: "tripId fehlt" }, { status: 400 });

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { startAddress: true, destAddress: true },
  });
  if (!trip) return NextResponse.json({ error: "Fahrt nicht gefunden" }, { status: 404 });

  const nameRaw = body.name ? String(body.name) : "";
  const name = nameRaw.trim() || `${trip.startAddress.label} → ${trip.destAddress.label}`;

  const tpl = await prisma.template.create({
    data: {
      name,
      purpose: trip.purpose,
      project: trip.project,
      notesHint: body.notesHint ? String(body.notesHint) : null,
      startAddressId: trip.startAddressId,
      destAddressId: trip.destAddressId,
      favorite: Boolean(body.favorite),
    },
    include: { startAddress: true, destAddress: true },
  });

  return NextResponse.json(tpl, { status: 201 });
}
