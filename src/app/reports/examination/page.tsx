
"use client";
import AppLayout from "../../components/AppLayout";
import Topbar from "../../components/Topbar";
import { useEffect, useState } from "react";

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ExaminationReports() {
  const [report, setReport] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"branches" | "doctors" | "comparison">("branches");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(formatDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));

  function fetchReport() {
    setError("");
    setReport(null);
  fetch(`https://dentalapi.karadenizdis.com/api/reports/examination?start=${startDate}&end=${endDate}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setError("Veri alınamadı.");
          return;
        }
        setReport(data);
        // İlk şube ve doktoru otomatik seç
        if (data.branches && data.branches.length > 0) {
          setSelectedBranch(data.branches[0].branch_name);
        }
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctor(data.doctors[0].doctor_name);
        }
      })
      .catch(() => setError("Sunucuya bağlanılamadı."));
  }

  useEffect(() => { fetchReport(); }, [startDate, endDate]);

  if (error) return (
    <AppLayout>
      <Topbar />
      <div style={{ color: 'red', padding: 32, textAlign: 'center' }}>{error}</div>
    </AppLayout>
  );

  if (!report) return (
    <AppLayout>
      <Topbar />
      <div style={{ padding: 32, textAlign: 'center', color: '#1976d2', fontSize: 18 }}>Yükleniyor...</div>
    </AppLayout>
  );

  const formatChartData = (mode: string) => {
    const days = report.days.map((d: string) => d.slice(5).replace("-", "."));
    
    if (mode === "branches") {
      const branch = report.branches.find((b: any) => b.branch_name === selectedBranch);
      return {
        labels: days,
        datasets: [
          {
            label: `${selectedBranch} - Günlük Hasta Sayısı`,
            data: branch ? branch.counts : [],
            backgroundColor: "#1976d2",
            borderColor: "#1976d2",
            borderRadius: 8,
          },
        ],
      };
    } else if (mode === "doctors") {
      const doctor = report.doctors.find((d: any) => d.doctor_name === selectedDoctor);
      return {
        labels: days,
        datasets: [
          {
            label: `Dr. ${selectedDoctor} - Günlük Hasta Sayısı`,
            data: doctor ? doctor.counts : [],
            backgroundColor: "#388e3c",
            borderColor: "#388e3c",
            borderRadius: 8,
          },
        ],
      };
    } else {
      // Karşılaştırma: Tüm şubeler
      return {
        labels: days,
        datasets: report.branches.map((branch: any, index: number) => ({
          label: branch.branch_name,
          data: branch.counts,
          backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.7)`,
          borderColor: `hsl(${index * 60}, 70%, 50%)`,
          borderRadius: 4,
        })),
      };
    }
  };

  const getPieData = () => {
    if (viewMode === "branches") {
      return {
        labels: report.branches.map((b: any) => b.branch_name),
        datasets: [
          {
            data: report.branches.map((b: any) => b.total),
            backgroundColor: report.branches.map((_: any, index: number) => 
              `hsl(${index * 60}, 70%, 60%)`
            ),
          },
        ],
      };
    } else {
      // Doktor bazında pasta grafik
      return {
        labels: report.doctors.map((d: any) => `Dr. ${d.doctor_name}`),
        datasets: [
          {
            data: report.doctors.map((d: any) => d.total),
            backgroundColor: report.doctors.map((_: any, index: number) => 
              `hsl(${index * 40}, 60%, 65%)`
            ),
          },
        ],
      };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: viewMode === "comparison",
        position: 'top' as const,
      },
      title: { display: false },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: "#1a237e", font: { weight: 700 } } 
      },
      y: { 
        grid: { color: "#e3eafc" }, 
        ticks: { color: "#1a237e", font: { weight: 700 }, stepSize: 1 } 
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed} hasta`
        }
      }
    },
  };

  return (
    <AppLayout>
      <Topbar />
      <main style={{ flex: 1, padding: 32 }}>
        <h2 style={{ color: "#0a2972", fontWeight: 700, fontSize: 26, marginBottom: 24 }}>
          📊 Muayene Raporları
        </h2>

        {/* Kontroller */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 24,
          boxShadow: "0 2px 8px #0001"
        }}>
          {/* Tarih Seçimi */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600, color: '#1976d2' }}>Tarih Aralığı:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              style={{ 
                background: '#e3eafc', 
                border: '2px solid #1976d2', 
                borderRadius: 6, 
                padding: '6px 10px', 
                color: '#1a237e', 
                fontWeight: 600 
              }} 
            />
            <span style={{ color: '#1976d2', fontWeight: 700 }}>-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              style={{ 
                background: '#e3eafc', 
                border: '2px solid #1976d2', 
                borderRadius: 6, 
                padding: '6px 10px', 
                color: '#1a237e', 
                fontWeight: 600 
              }} 
            />
          </div>

          {/* Görünüm Modu */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { key: "branches", label: "🏢 Şubeler", color: "#1976d2" },
              { key: "doctors", label: "👨‍⚕️ Doktorlar", color: "#388e3c" },
              { key: "comparison", label: "📈 Karşılaştırma", color: "#f57c00" }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                style={{
                  background: viewMode === mode.key ? mode.color : "#f5f5f5",
                  color: viewMode === mode.key ? "#fff" : mode.color,
                  border: `2px solid ${mode.color}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Seçim Alanları */}
          {viewMode === "branches" && report.branches && (
            <select 
              value={selectedBranch} 
              onChange={e => setSelectedBranch(e.target.value)} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: 6, 
                border: "2px solid #1976d2", 
                fontWeight: 600, 
                color: "#1a237e",
                background: "#e3eafc"
              }}
            >
              {report.branches.map((b: any) => (
                <option key={b.branch_id} value={b.branch_name}>
                  🏢 {b.branch_name} ({b.total} hasta)
                </option>
              ))}
            </select>
          )}

          {viewMode === "doctors" && report.doctors && (
            <select 
              value={selectedDoctor} 
              onChange={e => setSelectedDoctor(e.target.value)} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: 6, 
                border: "2px solid #388e3c", 
                fontWeight: 600, 
                color: "#1a237e",
                background: "#e8f5e8"
              }}
            >
              {report.doctors.map((d: any) => (
                <option key={d.doctor_id} value={d.doctor_name}>
                  👨‍⚕️ Dr. {d.doctor_name} - {d.branch_name} ({d.total} hasta)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Özet Kartları */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ 
            background: "linear-gradient(135deg, #1976d2, #42a5f5)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.totalPatients || 0}</div>
            <div style={{ opacity: 0.9 }}>Toplam Hasta</div>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #388e3c, #66bb6a)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.totalDoctors || 0}</div>
            <div style={{ opacity: 0.9 }}>Toplam Doktor</div>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #f57c00, #ffb74d)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.totalBranches || 0}</div>
            <div style={{ opacity: 0.9 }}>Toplam Şube</div>
          </div>
        </div>

        {/* Grafikler */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {/* Ana Grafik */}
          <div style={{ 
            background: "white", 
            borderRadius: 12, 
            boxShadow: "0 2px 8px #0001", 
            padding: 24 
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>
              {viewMode === "branches" && "📊 Şube Bazında Günlük Analiz"}
              {viewMode === "doctors" && "👨‍⚕️ Doktor Bazında Günlük Analiz"}
              {viewMode === "comparison" && "📈 Şubeler Arası Karşılaştırma"}
            </h3>
            <Bar data={formatChartData(viewMode)} options={chartOptions} />
          </div>

          {/* Pasta Grafik */}
          <div style={{ 
            background: "white", 
            borderRadius: 12, 
            boxShadow: "0 2px 8px #0001", 
            padding: 24 
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>
              🥧 Toplam Dağılım
            </h3>
            <Pie data={getPieData()} options={pieOptions} />
          </div>
        </div>

        {/* Detaylı Tablo */}
        {viewMode === "doctors" && (
          <div style={{ 
            background: "white", 
            borderRadius: 12, 
            boxShadow: "0 2px 8px #0001", 
            padding: 24,
            marginTop: 24
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>👨‍⚕️ Doktor Detayları</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Doktor</th>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Şube</th>
                    <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Toplam Hasta</th>
                    <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Günlük Ortalama</th>
                  </tr>
                </thead>
                <tbody>
                  {report.doctors?.map((doctor: any, index: number) => (
                    <tr key={doctor.doctor_id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "12px" }}>👨‍⚕️ Dr. {doctor.doctor_name}</td>
                      <td style={{ padding: "12px" }}>🏢 {doctor.branch_name}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>{doctor.total}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        {doctor.total > 0 ? (doctor.total / report.days.length).toFixed(1) : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
