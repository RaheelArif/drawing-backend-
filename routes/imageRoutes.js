const express = require('express');
const router = express.Router();
const { processImage, checkStatus } = require('../controllers/imageController');

router.post('/process-image', processImage);
router.post('/check-status', checkStatus);

module.exports = router;