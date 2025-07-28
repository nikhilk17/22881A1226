const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Simple in-memory storage
const urlDatabase = {};
const userDatabase = {};

// Middleware
app.use(cors());
app.use(express.json());

// Simple Logger Function
function log(level, package, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${package}] ${message}`);
}

// Registration endpoint
app.post('/api/register', (req, res) => {
    try {
        log('info', 'controller', 'Registration request received');
        
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            log('warn', 'controller', 'Registration failed - missing fields');
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required'
            });
        }

        if (userDatabase[username]) {
            log('warn', 'controller', 'Registration failed - user already exists');
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        userDatabase[username] = { username, email, password };
        log('info', 'controller', `User ${username} registered successfully`);
        
        res.status(200).json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        log('error', 'controller', `Registration error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

// Create Short URL endpoint
app.post('/shorturls', (req, res) => {
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

        // Generate shortcode if not provided
        const finalShortcode = shortcode || Math.random().toString(36).substring(2, 8);
        
        // Check if shortcode already exists
        if (urlDatabase[finalShortcode]) {
            log('warn', 'controller', 'URL creation failed - shortcode exists');
            return res.status(400).json({
                success: false,
                message: 'Shortcode already exists'
            });
        }

        // Calculate expiry (default 30 minutes)
        const validityMinutes = validity || 30;
        const expiry = new Date(Date.now() + validityMinutes * 60 * 1000);

        urlDatabase[finalShortcode] = {
            url,
            shortcode: finalShortcode,
            expiry: expiry.toISOString(),
            clicks: 0,
            created: new Date().toISOString()
        };

        log('info', 'service', `Short URL created: ${finalShortcode} -> ${url}`);

        res.status(201).json({
            shortLink: `http://localhost:${PORT}/${finalShortcode}`,
            expiry: expiry.toISOString()
        });
    } catch (error) {
        log('error', 'controller', `URL creation error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to create short URL'
        });
    }
});

// Get URL statistics
app.get('/shorturls/:shortcode', (req, res) => {
    try {
        const { shortcode } = req.params;
        log('info', 'controller', `Statistics requested for: ${shortcode}`);
        
        const urlData = urlDatabase[shortcode];
        
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
});

// Redirect to original URL
app.get('/:shortcode', (req, res) => {
    try {
        const { shortcode } = req.params;
        log('info', 'route', `Redirect requested for: ${shortcode}`);
        
        const urlData = urlDatabase[shortcode];
        
        if (!urlData) {
            log('warn', 'route', `Redirect failed - URL not found: ${shortcode}`);
            return res.status(404).json({
                success: false,
                message: 'Short URL not found'
            });
        }

        // Check if expired
        if (new Date() > new Date(urlData.expiry)) {
            log('warn', 'route', `Redirect failed - URL expired: ${shortcode}`);
            return res.status(410).json({
                success: false,
                message: 'Short URL has expired'
            });
        }

        // Increment click count
        urlData.clicks++;
        log('info', 'service', `Redirecting ${shortcode} to ${urlData.url} (clicks: ${urlData.clicks})`);
        
        res.redirect(urlData.url);
    } catch (error) {
        log('error', 'route', `Redirect error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Redirect failed'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    log('info', 'controller', 'Health check requested');
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    log('warn', 'route', `404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    log('info', 'service', `Server started successfully on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /shorturls - Create short URL`);
    console.log(`   GET /shorturls/:shortcode - Get URL statistics`);
    console.log(`   GET /:shortcode - Redirect to original URL`);
    console.log(`   GET /api/health - Health check`);
});

module.exports = app;
