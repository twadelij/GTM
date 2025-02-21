// ImageManager voor het optimaliseren van afbeeldingslaadtijd
const ImageManager = (function() {
    // Cache voor geladen afbeeldingen
    const imageCache = new Map();
    
    // Queue voor preloading
    const preloadQueue = [];
    let isPreloading = false;
    
    // Configuratie
    const config = {
        maxCacheSize: 20, // Maximum aantal afbeeldingen in cache
        preloadBatchSize: 3, // Aantal afbeeldingen om vooraf te laden
        retryAttempts: 2, // Aantal pogingen voor laden van een afbeelding
        retryDelay: 1000 // Vertraging tussen pogingen in ms
    };

    class ImageManagerClass {
        constructor() {
            this.initializeIntersectionObserver();
        }

        // Initialiseer Intersection Observer voor lazy loading
        initializeIntersectionObserver() {
            this.observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                this.loadImage(img.dataset.src)
                                    .then(url => {
                                        img.src = url;
                                        img.removeAttribute('data-src');
                                    })
                                    .catch(error => console.error('Lazy loading failed:', error));
                                this.observer.unobserve(img);
                            }
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.1
                }
            );
        }

        // Laad een afbeelding met retry mechanisme
        async loadImage(src, attempts = 0) {
            // Check cache eerst
            if (imageCache.has(src)) {
                return imageCache.get(src);
            }

            try {
                const img = new Image();
                const loadPromise = new Promise((resolve, reject) => {
                    img.onload = () => resolve(src);
                    img.onerror = reject;
                });

                img.src = src;
                await loadPromise;

                // Voeg toe aan cache
                this.addToCache(src, img);
                return src;
            } catch (error) {
                if (attempts < config.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
                    return this.loadImage(src, attempts + 1);
                }
                throw new Error(`Failed to load image after ${config.retryAttempts} attempts`);
            }
        }

        // Voeg afbeelding toe aan cache
        addToCache(src, img) {
            // Verwijder oude items als cache vol is
            if (imageCache.size >= config.maxCacheSize) {
                const oldestKey = imageCache.keys().next().value;
                imageCache.delete(oldestKey);
            }
            imageCache.set(src, img.src);
        }

        // Preload een batch afbeeldingen
        async preloadImages(srcs) {
            // Voeg nieuwe URLs toe aan de queue
            preloadQueue.push(...srcs);

            // Start preloading als nog niet bezig
            if (!isPreloading) {
                await this.processPreloadQueue();
            }
        }

        // Verwerk de preload queue
        async processPreloadQueue() {
            isPreloading = true;

            while (preloadQueue.length > 0) {
                const batch = preloadQueue.splice(0, config.preloadBatchSize);
                await Promise.allSettled(
                    batch.map(src => this.loadImage(src))
                );
            }

            isPreloading = false;
        }

        // Setup lazy loading voor een afbeeldingselement
        setupLazyLoading(imgElement, src) {
            imgElement.dataset.src = src;
            this.observer.observe(imgElement);
        }

        // Clear de cache
        clearCache() {
            imageCache.clear();
        }

        // Get cache statistieken
        getCacheStats() {
            return {
                size: imageCache.size,
                maxSize: config.maxCacheSize,
                urls: Array.from(imageCache.keys())
            };
        }
    }

    return new ImageManagerClass();
})();

// Exporteer de singleton instantie
console.log('Exporting ImageManager instance');
window.imageManager = ImageManager; 