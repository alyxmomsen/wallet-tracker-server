export interface IPersonStatusSystem {
    getDate(): number
    getDescription(): string
    getDifference(): number
}

abstract class PersonStatusSystem implements IPersonStatusSystem {
    protected id: number
    protected title: string
    protected date: number

    abstract getDate(): number

    getDifference(): number {
        return Date.now() - this.date
    }

    abstract getDescription(): string

    constructor(title: string, id: number) {
        this.title = title
        this.id = id
        this.date = Date.now()
    }
}

export class GoingSleepStatus extends PersonStatusSystem {
    getDate(): number {
        return this.date
    }

    getDescription(): string {
        return `You fell asleep ${Math.floor(this.getDifference() / 1000)} seconds ago`
    }

    constructor() {
        super('going to sleep', 0)
    }
}

export class AwakeningStatus extends PersonStatusSystem {
    getDate(): number {
        return this.date
    }

    getDescription(): string {
        return `You woke up ${Math.floor(this.getDifference() / 1000)} seconds ago`
    }

    constructor() {
        super('awakening', 1)
        this.date = Date.now()
    }
}

export abstract class PersonStatusFactory {
    protected links: PersonStatusFactory[]
    protected title: string
    abstract instance(): IPersonStatusSystem
    addLinkFactory(linkFactory: PersonStatusFactory) {
        this.links.push(linkFactory)
    }
    getLinks(): PersonStatusFactory[] {
        return this.links
    }
    getTitle(): string {
        return this.title
    }
    constructor(title: string) {
        this.title = title
        this.links = []
    }
}

export class AwakenStatusFactory extends PersonStatusFactory {
    instance(): IPersonStatusSystem {
        return new AwakeningStatus()
    }
    constructor() {
        super('wake up')
    }
}
export class SlepStatusFactory extends PersonStatusFactory {
    instance(): IPersonStatusSystem {
        return new GoingSleepStatus()
    }
    constructor() {
        super('sleep')
    }
}
