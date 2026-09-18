import { isAttributeValue } from "@CowVM/models/attribute.js";
import type { Entity } from "@CowVM/models/entity.js";
import { GameEngine } from "@CowVM/game-engine.js";

function getAllGameProperties(
  gameEngine: GameEngine,
  thing: Entity,
  target: Entity,
) {
  console.log(`${target}: getAllGameProperties`);
  const invalidKeys = ["attributes", "client"];
  const t = gameEngine.database.getEntityById(thing.id);
  if (!t) {
    throw new Error(`Object #${target.id} does not exist.`);
  }
  console.log("0", Object.keys(t));
  console.log(t);
  const keys = Object.keys(t)
    //    .filter((key) => typeof (t as any)[key] !== "object")
    .filter((key) => !invalidKeys.includes(key));
  keys.push(...t.attributes.keys());
  return new Set<string>(keys);
}

interface EntityBuiltInFunctions {
  send: (text: string) => void;
  emit: (text: string) => void;
}

export function createEntityProxy(
  gameEngine: GameEngine,
  thing: Entity,
): Entity & EntityBuiltInFunctions {
  return new Proxy(thing, {
    get: function (target, prop, receiver) {
      console.log("get", target, prop, receiver);
      const t = gameEngine.database.getEntityById(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (typeof prop !== "string") {
        return undefined;
      }

      // Built in functions that are not attributes or properties of the entity
      switch (prop) {
        case "location":
          if (!t.location) {
            return undefined;
          }
          return createEntityProxy(gameEngine, t.location);
        case "contents":
          return [...t.contents].map((content) =>
            createEntityProxy(gameEngine, content),
          );
        case "send":
          return (text: string) => {
            const connection = gameEngine.connections.get(t);
            if (connection) {
              connection.output.add(text);
            }
          };
        case "emit":
          return (text: string) => {
            for (const target of t.location?.contents ?? []) {
              const proxy = createEntityProxy(gameEngine, target);
              proxy.send(text);
            }
          };
      }
      let value: any;
      if (prop in t) {
        if (typeof (t as any)[prop] === "object") {
          console.warn("Accessing object property", prop, "on entity", t.id);
          return undefined;
        }

        value = (t as any)[prop];
      }
      if (value === undefined) {
        value = t.attributes.get(prop);
        if (value) {
          value = value.value;
        }
      }
      /*
      if (isDbRef(value)) {
        const refenencedEntity = world.database.getEntityById(value);
        if (!refenencedEntity) {
          return undefined;
        }
        value = createEntityProxy(world, refenencedEntity);
      }
        */
      console.log({ prop, value });
      return value;
    },
    set: function (target, prop, value, receiver) {
      console.log("set", target, prop, value, receiver);
      const t = gameEngine.database.getEntityById(target.id);
      if (!t) {
        throw new Error(`Object #${target.id} does not exist.`);
      }
      if (prop in t) {
        return false;
      }
      if (typeof prop !== "string") {
        return false;
      }

      if (!isAttributeValue(value)) {
        console.error(`Cannot assign ${value} to ${target}.${prop}`);
        return false;
      }
      t.setAttribute(prop, value);
      return true;
    },
    ownKeys: function (target: Entity) {
      return [...getAllGameProperties(gameEngine, thing, target)];
    },
    getOwnPropertyDescriptor(
      target: Entity,
      property: string,
    ): PropertyDescriptor | undefined {
      const properties = getAllGameProperties(gameEngine, thing, target);
      if (!properties.has(property)) {
        return undefined;
      }
      const descriptor: PropertyDescriptor = {
        enumerable: true,
        configurable: true,
      };
      return descriptor;
    },
  }) as Entity & EntityBuiltInFunctions;
}
