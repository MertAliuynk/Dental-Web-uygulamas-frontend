"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../../components/AppLayout";
import Topbar from "../../../components/Topbar";
import TeethSvg from "../../../components/TeethSvg";
import MilkTeethSvg from "../../../components/MilkTeethSvg";

// Minimal types from backend shape
type TreatmentType = {
  treatment_type_id: number;
  name: string;
  category?: string;
  is_per_tooth?: boolean;
  is_jaw_specific?: boolean;
};

type Patient = {
  patient_id: number;
  first_name: string;
  last_name: string;
  tc_number?: string;
  phone?: string;
  doctor_id?: number;
};

type PendingItem = {
  treatmentTypeId: number;
  treatmentName: string;
  toothNumbers: number[];
  isUpperJaw: boolean;
  isLowerJaw: boolean;
  notes?: string;
  price?: number | null;
  priceDetails?: string | null;
};

export default function TreatmentAddPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(
    null
  );
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [toothType, setToothType] = useState<"sürekli" | "süt">("sürekli");
  const [isUpperJawSelected, setIsUpperJawSelected] = useState(false);
  const [isLowerJawSelected, setIsLowerJawSelected] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [role, setRole] = useState<string>("");
  const [branchId, setBranchId] = useState<number>(1);
  const [priceMap, setPriceMap] = useState<Record<number, { base: number; upper: number; lower: number; isPerTooth: boolean; isJawSpecific: boolean }>>({});
  // To force-remount the SVG and clear visual selections after adding
  const [svgResetKey, setSvgResetKey] = useState(0);

  const categories = useMemo(
    () => Array.from(new Set(treatmentTypes.map((t) => t.category).filter(Boolean))) as string[],
    [treatmentTypes]
  );
  const filteredTreatments = useMemo(
    () =>
      selectedCategory
        ? treatmentTypes.filter((t) => t.category === selectedCategory)
        : treatmentTypes,
    [treatmentTypes, selectedCategory]
  );

  useEffect(() => {
    const init = async () => {
      try {
        try {
          setRole(localStorage.getItem("role") || "");
          const userData = localStorage.getItem("user");
          const authData = localStorage.getItem("auth");
          const sessionData = sessionStorage.getItem("user");
          const getB = (o: any) => o?.branchId || o?.branch_id || o?.branchID;
          let b = 1;
          if (userData) b = getB(JSON.parse(userData)) || b;
          if (!b && authData) b = getB(JSON.parse(authData)) || b;
          if (!b && sessionData) b = getB(JSON.parse(sessionData)) || b;
          setBranchId(b || 1);
        } catch {}

        const [pRes, ttRes] = await Promise.all([
          patientId
            ? fetch(`https://dentalapi.karadenizdis.com/api/patient/${patientId}`)
            : Promise.resolve(null),
          fetch(`https://dentalapi.karadenizdis.com/api/treatment-type`),
        ]);
        if (pRes) {
          const pj = await pRes.json();
          if (pj?.success) setPatient(pj.data as Patient);
        }
        const tj = await ttRes.json();
        if (tj?.success) setTreatmentTypes((tj.data || []) as TreatmentType[]);
      } catch (e) {
        setError("Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [patientId]);

  const handleUpperJaw = () => {
    if (isUpperJawSelected) {
      setIsUpperJawSelected(false);
      setSelectedTeeth([]);
      return;
    }
    setIsUpperJawSelected(true);
    setIsLowerJawSelected(false);
    if (toothType === "sürekli") {
      const ids: string[] = [];
      for (let i = 16; i >= 1; i--) ids.push(`Tooth${i}_1_`);
      setSelectedTeeth(ids);
    } else {
      const ids: string[] = [];
      for (let i = 51; i <= 55; i++) ids.push(`milk-tooth-${i}`);
      for (let i = 61; i <= 65; i++) ids.push(`milk-tooth-${i}`);
      setSelectedTeeth(ids);
    }
  };

  const handleLowerJaw = () => {
    if (isLowerJawSelected) {
      setIsLowerJawSelected(false);
      setSelectedTeeth([]);
      return;
    }
    setIsLowerJawSelected(true);
    setIsUpperJawSelected(false);
    if (toothType === "sürekli") {
      const ids: string[] = [];
      for (let i = 32; i >= 17; i--) ids.push(`Tooth${i}_1_`);
      setSelectedTeeth(ids);
    } else {
      const ids: string[] = [];
      for (let i = 71; i <= 75; i++) ids.push(`milk-tooth-${i}`);
      for (let i = 81; i <= 85; i++) ids.push(`milk-tooth-${i}`);
      setSelectedTeeth(ids);
    }
  };

  const parseToothNumbers = (ids: string[]): number[] =>
    ids
      .map((t) => {
        // Support raw numeric labels (e.g., "11") from TeethSvg
        if (/^\d+$/.test(t)) return parseInt(t, 10);
        const m = t.match(/Tooth(\d+)_/);
        if (m) return parseInt(m[1]);
        const m2 = t.match(/milk-tooth-(\d+)/);
        return m2 ? parseInt(m2[1]) : 0;
      })
      .filter((n) => n > 0);

  const handleAddToList = () => {
    if (!selectedTreatment) {
      alert("Lütfen bir tedavi seçin");
      return;
    }
    if (selectedTreatment.is_per_tooth && selectedTeeth.length === 0) {
      alert("Lütfen tedavi yapılacak dişleri seçin");
      return;
    }

    const item: PendingItem = {
      treatmentTypeId: selectedTreatment.treatment_type_id,
      treatmentName: selectedTreatment.name,
      toothNumbers: parseToothNumbers(selectedTeeth),
      isUpperJaw: isUpperJawSelected,
      isLowerJaw: isLowerJawSelected,
      notes,
    };
    setPending((p) => [...p, item]);

    setSelectedTreatment(null);
    setSelectedTeeth([]);
    setIsUpperJawSelected(false);
    setIsLowerJawSelected(false);
    setNotes("");
  // Force remount SVG to clear any red fills/selection in the chart
  setSvgResetKey((k) => k + 1);
  };

  const handleSuggestAll = async () => {
    if (!patient) {
      alert("Hasta bulunamadı");
      return;
    }
    if (pending.length === 0) {
      alert("Lütfen en az bir tedavi ekleyin");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      for (const it of pending) {
        const body = {
          patientId: patient.patient_id,
          treatmentTypeId: it.treatmentTypeId,
          doctorId: patient.doctor_id,
          status: "önerilen",
          toothCount: it.toothNumbers?.length || 1,
          toothNumbers: it.toothNumbers,
          isLowerJaw: it.isLowerJaw,
          isUpperJaw: it.isUpperJaw,
          notes: it.notes || "",
        };
  const res = await fetch("https://dentalapi.karadenizdis.com/api/treatment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
        const j = await res.json();
        if (!res.ok || !j?.success) throw new Error(j?.message || "Hata");
      }
      alert("Tüm tedaviler önerildi");
      setPending([]);
      // Redirect to patient card after suggesting
      if (patient?.patient_id) {
        window.location.href = `/patients/card?id=${patient.patient_id}`;
      }
    } catch (e: any) {
      alert(e?.message || "Tedavi önerilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Fiyat listesi: aktif listeyi şubeye göre çek ve map oluştur
  useEffect(() => {
    const loadPrices = async () => {
      try {
        if (!branchId) return;
  const res = await fetch(`https://dentalapi.karadenizdis.com/api/price-list?branch_id=${branchId}&active_only=true`);
        const data = await res.json();
        if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
          setPriceMap({});
          return;
        }
        const active = data.data[0];
  const res2 = await fetch(`https://dentalapi.karadenizdis.com/api/price-list/${active.price_list_id}`);
        const data2 = await res2.json();
        if (!data2.success) { setPriceMap({}); return; }
        const items = data2.data.items || [];
        const map: Record<number, any> = {};
        for (const it of items) {
          const tt = (treatmentTypes || []).find(t => t.treatment_type_id === it.treatment_type_id);
          map[it.treatment_type_id] = {
            base: Number(it.base_price) || 0,
            upper: Number(it.upper_jaw_price) || 0,
            lower: Number(it.lower_jaw_price) || 0,
            isPerTooth: !!tt?.is_per_tooth,
            isJawSpecific: !!tt?.is_jaw_specific,
          };
        }
        setPriceMap(map);
      } catch (e) {
        setPriceMap({});
      }
    };
    loadPrices();
  }, [branchId, treatmentTypes]);

  const showTotals = role !== 'doctor' && role !== 'receptionist';

  const getUnitPrice = (treatmentTypeId: number, isUpper: boolean, isLower: boolean) => {
    const pm = priceMap[treatmentTypeId];
    if (!pm) return 0;
    if (pm.isJawSpecific) {
      if (isUpper && !isLower) return pm.upper || pm.base;
      if (isLower && !isUpper) return pm.lower || pm.base;
      // if both or none, fallback to base
      return pm.base;
    }
    return pm.base;
  };

  const getLineTotal = (it: PendingItem) => {
    const pm = priceMap[it.treatmentTypeId];
    if (!pm) return 0;
    if (pm.isJawSpecific) {
      // Charge once per jaw regardless of tooth count
  const isUpperFDI = (n: number) => (n >= 11 && n <= 18) || (n >= 21 && n <= 28) || (n >= 51 && n <= 55) || (n >= 61 && n <= 65);
  const isLowerFDI = (n: number) => (n >= 31 && n <= 38) || (n >= 41 && n <= 48) || (n >= 71 && n <= 75) || (n >= 81 && n <= 85);
  const isUpperSeq = (n: number) => n >= 1 && n <= 16;
  const isLowerSeq = (n: number) => n >= 17 && n <= 32;
  const isUpper = (n: number) => isUpperFDI(n) || isUpperSeq(n);
  const isLower = (n: number) => isLowerFDI(n) || isLowerSeq(n);
  const hasUpper = it.isUpperJaw || (it.toothNumbers?.some((n) => isUpper(n)) || false);
  const hasLower = it.isLowerJaw || (it.toothNumbers?.some((n) => isLower(n)) || false);
      let total = 0;
      if (hasUpper) total += (pm.upper || pm.base);
      if (hasLower) total += (pm.lower || pm.base);
      if (!hasUpper && !hasLower) total += pm.base; // fallback
      return total;
    }
    // Not jaw-specific: per-tooth applies when flagged
    const unit = pm.base;
    const qty = pm.isPerTooth ? (it.toothNumbers?.length || 1) : 1;
    return unit * qty;
  };

  const overallTotal = pending.reduce((sum, it) => sum + getLineTotal(it), 0);

  return (
    <AppLayout>
      <Topbar />
      <main style={{ flex: 1, padding: 24 }}>
        {patient && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: 16,
              marginBottom: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontWeight: 700, color: "#0a2972" }}>
              {patient.first_name} {patient.last_name}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              TC: {patient.tc_number || "-"} • Tel: {patient.phone || "-"}
            </div>
          </div>
        )}

        <h2 style={{ color: "#0a2972", fontWeight: 800, marginBottom: 16 }}>
          Tedavi Ekle
        </h2>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div
            style={{
              flex: "1 1 280px",
              minWidth: 0,
              maxWidth: 420,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: "#0a2972" }}>
                Kategori
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(cat === selectedCategory ? "" : cat)
                    }
                    style={{
                      background:
                        selectedCategory === cat ? "#1976d2" : "#e3eafc",
                      color: selectedCategory === cat ? "#fff" : "#1976d2",
                      border: "1px solid #b6c6e6",
                      borderRadius: 10,
                      padding: "6px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: "#0a2972" }}>
                Tedavi
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflow: "auto" }}>
                {filteredTreatments.map((t) => (
                  <button
                    key={t.treatment_type_id}
                    onClick={() => setSelectedTreatment(t)}
                    style={{
                      background:
                        selectedTreatment?.treatment_type_id ===
                        t.treatment_type_id
                          ? "#1976d2"
                          : "#e3eafc",
                      color:
                        selectedTreatment?.treatment_type_id ===
                        t.treatment_type_id
                          ? "#fff"
                          : "#1976d2",
                      border: "1px solid #b6c6e6",
                      borderRadius: 10,
                      padding: "6px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {t.name}
                    {t.is_per_tooth && (
                      <small style={{ marginLeft: 6, opacity: 0.8 }}>
                        (Diş bazlı)
                      </small>
                    )}
                    {t.is_jaw_specific && (
                      <small style={{ marginLeft: 6, opacity: 0.8 }}>
                        (Çene bazlı)
                      </small>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: "#0a2972" }}>
                Not (opsiyonel)
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tedavi ile ilgili notlar..."
                style={{
                  width: "100%",
                  height: 80,
                  border: "1px solid #b6c6e6",
                  borderRadius: 10,
                  padding: 10,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={handleAddToList}
              disabled={!selectedTreatment || (selectedTreatment?.is_per_tooth && selectedTeeth.length === 0)}
              style={{
                background:
                  !selectedTreatment ||
                  (selectedTreatment?.is_per_tooth && selectedTeeth.length === 0)
                    ? "#ccc"
                    : "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 700,
                cursor:
                  !selectedTreatment ||
                  (selectedTreatment?.is_per_tooth && selectedTeeth.length === 0)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Listeye Ekle
            </button>
          </div>

          <div
            style={{
              flex: "1.2 1 300px",
              minWidth: 0,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleUpperJaw}
                style={{
                  background: isUpperJawSelected ? "#1976d2" : "#e3eafc",
                  color: isUpperJawSelected ? "#fff" : "#1976d2",
                  border: "1px solid #b6c6e6",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontWeight: 600,
                }}
              >
                Üst Çene
              </button>
              <button
                onClick={handleLowerJaw}
                style={{
                  background: isLowerJawSelected ? "#1976d2" : "#e3eafc",
                  color: isLowerJawSelected ? "#fff" : "#1976d2",
                  border: "1px solid #b6c6e6",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontWeight: 600,
                }}
              >
                Alt Çene
              </button>
              <button
                onClick={() => setToothType("sürekli")}
                style={{
                  background: toothType === "sürekli" ? "#1976d2" : "#e3eafc",
                  color: toothType === "sürekli" ? "#fff" : "#1976d2",
                  border: "1px solid #b6c6e6",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontWeight: 600,
                }}
              >
                Sürekli Dişler
              </button>
              <button
                onClick={() => setToothType("süt")}
                style={{
                  background: toothType === "süt" ? "#1976d2" : "#e3eafc",
                  color: toothType === "süt" ? "#fff" : "#1976d2",
                  border: "1px solid #b6c6e6",
                  borderRadius: 10,
                  padding: "6px 12px",
                  fontWeight: 600,
                }}
              >
                Süt Dişleri
              </button>
            </div>

            <div style={{ width: "100%", minHeight: 320, background: "#f2f2f2", borderRadius: 10, padding: 10 }}>
              {toothType === "sürekli" ? (
                <TeethSvg
                  key={`svg-${toothType}-${svgResetKey}`}
                  onSelect={(ids) => setSelectedTeeth(ids)}
                  onIndividualSelect={() => {
                    setIsUpperJawSelected(false);
                    setIsLowerJawSelected(false);
                  }}
                />
              ) : (
                <MilkTeethSvg
                  key={`svg-${toothType}-${svgResetKey}`}
                  onSelect={(ids: string[]) => setSelectedTeeth(ids)}
                  onIndividualSelect={() => {
                    setIsUpperJawSelected(false);
                    setIsLowerJawSelected(false);
                  }}
                />
              )}
            </div>

            <div style={{ color: "#0a2972", fontWeight: 600 }}>
              Seçili Dişler: {selectedTeeth.length === 0 ? "Yok" : selectedTeeth.join(", ")}
            </div>
          </div>
        </div>

        {pending.length > 0 && (
          <div
            style={{
              marginTop: 16,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px #0001",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 800, color: "#0a2972", marginBottom: 8 }}>
              Eklenen Tedaviler ({pending.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pending.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "8px 10px",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <b>{it.treatmentName}</b>
                    {it.toothNumbers?.length > 0 && (
                      <span>Dişler: {it.toothNumbers.join(", ")}</span>
                    )}
                    {it.isUpperJaw && <span>Üst çene</span>}
                    {it.isLowerJaw && <span>Alt çene</span>}
                    {it.notes && <span>• {it.notes}</span>}
                  </div>
          {showTotals && (
                    <div style={{ fontWeight: 700, color: "#0a2972" }}>
            {priceMap[it.treatmentTypeId]?.isPerTooth && !priceMap[it.treatmentTypeId]?.isJawSpecific && (
                        <span style={{ marginRight: 8 }}>x{it.toothNumbers?.length || 1}</span>
                      )}
                      ₺{getLineTotal(it).toLocaleString('tr-TR')}
                    </div>
                  )}
                  <button
                    onClick={() => setPending((p) => p.filter((_, i) => i !== idx))}
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
            {showTotals && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontWeight: 800, color: '#0a2972' }}>
                Toplam: ₺{overallTotal.toLocaleString('tr-TR')}
              </div>
            )}
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <button
                onClick={handleSuggestAll}
                disabled={loading || !patient}
                style={{
                  background: "#388e3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontWeight: 800,
                  cursor: loading || !patient ? "not-allowed" : "pointer",
                }}
              >
                Tedavileri Öner
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ color: "#1976d2", marginTop: 12 }}>Yükleniyor...</div>
        )}
        {error && <div style={{ color: "#e53935", marginTop: 12 }}>{error}</div>}
      </main>
    </AppLayout>
  );
}
