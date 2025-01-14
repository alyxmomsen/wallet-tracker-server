import { IPerson } from './person/Person'
import { IRequirementCommand } from './requirement-command/RequirementCommand'

export interface ITask<T, S> {
    getRequirement(): IRequirementCommand
    getDateStart(): Date
}

export class RequirementTask implements ITask<IRequirementCommand, IPerson> {
    dateStart: Date
    requirement: IRequirementCommand

    getRequirement(): IRequirementCommand {
        return this.requirement
    }
    getDateStart(): Date {
        return this.dateStart
    }
    constructor(dateStart: Date, requirement: IRequirementCommand) {
        this.dateStart = dateStart
        this.requirement = requirement
    }
}
