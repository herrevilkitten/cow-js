export interface Storage {
  store(key: string, value: string): void;
  retrieve(key: string): string | undefined;
  delete(key: string): void;
}
