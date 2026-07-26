"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/organisms/DataTable";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { getToken, isAdmin } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export default function KelolaCustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
      return;
    }
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Dialogs
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionType, setActionType] = useState(""); // "suspend" or "activate"
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError(null);
      // GET /admin/users with role=CUSTOMER filter
      const params = new URLSearchParams({ role: "CUSTOMER" });
      if (filterStatus) params.append("status", filterStatus);

      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data.users || []);
      } else {
        setError(data.error?.message || "Gagal memuat data customer");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchCustomers();
  }

  function handleResetFilter() {
    setSearchTerm("");
    setFilterStatus("");
    fetchCustomers();
  }

  function openViewDialog(customer) {
    setSelectedCustomer(customer);
    setViewDialog(true);
  }

  function closeViewDialog() {
    setViewDialog(false);
    setSelectedCustomer(null);
  }

  function openActionDialog(customer, action) {
    setSelectedCustomer(customer);
    setActionType(action);
    setNote("");
    setActionDialog(true);
  }

  function closeActionDialog() {
    setActionDialog(false);
    setSelectedCustomer(null);
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
      const response = await fetch(
        `${API_BASE}/admin/users/${selectedCustomer.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ action: actionType, note }),
        }
      );
      const data = await response.json();

      if (data.success) {
        alert(
          actionType === "suspend"
            ? "Customer berhasil ditangguhkan"
            : "Customer berhasil dipulihkan"
        );
        closeActionDialog();
        fetchCustomers();
      } else {
        alert(data.error?.message || "Gagal mengubah status customer");
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

  function getStatusBadge(status) {
    const variants = {
      ACTIVE: { variant: "success", label: "Aktif" },
      SUSPENDED: { variant: "danger", label: "Ditangguhkan" },
      PENDING: { variant: "warning", label: "Pending" },
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // Filter customers by search term (client-side)
  const filteredCustomers = customers.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower)
    );
  });

  // Table columns
  const columns = [
    {
      header: "Customer",
      render: (customer) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--secondary-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "var(--primary-color)",
            }}
          >
            {customer.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
              {customer.name || "-"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              {customer.email || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Tanggal Daftar",
      render: (customer) => formatDate(customer.created_at),
    },
    {
      header: "Total Transaksi",
      render: (customer) => customer.total_orders || 0,
    },
    {
      header: "Transaksi Terakhir",
      render: (customer) => formatDate(customer.last_order_at),
    },
    {
      header: "Status",
      render: (customer) => getStatusBadge(customer.status),
    },
    {
      header: "Aksi",
      render: (customer) => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => openViewDialog(customer)}
          >
            Lihat
          </Button>
          {customer.status === "ACTIVE" ? (
            <Button
              variant="danger"
              size="small"
              onClick={() => openActionDialog(customer, "suspend")}
            >
              Tangguhkan
            </Button>
          ) : (
            <Button
              variant="success"
              size="small"
              onClick={() => openActionDialog(customer, "activate")}
            >
              Pulihkan
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        Memuat data customer...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <p style={{ color: "var(--danger-color)", marginBottom: "16px" }}>
          {error}
        </p>
        <Button onClick={fetchCustomers}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div
        style={{
          display: "none",
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000,
        }}
        className="mobile-menu-toggle"
      >
        <Button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</Button>
      </div>

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
            Kelola Customer
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Kelola semua customer yang terdaftar di platform Savora
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
                Cari Customer
              </label>
              <input
                type="text"
                placeholder="Nama atau email customer..."
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

            {/* Filter Status */}
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
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  fetchCustomers();
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  minWidth: "150px",
                }}
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUSPENDED">Ditangguhkan</option>
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
              {filteredCustomers.length} customer ditemukan
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredCustomers.length === 0 ? (
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              padding: "60px 20px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👤</div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--text-main)",
                marginBottom: "8px",
              }}
            >
              Tidak ada customer ditemukan
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {searchTerm || filterStatus
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Belum ada customer yang terdaftar di platform"}
            </p>
          </div>
        ) : (
          <DataTable headers={columns.map(col => col.header)}>
            {filteredCustomers.map((customer, idx) => (
              <tr key={idx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>{col.render(customer)}</td>
                ))}
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      {/* View Detail Dialog */}
      {viewDialog && selectedCustomer && (
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
                Detail Customer
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
              {/* Avatar & Name */}
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
                  {selectedCustomer.name?.[0]?.toUpperCase() || "?"}
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    marginBottom: "4px",
                  }}
                >
                  {selectedCustomer.name}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  {selectedCustomer.email}
                </p>
                <div style={{ marginTop: "12px" }}>
                  {getStatusBadge(selectedCustomer.status)}
                </div>
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
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
                    Tanggal Daftar
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {formatDate(selectedCustomer.created_at)}
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
                    Total Transaksi
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {selectedCustomer.total_orders || 0} transaksi
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
                    Transaksi Terakhir
                  </div>
                  <div style={{ color: "var(--text-main)" }}>
                    {formatDate(selectedCustomer.last_order_at) || "Belum ada transaksi"}
                  </div>
                </div>

                {selectedCustomer.phone && (
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
                      {selectedCustomer.phone}
                    </div>
                  </div>
                )}

                {selectedCustomer.address && (
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
                      {selectedCustomer.address}
                    </div>
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
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-main)",
                    marginBottom: "8px",
                  }}
                >
                  💬 <strong>Riwayat Laporan</strong>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Lihat riwayat laporan atau aduan terkait customer ini
                </p>
                <a
                  href={`/admin/help-center?customer_id=${selectedCustomer.id}`}
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

      {/* Action Dialog (Suspend/Activate) */}
      {actionDialog && selectedCustomer && (
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
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                {actionType === "suspend" ? "Tangguhkan Customer" : "Pulihkan Customer"}
              </h2>
            </div>

            {/* Dialog Body */}
            <div style={{ padding: "24px" }}>
              {/* Customer Info */}
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
                  {selectedCustomer.name}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {selectedCustomer.email}
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
                    <>
                      ⚠️ Customer yang ditangguhkan tidak dapat melakukan transaksi sampai dipulihkan.
                      Tindakan ini reversible.
                    </>
                  ) : (
                    <>
                      ✓ Customer akan dipulihkan dan dapat melakukan transaksi kembali.
                    </>
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
                      ? "Jelaskan alasan penangguhan (wajib diisi)..."
                      : "Jelaskan alasan pemulihan (wajib diisi)..."
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
                  Catatan ini akan dicatat dalam audit log dan diperlukan untuk transparansi.
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
                  ? "Ya, Tangguhkan"
                  : "Ya, Pulihkan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
