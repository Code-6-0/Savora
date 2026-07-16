"use client";

import TopHeader from "@/components/organisms/TopHeader";
import { User, Store, CreditCard, Shield, Settings, Bell, ChevronRight, LogOut, Award } from "lucide-react";
import Badge from "@/components/atoms/Badge";

export default function ProfilPage() {
  return (
    <>
      <TopHeader title="Profil UMKM" subtitle="Kelola informasi toko, pembayaran, dan pengaturan akun." />

      <div className="content-area">
        <div className="grid-sidebar-left-slim">
          
          {/* Sidebar Menu */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857', fontWeight: 700, fontSize: '1.25rem' }}>
                BL
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#111827' }}>Warung Bu Lestari</h3>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>ID: SVR-998273</div>
                <div style={{ marginTop: '5px' }}><Badge type="warning" customStyle={{ fontSize: '0.65rem' }}>Gold Rescuer</Badge></div>
              </div>
            </div>
            
            <div style={{ padding: '10px 0' }}>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#F9FAFB', borderLeft: '4px solid #10B981', color: '#111827', fontWeight: 500, cursor: 'pointer' }}>
                <Store size={18} color="#10B981" /> Informasi Toko
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <User size={18} /> Profil Pemilik
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <CreditCard size={18} /> Pencairan Dana
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <Award size={18} /> Savora Partner Plus
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <Bell size={18} /> Notifikasi
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <Shield size={18} /> Keamanan
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#4B5563', cursor: 'pointer' }}>
                <Settings size={18} /> Pengaturan Umum
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                <LogOut size={18} /> Keluar (Logout)
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Informasi Toko</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Nama Toko</label>
                <input type="text" defaultValue="Warung Bu Lestari" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Deskripsi Singkat</label>
                <textarea rows="3" defaultValue="Warung makan sederhana yang menyediakan masakan rumahan segar setiap hari. Berkomitmen mengurangi food waste melalui program rescue." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Kategori Usaha</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                  <option>Makanan Berat & Lauk Pauk</option>
                  <option>Kue & Pastry</option>
                  <option>Minuman</option>
                  <option>Sayur & Buah</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Jam Buka</label>
                  <input type="time" defaultValue="08:00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Jam Tutup</label>
                  <input type="time" defaultValue="20:00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Alamat Lengkap</label>
                <textarea rows="2" defaultValue="Jl. Merdeka Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}></textarea>
              </div>
              
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-secondary">Batal</button>
                <button className="btn-primary">Simpan Perubahan</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
