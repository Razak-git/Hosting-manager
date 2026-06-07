import React from 'react';

const StatsCard = ({ icon, value, label, color, bgColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor || 'rgba(99,102,241,0.12)', color: color || 'var(--accent)' }}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatsCard;
