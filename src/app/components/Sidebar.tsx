"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

interface Branch {
  branch_id: number;
  name: string;
}

const menu = [
  { label: "ANA SAYFA", path: "/" },
  { label: "Randevu Takvimi", path: "/calendar" },
  {
    label: "Hastalar",
    children: [
      { label: "Hasta Kartı Görüntüle", path: "/patients/card" },
      { label: "Yeni Hasta Ekle", path: "/patients/new" },
      { label: "Hasta Listesi", path: "/patients" },
      { label: "Toplu Hasta Ekleme", path: "/patients/bulk" },
      { label: "Onam Formları", path: "/patients/consent" },
    ],
  },
  {
    label: "SMS",
    children: [
      { label: "Hızlı SMS Gönder", path: "/sms/quick-send" },
      { label: "SMS Şablonları", path: "/sms/templates" },
      { label: "İleri Tarihli SMS", path: "/sms/scheduled" },
    ],
  },
  {
    label: "Raporlar",
    children: [
      { label: "Muayene Raporları", path: "/reports/examination" },
      { label: "Tedavi Raporları", path: "/reports/treatment" },
      { label: "Hekim Başı Randevu Raporları", path: "/reports/doctor-appointment" },
    ],
  },
  { label: "Geri Dönüşler", path: "/feedbacks" },
];

export default function Sidebar({ open = false, onClose, onOpenPatientSelect }: { open?: boolean; onClose?: () => void; onOpenPatientSelect?: () => void }) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  // Modal is managed by AppLayout; no local state here
  
  // Admin için şube yönetimi
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0); // 0 ile başla
  
  // Rol, şube ve isim localStorage'dan alınır
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role") || "");
      setBranch(localStorage.getItem("branch") || "");
      setUserName(localStorage.getItem("name") || "");
      
      const branchId = localStorage.getItem("branchId");
      const selectedBranch = localStorage.getItem("selectedBranchId");
      
      if (selectedBranch) {
        setSelectedBranchId(parseInt(selectedBranch));
      } else if (branchId) {
        setSelectedBranchId(parseInt(branchId));
      }
    }
  }, []);

  // Şubeleri getir (sadece admin için)
  const fetchBranches = async () => {
    if (role !== "admin") return;
    
    try {
  const res = await fetch("https://dentalapi.karadenizdis.com/api/branch");
      const data = await res.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch (err) {
      console.error("Şubeler alınamadı:", err);
    }
  };

  React.useEffect(() => {
    if (role === "admin") {
      fetchBranches();
    }
  }, [role]);

  // Şube seçimi değiştiğinde localStorage'ı güncelle
  const handleBranchChange = (branchId: number) => {
    if (!branchId || branchId === 0) return; // Boş seçim engelle
    
    setSelectedBranchId(branchId);
    localStorage.setItem("selectedBranchId", branchId.toString());
    
    // Custom event ile diğer componentları bilgilendir (sayfa yenileme olmadan)
    window.dispatchEvent(new CustomEvent('branchChanged', { 
      detail: { branchId } 
    }));
  };

  const handleMenuClick = (item: any) => {
    if (item.children) {
      setMenuOpen(menuOpen === item.label ? null : item.label);
    } else if (item.label === "Hasta Kartı Görüntüle") {
      if (onOpenPatientSelect) onOpenPatientSelect();
      if (onClose) onClose();
    } else {
      router.push(item.path);
    }
  };

  // Rol bazlı menü filtreleme
  const filteredMenu = menu
    .filter(item => !(item.label === "Raporlar" && role === "doctor"))
    .map(item => {
      // SMS Şablonları'nı doktor ve receptionist için gizle
      if (item.label === "SMS" && item.children && (role === "doctor" || role === "receptionist")) {
        return {
          ...item,
          children: item.children.filter((child: any) => child.label !== "SMS Şablonları")
        };
      }
      return item;
    });

  return (
    <aside
      className="sidebar"
      data-open={open ? 'true' : 'false'}
      style={{
      width: 240,
      background: "#0a2972",
      color: "white",
      height: "100vh",
      minHeight: "100vh",
      maxHeight: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 110,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxSizing: "border-box",
      borderRight: "1px solid #173a7c",
      overflowY: "auto",
      transition: "transform 200ms ease"
    }}>
      {/* Mobile close button */}
      <div className="sidebar-mobile-header" style={{ display: "none", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>Menü</div>
        <button
          aria-label="Menüyü Kapat"
          onClick={() => onClose && onClose()}
          style={{ background: "transparent", border: 0, color: "#fff", fontSize: 22, width: 36, height: 36, cursor: "pointer" }}
        >
          ×
        </button>
      </div>
  {role === "doctor" || role === "branch_manager" || role === "receptionist" ? (
        <>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>{branch || "Şube Bilgisi Yok"}</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>{userName || "Kullanıcı"} <span style={{ fontWeight: 500, fontSize: 13 }}>({role})</span></div>
        </>
      ) : role === "admin" ? (
        <>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16 }}>Admin Paneli</div>
          
          {/* Şube Seçici */}
          <div style={{ 
            marginBottom: 16, 
            padding: 12, 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <label style={{ 
              display: "block", 
              fontSize: 12, 
              marginBottom: 6, 
              color: "#ccc", 
              fontWeight: 500 
            }}>
              Aktif Şube
            </label>
            <select
              value={selectedBranchId || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value && value !== "") {
                  handleBranchChange(parseInt(value));
                }
              }}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                background: "white",
                color: "#333"
              }}
            >
              <option value="">Şube Seçin</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ fontSize: 13, marginBottom: 16, color: "#ddd" }}>
            {userName || "Admin Kullanıcı"} <span style={{ fontWeight: 500, fontSize: 11 }}>({role || "admin"})</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>ATAKUM ŞUBE</div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>Admin Murat Karakuzu</div>
        </>
      )}
      <button
        style={{ marginBottom: 24, background: "white", color: "#0a2972", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600, cursor: "pointer" }}
        onClick={() => router.push("/patients/new")}
      >
        YENİ HASTA
      </button>
      {filteredMenu.map((item) => (
        <div key={item.label}>
          <div
            style={{
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 0",
              position: "relative",
              borderLeft: pathname === item.path || (item.children && item.children.some((child: any) => pathname === child.path)) 
                ? "4px solid #1976d2" 
                : "4px solid transparent",
              paddingLeft: pathname === item.path || (item.children && item.children.some((child: any) => pathname === child.path))
                ? "8px"
                : "12px",
              marginLeft: "-16px",
              paddingRight: "16px",
              backgroundColor: pathname === item.path || (item.children && item.children.some((child: any) => pathname === child.path))
                ? "rgba(25, 118, 210, 0.08)"
                : "transparent"
            }}
            onClick={() => handleMenuClick(item)}
          >
            {item.label}
            {item.children && (
              <span style={{ marginLeft: 4 }}>{menuOpen === item.label ? "▼" : "▶"}</span>
            )}
          </div>
          {item.children && menuOpen === item.label && (
            <div style={{ marginLeft: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
              {item.children.map((child: any) => (
                child.label === "Hasta Kartı Görüntüle" ? (
                  <div
                    key={child.label}
                    style={{ 
                      cursor: "pointer", 
                      fontWeight: 400, 
                      fontSize: 14, 
                      padding: "4px 8px",
                      borderLeft: "4px solid transparent",
                      backgroundColor: "transparent",
                      marginLeft: "-4px"
                    }}
                    onClick={() => {
                      if (onOpenPatientSelect) onOpenPatientSelect();
                      if (onClose) onClose();
                    }}
                  >
                    {child.label}
                  </div>
                ) : (
                  <div
                    key={child.label}
                    style={{ 
                      cursor: "pointer", 
                      fontWeight: 400, 
                      fontSize: 14, 
                      padding: "4px 8px",
                      borderLeft: pathname === child.path ? "4px solid #1976d2" : "4px solid transparent",
                      backgroundColor: pathname === child.path ? "rgba(25, 118, 210, 0.12)" : "transparent",
                      marginLeft: "-4px",
                      borderRadius: pathname === child.path ? "0 4px 4px 0" : "0"
                    }}
                    onClick={() => router.push(child.path)}
                  >
                    {child.label}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{ position: "sticky", bottom: 0, width: "100%", background: "#0a2972", paddingTop: 24, paddingBottom: 8 }}>
        <button
          style={{
            width: "100%",
            background: "#e53935",
            color: "white",
            border: 0,
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("branch");
            localStorage.removeItem("name");
            localStorage.removeItem("branchId");
            localStorage.removeItem("selectedBranchId");
            router.push("/login");
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
