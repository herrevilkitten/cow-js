import { GameEngine } from "@CowVM/game-engine.js";
import type { Entity } from "@CowVM/models/entity.js";
import type { Authenticator } from "../../authenticators/authenticator.js";

export class ConsoleProvider {
  private gameEngine: GameEngine;
  private player?: Entity | undefined;
  private authenticator?: Authenticator | undefined;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }
}
