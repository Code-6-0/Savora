"use client";

import React, { Suspense, useState } from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, HelpCircle,
  Phone, FileCheck, Lock, Smartphone, Eye, CheckCircle, Clock, Upload, Plus, ChevronRight, Copy, CreditCard,
  Camera, Store, Star, MapPin, Mail, User, Shield, Info, Map, Bell, Globe, Moon, Sun, Leaf, Activity, CheckCircle2, AlertTriangle, MessageSquare, Image as ImageIcon
} from "lucide-react";
import { useUmkm } from '@/context/UmkmContext';

function ProfilContent() {
  const { loading: authLoading } = useAuthGuard(['UMKM'], { checkVerification: true });
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'bantuan';
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(true);

  // Gunakan data dari global context
  const { umkmData, setUmkmData } = useUmkm();

  if (authLoading) {
    return <div style={{ padding: '40px', color: '#6B7280' }}>Memuat...</div>;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText("SARI2024");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    alert("Perubahan profil berhasil disimpan!");
    setShowSaveBar(false);
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header Context */}
      <div style={{ padding: '30px 40px 10px 40px', maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '14px' }}>
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
                    <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E5E7EB', backgroundColor: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: isCopied ? '#10B981' : '#4B5563', cursor: 'pointer' }}>
                      {isCopied ? <CheckCircle size={12} /> : <Copy size={12} />} {isCopied ? "Tersalin!" : "Salin"}
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
                  <div onClick={() => setIs2FAEnabled(!is2FAEnabled)} style={{ width: '44px', height: '24px', backgroundColor: is2FAEnabled ? '#10B981' : '#D1D5DB', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: is2FAEnabled ? '22px' : '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transition: 'left 0.2s' }}></div>
                  </div>
                </div>

                <HelpItem icon={<Smartphone size={20} color="#10B981" />} title="Perangkat Login" subtitle="3 perangkat aktif terdeteksi" badge="3 Aktif" />
                <HelpItem icon={<Eye size={20} color="#10B981" />} title="Pengaturan Privasi" subtitle="Kontrol data dan visibilitas profil Anda" />
              </div>
            </div>
          )}

          {activeTab === 'profil' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Profil Toko</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Kelola tampilan publik dari toko Anda, seperti foto profil, rating, dan status.</p>
              
              <div style={{ position: 'relative', marginBottom: '60px' }}>
                <div style={{ height: '160px', backgroundColor: '#E5E7EB', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <ImageIcon size={32} color="#9CA3AF" />
                  <button style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Camera size={14} /> Ubah Cover
                  </button>
                </div>
                <div style={{ position: 'absolute', bottom: '-40px', left: '32px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'white', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Store size={40} color="#9CA3AF" />
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                     <Camera size={14} color="white" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Nama Usaha (dari umkm_profiles)</label>
                  <input type="text" value={umkmData.umkm_profiles.business_name} onChange={(e) => setUmkmData({...umkmData, umkm_profiles: {...umkmData.umkm_profiles, business_name: e.target.value}})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Tagline Toko</label>
                  <input type="text" value={umkmData.tagline} onChange={(e) => setUmkmData({...umkmData, tagline: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }} placeholder="Contoh: Enak, Murah, dan Sehat" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Kategori Usaha</label>
                  <select value={umkmData.category} onChange={(e) => setUmkmData({...umkmData, category: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}>
                    <option>Makanan Siap Saji</option>
                    <option>Bakeri & Roti</option>
                    <option>Minuman & Bowl</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status Operasional</div>
                       <div style={{ fontWeight: 600, color: umkmData.isStoreOpen ? '#10B981' : '#EF4444' }}>{umkmData.isStoreOpen ? 'Toko Buka' : 'Toko Tutup'}</div>
                     </div>
                     <div onClick={() => setUmkmData({...umkmData, isStoreOpen: !umkmData.isStoreOpen})} style={{ width: '44px', height: '24px', backgroundColor: umkmData.isStoreOpen ? '#10B981' : '#D1D5DB', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: umkmData.isStoreOpen ? '22px' : '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transition: 'left 0.2s' }}></div>
                     </div>
                   </div>
                   <div style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Rating & Keamanan (PRD)</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#111827' }}><Star size={16} color="#F59E0B" fill="#F59E0B" /> {umkmData.umkm_profiles.rating}</div>
                         <div style={{ height: '16px', width: '1px', backgroundColor: '#D1D5DB' }}></div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#10B981' }}><Shield size={16} /> Badge: {umkmData.umkm_profiles.keyword_safety_level}</div>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'informasi' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Informasi UMKM</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Detail informasi legal dan kontak usaha berdasarkan data pendaftaran Anda.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Nama Pemilik (dari users)</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="text" value={umkmData.users.name} onChange={(e) => setUmkmData({...umkmData, users: {...umkmData.users, name: e.target.value}})} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', backgroundColor: '#F9FAFB' }} readOnly />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Email (dari users)</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="email" value={umkmData.users.email} onChange={(e) => setUmkmData({...umkmData, users: {...umkmData.users, email: e.target.value}})} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', backgroundColor: '#F9FAFB' }} readOnly />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Nomor Telepon</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="text" value={umkmData.phone} onChange={(e) => setUmkmData({...umkmData, phone: e.target.value})} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }} />
                  </div>
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Nomor Izin Usaha / NIB (Opsional)</label>
                   <div style={{ position: 'relative' }}>
                     <FileCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                     <input type="text" value={umkmData.nib} onChange={(e) => setUmkmData({...umkmData, nib: e.target.value})} style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }} />
                   </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Deskripsi Singkat Usaha</label>
                 <textarea value={umkmData.description} onChange={(e) => setUmkmData({...umkmData, description: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}></textarea>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={20} color="#10B981" /> Detail Alamat (dari umkm_profiles)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Alamat Lengkap (address)</label>
                   <textarea value={umkmData.umkm_profiles.address} onChange={(e) => setUmkmData({...umkmData, umkm_profiles: {...umkmData.umkm_profiles, address: e.target.value}})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}></textarea>
                 </div>
                 
                 <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ height: '200px', backgroundColor: '#F3F4F6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Map size={48} color="#D1D5DB" />
                       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', color: '#EF4444' }}>
                          <MapPin size={32} fill="#EF4444" color="white" />
                       </div>
                       <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          Geo: {umkmData.umkm_profiles.geo_location}
                       </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontSize: '13px', color: '#6B7280' }}>Pastikan pin point sesuai agar memudahkan pickup customer.</div>
                       <button className="btn-secondary" style={{ padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 600, backgroundColor: 'white', cursor: 'pointer' }}>Ubah Pin Lokasi</button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'dampak' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Dampak Food Rescue</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Kontribusi usaha Anda dalam mengurangi limbah makanan dan emisi karbon.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                 <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '16px', border: '1px solid #D1FAE5' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       <Leaf size={20} color="#10B981" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46', marginBottom: '4px' }}>420</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Makanan Diselamatkan</div>
                 </div>
                 <div style={{ padding: '20px', backgroundColor: '#FFFBEB', borderRadius: '16px', border: '1px solid #FEF3C7' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       <Activity size={20} color="#D97706" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>105<span style={{ fontSize: '16px', marginLeft: '2px' }}>kg</span></div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#B45309' }}>Food Waste Dicegah</div>
                 </div>
                 <div style={{ padding: '20px', backgroundColor: '#F0F9FF', borderRadius: '16px', border: '1px solid #E0F2FE' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       <Globe size={20} color="#0284C7" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#075985', marginBottom: '4px' }}>260<span style={{ fontSize: '16px', marginLeft: '2px' }}>kg</span></div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369A1' }}>Est. CO2 Berkurang</div>
                 </div>
                 <div style={{ padding: '20px', backgroundColor: '#F3F4F6', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       <User size={20} color="#4B5563" />
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>128</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Total Pelanggan</div>
                 </div>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                       <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: '#111827' }}>Perjalanan Menuju Food Hero</h3>
                       <p style={{ fontSize: '14px', margin: 0, color: '#6B7280' }}>Selamatkan 80 porsi lagi untuk mendapatkan badge spesial!</p>
                    </div>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', boxShadow: '0 0 0 4px #D1FAE5' }}>
                       <Shield size={24} fill="#10B981" color="#10B981" />
                    </div>
                 </div>
                 
                 <div style={{ height: '12px', backgroundColor: '#F3F4F6', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: '84%', height: '100%', backgroundColor: '#10B981', borderRadius: '6px' }}></div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>
                    <span>Level: Eco Saver</span>
                    <span>420 / 500 porsi</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'preferensi' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Preferensi Aplikasi</h2>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 32px 0' }}>Sesuaikan pengalaman penggunaan dashboard UMKM Anda.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Moon size={20} color="#4B5563" />
                       </div>
                       <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Mode Gelap (Dark Mode)</div>
                          <div style={{ fontSize: '13px', color: '#6B7280' }}>Gunakan tema warna gelap untuk dashboard.</div>
                       </div>
                    </div>
                    <div style={{ width: '44px', height: '24px', backgroundColor: '#D1D5DB', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '40px', height: '40px', backgroundColor: '#ECFDF5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bell size={20} color="#10B981" />
                       </div>
                       <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Notifikasi Pesanan Baru</div>
                          <div style={{ fontSize: '13px', color: '#6B7280' }}>Dapatkan peringatan suara & popup saat pesanan masuk.</div>
                       </div>
                    </div>
                    <div style={{ width: '44px', height: '24px', backgroundColor: '#10B981', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '22px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={20} color="#4B5563" />
                       </div>
                       <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Notifikasi Email</div>
                          <div style={{ fontSize: '13px', color: '#6B7280' }}>Terima rekap harian & laporan penjualan mingguan.</div>
                       </div>
                    </div>
                    <div style={{ width: '44px', height: '24px', backgroundColor: '#10B981', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '22px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                    </div>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div style={{ width: '40px', height: '40px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Globe size={20} color="#4B5563" />
                       </div>
                       <div>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Bahasa (Language)</div>
                          <div style={{ fontSize: '13px', color: '#6B7280' }}>Pilih bahasa antarmuka aplikasi.</div>
                       </div>
                    </div>
                    <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', backgroundColor: 'white' }}>
                       <option>Bahasa Indonesia</option>
                       <option>English</option>
                    </select>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      {showSaveBar && (
        <div style={{ position: 'fixed', bottom: 0, left: '250px', right: 0, backgroundColor: 'white', borderTop: '1px solid #E5E7EB', padding: '16px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' }}>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              Perubahan belum disimpan <span style={{ margin: '0 4px' }}>·</span> Terakhir disimpan <span style={{ color: '#111827', fontWeight: 600 }}>2 jam lalu</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSaveBar(false)} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#10B981', border: 'none', borderRadius: '8px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                <CheckCircle size={18} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
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
