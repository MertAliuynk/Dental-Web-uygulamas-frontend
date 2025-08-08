"use client";
export const dynamic = "force-dynamic";

import NewPatientPageClient from "./NewPatientPageClient";
import AppLayout from "../../components/AppLayout";
import { Suspense } from "react";

export default function NewPatientPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <NewPatientPageClient />
      </Suspense>
    </AppLayout>
  );
}
