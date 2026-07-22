export default function ProgressTargetBar({ title, current, target, percentage, color = "#10B981", statusText }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{current}</span> / {target}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {statusText && (
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: color, 
              backgroundColor: `${color}15`, 
              padding: '2px 8px', 
              borderRadius: '9999px',
              marginBottom: '4px'
            }}>
              {statusText}
            </span>
          )}
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: color }}>{percentage}%</span>
        </div>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: color, borderRadius: '9999px' }}></div>
      </div>
    </div>
  );
}
