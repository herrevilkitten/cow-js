import type { HashFunction } from "../authenticator.js";
import type { Storage } from "./storage.js";

export class PasswordAuthenticator {
  private readonly storage: Storage;
  private readonly hashFunction: HashFunction;
  private readonly salt: string;

  constructor(storage: Storage, hashFunction: HashFunction, salt: string) {
    this.storage = storage;
    this.hashFunction = hashFunction;
    this.salt = salt;
  }

  public store(key: string, value: string): void {
    const hashedValue = this.hashFunction(value, this.salt);
    this.storage.store(key, hashedValue);
  }

  public delete(key: string) {
    this.storage.delete(key);
  }

  public check(key: string, otherValue: string): boolean {
    const hashedValue = this.hashFunction(otherValue, this.salt);
    return this.storage.retrieve(key) === hashedValue;
  }
}
