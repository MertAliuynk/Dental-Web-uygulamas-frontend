"use client";
import Topbar from "../../components/Topbar";
import AppLayout from "../../components/AppLayout";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TreatmentAcceptReports() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  useEffect(() => {
  fetch(`https://dentalapi.karadenizdis.com/api/reports/treatment-accept?start=${startDate}&end=${endDate}`)
      .then(res => res.json())
      .then(d => {
        if (!d.success || !d.data) {
          setError("Veri alınamadı.");
          return;
        }
        setData(d.data);
      })
      .catch(() => setError("Sunucuya bağlanılamadı."));
  }, [startDate, endDate]);
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;
  if (!data) return <div>Yükleniyor...</div>;
  // data: [{ treatment_type: "Dolgu", accepted: 10, rejected: 2 }, ...]
  const chartData = {
    labels: data.map((d: any) => d.treatment_type),
    datasets: [
      {
        label: "Kabul Edilen",
        data: data.map((d: any) => d.accepted),
        backgroundColor: "#4caf50",
        borderRadius: 8,
      },
      {
        label: "Reddedilen",
        data: data.map((d: any) => d.rejected),
        backgroundColor: "#e53935",
        borderRadius: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#1a237e", font: { weight: 700 } } },
      y: { grid: { color: "#e3eafc" }, ticks: { color: "#1a237e", font: { weight: 700 }, stepSize: 1 } },
    },
  };
  return (
    <AppLayout>
      <Topbar />
      <main style={{ padding: 32, background: "#e3eafc", minHeight: "100vh" }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <label style={{ fontWeight: 600, color: '#1976d2' }}>Tarih Aralığı:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ background: '#e3eafc', border: '2px solid #1976d2', borderRadius: 6, padding: '4px 8px', color: '#1a237e', fontWeight: 600 }} />
            <span style={{ color: '#1976d2', fontWeight: 700 }}>-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ background: '#e3eafc', border: '2px solid #1976d2', borderRadius: 6, padding: '4px 8px', color: '#1a237e', fontWeight: 600 }} />
          </div>
          <h2 style={{ color: "#1a237e", fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Tedavi Kabul Raporları</h2>
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 32, maxWidth: 700 }}>
            <Bar data={chartData} options={options} height={320} />
          </div>
      </main>
    </AppLayout>
  );
}
