"use client";
import AppLayout from "../../components/AppLayout";
import Topbar from "../../components/Topbar";
import { useEffect, useState } from "react";

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
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

export default function DoctorAppointmentReports() {
  const [report, setReport] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"doctors" | "branches" | "performance" | "trends">("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(formatDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));

  function fetchReport() {
    setError("");
    setReport(null);
  fetch(`https://dentalapi.karadenizdis.com/api/reports/doctor-appointment?start=${startDate}&end=${endDate}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setError("Veri alınamadı.");
          return;
        }
        setReport(data);
        // İlk doktor ve şubeyi otomatik seç
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctor(data.doctors[0].doctor_name);
        }
        if (data.branches && data.branches.length > 0) {
          setSelectedBranch(data.branches[0].branch_name);
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
    const days = report.days?.map((d: string) => d.slice(5).replace("-", ".")) || [];
    
    if (mode === "doctors") {
      return {
        labels: report.doctors?.map((d: any) => `Dr. ${d.doctor_name}`) || [],
        datasets: [
          {
            label: "Toplam Randevu",
            data: report.doctors?.map((d: any) => d.total_appointments) || [],
            backgroundColor: "#1976d2",
            borderRadius: 8,
          },
        ],
      };
    } else if (mode === "branches") {
      return {
        labels: report.branches?.map((b: any) => b.branch_name) || [],
        datasets: [
          {
            label: "Toplam Randevu",
            data: report.branches?.map((b: any) => b.total_appointments) || [],
            backgroundColor: "#388e3c",
            borderRadius: 8,
          },
        ],
      };
    } else if (mode === "performance") {
      return {
        labels: report.doctors?.map((d: any) => `Dr. ${d.doctor_name}`) || [],
        datasets: [
          {
            label: "Geldi",
            data: report.doctors?.map((d: any) => d.attended_appointments) || [],
            backgroundColor: "#4caf50",
            borderRadius: 6,
          },
          {
            label: "Gelmedi",
            data: report.doctors?.map((d: any) => d.missed_appointments) || [],
            backgroundColor: "#f44336",
            borderRadius: 6,
          },
        ],
      };
    } else {
      // Trends - günlük analiz
      const selectedDoc = report.doctors?.find((d: any) => d.doctor_name === selectedDoctor);
      return {
        labels: days,
        datasets: [
          {
            label: `Dr. ${selectedDoctor} - Günlük Randevular`,
            data: selectedDoc?.daily_counts || [],
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            borderColor: "#1976d2",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
  };

  const getAttendanceData = () => {
    return {
      labels: ["Geldi", "Gelmedi", "Bekliyor"],
      datasets: [
        {
          data: [
            report.summary?.total_attended || 0,
            report.summary?.total_missed || 0,
            (report.summary?.total_appointments || 0) - (report.summary?.total_attended || 0) - (report.summary?.total_missed || 0)
          ],
          backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: viewMode === "performance",
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

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
          label: (context: any) => `${context.label}: ${context.parsed} randevu`
        }
      }
    },
  };

  return (
    <AppLayout>
      <Topbar />
      <main style={{ flex: 1, padding: 32 }}>
        <h2 style={{ color: "#0a2972", fontWeight: 700, fontSize: 26, marginBottom: 24 }}>
          👨‍⚕️ Hekim Randevu Raporları
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
              { key: "doctors", label: "👨‍⚕️ Doktorlar", color: "#1976d2" },
              { key: "branches", label: "🏢 Şubeler", color: "#388e3c" },
              { key: "performance", label: "📊 Performans", color: "#f57c00" },
              { key: "trends", label: "📈 Trendler", color: "#9c27b0" }
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
          {viewMode === "trends" && report.doctors && (
            <select 
              value={selectedDoctor} 
              onChange={e => setSelectedDoctor(e.target.value)} 
              style={{ 
                padding: "8px 12px", 
                borderRadius: 6, 
                border: "2px solid #9c27b0", 
                fontWeight: 600, 
                color: "#1a237e",
                background: "#f3e5f5"
              }}
            >
              {report.doctors.map((d: any) => (
                <option key={d.doctor_id} value={d.doctor_name}>
                  👨‍⚕️ Dr. {d.doctor_name} - {d.branch_name} ({d.total_appointments} randevu)
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
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.total_appointments || 0}</div>
            <div style={{ opacity: 0.9 }}>Toplam Randevu</div>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #4caf50, #66bb6a)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.total_attended || 0}</div>
            <div style={{ opacity: 0.9 }}>Geldi</div>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #f44336, #ef5350)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{report.summary?.total_missed || 0}</div>
            <div style={{ opacity: 0.9 }}>Gelmedi</div>
          </div>
          <div style={{ 
            background: "linear-gradient(135deg, #ff9800, #ffb74d)", 
            color: "white", 
            borderRadius: 12, 
            padding: 20, 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>%{report.summary?.overall_attendance_rate || 0}</div>
            <div style={{ opacity: 0.9 }}>Katılım Oranı</div>
          </div>
        </div>

        {/* Grafikler */}
  <div style={{ display: "grid", gridTemplateColumns: viewMode === "trends" ? "1fr" : "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {/* Ana Grafik */}
          <div style={{ 
            background: "white", 
            borderRadius: 12, 
            boxShadow: "0 2px 8px #0001", 
            padding: 24 
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>
              {viewMode === "doctors" && "👨‍⚕️ Doktor Bazında Randevu Analizi"}
              {viewMode === "branches" && "🏢 Şube Bazında Randevu Analizi"}
              {viewMode === "performance" && "📊 Doktor Performans Karşılaştırması"}
              {viewMode === "trends" && "📈 Günlük Randevu Trendi"}
            </h3>
            {viewMode === "trends" ? (
              <Line data={formatChartData(viewMode)} options={lineOptions} />
            ) : (
              <Bar data={formatChartData(viewMode)} options={chartOptions} />
            )}
          </div>

          {/* Yan Grafik (trends modunda gizli) */}
          {viewMode !== "trends" && (
            <div style={{ 
              background: "white", 
              borderRadius: 12, 
              boxShadow: "0 2px 8px #0001", 
              padding: 24 
            }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>
                🥧 Genel Katılım Dağılımı
              </h3>
              <Doughnut data={getAttendanceData()} options={pieOptions} />
            </div>
          )}
        </div>

        {/* Detaylı Tablo */}
        <div style={{ 
          background: "white", 
          borderRadius: 12, 
          boxShadow: "0 2px 8px #0001", 
          padding: 24,
          marginTop: 24
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1976d2" }}>👨‍⚕️ Doktor Performans Detayları</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Doktor</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Şube</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Toplam</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Geldi</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Gelmedi</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Katılım %</th>
                  <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Günlük Ort.</th>
                </tr>
              </thead>
              <tbody>
                {report.doctors?.map((doctor: any, index: number) => (
                  <tr key={doctor.doctor_id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px" }}>👨‍⚕️ Dr. {doctor.doctor_name}</td>
                    <td style={{ padding: "12px" }}>🏢 {doctor.branch_name}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>{doctor.total_appointments}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "#4caf50", fontWeight: "bold" }}>{doctor.attended_appointments}</td>
                    <td style={{ padding: "12px", textAlign: "center", color: "#f44336", fontWeight: "bold" }}>{doctor.missed_appointments}</td>
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>%{doctor.attendance_rate}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>{doctor.avg_daily}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
