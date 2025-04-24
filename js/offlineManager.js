class OfflineManager {
    constructor() {
        this.setupOfflineDetection();
        this.setupServiceWorker();
    }

    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine;
            document.body.classList.toggle('offline', !status);
            
            // Update status indicator
            const statusIndicator = document.getElementById('connectionStatus');
            if (statusIndicator) {
                statusIndicator.textContent = status ? 'Online' : 'Offline';
                statusIndicator.className = status ? 
                    'bg-green-500 text-white px-3 py-1 rounded-full text-sm' :
                    'bg-red-500 text-white px-3 py-1 rounded-full text-sm';
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Initial check
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker with correct scope
                const registration = await navigator.serviceWorker.register('./sw.js', {
                    scope: './'
                });
                console.log('Service Worker registered successfully:', registration);
                
                // Wait for the service worker to be ready
                if (registration.installing) {
                    const serviceWorker = registration.installing || registration.waiting;
                    serviceWorker.addEventListener('statechange', () => {
                        if (serviceWorker.state === 'activated') {
                            console.log('Service Worker activated, caching complete');
                        }
                    });
                }
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    static async clearCache() {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                console.log('Cache cleared successfully');
            } catch (error) {
                console.error('Error clearing cache:', error);
            }
        }
    }
}

// Initialize offline manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.offlineManager = new OfflineManager();
});
