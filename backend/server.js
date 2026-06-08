require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { initDatabase, pool } = require('./config/db');
const { checkSiteStatus } = require('./services/domainChecker');

const authRoutes = require('./routes/authRoutes');
const siteRoutes = require('./routes/siteRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// Cron: Monitor sites every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  console.log('🔍 Running site monitoring check...');
  try {
    const [sites] = await pool.query('SELECT id, domain FROM sites');
    for (const site of sites) {
      const status = await checkSiteStatus(site.domain);
      await pool.query(
        'UPDATE sites SET status = ?, last_checked = NOW() WHERE id = ?',
        [status, site.id]
      );
    }
    console.log(`✅ Checked ${sites.length} site(s)`);
  } catch (err) {
    console.error('Cron error:', err);
  }
});

const PORT = process.env.PORT || 5000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
