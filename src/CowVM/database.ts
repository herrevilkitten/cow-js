import type { Entity } from "./models/entity.js";

export interface CowDB {
  addEntity(entity: Entity): void;

  removeEntity(entity: Entity): void;

  getEntityByClientUri(clientUri: string): Entity | undefined;

  getEntityById(id: number): Entity | undefined;

  getNextDbRef(): number;
}