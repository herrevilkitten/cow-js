import { Entity } from "./entity.js";

export type AttributeValueTypes = string | number | boolean;

export class Attribute {
  public readonly name: string;
  public readonly value: AttributeValueTypes;
  public readonly owner: Entity;
  public readonly matchPattern?: RegExp;

  constructor(name: string, value: AttributeValueTypes, owner: Entity) {
    this.name = name;
    this.value = value;
    this.owner = owner;

    if (typeof value === "string" && isCommandAttributeName(name)) {
      this.value = value.trim();
      this.matchPattern = normalizeCommandRegexp(this.value);
    }
  }
}

export function isAttributeValue(value: unknown): value is AttributeValueTypes {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

export const COMMAND_ATTRIBUTE_PREFIX = "$";

export function isCommandAttributeName(name: string): boolean {
  return name.startsWith(COMMAND_ATTRIBUTE_PREFIX);
}

/**
 * Checks if the given attribute is a command attribute (its name starts with "$").
 * @param attribute The attribute to check.
 * @returns True if the attribute is a command attribute, false otherwise.
 */
export function isCommandAttribute(attribute: Attribute): boolean {
  return isCommandAttributeName(attribute.name);
}

function normalizeCommandRegexp(pattern: string) {
  const normalizedPattern = pattern
    .slice(1) // Remove the "$" prefix
    .replace(/\?\*\*/g, "(.+)")
    .replace(/\?\*/g, "(.+?)")
    .replace(/\?\*\*/g, "(.+)")
    .replace(/\?\*/g, "(.+?)")
    .replace(/\?/g, "(.)")
    .replace(/\*\*/g, "(.*)")
    .replace(/\*/g, "(.*?)")
    .replace(/\s+/g, "\\s+")
    .trim();
  return new RegExp(normalizedPattern, "i");
}
