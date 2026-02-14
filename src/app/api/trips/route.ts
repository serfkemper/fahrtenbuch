import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";


function toInt(v: any, name: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${name} ist keine Zahl`);
  return Math.trunc(n);
}

export async function GET() {
  const trips = await prisma.trip.findMany({
    include: { startAddress: true, destAddress: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const startAddressId = String(body.startAddressId ?? "");
    const destAddressId = String(body.destAddressId ?? "");
    if (!startAddressId || !destAddressId) {
      return NextResponse.json({ error: "Start/Ziel fehlt" }, { status: 400 });
    }

    const startKm = toInt(body.startKm, "startKm");
    const endKm = toInt(body.endKm, "endKm");
    if (endKm < startKm) {
      return NextResponse.json({ error: "End-km muss >= Start-km sein" }, { status: 400 });
    }

    const purpose = body.purpose === "PRIVATE" ? "PRIVATE" : "BUSINESS";
    const project = body.project ? String(body.project) : null;
    const notes = body.notes ? String(body.notes) : null;

    const date = body.date ? new Date(body.date) : new Date();
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Ungültiges Datum" }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        date,
        purpose,
        project,
        notes,
        startKm,
        endKm,
        distance: endKm - startKm,
        startAddressId,
        destAddressId,
      },
      include: { startAddress: true, destAddress: true },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Fehler" }, { status: 400 });
  }
}
