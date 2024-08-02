interface ICommands {
    body(interaction: any): any;
    execute(interaction: any): any
    interaction(interaction: any): any
}

interface IDatabase {
    store(data: any): any;
    upsert(data: any): any;
    findAll(data: any): any;
    findById(data: any): any;
    count(data: any): any;
    addServerToMeme(data: any): any;
    random(data: any): any;
}

interface ILogger {
    log(message: string): void;
}

class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}

interface Storage {
    retrieve(data: any): any
    upload(data: any): any
}


class MongoDb implements IDatabase {
    private logger: ILogger;
    constructor(logger: ILogger) {
        this.logger = logger
    }

    store(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    upsert(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    findAll(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    findById(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    count(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    addServerToMeme(data: any): any {
        this.logger.log('[MONGO DB]')
    }
    random(data: any): any {
        this.logger.log('[MONGO DB]')
    }

}
class CreateSoundCommand implements ICommands {
    private database: IDatabase;
    private logger: ILogger;
    constructor(database: IDatabase, logger: ILogger) {
        this.database = database
        this.logger = logger
    }

    body(interaction: any): any {
        this.logger.log('ainda a implementar')
    }
    execute(interaction: any): any {
        this.logger.log('ainda a implementar')
    }
    interaction(interaction: any): any {
        this.logger.log('ainda a implementar')
    }
}

class Discord {
    private commands: ICommands[];
    constructor(commands: ICommands[]) {
        this.commands = commands
    }
}

const logger = new ConsoleLogger()
const mongodb = new MongoDb(logger)
const createSound = new CreateSoundCommand(mongodb, logger)

const discord = new Discord([createSound])

class App {
    commander: Discord;
    constructor(commander: Discord) {
        this.commander = commander
    }

}

new App(discord)