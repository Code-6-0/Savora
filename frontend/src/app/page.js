"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ChevronDown,
  Clock,
  Star,
  ChevronRight,
  Leaf,
  DollarSign,
  Footprints,
  ShoppingCart,
  Globe,
  Trees,
  Utensils,
  Lock,
} from "lucide-react";
import { fetchMarketplaceProducts, computeProductScore } from "@/lib/marketplace";

export default function BerandaPage() {
  const [products, setProducts] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMarketplaceProducts().then((result) => {
      setProducts(result.products || []);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const getFoodScoreBadge = (score) => {
    if (score >= 80) return { text: "Sangat Layak", color: "bg-emerald-500" };
    if (score >= 60) return { text: "Layak", color: "bg-blue-500" };
    if (score >= 35) return { text: "Segera Ambil", color: "bg-amber-500" };
    return { text: "Kritis", color: "bg-red-500" };
  };

  const topProducts = products.slice(0, 8);

  const categories = [
    { name: "Bakery", icon: "/categories/bakery.svg", bgColor: "bg-emerald-50", iconColor: "bg-emerald-600" },
    { name: "Resto", icon: "/categories/resto.svg", bgColor: "bg-orange-50", iconColor: "bg-orange-600" },
    { name: "UMKM", icon: "/categories/umkm.svg", bgColor: "bg-blue-50", iconColor: "bg-blue-600" },
    { name: "Dessert", icon: "/categories/dessert.svg", bgColor: "bg-pink-50", iconColor: "bg-pink-600" },
    { name: "Cafe", icon: "/categories/cafe.svg", bgColor: "bg-yellow-50", iconColor: "bg-yellow-600" },
    { name: "Snacks", icon: "/categories/snacks.svg", bgColor: "bg-green-50", iconColor: "bg-green-600" },
    { name: "Vegan", icon: "/categories/vegan.svg", bgColor: "bg-purple-50", iconColor: "bg-purple-600" },
    { name: "Fruits", icon: "/categories/fruits.svg", bgColor: "bg-red-50", iconColor: "bg-red-600" },
    { name: "Drinks", icon: "/categories/drinks.svg", bgColor: "bg-cyan-50", iconColor: "bg-cyan-600" },
  ];

  const faqs = [
    { tag: "Pengambilan", question: "Bagaimana jika merchant tidak bisa memenuhi pesanan?" },
    { tag: "Refund", question: "Bagaimana proses refund jika ada masalah?" },
    { tag: "Keamanan Makanan", question: "Apakah makanannya aman untuk dimakan?" },
    { tag: "Kemasan", question: "Kemasan apa yang akan digunakan untuk makanan saya?" },
    { tag: "Food Trust Score", question: "Apa itu Food Trust Score?" },
    { tag: "Pengambilan", question: "Berapa lama saya bisa mengambil pesanan?" },
    { tag: "Refund", question: "Apa saja syarat untuk mendapatkan refund?" },
    { tag: "Keamanan Makanan", question: "Bagaimana cara memeriksa kondisi makanan saat pickup?" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-200">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
              <img src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" alt="Savora Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tight text-emerald-950">Savora</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <Link href="/" className="text-emerald-600 font-semibold">Home</Link>
            <Link href="/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
            <a href="#mitra" className="hover:text-emerald-600 transition-colors">Mitra</a>
            <a href="#tentang" className="hover:text-emerald-600 transition-colors">Tentang</a>
          </nav>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition">
            <MapPin size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Masukkan Alamat Kamu</span>
            <ChevronDown size={16} className="text-slate-500" />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
              Masuk
            </Link>
            <Link href="/marketplace" className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-emerald-950 pt-24 pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            <span className="text-emerald-400">Selamatkan Makanan,</span>
            <br />
            <span className="text-white">Jaga Masa Depan</span>
          </h1>
          <p className="text-emerald-100/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Temukan makanan berkualitas dari restoran dan toko favoritmu dengan harga super hemat. Kurangi food waste sekarang juga!
          </p>

          <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-3 w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <Search className="text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Cari makanan atau resto terdekat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-lg"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap"
            >
              Cari Sekarang
            </button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 text-emerald-100/80 text-sm font-medium">
            <span>Populer:</span>
            {['Bakery', 'Vegan', 'Healthy Bowl', 'Dessert'].map(tag => (
              <span key={tag} className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Running Text Marquee */}
      <div className="bg-emerald-500 text-emerald-950 font-bold py-3 overflow-hidden whitespace-nowrap relative flex items-center">
        <div className="animate-marquee inline-block">
          <span className="mx-4">⚡ Dapatkan diskon hingga 50% untuk roti segar hari ini!</span>
          <span className="mx-4">🌱 Selamatkan 1kg makanan = Kurangi 2.5kg CO2</span>
          <span className="mx-4">⚡ Flash Sale: Menu Bento mulai Rp 15.000</span>
          <span className="mx-4">🌟 Partner baru bergabung: Roti O, Kopi Kenangan, dan 50+ lainnya!</span>
        </div>
      </div>

      {/* 4. Categories */}
      <section id="kategori" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Jelajahi Kategori</h2>
              <p className="text-slate-500">Temukan porsi lezat dari berbagai kategori</p>
            </div>
            <Link href="/marketplace" className="hidden sm:flex items-center gap-1 text-emerald-600 font-semibold hover:text-emerald-700 transition">
              Lihat Semua <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-20 h-20 rounded-2xl ${cat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-slate-100`}>
                  <div className={`w-8 h-8 ${cat.iconColor}`} style={{ maskImage: `url(${cat.icon})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: `url(${cat.icon})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Rekomendasi */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Rekomendasi Hari Ini</h2>
              <p className="text-slate-500">Porsi lezat dengan harga terbaik, selamatkan segera!</p>
            </div>
            <Link href="/marketplace" className="flex items-center gap-1 text-emerald-600 font-semibold hover:text-emerald-700 transition">
              Lihat Semua <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map((product) => {
              const now = Date.now();
              const { score, remainingSeconds } = computeProductScore(product, now, elapsed);
              const timerColor = remainingSeconds < 3600 ? "bg-red-500" : remainingSeconds < 10800 ? "bg-amber-500" : "bg-emerald-500";
              const rating = product.rating ?? (4.5 + ((product.id?.length ?? 0) % 5) * 0.1);
              const discountPercent = Math.round(((product.original_price - product.rescue_price) / product.original_price) * 100);

              return (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group relative flex flex-col">
                  <Link href={`/marketplace/${product.id}`} className="block relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={product.photo_url || '/placeholder.jpg'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className={`px-2.5 py-1 ${timerColor} text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-md`}>
                        <Clock size={12} /> {formatTimer(remainingSeconds)}
                      </div>
                      {score !== undefined && (
                        <div className={`px-2.5 py-1 ${score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-md`}>
                          <Leaf size={12} /> FRS {Math.round(score)}%
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md text-sm font-bold text-slate-700">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {rating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                      <MapPin size={14} />
                      <span className="truncate">{product.vendor}</span>
                      <span className="mx-1">•</span>
                      <span>{product.distanceKm} km</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400 line-through">
                            Rp {product.original_price.toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            -{discountPercent}%
                          </span>
                        </div>
                        <div className="text-xl font-black text-emerald-600">
                          Rp {product.rescue_price.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/marketplace/${product.id}`;
                        }}
                        className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                        aria-label="Tambah ke keranjang"
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Dampak Keberlanjutan */}
      <section id="tentang" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-emerald-50 rounded-l-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Dampak Keberlanjutan</h2>
            <p className="text-lg text-slate-500">
              Setiap pesananmu bukan hanya menyelamatkan makanan, tapi juga menyelamatkan bumi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Kontribusi Komunitas</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <div className="text-4xl font-black text-emerald-600 mb-2">1.2M+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Porsi Diselamatkan</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <div className="text-4xl font-black text-emerald-600 mb-2">450T</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emisi CO2 Dicegah</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-3">
                  <span>Target Zero Waste 2025</span>
                  <span className="text-emerald-600">65% Tercapai</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            <div className="bg-emerald-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/30 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-emerald-800/50 text-emerald-400 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Star size={24} />
                  </div>
                  <h3 className="text-2xl font-bold">Pencapaian Kamu</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-emerald-900/50 p-6 rounded-2xl border border-emerald-800/50 backdrop-blur-sm mb-8">
                  <div className="flex flex-col items-center justify-center w-24 h-24 bg-emerald-800 rounded-full border-4 border-emerald-500 shadow-lg shadow-emerald-500/20">
                    <Leaf size={32} className="text-emerald-400 mb-1" />
                    <span className="text-xs font-bold">LVL 5</span>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-lg text-emerald-100 mb-4 leading-relaxed">
                      Kamu sudah menyelamatkan setara dengan <span className="text-white font-bold bg-emerald-500/20 px-2 py-1 rounded">3 Pohon</span> minggu ini!
                    </p>
                    <div className="flex justify-center sm:justify-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600"><Trees size={18} /></div>
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white"><Utensils size={18} /></div>
                      <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center text-emerald-700"><Lock size={18} /></div>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard" className="block w-full py-4 text-center bg-white text-emerald-950 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
                  Lihat Dashboard Lengkap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Info Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
              <div className="w-14 h-14 bg-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mb-6">
                <Leaf size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Jaga Planet Kita</h3>
              <p className="text-slate-600 leading-relaxed">Setiap makanan yang diselamatkan mengurangi emisi gas rumah kaca dan membantu menjaga lingkungan untuk generasi mendatang.</p>
            </div>
            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
              <div className="w-14 h-14 bg-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hemat Uang Setiap Hari</h3>
              <p className="text-slate-600 leading-relaxed">Dapatkan makanan berkualitas dengan diskon hingga 50%. Harga transparan dengan breakdown service fee 5% sebelum checkout.</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
              <div className="w-14 h-14 bg-blue-200 text-blue-700 rounded-2xl flex items-center justify-center mb-6">
                <Footprints size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Jalan Kaki & Rescue</h3>
              <p className="text-slate-600 leading-relaxed">Ambil sendiri di lokasi terdekat. Self-pickup mengurangi jejak karbon dari delivery dan menjaga harga tetap terjangkau.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-emerald-950 text-emerald-100 pt-20 pb-10 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl bg-white/10">
                  <img src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" alt="Savora Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-3xl font-black text-white">Savora</span>
              </div>
              <p className="text-emerald-200/80 mb-8 max-w-sm leading-relaxed">
                Misi kami sederhana: Tidak boleh ada makanan enak yang terbuang sia-sia. Bergabunglah dengan ribuan penyelamat makanan lainnya di seluruh Indonesia.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center hover:bg-emerald-800 cursor-pointer transition">
                  <Globe size={18} />
                </div>
                <div className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center hover:bg-emerald-800 cursor-pointer transition">
                  <Globe size={18} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Layanan Kami</h4>
              <ul className="space-y-4">
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Daftar Marketplace</Link></li>
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Mitra Donasi</Link></li>
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Voucher & Promo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Informasi</h4>
              <ul className="space-y-4">
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Tentang Kami</Link></li>
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Bantuan & FAQ</Link></li>
                <li><Link href="/marketplace" className="text-emerald-200/80 hover:text-white transition">Syarat Ketentuan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Newsletter</h4>
              <p className="text-emerald-200/80 text-sm mb-4">Update promo penyelamatan makanan langsung di emailmu.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email kamu" className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-2 text-sm text-white placeholder:text-emerald-500 outline-none focus:border-emerald-500" />
                <button className="bg-emerald-600 text-white px-4 rounded-xl hover:bg-emerald-500 transition">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-500">
            <span>© 2026 Savora Platform. Proudly Made In Indonesia for the Earth.</span>
            <div className="flex gap-6 font-medium">
              <span className="hover:text-emerald-400 cursor-pointer">SECURITY</span>
              <span className="hover:text-emerald-400 cursor-pointer">SITEMAP</span>
              <span className="hover:text-emerald-400 cursor-pointer">COOKIES</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
