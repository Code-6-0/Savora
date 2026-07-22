"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, CheckCircle2, Clock, Zap, TrendingUp } from "lucide-react";
import TopHeader from "@/components/organisms/TopHeader";
import Badge from "@/components/atoms/Badge";
import {
  fetchAdPackages,
  fetchUmkmAds,
  createUmkmAd,
  updateAdStatus,
  AD_STATUS,
} from "@/lib/umkmAds";

const UMKM_ID = 1;

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number || 0);

// Badge type mengikuti komponen atoms/Badge (success / warning / critical / dll).
const statusBadgeType = (status) => {
  if (status === AD_STATUS.Aktif.key) return "success";
  if (status === AD_STATUS.Kadaluarsa.key) return "critical";
  return "warning"; // Draft
};

const fallbackProducts = [
  { id: 1, name: "Nasi Kotak Ayam Bakar" },
  { id: 2, name: "Salad Bowl Superfood" },
  { id: 3, name: "Roti Gandum Artisan" },
];

export default function PromosiPage() {
  const [packages, setPackages] = useState([]);
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Form state
  const [productId, setProductId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [headline, setHeadline] = useState("");
  const [cta, setCta] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reloadAds = async () => {
    // Local state handle this
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const pkgs = await fetchAdPackages();
      if (!active) return;
      setPackages(pkgs);
      
      // Dummy data for visual
      const dummyAds = [
        { id: 1, umkm_id: UMKM_ID, product_id: 1, package_id: "populer", headline: "Flash Sale Ayam Bakar", cta: "Beli Sekarang", status: AD_STATUS.Aktif.key, price: 35000, duration_days: 7, start_at: new Date().toISOString() }
      ];
      setAds(dummyAds);
      setProducts(fallbackProducts);
      
      if (pkgs.length > 0) setPackageId(pkgs[0].id);
      if (fallbackProducts.length > 0) setProductId(String(fallbackProducts[0].id));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedPackage = packages.find((p) => p.id === packageId);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!productId || !packageId) {
      setNotice({ type: "error", text: "Pilih produk dan paket promosi dulu." });
      return;
    }
    setSubmitting(true);
    setNotice(null);
    
    // Simulate API Create
    setTimeout(() => {
      const newAd = {
        id: ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1,
        umkm_id: UMKM_ID,
        product_id: Number(productId),
        package_id: packageId,
        headline: headline || "Promosi Baru",
        cta: cta || "Lihat Produk",
        status: AD_STATUS.Draft.key,
        price: selectedPackage ? selectedPackage.price : 0,
        duration_days: selectedPackage ? selectedPackage.duration_days : 0,
        start_at: new Date().toISOString()
      };
      setAds([newAd, ...ads]);
      setHeadline("");
      setCta("");
      setNotice({ type: "success", text: "Promosi dibuat sebagai Draft. Aktifkan untuk mulai tayang." });
      setSubmitting(false);
    }, 500);
  };

  const handleActivate = async (id) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, status: AD_STATUS.Aktif.key } : ad));
    setNotice({ type: "success", text: "Promosi diaktifkan dan mulai tayang di marketplace." });
  };

  const productName = (id) => products.find((p) => String(p.id) === String(id))?.name || `Produk #${id}`;

  return (
    <>
      <TopHeader title="Promosi Produk" subtitle="Pasang promosi untuk produk food rescue Anda dan tingkatkan jangkauan di marketplace.">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontWeight: 600 }}>
          <Megaphone size={20} /> Promosi UMKM
        </div>
      </TopHeader>

      <div className="content-area">
        {notice && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              fontSize: "0.875rem",
              backgroundColor: notice.type === "success" ? "#ECFDF5" : "#FEF2F2",
              color: notice.type === "success" ? "#047857" : "#B91C1C",
              border: `1px solid ${notice.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            }}
          >
            {notice.text}
          </div>
        )}

        {/* Katalog paket promosi */}
        <h3 style={{ marginBottom: "15px" }}>Pilih Paket Promosi</h3>
        <div className="grid-3" style={{ marginBottom: "30px" }}>
          {packages.map((pkg) => {
            const isSelected = pkg.id === packageId;
            return (
              <div
                key={pkg.id}
                onClick={() => setPackageId(pkg.id)}
                className="card"
                style={{
                  cursor: "pointer",
                  border: isSelected ? "2px solid #10B981" : "1px solid #E5E7EB",
                  backgroundColor: isSelected ? "#F0FDF4" : "#FFFFFF",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700 }}>{pkg.name}</span>
                  {isSelected && <CheckCircle2 size={18} color="#10B981" />}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }}>{formatRupiah(pkg.price)}</div>
                <div style={{ fontSize: "0.8125rem", color: "#6B7280", marginBottom: "8px" }}>
                  <Clock size={12} style={{ display: "inline", marginRight: "4px" }} /> Tayang {pkg.duration_days} hari
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#6B7280" }}>{pkg.description}</div>
              </div>
            );
          })}
        </div>

        <div className="grid-2">
          {/* Form pasang promosi */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Pasang Promosi Baru</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "5px" }}>Produk</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
                >
                  {products.length === 0 && <option value="">Belum ada produk</option>}
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "5px" }}>Judul Promosi (Headline)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Contoh: Nasi Kotak fresh, hemat 40%!"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "5px" }}>Teks Tombol (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Contoh: Selamatkan sekarang"
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
                />
              </div>

              {selectedPackage && (
                <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", marginBottom: "15px", fontSize: "0.875rem" }}>
                  Paket <strong>{selectedPackage.name}</strong> — {formatRupiah(selectedPackage.price)} untuk {selectedPackage.duration_days} hari tayang.
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting || products.length === 0} style={{ width: "100%", justifyContent: "center" }}>
                <Plus size={18} /> {submitting ? "Menyimpan..." : "Buat Promosi (Draft)"}
              </button>
            </form>
          </div>

          {/* Daftar promosi UMKM */}
          <div className="card">
            <h3 style={{ marginBottom: "20px" }}>Promosi Saya</h3>
            {loading && <div style={{ color: "#6B7280" }}>Memuat promosi...</div>}
            {!loading && ads.length === 0 && (
              <div style={{ color: "#6B7280", fontSize: "0.875rem" }}>Belum ada promosi. Pasang promosi pertama Anda di sebelah.</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {ads.map((ad) => (
                <div key={ad.id} style={{ padding: "15px", border: "1px solid #E5E7EB", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
                    <div style={{ fontWeight: 600 }}>{ad.headline || productName(ad.product_id)}</div>
                    <Badge type={statusBadgeType(ad.status)}>{ad.status}</Badge>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "10px" }}>
                    {productName(ad.product_id)} · {formatRupiah(ad.price)} · {ad.duration_days} hari
                    {ad.end_at ? ` · berakhir ${new Date(ad.end_at).toLocaleDateString("id-ID")}` : ""}
                  </div>
                  {ad.status === AD_STATUS.Draft.key && (
                    <button
                      onClick={() => handleActivate(ad.id)}
                      className="btn-primary"
                      style={{ padding: "6px 14px", fontSize: "0.8125rem" }}
                    >
                      <Zap size={14} /> Aktifkan
                    </button>
                  )}
                  {ad.status === AD_STATUS.Aktif.key && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "#10B981" }}>
                      <TrendingUp size={14} /> Sedang tayang di marketplace
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
