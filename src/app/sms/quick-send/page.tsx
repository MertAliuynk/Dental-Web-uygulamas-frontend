"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar";
import AppLayout from "../../components/AppLayout";

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  tc_number: string;
}

interface SmsTemplate {
  template_id: number;
  name: string;
  content: string;
}

export default function QuickSmsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  // Hastaları getir
  useEffect(() => {
    fetchPatients();
    fetchTemplates();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/patient", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || data);
      }
    } catch (error) {
      console.error("Hastalar yüklenemedi:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sms/templates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("SMS şablonları yüklenemedi:", error);
    }
  };

  // Filtrelenmiş hasta listesi
  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.tc_number.includes(searchTerm)
  );

  // Hasta seçme/seçimi kaldırma
  const togglePatientSelection = (patientId: number) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  // Hepsini seç/seçimi kaldır
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPatients([]);
      setAllSelected(false);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.patient_id));
      setAllSelected(true);
    }
  };

  // SMS gönder
  const sendSms = async () => {
    if (selectedPatients.length === 0 || !selectedTemplate) {
      alert("Lütfen en az bir hasta ve şablon seçiniz!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patientIds: selectedPatients,
          templateId: selectedTemplate
        })
      });

      if (response.ok) {
        alert("SMS başarıyla gönderildi!");
        setSelectedPatients([]);
        setSelectedTemplate(null);
        setAllSelected(false);
      } else {
        alert("SMS gönderilemedi!");
      }
    } catch (error) {
      console.error("SMS gönderme hatası:", error);
      alert("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Topbar />
      <div style={{ padding: 24 }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: 24
        }}>
          <h1 style={{ margin: "0 0 24px 0", fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
            Hızlı SMS Gönder
          </h1>

          {/* Hasta Arama */}
          <div className="wrap-when-narrow" style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>
              Hasta Ara:
            </label>
            <input
              type="text"
              placeholder="İsim, soyisim veya TC ile arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e1e5e9",
                borderRadius: 8,
                fontSize: 16,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#0066cc"}
              onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
            />
          </div>

          {/* Hepsini Seç Butonu */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={toggleSelectAll}
              style={{
                background: allSelected ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14
              }}
            >
              {allSelected ? "Tümünü Kaldır" : "Tümünü Seç"} ({filteredPatients.length})
            </button>
          </div>

          {/* Hasta Listesi */}
          <div style={{
            maxHeight: 300,
            overflowY: "auto",
            overflowX: "hidden",
            border: "1px solid #e1e5e9",
            borderRadius: 8,
            marginBottom: 24
          }}>
            {filteredPatients.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
                Hasta bulunamadı.
              </div>
            ) : (
              filteredPatients.map(patient => (
                <div
                  key={patient.patient_id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    background: selectedPatients.includes(patient.patient_id) ? "#e3f2fd" : "white",
                    transition: "background-color 0.2s"
                  }}
                  onClick={() => togglePatientSelection(patient.patient_id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.patient_id)}
                    onChange={() => togglePatientSelection(patient.patient_id)}
                    style={{ marginRight: 12, cursor: "pointer" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: "#1a1a1a" }}>
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div style={{ fontSize: 14, color: "#666", marginTop: 2 }}>
                      {patient.phone} • TC: {patient.tc_number}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* SMS Şablon Seçimi */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#333" }}>
              SMS Şablonu Seçin:
            </label>
            <select
              value={selectedTemplate || ""}
              onChange={(e) => setSelectedTemplate(Number(e.target.value) || null)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e1e5e9",
                borderRadius: 8,
                fontSize: 16,
                outline: "none",
                background: "white"
              }}
            >
              <option value="">Şablon seçiniz...</option>
              {templates.map(template => (
                <option key={template.template_id} value={template.template_id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seçili Şablon Önizleme */}
          {selectedTemplate && (
            <div style={{
              background: "#f8f9fa",
              border: "1px solid #e1e5e9",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24
            }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>Şablon Önizleme:</h4>
              <p style={{ margin: 0, color: "#555", lineHeight: 1.5 }}>
                {templates.find(t => t.template_id === selectedTemplate)?.content}
              </p>
            </div>
          )}

          {/* Seçim Özeti */}
          <div style={{
            background: "#e8f4fd",
            border: "1px solid #b3d9ff",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}>
            <div style={{ fontWeight: 600, color: "#0066cc", marginBottom: 4 }}>
              Seçim Özeti:
            </div>
            <div style={{ color: "#333" }}>
              {selectedPatients.length} hasta seçildi
              {selectedTemplate && `, "${templates.find(t => t.template_id === selectedTemplate)?.name}" şablonu seçildi`}
            </div>
          </div>

          {/* Gönder Butonu */}
          <button
            onClick={sendSms}
            disabled={loading || selectedPatients.length === 0 || !selectedTemplate}
            style={{
              width: "100%",
              padding: "16px 24px",
              background: loading || selectedPatients.length === 0 || !selectedTemplate ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading || selectedPatients.length === 0 || !selectedTemplate ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Gönderiliyor..." : "SMS Gönder"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
