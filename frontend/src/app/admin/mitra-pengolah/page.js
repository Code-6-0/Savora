"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/organisms/DataTable";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { getToken, isAdmin } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function KelolaMitraPengolahPage() {
  const router = useRouter();
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [selectedMitra, setSelectedMitra] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/login");
      return;
    }
    fetchMitraList();
  }, [router]);

  async function fetchMitraList() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterKategori) params.append("kategori", filterKategori);

      const response = await fetch(`${API_BASE}/api/admin/mitra-pengolah?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();

      if (data.success) {
        setMitraList(data.data.mitra_list || []);
      } else {
        setError(data.error?.message || "Gagal memuat data mitra pengolah");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(mitra, status) {
    const action = status === "APPROVED" ? "menyetujui" : "menolak";
    const note = prompt(`Catatan untuk ${action} ${mitra.nama_organisasi}:`);

    if (!note || !note.trim()) {
      alert("Catatan wajib diisi");
      return;
    }

    let rejectionReason = "";
    if (status === "REJECTED") {
      rejectionReason = prompt("Alasan penolakan (wajib diisi untuk reject):");
      if (!rejectionReason || !rejectionReason.trim()) {
        alert("Alasan penolakan wajib diisi");
        return;
      }
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/mitra-pengolah/${mitra.id}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status, note, rejection_reason: rejectionReason }),
        }
      );
      const data = await response.json();

      if (data.success) {
        alert(`Mitra pengolah berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}`);
        fetchMitraList();
      } else {
        alert(data.error?.message || "Gagal memperbarui status");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
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

  function getKategoriLabel(kategori) {
    const labels = {
      organisasi_donasi: "Organisasi Donasi",
      budidaya_maggot: "Budidaya Maggot",
      kompos: "Kompos",
      pengolahan_organik: "Pengolahan Organik",
      pakan_ternak: "Pakan Ternak",
      bank_sampah: "Bank Sampah",
    };
    return labels[kategori] || kategori;
  }

  const columns = [
    { key: "nama_organisasi", label: "Nama Organisasi" },
    {
      key: "kategori",
      label: "Kategori",
      render: (row) => getKategoriLabel(row.kategori)
    },
    { key: "nama_penanggung_jawab", label: "Penanggung Jawab" },
    { key: "kontak_telepon", label: "Telepon" },
    {
      key: "verification_status",
      label: "Status",
      render: (row) => getVerificationBadge(row.verification_status),
    },
    {
      key: "created_at",
      label: "Tanggal Daftar",
      render: (row) => formatDate(row.created_at),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              setSelectedMitra(row);
              setViewDialog(true);
            }}
          >
            Detail
          </Button>
          {row.verification_status === "PENDING" && (
            <>
              <Button
                variant="success"
                size="small"
                onClick={() => handleVerify(row, "APPROVED")}
              >
                Setujui
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={() => handleVerify(row, "REJECTED")}
              >
                Tolak
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredData = mitraList.filter((mitra) => {
    if (filterStatus && mitra.verification_status !== filterStatus) return false;
    if (filterKategori && mitra.kategori !== filterKategori) return false;
    return true;
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.5rem" }}>
          Kelola Mitra Pengolah
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Verifikasi pendaftaran mitra pengolah yang masuk ke sistem
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "14px", fontWeight: "500" }}>
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchMitraList();
            }}
            style={{
              padding: "0.5rem",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              minWidth: "150px",
            }}
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "14px", fontWeight: "500" }}>
            Kategori
          </label>
          <select
            value={filterKategori}
            onChange={(e) => {
              setFilterKategori(e.target.value);
              fetchMitraList();
            }}
            style={{
              padding: "0.5rem",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              minWidth: "180px",
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="organisasi_donasi">Organisasi Donasi</option>
            <option value="budidaya_maggot">Budidaya Maggot</option>
            <option value="kompos">Kompos</option>
            <option value="pengolahan_organik">Pengolahan Organik</option>
            <option value="pakan_ternak">Pakan Ternak</option>
            <option value="bank_sampah">Bank Sampah</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterStatus("");
              setFilterKategori("");
              fetchMitraList();
            }}
          >
            Reset Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Pendaftar</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-main)" }}>{mitraList.length}</div>
        </div>
        <div style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Menunggu Verifikasi</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--warning-color)" }}>
            {mitraList.filter((m) => m.verification_status === "PENDING").length}
          </div>
        </div>
        <div style={{ background: "var(--card-bg)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Terverifikasi</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--success-color)" }}>
            {mitraList.filter((m) => m.verification_status === "APPROVED").length}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: "1rem", background: "#fee", border: "1px solid var(--danger-color)", color: "var(--danger-color)", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Memuat data...
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}

      {/* Detail Dialog */}
      {viewDialog && selectedMitra && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setViewDialog(false)}
        >
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "12px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-main)" }}>
                Detail Mitra Pengolah
              </h2>
              <button
                onClick={() => setViewDialog(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <DetailItem label="Nama Organisasi" value={selectedMitra.nama_organisasi} />
              <DetailItem label="Kategori" value={getKategoriLabel(selectedMitra.kategori)} />
              <DetailItem label="Alamat Lokasi" value={selectedMitra.alamat_lokasi} />
              <DetailItem label="Kapasitas Pengolahan" value={selectedMitra.kapasitas_pengolahan} />
              <DetailItem label="Penanggung Jawab" value={selectedMitra.nama_penanggung_jawab} />
              <DetailItem label="Telepon" value={selectedMitra.kontak_telepon} />
              <DetailItem label="Email" value={selectedMitra.kontak_email} />
              <DetailItem label="Jadwal Pickup" value={selectedMitra.jadwal_pickup} />
              <DetailItem label="Deskripsi" value={selectedMitra.deskripsi_singkat} />

              {selectedMitra.dokumen_legalitas_url && (
                <DetailItem
                  label="Dokumen Legalitas"
                  value={
                    <a href={selectedMitra.dokumen_legalitas_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)" }}>
                      Lihat Dokumen →
                    </a>
                  }
                />
              )}

              {selectedMitra.foto_fasilitas_url && (
                <DetailItem
                  label="Foto Fasilitas"
                  value={
                    <a href={selectedMitra.foto_fasilitas_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)" }}>
                      Lihat Foto →
                    </a>
                  }
                />
              )}

              <DetailItem
                label="Status"
                value={getVerificationBadge(selectedMitra.verification_status)}
              />

              {selectedMitra.rejection_reason && (
                <DetailItem
                  label="Alasan Penolakan"
                  value={selectedMitra.rejection_reason}
                  style={{ color: "var(--danger-color)" }}
                />
              )}

              <DetailItem label="Tanggal Daftar" value={formatDate(selectedMitra.created_at)} />
              {selectedMitra.verified_at && (
                <DetailItem label="Tanggal Verifikasi" value={formatDate(selectedMitra.verified_at)} />
              )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              {selectedMitra.verification_status === "PENDING" && (
                <>
                  <Button
                    variant="success"
                    onClick={() => {
                      setViewDialog(false);
                      handleVerify(selectedMitra, "APPROVED");
                    }}
                  >
                    Setujui
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setViewDialog(false);
                      handleVerify(selectedMitra, "REJECTED");
                    }}
                  >
                    Tolak
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setViewDialog(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, style }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "0.25rem", fontWeight: "600" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", color: "var(--text-main)", ...style }}>
        {value || "-"}
      </div>
    </div>
  );
}
