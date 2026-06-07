import React, { useState, useEffect } from 'react';
import SiteCard from '../components/SiteCard';
import { getSites, addSite, updateSite, deleteSite } from '../services/api';
import api from '../services/api';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSites = async () => {
    try {
      const res = await getSites();
      setSites(res.data.sites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSites(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openAddModal = () => {
    setEditSite(null);
    setDomain('');
    setName('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (site) => {
    setEditSite(site);
    setDomain(site.domain);
    setName(site.name || '');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSite(null);
    setDomain('');
    setName('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editSite) {
        const res = await updateSite(editSite.id, { name });
        setSites((prev) => prev.map((s) => (s.id === editSite.id ? res.data.site : s)));
        showSuccess('Site mis à jour.');
      } else {
        const res = await addSite({ domain, name });
        setSites((prev) => [res.data.site, ...prev]);
        showSuccess('Site ajouté avec succès.');
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Opération échouée.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (site) => {
    try {
      await deleteSite(site.id);
      setSites((prev) => prev.filter((s) => s.id !== site.id));
      setDeleteConfirm(null);
      showSuccess('Site supprimé.');
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh un seul site
  const handleCheckSite = async (site) => {
    setCheckingId(site.id);
    try {
      const res = await api.post(`/sites/${site.id}/check`);
      setSites((prev) => prev.map((s) => (s.id === site.id ? res.data.site : s)));
      showSuccess(`${site.domain} vérifié — ${res.data.site.status.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingId(null);
    }
  };

  // Refresh tous les sites
  const handleCheckAll = async () => {
    setCheckingAll(true);
    try {
      const res = await api.post('/sites/check-all');
      setSites(res.data.sites || []);
      showSuccess(`${res.data.sites.length} site(s) vérifiés.`);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAll(false);
    }
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' }}>Mes Sites</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {sites.length} domaine{sites.length !== 1 ? 's' : ''} surveillé{sites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {sites.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={handleCheckAll}
              disabled={checkingAll}
              title="Vérifier tous les sites"
            >
              {checkingAll ? (
                <><span className="hm-spinner me-2"></span>Vérification...</>
              ) : (
                <><i className="bi bi-arrow-clockwise me-2"></i>Tout vérifier</>
              )}
            </button>
          )}
          <button className="btn btn-primary-hm" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-2"></i>Ajouter un site
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && <div className="hm-alert hm-alert-success mb-3"><i className="bi bi-check-circle me-2"></i>{successMsg}</div>}

      {/* Sites list */}
      {sites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌐</div>
          <h5>Aucun site ajouté</h5>
          <p>Ajoutez votre premier domaine pour commencer la surveillance</p>
          <button className="btn btn-primary-hm mt-3" onClick={openAddModal}>
            <i className="bi bi-plus-lg me-2"></i>Ajouter mon premier site
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={openEditModal}
              onDelete={(s) => setDeleteConfirm(s)}
              onCheck={handleCheckSite}
              checking={checkingId === site.id}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="hm-modal-backdrop" onClick={closeModal}>
          <div className="hm-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h5 style={{ margin: 0 }}>{editSite ? 'Modifier le site' : 'Ajouter un site'}</h5>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            {error && <div className="hm-alert hm-alert-error mb-3"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

            <form onSubmit={handleSubmit}>
              {!editSite && (
                <div className="mb-3">
                  <label className="hm-label">Nom de domaine</label>
                  <input
                    type="text"
                    className="form-control hm-input"
                    placeholder="ex: google.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <i className="bi bi-info-circle me-1"></i>
                    Le domaine sera validé et testé avant l'ajout
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="hm-label">Nom d'affichage <span style={{ color: 'var(--text-muted)' }}>(optionnel)</span></label>
                <input
                  type="text"
                  className="form-control hm-input"
                  placeholder="Mon Site"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-ghost flex-fill" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary-hm flex-fill" disabled={submitting}>
                  {submitting ? (
                    <><span className="hm-spinner me-2"></span>{editSite ? 'Sauvegarde...' : 'Validation en cours...'}</>
                  ) : (
                    editSite ? 'Sauvegarder' : 'Ajouter le site'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="hm-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="hm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
              <h5>Supprimer le site</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 24px' }}>
                Supprimer <strong className="font-mono">{deleteConfirm.domain}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost flex-fill" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn-danger-hm flex-fill" onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: '10px' }}>
                <i className="bi bi-trash me-1"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
