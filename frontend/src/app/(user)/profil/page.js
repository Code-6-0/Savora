"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, HelpCircle,
  Phone, FileCheck, Lock, Smartphone, Eye, CheckCircle, Clock, Upload, Plus, ChevronRight, Copy, CreditCard
} from "lucide-react";

function ProfilContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bantuan';

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header Context */}
      <div style={{ padding: '30px 40px 10px 40px', maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '14px' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', color: '#6B7280', textDecoration: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Kembali
            </Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: '#10B981', fontWeight: 500 }}>Edit Profil</span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            <HelpCircle size={16} /> Pusat Bantuan
          </button>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: 0 }}>Edit Profil UMKM</h1>
      </div>

      <div style={{ maxWidth: '1000px', padding: '0 40px', marginTop: '20px' }}>
        {/* Content Area */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {activeTab === 'bantuan' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Bantuan & Informasi</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Temukan jawaban atau hubungi tim dukungan Savora kapan saja.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <HelpItem icon={<HelpCircle size={20} color="#10B981" />} title="Pusat Bantuan" subtitle="FAQ dan panduan lengkap penggunaan Savora" />
                <HelpItem icon={<Phone size={20} color="#10B981" />} title="Hubungi Tim Savora" subtitle="Senin–Jumat, 08.00–17.00 WIB" badge="Online" />
                <HelpItem icon={<FileCheck size={20} color="#10B981" />} title="Syarat & Ketentuan" subtitle="Perjanjian layanan platform Savora" />
                <HelpItem icon={<Eye size={20} color="#10B981" />} title="Kebijakan Privasi" subtitle="Cara kami melindungi data Anda" />
                <HelpItem icon={<Lock size={20} color="#10B981" />} title="Versi Website" subtitle="Savora UMKM Dashboard v2.4.1" badge="Terbaru" noArrow />
              </div>
            </div>
          )}

          {activeTab === 'dokumen' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Dokumen Usaha</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Upload dokumen resmi dan foto untuk verifikasi dan kepercayaan pelanggan.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <DocCard title="Logo Toko" subtitle="PNG/JPG · maks 2 MB" status="verified" icon={<CheckCircle size={20} color="#10B981" />} />
                <DocCard title="Banner Promosi" subtitle="PNG/JPG · 1200x400 px" status="verified" icon={<CheckCircle size={20} color="#10B981" />} />
                <DocCard title="Surat Izin Usaha" subtitle="PDF/JPG · maks 5 MB" status="verified" icon={<CheckCircle size={20} color="#10B981" />} />
                <DocCard title="Sertifikat Halal" subtitle="PDF/JPG · maks 5 MB" status="waiting" icon={<Clock size={20} color="#F59E0B" />} />
                <DocCard title="Foto Dapur" subtitle="JPG/PNG · maks 5 MB" status="upload" icon={<Upload size={20} color="#9CA3AF" />} />
                <DocCard title="Foto Area Pickup" subtitle="JPG/PNG · maks 5 MB" status="upload" icon={<Upload size={20} color="#9CA3AF" />} />
              </div>
            </div>
          )}

          {activeTab === 'pembayaran' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Pembayaran & Keuangan</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 24px 0' }}>Kelola metode pembayaran, reward, dan pendapatan toko Anda.</p>
              
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color="#10B981" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>BCA •••• 7823</div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>Rekening Utama • Sari Dewi Kusuma</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Utama</span>
                  <button style={{ border: 'none', background: 'none', color: '#6B7280', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                </div>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', padding: '2px' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981' }}></div>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981' }}></div>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981' }}></div>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>QRIS Toko</div>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>ID: QRIS-DS-8120012345 • Aktif</div>
                  </div>
                </div>
                <button style={{ border: 'none', background: 'none', color: '#10B981', cursor: 'pointer', fontWeight: 600 }}>Lihat QR</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1px', marginBottom: '12px' }}>KODE REFERRAL</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>SARI2024</span>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E5E7EB', backgroundColor: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#4B5563', cursor: 'pointer' }}>
                      <Copy size={12} /> Salin
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>12 referral berhasil</div>
                </div>

                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1px', marginBottom: '12px' }}>REWARD UMKM</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>4.250</span>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>poin</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>≈ Rp 42.500</div>
                </div>
              </div>

              <button style={{ width: '100%', padding: '16px', border: '1px dashed #D1D5DB', borderRadius: '12px', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6B7280', fontWeight: 500, cursor: 'pointer' }}>
                <Plus size={18} /> Tambah Metode Pembayaran
              </button>
            </div>
          )}

          {activeTab === 'keamanan' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Keamanan Akun</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Jaga keamanan akun bisnis Anda dari akses yang tidak sah.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <HelpItem icon={<Lock size={20} color="#10B981" />} title="Ubah Password" subtitle="Terakhir diubah 3 bulan lalu" />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={20} color="#10B981" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Autentikasi Dua Langkah</div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}>Keamanan tambahan via SMS atau aplikasi authenticator</div>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div style={{ width: '44px', height: '24px', backgroundColor: '#D1D5DB', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                  </div>
                </div>

                <HelpItem icon={<Smartphone size={20} color="#10B981" />} title="Perangkat Login" subtitle="3 perangkat aktif terdeteksi" badge="3 Aktif" />
                <HelpItem icon={<Eye size={20} color="#10B981" />} title="Pengaturan Privasi" subtitle="Kontrol data dan visibilitas profil Anda" />
              </div>
            </div>
          )}

          {['profil', 'informasi', 'dampak', 'preferensi'].includes(activeTab) && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#9CA3AF' }}>
              Konten {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} belum diimplementasikan.
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: '250px', right: 0, backgroundColor: 'white', borderTop: '1px solid #E5E7EB', padding: '16px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
          <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
            Perubahan belum disimpan <span style={{ margin: '0 4px' }}>·</span> Terakhir disimpan <span style={{ color: '#111827', fontWeight: 600 }}>2 jam lalu</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
              Batal
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#10B981', border: 'none', borderRadius: '8px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
              <CheckCircle size={18} /> Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px' }}>Loading...</div>}>
      <ProfilContent />
    </Suspense>
  );
}

// Subcomponents
function HelpItem({ icon, title, subtitle, badge, noArrow }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {badge && (
          <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
            {badge}
          </span>
        )}
        {!noArrow && <ChevronRight size={20} color="#9CA3AF" />}
      </div>
    </div>
  );
}

function DocCard({ title, subtitle, status, icon }) {
  let borderColor = '#E5E7EB';
  let bgColor = 'white';
  let badgeColor = '';
  let badgeBg = '';
  let badgeText = '';
  let borderStyle = 'solid';

  if (status === 'verified') {
    borderColor = '#10B981';
    bgColor = '#F9FAFB';
    badgeColor = '#10B981';
    badgeBg = '#ECFDF5';
    badgeText = 'Terverifikasi';
  } else if (status === 'waiting') {
    borderColor = '#FCD34D';
    badgeColor = '#D97706';
    badgeBg = '#FEF3C7';
    badgeText = 'Menunggu';
  } else if (status === 'upload') {
    borderColor = '#E5E7EB';
    borderStyle = 'dashed';
    badgeColor = '#6B7280';
    badgeBg = '#F3F4F6';
    badgeText = 'Belum Upload';
  }

  return (
    <div style={{ border: `1px ${borderStyle} ${borderColor}`, borderRadius: '12px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: bgColor, minHeight: '160px', justifyContent: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: status === 'verified' ? '#ECFDF5' : (status === 'waiting' ? '#FEF3C7' : '#F9FAFB'), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
        {icon}
      </div>
      <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>{subtitle}</div>
      <div style={{ backgroundColor: badgeBg, color: badgeColor, padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
        {badgeText}
      </div>
    </div>
  );
}
