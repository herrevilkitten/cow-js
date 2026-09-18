import vm from "vm";
import type { Attribute } from "@CowVM/models/attribute.js";

const scriptCache: Record<string, vm.Script> = {};

export function compileString(script: string, filename = "immediate") {
  console.debug(`Compiling ${script}`);
  const compiledScript = new vm.Script(script, { filename });
  return compiledScript;
}

export function compileAttribute(attribute: Attribute) {
  const scriptId = `#${attribute.owner.id}.#${attribute.name}`;
  if (typeof attribute.value !== "string") {
    throw new Error(`VM error: attribute ${scriptId} is not a string.`);
  }

  console.debug(`Compiling ${scriptId}`);
  const compiledScript = compileString(attribute.value, scriptId);
  scriptCache[scriptId] = compiledScript;
  return compiledScript;
}
