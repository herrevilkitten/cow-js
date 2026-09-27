import type { HashFunction } from "../../authenticator.js";

/**
 * Data structure for storing authentication information in memory
 * This will not be persisted.
 */
export class MemoryStorage {
  private readonly storage: Record<string, string> = {};

  public store(key: string, value: string): void {
    this.storage[key] = value;
  }

  public retrieve(key: string): string | undefined {
    return this.storage[key];
  }

  public delete(key: string): void {
    delete this.storage[key];
  }
}
