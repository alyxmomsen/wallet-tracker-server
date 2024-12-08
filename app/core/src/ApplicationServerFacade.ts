import { IPerson } from './person/Person'
import { IRequirementCommand } from './RequirementCommand'
import { ITask } from './Task'

export interface IApplicationSingletoneFacade {
    addPerson(person: IPerson): number
    getPersons(): IPerson[]
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
}

export class ApplicationSingletoneFacade
    implements IApplicationSingletoneFacade
{
    private persons: IPerson[]
    private requirements: IRequirementCommand[]
    private static instance: ApplicationSingletoneFacade | null = null

    static Instance() {
        if (ApplicationSingletoneFacade.instance === null) {
            ApplicationSingletoneFacade.instance =
                new ApplicationSingletoneFacade()
        }

        console.log({ instance: ApplicationSingletoneFacade.instance })
        return ApplicationSingletoneFacade.instance
    }

    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>) {}

    addPerson(person: IPerson): number {
        this.persons.push(person)

        return 0
    }

    getPersons() {
        return this.persons
    }

    update() {}

    /* private  */ constructor() {
        this.requirements = []
        this.persons = []
    }
}
