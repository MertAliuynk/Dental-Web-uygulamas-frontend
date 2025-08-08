"use client";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../components/AppLayout";

export default function PatientsListPageClient() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  // Modal yerine edit sayfasına yönlendirme kullanılacak
  const [sortOption, setSortOption] = useState<string>("name-asc");
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  const fetchPatients = () => {
  fetch("https://dentalapi.karadenizdis.com/api/patient")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPatients(data.data);
        else setPatients([]);
      })
      .catch(() => setPatients([]));
  };

  useEffect(() => {
    fetchPatients();
    try { setRole(localStorage.getItem("role") || ""); } catch {}
  }, []);

  const handleEditClick = (e: React.MouseEvent, patient: any) => {
    e.stopPropagation();
    router.push(`/patients/new?id=${patient.patient_id}`);
  };

  // Düzenleme sonrası geri dönüldüğünde sayfa yenileneceği için ek işleme gerek yok

  // Sıralama fonksiyonu
  const getSortedPatients = () => {
    const sortedPatients = [...patients];
    
    switch (sortOption) {
      case "name-asc":
        return sortedPatients.sort((a, b) => {
          const nameA = (a.first_name + " " + a.last_name).toLowerCase();
          const nameB = (b.first_name + " " + b.last_name).toLowerCase();
          return nameA.localeCompare(nameB, "tr");
        });
      
      case "name-desc":
        return sortedPatients.sort((a, b) => {
          const nameA = (a.first_name + " " + a.last_name).toLowerCase();
          const nameB = (b.first_name + " " + b.last_name).toLowerCase();
          return nameB.localeCompare(nameA, "tr");
        });
      
      case "surname-asc":
        return sortedPatients.sort((a, b) => {
          const surnameA = a.last_name?.toLowerCase() || "";
          const surnameB = b.last_name?.toLowerCase() || "";
          return surnameA.localeCompare(surnameB, "tr");
        });
      
      case "surname-desc":
        return sortedPatients.sort((a, b) => {
          const surnameA = a.last_name?.toLowerCase() || "";
          const surnameB = b.last_name?.toLowerCase() || "";
          return surnameB.localeCompare(surnameA, "tr");
        });
      
      default:
        return sortedPatients;
    }
  };

  const sorted = getSortedPatients();
  const filtered = sorted.filter(p =>
    (p.first_name + " " + p.last_name).toLowerCase().includes(search.toLowerCase())
  );

  // Sıralama okları için yardımcı fonksiyon
  const getSortIcon = (column: string) => {
    if (sortOption.startsWith(column)) {
      return sortOption.endsWith("-asc") ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <AppLayout>
      <Topbar />
      <main style={{ padding: 24, minHeight: "100vh" }}>
          <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24, color: "#0a2972" }}>
            Hasta Listesi ({filtered.length} hasta)
          </h2>
          
          {/* Arama ve Sıralama Kontrolleri */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="İsme göre hasta ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 320,
                padding: "8px 12px",
                borderRadius: 6,
                border: "2px solid #0a2972",
                fontSize: 16,
                background: "#e3eafc",
                color: "#1a237e",
                fontWeight: 600
              }}
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#0a2972",
                minWidth: "fit-content"
              }}>
                Sırala:
              </span>
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "2px solid #0a2972",
                  fontSize: 16,
                  background: "#e3eafc",
                  color: "#1a237e",
                  fontWeight: 600,
                  minWidth: 200,
                  cursor: "pointer"
                }}
              >
                <option value="name-asc">Ad-Soyad (A-Z)</option>
                <option value="name-desc">Ad-Soyad (Z-A)</option>
                <option value="surname-asc">Soyad (A-Z)</option>
                <option value="surname-desc">Soyad (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", overflow: "hidden" }}>
            <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "#e3eafc" }}>
                  <th style={thStyle}>
                    Ad-Soyad{getSortIcon("name")}
                  </th>
                  <th style={thStyle}>
                    Soyad{getSortIcon("surname")}
                  </th>
                  <th style={thStyle}>
                    Telefon
                  </th>
                  <th style={thStyle}>
                    TC Kimlik No
                  </th>
                  <th style={thStyle}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "#888", padding: 32 }}>Kayıtlı hasta bulunamadı.</td></tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr
                      key={p.patient_id || i}
                      style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer", transition: "background 0.2s" }}
                      onClick={() => router.push(`/patients/card/?id=${p.patient_id}`)}
                      onMouseOver={e => (e.currentTarget.style.background = "#e3eafc")}
                      onMouseOut={e => (e.currentTarget.style.background = "")}
                    >
                      <td style={tdStyle}>{p.first_name}</td>
                      <td style={tdStyle}>{p.last_name}</td>
                      <td style={tdStyle}>{role === 'doctor' ? '•••' : (p.phone || '-')}</td>
                      <td style={tdStyle}>{role === 'doctor' ? '•••' : (p.tc_number || '-')}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={(e) => handleEditClick(e, p)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#0a2972",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                            transition: "background 0.2s"
                          }}
                          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#1a237e")}
                          onMouseOut={e => (e.currentTarget.style.backgroundColor = "#0a2972")}
                        >
                          Düzenle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
          
          {/* Edit modal kaldırıldı; düzenleme artık /patients/new?id=... sayfasında yapılır */}
      </main>
    </AppLayout>
  );
}

const thStyle = {
  fontWeight: 700,
  color: "#1a237e",
  fontSize: 15,
  padding: "12px 8px",
  borderBottom: "2px solid #dbeafe",
  textAlign: "left" as const
};

const tdStyle = {
  fontWeight: 500,
  color: "#2d3a4a",
  fontSize: 15,
  padding: "10px 8px"
};
