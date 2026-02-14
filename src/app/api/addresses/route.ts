import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";







function clean(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function norm(v: any) {
  return String(v ?? "").trim().toLowerCase();
}

export async function GET() {
  const addresses = await prisma.address.findMany({
    orderBy: [{ favorite: "desc" }, { label: "asc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const label = String(body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "Label fehlt" }, { status: 400 });

  const incoming = {
    label,
    street: clean(body.street),
    zip: clean(body.zip),
    city: clean(body.city),
    favorite: Boolean(body.favorite),
  };

  const existing = await prisma.address.findFirst({
    where: { label: { equals: label, mode: "insensitive" } },
  });

  if (!existing) {
    const created = await prisma.address.create({
      data: {
        label: incoming.label,
        street: incoming.street,
        zip: incoming.zip,
        city: incoming.city,
        country: "DE",
        favorite: incoming.favorite,
      },
    });
    return NextResponse.json(created, { status: 201 });
  }

  // Konflikt erkennen
  const conflicts: Record<string, { existing: string; incoming: string }> = {};

  const exStreet = norm(existing.street);
  const exZip = norm(existing.zip);
  const exCity = norm(existing.city);

  const inStreet = norm(incoming.street);
  const inZip = norm(incoming.zip);
  const inCity = norm(incoming.city);

  if (incoming.street && exStreet && inStreet && exStreet !== inStreet) {
    conflicts.street = { existing: existing.street ?? "", incoming: incoming.street };
  }
  if (incoming.zip && exZip && inZip && exZip !== inZip) {
    conflicts.zip = { existing: existing.zip ?? "", incoming: incoming.zip };
  }
  if (incoming.city && exCity && inCity && exCity !== inCity) {
    conflicts.city = { existing: existing.city ?? "", incoming: incoming.city };
  }

  if (Object.keys(conflicts).length > 0) {
    return NextResponse.json(
      {
        error: "Konflikt: Adresse unterscheidet sich",
        conflict: true,
        existing,
        incoming,
        fields: conflicts,
      },
      { status: 409 }
    );
  }

  // Merge nur fehlende Felder
  const dataToUpdate: any = {};
  if (!(existing.street ?? "").trim() && incoming.street) dataToUpdate.street = incoming.street;
  if (!(existing.zip ?? "").trim() && incoming.zip) dataToUpdate.zip = incoming.zip;
  if (!(existing.city ?? "").trim() && incoming.city) dataToUpdate.city = incoming.city;
  if (incoming.favorite && !existing.favorite) dataToUpdate.favorite = true;

  if (Object.keys(dataToUpdate).length > 0) {
    const updated = await prisma.address.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });
    return NextResponse.json(updated, { status: 200 });
  }

  return NextResponse.json(existing, { status: 200 });
}
