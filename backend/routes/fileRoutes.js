const express = require('express');
const router = express.Router();
const { upload, getFiles, uploadFile, downloadFile, deleteFile } = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);

module.exports = router;
