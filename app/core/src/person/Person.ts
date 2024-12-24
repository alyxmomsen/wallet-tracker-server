import { IRequirementCommandFactory } from '../requirement-command/factories/Requirement-command-factory'
import { IRequirementCommand } from '../requirement-command/RequirementCommand'
import { IRequirementStatsType } from '../types/commonTypes'
import { IWallet, IWallet as number, Wallet } from '../Wallet'
import { GoingSleepStatus, IPersonStatusSystem } from './PersonStatus'

export type TStatus = {
    id: number
    title: string
}

export type TWalletTrackValue = {
    valueAfter: number
    valueBefore: number
    value: number
    executionDate: number
    transactionTypeCode: number
}

export interface IUserStats {
    name: string
    wallet: number
}

export interface IPerson {
    update(): void
    getWalletBalance(): number
    addRequirementCommand(
        requirementCommand: IRequirementCommand
    ): IRequirementCommand | null
    getActualRequirementCommands(): IRequirementCommand[]
    getAllReauirementCommands(): IRequirementCommand[]
    getExecutedRequirementCommands(): IRequirementCommand[]
    decrementWallet(value: number): void
    getUserName(): string
    incrementWallet(value: number): void
    getWalletTrackForActualRequirements(): TWalletTrackValue[]
    getStatusDescription(): string
    setStatus(status: IPersonStatusSystem): boolean
    getId(): string
    replicateWalletBalance(value: number): void
    replicateRequirements(
        requirementsStats: Omit<IRequirementStatsType, 'userId'>[],
        requirementFactory: IRequirementCommandFactory
    ): void
}

export abstract class Person implements IPerson {
    replicateWalletBalance(value: number): void {
        const balance = this.wallet.updateBalance(value)
    }

    replicateRequirements(
        requirementsStats: Omit<IRequirementStatsType, 'userId'>[],
        requirementFactory: IRequirementCommandFactory
    ): void {
        const newRequirementBalancePool: IRequirementCommand[] = []

        for (const requirement of requirementsStats) {
            const newRequirement = requirementFactory.create(requirement)

            if (newRequirement === null) continue

            newRequirementBalancePool.push(newRequirement)
        }

        this.requirementTransactionCommandsPool = newRequirementBalancePool
    }

    getId(): string {
        return this.id
    }

    getStatusDescription(): string {
        return this.status.getDescription()
    }

    setStatus(status: IPersonStatusSystem): boolean {
        this.status = status
        return true
    }

    getWalletTrackForActualRequirements(): TWalletTrackValue[] {
        let balance = this.wallet.getBalance()

        return this.getActualRequirementCommands().map((requirement) => {
            const value = requirement.getValue()
            const valueBefore = balance
            const valueAfter = requirement.executeWithValue(balance)
            balance = valueAfter
            return {
                value,
                valueBefore,
                valueAfter,
                executionDate: requirement.getExecutionDate(),
                transactionTypeCode: requirement.getTransactionTypeCode(),
            }
        })
    }
    getUserName(): string {
        return this.name
    }

    incrementWallet(value: number): void {
        this.wallet.add(value)
    }

    decrementWallet(value: number): void {
        this.wallet.remove(value)
    }

    addRequirementCommand(
        requirementCommand: IRequirementCommand
    ): IRequirementCommand | null {
        this.requirementTransactionCommandsPool.push(requirementCommand)

        return requirementCommand
    }

    getWalletBalance(): number {
        return this.wallet.getBalance()
    }

    update() {}

    getActualRequirementCommands(): IRequirementCommand[] {
        return this.requirementTransactionCommandsPool.filter(
            (requirementCommand) => {
                if (requirementCommand.checkIfExecuted()) {
                    return false
                }

                const currDateObj = getDateUtil(new Date())

                const requirementDateObj = getDateUtil(
                    new Date(requirementCommand.getExecutionDate())
                )

                if (
                    requirementDateObj.year >= currDateObj.year &&
                    requirementDateObj.month >= currDateObj.month &&
                    requirementDateObj.date >= currDateObj.date
                ) {
                    return true
                }

                return false
            }
        )
    }

    getAllReauirementCommands(): IRequirementCommand[] {
        return this.requirementTransactionCommandsPool
    }

    getExecutedRequirementCommands(): IRequirementCommand[] {
        return this.requirementTransactionCommandsPool.filter((elem) => {
            return !elem.checkIfExecuted()
        })
    }

    getUpdateStatus(): number {
        return this.updateStatus
    }

    setUpdateStatus(value: number): void {
        this.updateStatus = value
    }

    constructor(wallet: IWallet, name: string, userId: string) {
        this.wallet = wallet
        this.name = name
        this.requirementTransactionCommandsPool = []
        this.averageSpending = 0
        this.status = new GoingSleepStatus()
        this.id = userId
        this.updateStatus = 0
    }

    private id: string
    protected name: string
    protected wallet: IWallet
    protected requirementTransactionCommandsPool: IRequirementCommand[]

    protected averageSpending: number
    protected status: IPersonStatusSystem
    protected updateStatus: number
}

export class OrdinaryPerson extends Person {
    constructor(name: string, walletInitValue: number, userId: string) {
        super(new Wallet(walletInitValue), name, userId)
    }
}

export function getDateUtil(dateObj: Date): {
    date: number
    year: number
    month: number
} {
    const date = dateObj.getDate()
    const month = dateObj.getMonth()
    const year = dateObj.getFullYear()

    return {
        date,
        month,
        year,
    }
}
