const { pool } = require('../config/db');
const { isDomainValid, checkSiteStatus } = require('../services/domainChecker');

// GET /api/sites
const getSites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ sites: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sites.' });
  }
};

// POST /api/sites
const addSite = async (req, res) => {
  const { domain, name } = req.body;
  if (!domain) return res.status(400).json({ message: 'Domain is required.' });

  try {
    const validation = await isDomainValid(domain);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const cleanDomain = validation.domain;

    const [existing] = await pool.query(
      'SELECT id FROM sites WHERE user_id = ? AND domain = ?',
      [req.user.id, cleanDomain]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Vous avez déjà ajouté ce domaine.' });
    }

    const status = await checkSiteStatus(cleanDomain);

    const [result] = await pool.query(
      'INSERT INTO sites (user_id, domain, name, status, last_checked) VALUES (?, ?, ?, ?, NOW())',
      [req.user.id, cleanDomain, name || cleanDomain, status]
    );

    const [newSite] = await pool.query('SELECT * FROM sites WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Site ajouté avec succès.', site: newSite[0] });
  } catch (err) {
    console.error('addSite error:', err);
    res.status(500).json({ message: 'Échec de l\'ajout du site.' });
  }
};

// PUT /api/sites/:id
const updateSite = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM sites WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Site introuvable.' });

    await pool.query('UPDATE sites SET name = ? WHERE id = ?', [name || rows[0].name, id]);
    const [updated] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    res.json({ message: 'Site mis à jour.', site: updated[0] });
  } catch (err) {
    res.status(500).json({ message: 'Échec de la mise à jour.' });
  }
};

// DELETE /api/sites/:id
const deleteSite = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id FROM sites WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Site introuvable.' });

    await pool.query('DELETE FROM sites WHERE id = ?', [id]);
    res.json({ message: 'Site supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Échec de la suppression.' });
  }
};

// POST /api/sites/:id/check — Refresh manuel
const checkSite = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM sites WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Site introuvable.' });

    const site = rows[0];
    const status = await checkSiteStatus(site.domain);

    await pool.query(
      'UPDATE sites SET status = ?, last_checked = NOW() WHERE id = ?',
      [status, id]
    );

    const [updated] = await pool.query('SELECT * FROM sites WHERE id = ?', [id]);
    res.json({ message: 'Vérification effectuée.', site: updated[0] });
  } catch (err) {
    res.status(500).json({ message: 'Échec de la vérification.' });
  }
};

// POST /api/sites/check-all — Refresh tous les sites
const checkAllSites = async (req, res) => {
  try {
    const [sites] = await pool.query('SELECT * FROM sites WHERE user_id = ?', [req.user.id]);

    for (const site of sites) {
      const status = await checkSiteStatus(site.domain);
      await pool.query(
        'UPDATE sites SET status = ?, last_checked = NOW() WHERE id = ?',
        [status, site.id]
      );
    }

    const [updated] = await pool.query(
      'SELECT * FROM sites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ message: `${sites.length} site(s) vérifiés.`, sites: updated });
  } catch (err) {
    res.status(500).json({ message: 'Échec de la vérification.' });
  }
};

// GET /api/sites/stats
const getStats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM sites WHERE user_id = ?', [req.user.id]);
    const [online] = await pool.query('SELECT COUNT(*) as count FROM sites WHERE user_id = ? AND status = "online"', [req.user.id]);
    const [offline] = await pool.query('SELECT COUNT(*) as count FROM sites WHERE user_id = ? AND status = "offline"', [req.user.id]);
    const [files] = await pool.query('SELECT COUNT(*) as count FROM files WHERE user_id = ?', [req.user.id]);

    res.json({
      total: total[0].count,
      online: online[0].count,
      offline: offline[0].count,
      files: files[0].count,
    });
  } catch (err) {
    res.status(500).json({ message: 'Échec de la récupération des stats.' });
  }
};

module.exports = { getSites, addSite, updateSite, deleteSite, checkSite, checkAllSites, getStats };
