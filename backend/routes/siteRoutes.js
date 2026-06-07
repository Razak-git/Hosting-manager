const express = require('express');
const router = express.Router();
const { getSites, addSite, updateSite, deleteSite, checkSite, checkAllSites, getStats } = require('../controllers/siteController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/stats', getStats);
router.get('/', getSites);
router.post('/', addSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);
router.post('/check-all', checkAllSites);
router.post('/:id/check', checkSite);

module.exports = router;
