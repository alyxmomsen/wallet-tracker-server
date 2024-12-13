import { IPerson } from './person/Person'

export interface IRequirementCommand {
    execute(person: IPerson): boolean
    getDescription(): string
    getValue(): number
    executeWithValue(value: number): number
    getExecutionDate(): number
    checkIfExecuted(): boolean
    getTransactionTypeCode(): number
    getTitle(): string
}

export type TRequirementStats = {
    title: string
    value: number
    description: string
    date: number
    isExecuted: boolean
    transactionTypeCode: number
}

abstract class RequirementCommand implements IRequirementCommand {
    protected title: string
    protected value: number
    protected description: string
    protected date: number
    protected isExecuted: boolean
    protected transactionTypeCode: number

    abstract executeWithValue(value: number): number

    abstract execute(person: IPerson): boolean

    getTitle(): string {
        return this.title
    }

    getTransactionTypeCode(): number {
        return this.transactionTypeCode
    }

    checkIfExecuted(): boolean {
        return this.isExecuted
    }

    getExecutionDate(): number {
        return this.date
    }

    getDescription(): string {
        return this.description
    }

    getValue(): number {
        return this.value
    }

    constructor(
        value: number,
        title: string,
        description: string,
        date: number,
        transactionTypeCode: number
    ) {
        this.value = value
        this.description = description
        this.date = date
        this.isExecuted = false
        this.title = title
        this.transactionTypeCode = transactionTypeCode
    }
}

export class IncrementMoneyRequirementCommand extends RequirementCommand {
    execute(person: IPerson): boolean {
        if (this.isExecuted) {
            return false
        }

        const balanceBefore = person.getWalletBalance()
        person.incrementWallet(this.value)
        this.isExecuted = true

        return true
    }

    executeWithValue(value: number): number {
        return value + this.value
    }

    constructor(
        value: number,
        title: string,
        description: string,
        date: number
    ) {
        super(value, title, description, date, 1)
    }
}

export class DecrementMoneyRequirementCommand extends RequirementCommand {
    executeWithValue(value: number): number {
        return value - this.value
    }

    getValue(): number {
        return this.value
    }

    getDescription(): string {
        return `pay ${this.value}`
    }

    execute(person: IPerson): boolean {
        if (this.isExecuted) {
            return false
        }

        const balanceBefore = person.getWalletBalance()
        person.decrementWallet(this.value)
        this.isExecuted = true

        return true
    }

    constructor(
        value: number,
        title: string,
        description: string,
        date: number
    ) {
        super(value, title, description, date, 0)
    }
}
