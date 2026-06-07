import React from 'react';

const SiteCard = ({ site, onEdit, onDelete, onCheck, checking }) => {
  const statusMap = {
    online: { cls: 'badge-online', label: 'En ligne' },
    offline: { cls: 'badge-offline', label: 'Hors ligne' },
    unknown: { cls: 'badge-unknown', label: 'Inconnu' },
  };

  const status = statusMap[site.status] || statusMap.unknown;

  const formatDate = (date) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleString('fr-FR', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const openSite = () => {
    window.open(`https://${site.domain}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="site-card">
      {/* Favicon cliquable */}
      <div
        className="site-favicon"
        onClick={openSite}
        title={`Ouvrir ${site.domain}`}
        style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🌐
      </div>

      {/* Infos cliquables */}
      <div className="site-info" style={{ cursor: 'pointer' }} onClick={openSite}>
        <div className="site-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {site.name || site.domain}
          <i className="bi bi-box-arrow-up-right" style={{ fontSize: '11px', color: 'var(--text-muted)' }}></i>
        </div>
        <div className="site-domain">{site.domain}</div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <i className="bi bi-clock me-1"></i>
          Vérifié : {formatDate(site.last_checked)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <span className={`badge-status ${status.cls}`}>
          <span className="pulse"></span>
          {status.label}
        </span>

        {/* Refresh individuel */}
        <button
          className="btn-ghost"
          onClick={() => onCheck(site)}
          disabled={checking}
          title="Vérifier maintenant"
          style={{ padding: '7px 10px' }}
        >
          {checking ? (
            <span className="hm-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
          ) : (
            <i className="bi bi-arrow-clockwise"></i>
          )}
        </button>

        <button
          className="btn-ghost"
          onClick={() => onEdit(site)}
          title="Modifier"
          style={{ padding: '7px 10px' }}
        >
          <i className="bi bi-pencil"></i>
        </button>

        <button
          className="btn-danger-hm"
          onClick={() => onDelete(site)}
          title="Supprimer"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default SiteCard;
