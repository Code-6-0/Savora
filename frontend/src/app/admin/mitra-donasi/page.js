"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/templates/DashboardLayout";
import DataTable from "@/components/organisms/DataTable";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export default function KelolaMitraDonasiPage() {
  const router = useRouter();
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [actionType, setActionType] = useState(""); // "suspend" or "activate"
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMitraList();
  }, []);

  async function fetchMitraList() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`${API_BASE}/admin/mitra-donasi?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();

      if (data.success) {
        setMitraList(data.data.mitra_list || []);
      } else {
        setError(data.error?.message || "Gagal memuat data mitra donasi");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchMitraList();
  }

  function handleResetFilter() {
    setSearchTerm("");
    setFilterStatus("");
    fetchMitraList();
  }

  function openViewDialog(mitra) {
    setSelectedMitra(mitra);
    setViewDialog(true);
  }

  function closeViewDialog() {
    setViewDialog(false);
    setSelectedMitra(null);
  }

  function openActionDialog(mitra, action) {
    setSelectedMitra(mitra);
    setActionType(action);
    setNote("");
    setActionDialog(true);
  }

  function closeActionDialog() {
    setActionDialog(false);
    setSelectedMitra(null);
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
      // Use /admin/users/:id/status for status changes (mitra links to users table)
      const response = await fetch(
        `${API_BASE}/admin/users/${selectedMitra.user_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ action: actionType, note }),
        }
      );
      const data = await response.json();

      if (data.success) {
        alert(
          actionType === "suspend"
            ? "Mitra donasi berhasil dinonaktifkan"
            : "Mitra donasi berhasil diaktifkan"
        );
        closeActionDialog();
        fetchMitraList();
      } else {
        alert(data.error?.message || "Gagal mengubah status mitra donasi");
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

  // Filter mitra by search term (client-side)
  const filteredMitra = mitraList.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.org_name?.toLowerCase().includes(searchLower) ||
      m.email?.toLowerCase().includes(searchLower) ||
      m.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Table columns (per spec §6.3: nama org+jenis, kontak PIC, status verifikasi, tanggal verifikasi)
  const columns = [
    {
      header: "Organisasi",
      render: (mitra) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
            {mitra.org_name || "-"}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {mitra.org_type || "Lembaga Donasi"}
          </div>
        </div>
      ),
    },
    {
      header: "Kontak PIC",
      render: (mitra) => (
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
            {mitra.phone || "-"}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {mitra.email || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Status Verifikasi",
      render: (mitra) => getVerificationBadge(mitra.verification_status),
    },
    {
      header: "Tanggal Verifikasi",
      render: (mitra) => formatDate(mitra.verified_at),
    },
    {
      header: "Status Akun",
      render: (mitra) => getStatusBadge(mitra.status),
    },
    {
      header: "Aksi",
      render: (mitra) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => openViewDialog(mitra)}
          >
            Lihat
          </Button>
          {mitra.verification_status === "APPROVED" && (
            <>
              {mitra.status === "ACTIVE" ? (
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => openActionDialog(mitra, "suspend")}
                >
                  Nonaktifkan
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="small"
                  onClick={() => openActionDialog(mitra, "activate")}
                >
                  Aktifkan
                </Button>
              )}
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
          Memuat data mitra donasi...
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
          <Button onClick={fetchMitraList}>Coba Lagi</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div style={{ padding: "30px" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "8px",
            }}
          >
            Kelola Mitra Donasi
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Kelola mitra donasi yang sudah terverifikasi di platform Savora
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            {/* Search */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  marginBottom: "8px",
                }}
              >
                Cari Mitra Donasi
              </label>
              <input
                type="text"
                placeholder="Nama organisasi, email, atau telepon..."
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

            {/* Filter Verification Status */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  marginBottom: "8px",
                }}
              >
                Status Verifikasi
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  fetchMitraList();
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  minWidth: "180px",
                }}
              >
                <option value="">Semua Status</option>
                <option value="APPROVED">Terverifikasi</option>
                <option value="PENDING">Menunggu</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <Button variant="outline" onClick={handleResetFilter}>
              Reset Filter
            </Button>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: "40px" }}>
              {filteredMitra.length} mitra ditemukan
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredMitra.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "60px 20px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🤝</div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--text-main)",
                marginBottom: "8px",
              }}
            >
              Tidak ada mitra donasi ditemukan
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {searchTerm || filterStatus
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Belum ada mitra donasi yang terdaftar"}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredMitra} />
        )}
      </div>

      {/* View Detail Dialog */}
      {viewDialog && selectedMitra && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeViewDialog}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                Detail Mitra Donasi
              </h2>
              <button
                onClick={closeViewDialog}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                ×
              </button>
            </div>

            {/* Dialog Body */}
            <div style={{ padding: "24px" }}>
              {/* Org Name */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: "var(--secondary-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: "var(--primary-color)",
                    margin: "0 auto 16px",
                  }}
                >
                  🤝
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    marginBottom: "4px",
                  }}
                >
                  {selectedMitra.org_name}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {selectedMitra.org_type || "Lembaga Donasi"}
                </p>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center" }}>
                  {getVerificationBadge(selectedMitra.verification_status)}
                  {getStatusBadge(selectedMitra.status)}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Email
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {selectedMitra.email || "-"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    No. Telepon
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {selectedMitra.phone || "-"}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Alamat
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {selectedMitra.address || "-"}
                  </div>
                </div>

                {selectedMitra.description && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Deskripsi
                    </div>
                    <div style={{ color: "var(--text-main)", lineHeight: 1.6 }}>
                      {selectedMitra.description}
                    </div>
                  </div>
                )}

                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    Tanggal Verifikasi
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {formatDate(selectedMitra.verified_at) || "Belum diverifikasi"}
                  </div>
                </div>

                {selectedMitra.document_url && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Dokumen Legalitas
                    </div>
                    <a
                      href={selectedMitra.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary-color)",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      📄 Lihat Dokumen →
                    </a>
                  </div>
                )}
              </div>

              {/* Riwayat Laporan Link */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--secondary-color)",
                  borderRadius: "8px",
                  border: "1px solid var(--primary-color)",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "var(--text-main)", marginBottom: "8px" }}>
                  💬 <strong>Riwayat Laporan</strong>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Lihat riwayat laporan atau aduan terkait mitra donasi ini
                </p>
                <a
                  href={`/admin/help-center?mitra_id=${selectedMitra.id}`}
                  style={{
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Buka Help Center →
                </a>
              </div>
            </div>

            {/* Dialog Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="outline" onClick={closeViewDialog}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog (Nonaktifkan/Aktifkan) */}
      {actionDialog && selectedMitra && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeActionDialog}
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)" }}>
                {actionType === "suspend" ? "Nonaktifkan Mitra Donasi" : "Aktifkan Mitra Donasi"}
              </h2>
            </div>

            {/* Dialog Body */}
            <div style={{ padding: "24px" }}>
              {/* Mitra Info */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-color)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  {selectedMitra.org_name}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {selectedMitra.org_type || "Lembaga Donasi"}
                </div>
              </div>

              {/* Warning Message */}
              <div
                style={{
                  padding: "12px",
                  backgroundColor: actionType === "suspend" ? "#fef2f2" : "#f0fdf4",
                  border: `1px solid ${actionType === "suspend" ? "var(--danger-color)" : "var(--success-color)"}`,
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ fontSize: "0.875rem", color: "var(--text-main)", margin: 0 }}>
                  {actionType === "suspend" ? (
                    <>⚠️ Mitra yang dinonaktifkan tidak dapat beroperasi di platform. Tindakan ini reversible.</>
                  ) : (
                    <>✓ Mitra akan diaktifkan kembali dan dapat beroperasi di platform.</>
                  )}
                </p>
              </div>

              {/* Note Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    marginBottom: "8px",
                  }}
                >
                  Catatan <span style={{ color: "var(--danger-color)" }}>*</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    actionType === "suspend"
                      ? "Jelaskan alasan penonaktifan (wajib diisi)..."
                      : "Jelaskan alasan pengaktifan (wajib diisi)..."
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Catatan ini akan dicatat dalam audit log.
                </p>
              </div>
            </div>

            {/* Dialog Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <Button variant="outline" onClick={closeActionDialog} disabled={submitting}>
                Batal
              </Button>
              <Button
                variant={actionType === "suspend" ? "danger" : "success"}
                onClick={handleSubmitAction}
                disabled={submitting || !note.trim()}
              >
                {submitting
                  ? "Memproses..."
                  : actionType === "suspend"
                  ? "Ya, Nonaktifkan"
                  : "Ya, Aktifkan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
