import { DocumentData } from 'firebase/firestore'
import {
    DataBaseConnector,
    IDataBaseConnector,
    TDatabaseResultStatus,
} from '../../db/app'
import { IPersonFactory, UserPersonFactory } from './factories/PersonFactory'
import { IPerson, OrdinaryPerson as User } from './person/Person'
import {
    DecrementMoneyRequirementCommand,
    IncrementMoneyRequirementCommand,
    IRequirementCommand,
} from './RequirementCommand'
import { ITask } from './Task'

export interface IApplicationFacade {
    addUserIntoPull(
        username: string,
        password: string,
        userId: string
    ): IPerson | null
    addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    getPersons(): IPerson[]
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
    getPersonByIdAsync(id: string): Promise<DocumentData | null>
}

export class ApplicationSingletoneFacade implements IApplicationFacade {
    private usersPool: IPerson[]
    private static instance: ApplicationSingletoneFacade | null = null
    private dataBaseConnector: IDataBaseConnector
    private personFactory: IPersonFactory

    static Instance(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory
    ) {
        if (ApplicationSingletoneFacade.instance === null) {
            ApplicationSingletoneFacade.instance =
                new ApplicationSingletoneFacade(
                    dataBaseConnector,
                    personFactory
                )
        }

        return ApplicationSingletoneFacade.instance
    }

    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>) {}

    addUserIntoPull(
        username: string,
        password: string,
        userId: string
    ): IPerson | null {
        for (const userOfThePool of this.usersPool) {
            const userNameOfUserOfPool = userOfThePool.getUserName()

            if (userNameOfUserOfPool === username) {
                console.log('username is fail')

                return null
            }

            const userIdOfUserOfPool = userOfThePool.getId()

            if (userIdOfUserOfPool === userId) {
                console.log('user id is fail')

                return null
            }
        }

        this.dataBaseConnector.addPersonAsync(username, password)

        return null
    }

    async addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus> {
        // проверка есть ле в пуле пользователь с такими данными
        for (const userOfPool of this.usersPool) {
            const usernameOfObjectPool = userOfPool.getUserName()
            if (usernameOfObjectPool === username) {
                return {
                    code: false,
                    message: 'user name like the pool',
                    userData: null,
                }
                break
            }
        }

        const newUser = await this.personFactory.createAsync(
            username,
            password,
            this.usersPool,
            this.dataBaseConnector
        )

        if (newUser) {
            this.usersPool.push(newUser)
            console.log({ persons: this.usersPool })
            return {
                code: true,
                message: 'user created succesfully',
                userData: {
                    id: newUser.getId(),
                },
            }
        }

        return {
            code: false,
            message: 'user not created',
            userData: null,
        }
    }

    getPersons() {
        return this.usersPool
    }

    async getPersonByIdAsync(id: string): Promise<DocumentData | null> {
        const docData = await this.dataBaseConnector.getPersonById(id)

        console.log({
            docData,
        })

        return docData
    }

    update() {}

    private constructor(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory
    ) {
        // const toDateString(date:Date);
        console.log('application started at ' + new Date().toLocaleTimeString())
        this.dataBaseConnector = dataBaseConnector
        this.personFactory = personFactory
        this.usersPool = []
        console.log(
            'connecting to data base started at ' +
                new Date().toLocaleTimeString()
        )
        this.dataBaseConnector.getPersons().then((response) => {
            response.forEach((queryDocumentSnapshot) => {
                console.log('')
                const data = queryDocumentSnapshot.data()
                const id = queryDocumentSnapshot.id
                const newUser = new User(data.username, 0, id)
                this.usersPool.push(newUser)
                dataBaseConnector
                    .getRequiremntsByUserId(id)
                    .then((requirements) => {
                        if (requirements.length) {
                            requirements.forEach((requirement) => {
                                const directionCode =
                                    requirement.cashFlowDirectionCode

                                // console.log({directionCode});

                                const {
                                    value,
                                    description,
                                    userId,
                                    dateToExecute,
                                    cashFlowDirectionCode,
                                    title,
                                } = requirement

                                newUser.addRequirementCommand(
                                    cashFlowDirectionCode === 0
                                        ? new DecrementMoneyRequirementCommand(
                                              value,
                                              title,
                                              description,
                                              dateToExecute
                                          )
                                        : new IncrementMoneyRequirementCommand(
                                              value,
                                              title,
                                              description,
                                              dateToExecute
                                          )
                                )

                                console.log(
                                    'added requrement: ' +
                                        newUser.getAllReauirementCommands()
                                )
                            })
                        }
                    })

                console.log('user added: ' + newUser.getUserName())
            })
        })
    }
}
