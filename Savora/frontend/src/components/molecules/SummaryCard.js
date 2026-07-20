import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function SummaryCard({ title, value, icon, trend, trendLabel, trendUp = true, chartData, chartColor }) {
  return (
    <div className="summary-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '10px', color: 'var(--text-muted)' }}>
          {icon}
        </div>
        {trend && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: trendUp ? 'var(--primary-color)' : 'var(--danger-color)', backgroundColor: trendUp ? 'var(--secondary-color)' : '#FEE2E2', padding: '4px 8px', borderRadius: '20px', height: 'fit-content' }}>
            {trendUp ? '↗' : '↘'} {trend} {trendLabel && <span style={{color: 'var(--text-muted)', fontWeight: 400}}>{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className="summary-card-title">{title}</div>
      <div className="summary-card-value" style={{ marginBottom: chartData ? '30px' : '0' }}>{value}</div>
      
      {chartData && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="value" stroke={chartColor || (trendUp ? '#10B981' : '#EF4444')} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
