const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { sendVerificationCode } = require('../services/emailService');
require('dotenv').config();

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/verify-access-code
const verifyAccessCode = async (req, res) => {
  const { accessCode } = req.body;
  if (!accessCode) {
    return res.status(400).json({ message: 'Access code is required.' });
  }
  if (accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid access code.' });
  }
  res.json({ message: 'Access code verified.', valid: true });
};

// POST /api/auth/send-code
const sendCode = async (req, res) => {
  const { email, accessCode } = req.body;

  if (!accessCode || accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid access code.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email is required.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query('UPDATE verification_codes SET used = 1 WHERE email = ? AND used = 0', [email]);
    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );

    await sendVerificationCode(email, code);
    res.json({ message: 'Verification code sent successfully.' });
  } catch (err) {
    console.error('sendCode error:', err);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
};

// POST /api/auth/verify-code
const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    res.json({ message: 'Code verified successfully.', verified: true });
  } catch (err) {
    console.error('verifyCode error:', err);
    res.status(500).json({ message: 'Verification failed.' });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { email, code, password, confirmPassword, accessCode } = req.body;

  if (!accessCode || accessCode !== process.env.ACCESS_CODE) {
    return res.status(401).json({ message: 'Invalid access code.' });
  }

  if (!email || !code || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  try {
    const [codeRows] = await pool.query(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (codeRows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    await pool.query('UPDATE verification_codes SET used = 1 WHERE id = ?', [codeRows[0].id]);

    res.status(201).json({ message: 'Account created successfully.' });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Registration failed.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Login failed.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

module.exports = { verifyAccessCode, sendCode, verifyCode, register, login, getMe };
