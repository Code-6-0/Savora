"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  UserCheck,
  Megaphone,
  DollarSign,
  LifeBuoy,
  LogOut
} from "lucide-react";

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();

  // Admin menu items
  const adminMenus = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
      active: true // Task 3 selesai
    },
    {
      name: "Verifikasi UMKM",
      href: "/admin/verifikasi-umkm",
      icon: <Store size={20} />,
      active: true // Task 2 selesai
    },
    {
      name: "Manajemen User",
      href: "/admin/moderasi",
      icon: <Users size={20} />,
      active: true // Task 2 selesai
    },
    {
      name: "Manajemen Listing",
      href: "/admin/listings",
      icon: <Package size={20} />,
      active: true // Task 2 selesai
    },
    {
      name: "Verifikasi Mitra Donasi",
      href: "/admin/mitra-donasi",
      icon: <UserCheck size={20} />,
      active: true // Task 4 selesai
    },
    {
      name: "Manajemen Iklan",
      href: "/admin/iklan",
      icon: <Megaphone size={20} />,
      active: true // Task 5 selesai
    },
    {
      name: "Keuangan Platform",
      href: "/admin/keuangan",
      icon: <DollarSign size={20} />,
      active: false // Placeholder (Task 6)
    },
    {
      name: "Help Center",
      href: "/admin/help-center",
      icon: <LifeBuoy size={20} />,
      active: false // Placeholder (Task 7)
    },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span style={{ color: "var(--primary-color)", fontSize: "24px" }}>⚲</span>
        <span style={{ fontWeight: 700 }}>Savora</span>
        <span style={{
          marginLeft: '8px',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          backgroundColor: 'var(--secondary-color)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          ADMIN
        </span>
      </div>

      <div style={{
        padding: '0 20px',
        marginBottom: '15px',
        marginTop: '20px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#9CA3AF',
        letterSpacing: '1px'
      }}>
        MENU ADMIN
      </div>

      <ul className="sidebar-menu" style={{ flexGrow: 1 }}>
        {adminMenus.map((menu) => (
          <li key={menu.name}>
            {menu.active ? (
              <Link
                href={menu.href}
                className={pathname === menu.href ? "active" : ""}
                onClick={onClose}
              >
                <span style={{ marginRight: '10px' }}>{menu.icon}</span>
                {menu.name}
              </Link>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 15px',
                  color: 'var(--text-muted)',
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  borderRadius: '8px'
                }}
                title="Fitur belum tersedia"
              >
                <span>{menu.icon}</span>
                {menu.name}
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '9px',
                  fontWeight: 600,
                  backgroundColor: '#E5E7EB',
                  color: '#6B7280',
                  padding: '2px 5px',
                  borderRadius: '3px'
                }}>
                  SOON
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="profile-section">
          <div
            style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            AD
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>
              Admin
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Platform Manager
            </div>
          </div>
        </div>

        <ul className="sidebar-footer-menu">
          <li>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 15px',
                width: '100%',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                backgroundColor: 'transparent',
                color: '#EF4444',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={20} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
