class DatabaseManager {
    constructor() {
        this.dbName = 'videoAnalysisDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDatabase();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                // Dispatch custom event when database is ready
                document.dispatchEvent(new CustomEvent('dbManagerReady'));
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains('processes')) {
                    db.createObjectStore('processes', { keyPath: 'id', autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('videos')) {
                    db.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveProcesses(processes) {
        const store = this.db.transaction(['processes'], 'readwrite').objectStore('processes');
        await store.clear(); // Clear existing data
        return Promise.all(processes.map(process => {
            return new Promise((resolve, reject) => {
                const request = store.add(process);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }));
    }

    async getProcesses() {
        return new Promise((resolve, reject) => {
            const store = this.db.transaction(['processes'], 'readonly').objectStore('processes');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveVideo(videoFile) {
        return new Promise((resolve, reject) => {
            const store = this.db.transaction(['videos'], 'readwrite').objectStore('videos');
            const request = store.add({
                file: videoFile,
                timestamp: new Date().getTime()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getLatestVideo() {
        return new Promise((resolve, reject) => {
            const store = this.db.transaction(['videos'], 'readonly').objectStore('videos');
            const request = store.openCursor(null, 'prev');

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                resolve(cursor ? cursor.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize database manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dbManager = new DatabaseManager();
});
