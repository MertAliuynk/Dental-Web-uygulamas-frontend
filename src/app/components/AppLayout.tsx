"use client";
import React from "react";
import Sidebar from "./Sidebar";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const PatientSelectModal = dynamic(() => import("./PatientSelectModal"), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showPatientModal, setShowPatientModal] = React.useState(false);
  const router = useRouter();

  return (
    <div className="app-shell">
      {/* Mobile topbar (hidden on tablet/desktop) */}
      <div className="mobile-topbar" style={{
        display: "none",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 110,
        background: "#0a2972",
        color: "#fff",
        height: 56,
        alignItems: "center",
        padding: "0 12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
      }}>
        <button
          aria-label="Menüyü Aç"
          onClick={() => setMobileOpen(true)}
          style={{
            background: "transparent",
            border: 0,
            color: "#fff",
            fontSize: 22,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            marginRight: 8
          }}
        >
          ☰
        </button>
        <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>Diş Klinikleri Yönetimi</div>
      </div>

      {/* Sidebar (fixed on >= tablet, drawer on mobile) */}
      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenPatientSelect={() => setShowPatientModal(true)}
      />

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="sidebar-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 105
          }}
        />
      )}

      <div className="app-content">{children}</div>

      {/* Centralized patient select modal */}
      <PatientSelectModal
        open={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        onSelect={(id: number | string) => {
          setShowPatientModal(false);
          router.push(`/patients/card?id=${id}`);
        }}
      />
    </div>
  );
}
