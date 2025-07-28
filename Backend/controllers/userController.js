const { User } = require('../models');
const { log } = require('../utils/logger');

const register = (req, res) => {
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

        if (User.exists(username)) {
            log('warn', 'controller', 'Registration failed - user already exists');
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        User.create({ username, email, password });
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
};

module.exports = { register };
