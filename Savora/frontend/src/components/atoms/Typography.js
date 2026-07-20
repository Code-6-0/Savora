import React from 'react';

export function PageTitle({ children, className = '' }) {
  return <div className={`page-title ${className}`}>{children}</div>;
}

export function PageSubtitle({ children, className = '' }) {
  return <div className={`page-subtitle ${className}`}>{children}</div>;
}
