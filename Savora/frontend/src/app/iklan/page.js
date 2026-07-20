"use client";

// Rute lama /iklan mengandung kata "iklan" yang diblokir oleh sebagian besar
// ad blocker (uBlock Origin, AdBlock, Brave Shields) sehingga chunk JS-nya
// gagal dimuat (net::ERR_BLOCKED_BY_CLIENT -> ChunkLoadError). Halaman asli
// dipindah ke /promosi (kata netral). Rute ini dipertahankan sebagai redirect
// agar tautan/bookmark lama tetap berfungsi.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IklanRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/promosi");
  }, [router]);

  return (
    <div style={{ padding: "40px", color: "#6B7280" }}>
      Mengalihkan ke halaman Promosi...
    </div>
  );
}
