export type HashFunction = (data: string, salt: string) => string;

export interface Authenticator {
  store(key: string, password: string): void;
  delete(key: string): void;
  check(key: string, otherValue: string): boolean;
}
