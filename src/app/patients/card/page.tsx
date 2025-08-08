


"use client";
export const dynamic = "force-dynamic";
import AppLayout from "../../components/AppLayout";
import Topbar from "../../components/Topbar";
import PatientCardPageClient from "./PatientCardPageClient";

export default function PatientCardPage() {
  return (
    <AppLayout>
      <Topbar />
      <PatientCardPageClient />
    </AppLayout>
  );
}
