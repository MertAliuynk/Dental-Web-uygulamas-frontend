"use client";
export const dynamic = "force-dynamic";
import AppLayout from "../../components/AppLayout";
import Topbar from "../../components/Topbar";
import PatientCardPageClient from "./PatientCardPageClient";
import { Suspense } from "react";

export default function PatientCardPage() {
  return (
    <AppLayout>
      <Topbar />
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <PatientCardPageClient />
      </Suspense>
    </AppLayout>
  );
}
