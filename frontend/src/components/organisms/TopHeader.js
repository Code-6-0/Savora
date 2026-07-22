import React from 'react';
import SearchBar from '../molecules/SearchBar';
import { Bell } from 'lucide-react';
import { PageTitle, PageSubtitle } from '../atoms/Typography';

export default function TopHeader({ title, subtitle, children }) {
  return (
    <div className="topbar">
      <div>
        <PageTitle>{title}</PageTitle>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {children !== undefined ? children : (
          <>
            <SearchBar />
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-muted)" />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></div>
            </div>
            <div style={{ padding: '5px 12px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
              • Toko Buka
            </div>
          </>
        )}
      </div>
    </div>
  );
}
