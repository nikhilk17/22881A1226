const axios = require('axios');

class Logger {
    constructor() {
        this.testServerUrl = 'http://20.244.56.144/evaluation-service/logs';
        this.authToken = null;
        
        // Validation constants
        this.validStacks = ['backend', 'frontend'];
        this.validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
        this.validPackages = {
            backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'auth', 'config', 'middleware', 'utils'],
            frontend: ['api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils']
        };
    }

    setAuthToken(token) {
        this.authToken = token;
    }

    async Log(stack, level, packageName, message) {
        if (!this.authToken) {
            console.error('Authentication token not set. Please authenticate first.');
            return;
        }

        // Normalize inputs
        stack = stack.toLowerCase();
        level = level.toLowerCase();
        packageName = packageName.toLowerCase();

        // Validate inputs
        if (!this.validStacks.includes(stack)) {
            console.error(`Invalid stack: ${stack}. Must be 'backend' or 'frontend'`);
            return;
        }

        if (!this.validLevels.includes(level)) {
            console.error(`Invalid level: ${level}. Must be one of: ${this.validLevels.join(', ')}`);
            return;
        }

        if (!this.validPackages[stack].includes(packageName)) {
            console.error(`Invalid package: ${packageName} for stack: ${stack}`);
            return;
        }

        try {
            const response = await axios.post(this.testServerUrl, {
                stack,
                level,
                package: packageName,
                message
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            console.log('Log sent successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending log:', error.response?.data || error.message);
            throw error;
        }
    }

    // Convenience methods
    async debug(stack, packageName, message) { return this.Log(stack, 'debug', packageName, message); }
    async info(stack, packageName, message) { return this.Log(stack, 'info', packageName, message); }
    async warn(stack, packageName, message) { return this.Log(stack, 'warn', packageName, message); }
    async error(stack, packageName, message) { return this.Log(stack, 'error', packageName, message); }
    async fatal(stack, packageName, message) { return this.Log(stack, 'fatal', packageName, message); }
}

module.exports = new Logger();