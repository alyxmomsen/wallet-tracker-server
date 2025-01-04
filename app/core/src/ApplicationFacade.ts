import {
    IDataBaseConnector,
} from '../../db/app'
import { IPersonFactory } from './factories/PersonFactory'
import { IPerson, OrdinaryPerson } from './person/Person'

import {
    IRequirementCommandFactory,
    RequiremenCommandFactory,
} from './requirement-command/factories/Requirement-command-factory'
import {
    IAuthService,

} from './services/auth-service/AuthService'
import { INewUserStats, IOrdinaryResponse, IRequirementStatsType, IUserStats, TAuthServiceCheckTokenResponse, TDatabaseResultStatus, TWalletData } from './types/commonTypes'
import { SimpleLogger } from '../../utils/SimpleLogger'
import { IJWTokenService, JWTokenService } from './services/jwt-token-service'
import {
    IReplicationService,
    UserReplicationService,
} from './services/replication-service'
import {
    IUsersPoolStorage,
    UserPoolStoragee as UserPoolStorage,
} from './services/usersPoolStorage'
import { WebServerDriver } from '../../web-server/app'



export interface IApplicationFacade {
    addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'id' | 'deleted' | 'userId' | 'executed'
        > & { authToken: string }
    ): Promise<IOrdinaryResponse<IPerson | null>>
    deleteUserRequirement(requirementId: string, token: string): Promise<any>
    addUserAsync(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>>
    loginUser(
        userName: string,
        password: string
    ): Promise<
        IOrdinaryResponse<{
            userStats: Omit<IUserStats, 'id' | 'password'>
            authToken: string
        }>
    >
    getPersonByID(id: string): IPerson | null
    getUserById(id: string): Promise<IPerson | null>
    getPersonStatsByIdAsync(id: string): Promise<{
        userData: Omit<IUserStats, 'password'> | null
        details: {
            code: number
            description: string
        }
    }>
    // getPersonRequirementsAsync(id: string): IRequirementStatsType[]
    getWalletsByUserIdAsync(id: string): Promise<TWalletData[]>
    checkUserAuth(id: string): TAuthServiceCheckTokenResponse
    getUserWithAuthToken(token: string): Promise<{
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null>
    replicateUser(
        newUserStats: INewUserStats
    ): Promise<IOrdinaryResponse<IPerson>>
}

export class ApplicationSingletoneFacade implements IApplicationFacade {
    async replicateUser(
        newUserStats: INewUserStats
    ): Promise<IOrdinaryResponse<IPerson>> {
        const log = new SimpleLogger('replicate User', false).createLogger()

        console.log('>>> app::replicateuser : params:', newUserStats)

        const jwtVerifyResult = this.jsonWebTokenService.verify(
            newUserStats.token
        )

        if (jwtVerifyResult === null) {
            log('token is expired , or any case')

            return {
                payload: null,
                status: {
                    code: 402,
                    details: 'token is expired',
                },
            }
        }

        log('get user by id...')
        const theUser = this.usersPoolStorage.getUserById(jwtVerifyResult.value)

        if (theUser === null) {
            log('user by id is not exist')

            return {
                payload: null,
                status: {
                    code: 204,
                    details: 'No Content',
                },
            }
        }

        log('user is found')
        log('start iteration by requirements stats')

        newUserStats.requirements.map((newRequirementStats) => {
            // log('iteration');

            const newRequirementStatsId = newRequirementStats.id

            theUser
                .getAllReauirementCommands()
                .forEach((requirement, i, arr) => {
                    if (requirement.getId() === newRequirementStatsId) {
                        const requirementFactory =
                            new RequiremenCommandFactory()

                        const updatedRequirement = requirementFactory.create({
                            ...newRequirementStats,
                            userId: theUser.getId(),
                        })

                        console.log(
                            '>>> updated requirement :::',
                            newRequirementStats,
                            updatedRequirement
                        )

                        if (updatedRequirement === null) return null // 500 Internal Server Error

                        log('set update requirement')

                        arr[i] = updatedRequirement
                    }
                })
        })

        theUser.setWalletValue(newUserStats.wallet)

        log('updated user data :::')

        return {
            payload: theUser,
            status: {
                code: 200,
                details: 'OK',
            },
        }
    }

    async loginUser(
        userName: string,
        password: string
    ): Promise<
        IOrdinaryResponse<{
            userStats: Omit<IUserStats, 'id' | 'password'>
            authToken: string
        }>
    > {
        const log = new SimpleLogger('login user', false).createLogger()

        const dataBaseResponse: TDatabaseResultStatus<Pick<IUserStats, 'id'>> =
            await this.dataBaseConnector.getPersonByFields(userName, password)

        /* -------------------------- */

        const userData = dataBaseResponse.userData

        if (userData === null) {
            return {
                payload: null,
                status: {
                    code: 402,
                    details: 'details details',
                },
            }
        }

        const userId = userData.id

        /* --------------------------- */

        log('matching users...')

        const matchedUser = this.usersPoolStorage.getUserById(userId)

        if (matchedUser === null) {
            return {
                payload: null,
                status: {
                    code: 402,
                    details: 'no user',
                },
            }
        }

        const authToken = this.jsonWebTokenService.sign(
            matchedUser.getId(),
            '1h'
        )

        return {
            payload: {
                authToken: authToken,
                userStats: {
                    createdTimeStamp: 0,
                    updatedTimeStamp: 0,
                    name: matchedUser.getUserName(),
                    requirements: matchedUser.getStats().requirements,
                    wallet: matchedUser.getWalletBalance(),
                },
            },
            status: {
                code: 200,
                details: 'OK , user userOK',
            },
        }
    }

    async getUserWithAuthToken(token: string): Promise<{
        userStats: Omit<IUserStats, 'id' | 'password'>
        authToken: string
    } | null> {
        const log = new SimpleLogger(
            'Get user with authToken',
            false
        ).createLogger()

        // the authenticity of the token
        log('start')

        const response = this.jsonWebTokenService.verify(token)

        log('response', { response })

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

        const userStats: Omit<IUserStats, 'id' | 'password'> = user.getStats()

        return { userStats, authToken: token }
    }

    async deleteUserRequirement(
        requirementId: string,
        token: string
    ): Promise<any> {
        const log = new SimpleLogger(
            'APP::DELETE USER REQUIREMENTS',
            false
        ).createLogger()
        log('method started')

        /* any code */

        log('method is finished')
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

    async addUserRequirement(
        requirementFields: Omit<
            IRequirementStatsType,
            'id' | 'deleted' | 'userId' | 'executed'
        > & { authToken: string }
    ): Promise<IOrdinaryResponse<IPerson | null>> {
        const log = new SimpleLogger('APP::ADD USER REQUIREMENT').createLogger()

        log('starting ...')

        console.log(
            '>>> APP::ADD USER REQUIREMENT >>> incoming stats : ',
            requirementFields
        )

        const response = this.jsonWebTokenService.verify(
            requirementFields.authToken
        )

        if (response === null) {
            log('JWT TOKEN FAIL')
            return {
                status: {
                    code: 401,
                    details: 'unautorized',
                },
                payload: null,
            }
        }

        log('jwt token SUCCESS')

        const { value: userId } = response

        const user = await this.getUserById(userId)

        if (user === null) {
            log('user by id is FAIL')

            return {
                payload: null,
                status: {
                    code: 204,
                    details: 'No Content',
                },
            }
        }

        log('user by id is SUCCESS')

        // если юзер существует,
        // то нужно добавить реквайермент в дата бейс,
        //  что бы получить requirement ID

        const newReqFields = await this.dataBaseConnector.addUserRequirement({
            ...requirementFields,
            userId,
        })

        if (newReqFields === null) {
            log('databaseConnector::add user requirement ::: FAIL')

            return {
                status: {
                    code: 500,
                    details: 'Internal Server Error',
                },
                payload: null,
            }
        }

        log('databaseConnector::add user requirement ::: SUCCESS')

        const reqquirementfactory = new RequiremenCommandFactory()

        const requirement = reqquirementfactory.create({ ...newReqFields })

        console.log('>>> new requirement stats :::: ', newReqFields)

        if (requirement === null) {
            log('Requirement factory ::: FAIL')

            return {
                status: {
                    code: 500,
                    details: 'Internal Server Error',
                },
                payload: null,
            }
        }

        log('Requirement factory ::: SUCCESS')

        user.addRequirementCommand(requirement)

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

    async getWalletsByUserIdAsync(id: string): Promise<TWalletData[]> {
        const wallet = await this.dataBaseConnector.getPersonWalletByUserId(id)

        return wallet
    }

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
                        transactionTypeCode: elem.getTransactionTypeCode(),
                        createdTimeStamp: elem.getCreatedTimeStamp(),
                        dateToExecute: elem.getDateToExecute(),
                        description: elem.getDescription(),
                        id: elem.getId(),
                        executed: elem.isExecuted(),
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

        this.usersPoolStorage = new UserPoolStorage()

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
        this.dataBaseConnector
            .getAllPersonsOnly()
            .then((usersData) => {
                const requirementFactory: IRequirementCommandFactory =
                    new RequiremenCommandFactory()

                log(`>>> users pool loaded`)
                Promise.all(
                    usersData.map((user) => {
                        return new Promise<{
                            description: string
                            subj: IPerson
                        }>((globalResolve) => {
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
                                                    } else {
                                                        console.log(
                                                            '>>> APP::CONSTRUCTOR >>> requirement creating is FAIL'
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
                        })
                    })
                )
                    .then((resolves) => {
                        resolves.forEach((elem) => {
                            this.usersPoolStorage.addUser(
                                elem.subj.getId(),
                                elem.subj
                            )

                            // this.usersPool.push(elem.subj)
                        })

                        const log = new SimpleLogger(
                            'users pool storage',
                            false
                        ).createLogger()

                        resolves.forEach((item) => {
                            // const result = this.usersPoolStorage.addUser(item.subj.getId(), item.subj);

                            log(
                                'user added into users pool storage. user name is : ' +
                                    item.subj.getUserName()
                            )
                        })

                        log(`users pool is updated`.toUpperCase(), null, true)
                        const date = new Date()
                        console.log(
                            `users pool updated time: ${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`
                        )
                    })
                    .finally(() => {
                        const webServerDriver = new WebServerDriver(this)
                        const date = new Date()
                        console.log(
                            'http server getting started...' +
                                `${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`
                        )
                        webServerDriver.start()
                    })

                log('app constructor is finished'.toUpperCase(), null, true)
            })
            .finally(() => {
                console.log('foo')
            })
    }
}
