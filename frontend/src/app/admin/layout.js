'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import TopHeader from '@/components/organisms/TopHeader';
import { Menu, X } from 'lucide-react';
import { isAdmin } from '@/lib/auth';

/**
 * Admin Layout - membungkus semua halaman admin dengan AdminSidebar.
 *
 * Layout ini:
 * - Hard-code merender AdminSidebar (TIDAK conditional)
 * - Guard auth: redirect ke /login jika bukan admin
 * - Support mobile sidebar toggle
 * - Semua halaman /admin/* otomatis terbungkus layout ini
 */
export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--primary-color)', fontSize: '24px' }}>⚲</span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>
            Savora Admin
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hamburger-btn"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* AdminSidebar - selalu dirender, tidak ada conditional */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="main-container">{children}</div>
    </div>
  );
}
