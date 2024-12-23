import {
    FirebaseConnector,
    IDataBaseConnector,
    TDatabaseResultStatus,
    TWalletData,
} from '../../db/app'
import { IPersonFactory, UserPersonFactory } from './factories/PersonFactory'
import {
    IPerson,
    IUserStats,
    OrdinaryPerson,
    OrdinaryPerson as User,
} from './person/Person'

import { ITask } from './Task'
import { TUserData } from '../../web-server/express'

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
import { IRequirementStatsType } from './types/commonTypes'
import { SimpleLogger } from '../../utils/SimpleLogger'

export interface IApplicationFacade {
    addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'id' | 'isExecuted' | 'deleted'
        >
    ): Promise<any>
    deleteUserRequirement(requirementId: string, token: string): Promise<any>
    addUserIntoThePool(
        username: string,
        password: string,
        userId: string
    ): IPerson | null
    addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus>
    loginUser(
        userName: string,
        password: string
    ): Promise<{
        userStats: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        }
        authToken: string
    } | null>
    getPersonByID(id: string): IPerson | null
    getPersons(): IPerson[]
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
    getUserById(id: string): Promise<IPerson | null>
    getPersonDataByIdAsync(id: string): Promise<{
        userData: TUserData | null
        details: {
            code: number
            description: string
        }
    }>
    getPersonRequirementsAsync(id: string): IRequirementStatsType[]
    getWalletsByUserIdIdAsync(id: string): Promise<TWalletData[]>
    checkUserAuth(id: string): TAuthServiceCheckTokenResponse
    getUserWithAuthToken(token: string): Promise<{
        userStats: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        }
        authToken: string
    } | null>
}

export class ApplicationSingletoneFacade implements IApplicationFacade {
    async loginUser(
        userName: string,
        password: string
    ): Promise<{
        userStats: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        }
        authToken: string
    } | null> {
        const dataBaseResponse = await this.dataBaseConnector.getPersonByFields(
            userName,
            password
        )

        const data = dataBaseResponse.userData

        if (data === null) {
            return null
        }

        const userId = data.id

        const matchedUsersById = this.usersPool.filter((elem) => {
            return elem.getId() === userId
        })

        if (matchedUsersById.length > 1) return null

        if (matchedUsersById.length === 0) return null

        const matchedUser = matchedUsersById[0]

        return {
            authToken: userId,
            userStats: {
                name: matchedUser.getUserName(),
                requirements: matchedUser
                    .getAllReauirementCommands()
                    .map((elem) => {
                        return {
                            cashFlowDirectionCode:
                                elem.getTransactionTypeCode(),
                            dateToExecute: elem.getExecutionDate(),
                            deleted: elem.getDeleted(),
                            description: elem.getDescription(),
                            id: elem.getId(),
                            isExecuted: elem.checkIfExecuted(),
                            title: elem.getTitle(),
                            value: elem.getValue(),
                        } as Omit<IRequirementStatsType, 'userId'>
                    }),
                wallet: matchedUser.getWalletBalance(),
            },
        }
    }

    async getUserWithAuthToken(token: string): Promise<{
        userStats: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        }
        authToken: string
    } | null> {
        // the authenticity of the token

        // if token FAIL
        if (false) {
            return null
        }

        // exptract userId from the token

        const userId = token

        const user = await this.getUserById(userId)

        if (user === null) {
            return null
        }

        const requirements: Omit<IRequirementStatsType, 'userId'>[] = (
            await this.getPersonRequirementsAsync(userId)
        ).map((elem) => {
            return {
                cashFlowDirectionCode: elem.cashFlowDirectionCode,
                dateToExecute: elem.dateToExecute,
                deleted: elem.deleted,
                description: elem.description,
                id: elem.id,
                isExecuted: elem.isExecuted,
                title: elem.title,
                value: elem.value,
            }
        })

        const userData: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        } = {
            name: user.getUserName(),
            wallet: user.getWalletBalance(),
            requirements,
        }

        return { userStats: userData, authToken: token }
    }

    async deleteUserRequirement(
        requirementId: string,
        token: string
    ): Promise<any> {
        const sl = new SimpleLogger('delete user reqs')
        const log = sl.createLogger()

        log(`METHOD deleteUserRequirement STARTED`)
        log(`arguments: ${requirementId} , ${token}`)

        const response = this.checkUserAuth(token)

        if (response.payload === null) {
            log(`token failed`)

            return
        }

        log(`token is successfully`)

        const updatedToken = response.payload.updatedToken

        const filtredPool = this.usersPool.filter((elem) => {
            return elem.getId() === token
        })

        if (filtredPool.length > 1 || filtredPool.length < 0) {
            log('ERROR : multipe users or "VAlue < 0"')

            return
        }

        if (filtredPool.length === 0) {
            log('user not exist in the users pool')

            return
        }

        const user = filtredPool[0]

        log('checking requirements...')
        const requirementsToDelete = user
            .getAllReauirementCommands()
            .filter((elem) => {})

        if (requirementsToDelete.length > 1) {
            log('MULTIPLE requirements by this ID')

            return
        }

        if (requirementsToDelete.length === 0) {
            log('no requirements like this ID')
        }

        log('METHOD deleteUserRequirement END')
    }

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

    getPersonByID(id: string): IPerson | null {
        const users = this.usersPool.filter((user) => {
            return user.getId() === id
        })

        if (users.length > 1) {
            throw new Error(`Internal error: multiple users found for ID ${id}`)
        }

        return users.length ? users[0] : null
    }

    async addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'isExecuted' | 'id' | 'deleted'
        >
    ): Promise<IPerson | null> {
        console.log(`>>> check if user pool contain user by this ID`)

        const user = await this.getUserById(requirementFields.userId)

        if (user === null) {
            console.log(`>>> user is not exist or something wrong`)

            return null
        }

        console.log(`>>> user is exist`)

        // если юзер существует,
        // то нужно добавить реквайермент в дата бейс,
        //  что бы получить requirement ID

        console.log(
            `>>> try to add user-requirement into DB and get requirement Id...`
        )

        const newReqFields = await this.dataBaseConnector.addUserRequirement(
            { ...requirementFields },
            requirementFields.userId
        )

        if (newReqFields === null) {
            console.log(`>>> try to add requirement into data base  is FAILED`)

            return null
        }

        console.log(`>>> requirement added into Data Base , SUCCESSFULLY`)

        const reqquirementfactory = new RequiremenCommandFactory()

        console.log(`>>> trying to make requirement...`)

        const requirement = reqquirementfactory.create({ ...newReqFields })

        if (requirement === null) {
            console.log(`>>> requirement is NOT CREATED !!!`)
            return null
        }

        console.log(`>>> requirement is CREATED`)
        user.addRequirementCommand(requirement)
        console.log(
            `>>> user requirement inserted into the user: `,
            user.getId(),
            requirement.getId()
        )
        console.log(`>>> user object were trying mutating`)

        return user
    }

    checkUserAuth(id: string): TAuthServiceCheckTokenResponse {
        // this

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

    getPersonRequirementsAsync(id: string): IRequirementStatsType[] {
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
            return []
        }

        const requirements: IRequirementStatsType[] = users[0]
            .getAllReauirementCommands()
            .map((requirement) => {
                const dateToExecute = requirement.getExecutionDate()
                const description = requirement.getDescription()
                const isExecuted = requirement.checkIfExecuted()
                const title = requirement.getTitle()
                const cashFlowDirectionCode =
                    requirement.getTransactionTypeCode()
                const value = requirement.getValue()
                const id = requirement.getId()

                return {
                    dateToExecute,
                    description,
                    cashFlowDirectionCode,
                    id,
                    title,
                    value,
                    userId: users[0].getId(),
                    isExecuted,
                    deleted: false,
                }
            })

        return requirements
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
        const users = this.usersPool.filter((user) => user.getId() === id)

        console.log('user filter: ', users)

        if (users.length > 1) {
            return null
        }

        return users.length > 0 ? users[0] : null
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

        const userData:
            | (TUserData & { requirements: IRequirementStatsType[] })
            | null = users.length
            ? {
                  userName: users[0].getUserName(),
                  wallet: users[0].getWalletBalance(),
                  id: users[0].getId(),
                  requirements: [],
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

    private usersPool: IPerson[]
    private static instance: ApplicationSingletoneFacade | null = null
    private dataBaseConnector: IDataBaseConnector
    private authService: IAuthService
    private personFactory: IPersonFactory

    private constructor(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory,
        authService: IAuthService
    ) {
        const log = new SimpleLogger('app constructor', false).createLogger()

        log(`>>> aplication constructor started`, true)

        this.authService = authService
        this.dataBaseConnector = dataBaseConnector
        this.personFactory = personFactory
        this.usersPool = []
        log(
            'connecting to data base started at ' +
                new Date().toLocaleTimeString()
        )

        log(`>>> loading user pool...`)
        this.dataBaseConnector.getAllPersons().then((usersData) => {
            const requirementFactory = new RequiremenCommandFactory()

            log(`>>> users pool loaded`)
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
                                    log(
                                        `>>> getting user "${user.userName}" wallet...`
                                    )
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
                                            log(
                                                `>>> ${user.userName} user wallet is updated`
                                            )
                                            resolve('foo')
                                        })
                                }),
                                new Promise((resolve) => {
                                    log(
                                        `>>> getting ${user.userName} requirements...`
                                    )
                                    dataBaseConnector
                                        .getRequiremntsByUserId(userId)
                                        .then((response) => {
                                            response.forEach(
                                                (requirementFields) => {
                                                    const requirement =
                                                        requirementFactory.create(
                                                            {
                                                                ...requirementFields,
                                                            }
                                                        )

                                                    if (requirement) {
                                                        newUser.addRequirementCommand(
                                                            requirement
                                                        )
                                                    }
                                                }
                                            )
                                            log(
                                                `${user.userName} requirement is updated`
                                            )
                                            resolve('bar')
                                        })
                                }),
                            ]).then((resolves) => {
                                log(`>>> user data downloading is complete`)
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
                })

                log(`>>> users pool is updated`.toUpperCase(), true)
            })

            log('>>> app constructor is finished'.toUpperCase(), true)
        })
    }
}
