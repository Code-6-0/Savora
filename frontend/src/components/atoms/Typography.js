import React from 'react';

export function PageTitle({ children, className = '' }) {
  return <div className={`page-title ${className}`}>{children}</div>;
}

export function PageSubtitle({ children, className = '' }) {
  return <div className={`page-subtitle ${className}`}>{children}</div>;
}

// Default export untuk backward compatibility dan versatile usage
export default function Typography({ children, variant, className = '', style = {} }) {
  // variant h1, h2 menggunakan page-title styling
  if (variant === 'h1' || variant === 'h2') {
    return <div className={`page-title ${className}`} style={style}>{children}</div>;
  }
  // variant h3 menggunakan page-subtitle styling
  if (variant === 'h3') {
    return <div className={`page-subtitle ${className}`} style={style}>{children}</div>;
  }
  // Default: plain text container
  return <div className={className} style={style}>{children}</div>;
}
