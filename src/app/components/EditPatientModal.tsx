"use client";
import { useEffect, useState } from "react";

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  tc_number: string;
  phone: string;
  birth_date: string;
  branch_id: number;
  doctor_id: number;
  notes: string;
}

interface Branch {
  branch_id: number;
  name: string;
}

interface Doctor {
  user_id: number;
  first_name: string;
  last_name: string;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: () => void;
}

export default function EditPatientModal({ isOpen, onClose, patient, onSave }: EditPatientModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tcNumber: "",
    phone: "",
    birthDate: "",
    branchId: "",
    doctorId: "",
    notes: ""
  });
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.first_name || "",
        lastName: patient.last_name || "",
        tcNumber: patient.tc_number || "",
        phone: patient.phone || "",
        birthDate: patient.birth_date ? patient.birth_date.split('T')[0] : "",
        branchId: patient.branch_id?.toString() || "",
        doctorId: patient.doctor_id?.toString() || "",
        notes: patient.notes || ""
      });
    }
  }, [patient]);

  const fetchBranches = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/branch");
      const data = await response.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error("Şubeler yüklenemedi:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/user/doctors");
      const data = await response.json();
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Doktorlar yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    if (!formData.firstName || !formData.lastName) {
      alert("Ad ve soyad zorunludur!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/patient/${patient.patient_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          tcNumber: formData.tcNumber,
          phone: formData.phone,
          birthDate: formData.birthDate || null,
          branchId: formData.branchId ? parseInt(formData.branchId) : null,
          doctorId: formData.doctorId ? parseInt(formData.doctorId) : null,
          notes: formData.notes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Hasta bilgileri başarıyla güncellendi!");
        onSave();
        onClose();
      } else {
        alert(data.message || "Güncelleme sırasında hata oluştu!");
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Sunucu hatası!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 32,
        width: "90%",
        maxWidth: 600,
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#0a2972",
            margin: 0
          }}>
            Hasta Bilgilerini Düzenle
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666"
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Ad*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Soyad*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>TC Kimlik No</label>
              <input
                type="text"
                name="tcNumber"
                value={formData.tcNumber}
                onChange={handleChange}
                style={inputStyle}
                maxLength={11}
              />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Doğum Tarihi</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Şube</label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Şube Seçin</option>
                {branches.map(branch => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Doktor</label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Doktor Seçin</option>
              {doctors.map(doctor => (
                <option key={doctor.user_id} value={doctor.user_id}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Notlar</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical" as const
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "2px solid #ddd",
                borderRadius: 6,
                backgroundColor: "white",
                color: "#666",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: 6,
                backgroundColor: "#0a2972",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 16,
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontWeight: 600,
  color: "#0a2972",
  fontSize: 14
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "2px solid #e1e5e9",
  borderRadius: 6,
  fontSize: 14,
  boxSizing: "border-box" as const
};
