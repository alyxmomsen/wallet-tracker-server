import {
    DecrementMoneyRequirementCommand,
    IncrementMoneyRequirementCommand,
    IRequirementCommand,
} from '../RequirementCommand'

export interface IRequirementCommandFactory {
    create(transactionDirection: number): IRequirementCommand | null
}

export class RequiremenCommandFactory {
    create(
        value: number,
        title: string,
        description: string,
        date: number,
        transactionDirection: number
    ): IRequirementCommand | null {
        switch (transactionDirection) {
            case 0:
                return new IncrementMoneyRequirementCommand(
                    value,
                    title,
                    description,
                    date
                )
            case 1:
                return new DecrementMoneyRequirementCommand(
                    value,
                    title,
                    description,
                    date
                )
            default:
                return null
        }
    }

    constructor() {}
}
