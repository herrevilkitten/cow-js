import type { CowDB } from "@CowVM/database.js";

export class GameEngine {
  readonly database: CowDB;

  constructor(database: CowDB) {
    this.database = database;
  }
}
