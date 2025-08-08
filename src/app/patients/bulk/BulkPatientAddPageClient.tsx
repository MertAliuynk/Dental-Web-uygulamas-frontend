// ...existing code...
"use client";
import Topbar from "../../components/Topbar";
import AppLayout from "../../components/AppLayout";
import { useState, useEffect } from "react";

const MAX_ROWS = 25;

export default function BulkPatientAddPageClient() {
  const [rows, setRows] = useState(
    Array.from({ length: MAX_ROWS }, () => ({
      firstName: "",
      lastName: "",
      tc: "",
      phone: "",
      birthDate: "",
      doctor: ""
    }))
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
  fetch("https://dentalapi.karadenizdis.com/api/user/doctors")
      .then(res => res.json())
      .then(data => {
        if (data.success) setDoctors(data.data);
        else setDoctors([]);
      })
      .catch(() => setDoctors([]));
  }, []);

  const handleChange = (idx: number, field: string, value: string) => {
    setRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    // Zorunlu alan kontrolü
    for (let i = 0; i < rows.length; i++) {
      const { firstName, lastName, tc, phone, birthDate, doctor } = rows[i];
      if ((firstName || lastName || tc || phone || birthDate || doctor) && (!firstName || !lastName || !tc || !phone || !birthDate || !doctor)) {
        setMessage(`${i + 1}. satırda eksik bilgi var. Tüm alanlar zorunlu.`);
        setLoading(false);
        return;
      }
    }
    // Sadece dolu satırları gönder
    const validRows = rows.filter(r => r.firstName && r.lastName && r.tc && r.phone && r.birthDate && r.doctor);
    if (validRows.length === 0) {
      setMessage("En az bir hasta bilgisi girilmelidir.");
      setLoading(false);
      return;
    }
    try {
      // Token'ı localStorage'dan al
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

  const res = await fetch("https://dentalapi.karadenizdis.com/api/patient/bulk", {
        method: "POST",
        headers,
        body: JSON.stringify({ patients: validRows })
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Tüm hastalar başarıyla eklendi!");
        setRows(Array.from({ length: MAX_ROWS }, () => ({ firstName: "", lastName: "", tc: "", phone: "", birthDate: "", doctor: "" })));
      } else {
        setMessage(data.message || "Kayıt sırasında hata oluştu.");
      }
    } catch (err) {
      setMessage("Sunucu hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Topbar />
  <main style={{ padding: 16, minHeight: "100vh", background: "#f5f6fa" }}>
          <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24, color: "#0a2972" }}>Toplu Hasta Ekleme</h2>
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", padding: 16, maxWidth: 1000, margin: "0 auto" }}>
            {message && <div style={{ color: message.includes("başarı") ? "green" : "#b91c1c", fontWeight: 700, marginBottom: 16 }}>{message}</div>}
            <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, minWidth: 720 }}>
              <thead>
                <tr style={{ background: "#e3eafc" }}>
                  <th style={thStyle}>Adı</th>
                  <th style={thStyle}>Soyadı</th>
                  <th style={thStyle}>Tc kimlik</th>
                  <th style={thStyle}>Tel no</th>
                  <th style={thStyle}>Doğum tarihi</th>
                  <th style={thStyle}>İlgili Doktor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={rowStyle}>
                    <td><input value={row.firstName} onChange={e => handleChange(i, "firstName", e.target.value)} style={inputStyle} required={false} /></td>
                    <td><input value={row.lastName} onChange={e => handleChange(i, "lastName", e.target.value)} style={inputStyle} required={false} /></td>
                    <td><input value={row.tc} onChange={e => handleChange(i, "tc", e.target.value)} style={inputStyle} required={false} /></td>
                    <td><input value={row.phone} onChange={e => handleChange(i, "phone", e.target.value)} style={inputStyle} required={false} /></td>
                    <td><input type="date" value={row.birthDate} onChange={e => handleChange(i, "birthDate", e.target.value)} style={inputStyle} required={false} /></td>
                    <td>
                      <select value={row.doctor} onChange={e => handleChange(i, "doctor", e.target.value)} style={inputStyle} required={false}>
                        <option value="">Doktor seçiniz</option>
                        {doctors.map((d: any) => (
                          <option key={d.user_id} value={d.user_id}>{d.first_name} {d.last_name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Kaydediliyor..." : "Tüm Hastaları Kaydet"}</button>
          </form>
      </main>
    </AppLayout>
  );
}



const thStyle = {
  fontWeight: 800,
  color: "#111827",
  fontSize: 16,
  padding: "16px 18px",
  borderBottom: "2px solid #b6c2e1",
  textAlign: "left" as const,
  letterSpacing: 0.5,
  background: "#e3eafc"
};


const inputStyle = {
  width: "100%",
  padding: "12px 20px",
  borderRadius: 8,
  border: "1.5px solid #b6c2e1",
  fontSize: 16,
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 6,
  marginRight: 6,
  background: "#f8fafc",
  color: "#22292f",
  fontWeight: 600
};


const rowStyle = {
  height: 56,
  verticalAlign: "middle",
  paddingLeft: 8,
  paddingRight: 8
};


const buttonStyle = {
  background: "#0a2972",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 24px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer"
};
