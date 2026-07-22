"use client";

// Halaman Insight kini digabung ke /analitik (menu "Analitik & Insight").
// Rute lama /insight tetap dipertahankan agar tautan lama tidak rusak:
// user diarahkan otomatis ke /analitik dengan section Insight aktif.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InsightRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analitik?section=insight");
  }, [router]);

  return (
    <div style={{ padding: "40px", color: "#6B7280" }}>
      Mengalihkan ke Analitik &amp; Insight...
    </div>
  );
}
