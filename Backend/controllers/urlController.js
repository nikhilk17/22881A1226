const { Url } = require('../models');
const { log } = require('../utils/logger');

const createShortUrl = (req, res) => {
    try {
        log('info', 'controller', 'Short URL creation request received');
        
        const { url, validity, shortcode } = req.body;
        
        if (!url) {
            log('warn', 'controller', 'URL creation failed - missing URL');
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        const finalShortcode = shortcode || Math.random().toString(36).substring(2, 8);
        
        if (Url.exists(finalShortcode)) {
            log('warn', 'controller', 'URL creation failed - shortcode exists');
            return res.status(400).json({
                success: false,
                message: 'Shortcode already exists'
            });
        }

        const urlData = Url.create({ url, shortcode: finalShortcode, validity });
        log('info', 'service', `Short URL created: ${finalShortcode} -> ${url}`);

        res.status(201).json({
            shortLink: `http://localhost:3000/${finalShortcode}`,
            expiry: urlData.expiry
        });
    } catch (error) {
        log('error', 'controller', `URL creation error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to create short URL'
        });
    }
};

const getUrlStats = (req, res) => {
    try {
        const { shortcode } = req.params;
        log('info', 'controller', `Statistics requested for: ${shortcode}`);
        
        const urlData = Url.findByShortcode(shortcode);
        
        if (!urlData) {
            log('warn', 'controller', `Statistics not found for: ${shortcode}`);
            return res.status(404).json({
                success: false,
                message: 'Short URL not found'
            });
        }

        log('info', 'service', `Statistics retrieved for: ${shortcode}`);
        
        res.status(200).json({
            url: urlData.url,
            shortcode: urlData.shortcode,
            created: urlData.created,
            expiry: urlData.expiry,
            clicks: urlData.clicks
        });
    } catch (error) {
        log('error', 'controller', `Statistics error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics'
        });
    }
};

const redirectUrl = (req, res) => {
    try {
        const { shortcode } = req.params;
        log('info', 'route', `Redirect requested for: ${shortcode}`);
        
        const urlData = Url.findByShortcode(shortcode);
        
        if (!urlData) {
            log('warn', 'route', `Redirect failed - URL not found: ${shortcode}`);
            return res.status(404).json({
                success: false,
                message: 'Short URL not found'
            });
        }

        if (Url.isExpired(shortcode)) {
            log('warn', 'route', `Redirect failed - URL expired: ${shortcode}`);
            return res.status(410).json({
                success: false,
                message: 'Short URL has expired'
            });
        }

        Url.incrementClicks(shortcode);
        log('info', 'service', `Redirecting ${shortcode} to ${urlData.url} (clicks: ${urlData.clicks + 1})`);
        
        res.redirect(urlData.url);
    } catch (error) {
        log('error', 'route', `Redirect error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Redirect failed'
        });
    }
};

const healthCheck = (req, res) => {
    log('info', 'controller', 'Health check requested');
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
};

module.exports = { createShortUrl, getUrlStats, redirectUrl, healthCheck };
