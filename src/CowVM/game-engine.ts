import type { CowDB } from "@CowVM/database.js";

export class GameEngine {
  readonly database: CowDB;
  private readonly outputQueue: Record<string, string[]> = {};

  constructor(database: CowDB) {
    this.database = database;
  }

  public queueOutput(clientUri: string, message: string) {
    console.debug(`Queueing output for client ${clientUri}: ${message}`);
    if (!this.outputQueue[clientUri]) {
      this.outputQueue[clientUri] = [];
    }
    this.outputQueue[clientUri].push(message);
  }
}
