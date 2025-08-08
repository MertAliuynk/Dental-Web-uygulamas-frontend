// MiniAppointmentCalendar.tsx - Şube bazlı doktor randevuları
"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useEffect, useState } from "react";

const locales = { "tr-TR": tr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 1,
  getDay,
  locales,
});

interface Doctor {
  user_id: number;
  first_name: string;
  last_name: string;
  branch_id: number;
}

interface Branch {
  branch_id: number;
  name: string;
}

export default function MiniAppointmentCalendar() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [doctorAppointments, setDoctorAppointments] = useState<{[key: number]: any[]}>({});
  const [userRole, setUserRole] = useState<string>("");
  const [userBranchId, setUserBranchId] = useState<number>(1);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Kullanıcı bilgilerini al
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role") || "";
      const branchId = parseInt(localStorage.getItem("branchId") || "1");
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const u = JSON.parse(uStr);
          if (u?.user_id) setCurrentUserId(Number(u.user_id));
        }
      } catch {}
      
      // Admin için seçili şubeyi al, diğerleri kendi şubelerini kullan
      let activeBranchId = branchId;
      if (role === "admin") {
        const selectedBranch = localStorage.getItem("selectedBranchId");
        if (selectedBranch && selectedBranch !== "") {
          activeBranchId = parseInt(selectedBranch);
        }
      }
      
      console.log("User Role:", role, "Branch ID:", branchId, "Active:", activeBranchId);
      setUserRole(role);
      setUserBranchId(branchId);
      setSelectedBranchId(activeBranchId);
    }
  }, []);

  // Şube değişikliklerini dinle (admin için)
  useEffect(() => {
    const handleBranchChange = (event: any) => {
      const newBranchId = event.detail.branchId;
      console.log("Branch changed to:", newBranchId);
      setSelectedBranchId(newBranchId);
    };

    if (userRole === "admin") {
      window.addEventListener('branchChanged', handleBranchChange);
      return () => {
        window.removeEventListener('branchChanged', handleBranchChange);
      };
    }
  }, [userRole]);

  // Seçili şubedeki doktorları getir
  const fetchDoctors = async () => {
    if (!selectedBranchId || selectedBranchId === 0) {
      setDoctors([]);
      return;
    }

    try {
      console.log("API Call: /api/branch/" + selectedBranchId + "/doctors");
  const res = await fetch(`https://dentalapi.karadenizdis.com/api/branch/${selectedBranchId}/doctors`);
      const data = await res.json();
      console.log("Doctors API response:", data);
      
      if (data.success && data.data) {
        let list = data.data;
        // Doktor rolünde sadece kendi takvimini göster
        if (userRole === "doctor" && currentUserId) {
          list = list.filter((d: any) => Number(d.user_id) === Number(currentUserId));
        }
        setDoctors(list);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Doktor getirme hatası:", err);
      setDoctors([]);
    }
  };

  // Doktor başına randevuları getir
  const fetchAppointmentsForDoctor = async (doctorId: number) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const res = await fetch(
  `https://dentalapi.karadenizdis.com/api/appointment?branch_id=${selectedBranchId}&doctor_id=${doctorId}&date=${today}`
      );
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((item: any) => ({
          title: item.patient_first_name && item.patient_last_name 
            ? `${item.patient_first_name} ${item.patient_last_name}${item.notes ? ` - ${item.notes}` : ''}`
            : (item.notes || "Randevu"),
          start: new Date(item.appointment_time),
          end: new Date(new Date(item.appointment_time).getTime() + (item.duration_minutes || 30) * 60000),
          id: item.appointment_id,
        }));
        return mapped;
      }
    } catch (err) {
      console.error(`Doktor ${doctorId} randevuları alınamadı:`, err);
    }
    return [];
  };

  // Tüm doktorların randevularını getir
  const fetchAllDoctorAppointments = async () => {
    const appointments: {[key: number]: any[]} = {};
    for (const doctor of doctors) {
      appointments[doctor.user_id] = await fetchAppointmentsForDoctor(doctor.user_id);
    }
    setDoctorAppointments(appointments);
  };

  useEffect(() => {
    if (selectedBranchId && selectedBranchId > 0) {
      console.log("Fetching doctors for branch:", selectedBranchId);
      fetchDoctors();
    }
  }, [selectedBranchId, userRole, currentUserId]);

  useEffect(() => {
    if (doctors.length > 0) {
      console.log("Fetching appointments for", doctors.length, "doctors");
      fetchAllDoctorAppointments();
    } else {
      // Doktor yoksa randevuları temizle
      setDoctorAppointments({});
    }
  }, [doctors]);

  if (doctors.length === 0) {
    return (
      <div style={{ 
        background: "white", 
        borderRadius: 12, 
        padding: 24, 
        boxShadow: "0 2px 8px #0001", 
        width: "100%",
        overflowX: "auto"
      }}>
        <div style={{ fontWeight: 700, marginBottom: 16, textAlign: "center", color: "#1a237e", fontSize: 18 }}>
          Bu Şubede Doktor Bulunamadı
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "white", 
      borderRadius: 12, 
      padding: 24, 
      boxShadow: "0 2px 8px #0001", 
      width: "100%",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 16, textAlign: "center", color: "#1a237e", fontSize: 18 }}>
        Bugünkü Randevular
      </div>

      {/* Doktor başına ayrı takvimler */}
  <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {doctors.map((doctor) => (
          <div key={doctor.user_id} style={{ 
            border: "2px solid #e3eafc", 
            borderRadius: 8, 
            padding: 12,
            background: "#fafbff"
          }}>
            <div style={{ 
              fontWeight: 600, 
              marginBottom: 8, 
              textAlign: "center", 
              color: "#1a237e", 
              fontSize: 16 
            }}>
              Dr. {doctor.first_name} {doctor.last_name}
            </div>
      <div style={{ width: "100%", overflowX: "auto" }}>
      <Calendar
              localizer={localizer}
              events={doctorAppointments[doctor.user_id] || []}
              defaultView="day"
              views={["day"]}
              min={new Date(new Date().setHours(9, 0, 0, 0))}
              max={new Date(new Date().setHours(23, 59, 0, 0))}
              step={30}
              timeslots={2}
              style={{ 
        height: 320,
        minWidth: 360,
        width: "100%", 
                background: "white", 
                borderRadius: 6, 
                fontSize: 12, 
                color: "#222" 
              }}
              toolbar={false}
              showAllEvents={false}
      />
      </div>
          </div>
        ))}
      </div>
    </div>
  );
}
