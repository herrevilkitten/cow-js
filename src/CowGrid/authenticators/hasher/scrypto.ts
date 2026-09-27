import { scryptSync } from "node:crypto";

export function scryptoHash(data: string, salt: string): string {
  const hash = scryptSync(data, salt, 64);
  return hash.toString("hex");
}
