const express = require('express');
const router = express.Router();
const { verifyAccessCode, sendCode, verifyCode, register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/verify-access-code', verifyAccessCode);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
