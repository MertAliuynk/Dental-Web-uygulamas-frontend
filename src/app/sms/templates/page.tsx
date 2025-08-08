"use client";
import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar";
import AppLayout from "../../components/AppLayout";

interface SmsTemplate {
  template_id: number;
  name: string;
  content: string;
  created_at: string;
}

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [formData, setFormData] = useState({ name: "", content: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sms/templates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("SMS şablonları yüklenemedi:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingTemplate 
        ? `/api/sms/templates/${editingTemplate.template_id}`
        : "/api/sms/templates";
      
      const response = await fetch(url, {
        method: editingTemplate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingTemplate ? "Şablon güncellendi!" : "Şablon oluşturuldu!");
        setShowModal(false);
        setEditingTemplate(null);
        setFormData({ name: "", content: "" });
        fetchTemplates();
      } else {
        alert("İşlem başarısız!");
      }
    } catch (error) {
      console.error("Şablon kaydetme hatası:", error);
      alert("Bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: SmsTemplate) => {
    setEditingTemplate(template);
    setFormData({ name: template.name, content: template.content });
    setShowModal(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm("Bu şablonu silmek istediğinizden emin misiniz?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sms/templates/${templateId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert("Şablon silindi!");
        fetchTemplates();
      } else {
        alert("Şablon silinemedi!");
      }
    } catch (error) {
      console.error("Şablon silme hatası:", error);
      alert("Bir hata oluştu!");
    }
  };

  const openNewTemplateModal = () => {
    setEditingTemplate(null);
    setFormData({ name: "", content: "" });
    setShowModal(true);
  };

  return (
    <AppLayout>
      <Topbar />
      <div style={{ padding: 24 }}>
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
              SMS Şablonları
            </h1>
            <button
              onClick={openNewTemplateModal}
              style={{
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = "#0052a3"}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = "#0066cc"}
            >
              + Yeni Şablon Ekle
            </button>
          </div>

          {templates.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>Henüz SMS şablonu yok</h3>
              <p style={{ margin: 0 }}>İlk SMS şablonunuzu oluşturmak için "Yeni Şablon Ekle" butonuna tıklayın.</p>
            </div>
          ) : (
            <div className="grid-auto-cards" style={{ gap: 20 }}>
              {templates.map(template => (
                <div
                  key={template.template_id}
                  style={{
                    border: "1px solid #e1e5e9",
                    borderRadius: 12,
                    padding: 20,
                    background: "#fafbfc",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(-2px)";
                    (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#1a1a1a",
                      flex: 1
                    }}>
                      {template.name}
                    </h3>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleEdit(template)}
                        style={{
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(template.template_id)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 10px",
                          fontSize: 12,
                          cursor: "pointer"
                        }}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    background: "white",
                    border: "1px solid #e1e5e9",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    minHeight: 80,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#333"
                  }}>
                    {template.content}
                  </div>
                  
                  <div style={{
                    fontSize: 12,
                    color: "#666",
                    textAlign: "right"
                  }}>
                    {new Date(template.created_at).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            width: "90%",
            maxWidth: 500,
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: 24, fontWeight: 600 }}>
              {editingTemplate ? "Şablon Düzenle" : "Yeni Şablon Ekle"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "#333"
                }}>
                  Şablon Adı:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Randevu Hatırlatması"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e1e5e9",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "#333"
                }}>
                  Şablon İçeriği:
                </label>
                
                {/* Dinamik Değişken Butonları */}
                <div style={{
                  marginBottom: 12,
                  padding: "12px",
                  background: "#f8f9fa",
                  borderRadius: 8,
                  border: "1px solid #e1e5e9"
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#495057",
                    marginBottom: 8
                  }}>
                    Dinamik Değişkenler Ekle:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{HASTA_ADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Hasta Adı
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{HASTA_SOYADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Hasta Soyadı
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{HASTA_TAM_ADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Tam Adı
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{TELEFON}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#ffc107",
                        color: "#212529",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Telefon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{TARIH}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#6f42c1",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Tarih
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{SAAT}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#20c997",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Saat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{KLINIK_ADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Klinik Adı
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{RANDEVU_TARIHI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#fd7e14",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Randevu Tarihi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{DOKTOR_ADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Doktor Adı
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{RANDEVU_SAATI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#e83e8c",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Randevu Saati
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newContent = formData.content + "{SUBE_ADI}";
                        setFormData({ ...formData, content: newContent });
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#795548",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Şube Adı
                    </button>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "#6c757d",
                    marginTop: 8,
                    fontStyle: "italic"
                  }}>
                    💡 Bu değişkenler SMS gönderilirken otomatik olarak gerçek verilerle değiştirilecektir.<br/>
                    📝 Örnek: "Sayın {`{HASTA_ADI}`}, {`{RANDEVU_TARIHI}`} {`{RANDEVU_SAATI}`} randevunuz için {`{DOKTOR_ADI}`} tarafından bekleniyorsunuz."<br/>
                    📍 <strong>{`{TARIH}`}</strong> = Bugünün tarihi, <strong>{`{RANDEVU_TARIHI}`}</strong> = Gerçek randevu tarihi
                  </div>
                </div>
                
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="SMS içeriğinizi buraya yazın... Örnek: Merhaba {HASTA_ADI}, randevunuz {TARIH} tarihindedir."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e1e5e9",
                    borderRadius: 8,
                    fontSize: 16,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                  required
                />
                <div style={{
                  fontSize: 12,
                  color: "#666",
                  marginTop: 4,
                  textAlign: "right"
                }}>
                  {formData.content.length} karakter
                </div>
              </div>
              
              <div style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end"
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "2px solid #e1e5e9",
                    background: "white",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: "pointer"
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    background: loading ? "#ccc" : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Kaydediliyor..." : editingTemplate ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
