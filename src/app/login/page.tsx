"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminChoice, setShowAdminChoice] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
  const res = await fetch("https://dentalapi.karadenizdis.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Giriş başarısız");
        setLoading(false);
        return;
      }
      
      // Admin ise seçim ekranı göster
      if (data.user.role === "admin") {
        setAdminData(data);
        setShowAdminChoice(true);
        setLoading(false);
        return;
      }
      
      // Admin değilse direkt giriş yap
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // User objesini de kaydet
      if (data.user.role) {
        localStorage.setItem("role", data.user.role);
      }
      if (data.user.branch_id) {
        localStorage.setItem("branchId", data.user.branch_id.toString());
      }
      if (data.user.branch_name) {
        localStorage.setItem("branch", data.user.branch_name);
      }
      if (data.user.first_name && data.user.last_name) {
        localStorage.setItem("name", `${data.user.first_name} ${data.user.last_name}`);
      }
      console.log("Login Success - Role:", data.user.role, "Branch:", data.user.branch_name);
      router.push("/");
    } catch (err) {
      setError("Sunucu hatası");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChoice = (choice: 'dental' | 'management') => {
    // Token ve kullanıcı bilgilerini kaydet
    localStorage.setItem("token", adminData.token);
    localStorage.setItem("user", JSON.stringify(adminData.user)); // User objesini de kaydet
    localStorage.setItem("role", adminData.user.role);
    if (adminData.user.branch_id) {
      localStorage.setItem("branchId", adminData.user.branch_id.toString());
    }
    if (adminData.user.branch_name) {
      localStorage.setItem("branch", adminData.user.branch_name);
    }
    if (adminData.user.first_name && adminData.user.last_name) {
      localStorage.setItem("name", `${adminData.user.first_name} ${adminData.user.last_name}`);
    }
    
    if (choice === 'dental') {
      // Normal dental sayfasına git
      router.push("/");
    } else {
      // Admin yönetim sayfasına git
      router.push("/admin");
    }
  };

  // Admin seçim ekranı
  if (showAdminChoice) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa"
      }}>
        <div style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: 400,
          width: "100%"
        }}>
          <h2 style={{ 
            textAlign: "center", 
            marginBottom: 30, 
            color: "#1a237e", 
            fontSize: 24, 
            fontWeight: 700 
          }}>
            Admin Paneli Seçimi
          </h2>
          <p style={{ 
            textAlign: "center", 
            marginBottom: 30, 
            color: "#666", 
            fontSize: 16 
          }}>
            Hangi paneli kullanmak istiyorsunuz?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => handleAdminChoice('dental')}
              style={{
                padding: "16px 24px",
                background: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              🦷 Dental Yönetimi
            </button>
            <button
              onClick={() => handleAdminChoice('management')}
              style={{
                padding: "16px 24px",
                background: "#4caf50",
                color: "white", 
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              ⚙️ Sistem Yönetimi
            </button>
          </div>
          <button
            onClick={() => setShowAdminChoice(false)}
            style={{
              marginTop: 20,
              padding: "8px 16px",
              background: "transparent",
              color: "#666",
              border: "1px solid #ddd",
              borderRadius: 6,
              cursor: "pointer",
              width: "100%"
            }}
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          minWidth: 340,
          maxWidth: 360,
          width: "100%"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#1976d2" }}>Giriş Yap</h2>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: "#2d3a4a" }}>Kullanıcı Adı</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #dbeafe",
              borderRadius: 6,
              marginTop: 6,
              fontSize: 15
            }}
            autoFocus
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 500, color: "#2d3a4a" }}>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #dbeafe",
              borderRadius: 6,
              marginTop: 6,
              fontSize: 15
            }}
            required
          />
        </div>
        {error && <div style={{ color: "#d32f2f", marginBottom: 12, textAlign: "center" }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#90caf9" : "#1976d2",
            color: "white",
            fontWeight: 600,
            border: "none",
            borderRadius: 6,
            padding: "12px 0",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8
          }}
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </div>
  );
}
