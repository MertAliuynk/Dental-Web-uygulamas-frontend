"use client";

import React, { useEffect, useState } from "react";

export default function AppointmentCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function fetchAppointments() {
    try {
  const res = await fetch("https://dentalapi.karadenizdis.com/api/appointment");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      setEvents([]);
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchAppointments();
    }
  }, [mounted]);

  // Navigasyon fonksiyonları
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({ hour, minute });
      }
    }
    return slots;
  };

  // Get appointments for selected date
  const getDayAppointments = () => {
    const dateStr = selectedDate.toDateString();
    return events.filter((apt: any) => {
      const aptDate = new Date(apt.appointment_time);
      return aptDate.toDateString() === dateStr;
    });
  };

  if (!mounted) {
    return (
      <div style={{
        background: "#f5f6fa",
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        margin: 24,
        minHeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Takvim yükleniyor...</div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();
  const dayAppointments = getDayAppointments();

  return (
    <div style={{
      background: "#f5f6fa",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      margin: 24,
      minHeight: 800
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <h2 style={{
          fontWeight: 700,
          fontSize: 24,
          margin: 0,
          color: "#2d3a4a"
        }}>
          Randevu Takvimi
        </h2>
        
        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={goToPrevious}
            style={{
              padding: "8px 16px",
              background: "#fff",
              border: "2px solid #e3eafc",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              color: "#2d3a4a",
              fontSize: 14,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e3eafc";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            ← Önceki Gün
          </button>
          
          <button
            onClick={goToToday}
            style={{
              padding: "8px 16px",
              background: "#1a237e",
              border: "2px solid #1a237e",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              color: "#fff",
              fontSize: 14,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#0d1559";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#1a237e";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            Bugün
          </button>
          
          <button
            onClick={goToNext}
            style={{
              padding: "8px 16px",
              background: "#fff",
              border: "2px solid #e3eafc",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              color: "#2d3a4a",
              fontSize: 14,
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#e3eafc";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            Sonraki Gün →
          </button>
        </div>
      </div>

      {/* Selected Date Display */}
      <div style={{
        background: "white",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#1a237e",
          textAlign: "center"
        }}>
          {selectedDate.toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Custom Calendar Grid */}
      <div style={{
        background: "white",
        borderRadius: 8,
        padding: 16,
        minHeight: 600,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 1,
          border: '1px solid #e3eafc',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {timeSlots.map(({ hour, minute }) => {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slotAppointment = dayAppointments.find((apt: any) => {
              const aptTime = new Date(apt.appointment_time);
              return aptTime.getHours() === hour && aptTime.getMinutes() === minute;
            });

            return (
              <React.Fragment key={`${hour}-${minute}`}>
                <div style={{
                  padding: '12px 16px',
                  background: '#f8f9fa',
                  borderRight: '1px solid #e3eafc',
                  fontSize: '14px',
                  fontWeight: 600,
                  minWidth: 80,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2d3a4a'
                }}>
                  {timeStr}
                </div>
                <div style={{
                  padding: '12px 16px',
                  minHeight: 48,
                  background: slotAppointment ? '#e3f2fd' : '#fff',
                  borderBottom: '1px solid #f0f4f8',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px'
                }}>
                  {slotAppointment ? (
                    <div>
                      <span style={{ 
                        color: '#1a237e', 
                        fontWeight: 600,
                        display: 'block'
                      }}>
                        {slotAppointment.patient_first_name} {slotAppointment.patient_last_name}
                      </span>
                      {slotAppointment.doctor_first_name && (
                        <span style={{ 
                          color: '#666', 
                          fontSize: '12px',
                          display: 'block'
                        }}>
                          Dr. {slotAppointment.doctor_first_name} {slotAppointment.doctor_last_name}
                        </span>
                      )}
                      {slotAppointment.notes && (
                        <span style={{ 
                          color: '#888', 
                          fontSize: '11px',
                          display: 'block',
                          marginTop: 2
                        }}>
                          {slotAppointment.notes}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ 
                      color: '#bbb', 
                      fontStyle: 'italic' 
                    }}>
                      Boş
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        gap: 16,
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          <span style={{ color: '#666', fontSize: '12px' }}>
            Toplam Randevu: <strong style={{ color: '#1a237e' }}>{dayAppointments.length}</strong>
          </span>
        </div>
        <div style={{
          background: 'white',
          padding: '8px 16px',
          borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          <span style={{ color: '#666', fontSize: '12px' }}>
            Boş Slot: <strong style={{ color: '#28a745' }}>{timeSlots.length - dayAppointments.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
