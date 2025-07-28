function log(level, package, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${package}] ${message}`);
}

module.exports = { log };
