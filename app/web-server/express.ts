import { myApplication } from '..'
import { AddRequirementsBodyValidator } from './services/body-check-service'

import { IRequirementStatsType } from '../core/src/types/commonTypes'
import { IPerson, IUserStats } from '../core/src/person/Person'
import { SimpleLogger } from '../utils/SimpleLogger'

const bodyParser = require('body-parser')
const cors = require('cors')
// const express = require('express')

import express, { Express, Request, Response } from 'express'

const webServerExpress: Express = express()

const addRequirementsBodyValidatorService = new AddRequirementsBodyValidator()

// Middleware для парсинга JSON
webServerExpress.use(cors())
webServerExpress.use(bodyParser())
webServerExpress.use(express.json())

// dev: user id ; prod: jwt
type TAuthRequestHeaders = {
    'x-auth': string
}

type TCheckUserAuthResponseData = {
    token: string
}

webServerExpress.post('/update-user', async (req: Request, res: Response) => {
    const token = req.headers['x-auth']
    const body = req.body as Omit<IUserStats, 'password'>

    console.log('>>> update user :: token: ', { token })
    console.log('>>> update user :: body: ', { body })

    // validate req data and headers

    if (typeof token !== 'string') {
        return new Promise((resolve) => {
            res.status(403).json({
                payload: null,
                status: {
                    code: 403,
                    details: 'forbidden , wrong token data type',
                },
            } as TResponseJSONData<{ foo: 'bar' }>)

            resolve()
        })
    }

    // --------------------------

    const response = await myApplication.replicateUser({ ...body, token })

    const updatedUser = response.payload

    if (updatedUser === null)
        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or smth else',
                },
            } as TResponseJSONData<Omit<IUserStats, 'password'>>)

            resolve()
        })

    const userStats = await myApplication.getPersonStatsByIdAsync(
        updatedUser.getId()
    )

    console.log(
        '>>> express matcher >>> updated user : ',
        updatedUser?.getAllReauirementCommands(),
        userStats
    )

    if (userStats.userData === null)
        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or i dont know',
                },
            } as TResponseJSONData<Omit<IUserStats, 'password'>>)

            resolve()
        })

    return new Promise((resolve) => {
        res.status(200).json({
            payload: userStats.userData,
            status: {
                code: 200,
                details: 'OK , user is updated',
            },
        } as TResponseJSONData<Omit<IUserStats, 'password'>>)

        resolve()
    })
})

webServerExpress.post(
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

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 15))
                resolve()
            })
        }

        if (typeof xAuth === 'undefined') {
            log('xAuth data type FAILED: ' + typeof xAuth)

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 16))
                resolve()
            })
        }

        log('xAuth data SUCCESS')

        /* body check */

        if (req.body === undefined || req.body === null) {
            log('body FAILED')

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 12))
                resolve()
            })
        }

        const bodyData = req.body as
            | { requirementId: string }
            | null
            | undefined

        const requirementId = bodyData?.requirementId

        if (requirementId === undefined) {
            log('no requirement id data')

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 13))
                resolve()
            })
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

        return new Promise((resolve) => {
            res.status(200).json(responseData)
            resolve()
        })
    }
)

webServerExpress.post(
    '/check-user-auth-protected-ep',
    async (req: Request, res: Response) => {
        const headers = req.headers

        const xAuth = headers['x-auth']

        if (typeof xAuth !== 'string') {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'internal error',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        const authServiceResponse = myApplication.checkUserAuth(xAuth)

        const { status, payload } = authServiceResponse

        if (status.code !== 0) {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 2,
                        details: 'invalid token , probably',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        if (payload === null) {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'internal error',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        return new Promise((resolve) => {
            res.status(201).json({
                status: {
                    code: 0,
                    details: 'token updated',
                },
                payload: {
                    token: payload.updatedToken,
                },
            } as TResponseJSONData<TCheckUserAuthResponseData>)
            resolve()
        })
    }
)

// Простой маршрут по умолчанию
webServerExpress.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webServerExpress.post(
    '/get-user-with-token',
    async (req: Request, res: Response) => {
        const headers = req.headers

        const AUTHtOKEN = headers['x-auth']

        if (typeof AUTHtOKEN !== 'string') {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'details bla bla',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        const userDataResponse =
            await myApplication.getUserWithAuthToken(AUTHtOKEN)

        if (userDataResponse === null) {
            return new Promise((resolve) => {
                res.status(401).json({
                    payload: null,
                    status: {
                        code: 401,
                        details: 'Unauthorized',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        return new Promise((resolve) => {
            res.status(200).json({
                payload: userDataResponse,
                status: {
                    code: 0,
                    details: 'user data and auth token',
                },
            } as TResponseJSONData<{
                userStats: IUserStats
                authToken: string
            }>)
            resolve()
        })
    }
)

webServerExpress.post(
    '/get-user-with-username-and-password',
    async (req: Request, res: Response) => {
        const requesBodyData = req.body as
            | { userName: string; password: string }
            | null
            | undefined

        if (typeof requesBodyData !== 'object') {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'no body object or smth wrong',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        if (requesBodyData === null) {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 2,
                        details: 'no body object , body object is null',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        const responsedUserStatsData = await myApplication.loginUser(
            requesBodyData.userName,
            requesBodyData.password
        )

        if (responsedUserStatsData === null)
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 3,
                        details: 'user no logined',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        return new Promise((resolve) => {
            res.status(200).json({
                payload: {
                    authToken: responsedUserStatsData.authToken,
                    userStats: responsedUserStatsData.userStats,
                },
                status: {
                    code: 0,
                    details: 'user data , you please',
                },
            } as TResponseJSONData<{
                userStats: IUserStats
                authToken: string
            }>)
            resolve()
        })
    }
)

webServerExpress.post('/registration', async (req: Request, res: Response) => {
    const { body }: { body: TRequestBodyType | undefined } = req

    if (!body) {
        return new Promise((resolve) => {
            res.status(400).json({
                details: 'no body',
            })
            resolve()
        })
    }

    const { userName, password } = body

    if (userName === undefined || password === undefined) {
        return new Promise((resolve) => {
            res.status(400).json({
                details: 'no username or no password',
            })
            resolve()
        })
    }

    const {
        status,
        message: details,
        userData,
    } = await myApplication.addUserAsync(userName, password)

    if (!status) {
        return new Promise((resolve) => {
            res.status(400).json({
                status: {
                    code: 2,
                    details: 'user alredy exists',
                },
                payload: null,
            } as TResponseJSONData<TAuthUserData>)
            resolve()
        })
    }

    return new Promise((resolve) => {
        res.status(200).json({
            status: {
                code: 0,
                details: 'user registrated successfully',
            },
            payload: {
                userId: userData?.id,
            },
        } as TResponseJSONData<TAuthUserData>)
        resolve()
    })
})

webServerExpress.post(
    '/add-user-requirements-protected',
    async (req: Request, res: Response) => {
        // const addRequirementService: IAddUserRequirementService =
        //     new AddUserRequirementService()

        // addRequirementsBodyValidatorService.execute(req, res)

        const body = req.body

        if (body === undefined) {
            return new Promise((resolve) => {
                res.status(200).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'internal error , no body',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        // check headers the x-auth

        const xAuth = req.headers['x-auth']

        if (typeof xAuth !== 'string') {
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 2,
                        details: 'auth header data error',
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }

        console.log('>>> add user requirement :: ', xAuth, body)

        try {
            const response = await myApplication.addUserRequirement({
                ...body,
                authToken: xAuth,
            })

            if (response.payload === null) {
                return new Promise((resolve) => {
                    res.status(response.status.code).json({
                        payload: null,
                        status: {
                            code: response.status.code,
                            details: response.status.details,
                        },
                    } as TResponseJSONData<null>)
                    resolve()
                })
            }

            const responsedPerson: IPerson = response.payload

            console.log(
                '>>> add user requirement :: responsedPerson :: ',
                responsedPerson
            )

            const requirementsAsStats: Omit<IRequirementStatsType, 'userId'>[] =
                responsedPerson
                    .getAllReauirementCommands()
                    .map((requirement) => {
                        return {
                            cashFlowDirectionCode:
                                requirement.getTransactionTypeCode(),
                            dateToExecute: requirement.getExecutionDate(),
                            description: requirement.getDescription(),
                            executed: requirement.isExecuted(),
                            title: requirement.getTitle(),
                            userId: responsedPerson.getId(),
                            value: requirement.getValue(),
                            id: requirement.getId(),
                            deleted: requirement.getDeleted(),
                            updatedTimeStamp: requirement.getUpdatedTimeStamp(),
                            createdTimeStamp: requirement.getCreatedTimeStamp(),
                        }
                    })

            return new Promise((resolve) => {
                res.status(200).json({
                    payload: {
                        name: responsedPerson.getUserName(),
                        wallet: responsedPerson.getWalletBalance(),
                        requirements: requirementsAsStats,
                    },
                    status: {
                        code: 0,
                        details: 'updated user data',
                    },
                } as TResponseJSONData<IUserStats>)
                resolve()
            })
        } catch (error) {
            console.log({ error })
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 5,
                        details: error,
                    },
                } as TResponseJSONData<null>)
                resolve()
            })
        }
    }
)

const port: number = 3030

webServerExpress.listen(port, () => {
    console.log('web server is running on port: ' + port + '. WELCOME!')
})

// webServerExpress.

export default webServerExpress

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
    name: string
    wallet: number
    createdTimeStamp: number
    updatedTimeStamp: number
    id: string
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
