const express = require('express');
const router = express.Router();
const { textTo3DCartoon } = require('../controllers/deepaiController');

router.post('/text-to-3d-cartoon', textTo3DCartoon);

module.exports = router;