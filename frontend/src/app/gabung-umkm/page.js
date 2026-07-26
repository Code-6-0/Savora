"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getToken, getUser } from "@/lib/auth";

export default function GabungUMKMPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuthGuard([]); // Require authentication
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nama_bisnis: "",
    jenis_bisnis: "",
    alamat_operasional: "",
    kontak_telepon: "",
    estimasi_volume_sampah: "",
    jam_operasional: "",
    dokumen_url: "",
  });

  // Check user role to prevent UMKM from re-registering
  useEffect(() => {
    function checkUserRole() {
      try {
        const user = getUser();
        if (user && user.role) {
          setUserRole(user.role);
        }
      } catch (err) {
        console.error("Failed to get user role:", err);
      } finally {
        setUserLoading(false);
      }
    }

    if (!authLoading) {
      checkUserRole();
    }
  }, [authLoading]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(
        `${baseUrl}/api/umkm/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || "Gagal mengirim pendaftaran");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth/role is being checked
  if (authLoading || userLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Memuat...</div>
        </div>
      </div>
    );
  }

  // If user is already UMKM, show message (no re-registration)
  if (userRole === "UMKM") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "600px", textAlign: "center", background: "var(--card-bg)", padding: "3rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", color: "var(--warning-color)", marginBottom: "1rem" }}>ℹ️</div>
          <h2 style={{ color: "var(--text-main)", marginBottom: "1rem" }}>Anda Sudah Terdaftar</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Akun Anda sudah terdaftar sebagai UMKM. Anda dapat mengelola bisnis Anda melalui dashboard.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/dashboard" style={{ color: "var(--primary-color)", textDecoration: "none", fontWeight: "500" }}>
              Ke Dashboard →
            </Link>
            <Link href="/mitra" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "600px", textAlign: "center", background: "var(--card-bg)", padding: "3rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", color: "var(--success-color)", marginBottom: "1rem" }}>✓</div>
          <h2 style={{ color: "var(--text-main)", marginBottom: "1rem" }}>Pendaftaran Berhasil!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Terima kasih telah mendaftar sebagai UMKM Savora. Aplikasi Anda akan diverifikasi oleh tim kami dalam 3-7 hari kerja.
            Anda akan menerima notifikasi melalui email.
          </p>
          <Link href="/dashboard" style={{ color: "var(--primary-color)", textDecoration: "none", fontWeight: "500" }}>
            Ke Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  // Main registration form (for CUSTOMER role)
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/mitra" style={{ color: "var(--primary-color)", textDecoration: "none", display: "inline-flex", alignItems: "center", marginBottom: "1rem" }}>
            ← Kembali
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.5rem" }}>
            Daftar Sebagai UMKM Kuliner
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Kelola sisa makanan Anda dengan bertanggung jawab dan tingkatkan dampak sosial bisnis Anda.
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: "var(--card-bg)", padding: "2rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {error && (
            <div style={{ background: "#fee", border: "1px solid var(--danger-color)", color: "var(--danger-color)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nama Bisnis */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Nama Bisnis <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="nama_bisnis"
                value={formData.nama_bisnis}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Contoh: Warung Makan Bu Yanti"
              />
            </div>

            {/* Jenis Bisnis */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Jenis Bisnis <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <select
                name="jenis_bisnis"
                value={formData.jenis_bisnis}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="restoran">Restoran</option>
                <option value="cafe">Café</option>
                <option value="bakery">Bakery</option>
                <option value="katering">Katering</option>
                <option value="hotel">Hotel</option>
                <option value="warteg">Warteg</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            {/* Alamat Operasional */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Alamat Operasional <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <textarea
                name="alamat_operasional"
                value={formData.alamat_operasional}
                onChange={handleChange}
                required
                rows="3"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px", resize: "vertical" }}
                placeholder="Alamat lengkap lokasi usaha"
              />
            </div>

            {/* Kontak Telepon & Estimasi Volume Sampah (2 kolom) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                  Kontak Telepon <span style={{ color: "var(--danger-color)" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="kontak_telepon"
                  value={formData.kontak_telepon}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                  Estimasi Volume Sampah/Hari <span style={{ color: "var(--danger-color)" }}>*</span>
                </label>
                <input
                  type="text"
                  name="estimasi_volume_sampah"
                  value={formData.estimasi_volume_sampah}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                  placeholder="Contoh: 30 kg/hari"
                />
              </div>
            </div>

            {/* Jam Operasional */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Jam Operasional <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="jam_operasional"
                value={formData.jam_operasional}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Contoh: Senin-Minggu 08:00-22:00"
              />
            </div>

            {/* Dokumen Usaha */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                URL Dokumen Usaha <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>(opsional)</span>
              </label>
              <input
                type="url"
                name="dokumen_url"
                value={formData.dokumen_url}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="https://drive.google.com/file/d/..."
              />
              <small style={{ color: "var(--text-muted)", fontSize: "14px" }}>Upload dokumen NIB/SIUP/izin usaha ke Google Drive/Dropbox dan paste link-nya</small>
            </div>

            {/* Info Callout */}
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--secondary-color)", borderRadius: "8px", border: "1px solid var(--primary-color)" }}>
              <p style={{ color: "var(--text-main)", fontSize: "14px", margin: 0 }}>
                <strong>Info:</strong> Aplikasi akan diverifikasi dalam 3-7 hari kerja. Pastikan data sudah benar.
              </p>
            </div>

            {/* Terms Checkbox */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginRight: "0.75rem", marginTop: "0.25rem", cursor: "pointer" }}
                />
                <span style={{ color: "var(--text-main)", fontSize: "14px" }}>
                  Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi Savora.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              style={{
                width: "100%",
                padding: "1rem",
                background: (loading || !agreedToTerms) ? "var(--text-muted)" : "var(--primary-color)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: (loading || !agreedToTerms) ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
