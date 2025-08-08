"use client";
export const dynamic = "force-dynamic";
import NewPatientPageClient from "./NewPatientPageClient";
import AppLayout from "../../components/AppLayout";

export default function NewPatientPage() {
  return (
    <AppLayout>
      <NewPatientPageClient />
    </AppLayout>
  );
}
