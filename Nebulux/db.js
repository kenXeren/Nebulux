// Database configuration
const DB_NAME = 'retroquest_db';
const DB_VERSION = 1;
const STORES = {
    users: 'users',
    gameState: 'gameState',
    achievements: 'achievements'
};

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create users store
            if (!db.objectStoreNames.contains(STORES.users)) {
                const userStore = db.createObjectStore(STORES.users, { keyPath: 'email' });
                userStore.createIndex('googleId', 'googleId', { unique: true });
                userStore.createIndex('name', 'name', { unique: false });
            }

            // Create game state store
            if (!db.objectStoreNames.contains(STORES.gameState)) {
                const gameStore = db.createObjectStore(STORES.gameState, { keyPath: 'userId' });
                gameStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            }

            // Create achievements store
            if (!db.objectStoreNames.contains(STORES.achievements)) {
                const achievementStore = db.createObjectStore(STORES.achievements, { keyPath: 'id', autoIncrement: true });
                achievementStore.createIndex('userId', 'userId', { unique: false });
                achievementStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

// User operations
const userDB = {
    async add(userData) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.users], 'readwrite');
            const store = transaction.objectStore(STORES.users);
            const request = store.add(userData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async update(userData) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.users], 'readwrite');
            const store = transaction.objectStore(STORES.users);
            const request = store.put(userData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async get(email) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.users], 'readonly');
            const store = transaction.objectStore(STORES.users);
            const request = store.get(email);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getByGoogleId(googleId) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.users], 'readonly');
            const store = transaction.objectStore(STORES.users);
            const index = store.index('googleId');
            const request = index.get(googleId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// Game state operations
const gameDB = {
    async save(gameState) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.gameState], 'readwrite');
            const store = transaction.objectStore(STORES.gameState);
            gameState.lastUpdated = new Date().toISOString();
            const request = store.put(gameState);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async load(userId) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.gameState], 'readonly');
            const store = transaction.objectStore(STORES.gameState);
            const request = store.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// Achievement operations
const achievementDB = {
    async add(achievement) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.achievements], 'readwrite');
            const store = transaction.objectStore(STORES.achievements);
            achievement.timestamp = new Date().toISOString();
            const request = store.add(achievement);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getByUser(userId) {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORES.achievements], 'readonly');
            const store = transaction.objectStore(STORES.achievements);
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

// Export database operations
window.retroQuestDB = {
    user: userDB,
    game: gameDB,
    achievement: achievementDB
}; 