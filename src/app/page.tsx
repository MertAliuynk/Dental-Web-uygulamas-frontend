
"use client";
import PatientSearchCard from "./components/PatientSearchCard";
import MiniAppointmentCalendar from "./components/MiniAppointmentCalendar";
import UpcomingAppointments from "./components/UpcomingAppointments";
import Topbar from "./components/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "./components/AppLayout";

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  useEffect(() => {
    // Cookie veya localStorage'da token var mı kontrol et
    const hasToken = typeof window !== "undefined" && (localStorage.getItem("token") || document.cookie.includes("token="));
    if (!hasToken) {
      router.replace("/login");
    }
    // Dummy: rolü localStorage'dan veya cookie'den al (gerçek projede JWT decode edilir)
    // Şimdilik "doctor" veya "admin" olarak elle set edebilirsin
    setRole(localStorage.getItem("role") || "doctor");
  }, [router]);

  return (
    <AppLayout>
      <Topbar />
      <main style={{ flex: 1, padding: "24px 24px 0 24px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "stretch", marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", minWidth: 280, maxWidth: 460 }}>
              <PatientSearchCard />
            </div>
            <div style={{ flex: "2 1 600px", minWidth: 0 }}>
              <MiniAppointmentCalendar />
            </div>
          </div>
          <UpcomingAppointments role={role} />
      </main>
    </AppLayout>
  );
}
