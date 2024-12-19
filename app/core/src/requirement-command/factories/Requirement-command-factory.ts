import { IRequirementStatsType } from '../../types/commonTypes'
import {
    DecrementMoneyRequirementCommand,
    IncrementMoneyRequirementCommand,
    IRequirementCommand,
} from '../RequirementCommand'

export interface IRequirementCommandFactory {
    create(transactionDirection: number): IRequirementCommand | null
}

export class RequiremenCommandFactory {
    create(fields: IRequirementStatsType): IRequirementCommand | null {
        switch (fields.cashFlowDirectionCode) {
            case 0:
                return new IncrementMoneyRequirementCommand(
                    fields.id,
                    fields.value,
                    fields.title,
                    fields.description,
                    fields.dateToExecute
                )
            case 1:
                return new DecrementMoneyRequirementCommand(
                    fields.id,
                    fields.value,
                    fields.title,
                    fields.description,
                    fields.dateToExecute
                )
            default:
                return null
        }
    }

    constructor() {}
}
