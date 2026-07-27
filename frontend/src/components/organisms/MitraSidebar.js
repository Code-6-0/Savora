"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  History,
  BarChart3,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import { logout } from "@/lib/auth";

export default function MitraSidebar({ onClose }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Menu utama Mitra Donasi
  const menuItems = [
    {
      name: "Dashboard",
      href: "/mitra-donasi/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Penawaran",
      href: "/mitra-donasi/penawaran",
      icon: <Inbox size={20} />
    },
    {
      name: "Riwayat",
      href: "/mitra-donasi/riwayat",
      icon: <History size={20} />
    },
    {
      name: "Laporan Impact",
      href: "/mitra-donasi/laporan",
      icon: <BarChart3 size={20} />
    }
  ];

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-[260px]">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-100">
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
          <img 
            src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" 
            alt="Savora Logo" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-xl tracking-tight">Savora</span>
          <p className="text-xs text-slate-500">Mitra Donasi</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          {menuItems.map((menu) => {
            const isActive = pathname === menu.href;
            return (
              <Link
                key={menu.name}
                href={menu.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                }`}
              >
                <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
                  {menu.icon}
                </span>
                {menu.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile & Logout Section */}
      <div className="border-t border-gray-100 p-4">
        {/* Profile Dropdown Button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User size={16} className="text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">Mitra Donasi</p>
              <p className="text-xs text-slate-500">Profil</p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="mt-2 space-y-1">
            <Link
              href="/mitra-donasi/profil"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
            >
              <User size={18} />
              Profil Saya
            </Link>
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Konfirmasi Keluar
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin keluar dari dashboard Mitra Donasi?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
