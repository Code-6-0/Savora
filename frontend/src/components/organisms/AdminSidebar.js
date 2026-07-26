"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToken, logout, confirmLogout } from "@/lib/auth";
import {
  LayoutDashboard,
  CheckCircle,
  AlertTriangle,
  Store,
  Users,
  UserCheck,
  DollarSign,
  Megaphone,
  LifeBuoy,
  Settings,
  User,
  LogOut,
  ChevronDown
} from "lucide-react";

export default function AdminSidebar({ onClose }) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    verifikasi: 0,
    moderasiListing: 0,
    iklan: 0,
    helpCenter: 0
  });

  useEffect(() => {
    fetchBadgeCounts();
  }, []);

  async function fetchBadgeCounts() {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
      const token = getToken();

      const response = await fetch(`${API_BASE}/admin/reports/summary`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.summary) {
          const s = data.data.summary;
          setBadgeCounts({
            verifikasi: (s.umkm_pending_count || 0) + (s.mitra_pending_count || 0),
            moderasiListing: s.listing_moderasi_count || 0,
            iklan: s.iklan_pending_count || 0,
            helpCenter: s.tiket_help_baru_count || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch badge counts:', err);
    }
  }

  // Menu struktur sesuai spec §1
  const menuGroups = [
    {
      label: "UTAMA",
      items: [
        {
          name: "Dashboard",
          href: "/admin/dashboard",
          icon: <LayoutDashboard size={20} />
        }
      ]
    },
    {
      label: "MANAJEMEN",
      items: [
        {
          name: "Verifikasi",
          href: "/admin/verifikasi",
          icon: <CheckCircle size={20} />,
          badge: badgeCounts.verifikasi
        },
        {
          name: "Moderasi Listing",
          href: "/admin/moderasi-listing",
          icon: <AlertTriangle size={20} />,
          badge: badgeCounts.moderasiListing
        },
        {
          name: "Kelola UMKM",
          href: "/admin/umkm",
          icon: <Store size={20} />
        },
        {
          name: "Kelola Customer",
          href: "/admin/customers",
          icon: <Users size={20} />
        },
        {
          name: "Kelola Mitra Donasi",
          href: "/admin/mitra-donasi",
          icon: <UserCheck size={20} />
        }
      ]
    },
    {
      label: "PLATFORM",
      items: [
        {
          name: "Keuangan Platform",
          href: "/admin/keuangan",
          icon: <DollarSign size={20} />
        },
        {
          name: "Manajemen Iklan",
          href: "/admin/iklan",
          icon: <Megaphone size={20} />,
          badge: badgeCounts.iklan
        }
      ]
    },
    {
      label: "LAINNYA",
      items: [
        {
          name: "Help Center",
          href: "/admin/help-center",
          icon: <LifeBuoy size={20} />,
          badge: badgeCounts.helpCenter
        },
        {
          name: "Pengaturan",
          href: "/admin/pengaturan",
          icon: <Settings size={20} />
        }
      ]
    }
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('savora_token');
      localStorage.removeItem('savora_user');
      window.location.href = '/login';
    }
  };

  return (
    <>
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

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 10px' }}>
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} style={{ marginBottom: '20px' }}>
              <div style={{
                padding: '0 10px',
                marginBottom: '8px',
                marginTop: groupIndex === 0 ? '10px' : '0',
                fontSize: '11px',
                fontWeight: 700,
                color: '#9CA3AF',
                letterSpacing: '1px'
              }}>
                {group.label}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 15px',
                          textDecoration: 'none',
                          color: isActive ? 'white' : 'var(--text-muted)',
                          fontWeight: 500,
                          fontSize: '0.9375rem',
                          borderRadius: '8px',
                          backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.outline = '2px solid var(--primary-color)';
                          e.currentTarget.style.outlineOffset = '2px';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.outline = 'none';
                        }}
                      >
                        <span>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.name}</span>
                        {item.badge > 0 && (
                          <span style={{
                            backgroundColor: 'var(--danger-color)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '12px',
                            minWidth: '20px',
                            textAlign: 'center'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer dengan dropdown profil */}
        <div className="sidebar-footer" style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              border: 'none',
              backgroundColor: dropdownOpen ? 'var(--secondary-color)' : 'transparent',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!dropdownOpen) e.currentTarget.style.backgroundColor = 'var(--secondary-color)';
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              flexShrink: 0
            }}>
              AD
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                Admin
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Platform Manager
              </div>
            </div>
            <ChevronDown
              size={18}
              style={{
                color: 'var(--text-muted)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '10px',
              right: '10px',
              marginBottom: '8px',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <Link
                href="/admin/pengaturan"
                onClick={() => {
                  setDropdownOpen(false);
                  onClose && onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 15px',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={18} />
                Lihat Profil
              </Link>
              <Link
                href="/admin/pengaturan"
                onClick={() => {
                  setDropdownOpen(false);
                  onClose && onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 15px',
                  textDecoration: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={18} />
                Pengaturan Akun
              </Link>
              <div style={{
                height: '1px',
                backgroundColor: 'var(--border-color)',
                margin: '4px 0'
              }} />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setShowLogoutDialog(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 15px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--danger-color)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={18} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog untuk Logout */}
      {showLogoutDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '12px'
            }}>
              Konfirmasi Keluar
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              Apakah Anda yakin ingin keluar dari dashboard admin?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowLogoutDialog(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: 'var(--danger-color)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-color)'}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
