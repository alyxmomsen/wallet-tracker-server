import {
    FirebaseConnector,
    IDataBaseConnector,
    TDatabaseResultStatus,
    TWalletData,
} from '../../db/app'
import { IPersonFactory, UserPersonFactory } from './factories/PersonFactory'
import {
    IPerson,
    OrdinaryPerson,
    OrdinaryPerson as User,
} from './person/Person'

import { ITask } from './Task'
import { IRequirementFields, TUserData } from '../../web-server/express'

import {
    IRequirementCommand,
    TRequirementStats,
} from './requirement-command/RequirementCommand'
import { RequiremenCommandFactory } from './requirement-command/factories/Requirement-command-factory'
import {
    IAuthService,
    TAuthServiceCheckTokenResponse,
} from './auth-service/AuthService'
import { myApplication } from '../..'

export interface IApplicationFacade {
    addUserRequirement({
        cashFlowDirectionCode,
        dateToExecute,
        description,
        isExecuted,
        title,
        userId,
        value,
    }: IRequirementFields): Promise<any>
    addUserIntoThePool(
        username: string,
        password: string,
        userId: string
    ): IPerson | null
    addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    getPersonByID(id:string): IPerson | null;
    getPersons(): IPerson[]
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
    getUserById(id:string): Promise<IPerson | null>
    getPersonDataByIdAsync(id: string): Promise<{
        userData: TUserData | null
        details: {
            code: number
            description: string
        }
    }>
    getPersonRequirementsAsync(id: string): Promise<TRequirementStats[]>
    getWalletsByUserIdIdAsync(id: string): Promise<TWalletData[]>
    checkUserAuth(id: string): TAuthServiceCheckTokenResponse
}

export class ApplicationSingletoneFacade implements IApplicationFacade {
    private usersPool: IPerson[]
    private static instance: ApplicationSingletoneFacade | null = null
    private dataBaseConnector: IDataBaseConnector
    private authService: IAuthService
    private personFactory: IPersonFactory

    static Instance(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory,
        authService: IAuthService
    ) {
        if (ApplicationSingletoneFacade.instance === null) {
            ApplicationSingletoneFacade.instance =
                new ApplicationSingletoneFacade(
                    dataBaseConnector,
                    personFactory,
                    authService
                )
        }

        return ApplicationSingletoneFacade.instance
    }

    getPersonByID(id:string): IPerson | null {
        
        const users = this.usersPool.filter(user => {
            return user.getId() === id;
        });

        if (users.length > 1) {
            throw new Error(`Internal error: multiple users found for ID ${id}`);
        }

        return users.length ? users[0] : null;
    }

    async addUserRequirement({
        cashFlowDirectionCode,
        dateToExecute,
        description,
        isExecuted,
        title,
        userId,
        value,
    }: IRequirementFields): Promise<IPerson> {
        
        const user = await this.getUserById(userId);

        if (user === null) throw new Error('user by id is not exists');

        const factory = new RequiremenCommandFactory();
        const requirement = factory.create(value , title , description , dateToExecute , cashFlowDirectionCode);

        if (requirement === null) throw new Error('problems with requirement creation');

        user.addRequirementCommand(requirement);


        return user;

    }

    checkUserAuth(id: string): TAuthServiceCheckTokenResponse {
        for (const user of this.usersPool) {
            // user.ge
        }

        const response = this.authService.checkToken(id)

        return response
    }

    async getWalletsByUserIdIdAsync(id: string): Promise<TWalletData[]> {
        const wallet = await this.dataBaseConnector.getPersonWalletByUserId(id)

        return wallet
    }

    // getPersonRequirementsAsync(id: string): Promise<TRequirementStats[]> {
    //     return new Promise(() => {});
    // }

    getPersonRequirementsAsync(id: string): Promise<TRequirementStats[]> {
        const users: IPerson[] = []

        for (const user of this.usersPool) {
            const userId = user.getId()

            if (userId === id) {
                users.push(user)
            }
        }

        const usersLength = users.length

        if (usersLength > 1) {
            new Error('users by id length are no one: ' + users.length)
            return new Promise((res, rej) => res([]))
        }

        const requirements: TRequirementStats[] = users[0]
            .getAllReauirementCommands()
            .map((requirement) => {
                const date = requirement.getExecutionDate()
                const description = requirement.getDescription()
                const isExecuted = requirement.checkIfExecuted()
                const title = requirement.getTitle()
                const transactionTypeCode = requirement.getTransactionTypeCode()
                const value = requirement.getValue()

                return {
                    date,
                    description,
                    isExecuted,
                    title,
                    transactionTypeCode,
                    value,
                }
            })

        return new Promise((resolve, reject) => {
            resolve(requirements)
        })
    }

    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>) {}

    addUserIntoThePool(
        username: string,
        password: string,
        userId: string
    ): IPerson | null {
        for (const userOfThePool of this.usersPool) {
            const userNameOfUserOfPool = userOfThePool.getUserName()

            if (userNameOfUserOfPool === username) {

                return null
            }

            const userIdOfUserOfPool = userOfThePool.getId()

            if (userIdOfUserOfPool === userId) {

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
                    status: false,
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

            return {
                status: true,
                message: 'user created succesfully',
                userData: {
                    id: newUser.getId(),
                },
            }
        }

        return {
            status: false,
            message: 'user not created',
            userData: null,
        }
    }

    getPersons() {
        return this.usersPool
    }

    async getUserById(id: string): Promise<IPerson | null> {
        
        const users = this.usersPool.filter(user => user.getId() === id);
        
        if (users.length > 1) {
            throw new Error('Internal error : multiple users by id');
        }

        return users.length > 0 ? users[0] : null;
    }

    async getPersonDataByIdAsync(id: string): Promise<{
        userData: TUserData | null
        details: {
            code: number
            description: string
        }
    }> {
        // const userData = await this.dataBaseConnector.getPersonById(id)

        const users: IPerson[] = this.usersPool.filter((elem) => {
            return elem.getId() === id
        })

        if (users.length > 1) {
            return {
                userData: null,
                details: {
                    code: 1,
                    description: 'internal error: user amount too match',
                },
            }
        }

        const userData: TUserData | null = users.length
            ? {
                  userName: users[0].getUserName(),
                  wallet: users[0].getWalletBalance(),
                  id: users[0].getId(),
              }
            : null

        return {
            userData: userData,
            details: {
                code: 0,
                description: 'OK',
            },
        }
    }

    update() {}

    private constructor(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory,
        authService: IAuthService
    ) {
        console.log('application started at ' + new Date().toLocaleTimeString())
        this.authService = authService
        this.dataBaseConnector = dataBaseConnector
        this.personFactory = personFactory
        this.usersPool = []
        console.log(
            'connecting to data base started at ' +
                new Date().toLocaleTimeString()
        )

        this.dataBaseConnector.getAllPersons().then((usersData) => {
            const requirementFactory = new RequiremenCommandFactory()

            Promise.all(
                usersData.map((user) => {
                    return new Promise<{ description: string; subj: IPerson }>(
                        (globalResolve) => {
                            const userId = user.id
                            const newUser = new OrdinaryPerson(
                                user.userName,
                                0,
                                userId
                            )

                            Promise.all([
                                new Promise((resolve) => {
                                    dataBaseConnector
                                        .getPersonWalletByUserId(userId)
                                        .then((wallets) => {
                                            if (wallets.length) {
                                                const {
                                                    balance,
                                                    description,
                                                    title,
                                                    walletId,
                                                } = wallets[0]

                                                newUser.incrementWallet(balance)
                                            }

                                            resolve('foo')
                                        })
                                }),
                                new Promise((resolve) => {
                                    dataBaseConnector
                                        .getRequiremntsByUserId(userId)
                                        .then((response) => {
                                            response.forEach((elem) => {
                                                const {
                                                    value,
                                                    title,
                                                    description,
                                                    dateToExecute: date,
                                                    cashFlowDirectionCode:
                                                        transactionDirection,
                                                    userId,
                                                } = elem

                                                const requirement =
                                                    requirementFactory.create(
                                                        value,
                                                        title,
                                                        description,
                                                        date,
                                                        transactionDirection
                                                    )

                                                if (requirement) {
                                                    newUser.addRequirementCommand(
                                                        requirement
                                                    )
                                                }
                                            })

                                            resolve('bar')
                                        })
                                }),
                            ]).then((resolves) => {
                                globalResolve({
                                    description: 'global resolver',
                                    subj: newUser,
                                })
                            })
                        }
                    )
                })
            ).then((resolves) => {
            
                resolves.forEach((elem) => {
                    this.usersPool.push(elem.subj)
                    console.log(elem.subj.getId() , elem.subj.getUserName());
                })
            })
        })
    }
}
