"use client";

import { useState } from "react";
import Sidebar from "../organisms/Sidebar";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { isMarketplaceRoute } from "@/lib/routes";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (isMarketplaceRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: "var(--primary-color)", fontSize: "24px" }}>⚲</span>
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--text-main)" }}>Savora</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hamburger-btn">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
         <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="main-container">
        {children}
      </div>
    </div>
  );
}
