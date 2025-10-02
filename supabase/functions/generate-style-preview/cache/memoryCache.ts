export interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class LruMemoryCache<T> {
  private cache = new Map<string, MemoryCacheEntry<T>>();

  constructor(private readonly capacity: number) {}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.capacity <= 0) {
      return;
    }

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
