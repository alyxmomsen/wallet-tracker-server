import {
    DataBaseConnector,
    IDataBaseConnector,
    TDatabaseResultStatus,
} from '../../db/core'
import { IPersonFactory, UserPersonFactory } from './factories/PersonFactory'
import { IPerson } from './person/Person'
import { IRequirementCommand } from './RequirementCommand'
import { ITask } from './Task'

export interface IApplicationSingletoneFacade {
    addPerson(
        username: string,
        password: string,
        dataBaseCallBack: (status: TDatabaseResultStatus) => void
    ): number
    addPersonAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
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
    private dataBaseConnector: IDataBaseConnector
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

    addPerson(username: string, password: string): number {
        // const newUser = this.personFactory.create(username, password , this.dataBaseConnector)

        // this.dataBaseConnector.addPerson(username, password).then((data) => {
        //     const { details, statusCode, status, userId } = data

        //     if (status) {
        //         this.users.push()
        //         console.log({ persons: this.users })
        //     }

        // dataBaseCallBack({
        //     statusCode,
        //     details,
        //     status,
        //     userId,
        // })
        // })

        return 0
    }

    async addPersonAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        // const data = await this.dataBaseConnector.addPerson(username, password);

        // const { details, statusCode, status, userId } = data;
        console.log('sormorigualga')
        const newUser = await this.personFactory.createAsync(
            username,
            password,
            this.dataBaseConnector
        )

        if (newUser) {
            this.users.push(newUser)
            console.log({ persons: this.users })
            return {
                statusCode: 200,
                details: 'user created succesfully',
                // userId,
            }
        }

        return {
            statusCode: 400,
            details: 'user not created',
        }
    }

    getPersons() {
        return this.users
    }

    update() {}

    private constructor() {
        this.dataBaseConnector = new DataBaseConnector()

        // getAllFireStoreDocs('persons');

        this.dataBaseConnector.getPersons().then((response) => {
            response.forEach((elem) => {
                // elem.id

                const data = elem.data()
                console.log({ data })

                // this.personFactory

                this.personFactory
                    .createAsync(
                        data.username,
                        data.password,
                        this.dataBaseConnector
                    )
                    .then((newPerson) => {
                        console.log('checkavo', newPerson)
                        if (newPerson) {
                            this.users.push(newPerson)
                        }
                    })
                    .catch((e) => {
                        console.log({ e })
                    })
            })
            console.log({ users: this.users })
        })

        this.requirements = []
        this.users = []
        this.personFactory = new UserPersonFactory()
    }
}
