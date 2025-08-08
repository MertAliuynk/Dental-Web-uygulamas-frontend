"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function PatientSearchCard() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
  fetch("https://dentalapi.karadenizdis.com/api/patient")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPatients(data.data);
        else setPatients([]);
        setLoading(false);
      })
      .catch(() => {
        setError("Hasta verileri alınamadı");
        setLoading(false);
      });
  }, []);

  const filtered = patients.filter((p) =>
    ((p.first_name && p.last_name ? (p.first_name + " " + p.last_name) : "")
      .toLowerCase()
      .includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px #0001", minWidth: 280, maxWidth: 320, minHeight: 420, height: 420, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Hasta ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #dbeafe", fontWeight: 500, color: "#222" }}
        />
        <span style={{ marginLeft: 8, color: "#444" }}>🔍</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && <div style={{ color: "#888", textAlign: "center", fontWeight: 500 }}>Yükleniyor...</div>}
        {error && <div style={{ color: "#e53935", textAlign: "center", fontWeight: 500 }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && <div style={{ color: "#888", textAlign: "center", fontWeight: 500 }}>Hasta bulunamadı</div>}
        {!loading && !error && filtered.map((p) => (
          <div
            key={p.patient_id}
            style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 16, color: "#1a237e", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            onClick={() => router.push(`/patients/card/?id=${p.patient_id}`)}
            onMouseOver={e => (e.currentTarget.style.background = "#e3eafc")}
            onMouseOut={e => (e.currentTarget.style.background = "")}
          >
            {p.first_name} {p.last_name}
          </div>
        ))}
      </div>
    </div>
  );
}
