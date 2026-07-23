"use client";

import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (notificationId, e) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.notification-bell-container')) return;
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="notification-bell-container" style={{ position: 'relative' }}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell-button"
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Notifikasi"
      >
        <Bell size={20} color="var(--text-muted)" />
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '18px',
              height: '18px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '50%',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel Notifikasi */}
      {isOpen && (
        <div
          className="notification-panel"
          style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            backgroundColor: 'white',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
              Notifikasi ({notifications.length})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '300px',
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: notif.is_read ? 'white' : 'rgba(59, 130, 246, 0.02)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = notif.is_read
                      ? '#f9fafb'
                      : 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notif.is_read
                      ? 'white'
                      : 'rgba(59, 130, 246, 0.02)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: '0 0 4px 0',
                          fontSize: '0.9rem',
                          fontWeight: notif.is_read ? 500 : 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {notif.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                        }}
                      >
                        {notif.message}
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '0.75rem',
                          color: 'var(--text-light)',
                        }}
                      >
                        {new Date(notif.created_at).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          flexShrink: 0,
                        }}
                        title="Tandai sebagai dibaca"
                      >
                        <Check size={16} color="var(--primary-color)" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.some(n => !n.is_read) && (
            <div
              style={{
                padding: '8px 16px',
                borderTop: '1px solid var(--border-light)',
                backgroundColor: '#f9fafb',
              }}
            >
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCheck size={14} />
                Tandai semua sudah dibaca
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
