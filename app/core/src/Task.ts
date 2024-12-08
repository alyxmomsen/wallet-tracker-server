import { IPerson } from './person/Person'
import { IRequirementCommand } from './RequirementCommand'

export interface ITask<T, S> {
    // apply(subject: S): void
    getRequirement(): IRequirementCommand
    getDateStart(): Date
}

export class RequirementTask implements ITask<IRequirementCommand, IPerson> {
    dateStart: Date
    requirement: IRequirementCommand
    // apply(subject: IPerson) {
    //     subject.addRequirement(this.requirement)
    // }
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
