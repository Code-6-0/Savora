// frontend/src/lib/mitraDemoData.js
// DEMO DATA untuk Dashboard Mitra (Donasi & Pengolah)
// v2: ganti dengan API waste_offers

/**
 * Statistik untuk Mitra Donasi (Penyalur)
 */
export const DEMO_STATS_DONASI = {
  penawaran_baru: 3,
  penjemputan_hari_ini: 1,
  porsi_tersalurkan_bulan_ini: 245,
  donatur_unik: 12,
};

/**
 * Statistik untuk Mitra Pengolah (Bank Sampah, Kompos, dll)
 */
export const DEMO_STATS_PENGOLAH = {
  penawaran_limbah_baru: 5,
  pengangkutan_hari_ini: 2,
  total_kg_diolah_bulan_ini: 87.5,
  output_produksi: {
    label: 'kg kompos jadi', // Sesuaikan dengan kategori mitra: kompos/maggot/terpilah
    value: 45,
  },
};

/**
 * Penawaran Donasi untuk Mitra Donasi
 * Sumber: UMKM atau Customer dengan surplus acara/katering
 */
export const DEMO_PENAWARAN_DONASI = [
  {
    id: 'D001',
    donatur_nama: 'Warung Bu Lestari',
    donatur_badge: 'UMKM', // 'UMKM' atau 'Customer'
    jenis_makanan: 'Nasi Kotak + Snack Box',
    estimasi_porsi: 50,
    waktu_selesai_masak: '2026-07-25T10:00:00Z',
    batas_layak: '2026-07-25T14:00:00Z', // 4 jam setelah masak
    checklist: {
      disiapkan_fresh: true, // Disiapkan < 4 jam
      disimpan_tertutup: true, // Disimpan layak (tertutup, suhu aman)
      bukan_berisiko_tinggi: true, // Bukan pangan berisiko tinggi (seafood mentah, dll)
    },
    lokasi: 'Jl. Mangga Dua No. 45, Jakarta Utara',
    jarak_km: 3.2,
  },
  {
    id: 'D002',
    donatur_nama: 'Acara Pernikahan Siti & Budi',
    donatur_badge: 'Customer',
    jenis_makanan: 'Prasmanan (Nasi Liwet, Ayam, Sayur)',
    estimasi_porsi: 80,
    waktu_selesai_masak: '2026-07-25T11:30:00Z',
    batas_layak: '2026-07-25T15:30:00Z',
    checklist: {
      disiapkan_fresh: true,
      disimpan_tertutup: true,
      bukan_berisiko_tinggi: true,
    },
    lokasi: 'Jl. Thamrin No. 88, Jakarta Pusat',
    jarak_km: 5.7,
  },
  {
    id: 'D003',
    donatur_nama: 'Katering Rasa Nusantara',
    donatur_badge: 'UMKM',
    jenis_makanan: 'Nasi Kuning + Lauk Pauk',
    estimasi_porsi: 35,
    waktu_selesai_masak: '2026-07-25T09:00:00Z',
    batas_layak: '2026-07-25T13:00:00Z',
    checklist: {
      disiapkan_fresh: true,
      disimpan_tertutup: false, // Ada warning
      bukan_berisiko_tinggi: true,
    },
    lokasi: 'Jl. Gajah Mada No. 12, Jakarta Barat',
    jarak_km: 4.1,
  },
];

/**
 * Penawaran Limbah untuk Mitra Pengolah
 * Sumber: UMKM dengan Waste Log makanan tidak layak jual
 */
export const DEMO_PENAWARAN_LIMBAH = [
  {
    id: 'L001',
    umkm_nama: 'Warung Bu Lestari',
    jenis_limbah: 'Organik sisa produksi',
    deskripsi: 'Sayuran sisa prep, kulit buah, nasi tidak terjual',
    estimasi_berat_kg: 12.5,
    lokasi: 'Jl. Mangga Dua No. 45, Jakarta Utara',
    jarak_km: 3.2,
    frekuensi: 'Rutin (3x/minggu)',
  },
  {
    id: 'L002',
    umkm_nama: 'Toko Roti Manis',
    jenis_limbah: 'Makanan kedaluwarsa',
    deskripsi: 'Roti tawar, kue kering, pastry expired',
    estimasi_berat_kg: 8.0,
    lokasi: 'Jl. Sudirman No. 77, Jakarta Selatan',
    jarak_km: 6.5,
    frekuensi: 'Sekali',
  },
  {
    id: 'L003',
    umkm_nama: 'Restoran Padang Sederhana',
    jenis_limbah: 'Organik sisa produksi',
    deskripsi: 'Kulit ayam, tulang, sayur busuk',
    estimasi_berat_kg: 18.3,
    lokasi: 'Jl. Kebon Jeruk No. 23, Jakarta Barat',
    jarak_km: 4.8,
    frekuensi: 'Rutin (harian)',
  },
  {
    id: 'L004',
    umkm_nama: 'Cafe Kopi & Snack',
    jenis_limbah: 'Organik sisa produksi',
    deskripsi: 'Ampas kopi, sisa sandwich, buah overripe',
    estimasi_berat_kg: 5.2,
    lokasi: 'Jl. Blora No. 9, Jakarta Pusat',
    jarak_km: 2.3,
    frekuensi: 'Rutin (2x/minggu)',
  },
  {
    id: 'L005',
    umkm_nama: 'Catering Nusantara Jaya',
    jenis_limbah: 'Makanan kedaluwarsa',
    deskripsi: 'Frozen food expired, bumbu dapur kadaluarsa',
    estimasi_berat_kg: 22.7,
    lokasi: 'Jl. Fatmawati No. 55, Jakarta Selatan',
    jarak_km: 7.9,
    frekuensi: 'Sekali',
  },
];

/**
 * Jadwal Penjemputan/Pengangkutan (dimulai kosong)
 * Diisi ketika mitra menekan tombol "Terima"
 */
export const DEMO_JADWAL_AWAL = [];

/**
 * Panel Ketentuan untuk Mitra Donasi
 */
export const KETENTUAN_DONASI = {
  judul: 'Syarat Kelayakan Donasi',
  poin: [
    'Makanan disiapkan maksimal 4 jam sebelum penjemputan',
    'Disimpan dalam kondisi tertutup dan suhu aman',
    'Bukan pangan berisiko tinggi (seafood mentah, daging mentah, susu segar)',
    'Minimum 20 porsi per penawaran',
    'Jendela penjemputan maksimal 2 jam setelah konfirmasi',
  ],
};

/**
 * Panel Ketentuan untuk Mitra Pengolah
 */
export const KETENTUAN_PENGOLAH = {
  judul: 'Jenis Limbah yang Diterima',
  poin: [
    'Limbah organik: sisa sayuran, kulit buah, nasi/roti tidak terjual',
    'Makanan kedaluwarsa: produk packaged expired, frozen food',
    'Bukan limbah berbahaya: tidak mengandung bahan kimia/racun',
    'Kapasitas harian: maksimal 100 kg/hari',
    'Jadwal pengangkutan: pagi (08:00-10:00) atau sore (15:00-17:00)',
  ],
};
