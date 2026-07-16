import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = "Cari...", className = '' }) {
  return (
    <div className={`search-bar ${className}`} style={{ position: 'relative', width: '300px' }}>
      <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input 
        type="text" 
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 15px 10px 45px', border: '1px solid var(--border-color)', borderRadius: '8px', outline: 'none' }}
      />
    </div>
  );
}
