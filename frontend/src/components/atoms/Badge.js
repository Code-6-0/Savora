import React from 'react';

export default function Badge({ children, status, type, className = '', customStyle = {} }) {
  let style = { ...customStyle };
  let statusClass = "badge-status";
  
  const colors = {
    success: { bg: '#DEF7EC', color: '#03543F' },
    warning: { bg: '#FEF08A', color: '#854D0E' },
    critical: { bg: '#FEE2E2', color: '#991B1B' },
    info: { bg: '#E1EFFE', color: '#1E429F' },
    default: { bg: '#F3F4F6', color: '#374151' },
    draft: { bg: '#F3F4F6', color: '#6B7280' }
  };

  if (type && colors[type]) {
    style = { backgroundColor: colors[type].bg, color: colors[type].color, ...style };
  }

  // Custom presets if passed status prop matches
  switch (status) {
    case "Menunggu":
      style = { backgroundColor: '#FEF3C7', color: '#92400E', ...style };
      statusClass += " draft";
      break;
    case "Diproses":
      style = { backgroundColor: '#DBEAFE', color: '#1E40AF', ...style };
      break;
    case "Siap Diambil":
      style = { backgroundColor: '#D1FAE5', color: '#065F46', ...style };
      break;
    case "Selesai":
      statusClass += " aktif";
      break;
    case "Dibatalkan":
      style = { backgroundColor: '#FEE2E2', color: '#991B1B', ...style };
      statusClass += " draft";
      break;
    case "Aktif":
      statusClass += " aktif";
      break;
    case "Draft":
      statusClass += " draft";
      break;
  }

  return (
    <span className={`${statusClass} ${className}`} style={style}>
      {children || status}
    </span>
  );
}
