import { PasswordAuthenticator } from "@CowGrid/authenticators/password/password-authenticator.js";
import { MemoryStorage } from "@CowGrid/authenticators/password/storage/memory.js";
import { ConsoleProvider } from "@CowGrid/providers/console/console-provider.js";
import { MemoryDatabase } from "@CowVM/database/memory.js";
import { GameEngine } from "@CowVM/game-engine.js";

console.log(">> Creating database");
const database = new MemoryDatabase();

console.log(">> Creating game engine");
const gameEngine = new GameEngine(database);

console.log(">> Creating password store");
const passwordStore = new MemoryStorage();

console.log(">> Creating password authenticator")
const passwordHashFunction = 
const authenticator = new PasswordAuthenticator(passwordStore)

console.log(">> Creating console provider");
const consoleProvider = new ConsoleProvider(gameEngine);
