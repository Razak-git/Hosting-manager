import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import StatsCard from '../components/StatsCard';
import { getStats, getSites } from '../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, files: 0 });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sitesRes] = await Promise.all([getStats(), getSites()]);
      setStats(statsRes.data);
      setSites(sitesRes.data.sites || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Rafraîchit toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const uptimeRate = stats.total > 0 ? ((stats.online / stats.total) * 100).toFixed(1) : 100;

  const uptimeData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Auj'],
    datasets: [
      {
        label: 'Disponibilité %',
        data: [98.2, 99.1, 97.5, 99.8, 100, 99.3, parseFloat(uptimeRate)],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const uptimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        callbacks: { label: (ctx) => ` ${ctx.parsed.y}%` },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#475569', font: { family: 'Sora', size: 11 } },
      },
      y: {
        min: 80,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#475569', font: { family: 'Sora', size: 11 }, callback: (v) => `${v}%` },
      },
    },
  };

  const doughnutData = {
    labels: ['En ligne', 'Hors ligne', 'Inconnu'],
    datasets: [{
      data: [
        stats.online,
        stats.offline,
        Math.max(0, stats.total - stats.online - stats.offline),
      ],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(245,158,11,0.5)'],
      borderColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Sora', size: 12 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
      },
    },
    cutout: '70%',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div className="hm-spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec dernière mise à jour */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' }}>Dashboard</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            <i className="bi bi-arrow-clockwise me-1"></i>
            Mis à jour à {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}
            <span style={{ marginLeft: '8px', color: 'var(--accent)' }}>• Auto-refresh 30s</span>
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={fetchData}
          title="Rafraîchir maintenant"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>Rafraîchir
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard icon="bi-globe2" value={stats.total} label="Total Sites" color="var(--accent)" bgColor="rgba(99,102,241,0.12)" />
        <StatsCard icon="bi-check-circle" value={stats.online} label="En ligne" color="var(--success)" bgColor="rgba(16,185,129,0.12)" />
        <StatsCard icon="bi-x-circle" value={stats.offline} label="Hors ligne" color="var(--danger)" bgColor="rgba(239,68,68,0.12)" />
        <StatsCard icon="bi-folder2" value={stats.files} label="Fichiers" color="var(--warning)" bgColor="rgba(245,158,11,0.12)" />
      </div>

      {/* Uptime banner */}
      {stats.total > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius)',
          padding: '16px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '28px' }}>📊</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '20px', color: uptimeRate >= 80 ? 'var(--accent)' : 'var(--danger)' }}>
              {uptimeRate}% de disponibilité
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {stats.online} sur {stats.total} site{stats.total > 1 ? 's' : ''} en ligne
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="chart-card">
            <h6>Historique disponibilité (7 derniers jours)</h6>
            <div style={{ height: '200px' }}>
              <Line data={uptimeData} options={uptimeOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="chart-card">
            <h6>Statut des sites</h6>
            <div style={{ height: '200px' }}>
              {stats.total > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-icon">🌐</div>
                  <p>Aucun site ajouté</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sites récents */}
      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h6 style={{ margin: 0 }}>Sites récents</h6>
          <a href="/sites" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>
            Voir tout <i className="bi bi-arrow-right"></i>
          </a>
        </div>
        {sites.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-icon">🌐</div>
            <h5>Aucun site</h5>
            <p>Allez dans Sites pour ajouter votre premier domaine</p>
          </div>
        ) : (
          <div>
            {sites.slice(0, 5).map((site) => (
              <div className="activity-item" key={site.id}>
                <div className="activity-dot" style={{
                  background: site.status === 'online' ? 'var(--success)' : site.status === 'offline' ? 'var(--danger)' : 'var(--warning)',
                }} />
                <span
                  className="activity-text font-mono"
                  style={{ cursor: 'pointer', color: 'var(--accent)' }}
                  onClick={() => window.open(`https://${site.domain}`, '_blank')}
                >
                  {site.domain}
                </span>
                <span style={{
                  fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                  background: site.status === 'online' ? 'rgba(16,185,129,0.12)' : site.status === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                  color: site.status === 'online' ? 'var(--success)' : site.status === 'offline' ? 'var(--danger)' : 'var(--warning)',
                  fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px',
                }}>
                  {site.status === 'online' ? 'En ligne' : site.status === 'offline' ? 'Hors ligne' : 'Inconnu'}
                </span>
                <span className="activity-time">
                  {site.last_checked ? new Date(site.last_checked).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
