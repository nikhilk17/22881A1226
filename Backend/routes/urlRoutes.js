const express = require('express');
const { createShortUrl, getUrlStats, redirectUrl, healthCheck } = require('../controllers/urlController');

const router = express.Router();

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode', getUrlStats);
router.get('/api/health', healthCheck);
router.get('/:shortcode', redirectUrl);

module.exports = router;
