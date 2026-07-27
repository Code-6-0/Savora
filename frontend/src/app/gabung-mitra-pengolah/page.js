"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { apiFetch } from "@/lib/api";

export default function GabungMitraPengolahPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuthGuard([]); // Any authenticated user can access
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nama_organisasi: "",
    kategori: "",
    alamat_lokasi: "",
    kapasitas_pengolahan: "",
    nama_penanggung_jawab: "",
    kontak_telepon: "",
    kontak_email: "",
    jadwal_pickup: "",
    dokumen_legalitas_url: "",
    foto_fasilitas_url: "",
    deskripsi_singkat: "",
  });

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
      const data = await apiFetch('/mitra-pengolah/apply', {
        method: 'POST',
        body: formData
      });

      if (!data.success) {
        throw new Error(data.error?.message || "Gagal mengirim pendaftaran");
      }

      setSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/mitra");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Memuat...</div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: "600px", textAlign: "center", background: "var(--card-bg)", padding: "3rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "48px", color: "var(--success-color)", marginBottom: "1rem" }}>✓</div>
          <h2 style={{ color: "var(--text-main)", marginBottom: "1rem" }}>Pendaftaran Berhasil!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            Terima kasih telah mendaftar sebagai Mitra Pengolah Savora. Aplikasi Anda akan diverifikasi oleh tim kami dalam 3-7 hari kerja.
            Anda akan menerima notifikasi melalui email.
          </p>
          <Link href="/mitra" style={{ color: "var(--primary-color)", textDecoration: "none", fontWeight: "500" }}>
            Kembali ke Halaman Mitra →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/mitra" style={{ color: "var(--primary-color)", textDecoration: "none", display: "inline-flex", alignItems: "center", marginBottom: "1rem" }}>
            ← Kembali
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-main)", marginBottom: "0.5rem" }}>
            Gabung Sebagai Mitra Pengolah
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            Bergabunglah dengan ekosistem Savora untuk menerima suplai bahan organik berkualitas secara konsisten.
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
            {/* Nama Organisasi */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Nama Organisasi <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="nama_organisasi"
                value={formData.nama_organisasi}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Contoh: Yayasan Peduli Lingkungan"
              />
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Kategori Mitra <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="organisasi_donasi">Organisasi Donasi</option>
                <option value="budidaya_maggot">Budidaya Maggot</option>
                <option value="kompos">Kompos</option>
                <option value="pengolahan_organik">Pengolahan Organik</option>
                <option value="pakan_ternak">Pakan Ternak</option>
                <option value="bank_sampah">Bank Sampah</option>
              </select>
            </div>

            {/* Alamat Lokasi */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Alamat Lokasi <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <textarea
                name="alamat_lokasi"
                value={formData.alamat_lokasi}
                onChange={handleChange}
                required
                rows="3"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px", resize: "vertical" }}
                placeholder="Alamat lengkap fasilitas pengolahan"
              />
            </div>

            {/* Kapasitas Pengolahan */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Kapasitas Pengolahan <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="kapasitas_pengolahan"
                value={formData.kapasitas_pengolahan}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Contoh: 50 kg/hari atau 200 kg/minggu"
              />
            </div>

            {/* Nama Penanggung Jawab */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Nama Penanggung Jawab <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="nama_penanggung_jawab"
                value={formData.nama_penanggung_jawab}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Nama lengkap penanggung jawab"
              />
            </div>

            {/* Kontak Telepon */}
            <div style={{ marginBottom: "1.5rem" }}>
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
                placeholder="Contoh: 081234567890"
              />
            </div>

            {/* Kontak Email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Kontak Email <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="email"
                name="kontak_email"
                value={formData.kontak_email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="email@organisasi.com"
              />
            </div>

            {/* Jadwal Pickup */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Jadwal Pickup <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <input
                type="text"
                name="jadwal_pickup"
                value={formData.jadwal_pickup}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="Contoh: Senin-Jumat 08:00-16:00"
              />
            </div>

            {/* Dokumen Legalitas URL */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                URL Dokumen Legalitas <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>(opsional)</span>
              </label>
              <input
                type="url"
                name="dokumen_legalitas_url"
                value={formData.dokumen_legalitas_url}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="https://drive.google.com/file/d/..."
              />
              <small style={{ color: "var(--text-muted)", fontSize: "14px" }}>Upload dokumen ke Google Drive/Dropbox dan paste link-nya di sini</small>
            </div>

            {/* Foto Fasilitas URL */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                URL Foto Fasilitas <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>(opsional)</span>
              </label>
              <input
                type="url"
                name="foto_fasilitas_url"
                value={formData.foto_fasilitas_url}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px" }}
                placeholder="https://drive.google.com/file/d/..."
              />
              <small style={{ color: "var(--text-muted)", fontSize: "14px" }}>Upload foto fasilitas dan paste link-nya di sini</small>
            </div>

            {/* Deskripsi Singkat */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontWeight: "600", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                Deskripsi Singkat <span style={{ color: "var(--danger-color)" }}>*</span>
              </label>
              <textarea
                name="deskripsi_singkat"
                value={formData.deskripsi_singkat}
                onChange={handleChange}
                required
                rows="4"
                style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "16px", resize: "vertical" }}
                placeholder="Ceritakan tentang organisasi Anda, pengalaman, dan tujuan bergabung dengan Savora"
              />
            </div>

            {/* Info Callout */}
            <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--secondary-color)", borderRadius: "8px", border: "1px solid var(--primary-color)" }}>
              <p style={{ color: "var(--text-main)", fontSize: "14px", margin: 0 }}>
                <strong>Info:</strong> Aplikasi Anda akan diverifikasi oleh tim admin dalam 3-7 hari kerja. Pastikan data yang diisi sudah benar.
              </p>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginRight: "0.75rem", marginTop: "0.25rem", cursor: "pointer" }}
                />
                <span style={{ color: "var(--text-main)", fontSize: "14px" }}>
                  Saya menyatakan data yang saya isi adalah benar dan menyetujui Syarat & Ketentuan serta Kebijakan Privasi Savora.
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
                transition: "background 0.2s",
              }}
            >
              {loading ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--secondary-color)", borderRadius: "8px", border: "1px solid var(--primary-color)" }}>
          <p style={{ color: "var(--text-main)", fontSize: "14px", margin: 0 }}>
            <strong>Catatan:</strong> Setelah mengirim pendaftaran, tim Savora akan melakukan verifikasi dalam 3-7 hari kerja.
            Anda akan menerima notifikasi email mengenai status verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}
