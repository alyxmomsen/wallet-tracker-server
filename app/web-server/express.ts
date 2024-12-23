import { Request, Response } from 'express'
import { myApplication } from '..'
import { AddRequirementsBodyValidator } from './services/body-check-service'
import {
    AddUserRequirementService,
    IAddUserRequirementService,
} from './services/add-user-requirement-service'
import { IRequirementStatsType } from '../core/src/types/commonTypes'
import { IUserStats } from '../core/src/person/Person'
import { SimpleLogger } from '../utils/SimpleLogger'

const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const webApp = express()
const port = 3030

const addRequirementsBodyValidatorService = new AddRequirementsBodyValidator()

// Middleware для парсинга JSON
webApp.use(cors())
webApp.use(bodyParser())
webApp.use(express.json())

// dev: user id ; prod: jwt
type TAuthRequestHeaders = {
    'x-auth': string
}

type TCheckUserAuthResponseData = {
    token: string
}

webApp.post(
    '/delete-requirement-protected-ep',
    async (req: Request, res: Response) => {
        const log = new SimpleLogger('delete requirement route').createLogger()

        log('Route /delete-requirement-protected-ep')

        // const response = () => responseDataFactory<null>(null , 12))

        /* xAuth check */

        const xAuth = req.headers['x-auth']

        // const xAuthType = typeof xAuth;

        if (typeof xAuth === 'object') {
            log('xAuth data type FAILED: ' + typeof xAuth)

            return res.status(500).json(responseDataFactory<null>(null, 15))
        }

        if (typeof xAuth === 'undefined') {
            log('xAuth data type FAILED: ' + typeof xAuth)

            return res.status(500).json(responseDataFactory<null>(null, 16))
        }

        log('xAuth data SUCCESS')

        /* body check */

        if (req.body === undefined || req.body === null) {
            log('body FAILED')

            return res.status(500).json(responseDataFactory<null>(null, 12))
        }

        const bodyData = req.body as
            | { requirementId: string }
            | null
            | undefined

        const requirementId = bodyData?.requirementId

        if (requirementId === undefined) {
            log('no requirement id data')

            return res.status(500).json(responseDataFactory<null>(null, 13))
        }

        log('BODY data is SUCCESS')

        log('tying to delete user requirement...')

        const response = await myApplication.deleteUserRequirement(
            requirementId,
            xAuth
        )

        const responseData: TResponseJSONData<{ requirementId: string }> = {
            payload: {
                requirementId: 'test string',
            },
            status: {
                code: 0,
                details: 'successfully',
            },
        }

        res.status(200).json(responseData)
    }
)

webApp.post('/check-user-auth-protected-ep', (req: Request, res: Response) => {
    const headers = req.headers

    const xAuth = headers['x-auth']

    if (typeof xAuth !== 'string') {
        return res.status(500).json({
            payload: null,
            status: {
                code: 1,
                details: 'internal error',
            },
        } as TResponseJSONData<null>)
    }

    const authServiceResponse = myApplication.checkUserAuth(xAuth)

    const { status, payload } = authServiceResponse

    if (status.code !== 0) {
        return res.status(500).json({
            payload: null,
            status: {
                code: 2,
                details: 'invalid token , probably',
            },
        } as TResponseJSONData<null>)
    }

    if (payload === null) {
        return res.status(500).json({
            payload: null,
            status: {
                code: 1,
                details: 'internal error',
            },
        } as TResponseJSONData<null>)
    }

    res.status(201).json({
        status: {
            code: 0,
            details: 'token updated',
        },
        payload: {
            token: payload.updatedToken,
        },
    } as TResponseJSONData<TCheckUserAuthResponseData>)
})

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webApp.post('/get-user-with-token', async (req: Request, res: Response) => {
    // console.log('>>> test :: ' , req.body);

    const headers = req.headers

    const AUTHtOKEN = headers['x-auth']

    if (typeof AUTHtOKEN !== 'string') {
        return res.status(500).json({
            payload: null,
            status: {
                code: 1,
                details: 'details bla bla',
            },
        } as TResponseJSONData<null>)
    }

    const userDataResponse = await myApplication.getUserWithAuthToken(AUTHtOKEN)

    if (userDataResponse === null) {
        return res.status(500).json({
            payload: null,
            status: {
                code: 1,
                details: 'details bla bla',
            },
        } as TResponseJSONData<null>)
    }

    return res.status(200).json({
        payload: userDataResponse,
        status: {
            code: 0,
            details: 'user data and auth token',
        },
    } as TResponseJSONData<{
        userStats: IUserStats & {
            requirements: Omit<IRequirementStatsType, 'userId'>[]
        }
        authToken: string
    }>)
})

webApp.post(
    '/get-user-with-username-and-password',
    async (req: Request, res: Response) => {
        const requesBodyData = req.body as
            | { userName: string; password: string }
            | null
            | undefined

        if (typeof requesBodyData !== 'object') {
            return res.status(500).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'no body object or smth wrong',
                },
            } as TResponseJSONData<null>)
        }

        if (requesBodyData === null) {
            return res.status(500).json({
                payload: null,
                status: {
                    code: 2,
                    details: 'no body object , body object is null',
                },
            } as TResponseJSONData<null>)
        }

        const responsedUserStatsData = await myApplication.loginUser(
            requesBodyData.userName,
            requesBodyData.password
        )

        if (responsedUserStatsData === null)
            return res.status(500).json({
                payload: null,
                status: {
                    code: 3,
                    details: 'user no logined',
                },
            } as TResponseJSONData<null>)

        return res.status(200).json({
            payload: {
                authToken: responsedUserStatsData.authToken,
                userStats: responsedUserStatsData.userStats,
            },
            status: {
                code: 0,
                details: 'user data , you please',
            },
        } as TResponseJSONData<{
            userStats: IUserStats & {
                requirements: Omit<IRequirementStatsType, 'userId'>[]
            }
            authToken: string
        }>)
    }
)

webApp.post('/registration', async (req: Request, res: Response) => {
    const { body }: { body: TRequestBodyType | undefined } = req

    if (!body) {
        return res.status(400).json({
            details: 'no body',
        })
    }

    const { userName, password } = body

    if (userName === undefined || password === undefined) {
        return res.status(400).json({
            details: 'no username or no password',
        })
    }

    const {
        status,
        message: details,
        userData,
    } = await myApplication.addUserAsync(userName, password)

    if (!status) {
        return res.status(400).json({
            status: {
                code: 2,
                details: 'user alredy exists',
            },
            payload: null,
        } as TResponseJSONData<TAuthUserData>)
    }

    return res.status(200).json({
        status: {
            code: 0,
            details: 'user registrated successfully',
        },
        payload: {
            userId: userData?.id,
        },
    } as TResponseJSONData<TAuthUserData>)
})

webApp.post(
    '/add-user-requirements-protected',
    async (req: Request, res: Response) => {
        const addRequirementService: IAddUserRequirementService =
            new AddUserRequirementService()

        addRequirementsBodyValidatorService.execute(req, res)

        const body = req.body

        if (body === undefined) {
            return res.status(200).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'internal error , no body',
                },
            } as TResponseJSONData<null>)
        }

        // check headers the x-auth

        const xAuth = req.headers['x-auth']

        if (typeof xAuth !== 'string') {
            return res.status(500).json({
                payload: null,
                status: {
                    code: 2,
                    details: 'auth header data error',
                },
            } as TResponseJSONData<null>)
        }

        try {
            const updatedPerson = await myApplication.addUserRequirement({
                ...body,
                userId: xAuth,
            })

            if (updatedPerson === null) {
                return {
                    payload: null,
                    status: {
                        code: 8973645,
                        details: 'user is not updated',
                    },
                } as TResponseJSONData<null>
            }

            const requirementsAsStats: IRequirementStatsType[] = updatedPerson
                .getAllReauirementCommands()
                .map((requirement) => {
                    return {
                        cashFlowDirectionCode:
                            requirement.getTransactionTypeCode(),
                        dateToExecute: requirement.getExecutionDate(),
                        description: requirement.getDescription(),
                        isExecuted: requirement.checkIfExecuted(),
                        title: requirement.getTitle(),
                        userId: updatedPerson.getId(),
                        value: requirement.getValue(),
                        id: requirement.getId(),
                        deleted: requirement.getDeleted(),
                    }
                })

            return res.status(200).json({
                payload: {
                    name: updatedPerson.getUserName(),
                    wallet: updatedPerson.getWalletBalance(),
                    requirements: requirementsAsStats,
                },
                status: {
                    code: 0,
                    details: 'updated user data',
                },
            } as TResponseJSONData<
                IUserStats & { requirements: IRequirementStatsType[] }
            >)
        } catch (error) {
            console.log({ error })
            return res.status(500).json({
                payload: null,
                status: {
                    code: 5,
                    details: error,
                },
            } as TResponseJSONData<null>)
        }
    }
)

// Запуск сервера
webApp.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`)
})

export default webApp

function responseDataFactory<T>(
    responseData: T,
    statusCode: number,
    details: string = 'no details'
): TResponseJSONData<T> {
    return {
        payload: responseData,
        status: {
            code: statusCode,
            details,
        },
    }
}

type TAuthUserData = {
    userId: string
}

export type TUserData = {
    userName: string
    wallet: number
    id: string
    // requirements: TRequirementStats[]
}

export type TDBUserData = {
    username: string
}

// p - payload
export type TResponseJSONData<P> = {
    status: {
        code: number
        details: string
    }
    payload: P | null
}

//
type TRequestBodyType = {
    userName: string
    password: string
}
