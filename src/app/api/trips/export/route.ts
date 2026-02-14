import { prisma } from "@/app/lib/prisma";


function csvEscape(v: any) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const trips = await prisma.trip.findMany({
    include: { startAddress: true, destAddress: true },
    orderBy: { date: "desc" },
  });

  const header = [
    "date",
    "purpose",
    "project",
    "startKm",
    "endKm",
    "distance",
    "startLabel",
    "startStreet",
    "startZip",
    "startCity",
    "destLabel",
    "destStreet",
    "destZip",
    "destCity",
    "notes",
  ];

  const lines = [header.join(",")];

  for (const t of trips) {
    lines.push(
      [
        t.date.toISOString().slice(0, 10),
        t.purpose,
        t.project ?? "",
        t.startKm,
        t.endKm,
        t.distance,
        t.startAddress.label,
        t.startAddress.street ?? "",
        t.startAddress.zip ?? "",
        t.startAddress.city ?? "",
        t.destAddress.label,
        t.destAddress.street ?? "",
        t.destAddress.zip ?? "",
        t.destAddress.city ?? "",
        t.notes ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fahrtenbuch.csv"`,
    },
  });
}
