"use client";

import { useEffect, useMemo, useState } from "react";

type Address = {
  id: string;
  label: string;
  street?: string | null;
  zip?: string | null;
  city?: string | null;
  country: string;
  favorite: boolean;
};

type Trip = {
  id: string;
  date: string;
  purpose: "BUSINESS" | "PRIVATE";
  project?: string | null;
  notes?: string | null;
  startKm: number;
  endKm: number;
  distance: number;
  startAddress: Address;
  destAddress: Address;
  startAddressId: string;
  destAddressId: string;
};

type Template = {
  id: string;
  name: string;
  purpose: "BUSINESS" | "PRIVATE";
  project?: string | null;
  notesHint?: string | null;
  favorite: boolean;
  startAddress: Address;
  destAddress: Address;
  startAddressId: string;
  destAddressId: string;
};

function formatAddress(a: Address) {
  const parts = [a.street, [a.zip, a.city].filter(Boolean).join(" ")].filter(Boolean);
  return parts.length ? parts.join(", ") : "";
}

export default function Page() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [purpose, setPurpose] = useState<"BUSINESS" | "PRIVATE">("BUSINESS");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");

  const [startAddressId, setStartAddressId] = useState("");
  const [destAddressId, setDestAddressId] = useState("");

  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newCity, setNewCity] = useState("");

  const [templateName, setTemplateName] = useState("");

  async function loadAll() {
    setLoading(true);

    const [a, t, tr] = await Promise.all([
      fetch("/api/addresses").then((r) => r.json()),
      fetch("/api/templates").then((r) => r.json()),
      fetch("/api/trips").then((r) => r.json()),
    ]);

    setAddresses(a);
    setTemplates(t);
    setTrips(tr);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredAddresses = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return addresses;

    return addresses.filter((a) => {
      return (
        a.label.toLowerCase().includes(s) ||
        (a.street ?? "").toLowerCase().includes(s) ||
        (a.zip ?? "").toLowerCase().includes(s) ||
        (a.city ?? "").toLowerCase().includes(s)
      );
    });
  }, [addresses, search]);

  async function addAddress() {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newLabel,
        street: newStreet,
        zip: newZip,
        city: newCity,
      }),
    });

    if (res.status === 409) {
      alert("Adresse existiert schon, aber mit anderen Daten. Bitte Label ändern.");
      return;
    }

    if (!res.ok) {
      alert("Fehler beim Speichern der Adresse");
      return;
    }

    const created = await res.json();
    setAddresses((prev) => [created, ...prev]);
    setNewLabel("");
    setNewStreet("");
    setNewZip("");
    setNewCity("");
    setNewAddressOpen(false);
  }

  async function addTrip() {
    if (!startAddressId || !destAddressId) {
      alert("Start und Ziel auswählen");
      return;
    }

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAddressId,
        destAddressId,
        startKm: Number(startKm),
        endKm: Number(endKm),
        purpose,
        project,
        notes,
        date: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.error ?? "Fehler beim Speichern der Fahrt");
      return;
    }

    const created = await res.json();
    setTrips((prev) => [created, ...prev]);

    setStartKm(endKm);
    setEndKm("");
    setNotes("");
  }

  async function addTemplateFromSelection() {
    if (!templateName.trim()) {
      alert("Vorlagenname fehlt");
      return;
    }

    if (!startAddressId || !destAddressId) {
      alert("Start und Ziel auswählen");
      return;
    }

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: templateName,
        purpose,
        project,
        startAddressId,
        destAddressId,
        notesHint: notes,
        favorite: false,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Speichern der Vorlage");
      return;
    }

    const tpl = await res.json();
    setTemplates((prev) => [tpl, ...prev]);
    setTemplateName("");
  }

  async function toggleTemplateFav(id: string) {
    const res = await fetch(`/api/templates/${id}/favorite`, { method: "POST" });
    if (!res.ok) return;
    const updated = await res.json();
    setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function toggleAddressFav(id: string) {
    const res = await fetch(`/api/addresses/${id}/favorite`, { method: "POST" });
    if (!res.ok) return;
    const updated = await res.json();
    setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  function applyTemplate(t: Template) {
    setStartAddressId(t.startAddressId);
    setDestAddressId(t.destAddressId);
    setPurpose(t.purpose);
    setProject(t.project ?? "");
    setNotes(t.notesHint ?? "");
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>🚗 Fahrtenbuch</h1>

      {loading ? (
        <p>Lädt...</p>
      ) : (
        <>
          <div style={{ marginTop: 20, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Quick Add</h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <input
                placeholder="Start-km"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 120 }}
              />
              <input
                placeholder="End-km"
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 120 }}
              />

              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              >
                <option value="BUSINESS">Dienstlich</option>
                <option value="PRIVATE">Privat</option>
              </select>

              <input
                placeholder="Projekt / Kunde (optional)"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1, minWidth: 200 }}
              />

              <input
                placeholder="Notizen (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1, minWidth: 200 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <select
                value={startAddressId}
                onChange={(e) => setStartAddressId(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1, minWidth: 250 }}
              >
                <option value="">Start auswählen…</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.favorite ? "⭐ " : ""}
                    {a.label} {formatAddress(a) ? `(${formatAddress(a)})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={destAddressId}
                onChange={(e) => setDestAddressId(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1, minWidth: 250 }}
              >
                <option value="">Ziel auswählen…</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.favorite ? "⭐ " : ""}
                    {a.label} {formatAddress(a) ? `(${formatAddress(a)})` : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={addTrip}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "black",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Fahrt speichern
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setNewAddressOpen(true)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                + Neue Adresse
              </button>
            </div>
          </div>

          {newAddressOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <div style={{ background: "white", padding: 18, borderRadius: 14, width: 420 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Neue Adresse</h3>

                <input
                  placeholder="Label (z.B. Praxis, Zuhause)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 8, border: "1px solid #ccc" }}
                />

                <input
                  placeholder="Straße"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  style={{ width: "100%", padding: 10, marginTop: 10, borderRadius: 8, border: "1px solid #ccc" }}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input
                    placeholder="PLZ"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                  <input
                    placeholder="Ort"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    style={{ flex: 2, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    onClick={() => setNewAddressOpen(false)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc", background: "white" }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={addAddress}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: "none",
                      background: "black",
                      color: "white",
                      fontWeight: 700,
                      flex: 1,
                    }}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Adressen</h2>

            <input
              placeholder="Adressuche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", marginTop: 10 }}
            />

            <div style={{ marginTop: 10 }}>
              {filteredAddresses.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {a.favorite ? "⭐ " : ""}
                      {a.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#555" }}>{formatAddress(a)}</div>
                  </div>

                  <button
                    onClick={() => toggleAddressFav(a.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Vorlagen</h2>

            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Vorlagenname"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ flex: 1, minWidth: 200, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />

              <button
                onClick={addTemplateFromSelection}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "black",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                Vorlage speichern
              </button>
            </div>

            <div style={{ marginTop: 10 }}>
              {templates.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {t.favorite ? "⭐ " : ""}
                      {t.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#555" }}>
                      {t.startAddress.label} → {t.destAddress.label}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => applyTemplate(t)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: "1px solid #ccc",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      Nutzen
                    </button>

                    <button
                      onClick={() => toggleTemplateFav(t.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 10,
                        border: "1px solid #ccc",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      ⭐
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 14, border: "1px solid #ddd", borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Letzte Fahrten</h2>

            <div style={{ marginTop: 10 }}>
              {trips.slice(0, 10).map((t) => (
                <div key={t.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                  <div style={{ fontWeight: 700 }}>
                    {new Date(t.date).toLocaleDateString("de-DE")} — {t.startAddress.label} → {t.destAddress.label}
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>
                    {t.startKm} → {t.endKm} km ({t.distance} km) |{" "}
                    {t.purpose === "BUSINESS" ? "Dienstlich" : "Privat"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <a href="/api/trips/export" style={{ color: "black", fontWeight: 700 }}>
                CSV Export herunterladen
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
