"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2, Settings,
  Store, Building, Leaf, Globe, Shield, CreditCard, FileText, LifeBuoy, AlertTriangle, ArrowLeft, Megaphone, LogOut
} from "lucide-react";
import { useUmkm } from '@/context/UmkmContext';
import { logout } from '@/lib/auth';

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'bantuan';
  const { umkmData } = useUmkm();

  if (pathname === "/marketplace") return null;

  const isProfilPage = pathname.startsWith("/profil");

  const dashboardMenus = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Produk", href: "/produk", icon: <Package size={20} /> },
    { name: "Pesanan", href: "/pesanan", icon: <ShoppingCart size={20} /> },
    { name: "Analitik & Insight", href: "/analitik", icon: <BarChart2 size={20} /> },
    { name: "Promosi", href: "/promosi", icon: <Megaphone size={20} /> },
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

  const sidebarContainerClass = "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 w-full md:w-[260px]";

  if (isProfilPage) {
    return (
      <div className={sidebarContainerClass}>
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium">
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </Link>
        </div>
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-2">NAVIGASI PROFIL</div>
        </div>
        <ul className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
          {profilMenus.map((menu) => (
            <li key={menu.id}>
              <Link 
                href={`/profil?tab=${menu.id}`} 
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentTab === menu.id 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                <span>{menu.icon}</span> {menu.label}
              </Link>
            </li>
          ))}
          <li className="mt-4 pt-4 border-t border-slate-100">
            <button 
              onClick={onClose}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
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
    <div className={sidebarContainerClass}>
      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
          <img src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" alt="Savora Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-slate-900 text-xl tracking-tight">Savora</span>
      </div>
      
      <ul className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {dashboardMenus.map((menu) => (
          <li key={menu.name}>
            <Link 
              href={menu.href} 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === menu.href 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
              }`}
            >
              <span>{menu.icon}</span> {menu.name}
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="border-t border-slate-200 p-4 mt-auto">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
            {umkmData?.users?.name ? umkmData.users.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-900 truncate">{umkmData?.users?.name || 'User'}</div>
            <div className="text-xs text-slate-500 truncate">{umkmData?.umkm_profiles?.level || 'UMKM'}</div>
          </div>
        </div>
        
        <ul className="space-y-1">
          <li>
            <Link 
              href="/profil" 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
            >
              <Settings size={18} /> Profil
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
    <Suspense fallback={
      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-[260px] p-6 text-slate-500 text-sm">
        Loading...
      </div>
    }>
      <SidebarContent onClose={onClose} />
    </Suspense>
  );
}
