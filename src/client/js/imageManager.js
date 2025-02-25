// ImageManager for optimizing image loading time
const ImageManager = (function() {
    // Cache for loaded images
    const imageCache = new Map();
    
    // Queue for preloading
    const preloadQueue = [];
    let isPreloading = false;
    
    // Configuration
    const config = {
        maxCacheSize: 20, // Maximum number of images in cache
        preloadBatchSize: 3, // Number of images to preload
        retryAttempts: 2, // Number of attempts for loading an image
        retryDelay: 1000 // Delay between attempts in ms
    };

    class ImageManagerClass {
        constructor() {
            this.initializeIntersectionObserver();
        }

        // Initialize Intersection Observer for lazy loading
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

        // Load an image with retry mechanism
        async loadImage(src, attempts = 0) {
            // Check cache first
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

                // Add to cache
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

        // Add image to cache
        addToCache(src, img) {
            // Remove old items if cache is full
            if (imageCache.size >= config.maxCacheSize) {
                const oldestKey = imageCache.keys().next().value;
                imageCache.delete(oldestKey);
            }
            imageCache.set(src, img.src);
        }

        // Preload a batch of images
        async preloadImages(srcs) {
            // Add new URLs to the queue
            preloadQueue.push(...srcs);

            // Start preloading if not already in progress
            if (!isPreloading) {
                await this.processPreloadQueue();
            }
        }

        // Process the preload queue
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

        // Setup lazy loading for an image element
        setupLazyLoading(imgElement, src) {
            imgElement.dataset.src = src;
            this.observer.observe(imgElement);
        }

        // Clear the cache
        clearCache() {
            imageCache.clear();
        }

        // Get cache statistics
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

// Export the singleton instance
console.log('Exporting ImageManager instance');
window.imageManager = ImageManager; 