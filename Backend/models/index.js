const urlDatabase = {};
const userDatabase = {};

class User {
    static create(userData) {
        const { username, email, password } = userData;
        userDatabase[username] = { username, email, password };
        return userDatabase[username];
    }

    static findByUsername(username) {
        return userDatabase[username];
    }

    static exists(username) {
        return !!userDatabase[username];
    }
}

class Url {
    static create(urlData) {
        const { url, shortcode, validity } = urlData;
        const validityMinutes = validity || 30;
        const expiry = new Date(Date.now() + validityMinutes * 60 * 1000);
        
        urlDatabase[shortcode] = {
            url,
            shortcode,
            expiry: expiry.toISOString(),
            clicks: 0,
            created: new Date().toISOString()
        };
        
        return urlDatabase[shortcode];
    }

    static findByShortcode(shortcode) {
        return urlDatabase[shortcode];
    }

    static exists(shortcode) {
        return !!urlDatabase[shortcode];
    }

    static incrementClicks(shortcode) {
        if (urlDatabase[shortcode]) {
            urlDatabase[shortcode].clicks++;
        }
    }

    static isExpired(shortcode) {
        const urlData = urlDatabase[shortcode];
        if (!urlData) return true;
        return new Date() > new Date(urlData.expiry);
    }
}

module.exports = { User, Url };
