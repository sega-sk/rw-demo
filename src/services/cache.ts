interface CacheItem<T> {
  data: T;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items in memory
  maxStorageSize: number; // Maximum localStorage usage in MB
  staleWhileRevalidate: boolean; // Return stale data while fetching fresh
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private revalidationPromises = new Map<string, Promise<any>>();
  private storageUsage = 0; // Track localStorage usage

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      maxStorageSize: 10, // 10MB max localStorage
      staleWhileRevalidate: true,
      ...config
    };

    // Calculate current storage usage
    this.calculateStorageUsage();

    // Listen for API updates to invalidate cache
    this.setupInvalidationListeners();
  }

  private calculateStorageUsage() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('cache_')) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }
    this.storageUsage = totalSize / (1024 * 1024); // Convert to MB
  }
  private setupInvalidationListeners() {
    // Listen for storage events to sync cache across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'cache-invalidation') {
        const invalidationData = JSON.parse(e.newValue || '{}');
        this.invalidatePattern(invalidationData.pattern);
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.revalidateStaleEntries();
    });
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > this.config.ttl;
  }

  private isStale(item: CacheItem<any>): boolean {
    // Consider data stale after 1 minute for immediate updates
    return Date.now() - item.timestamp > 60 * 1000;
  }

  private evictOldest() {
    // More aggressive eviction when we have many products
    if (this.cache.size >= this.config.maxSize) {
      // Remove 25% of oldest entries to make room
      const keysToRemove = Array.from(this.cache.keys()).slice(0, Math.floor(this.config.maxSize * 0.25));
      keysToRemove.forEach(key => {
        this.cache.delete(key);
        localStorage.removeItem(`cache_${key}`);
      });
    }
  }

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>,
    options: Partial<CacheConfig & { skipCache?: boolean }> = {}
  ): Promise<T> {
    const config = { ...this.config, ...options };
    
    // Skip cache for search queries or when explicitly requested
    if (options.skipCache || key.startsWith('search-')) {
      return this.fetchAndCache(key, fetcher, false);
    }
    
    const cached = this.cache.get(key);

    // Return fresh data immediately if available
    if (cached && !this.isExpired(cached)) {
      // If data is stale but not expired, trigger background revalidation
      if (this.isStale(cached) && config.staleWhileRevalidate && navigator.onLine) {
        this.revalidateInBackground(key, fetcher);
      }
      return cached.data;
    }

    // Return stale data while revalidating if enabled
    if (cached && config.staleWhileRevalidate && navigator.onLine) {
      this.revalidateInBackground(key, fetcher);
      return cached.data;
    }

    // Fetch fresh data
    return this.fetchAndCache(key, fetcher, true);
  }

  private async revalidateInBackground<T>(key: string, fetcher: () => Promise<T>) {
    // Prevent multiple revalidation requests for the same key
    if (this.revalidationPromises.has(key)) {
      return;
    }

    const revalidationPromise = this.fetchAndCache(key, fetcher, true);
    this.revalidationPromises.set(key, revalidationPromise);

    try {
      await revalidationPromise;
    } finally {
      this.revalidationPromises.delete(key);
    }
  }

  private async fetchAndCache<T>(key: string, fetcher: () => Promise<T>, shouldCache: boolean = true): Promise<T> {
    try {
      const data = await fetcher();
      
      if (!shouldCache) {
        return data;
      }
      
      this.evictOldest();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });

      // Persist to localStorage for offline access
      this.persistToStorage(key, data, !key.startsWith('search-'));

      return data;
    } catch (error) {
      // Return cached data if available during error
      const cached = this.cache.get(key);
      if (cached) {
        return cached.data;
      }

      // Try to load from localStorage
      const stored = this.loadFromStorage(key);
      if (stored) {
        return stored;
      }

      throw error;
    }
  }

  private persistToStorage<T>(key: string, data: T, persist: boolean = true) {
    // Don't persist search results or if storage is full
    if (!persist || this.storageUsage > this.config.maxStorageSize) {
      return;
    }
    
    try {
      const storageKey = `cache_${key}`;
      const item = {
        data,
        timestamp: Date.now()
      };
      const itemString = JSON.stringify(item);
      localStorage.setItem(storageKey, itemString);
      this.storageUsage += itemString.length / (1024 * 1024);
    } catch (error) {
      // Storage quota exceeded, clear old items
      console.warn('Storage quota exceeded, clearing old cache items');
      this.clearOldStorageItems();
    }
  }

  private loadFromStorage<T>(key: string): T | null {
    try {
      const storageKey = `cache_${key}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const item = JSON.parse(stored);
        // Don't use storage data older than 1 hour
        if (Date.now() - item.timestamp < 60 * 60 * 1000) {
          return item.data;
        }
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
    return null;
  }

  private clearOldStorageItems() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      // Don't load search results from storage
      if (key.startsWith('search-')) {
        return null;
      }
      
      // Sort by timestamp and remove oldest 25%
      const items = cacheKeys.map(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: item.timestamp || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = items.slice(0, Math.floor(items.length * 0.25));
      toRemove.forEach(item => {
        localStorage.removeItem(item.key);
      });
      this.calculateStorageUsage(); // Recalculate after cleanup
    } catch (error) {
      console.warn('Failed to clear old storage items:', error);
    }
  }

  invalidate(key: string) {
    this.cache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    
    // Clear memory cache
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }

    // Clear localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('cache_') && regex.test(key.substring(6))) {
        localStorage.removeItem(key);
      }
    }

    // Notify other tabs
    localStorage.setItem('cache-invalidation', JSON.stringify({ 
      pattern, 
      timestamp: Date.now() 
    }));
  }

  private async revalidateStaleEntries() {
    const staleKeys = Array.from(this.cache.entries())
      .filter(([_, item]) => this.isStale(item))
      .map(([key]) => key);

    // Revalidate up to 5 stale entries at once
    const toRevalidate = staleKeys.slice(0, 5);
    
    for (const key of toRevalidate) {
      // This would need the original fetcher, so we'll just mark for next access
      const cached = this.cache.get(key);
      if (cached) {
        cached.timestamp = 0; // Force refresh on next access
      }
    }
  }

  clear() {
    this.cache.clear();
    
    // Clear localStorage cache items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
    this.storageUsage = 0;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      storageUsage: `${this.storageUsage.toFixed(2)}MB`,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const cacheManager = new CacheManager({
  ttl: 3 * 60 * 1000, // Reduced to 3 minutes for better freshness
  maxSize: 50, // Reduced memory cache size
  maxStorageSize: 5, // 5MB max localStorage
  staleWhileRevalidate: true
});

// Cache invalidation helpers
export const invalidateProductCache = () => {
  cacheManager.invalidatePattern('products.*');
};

export const invalidateMemorabiliaCache = () => {
  cacheManager.invalidatePattern('memorabilia.*');
};

export const invalidateMerchandiseCache = () => {
  cacheManager.invalidatePattern('merchandise.*');
};

export const invalidateAllCache = () => {
  cacheManager.clear();
};