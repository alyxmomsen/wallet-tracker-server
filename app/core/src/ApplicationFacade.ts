import {
    IDataBaseConnector,
    TDatabaseResultStatus,
    TWalletData,
} from '../../db/app'
import { IPersonFactory } from './factories/PersonFactory'
import { IPerson, IUserStats, OrdinaryPerson } from './person/Person'

import { ITask } from './Task'

import { TResponseJSONData, TUserData } from '../../web-server/express'

import { IRequirementCommand } from './requirement-command/RequirementCommand'
import {
    IRequirementCommandFactory,
    RequiremenCommandFactory,
} from './requirement-command/factories/Requirement-command-factory'
import {
    IAuthService,
    TAuthServiceCheckTokenResponse,
} from './auth-service/AuthService'
import { IRequirementStatsType } from './types/commonTypes'
import { SimpleLogger } from '../../utils/SimpleLogger'
import { IJWTokenService, JWTokenService } from './services/jwt-token-service'
import {
    IReplicationService,
    UserReplicationService,
} from './services/replication-service'
import {
    IUsersPoolStorage,
    UserPoolStoragee,
} from './services/usersPoolStorage'

export interface IApplicationFacade {
    addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'isExecuted' | 'id' | 'deleted' | 'userId'
        > & { authToken: string }
    ): Promise<TResponseJSONData<IPerson | null>>
    deleteUserRequirement(requirementId: string, token: string): Promise<any>
    addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>>
    loginUser(
        userName: string,
        password: string
    ): Promise<{
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null>
    getPersonByID(id: string): IPerson | null
    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>): void
    update(): void
    getUserById(id: string): Promise<IPerson | null>
    getPersonStatsByIdAsync(id: string): Promise<{
        userData: Omit<IUserStats, 'password'> | null
        details: {
            code: number
            description: string
        }
    }>
    getPersonRequirementsAsync(id: string): IRequirementStatsType[]
    getWalletsByUserIdIdAsync(id: string): Promise<TWalletData[]>
    checkUserAuth(id: string): TAuthServiceCheckTokenResponse
    getUserWithAuthToken(token: string): Promise<{
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null>
    replicateUser(
        newUserData: Omit<IUserStats, 'password' | 'id'> & { token: string }
    ): Promise<IPerson | null>
}

export class ApplicationSingletoneFacade implements IApplicationFacade {
    async replicateUser(
        newUserData: Omit<IUserStats, 'password' | 'id'> & { token: string }
    ): Promise<IPerson | null> {
        const log = new SimpleLogger('replicate User').createLogger()

        console.log('>>> replicate user ::: data ::: ', newUserData)

        const jwtVerifyResult = this.jsonWebTokenService.verify(
            newUserData.token
        )

        if (jwtVerifyResult === null) {
            log('token is expired , or any case')

            return null
        }

        log('get user by id...')
        const theUser = this.usersPoolStorage.getUserById(jwtVerifyResult.value)

        if (theUser === null) {
            log('user by id is not exist')

            return null
        } // 204 No Content ;

        log('user is found')

        log('start iteration by requirements stats')

        newUserData.requirements.map((newRequirementStat) => {
            // log('iteration');
            // console.log(newRequirementStat.isExecuted);
            const newRequirementStatId = newRequirementStat.id

            theUser
                .getAllReauirementCommands()
                .forEach((requirement, i, arr) => {
                    if (requirement.getId() === newRequirementStatId) {
                        const requirementFactory =
                            new RequiremenCommandFactory()

                        const updatedRequirement = requirementFactory.create({
                            ...newRequirementStat,
                        })

                        console.log(
                            '>>> updated requirement :::',
                            newRequirementStat,
                            updatedRequirement
                        )

                        if (updatedRequirement === null) return null // 500 Internal Server Error

                        log('set update requirement')
                        console.log(arr === theUser.getAllReauirementCommands())
                        arr[i] = updatedRequirement
                    }
                })
        })

        theUser.setWalletValue(newUserData.wallet)

        log('updated user data :::')
        console.log(theUser.getAllReauirementCommands())
        return theUser
    }

    async loginUser(
        userName: string,
        password: string
    ): Promise<{
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null> {
        const log = new SimpleLogger('login user').createLogger()

        const dataBaseResponse: TDatabaseResultStatus<Pick<IUserStats, 'id'>> =
            await this.dataBaseConnector.getPersonByFields(userName, password)

        console.log('>>> data base response :: ', dataBaseResponse)

        /* -------------------------- */

        const userData = dataBaseResponse.userData

        if (userData === null) {
            return null
        }

        const userId = userData.id

        /* --------------------------- */

        log('matching users...')

        const matchedUser = this.usersPoolStorage.getUserById(userId)

        if (matchedUser === null) {
            return null
        }

        const authToken = this.jsonWebTokenService.sign(matchedUser.getId())

        return {
            authToken: authToken,
            userStats: {
                createdTimeStamp: 0,
                updatedTimeStamp: 0,
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
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null> {
        const log = new SimpleLogger('Get user with authToken').createLogger()

        // the authenticity of the token
        log('start')

        const response = this.jsonWebTokenService.verify(token)

        log('response', { response })

        // console.log();

        // if token FAIL
        if (response === null) {
            return null
        }

        // exptract userId from the token

        const userId = response.value

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
                updatedTimeStamp: elem.updatedTimeStamp,
                createdTimeStamp: elem.createdTimeStamp,
            }
        })

        const userData: Omit<IUserStats, 'id' | 'password'> = {
            name: user.getUserName(),
            wallet: user.getWalletBalance(),
            requirements,
            createdTimeStamp: user.getCreatedTimeStamp(),
            updatedTimeStamp: user.getUpdatedTimeStamp(),
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

        const jwrVerifyResult = this.jsonWebTokenService.verify(token)

        if (jwrVerifyResult === null) {
            log(`token failed`)

            return
        }

        log(`token is successfully`)

        const { value: userId } = jwrVerifyResult

        const userById = this.usersPoolStorage.getUserById(userId)

        if (userById === null) {
            log('user not exist in the users pool')

            return
        }

        log('checking requirements...')
        const requirementsToDelete = userById
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
        const userById = this.usersPoolStorage.getUserById(id)

        return userById
    }

    // code:2 - not found , 1 - unautorized user , 0 - ok
    async addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'isExecuted' | 'id' | 'deleted' | 'userId'
        > & { authToken: string }
    ): Promise<TResponseJSONData<IPerson | null>> {
        console.log(`>>> check if user pool contain user by this ID`)
        const response = this.jsonWebTokenService.verify(
            requirementFields.authToken
        )

        if (response === null) {
            return {
                status: {
                    code: 401,
                    details: 'unautorized',
                },
                payload: null,
            }
        }

        const { value: userId } = response

        const user = await this.getUserById(userId)

        if (user === null) {
            console.log(`>>> user is not exist or something wrong`)

            return {
                payload: null,
                status: {
                    code: 204,
                    details: 'No Content',
                },
            }
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
            userId
        )

        if (newReqFields === null) {
            console.log(`>>> try to add requirement into data base  is FAILED`)

            return {
                status: {
                    code: 500,
                    details: 'Internal Server Error',
                },
                payload: null,
            }
        }

        console.log(`>>> requirement added into Data Base , SUCCESSFULLY`)

        const reqquirementfactory = new RequiremenCommandFactory()

        console.log(`>>> trying to make requirement...`)

        const requirement = reqquirementfactory.create({ ...newReqFields })

        if (requirement === null) {
            console.log(`>>> requirement is NOT CREATED !!!`)
            return {
                status: {
                    code: 500,
                    details: 'Internal Server Error',
                },
                payload: null,
            }
        }

        console.log(`>>> requirement is CREATED`)
        user.addRequirementCommand(requirement)
        console.log(
            `>>> user requirement inserted into the user: `,
            user.getId(),
            requirement.getId()
        )
        console.log(`>>> user object were trying mutating`)

        return {
            status: {
                code: 200,
                details: 'ok',
            },
            payload: user,
        }
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

    getPersonRequirementsAsync(id: string): IRequirementStatsType[] {
        const userById = this.usersPoolStorage.getUserById(id)

        if (userById === null) {
            return []
        }

        const requirements: IRequirementStatsType[] = userById
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
                    userId: userById.getId(),
                    isExecuted,
                    deleted: false,
                    createdTimeStamp: requirement.getCreatedTimeStamp(),
                    updatedTimeStamp: requirement.getUpdatedTimeStamp(),
                }
            })

        return requirements
    }

    addRequirementSchedule(task: ITask<IRequirementCommand, IPerson>) {}

    async addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>> {
        // проверка есть ле в пуле пользователь с такими данными

        const isExist = this.usersPoolStorage.checkByName(username)

        if (isExist) {
            return {
                status: false,
                message: 'user already exists',
                userData: null,
            }
        }

        const newUser = await this.personFactory.createAsync(
            username,
            password,
            this.dataBaseConnector
        )

        if (newUser) {
            this.usersPoolStorage.addUser(newUser.getId(), newUser)

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

    async getUserById(id: string): Promise<IPerson | null> {
        const userById = this.usersPoolStorage.getUserById(id)

        return userById
    }

    async getPersonStatsByIdAsync(id: string): Promise<{
        userData: Omit<IUserStats, 'password'> | null
        details: {
            code: number
            description: string
        }
    }> {
        const userById = this.usersPoolStorage.getUserById(id)

        if (userById === null)
            return {
                userData: null,
                details: {
                    code: 501,
                    description: 'internal error , or something',
                },
            } // 503 internal error

        const userStats: Omit<IUserStats, 'password'> = {
            name: userById.getUserName(),
            wallet: userById.getWalletBalance(),
            id: userById.getId(),
            requirements: userById
                .getAllReauirementCommands()
                .map<Omit<IRequirementStatsType, 'userId'>>((elem) => {
                    return {
                        cashFlowDirectionCode: elem.getTransactionTypeCode(),
                        createdTimeStamp: elem.getCreatedTimeStamp(),
                        dateToExecute: elem.getExecutionDate(),
                        description: elem.getDescription(),
                        id: elem.getId(),
                        isExecuted: elem.checkIfExecuted(),
                        title: elem.getTitle(),
                        updatedTimeStamp: elem.getUpdatedTimeStamp(),
                        value: elem.getValue(),
                        deleted: elem.getDeleted(),
                    } as Omit<IRequirementStatsType, 'userId'>
                }),
            createdTimeStamp: userById.getCreatedTimeStamp(),
            updatedTimeStamp: userById.getUpdatedTimeStamp(),
        }

        return {
            userData: userStats,
            details: {
                code: 0,
                description: 'OK',
            },
        }
    }

    update() {}

    // private usersPool: IPerson[]
    private static instance: ApplicationSingletoneFacade | null = null
    private dataBaseConnector: IDataBaseConnector
    private authService: IAuthService
    private personFactory: IPersonFactory
    private jsonWebTokenService: IJWTokenService
    private replicationService: IReplicationService
    private usersPoolStorage: IUsersPoolStorage
    // private webServer:Express ;

    private constructor(
        dataBaseConnector: IDataBaseConnector,
        personFactory: IPersonFactory,
        authService: IAuthService
    ) {
        // this.webServer = webServerExpress;

        this.usersPoolStorage = new UserPoolStoragee()

        const log = new SimpleLogger('app constructor', false).createLogger()

        log(`aplication constructor started`, null, true)

        this.replicationService = new UserReplicationService()
        this.jsonWebTokenService = new JWTokenService()

        this.authService = authService
        this.dataBaseConnector = dataBaseConnector
        this.personFactory = personFactory
        // this.usersPool = []
        log(
            'connecting to data base started at ' +
                new Date().toLocaleTimeString()
        )

        log(`>>> loading user pool...`)
        this.dataBaseConnector.getAllPersons().then((usersData) => {
            const requirementFactory: IRequirementCommandFactory =
                new RequiremenCommandFactory()

            log(`>>> users pool loaded`)
            Promise.all(
                usersData.map((user) => {
                    return new Promise<{ description: string; subj: IPerson }>(
                        (globalResolve) => {
                            const userId = user.id
                            const newUser = new OrdinaryPerson(
                                user.name,
                                0,
                                userId,
                                user.updatedTimeStamp,
                                user.createdTimeStamp
                            )

                            Promise.all([
                                new Promise((resolve) => {
                                    log(
                                        `>>> getting user "${user.name}" wallet...`
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
                                                `>>> ${user.name} user wallet is updated`
                                            )
                                            resolve('foo')
                                        })
                                }),
                                new Promise((resolve) => {
                                    log(
                                        `>>> getting ${user.name} requirements...`
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
                                                `${user.name} requirement is updated`
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
                    this.usersPoolStorage.addUser(elem.subj.getId(), elem.subj)

                    // this.usersPool.push(elem.subj)
                })

                const log = new SimpleLogger(
                    'users pool storage'
                ).createLogger()

                resolves.forEach((item) => {
                    // const result = this.usersPoolStorage.addUser(item.subj.getId(), item.subj);

                    log(
                        'user added into users pool storage. user name is : ' +
                            item.subj.getUserName()
                    )
                })

                log(`users pool is updated`.toUpperCase(), null, true)
            })

            log('app constructor is finished'.toUpperCase(), null, true)
        })

        // this.webServer.

        // this.webServer.use(cors());
        // this.webServer.use(bodyParser());
        // this.webServer.use(express.json());

        // const port = 3030
        // this.webServer.listen(port, () => {
        //     console.log(`Сервер запущен на http://localhost:${port}`)
        // })
    }
}
