"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Lightbulb, Bell, Settings,
  Store, Building, Leaf, Globe, Shield, CreditCard, FileText, LifeBuoy, AlertTriangle, ArrowLeft
} from "lucide-react";

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bantuan';

  if (pathname === "/marketplace") return null;

  const isProfilPage = pathname.startsWith("/profil");

  const dashboardMenus = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Produk", href: "/produk", icon: <Package size={20} /> },
    { name: "Pesanan", href: "/pesanan", icon: <ShoppingCart size={20} /> },
    { name: "Analitik", href: "/analitik", icon: <BarChart2 size={20} /> },
    { name: "Insight", href: "/insight", icon: <Lightbulb size={20} /> },
  ];

  const profilMenus = [
    { id: 'profil', label: 'Profil Toko', icon: <Store size={20} /> },
    { id: 'informasi', label: 'Informasi UMKM', icon: <Building size={20} /> },
    { id: 'dampak', label: 'Dampak Food Rescue', icon: <Leaf size={20} /> },
    { id: 'preferensi', label: 'Preferensi', icon: <Globe size={20} /> },
    { id: 'keamanan', label: 'Keamanan Akun', icon: <Shield size={20} /> },
    { id: 'pembayaran', label: 'Pembayaran', icon: <CreditCard size={20} /> },
    { id: 'dokumen', label: 'Dokumen Usaha', icon: <FileText size={20} /> },
    { id: 'bantuan', label: 'Bantuan', icon: <LifeBuoy size={20} /> },
  ];

  if (isProfilPage) {
    return (
      <div className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
          <Link href="/dashboard" onClick={onClose} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={20} style={{ marginRight: '8px' }} />
            <span>Kembali</span>
          </Link>
        </div>
        <div style={{ padding: '0 20px', marginBottom: '15px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1px' }}>
          NAVIGASI PROFIL
        </div>
        <ul className="sidebar-menu" style={{ flexGrow: 1 }}>
          {profilMenus.map((menu) => (
            <li key={menu.id}>
              <Link 
                href={`/profil?tab=${menu.id}`} 
                className={currentTab === menu.id ? "active" : ""} 
                onClick={onClose}
                style={currentTab === menu.id ? { backgroundColor: '#ECFDF5', color: '#10B981' } : {}}
              >
                <span style={{ marginRight: '10px' }}>{menu.icon}</span> {menu.label}
              </Link>
            </li>
          ))}
          <li style={{ marginTop: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
            <button 
              onClick={onClose}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', width: '100%', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                backgroundColor: 'transparent', color: '#EF4444', fontWeight: 500, fontSize: '1rem'
              }}
            >
              <AlertTriangle size={20} />
              Hapus Akun
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span style={{ color: "var(--primary-color)", fontSize: "24px" }}>⚲</span> Savora
      </div>
      <ul className="sidebar-menu" style={{ flexGrow: 1 }}>
        {dashboardMenus.map((menu) => (
          <li key={menu.name}>
            <Link href={menu.href} className={pathname === menu.href ? "active" : ""} onClick={onClose}>
              <span style={{ marginRight: '10px' }}>{menu.icon}</span> {menu.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div className="profile-section">
          <div className="avatar" style={{ backgroundColor: '#10B981', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>BL</div>
          <div>
            <div style={{fontWeight: 700, fontSize: '0.875rem', color: '#111827'}}>Bu Lestari</div>
            <div style={{fontSize: '0.75rem', color: '#6B7280'}}>Gold Rescuer</div>
          </div>
        </div>
        <ul className="sidebar-footer-menu">
          <li>
            <Link href="/profil" onClick={onClose}>
              <span style={{ marginRight: '10px' }}><Settings size={20} /></span> Profil
            </Link>
          </li>
          <li>
            <a href="#" style={{ color: '#EF4444' }}>
              <span style={{ marginRight: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </span> Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function Sidebar({ onClose }) {
  return (
    <Suspense fallback={<div className="sidebar"><div style={{ padding: '20px' }}>Loading...</div></div>}>
      <SidebarContent onClose={onClose} />
    </Suspense>
  );
}
