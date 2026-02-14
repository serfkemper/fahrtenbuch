import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const trips = await prisma.trip.findMany({
    take: 8,
    include: { startAddress: true, destAddress: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(trips);
}
