'use client';

import { useState } from 'react';
import MitraSidebar from '@/components/organisms/MitraSidebar';
import { Menu, X } from 'lucide-react';

/**
 * Layout khusus untuk halaman Mitra Donasi
 * Struktur: Sidebar kiri (Dashboard, Penawaran, Riwayat, Laporan) + Content kanan
 */
export default function MitraDonasiLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-emerald-50">
            <img 
              src="https://dbbjtxjfytgfqkwqwokm.supabase.co/storage/v1/object/public/savora_img/logo_1784833935441.png" 
              alt="Savora Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg">Savora</span>
            <p className="text-xs text-slate-500">Mitra Donasi</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <MitraSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full pt-16 md:pt-0">
        <main className="flex-1 w-full bg-slate-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
