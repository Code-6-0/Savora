import React from 'react';
import SearchBar from '../molecules/SearchBar';
import NotificationBell from '../organisms/NotificationBell';
import { PageTitle, PageSubtitle } from '../atoms/Typography';
import { useUmkm } from '@/context/UmkmContext';

export default function TopHeader({ title, subtitle, children }) {
  const { umkmData } = useUmkm();
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
            <NotificationBell />
            {umkmData?.isStoreOpen ? (
              <div style={{ padding: '5px 12px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                • Toko Buka
              </div>
            ) : (
              <div style={{ padding: '5px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                • Toko Tutup
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
