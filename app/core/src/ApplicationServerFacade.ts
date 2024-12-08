import {
    DataBaseMediator,
    IDataBaseMediator,
    TDatabaseResultStatus,
} from '../../db/core'
import {
    IPersonFactory,
    PersonFactory,
    UserPersonFactory,
} from './factories/PersonFactory'
import { IPerson } from './person/Person'
import { IRequirementCommand } from './RequirementCommand'
import { ITask } from './Task'

export interface IApplicationSingletoneFacade {
    addPerson(
        username: string,
        password: string,
        dataBaseCallBack: (status: TDatabaseResultStatus) => void
    ): number
    getPersons(): IPerson[]
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
}

export class ApplicationSingletoneFacade
    implements IApplicationSingletoneFacade
{
    private users: IPerson[]
    private requirements: IRequirementCommand[]
    private static instance: ApplicationSingletoneFacade | null = null
    private dataBaseMediator: IDataBaseMediator<Promise<TDatabaseResultStatus>>
    private personFactory: IPersonFactory

    static Instance() {
        if (ApplicationSingletoneFacade.instance === null) {
            ApplicationSingletoneFacade.instance =
                new ApplicationSingletoneFacade()
        }

        console.log({ instance: ApplicationSingletoneFacade.instance })
        return ApplicationSingletoneFacade.instance
    }

    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>) {}

    addPerson(
        username: string,
        password: string,
        dataBaseCallBack: (databaseResulStatus: TDatabaseResultStatus) => void
    ): number {
        this.dataBaseMediator.addPerson(username, password).then((data) => {
            const { details, statusCode, status, userId } = data

            if (status) {
                this.users.push(this.personFactory.create(username, userId))
            }

            dataBaseCallBack({
                statusCode,
                details,
                status,
                userId,
            })
        })

        return 0
    }

    getPersons() {
        return this.users
    }

    update() {}

    /* private  */ constructor() {
        this.dataBaseMediator = new DataBaseMediator()
        this.requirements = []
        this.users = []
        this.personFactory = new UserPersonFactory()
    }
}
