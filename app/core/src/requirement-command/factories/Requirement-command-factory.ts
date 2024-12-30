import { IRequirementStatsType } from '../../types/commonTypes'
import {
    DecrementMoneyRequirementCommand,
    IncrementMoneyRequirementCommand,
    IRequirementCommand,
} from '../RequirementCommand'

export interface IRequirementCommandFactory {
    create(
        fields: Omit<IRequirementStatsType, 'userId'>
    ): IRequirementCommand | null
}

export class RequiremenCommandFactory implements IRequirementCommandFactory {
    create(
        fields: Omit<IRequirementStatsType, 'userId'>
    ): IRequirementCommand | null {
        switch (fields.cashFlowDirectionCode) {
            case 0:
                return new IncrementMoneyRequirementCommand(
                    fields.id,
                    fields.value,
                    fields.title,
                    fields.description,
                    fields.dateToExecute,
                    fields.isExecuted
                )
            case 1:
                return new DecrementMoneyRequirementCommand(
                    fields.id,
                    fields.value,
                    fields.title,
                    fields.description,
                    fields.dateToExecute,
                    fields.isExecuted
                )
            default:
                return null
        }
    }

    constructor() {}
}
