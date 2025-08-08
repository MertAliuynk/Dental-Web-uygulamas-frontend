"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import AppLayout from "../components/AppLayout";

interface PendingFeedback {
  patient_id: number;
  patient_name: string;
  phone: string;
  earliest_feedback_date: string;
  feedback_items: FeedbackItem[];
}

interface FeedbackItem {
  planning_id: number;
  treatment_id: number;
  interval: string;
  interval_display: string;
  planned_date: string;
  treatment_name: string;
  completed_at: string;
  status: string;
  days_until_due: number;
}

interface FeedbackHistory {
  patient_id: number;
  patient_name: string;
  phone: string;
  total_feedbacks: number;
  last_feedback_date: string;
  feedback_items: HistoryFeedbackItem[];
}

interface HistoryFeedbackItem {
  feedback_id: number;
  treatment_id: number;
  interval: string;
  interval_display: string;
  feedback_date: string;
  notes: string;
  treatment_name: string;
  completed_at: string;
  created_at: string;
}

export default function FeedbacksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pendingFeedbacks, setPendingFeedbacks] = useState<PendingFeedback[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PendingFeedback | null>(null);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<FeedbackItem | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");

  useEffect(() => {
    // Auth kontrolü
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    
    if (!token) {
      router.replace("/login");
      return;
    }
    
    if (userRole !== "admin" && userRole !== "doctor") {
      router.replace("/");
      return;
    }
    
    loadPendingFeedbacks();
  }, [router]);

  const loadPendingFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
  const response = await fetch(`https://dentalapi.karadenizdis.com/api/feedback/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPendingFeedbacks(data.data || []);
      }
    } catch (error) {
      console.error('Bekleyen geri dönüşler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackHistory = async () => {
    try {
      const token = localStorage.getItem("token");
  const response = await fetch(`https://dentalapi.karadenizdis.com/api/feedback/history?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbackHistory(data.data || []);
      }
    } catch (error) {
      console.error('Geri dönüş geçmişi yüklenirken hata:', error);
    }
  };

  const handleTabChange = (tab: 'pending' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') {
      loadFeedbackHistory();
    }
  };

  const handleCreateFeedback = async () => {
    if (!selectedFeedbackItem) return;
    
    try {
      const token = localStorage.getItem("token");
  const response = await fetch(`https://dentalapi.karadenizdis.com/api/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planning_id: selectedFeedbackItem.planning_id,
          notes: feedbackNotes
        })
      });
      
      if (response.ok) {
        alert('Geri dönüş başarıyla kaydedildi');
        setShowModal(false);
        setFeedbackNotes("");
        setSelectedPatient(null);
        setSelectedFeedbackItem(null);
        loadPendingFeedbacks();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Geri dönüş kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Geri dönüş kaydedilirken hata:', error);
      alert('Geri dönüş kaydedilirken hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'due': return '#ff4757';
      case 'upcoming': return '#ffa502';
      default: return '#2ed573';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'due': return 'Geçmiş';
      case 'upcoming': return 'Yaklaşan';
      default: return 'Gelecek';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <AppLayout>
      <Topbar />
  <main style={{ padding: "16px 16px 0 16px", display: "flex", flexDirection: "column", minHeight: "100vh", background: "#e3eafc" }}>
          <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: "20px", borderRadius: "8px" }}>
      {/* Header */}
      <div style={{ 
        background: "#1a237e", 
        color: "white", 
        padding: "16px 32px",
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
          🔄 Geri Dönüşler
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ 
        background: "white", 
        borderRadius: "8px", 
        marginBottom: "20px",
        border: "1px solid #e1e5e9"
      }}>
        <div style={{ 
          display: "flex", 
          borderBottom: "1px solid #e1e5e9" 
        }}>
          <button
            onClick={() => handleTabChange('pending')}
            style={{
              padding: "12px 24px",
              border: "none",
              background: activeTab === 'pending' ? "#1a237e" : "transparent",
              color: activeTab === 'pending' ? "white" : "#666",
              cursor: "pointer",
              fontWeight: activeTab === 'pending' ? "600" : "normal",
              borderRadius: activeTab === 'pending' ? "8px 0 0 0" : "0"
            }}
          >
            ⏰ Bekleyen Geri Dönüşler ({pendingFeedbacks.reduce((total, patient) => total + patient.feedback_items.length, 0)})
          </button>
          <button
            onClick={() => handleTabChange('history')}
            style={{
              padding: "12px 24px",
              border: "none",
              background: activeTab === 'history' ? "#1a237e" : "transparent",
              color: activeTab === 'history' ? "white" : "#666",
              cursor: "pointer",
              fontWeight: activeTab === 'history' ? "600" : "normal"
            }}
          >
            📋 Geri Dönüş Geçmişi
          </button>
        </div>

        {activeTab === 'pending' && (
          <div style={{ padding: "20px" }}>
            {pendingFeedbacks.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#666" 
              }}>
                <p>Bekleyen geri dönüş bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gap: "20px" 
              }}>
                {pendingFeedbacks.map((patient, index) => {
                  // En yakın feedback'in durumunu belirle
                  const earliestFeedback = patient.feedback_items.reduce((earliest, current) => 
                    new Date(current.planned_date) < new Date(earliest.planned_date) ? current : earliest
                  );
                  
                  return (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e1e5e9",
                        borderRadius: "8px",
                        padding: "20px",
                        background: "#fff",
                        borderLeft: `4px solid ${getStatusColor(earliestFeedback.status)}`
                      }}
                    >
                      {/* Hasta Bilgileri */}
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "flex-start",
                        marginBottom: "16px"
                      }}>
                        <div>
                          <h3 style={{ 
                            margin: "0 0 8px 0", 
                            color: "#2c3e50",
                            fontSize: "20px"
                          }}>
                            👤 {patient.patient_name}
                          </h3>
                          <p style={{ 
                            margin: "0 0 4px 0", 
                            color: "#666",
                            fontSize: "14px"
                          }}>
                            📞 {patient.phone}
                          </p>
                        </div>
                        <span style={{
                          background: getStatusColor(earliestFeedback.status),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          En Yakın: {getStatusText(earliestFeedback.status)}
                        </span>
                      </div>
                      
                      {/* Geri Dönüş Listesi */}
                      <div style={{ 
                        background: "#f8f9fa",
                        borderRadius: "6px",
                        padding: "16px",
                        marginBottom: "16px"
                      }}>
                        <h4 style={{ 
                          margin: "0 0 12px 0",
                          color: "#495057",
                          fontSize: "16px"
                        }}>
                          Bekleyen Kontroller:
                        </h4>
                        <div style={{ 
                          display: "grid",
                          gap: "8px"
                        }}>
                          {patient.feedback_items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                                background: "white",
                                borderRadius: "4px",
                                border: `1px solid ${getStatusColor(item.status)}20`
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  fontWeight: "500",
                                  color: "#2c3e50",
                                  marginBottom: "4px"
                                }}>
                                  🦷 {item.treatment_name} - {item.interval_display}
                                </div>
                                <div style={{ 
                                  fontSize: "13px",
                                  color: "#666"
                                }}>
                                  📅 {formatDate(item.planned_date)}
                                  {item.days_until_due <= 0 && (
                                    <span style={{ 
                                      color: "#dc3545",
                                      fontWeight: "600",
                                      marginLeft: "8px"
                                    }}>
                                      ({Math.abs(Math.floor(item.days_until_due))} gün geçmiş)
                                    </span>
                                  )}
                                  {item.days_until_due > 0 && item.days_until_due <= 3 && (
                                    <span style={{ 
                                      color: "#fd7e14",
                                      fontWeight: "600",
                                      marginLeft: "8px"
                                    }}>
                                      ({Math.floor(item.days_until_due)} gün kaldı)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setSelectedFeedbackItem(item);
                                  setShowModal(true);
                                }}
                                style={{
                                  background: getStatusColor(item.status),
                                  color: "white",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                  marginLeft: "12px"
                                }}
                              >
                                Kaydet
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
      <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
        <input
                type="text"
                placeholder="Hasta adı, soyadı veya telefon ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
          width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginRight: "12px"
                }}
              />
              <button
                onClick={loadFeedbackHistory}
                style={{
                  background: "#1a237e",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Ara
              </button>
            </div>

            {feedbackHistory.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#666" 
              }}>
                <p>Geri dönüş geçmişi bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid-auto-cards" style={{ gap: "16px" }}>
                {feedbackHistory.map((patient) => (
                  <PatientHistoryCard key={patient.patient_id} patient={patient} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPatient && selectedFeedbackItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            width: "500px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h2 style={{ marginTop: 0, color: "#1a237e" }}>
              Geri Dönüş Kaydet
            </h2>
            
            <div style={{ marginBottom: "16px" }}>
              <strong>Hasta:</strong> {selectedPatient.patient_name}<br/>
              <strong>Telefon:</strong> {selectedPatient.phone}<br/>
              <strong>Tedavi:</strong> {selectedFeedbackItem.treatment_name}<br/>
              <strong>Kontrol Türü:</strong> {selectedFeedbackItem.interval_display}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600" 
              }}>
                Geri Dönüş Notları:
              </label>
              <textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Hastanın durumu, şikayetleri, öneriler..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px"
            }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFeedbackNotes("");
                  setSelectedPatient(null);
                  setSelectedFeedbackItem(null);
                }}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateFeedback}
                style={{
                  background: "#1a237e",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
    </main>
  </AppLayout>
  );
}

// Hasta geçmişi kartı komponenti
function PatientHistoryCard({ patient }: { patient: FeedbackHistory }) {
  const [selectedInterval, setSelectedInterval] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFeedbacks = selectedInterval === 'all' 
    ? patient.feedback_items 
    : patient.feedback_items.filter(item => item.interval === selectedInterval);

  const intervalOptions = [
    { value: 'all', label: 'Tümü' },
    { value: '1_week', label: '1 Hafta' },
    { value: '1_month', label: '1 Ay' },
    { value: '3_months', label: '3 Ay' },
    { value: '6_months', label: '6 Ay' }
  ];

  return (
    <div style={{
      border: "1px solid #e1e5e9",
      borderRadius: "8px",
      background: "#fff",
      overflow: "hidden"
    }}>
      {/* Hasta Başlığı */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: "#f8f9fa",
          padding: "16px",
          borderBottom: isExpanded ? "1px solid #e1e5e9" : "none",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = "#e9ecef"}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "#f8f9fa"}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: isExpanded ? "12px" : "0"
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: "0 0 4px 0", 
              color: "#2c3e50",
              fontSize: "18px"
            }}>
              {patient.patient_name}
            </h3>
            <p style={{ 
              margin: "0", 
              color: "#666",
              fontSize: "14px"
            }}>
              📞 {patient.phone} | 📊 {patient.total_feedbacks} geri dönüş
            </p>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              fontSize: "12px",
              color: "#666",
              textAlign: "right"
            }}>
              Son geri dönüş:<br/>
              {formatDate(patient.last_feedback_date)}
            </div>
            <div style={{
              fontSize: "20px",
              color: "#666",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease"
            }}>
              ▼
            </div>
          </div>
        </div>

        {/* Interval Filtresi - sadece açık olduğunda göster */}
        {isExpanded && (
          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            {intervalOptions.map(option => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation(); // Parent'ın onClick'ini engelle
                  setSelectedInterval(option.value);
                }}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "20px",
                  background: selectedInterval === option.value ? "#1a237e" : "#fff",
                  color: selectedInterval === option.value ? "#fff" : "#666",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "all 0.2s"
                }}
              >
                {option.label} 
                {option.value !== 'all' && ` (${patient.feedback_items.filter(item => item.interval === option.value).length})`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Geri Dönüş Listesi - sadece açık olduğunda göster */}
      {isExpanded && (
        <div style={{ padding: "16px" }}>
        {filteredFeedbacks.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "20px", 
            color: "#666",
            fontSize: "14px"
          }}>
            {selectedInterval === 'all' 
              ? 'Bu hasta için geri dönüş kaydı bulunmuyor.' 
              : 'Seçilen interval için geri dönüş kaydı bulunmuyor.'}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {filteredFeedbacks.map(feedback => (
              <div
                key={feedback.feedback_id}
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                  padding: "12px",
                  background: "#fafafa"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start",
                  marginBottom: "8px"
                }}>
                  <div>
                    <span style={{
                      background: "#1a237e",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold"
                    }}>
                      {feedback.interval_display}
                    </span>
                    <p style={{ 
                      margin: "6px 0 0 0", 
                      color: "#666",
                      fontSize: "13px"
                    }}>
                      🦷 {feedback.treatment_name}
                    </p>
                  </div>
                  <div style={{ 
                    textAlign: "right",
                    fontSize: "12px",
                    color: "#999"
                  }}>
                    {formatDate(feedback.feedback_date)}
                  </div>
                </div>
                
                {feedback.notes && (
                  <div style={{
                    background: "#fff",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #eee",
                    fontSize: "13px",
                    color: "#555"
                  }}>
                    <strong>Not:</strong> {feedback.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
