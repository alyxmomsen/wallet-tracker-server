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
    create(fields: IRequirementStatsType): IRequirementCommand | null {
        switch (fields.transactionTypeCode) {
            case 0:
                return new IncrementMoneyRequirementCommand(fields)
            case 1:
                return new DecrementMoneyRequirementCommand(fields)
            default:
                console.log('GOTCHA')
                console.log('>>> filds >>> ::: ', fields)
                return null
        }
    }

    constructor() {}
}
