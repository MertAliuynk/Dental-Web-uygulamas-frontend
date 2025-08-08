import React from "react";

export default function MiniCalendar() {
  // Sadece bugünün randevularını gösterecek, tarih seçimi yok
  // Dummy data, API ile değiştirilecek
  const today = new Date().toLocaleDateString();
  const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px #0001", minWidth: 400 }}>
      <div style={{ fontWeight: 600, marginBottom: 12, textAlign: "center" }}>Randevu Takvimi - {today}</div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #eee", padding: 6, textAlign: "left" }}>Saat</th>
            <th style={{ borderBottom: "1px solid #eee", padding: 6, textAlign: "left" }}>Hasta</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <td style={{ padding: 6, borderBottom: "1px solid #f5f5f5" }}>{hour}</td>
              <td style={{ padding: 6, borderBottom: "1px solid #f5f5f5" }}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
