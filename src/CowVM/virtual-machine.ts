import { Writable } from "stream";
import vm from "vm";
import { Console } from "console";
import { compileString } from "./virtual-machine/compiler.js";
import type { Entity } from "./models/entity.js";
import { createEntityProxy } from "./virtual-machine/entity-proxy.js";

const DEFAULT_CONTEXT = {
  // Disable asynchronous functions for security reasons
  Promise: undefined,
  AsyncFunction: undefined,
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
  constructor(public world: World) {}

  private connectionStream(queue: ConnectionQueue) {
    return new (class extends Writable {
      constructor(public queue: ConnectionQueue) {
        super();
      }

      _write(
        chunk: any,
        encoding: BufferEncoding,
        callback: (error?: Error | null | undefined) => void,
      ): void {
        queue.add(chunk.toString());
        callback();
      }
    })(queue);
  }

  private actorContext(actor: Entity) {
    const actorProxy = createEntityProxy(this.world, actor);
    return {
      me: actorProxy,
      here: actorProxy.location,
    };
  }

  private consoleContext(actor: Entity) {
    const connection = this.world.connections.get(actor);
    const consoleStream = connection
      ? this.connectionStream(connection.output)
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
    console.debug(`Running`);
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
        parameters: parameters,
      },
      CONTEXT_OPTIONS,
    );
    console.debug(`Running`);
    const result = compiledScript.runInContext(context, runScriptOptions);
    console.debug({ context });

    return result;
  }
}
