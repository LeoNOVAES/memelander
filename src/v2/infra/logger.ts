import { ILogger } from "../types/commands.type";

export class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}