let memoryCache = {};

// Clear cache every day
setInterval(() => {
    memoryCache = {};
}, 1 * 24 * 60 * 60 * 1000); // 1 day

function store(key, value, ttl) {
    memoryCache[key] = {
        data: value,
        expires: Date.now() + ttl * 60 * 1000
    };
}

function get(key) {
    const cache = memoryCache[key];

    if (!cache) {
        return;
    }

    if (cache.expires - Date.now() < 0) {
        delete memoryCache[key];
        return;
    }

    return cache.data;
}

module.exports = {
    store,
    get
};
