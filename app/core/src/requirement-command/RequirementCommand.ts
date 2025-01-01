import { IPerson } from '../person/Person'
import { IRequirementStatsType } from '../types/commonTypes'

export interface IRequirementCommand {
    execute(person: IPerson): boolean
    getDescription(): string
    getValue(): number
    executeWithValue(value: number): number
    getDateToExecute(): number
    isExecuted(): null | {
        executedTimeStamp: number
    }
    getTransactionTypeCode(): number
    getTitle(): string
    getId(): string
    getDeleted(): boolean
    getUpdatedTimeStamp(): number
    getCreatedTimeStamp(): number
}

abstract class RequirementCommand implements IRequirementCommand {
    protected id: string
    protected title: string
    protected value: number
    protected description: string
    protected dateToExecute: number
    protected executed: null | {
        executedTimeStamp: number
    }
    protected transactionTypeCode: number
    protected deleted: boolean
    protected updatedTimeStamp: number
    protected createdTimeStamp: number

    abstract executeWithValue(value: number): number

    abstract execute(person: IPerson): boolean

    getCreatedTimeStamp(): number {
        return this.createdTimeStamp
    }

    getUpdatedTimeStamp(): number {
        return this.updatedTimeStamp
    }

    getDeleted(): boolean {
        return this.deleted
    }

    getId(): string {
        return this.id
    }

    getTitle(): string {
        return this.title
    }

    getTransactionTypeCode(): number {
        return this.transactionTypeCode
    }

    isExecuted(): null | { executedTimeStamp: number } {
        return this.executed
    }

    getDateToExecute(): number {
        return this.dateToExecute
    }

    getDescription(): string {
        return this.description
    }

    getValue(): number {
        return this.value
    }

    constructor(stats: IRequirementStatsType) {
        this.id = stats.id
        this.value = stats.value
        this.description = stats.description
        ;(this.dateToExecute = stats.dateToExecute),
            (this.executed = stats.executed)
        this.title = stats.title
        this.transactionTypeCode = stats.transactionTypeCode
        this.deleted = false
        this.createdTimeStamp = Date.now()
        this.updatedTimeStamp = Date.now()
    }
}

export class IncrementMoneyRequirementCommand extends RequirementCommand {
    execute(person: IPerson): boolean {
        if (this.executed) {
            return false
        }

        const balanceBefore = person.getWalletBalance()
        person.incrementWallet(this.value)
        this.executed = {
            executedTimeStamp: Date.now(),
        }

        return true
    }

    executeWithValue(value: number): number {
        return value + this.value
    }

    constructor(stats: IRequirementStatsType) {
        super(stats)
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
        if (this.executed) {
            return false
        }

        const balanceBefore = person.getWalletBalance()
        person.decrementWallet(this.value)
        this.executed = {
            executedTimeStamp: Date.now(),
        }

        return true
    }

    constructor(initStats: IRequirementStatsType) {
        super(initStats)
    }
}
