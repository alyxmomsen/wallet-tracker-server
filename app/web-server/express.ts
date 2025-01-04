import { myApplication } from '..'
import { AddRequirementsBodyValidator } from './services/body-check-service'

import { IRequirementStatsType } from '../core/src/types/commonTypes'
import { IPerson, IUserStats } from '../core/src/person/Person'
import { SimpleLogger } from '../utils/SimpleLogger'

const bodyParser = require('body-parser')
const cors = require('cors')
// const express = require('express')

import express, { Express, Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../core/src/ApplicationFacade'

const webServerExpress: Express = express()

const addRequirementsBodyValidatorService = new AddRequirementsBodyValidator()

// Middleware для парсинга JSON
webServerExpress.use(cors())
webServerExpress.use(bodyParser())
webServerExpress.use(express.json())

type TUserStatsOmitPasswordOrdinaryResponse = IOrginaryResponse<Omit<IUserStats, 'password'>>

type TCheckUserAuthResponseData = {
    token: string
}

webServerExpress.post('/update-user', async (req: Request, res: Response) => {
    const token = req.headers['x-auth']
    const body = req.body as Omit<IUserStats, 'password'>

    const log = new SimpleLogger('UPDATE USER MATCHER').createLogger()

    log('matcher started')

    // validate req data and headers

    if (typeof token !== 'string') {
        log('token type ::: FALSE')

        return new Promise((resolve) => {
            res.status(403).json({
                payload: null,
                status: {
                    code: 403,
                    details: 'forbidden , wrong token data type',
                },
            } as IOrginaryResponse<{ foo: 'bar' }>)

            resolve()
        })
    }

    log('token type ::: OK')

    // --------------------------

    log('starting APP::REPLICATEUSER...')

    const response = await myApplication.replicateUser({ ...body, token })

    log('APP::REPLICATEUSER response :')
    console.log(response.payload?.getAllReauirementCommands())

    const updatedUser = response.payload

    if (updatedUser === null) {
        log('APP::REPLICATEUSER response ::: FAIL')

        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or smth else',
                },
            } as TUserStatsOmitPasswordOrdinaryResponse)

            resolve()
        })
    }

    const userStats = await myApplication.getPersonStatsByIdAsync(
        updatedUser.getId()
    )

    if (userStats.userData === null)
        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or i dont know',
                },
            } as TUserStatsOmitPasswordOrdinaryResponse)

            resolve()
        })

    return new Promise((resolve) => {
        res.status(200).json({
            payload: userStats.userData,
            status: {
                code: 200,
                details: 'OK , user is updated',
            },
        } as TUserStatsOmitPasswordOrdinaryResponse)

        resolve()
    })
})

webServerExpress.post(
    '/delete-requirement-protected-ep',
    async (req: Request, res: Response) => {
        const log = new SimpleLogger(
            'delete requirement route',
            false
        ).createLogger()

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

        const responseData: IOrginaryResponse<{ requirementId: string }> = {
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
                } as IOrginaryResponse<null>)
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
                } as IOrginaryResponse<null>)
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
                } as IOrginaryResponse<null>)
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
            } as IOrginaryResponse<TCheckUserAuthResponseData>)
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
                } as IOrginaryResponse<null>)
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
                } as IOrginaryResponse<null>)
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
            } as IOrginaryResponse<{
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
                } as IOrginaryResponse<null>)
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
                } as IOrginaryResponse<null>)
                resolve()
            })
        }

        const responsedUserStatsData = await myApplication.loginUser(
            requesBodyData.userName,
            requesBodyData.password
        )

        const responsePayload = responsedUserStatsData.payload;
        const responseStatus = responsedUserStatsData.status;

        if (responsePayload === null){
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: responseStatus.code,
                        details: responseStatus.details,
                    },
                } as IOrginaryResponse<null>)
                resolve()
            })
        }


        return new Promise((resolve) => {
            res.status(200).json({
                payload: {
                    authToken: responsePayload.authToken,
                    userStats: responsePayload.userStats,
                },
                status: {
                    code: responseStatus.code,
                    details: responseStatus.details,
                },
            } as IOrginaryResponse<{
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
            } as IOrginaryResponse<TAuthUserData>)
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
        } as IOrginaryResponse<TAuthUserData>)
        resolve()
    })
})

webServerExpress.post(
    '/add-user-requirements-protected',
    async (req: Request, res: Response) => {
        const log = new SimpleLogger(
            'ADD USER REQUIREMENT MATCHER'
        ).createLogger()
        log('matcher start...')
        // const addRequirementService: IAddUserRequirementService =
        //     new AddUserRequirementService()

        // addRequirementsBodyValidatorService.execute(req, res)

        const body = req.body

        if (body === undefined) {
            log('body ::: Fail')
            return new Promise((resolve) => {
                res.status(200).json({
                    payload: null,
                    status: {
                        code: 1,
                        details: 'internal error , no body',
                    },
                } as IOrginaryResponse<null>)
                resolve()
            })
        }

        log('body ::: OK')
        // check headers the x-auth

        const xAuth = req.headers['x-auth']

        if (typeof xAuth !== 'string') {
            log('xAuth type ::: Fail')
            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 2,
                        details: 'auth header data error',
                    },
                } as IOrginaryResponse<null>)
                resolve()
            })
        }

        log('xAuth type ::: OK')

        try {
            log('Adding user requirement...')
            const response = await myApplication.addUserRequirement({
                ...body,
                authToken: xAuth,
            })

            if (response.payload === null) {
                log('adding user requiremtn ::: FAIL')
                return new Promise((resolve) => {
                    res.status(response.status.code).json({
                        payload: null,
                        status: {
                            code: response.status.code,
                            details: response.status.details,
                        },
                    } as IOrginaryResponse<null>)
                    resolve()
                })
            }

            const responsedPerson: IPerson = response.payload

            return new Promise((resolve) => {
                res.status(200).json({
                    payload: responsedPerson.getStats(),
                    status: {
                        code: 0,
                        details: 'updated user data',
                    },
                } as IOrginaryResponse<IUserStats>)
                resolve()
            })
        } catch (error) {
            log('adding user requirement ERROR')

            return new Promise((resolve) => {
                res.status(500).json({
                    payload: null,
                    status: {
                        code: 5,
                        details: error,
                    },
                } as IOrginaryResponse<null>)
                resolve()
            })
        }
    }
)

const port: number = 3030

webServerExpress.listen(port, () => {})

// webServerExpress.

export default webServerExpress

function responseDataFactory<T>(
    responseData: T,
    statusCode: number,
    details: string = 'no details'
): IOrginaryResponse<T> {
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
export type IOrginaryResponse<P> = {
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
