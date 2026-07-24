"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/templates/DashboardLayout";
import DataTable from "@/components/organisms/DataTable";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export default function KelolaUMKMPage() {
  const router = useRouter();
  const [umkmList, setUmkmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVerification, setFilterVerification] = useState("");

  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedUMKM, setSelectedUMKM] = useState(null);
  const [actionType, setActionType] = useState(""); // "suspend", "activate", "revoke_verification"
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUMKMList();
  }, []);

  async function fetchUMKMList() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterCategory) params.append("category", filterCategory);
      if (filterStatus) params.append("status", filterStatus);
      if (filterVerification) params.append("verification_status", filterVerification);

      const response = await fetch(`${API_BASE}/admin/umkm?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();

      if (data.success) {
        setUmkmList(data.data.umkm_list || []);
      } else {
        setError(data.error?.message || "Gagal memuat data UMKM");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchUMKMList();
  }

  function handleResetFilter() {
    setSearchTerm("");
    setFilterCategory("");
    setFilterStatus("");
    setFilterVerification("");
    fetchUMKMList();
  }

  function openViewDialog(umkm) {
    setSelectedUMKM(umkm);
    setViewDialog(true);
  }

  function closeViewDialog() {
    setViewDialog(false);
    setSelectedUMKM(null);
  }

  function openActionDialog(umkm, action) {
    setSelectedUMKM(umkm);
    setActionType(action);
    setNote("");
    setActionDialog(true);
  }

  function closeActionDialog() {
    setActionDialog(false);
    setSelectedUMKM(null);
    setActionType("");
    setNote("");
  }

  async function handleSubmitAction() {
    if (!note.trim()) {
      alert("Catatan wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      let endpoint, method, body;

      if (actionType === "revoke_verification") {
        // Revoke verification
        endpoint = `${API_BASE}/admin/umkm/${selectedUMKM.id}/verification`;
        method = "PATCH";
        body = { status: "REJECTED", note };
      } else {
        // Status change (suspend/activate)
        endpoint = `${API_BASE}/admin/users/${selectedUMKM.user_id}/status`;
        method = "PATCH";
        body = { action: actionType, note };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (data.success) {
        if (actionType === "revoke_verification") {
          alert("Verifikasi UMKM berhasil dicabut");
        } else {
          alert(
            actionType === "suspend"
              ? "UMKM berhasil dinonaktifkan"
              : "UMKM berhasil diaktifkan"
          );
        }
        closeActionDialog();
        fetchUMKMList();
      } else {
        alert(data.error?.message || "Gagal mengubah status UMKM");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  function getVerificationBadge(status) {
    const variants = {
      APPROVED: { variant: "success", label: "Terverifikasi" },
      PENDING: { variant: "warning", label: "Menunggu" },
      REJECTED: { variant: "danger", label: "Ditolak" },
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getStatusBadge(status) {
    const variants = {
      ACTIVE: { variant: "success", label: "Aktif" },
      SUSPENDED: { variant: "danger", label: "Nonaktif" },
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getSafetyBadge(level) {
    const variants = {
      AMAN: { variant: "success", label: "Aman" },
      WARNING: { variant: "warning", label: "Warning" },
      GAWAT: { variant: "danger", label: "Gawat" },
    };
    const config = variants[level] || { variant: "default", label: level || "-" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // Filter UMKM by search term (client-side)
  const filteredUMKM = umkmList.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.business_name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.category?.toLowerCase().includes(searchLower)
    );
  });

  // Table columns (per spec §6.1: nama+kategori, status, verification_status, jumlah produk, orders completed, rating)
  const columns = [
    {
      header: "UMKM",
      render: (umkm) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
            {umkm.business_name || "-"}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {umkm.category || "Tidak dikategorikan"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (umkm) => getStatusBadge(umkm.status),
    },
    {
      header: "Verifikasi",
      render: (umkm) => getVerificationBadge(umkm.verification_status),
    },
    {
      header: "Produk",
      render: (umkm) => umkm.total_products || 0,
    },
    {
      header: "Orders",
      render: (umkm) => umkm.orders_completed || 0,
    },
    {
      header: "Rating",
      render: (umkm) => (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#f59e0b" }}>⭐</span>
          <span style={{ fontWeight: 600 }}>
            {umkm.rating ? umkm.rating.toFixed(1) : "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Aksi",
      render: (umkm) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => openViewDialog(umkm)}
          >
            Lihat
          </Button>
          {umkm.verification_status === "APPROVED" && (
            <>
              {umkm.status === "ACTIVE" ? (
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => openActionDialog(umkm, "suspend")}
                >
                  Nonaktifkan
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="small"
                  onClick={() => openActionDialog(umkm, "activate")}
                >
                  Aktifkan
                </Button>
              )}
              <Button
                variant="warning"
                size="small"
                onClick={() => openActionDialog(umkm, "revoke_verification")}
              >
                Cabut Verifikasi
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div style={{ padding: "30px", textAlign: "center" }}>
          Memuat data UMKM...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="admin">
        <div style={{ padding: "30px", textAlign: "center" }}>
          <p style={{ color: "var(--danger-color)", marginBottom: "16px" }}>
            {error}
          </p>
          <Button onClick={fetchUMKMList}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div style={{ padding: "30px" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px" }}>
            Kelola UMKM
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Kelola semua UMKM yang terdaftar di platform Savora
          </p>
        </div>

        {/* Toolbar */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            marginBottom: "24px",
          }}
        >
          {/* Search */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
              Cari UMKM
            </label>
            <input
              type="text"
              placeholder="Nama bisnis, email, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Filters Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {/* Filter Kategori */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                Kategori
              </label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); fetchUMKMList(); }}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.875rem" }}
              >
                <option value="">Semua Kategori</option>
                <option value="Makanan Siap Saji">Makanan Siap Saji</option>
                <option value="Roti & Kue">Roti & Kue</option>
                <option value="Lauk Pauk">Lauk Pauk</option>
                <option value="Katering">Katering</option>
                <option value="Minuman">Minuman</option>
                <option value="Buah & Sayur">Buah & Sayur</option>
                <option value="Frozen Food">Frozen Food</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                Status Akun
              </label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); fetchUMKMList(); }}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.875rem" }}
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUSPENDED">Nonaktif</option>
              </select>
            </div>

            {/* Filter Verification */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                Status Verifikasi
              </label>
              <select
                value={filterVerification}
                onChange={(e) => { setFilterVerification(e.target.value); fetchUMKMList(); }}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.875rem" }}
              >
                <option value="">Semua Status</option>
                <option value="APPROVED">Terverifikasi</option>
                <option value="PENDING">Menunggu</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
            <Button variant="outline" onClick={handleResetFilter}>Reset Filter</Button>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: "40px" }}>
              {filteredUMKM.length} UMKM ditemukan
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredUMKM.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "60px 20px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🏪</div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
              Tidak ada UMKM ditemukan
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {searchTerm || filterCategory || filterStatus || filterVerification
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Belum ada UMKM yang terdaftar di platform"}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredUMKM} />
        )}
      </div>


      {/* View Detail Dialog */}
      {viewDialog && selectedUMKM && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={closeViewDialog}>
          <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>Detail UMKM</h2>
              <button onClick={closeViewDialog} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}>×</button>
            </div>
            <div style={{ padding: "24px" }}>
              {/* Business Header */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--secondary-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 600, color: "var(--primary-color)", margin: "0 auto 16px" }}>🏪</div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>{selectedUMKM.business_name}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{selectedUMKM.category || "Tidak dikategorikan"}</p>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {getVerificationBadge(selectedUMKM.verification_status)}
                  {getStatusBadge(selectedUMKM.status)}
                  {selectedUMKM.keyword_safety_level && getSafetyBadge(selectedUMKM.keyword_safety_level)}
                </div>
              </div>

              {/* Profil Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
                <div><div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Email</div><div style={{ color: "var(--text-main)", fontSize: "0.875rem" }}>{selectedUMKM.email || "-"}</div></div>
                <div><div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>No. Telepon</div><div style={{ color: "var(--text-main)", fontSize: "0.875rem" }}>{selectedUMKM.phone || "-"}</div></div>
                <div style={{ gridColumn: "1 / -1" }}><div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Alamat</div><div style={{ color: "var(--text-main)", fontSize: "0.875rem" }}>{selectedUMKM.address || "-"}</div></div>
              </div>

              {/* Statistik */}
              <div style={{ padding: "16px", backgroundColor: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "12px" }}>📊 Statistik</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", textAlign: "center" }}>
                  <div><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary-color)" }}>{selectedUMKM.total_products || 0}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Produk</div></div>
                  <div><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary-color)" }}>{selectedUMKM.orders_completed || 0}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Orders</div></div>
                  <div><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary-color)" }}>{selectedUMKM.rating ? selectedUMKM.rating.toFixed(1) : "-"}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rating</div></div>
                </div>
              </div>

              {/* Keyword Safety (if available) */}
              {selectedUMKM.keyword_safety_level && (
                <div style={{ padding: "16px", backgroundColor: selectedUMKM.keyword_safety_level === "GAWAT" ? "#fef2f2" : selectedUMKM.keyword_safety_level === "WARNING" ? "#fefce8" : "#f0fdf4", borderRadius: "8px", border: `1px solid ${selectedUMKM.keyword_safety_level === "GAWAT" ? "var(--danger-color)" : selectedUMKM.keyword_safety_level === "WARNING" ? "var(--warning-color)" : "var(--success-color)"}`, marginBottom: "20px" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>🛡️ Keyword Safety Level</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>Status keamanan berdasarkan klasifikasi keyword review customer (rolling 30 hari)</p>
                </div>
              )}

              {/* Produk Aktif Summary */}
              <div style={{ padding: "16px", backgroundColor: "var(--secondary-color)", borderRadius: "8px", border: "1px solid var(--primary-color)", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>📦 Produk Rescue Aktif</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px" }}>UMKM ini memiliki {selectedUMKM.active_products || 0} produk rescue yang sedang aktif</p>
                <a href={`/admin/moderasi-listing?umkm_id=${selectedUMKM.id}`} style={{ color: "var(--primary-color)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>Lihat Produk di Moderasi Listing →</a>
              </div>

              {/* Riwayat Laporan */}
              <div style={{ padding: "16px", backgroundColor: "var(--secondary-color)", borderRadius: "8px", border: "1px solid var(--primary-color)" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>💬 Riwayat Laporan</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px" }}>Lihat riwayat laporan atau aduan terkait UMKM ini</p>
                <a href={`/admin/help-center?umkm_id=${selectedUMKM.id}`} style={{ color: "var(--primary-color)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>Buka Help Center →</a>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={closeViewDialog}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog (Suspend/Activate/Revoke) */}
      {actionDialog && selectedUMKM && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={closeActionDialog}>
          <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", maxWidth: "500px", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                {actionType === "suspend" ? "Nonaktifkan UMKM" : actionType === "activate" ? "Aktifkan UMKM" : "Cabut Verifikasi UMKM"}
              </h2>
            </div>
            <div style={{ padding: "24px" }}>
              {/* UMKM Info */}
              <div style={{ padding: "16px", backgroundColor: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "20px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>{selectedUMKM.business_name}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{selectedUMKM.category || "Tidak dikategorikan"}</div>
              </div>

              {/* Warning Message */}
              <div style={{ padding: "12px", backgroundColor: actionType === "revoke_verification" ? "#fef2f2" : actionType === "suspend" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${actionType === "revoke_verification" ? "var(--danger-color)" : actionType === "suspend" ? "var(--danger-color)" : "var(--success-color)"}`, borderRadius: "8px", marginBottom: "20px" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--text-main)", margin: 0 }}>
                  {actionType === "suspend" ? (
                    <>⚠️ UMKM yang dinonaktifkan tidak dapat publish listing baru sampai diaktifkan kembali. Tindakan ini reversible.</>
                  ) : actionType === "activate" ? (
                    <>✓ UMKM akan diaktifkan dan dapat publish listing kembali.</>
                  ) : (
                    <>⚠️ Mencabut verifikasi akan menghentikan semua operasi UMKM. UMKM harus verifikasi ulang untuk aktif kembali. Tindakan ini reversible.</>
                  )}
                </p>
              </div>

              {/* Note Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                  Catatan <span style={{ color: "var(--danger-color)" }}>*</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    actionType === "suspend" ? "Jelaskan alasan penonaktifan (wajib diisi)..." :
                    actionType === "activate" ? "Jelaskan alasan pengaktifan (wajib diisi)..." :
                    "Jelaskan alasan pencabutan verifikasi (wajib diisi)..."
                  }
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.875rem", fontFamily: "inherit", resize: "vertical" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Catatan ini akan dicatat dalam audit log dan dikirim ke UMKM.</p>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <Button variant="outline" onClick={closeActionDialog} disabled={submitting}>Batal</Button>
              <Button
                variant={actionType === "activate" ? "success" : actionType === "suspend" ? "danger" : "warning"}
                onClick={handleSubmitAction}
                disabled={submitting || !note.trim()}
              >
                {submitting ? "Memproses..." : actionType === "suspend" ? "Ya, Nonaktifkan" : actionType === "activate" ? "Ya, Aktifkan" : "Ya, Cabut Verifikasi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
