import { Writable } from "stream";
import vm from "vm";
import { Console } from "console";
import { compileString } from "./virtual-machine/compiler.js";
import type { Entity } from "./models/entity.js";
import { createEntityProxy } from "./virtual-machine/entity-proxy.js";
import { GameEngine } from "@CowVM/game-engine.js";

const DEFAULT_CONTEXT = {
  // Disable asynchronous functions for security reasons
  Promise: undefined,
  AsyncFunction: undefined,
  setTimeout: undefined,
  setInterval: undefined,
  setImmediate: undefined,
  queueMicrotask: undefined,
};

const CONTEXT_OPTIONS: vm.CreateContextOptions = {
  codeGeneration: {
    strings: false,
    wasm: false,
  },
};

const runScriptOptions: vm.RunningScriptOptions = {
  timeout: 100,
};

export class VirtualMachine {
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  private connectionStream(gameEngine: GameEngine, clientUri: string) {
    return new (class extends Writable {
      constructor() {
        super();
      }

      _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null | undefined) => void,
      ): void {
        clientUri && gameEngine.queueOutput(clientUri, chunk.toString());
        callback();
      }
    })();
  }

  private actorContext(actor: Entity) {
    const actorProxy = createEntityProxy(this.gameEngine, actor);
    return {
      me: actorProxy,
      here: actorProxy.location,
    };
  }

  private consoleContext(actor: Entity) {
    const consoleStream = actor.clientUri
      ? this.connectionStream(this.gameEngine, actor.clientUri)
      : process.stdout;
    return { console: new Console({ stdout: consoleStream }) };
  }

  executeScript(actor: Entity, script: string) {
    console.log("Executing script", script);
    const compiledScript = compileString(script);

    console.debug(`Creating VM context`);
    const context = vm.createContext(
      {
        ...DEFAULT_CONTEXT,
        ...this.actorContext(actor),
        ...this.consoleContext(actor),
      },
      CONTEXT_OPTIONS,
    );
    console.debug(`Running script`);
    const result = compiledScript.runInContext(context, runScriptOptions);
    console.debug({ context });

    return result;
  }

  executeCommand(actor: Entity, command: string, parameters: string[] = []) {
    console.log(`Executing command: ${command}`);
    const compiledScript = compileString(command);

    console.debug(`Creating VM context`);
    const context = vm.createContext(
      {
        ...DEFAULT_CONTEXT,
        ...this.actorContext(actor),
        ...this.consoleContext(actor),
        parameters,
      },
      CONTEXT_OPTIONS,
    );
    console.debug(`Running command`);
    const result = compiledScript.runInContext(context, runScriptOptions);
    console.debug({ context });

    return result;
  }
}
