import { ArrowRight } from "lucide-react";

export default function RecommendationCard({ icon, title, description, actionText, type = "info" }) {
  // Determine colors based on type (warning, info, success)
  const colors = {
    warning: { bg: '#FEF2F2', border: '#FCA5A5', icon: '#EF4444', text: '#991B1B' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#3B82F6', text: '#1E40AF' },
    success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#10B981', text: '#166534' }
  };
  
  const theme = colors[type] || colors.info;

  return (
    <div style={{ 
      backgroundColor: theme.bg, 
      border: `1px solid ${theme.border}`, 
      borderRadius: '12px', 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '8px',
          color: theme.icon,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', marginBottom: '5px' }}>{title}</div>
          <div style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.5' }}>{description}</div>
        </div>
      </div>
      
      {actionText && (
        <div style={{ 
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button style={{ 
            background: 'none', 
            border: 'none', 
            color: theme.text, 
            fontWeight: 600, 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}>
            {actionText} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
