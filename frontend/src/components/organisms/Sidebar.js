"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Lightbulb, Bell, Settings } from "lucide-react";

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  if (pathname === "/marketplace") return null;

  const menus = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Produk", href: "/produk", icon: <Package size={20} /> },
    { name: "Pesanan", href: "/pesanan", icon: <ShoppingCart size={20} /> },
    { name: "Analitik", href: "/analitik", icon: <BarChart2 size={20} /> },
    { name: "Insight", href: "/insight", icon: <Lightbulb size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span style={{ color: "var(--primary-color)", fontSize: "24px" }}>⚲</span> Savora
      </div>
      <ul className="sidebar-menu" style={{ flexGrow: 1 }}>
        {menus.map((menu) => (
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
            <a href="#">
              <span style={{ marginRight: '10px' }}><Settings size={20} /></span> Profil
            </a>
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
