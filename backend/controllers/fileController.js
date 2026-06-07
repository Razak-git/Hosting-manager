const { pool } = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const UPLOAD_DIR = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `${unique}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
});

// GET /api/files
const getFiles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ files: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
};

// POST /api/files/upload
const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  try {
    const { filename, originalname, size, mimetype, path: filePath } = req.file;
    const [result] = await pool.query(
      'INSERT INTO files (user_id, filename, original_name, size, mimetype, path) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, filename, originalname, size, mimetype, filePath]
    );
    const [newFile] = await pool.query('SELECT * FROM files WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'File uploaded successfully.', file: newFile[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save file record.' });
  }
};

// GET /api/files/:id/download
const downloadFile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'File not found.' });
    const file = rows[0];
    if (!fs.existsSync(file.path)) return res.status(404).json({ message: 'File not found on disk.' });
    res.download(file.path, file.original_name);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download file.' });
  }
};

// DELETE /api/files/:id
const deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'File not found.' });
    const file = rows[0];
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await pool.query('DELETE FROM files WHERE id = ?', [id]);
    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete file.' });
  }
};

module.exports = { upload, getFiles, uploadFile, downloadFile, deleteFile };
