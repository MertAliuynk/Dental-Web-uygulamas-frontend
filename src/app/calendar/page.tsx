'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from "../components/AppLayout";
import Topbar from "../components/Topbar";

// Ana sayfadaki MiniAppointmentCalendar ile aynı import pattern'i kullan
const FullAppointmentCalendar = dynamic(
  () => import('../components/FullAppointmentCalendar'), 
  { 
    ssr: false,
    loading: () => <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>Takvim yükleniyor...</div>
  }
);

export default function CalendarPage() {
  return (
    <AppLayout>
      <Topbar />
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Yükleniyor...</div>}>
        <FullAppointmentCalendar />
      </Suspense>
    </AppLayout>
  );
}
