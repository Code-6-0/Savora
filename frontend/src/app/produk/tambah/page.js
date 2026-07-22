"use client";

import { useState, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart2,
  Lightbulb,
  LogOut,
  Bell,
  ChevronRight,
  Upload,
  Plus,
  Minus,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Tag,
  Shield,
  Check,
  Store,
  TrendingDown,
  Zap,
  Star,
  Camera,
  Clock,
  Thermometer,
  Leaf,
  ChevronDown,
  Eye,
  Sparkles,
  CircleAlert,
  Trash2,
  Flame,
  Users,
  ShoppingCart,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Makanan Siap Saji",
  "Bakery & Roti",
  "Minuman & Bowl",
  "Sandwich & Wrap",
  "Pizza & Pasta",
  "Makanan Sehat",
  "Kue & Pastri",
  "Snack & Camilan",
];

const MYSTERY_CATEGORIES = [
  "Bakery & Pastry",
  "Makanan Berat",
  "Minuman",
  "Mixed / Campuran",
  "Dessert",
];

const PRODUCT_TAGS = [
  "Halal",
  "Vegetarian",
  "Gluten Free",
  "Pedas",
  "Vegan",
  "Organik",
];

const ALLERGEN_OPTIONS = [
  "Telur",
  "Susu",
  "Seafood",
  "Kacang",
  "Kedelai",
  "Lainnya",
];

const CLEANLIST = [
  "Tidak terdapat debu",
  "Tidak terdapat rambut",
  "Wadah bersih & kering",
  "Petugas menggunakan sarung tangan",
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#" },
  { icon: Package, label: "Produk", href: "#", active: true, badge: 3 },
  { icon: ShoppingBag, label: "Pesanan", href: "#" },
  { icon: BarChart2, label: "Analitik", href: "#" },
  { icon: Lightbulb, label: "Insight", href: "#" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val) {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
}

// FUNGSI BARU: Calculate Food Trust Index berdasarkan PRD
function calculateFoodTrustIndex(
  category,
  productionTime,
  storageMethod| null,
  packagingCondition| null,
  appearance,
  aroma| null,
  hasSauceOrGravy,
  // CRITICAL SAFETY GATES (BARU)
  hasMoldOrSlime,
  hasAbnormalAroma,
  hasPackagingLeakSevere,
  hasColdChainBroken) {
  
  // CRITICAL SAFETY GATE CHECKS - Auto-reject sebelum kalkulasi
  // Sesuai Review_Final_Audit_PRD_Savora_CODE_6_0.md lines 32-43
  if (hasMoldOrSlime || hasAbnormalAroma || hasPackagingLeakSevere || hasColdChainBroken) {
    return {
      status: "Tidak Layak Konsumsi",
      canPublish: false,
      reason: "Produk gagal pemeriksaan keamanan kritis. TIDAK DAPAT dipublikasikan karena: " +
        (hasMoldOrSlime ? "Terdeteksi jamur/lendir. " : "") +
        (hasAbnormalAroma ? "Aroma tidak normal (busuk/asam/basi). " : "") +
        (hasPackagingLeakSevere ? "Kemasan bocor parah atau segel rusak. " : "") +
        (hasColdChainBroken ? "Cold chain terputus pada produk sensitif. " : ""),
      badge: {
        label: "Tidak Layak Konsumsi",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-300",
        dot: "bg-red-500"
      }
    };
  }
  
  // Hitung jam sejak produksi
  const now = new Date();
  let hoursSinceProduction = 0;
  
  if (productionTime) {
    try {
      const [hours, minutes] = productionTime.split(":").map(Number);
      const productionDate = new Date();
      productionDate.setHours(hours, minutes, 0, 0);
      
      // Jika waktu produksi lebih besar dari waktu sekarang, berarti kemarin
      if (productionDate > now) {
        productionDate.setDate(productionDate.getDate() - 1);
      }
      
      hoursSinceProduction = (now.getTime() - productionDate.getTime()) / (1000 * 60 * 60);
    } catch (e) {
      hoursSinceProduction = 0;
    }
  }
  
  // ATURAN 1: Fresh - Baru diproduksi (<2 jam), kondisi sangat baik
  if (
    hoursSinceProduction < 2 &&
    packagingCondition === "sangat_baik" &&
    appearance >= 8 &&
    aroma === "segar" &&
    storageMethod === "dingin"
  ) {
    return {
      status: "Fresh",
      canPublish: true,
      reason: "Produk baru diproduksi dan dalam kondisi sangat baik. Dapat dijual dengan harga optimal.",
      badge: {
        label: "Fresh",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        dot: "bg-emerald-500"
      }
    };
  }
  
  // ATURAN 2: Layak Dijual - Masih dalam masa simpan (2-6 jam)
  if (
    hoursSinceProduction >= 2 &&
    hoursSinceProduction < 6 &&
    packagingCondition !== "rusak" &&
    appearance >= 6 &&
    (aroma === "segar" || aroma === "normal")
  ) {
    return {
      status: "Layak Dijual",
      canPublish: true,
      reason: "Produk masih dalam masa simpan optimal dan kondisi layak untuk dijual.",
      badge: {
        label: "Layak Dijual",
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-300",
        dot: "bg-green-500"
      }
    };
  }
  
  // ATURAN 3: Segera Dijual - Mendekati batas konsumsi (6-12 jam)
  if (
    hoursSinceProduction >= 6 &&
    hoursSinceProduction < 12 &&
    appearance >= 5 &&
    packagingCondition !== "rusak"
  ) {
    return {
      status: "Segera Dijual",
      canPublish: true,
      reason: "Produk mendekati batas waktu konsumsi. Disarankan dijual dengan diskon lebih tinggi untuk penjualan cepat.",
      badge: {
        label: "Segera Dijual",
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-300",
        dot: "bg-amber-500"
      }
    };
  }
  
  // ATURAN 4: Tidak Disarankan Dijual - Risiko sedang (12-18 jam)
  if (
    hoursSinceProduction >= 12 &&
    hoursSinceProduction < 18 &&
    appearance >= 4
  ) {
    return {
      status: "Tidak Disarankan Dijual",
      canPublish: false,
      reason: "Produk sudah melewati masa simpan optimal. Sebaiknya tidak dijual untuk konsumsi. Pertimbangkan jalur recovery lain.",
      badge: {
        label: "Tidak Disarankan",
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-300",
        dot: "bg-orange-500"
      }
    };
  }
  
  // ATURAN 5: Tidak Layak Konsumsi - Risiko tinggi (>18 jam atau kondisi buruk)
  return {
    status: "Tidak Layak Konsumsi",
    canPublish: false,
    reason: "Produk sudah melewati batas konsumsi aman atau kondisi tidak memadai. Tidak boleh dijual untuk konsumsi manusia.",
    badge: {
      label: "Tidak Layak Konsumsi",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-300",
      dot: "bg-red-500"
    }
  };
}

// FUNGSI LAMA: Tetap ada untuk backward compatibility (akan dihapus nanti)
function calcRescueScore(a) {
  let score = 0;
  if (a.packaging === "sangat_baik") score += 30;
  else if (a.packaging === "cukup") score += 18;
  else if (a.packaging === "rusak") score += 5;
  score += Math.round((a.appearance / 10) * 20);
  if (a.aroma === "segar") score += 20;
  else if (a.aroma === "normal") score += 12;
  else if (a.aroma === "berkurang") score += 4;
  if (a.storage === "dingin") score += 15;
  else if (a.storage === "suhu_ruang") score += 9;
  else if (a.storage === "panas") score += 5;
  if (a.freeContamination) score += 10;
  score += Math.round((a.cleanlinessItems.length / CLEANLIST.length) * 5);
  return Math.min(score, 100);
}

function scoreStatus(score) {
  if (score >= 80) return { label: "Layak Dikonsumsi", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" };
  if (score >= 60) return { label: "Layak dengan Catatan", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" };
  return { label: "Tidak Direkomendasikan", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" };
}

// FUNGSI BARU: Dynamic Discount berdasarkan Food Trust Index (sesuai PRD)
function calculateDynamicDiscount(
  trustStatus,
  originalPrice,
  minimumPrice = 0
) {
  
  let discount = 0;
  let reason = "";
  
  // Tabel diskon dari PRD (baris 416-423)
  switch (trustStatus) {
    case "Fresh":
      discount = 15; // 10-20% (ambil tengah)
      reason = "Produk dalam kondisi fresh. Diskon standar untuk food rescue.";
      break;
      
    case "Layak Dijual":
      discount = 27; // 20-35% (ambil tengah)
      reason = "Produk masih layak dijual. Diskon menarik untuk mempercepat penjualan.";
      break;
      
    case "Segera Dijual":
      discount = 42; // 35-50% (ambil tengah)
      reason = "Produk mendekati batas konsumsi. Diskon tinggi untuk penjualan cepat dan menghindari food waste.";
      break;
      
    case "Tidak Disarankan Dijual":
    case "Tidak Layak Konsumsi":
      return {
        discount: 0,
        rescuePrice: 0,
        reason: "Produk tidak boleh dijual untuk konsumsi manusia. Pertimbangkan jalur recovery lain seperti donasi atau kompos."
      };
      
    default:
      discount = 20;
      reason = "Diskon default untuk produk food rescue.";
  }
  
  let rescuePrice = originalPrice * (1 - discount / 100);
  
  // Check minimum price constraint (guardrail dari PRD)
  if (minimumPrice > 0 && rescuePrice < minimumPrice) {
    const adjustedDiscount = ((originalPrice - minimumPrice) / originalPrice) * 100;
    return {
      discount: Math.round(adjustedDiscount),
      rescuePrice: minimumPrice,
      reason: `${reason} Harga disesuaikan dengan harga minimum yang ditetapkan UMKM (Rp ${minimumPrice.toLocaleString("id-ID")}).`
    };
  }
  
  return {
    discount: Math.round(discount),
    rescuePrice: Math.round(rescuePrice),
    reason
  };
}

// FUNGSI LAMA: Tetap ada untuk backward compatibility (akan dihapus nanti)
function estimateDiscount(score) {
  if (score >= 85) return 30;
  if (score >= 70) return 40;
  if (score >= 55) return 55;
  return 70;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>Savora</div>
            <div className="text-[10px] text-muted-foreground leading-none">Food Rescue Platform</div>
          </div>
        </div>
      </div>

      {/* Merchant info */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Warung Segar Ibu Sari</div>
            <div className="text-[10px] text-muted-foreground">Jakarta Selatan</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Menu Utama</div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-0.5">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Store className="w-4 h-4" />
          Profil Toko
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
          <LogOut className="w-4 h-4" />
          Logout
        </a>
      </div>
    </aside>
  );
}

function TopNav({ step }) {
  const steps = [
    { n: 1, label: "Informasi Produk" },
    { n: 2, label: "Penilaian Kelayakan" },
    { n: 3, label: "Hasil Penilaian" },
  ];

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-card border-b border-border z-20 flex items-center px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-1">
        <span className="hover:text-foreground cursor-pointer transition-colors">Produk</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Tambah Produk</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 bg-muted/60 rounded-xl px-3 py-1.5">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
              s.n === step
                ? "bg-primary text-white"
                : s.n < step
                ? "text-primary"
                : "text-muted-foreground"
            }`}>
              {s.n < step ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s.n === step ? "bg-white/20" : "bg-muted-foreground/20"
                }`}>{s.n}</span>
              )}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className={`w-3 h-3 ${s.n < step ? "text-primary" : "text-muted-foreground/40"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">IS</span>
        </div>
      </div>
    </header>
  );
}

// ─── Step 1: Form Fields ──────────────────────────────────────────────────────

function ProductTypeToggle({
  value,
  onChange,
}: {
  value;
  onChange;
}) {
  return (
    <div className="flex rounded-xl border border-border overflow-hidden">
      {(["reguler", "mystery"] as ProductType[]).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all ${
            value === t
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          {t === "reguler" ? "Produk Reguler" : "Mystery Food Box"}
        </button>
      ))}
    </div>
  );
}

function PhotoUpload({
  url,
  onChange,
}: {
  url| null;
  onChange;
}) {
  const ref = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      onClick={() => ref.current?.click()}
      className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
        url ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      style={{ minHeight: 140 }}
    >
      <input ref={ref} type="file" className="hidden" accept="image/*" onChange={handleFile} />
      {url ? (
        <>
          <img src={url} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
          <button
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-red-50 z-10"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Klik untuk upload foto produk</p>
            <p className="text-xs text-muted-foreground mt-0.5">Maks. 5MB (JPG, PNG, WebP) · Gunakan foto asli</p>
          </div>
        </>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
  hint,
}: {
  label;
  children;
  hint;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  prefix,
  type = "text",
}: {
  value;
  onChange;
  placeholder;
  prefix;
  type;
}) {
  return (
    <div className="flex items-center border border-border rounded-lg bg-input-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="px-3 text-sm text-muted-foreground border-r border-border bg-muted py-2.5">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value;
  onChange;
  options;
  placeholder;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-input-background appearance-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-8"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function QuantityControl({
  value,
  onChange,
}: {
  value;
  onChange;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 text-center py-2 text-sm font-semibold border border-border rounded-lg bg-input-background">
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(999, value + 1))}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-colors text-primary"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function TagSelector({
  selected,
  onChange,
  options,
}: {
  selected;
  onChange;
  options;
}) {
  function toggle(tag) {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            selected.includes(tag)
              ? "bg-primary text-white border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
          }`}
        >
          {selected.includes(tag) && <Check className="inline w-2.5 h-2.5 mr-1" />}
          {tag}
        </button>
      ))}
    </div>
  );
}

function AllergenGrid({
  selected,
  onChange,
}: {
  selected;
  onChange;
}) {
  function toggle(a) {
    onChange(
      selected.includes(a) ? selected.filter((x) => x !== a) : [...selected, a]
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALLERGEN_OPTIONS.map((a) => (
        <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => toggle(a)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              selected.includes(a)
                ? "bg-primary border-primary"
                : "border-border group-hover:border-primary/50"
            }`}
          >
            {selected.includes(a) && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
          <span className="text-sm text-foreground">{a}</span>
        </label>
      ))}
    </div>
  );
}

function QualityChecklist({ checked, onChange }) {
  const items = [
    "Produk masih dalam kondisi layak konsumsi",
    "Disimpan sesuai standar kebersihan (HACCP)",
    "Belum melewati batas aman konsumsi (Expiry)",
  ];
  return (
    <div className="bg-secondary rounded-xl p-4 border border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-primary">Jaminan Kualitas</span>
      </div>
      <ul className="space-y-2 mb-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-xs text-foreground/80">{item}</span>
          </li>
        ))}
      </ul>
      <label className="flex items-start gap-2.5 cursor-pointer">
        <div
          onClick={() => onChange(!checked)}
          className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            checked ? "bg-primary border-primary" : "border-primary/50"
          }`}
        >
          {checked && <Check className="w-2.5 h-2.5 text-white" />}
        </div>
        <span className="text-xs text-foreground/70 leading-relaxed">
          Saya menjamin bahwa produk ini memenuhi standar keamanan pangan Lestari Market.
        </span>
      </label>
    </div>
  );
}

// ─── Product Preview Card ─────────────────────────────────────────────────────

function ProductPreviewCard({
  form,
  score,
}: {
  form;
  score| null;
}) {
  const isMystery = form.productType === "mystery";
  const name = isMystery
    ? (form.mysteryName || "Mystery Food Box")
    : (form.name || "Nama Produk");
  const category = isMystery
    ? (form.mysteryCategory || "Bakery & Pastry")
    : (form.category || "Kategori");
  const rescuePrice = isMystery ? form.rescuePrice : form.rescuePrice;
  const normalPrice = isMystery ? form.mysteryEstWeight : form.normalPrice;

  const discount = form.normalPrice && form.rescuePrice
    ? Math.round((1 - parseInt(form.rescuePrice.replace(/\D/g, ""), 10) / parseInt(form.normalPrice.replace(/\D/g, ""), 10)) * 100)
    : 0;

  return (
    <div className="sticky top-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Preview Produk</h3>
        <div className="flex items-center gap-1 text-xs text-primary">
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </div>
      </div>

      {/* Card preview */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Image area */}
        <div className="relative bg-muted" style={{ height: 160 }}>
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="product" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground/40">Tambah foto produk</p>
              </div>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              FOOD RESCUE
            </span>
            {isMystery && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                MYSTERY
              </span>
            )}
          </div>
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </div>
          )}
          {score !== null && (
            <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-foreground">{score}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Tags */}
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {form.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] font-medium bg-secondary text-primary px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h4 className="font-bold text-foreground text-sm mb-0.5 leading-tight">{name}</h4>
          <p className="text-xs text-muted-foreground mb-3">{category}</p>

          {/* Price */}
          <div className="mb-3">
            <div className="text-base font-bold text-primary">
              Rp {rescuePrice ? fmt(rescuePrice) : "–"}
            </div>
            {form.normalPrice && !isMystery && (
              <div className="text-xs text-muted-foreground line-through">
                Rp {fmt(form.normalPrice)}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-2.5">
            {!isMystery ? (
              <>
                {form.portion && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {form.portion}
                  </span>
                )}
                {form.weight && (
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    {form.weight}
                  </span>
                )}
                {form.quantity > 0 && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Sisa {form.quantity}
                  </span>
                )}
              </>
            ) : (
              <>
                {form.mysteryEstWeight && (
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    ~{form.mysteryEstWeight}
                  </span>
                )}
                {form.mysteryEstPortion && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {form.mysteryEstPortion}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Completeness */}
      <div className="mt-4 bg-card rounded-xl border border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Kelengkapan Data</span>
          <span className="text-xs font-bold text-primary">
            {Math.round(
              ([
                form.name || form.mysteryName,
                form.photoUrl,
                form.description,
                form.category || form.mysteryCategory,
                form.rescuePrice,
                form.expiryDate,
              ].filter(Boolean).length /
                6) *
                100
            )}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{
              width: `${Math.round(
                ([
                  form.name || form.mysteryName,
                  form.photoUrl,
                  form.description,
                  form.category || form.mysteryCategory,
                  form.rescuePrice,
                  form.expiryDate,
                ].filter(Boolean).length /
                  6) *
                  100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-0.5">Tips Penjualan</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              Foto produk berkualitas tinggi meningkatkan klik sebesar 3x lebih banyak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 Component ─────────────────────────────────────────────────────────

function Step1Form({
  form,
  setForm,
  onNext,
}: {
  form;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const isMystery = form.productType === "mystery";

  function set<K extends keyof FormData>(key: K, value[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Left: Form */}
      <div className="col-span-3 space-y-5">
        {/* Section card: Jenis Produk */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>
            Informasi Produk
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Pilih jenis produk yang akan kamu tambahkan.</p>

          <FormField label="Jenis Produk">
            <ProductTypeToggle value={form.productType} onChange={(v) => set("productType", v)} />
          </FormField>
        </div>

        {/* Section card: Foto & Nama */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
            Foto & Detail Produk
          </h3>

          <FormField label="Foto Produk" hint="Upload 1–3 foto terbaik produk kamu">
            <PhotoUpload url={form.photoUrl} onChange={(v) => set("photoUrl", v)} />
          </FormField>

          {!isMystery ? (
            <>
              <FormField label="Nama Produk">
                <Input
                  value={form.name}
                  onChange={(v) => set("name", v)}
                  placeholder="Contoh: Nasi Goreng Kampung Spesial"
                />
              </FormField>
              <FormField label="Deskripsi Produk" hint="Jelaskan detail bahan, porsi, dan alasan rescue produk">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Jelaskan detail bahan, porsi, dan alasan rescue produk ini..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-input-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
                />
              </FormField>
            </>
          ) : (
            <>
              <FormField label="Nama Mystery Box">
                <Input
                  value={form.mysteryName}
                  onChange={(v) => set("mysteryName", v)}
                  placeholder="Contoh: Mystery Food Box"
                />
              </FormField>
              <FormField label="Deskripsi Singkat" hint="Ceritakan keunikan atau kejutan box">
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Ceritakan keunikan kejutan box Anda..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-input-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
                />
              </FormField>
            </>
          )}
        </div>

        {/* Section card: Kategori & Tanggal */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Kategori & Waktu Produksi
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label={isMystery ? "Kategori Mystery" : "Kategori"}>
              <Select
                value={isMystery ? form.mysteryCategory : form.category}
                onChange={(v) => set(isMystery ? "mysteryCategory" : "category", v)}
                options={isMystery ? MYSTERY_CATEGORIES : CATEGORIES}
                placeholder="Pilih Kategori"
              />
            </FormField>
            <FormField label="Jam Produksi" hint="Jam saat makanan selesai diproduksi">
              <Input
                value={form.productionTime}
                onChange={(v) => set("productionTime", v)}
                type="time"
                placeholder="14:00"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Tanggal Kedaluwarsa">
              <Input
                value={form.expiryDate}
                onChange={(v) => set("expiryDate", v)}
                type="date"
              />
            </FormField>
          </div>
        </div>

        {/* Section card: Harga & Stok */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Harga & Stok
          </h3>
          {!isMystery ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField label="Harga Normal (Rp)">
                  <Input
                    value={form.normalPrice}
                    onChange={(v) => set("normalPrice", v)}
                    placeholder="45.000"
                    prefix="Rp"
                  />
                </FormField>
                <FormField label="Harga Rescue (Rp)">
                  <div className="space-y-1.5">
                    <div className="flex items-center border border-primary/60 rounded-lg bg-primary/5 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <span className="px-3 text-sm text-primary border-r border-primary/20 bg-primary/10 py-2.5 font-medium">Rp</span>
                      <input
                        value={form.rescuePrice}
                        onChange={(e) => set("rescuePrice", e.target.value)}
                        placeholder="22.500"
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60 text-primary font-semibold"
                      />
                    </div>
                    {form.normalPrice && form.rescuePrice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Diskon:</span>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          -{Math.round((1 - parseInt(form.rescuePrice.replace(/\D/g, ""), 10) / parseInt(form.normalPrice.replace(/\D/g, ""), 10)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </FormField>
                <FormField label="Harga Minimum (Rp)" hint="Batas harga terendah yang bisa diterima">
                  <Input
                    value={form.minimumPrice}
                    onChange={(v) => set("minimumPrice", v)}
                    placeholder="15.000"
                    prefix="Rp"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Jumlah Produk">
                  <QuantityControl value={form.quantity} onChange={(v) => set("quantity", v)} />
                </FormField>
                <FormField label="Berat">
                  <Input value={form.weight} onChange={(v) => set("weight", v)} placeholder="500g" />
                </FormField>
                <FormField label="Porsi">
                  <Input value={form.portion} onChange={(v) => set("portion", v)} placeholder="1–2 porsi" />
                </FormField>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="Nilai Produk (Rp)">
                  <Input
                    value={form.normalPrice}
                    onChange={(v) => set("normalPrice", v)}
                    placeholder="100.000"
                    prefix="Rp"
                  />
                </FormField>
                <FormField label="Harga Rescue (Rp)">
                  <div className="space-y-1.5">
                    <div className="flex items-center border border-primary/60 rounded-lg bg-primary/5 overflow-hidden">
                      <span className="px-3 text-sm text-primary border-r border-primary/20 bg-primary/10 py-2.5 font-medium">Rp</span>
                      <input
                        value={form.rescuePrice}
                        onChange={(e) => set("rescuePrice", e.target.value)}
                        placeholder="50.000"
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60 text-primary font-semibold"
                      />
                    </div>
                    {form.normalPrice && form.rescuePrice && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full inline-block">
                        -{Math.round((1 - parseInt(form.rescuePrice.replace(/\D/g, ""), 10) / parseInt(form.normalPrice.replace(/\D/g, ""), 10)) * 100)}%
                      </span>
                    )}
                  </div>
                </FormField>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField label="Jumlah Box">
                  <QuantityControl value={form.quantity} onChange={(v) => set("quantity", v)} />
                </FormField>
                <FormField label="Estimasi Berat">
                  <Input value={form.mysteryEstWeight} onChange={(v) => set("mysteryEstWeight", v)} placeholder="800g – 1kg" />
                </FormField>
                <FormField label="Estimasi Porsi">
                  <Input value={form.mysteryEstPortion} onChange={(v) => set("mysteryEstPortion", v)} placeholder="2–3 Orang" />
                </FormField>
              </div>
              <FormField label="Kemungkinan Isi Box" hint="Contoh: Aneka Croissant, Danish, atau Sourdough bread">
                <textarea
                  value={form.mysteryContents}
                  onChange={(e) => set("mysteryContents", e.target.value)}
                  placeholder="Contoh: Aneka Croissant, Danish, atau Sourdough bread..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-input-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
                />
              </FormField>
            </>
          )}
        </div>

        {/* Section card: Tag & Alergen */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
            Tag & Informasi Tambahan
          </h3>

          <FormField label="Tag Produk" hint="Pilih semua yang sesuai">
            <TagSelector
              selected={form.tags}
              onChange={(v) => set("tags", v)}
              options={PRODUCT_TAGS}
            />
          </FormField>

          <div className="pt-1">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <label className="text-sm font-semibold text-foreground">Informasi Alergen</label>
            </div>
            <AllergenGrid
              selected={form.allergens}
              onChange={(v) => set("allergens", v)}
            />
          </div>
        </div>

        {/* Jaminan Kualitas */}
        <QualityChecklist
          checked={form.qualityChecked}
          onChange={(v) => set("qualityChecked", v)}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <button className="px-5 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Simpan Draft
          </button>
          <button
            onClick={onNext}
            disabled={!form.qualityChecked}
            className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Lanjut Penilaian
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="col-span-2">
        <ProductPreviewCard form={form} score={null} />
      </div>
    </div>
  );
}

// ─── Step 2: Assessment ───────────────────────────────────────────────────────

function AssessmentRadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label;
  options: { value; label; icon? }[];
  value| null;
  onChange;
}) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              value === o.value
                ? "bg-primary text-white border-primary"
                : "bg-card border-border text-foreground hover:border-primary/40"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  leftLabel,
  rightLabel,
}: {
  label;
  value;
  onChange;
  min;
  max;
  leftLabel;
  rightLabel;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        <span className="text-sm font-bold text-primary bg-secondary px-2 py-0.5 rounded-lg">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

function Step2Assessment({
  data,
  setData,
  onBack,
  onNext,
}: {
  data;
  setData: React.Dispatch<React.SetStateAction<AssessmentData>>;
  onBack: () => void;
  onNext: () => void;
}) {
  function set<K extends keyof AssessmentData>(key: K, value[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleClean(item) {
    setData((prev) => ({
      ...prev,
      cleanlinessItems: prev.cleanlinessItems.includes(item)
        ? prev.cleanlinessItems.filter((x) => x !== item)
        : [...prev.cleanlinessItems, item],
    }));
  }

  const canProceed =
    data.packaging !== null &&
    data.aroma !== null &&
    data.storage !== null &&
    data.shelfLife !== "" &&
    data.confirmSafe;

  // Check if any safety gate is triggered
  const hasSafetyGateIssue = data.hasMoldOrSlime || data.hasAbnormalAroma || data.hasPackagingLeakSevere || data.hasColdChainBroken;

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-3 space-y-5">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
                Penilaian Kelayakan Pangan
              </h2>
              <p className="text-xs text-muted-foreground">Pastikan makanan masih memenuhi standar keamanan pangan sebelum dipublikasikan.</p>
            </div>
          </div>
        </div>

        {/* CRITICAL SAFETY GATES - BARU */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-red-700" style={{ fontFamily: "Manrope, sans-serif" }}>
              Pemeriksaan Keamanan Kritis
            </h3>
          </div>
          <p className="text-xs text-red-600 mb-4">
            Jika salah satu kondisi di bawah ini terjadi, produk TIDAK DAPAT dipublikasikan.
          </p>
          
          <div className="space-y-3">
            {/* Checkbox 1: Jamur/Lendir */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-red-100 hover:bg-red-50/50 transition-colors">
              <div
                onClick={() => set("hasMoldOrSlime", !data.hasMoldOrSlime)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  data.hasMoldOrSlime ? "bg-red-600 border-red-600" : "border-red-300"
                }`}
              >
                {data.hasMoldOrSlime && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Ada Jamur atau Lendir</p>
                <p className="text-xs text-muted-foreground">Produk menunjukkan tanda-tanda jamur atau lendir</p>
              </div>
            </label>

            {/* Checkbox 2: Aroma Tidak Normal */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-red-100 hover:bg-red-50/50 transition-colors">
              <div
                onClick={() => set("hasAbnormalAroma", !data.hasAbnormalAroma)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  data.hasAbnormalAroma ? "bg-red-600 border-red-600" : "border-red-300"
                }`}
              >
                {data.hasAbnormalAroma && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Aroma Tidak Normal</p>
                <p className="text-xs text-muted-foreground">Aroma busuk, asam, tengik, atau basi</p>
              </div>
            </label>

            {/* Checkbox 3: Kemasan Bocor Parah */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-red-100 hover:bg-red-50/50 transition-colors">
              <div
                onClick={() => set("hasPackagingLeakSevere", !data.hasPackagingLeakSevere)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  data.hasPackagingLeakSevere ? "bg-red-600 border-red-600" : "border-red-300"
                }`}
              >
                {data.hasPackagingLeakSevere && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Kemasan Bocor Parah</p>
                <p className="text-xs text-muted-foreground">Kemasan rusak berat, segel terbuka, atau bocor signifikan</p>
              </div>
            </label>

            {/* Checkbox 4: Cold Chain Terputus */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-red-100 hover:bg-red-50/50 transition-colors">
              <div
                onClick={() => set("hasColdChainBroken", !data.hasColdChainBroken)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  data.hasColdChainBroken ? "bg-red-600 border-red-600" : "border-red-300"
                }`}
              >
                {data.hasColdChainBroken && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Cold Chain Terputus</p>
                <p className="text-xs text-muted-foreground">Produk yang seharusnya dingin pernah tidak disimpan di suhu yang tepat</p>
              </div>
            </label>
          </div>

          {/* Warning jika ada yang checked */}
          {hasSafetyGateIssue && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
              <CircleAlert className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-red-700">
                PERINGATAN: Produk ini TIDAK DAPAT dipublikasikan karena tidak memenuhi standar keamanan pangan.
              </p>
            </div>
          )}
        </div>

        {/* Kondisi Kemasan */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <AssessmentRadioGroup
            label="1. Kondisi Kemasan"
            value={data.packaging}
            onChange={(v) => set("packaging", v as AssessmentData["packaging"])}
            options={[
              { value: "sangat_baik", label: "Sangat Baik", icon: <CheckCircle2 className="w-4 h-4" /> },
              { value: "cukup", label: "Cukup", icon: <Info className="w-4 h-4" /> },
              { value: "rusak", label: "Rusak", icon: <AlertTriangle className="w-4 h-4" /> },
            ]}
          />
        </div>

        {/* Penampilan */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <SliderField
            label="2. Penampilan Makanan"
            value={data.appearance}
            onChange={(v) => set("appearance", v)}
            leftLabel="Kurang Layak"
            rightLabel="Sangat Segar"
          />
        </div>

        {/* Aroma */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-foreground">3. Aroma</label>
            <div className="space-y-2">
              {[
                { value: "segar", label: "Segar & Wangi Khas" },
                { value: "normal", label: "Normal (Tanpa Bau Asing)" },
                { value: "berkurang", label: "Aroma Berkurang" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => set("aroma", opt.value as AssessmentData["aroma"])}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      data.aroma === opt.value
                        ? "border-primary"
                        : "border-border group-hover:border-primary/50"
                    }`}
                  >
                    {data.aroma === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Suhu & Masa Simpan */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-5">
          <AssessmentRadioGroup
            label="4. Suhu Penyimpanan"
            value={data.storage}
            onChange={(v) => set("storage", v as AssessmentData["storage"])}
            options={[
              { value: "dingin", label: "Dingin (Chilled)", icon: <Thermometer className="w-4 h-4" /> },
              { value: "suhu_ruang", label: "Suhu Ruang", icon: <Thermometer className="w-4 h-4" /> },
              { value: "panas", label: "Panas (Heated)", icon: <Flame className="w-4 h-4" /> },
            ]}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">5. Sisa Masa Simpan</label>
            <div className="relative">
              <select
                value={data.shelfLife}
                onChange={(e) => set("shelfLife", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-input-background appearance-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-8"
              >
                <option value="">Pilih durasi...</option>
                <option value="lt2">Kurang dari 2 jam</option>
                <option value="2-6">2–6 jam</option>
                <option value="6-24">6–24 jam</option>
                <option value="1-3d">1–3 hari</option>
                <option value="gt3d">Lebih dari 3 hari</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Kontaminasi */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <label className="block text-sm font-semibold text-foreground mb-3">6. Bebas Kontaminasi</label>
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
            <div
              onClick={() => set("freeContamination", !data.freeContamination)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                data.freeContamination ? "bg-primary border-primary" : "border-border"
              }`}
            >
              {data.freeContamination && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Bebas Kontaminasi</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Saya menjamin tidak ada benda asing (rambut, debu, dsb) atau tanda-tanda kerusakan biologis.
              </p>
            </div>
          </label>
        </div>

        {/* Kebersihan */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <label className="block text-sm font-semibold text-foreground mb-3">7. Checklist Kebersihan</label>
          <div className="space-y-2.5">
            {CLEANLIST.map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => toggleClean(item)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    data.cleanlinessItems.includes(item)
                      ? "bg-primary border-primary"
                      : "border-border group-hover:border-primary/50"
                  }`}
                >
                  {data.cleanlinessItems.includes(item) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ada Kuah/Saus - FIELD BARU */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <label className="block text-sm font-semibold text-foreground mb-3">8. Karakteristik Produk</label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
            <div
              onClick={() => set("hasSauceOrGravy", !data.hasSauceOrGravy)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                data.hasSauceOrGravy ? "bg-primary border-primary" : "border-border"
              }`}
            >
              {data.hasSauceOrGravy && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Produk Berkuah atau Mengandung Saus</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centang jika produk memiliki kuah, saus, atau cairan yang dapat mempengaruhi daya tahan
              </p>
            </div>
          </label>
        </div>

        {/* Konfirmasi */}
        <div className="bg-secondary rounded-2xl border border-primary/20 p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              onClick={() => set("confirmSafe", !data.confirmSafe)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                data.confirmSafe ? "bg-primary border-primary" : "border-primary/50"
              }`}
            >
              {data.confirmSafe && <Check className="w-3 h-3 text-white" />}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Saya memastikan makanan masih aman dan layak dikonsumsi sesuai standar Savora Food Rescue Platform.
            </p>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 pb-8">
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Kembali
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Lihat Skor
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right guide */}
      <div className="col-span-2">
        <div className="sticky top-24 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Panduan Penilaian</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, title: "Kemasan Baik", desc: "Tidak ada kerusakan, sobekan, atau tanda kontaminasi" },
                { icon: <Eye className="w-4 h-4 text-blue-500" />, title: "Penampilan Segar", desc: "Warna, tekstur, dan tampilan masih menarik dan layak" },
                { icon: <Leaf className="w-4 h-4 text-green-500" />, title: "Aroma Normal", desc: "Tidak ada bau asing, asam, atau basi" },
                { icon: <Thermometer className="w-4 h-4 text-orange-500" />, title: "Suhu Tepat", desc: "Disimpan pada suhu yang sesuai jenis makanan" },
              ].map((g) => (
                <div key={g.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{g.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">Penting</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Penilaian kelayakan pangan adalah tanggung jawab moral merchant. Pastikan data yang diisi akurat demi keselamatan pembeli.
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-foreground mb-3">Progress Penilaian</p>
            <div className="space-y-2">
              {[
                { label: "Kondisi Kemasan", done: data.packaging !== null },
                { label: "Penampilan", done: data.appearance > 0 },
                { label: "Aroma", done: data.aroma !== null },
                { label: "Suhu Penyimpanan", done: data.storage !== null },
                { label: "Sisa Masa Simpan", done: data.shelfLife !== "" },
                { label: "Bebas Kontaminasi", done: data.freeContamination },
                { label: "Konfirmasi", done: data.confirmSafe },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? "bg-primary" : "bg-muted border border-border"}`}>
                    {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Results ──────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const status = scoreStatus(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>{score}</span>
          <span className="text-xs text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold ${status.bg} ${status.color} ${status.border}`}>
        {status.label}
      </div>
    </div>
  );
}

function Step3Results({
  form,
  assessment,
  onBack,
  onPublish,
}: {
  form;
  assessment;
  onBack: () => void;
  onPublish: () => void;
}) {
  // Hitung Food Trust Index (BARU) dengan Safety Gates
  const trustResult = calculateFoodTrustIndex(
    form.category,
    form.productionTime,
    assessment.storage,
    assessment.packaging,
    assessment.appearance,
    assessment.aroma,
    assessment.hasSauceOrGravy,
    // Critical Safety Gates
    assessment.hasMoldOrSlime,
    assessment.hasAbnormalAroma,
    assessment.hasPackagingLeakSevere,
    assessment.hasColdChainBroken
  );

  // Hitung Dynamic Discount (BARU)
  const normalPrice = parseInt(form.normalPrice.replace(/\D/g, ""), 10) || 0;
  const minimumPrice = parseInt(form.minimumPrice.replace(/\D/g, ""), 10) || 0;
  const discountResult = calculateDynamicDiscount(trustResult.status, normalPrice, minimumPrice);

  // Backward compatibility: tetap hitung score lama untuk bagian yang belum diupdate
  const score = calcRescueScore(assessment);
  const status = scoreStatus(score);

  const summaryItems = [
    { label: "Kondisi Kemasan", val: assessment.packaging === "sangat_baik" ? "Sangat Baik" : assessment.packaging === "cukup" ? "Cukup" : "Rusak", ok: assessment.packaging !== "rusak" },
    { label: "Penampilan", val: `${assessment.appearance}/10`, ok: assessment.appearance >= 6 },
    { label: "Aroma", val: assessment.aroma === "segar" ? "Segar & Wangi" : assessment.aroma === "normal" ? "Normal" : "Berkurang", ok: assessment.aroma !== "berkurang" },
    { label: "Suhu Penyimpanan", val: assessment.storage === "dingin" ? "Dingin" : assessment.storage === "suhu_ruang" ? "Suhu Ruang" : "Panas", ok: true },
    { label: "Bebas Kontaminasi", val: assessment.freeContamination ? "Ya" : "Tidak", ok: assessment.freeContamination },
    { label: "Kebersihan", val: `${assessment.cleanlinessItems.length}/${CLEANLIST.length} poin`, ok: assessment.cleanlinessItems.length >= 3 },
    { label: "Berkuah/Saus", val: assessment.hasSauceOrGravy ? "Ya" : "Tidak", ok: true }, // BARU
  ];

  // Rekomendasi berdasarkan Food Trust Index (BARU)
  const recommendations = trustResult.status === "Fresh"
    ? ["Produk dalam kondisi fresh dan siap dipublikasikan.", "Harga rescue sudah optimal untuk produk fresh.", "Tambahkan foto berkualitas untuk menarik pembeli."]
    : trustResult.status === "Layak Dijual"
    ? ["Produk layak dijual dan dapat segera dipublikasikan.", "Pertimbangkan promosi untuk mempercepat penjualan.", "Pastikan informasi pickup time jelas untuk customer."]
    : trustResult.status === "Segera Dijual"
    ? ["Publikasikan SEGERA! Waktu konsumsi sudah mendekati batas.", "Diskon tinggi akan meningkatkan kemungkinan terjual cepat.", "Pertimbangkan membuat Mystery Box jika ada produk serupa."]
    : trustResult.status === "Tidak Disarankan Dijual"
    ? ["Produk tidak disarankan untuk dipublikasikan.", "Pertimbangkan jalur recovery lain seperti donasi.", "Lakukan pencatatan di Waste Log untuk evaluasi."]
    : ["Produk tidak layak dijual untuk konsumsi manusia.", "JANGAN publikasikan produk ini.", "Catat di Waste Log dan pertimbangkan jalur recovery non-konsumsi."];

  return (
    <div className="grid grid-cols-5 gap-6">
      <div className="col-span-3 space-y-5">
        {/* Food Trust Index Card - BARU */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>
            Food Trust Index
          </h2>
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${trustResult.badge.border} ${trustResult.badge.bg}`}>
                <div className={`w-3 h-3 rounded-full ${trustResult.badge.dot}`} />
                <span className={`text-lg font-bold ${trustResult.badge.color}`}>
                  {trustResult.status}
                </span>
              </div>
              {trustResult.canPublish ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Dapat Dipublikasikan</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-semibold text-red-700">Tidak Dapat Dipublikasikan</span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Alasan:</strong> {trustResult.reason}
              </p>
            </div>

            {/* Disclaimer WAJIB dari PRD */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">Disclaimer</p>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Food Trust Index dihitung berdasarkan informasi yang diberikan UMKM dan aturan platform. 
                    Customer tetap disarankan memeriksa kondisi makanan saat pickup dan mengonsumsi sesuai 
                    batas waktu yang ditampilkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Card - BARU */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Rekomendasi Pricing
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Harga Normal</p>
              <p className="text-lg font-bold text-foreground">
                Rp {normalPrice ? fmt(String(normalPrice)) : "–"}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs text-red-600 mb-1">Diskon</p>
              <p className="text-2xl font-bold text-red-600">{discountResult.discount}%</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/30">
              <p className="text-xs text-primary mb-1">Harga Rescue</p>
              <p className="text-lg font-bold text-primary">
                Rp {discountResult.rescuePrice ? fmt(String(discountResult.rescuePrice)) : "–"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-1">Alasan Rekomendasi</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {discountResult.reason}
                </p>
              </div>
            </div>
          </div>

          {minimumPrice > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Harga Minimum UMKM:</strong> Rp {fmt(String(minimumPrice))}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
            Ringkasan Penilaian
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {summaryItems.map((item) => (
              <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl border ${item.ok ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {item.ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <CircleAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                  }
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </div>
                <span className={`text-xs font-semibold ${item.ok ? "text-emerald-600" : "text-red-600"}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight & Rekomendasi */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
            Insight & Rekomendasi Sistem
          </h3>
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary mb-1">Insight Otomatis</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {trustResult.status === "Fresh"
                    ? "Produk dalam kondisi prima! Segera publikasikan untuk mendapatkan eksposur maksimal di platform Savora."
                    : trustResult.status === "Layak Dijual"
                    ? "Produk masih memiliki daya tarik yang baik dan layak untuk dipublikasikan. Potensi terjual tinggi."
                    : trustResult.status === "Segera Dijual"
                    ? "⚠️ URGENT! Waktu konsumsi mendekati batas. Publikasikan SEGERA dengan diskon tinggi untuk penjualan cepat."
                    : trustResult.status === "Tidak Disarankan Dijual"
                    ? "Produk tidak disarankan untuk dijual. Pertimbangkan jalur recovery lain seperti donasi atau pencatatan waste log."
                    : "❌ Produk tidak layak dijual untuk konsumsi manusia. Jangan publikasikan produk ini."}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-foreground">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Publish */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trustResult.canPublish ? "bg-primary/10" : "bg-red-100"}`}>
              {trustResult.canPublish
                ? <CheckCircle2 className="w-5 h-5 text-primary" />
                : <AlertTriangle className="w-5 h-5 text-red-500" />
              }
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {trustResult.canPublish ? "Produk siap dipublikasikan" : "Produk tidak dapat dipublikasikan"}
              </p>
              <p className="text-xs text-muted-foreground">
                {trustResult.canPublish
                  ? "Semua data telah diverifikasi dan produk memenuhi standar Savora Food Rescue Platform."
                  : "Produk tidak memenuhi standar kelayakan. Pertimbangkan jalur recovery lain."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Kembali
            </button>
            <button
              onClick={onPublish}
              disabled={!trustResult.canPublish}
              className="flex-1 px-6 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publikasikan Produk
            </button>
          </div>
        </div>
        <div className="pb-8" />
      </div>

      {/* Right: Preview */}
      <div className="col-span-2">
        <ProductPreviewCard form={form} score={score} />
      </div>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-xl max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          Produk Berhasil Dipublikasikan!
        </h3>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Produk kamu sudah tampil di platform Savora dan siap ditemukan pembeli.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Lihat Produk
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
          >
            Tambah Lagi
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  productType: "reguler",
  photoUrl: null,
  name: "",
  description: "",
  category: "",
  expiryDate: "",
  productionTime: "", // BARU
  normalPrice: "",
  rescuePrice: "",
  minimumPrice: "", // BARU
  quantity: 1,
  weight: "",
  portion: "",
  tags: [],
  allergens: [],
  qualityChecked: false,
  mysteryName: "",
  mysteryEstWeight: "",
  mysteryEstPortion: "",
  mysteryContents: "",
  mysteryCategory: "",
};

const DEFAULT_ASSESSMENT = {
  // Critical Safety Gates - default false (produk aman)
  hasMoldOrSlime: false,
  hasAbnormalAroma: false,
  hasPackagingLeakSevere: false,
  hasColdChainBroken: false,
  
  // Regular assessment
  packaging: null,
  appearance: 5,
  aroma: null,
  storage: null,
  shelfLife: "",
  freeContamination: false,
  cleanlinessItems: [],
  confirmSafe: false,
  hasSauceOrGravy: false,
};

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [assessment, setAssessment] = useState<AssessmentData>(DEFAULT_ASSESSMENT);
  const [published, setPublished] = useState(false);

  function handlePublish() {
    setPublished(true);
  }

  function handleClose() {
    setPublished(false);
    setStep(1);
    setForm(DEFAULT_FORM);
    setAssessment(DEFAULT_ASSESSMENT);
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Sidebar />
      <TopNav step={step} />

      {/* Main content */}
      <main className="ml-60 pt-14 min-h-screen">
        <div className="px-8 py-6">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>
              Tambah Produk
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step === 1 && "Lengkapi informasi produk food rescue yang akan kamu jual."}
              {step === 2 && "Lakukan penilaian kelayakan pangan sebelum mempublikasikan produk."}
              {step === 3 && "Lihat hasil penilaian dan putuskan untuk mempublikasikan produk."}
            </p>
          </div>

          {step === 1 && (
            <Step1Form
              form={form}
              setForm={setForm}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Assessment
              data={assessment}
              setData={setAssessment}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3Results
              form={form}
              assessment={assessment}
              onBack={() => setStep(2)}
              onPublish={handlePublish}
            />
          )}
        </div>
      </main>

      {published && <SuccessModal onClose={handleClose} />}
    </div>
  );
}





