"use client";
import Topbar from "../../components/Topbar";
import AppLayout from "../../components/AppLayout";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function NewPatientPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editingPatientId = searchParams.get('id');
  // Hasta Bilgileri state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    tc: "",
    doctor: "",
    birthDate: "",
    anamnez: {
      tedavi: "",
      hastalik: "",
      hastalikList: false,
      radyoterapi: "",
      kanama: "",
      ilacAlerji: "",
      digerSorun: "",
      kadinBilgi: "",
      kotuAliskanlik: "",
      disMuayene: ""
    }
  });

  // Doktorlar state
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

  // Edit modunda hasta bilgisini çek ve formu doldur
  useEffect(() => {
    const loadPatientForEdit = async () => {
      if (!editingPatientId) return;
      try {
  const res = await fetch(`https://dentalapi.karadenizdis.com/api/patient/${editingPatientId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          setForm(f => ({
            ...f,
            firstName: p.first_name || "",
            lastName: p.last_name || "",
            phone: p.phone || "",
            tc: p.tc_number || "",
            doctor: p.doctor_id ? String(p.doctor_id) : "",
            birthDate: p.birth_date ? p.birth_date.split('T')[0] : "",
            // Not: anamnez ayrı tabloda; basitçe boş bırakıyoruz veya ileride doldurulabilir
          }));
        }
      } catch {}
    };
    loadPatientForEdit();
  }, [editingPatientId]);

  // Form input değişimi
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("anamnez.")) {
      const key = name.replace("anamnez.", "");
      setForm(f => ({ ...f, anamnez: { ...f.anamnez, [key]: type === "checkbox" ? checked : value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Form gönderme (gerçek API)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    // Zorunlu alan kontrolü (frontend)
    if (!form.firstName || !form.lastName || !form.phone || !form.tc || !form.doctor || !form.birthDate) {
      setMessage("Lütfen tüm hasta bilgilerini doldurun.");
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

      const isEdit = Boolean(editingPatientId);
  const url = isEdit ? `https://dentalapi.karadenizdis.com/api/patient/${editingPatientId}` : "https://dentalapi.karadenizdis.com/api/patient";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          tc: form.tc,
          doctor: form.doctor,
          birthDate: form.birthDate,
          anamnez: form.anamnez
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(isEdit ? "Hasta başarıyla güncellendi!" : "Hasta başarıyla kaydedildi!");
        if (isEdit) {
          // Düzenleme sonrası hasta kartına dön
          router.push(`/patients/card/?id=${editingPatientId}`);
          return;
        }
        setForm({
          firstName: "",
          lastName: "",
          phone: "",
          tc: "",
          doctor: "",
          birthDate: "",
          anamnez: {
            tedavi: "",
            hastalik: "",
            hastalikList: false,
            radyoterapi: "",
            kanama: "",
            ilacAlerji: "",
            digerSorun: "",
            kadinBilgi: "",
            kotuAliskanlik: "",
            disMuayene: ""
          }
        });
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
      <main style={{ padding: 32, minHeight: "100vh", background: "#f5f6fa" }}>
          <h2 style={{ fontWeight: 800, fontSize: 26, marginBottom: 24, color: "#0a2972" }}>{editingPatientId ? 'Hasta Bilgilerini Düzenle' : 'Hasta Bilgilerini Tanımla'}</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {message && (
              <div style={{ color: message.includes("başarı") ? "green" : "#b91c1c", fontWeight: 700, marginBottom: 8 }}>{message}</div>
            )}
            {/* Hasta Bilgileri */}
            <section className="two-col" style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 8, boxShadow: "0 2px 8px #0001" }}>
              <div className="col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <label style={labelStyle}>Adı:*
                  <input name="firstName" value={form.firstName} onChange={handleChange} required style={inputStyle} />
                </label>
                <label style={labelStyle}>Soyadı:*
                  <input name="lastName" value={form.lastName} onChange={handleChange} required style={inputStyle} />
                </label>
                <label style={labelStyle}>Telefon numarası:*
                  <input name="phone" value={form.phone} onChange={handleChange} required style={inputStyle} />
                </label>
                <label style={labelStyle}>Tc kimlik no:*
                  <input name="tc" value={form.tc} onChange={handleChange} required style={inputStyle} />
                </label>
              </div>
              <div className="col" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <label style={labelStyle}>İlgili Doktor Seç:*
                  <select
                    name="doctor"
                    value={form.doctor}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, padding: "8px 12px" }}
                  >
                    <option value="">Doktor seçiniz</option>
                    {doctors.map((d: any) => (
                      <option key={d.user_id} value={d.user_id}>
                        {d.first_name} {d.last_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>Doğum Tarihi:*
                  <input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required style={inputStyle} />
                </label>
              </div>
              {/* Üste bulunan buton KALDIRILDI */}
            </section>

            {/* Anamnez Bilgileri */}
            <section style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px #0001" }}>
              <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 16, color: "#0a2972" }}>Anamnez Bilgileri</h3>
              <div style={{ display: "flex", gap: 32 }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <label style={labelStyle}>Şu anda herhangi bir tedavi görüyor musunuz? İlaç kullanıyor musunuz?
                    <textarea name="anamnez.tedavi" value={form.anamnez.tedavi} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>Herhangi bir hastalığınız var mı? Geçirdiniz mi?
                    <textarea name="anamnez.hastalik" value={form.anamnez.hastalik} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" name="anamnez.hastalikList" checked={form.anamnez.hastalikList} onChange={handleChange} />
                    Hastalık Listesini Göster
                  </label>
                  <label style={labelStyle}>Baş ve boyun bölgesinde radyoterapi gördünüz mü?<br />
                    <input type="radio" name="anamnez.radyoterapi" value="evet" checked={form.anamnez.radyoterapi === "evet"} onChange={handleChange} /> Evet
                    <input type="radio" name="anamnez.radyoterapi" value="hayir" checked={form.anamnez.radyoterapi === "hayir"} onChange={handleChange} style={{ marginLeft: 12 }} /> Hayır
                  </label>
                  <label style={labelStyle}>Cerrahi müdahale veya yaralanma sonrası kanama uzun sürer mi?<br />
                    <input type="radio" name="anamnez.kanama" value="evet" checked={form.anamnez.kanama === "evet"} onChange={handleChange} /> Evet
                    <input type="radio" name="anamnez.kanama" value="hayir" checked={form.anamnez.kanama === "hayir"} onChange={handleChange} style={{ marginLeft: 12 }} /> Hayır
                  </label>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <label style={labelStyle}>İlaç alerjiniz var mı?
                    <textarea name="anamnez.ilacAlerji" value={form.anamnez.ilacAlerji} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>Bunların dışında herhangi bir tıbbi sorununuz var mı?
                    <textarea name="anamnez.digerSorun" value={form.anamnez.digerSorun} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>Kadınlarda hamilelik, düşük, adet ve menapoz bilgileri
                    <textarea name="anamnez.kadinBilgi" value={form.anamnez.kadinBilgi} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>Kötü alışkanlıklarınız var mı?
                    <textarea name="anamnez.kotuAliskanlik" value={form.anamnez.kotuAliskanlik} onChange={handleChange} style={inputStyle} />
                  </label>
                  <label style={labelStyle}>En son dişhekimi muayenesi, tedavisi?
                    <textarea name="anamnez.disMuayene" value={form.anamnez.disMuayene} onChange={handleChange} style={inputStyle} />
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                <button type="submit" style={buttonStyle} disabled={loading}>
                  {loading ? (editingPatientId ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingPatientId ? 'Hasta Bilgilerini Güncelle' : 'Hasta Bilgilerini Kaydet')}
                </button>
              </div>
            </section>
          </form>
      </main>
    </AppLayout>
  );
}

const labelStyle = {
  color: "#1a237e",
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 2,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #dbeafe",
  fontSize: 15,
  marginTop: 4,
  marginBottom: 4,
  background: "#f8fafc"
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
