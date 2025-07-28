const { log } = require('../utils/logger');

const notFound = (req, res) => {
    log('warn', 'route', `404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
};

module.exports = { notFound };
