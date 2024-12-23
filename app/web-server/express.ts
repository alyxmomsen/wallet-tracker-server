import { Request, Response } from 'express'
import { authService, myApplication } from '..'
import { TWalletData } from '../db/app'
import { TRequirementStats } from '../core/src/requirement-command/RequirementCommand'
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

webApp.post('/get-user-wallet-protected', (req: Request, res: Response) => {
    const xauth = req.headers['x-auth']

    if (typeof xauth === 'object') {
        res.status(500).json({
            payload: null,
            status: {
                code: 0,
                details: 'check internal error',
            },
        } as TResponseJSONData<null>)
    }

    if (typeof xauth === 'string') {
        myApplication
            .getWalletsByUserIdIdAsync(xauth)
            .then((data) => {
                return res.status(200).json({
                    payload: data,
                    status: {
                        code: 0,
                        details: 'check',
                    },
                } as TResponseJSONData<TWalletData[]>)
            })
            .catch((e) => {
                console.error({
                    errorDetais: e,
                    description: 'somthing wrong',
                })
                return res.status(500).json({
                    payload: null,
                    status: {
                        code: 0,
                        details: 'check internal error',
                    },
                } as TResponseJSONData<null>)
            })
            .finally()
    } else {
        res.status(500).json({
            payload: null,
            status: {
                code: 0,
                details: 'check internal error',
            },
        } as TResponseJSONData<null>)
    }
})

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webApp.post('/auth', async (req: Request, res: Response) => {
    const { body }: { body: TRequestBodyType | undefined } = req

    if (!body) {
        return res.status(400).json({
            status: {
                code: 1,
                details: 'no body object',
            },
            payload: null,
        } as {
            payload: {
                userId: string
            } | null
            status: {
                code: number
                details: string
            }
        })
    }

    const { userName: username, password } = body

    if (username === undefined || password === undefined) {
        return res.status(400).json({
            payload: null,
            status: {
                code: 2,
                details: 'no username or no password',
            },
        } as {
            payload: {
                userId: string
            } | null
            status: {
                code: number
                details: string
            }
        })
    }

    /* ============= */

    const { userData } = await authService.authUser(username, password)

    if (!userData) {
        return res.status(400).json({
            payload: null,
            status: {
                code: 3,
                details: 'user is not exists',
            },
        } as {
            payload: {
                userId: string
            } | null
            status: {
                code: number
                details: string
            }
        })
    }

    const data = await myApplication.getPersonDataByIdAsync(userData.id)

    if (!data) {
        return res.status(400).json({
            payload: null,
            status: {
                code: 4,
                details: 'user is not exists',
            },
        } as {
            payload: {
                userId: string
            } | null
            status: {
                code: number
                details: string
            }
        })
    }

    // const { username: name } = data as TDataBaseUser

    const responseData: TResponseJSONData<TAuthUserData> = {
        payload: {
            userId: userData.id,
        },
        status: {
            code: 0,
            details: 'user authorized successfuly',
        },
    }

    res.status(200).json(responseData)
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

webApp.post('/get-user-protected', async (req: Request, res: Response) => {
    const xAuth = req.headers['x-auth']

    if (typeof xAuth !== 'string') {
        const responseData: TResponseJSONData<TUserData> = {
            status: {
                code: 1,
                details: 'no token',
            },
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const userDataResponse = await myApplication.getPersonDataByIdAsync(xAuth)

    //

    const responseStatusCode = userDataResponse.details.code

    if (responseStatusCode !== 0) {
        const responseData: TResponseJSONData<TUserData> = {
            status: {
                code: responseStatusCode,
                details: 'internal error , too much user with this id ',
            },
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const userData = userDataResponse.userData

    if (userData === null) {
        res.status(400).json({
            payload: null,
            status: {
                code: 2342,
                details: 'no data or ...',
            },
        } as TResponseJSONData<Omit<TUserData, 'id'>>)
    }

    const requirements = await myApplication.getPersonRequirementsAsync(xAuth)

    requirements.forEach((elem) => {
        // console.log(
        //     `>>> ROUTE get-user-protected :: requirement: userID:` +
        //         elem.userId +
        //         ' | requirement id: ' +
        //         elem.id
        // )
    })

    const responseData: TResponseJSONData<
        Omit<TUserData, 'id'> & { requirements: IRequirementStatsType[] }
    > = {
        status: {
            code: 0,
            details: 'user data',
        },
        payload: userData
            ? {
                  userName: userData.userName,
                  wallet: userData.wallet,
                  requirements,
              }
            : null,
    }

    res.status(200).json(responseData)
})

type TGetRequirementsRequestBody = {}

// const v: TAuthRequestHeaders = {
//     "x-auth":''
// }

webApp.post(
    '/get-user-requirements-protected',
    async (req: Request, res: Response) => {
        const headers = req.headers

        const userId = headers['x-auth'] as string | undefined

        const { body } = req

        // if (body === undefined) {
        //     res.status(500).json({
        //         foo: 'bar',
        //         details: 'server error',
        //     })
        // }

        if (userId === undefined) {
            return res.status(500).json({
                status: {
                    code: 1,
                    details: 'internal error',
                },
                payload: null,
            } as TResponseJSONData<TRequirementStats[]>)
        }

        try {
            const requirements =
                await myApplication.getPersonRequirementsAsync(userId)

            res.status(200).json({
                status: {
                    code: 0,
                    details: 'requirements',
                },
                payload: requirements,
            } as TResponseJSONData<IRequirementStatsType[]>)
        } catch (e) {
            console.log({ e })
            res.status(500).json({
                status: {
                    code: 1,
                    details: 'internal error',
                },
                payload: null,
            } as TResponseJSONData<TRequirementStats[]>)
        }
    }
)

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

// function routeHandlerWrapper(request:Request , response:Response , handler:() => ):void {

// }

// Пример маршрута с параметрами
// app.get('/hello/:name', (req, res) => {
//     const name = req.params.name;
//     res.send(`Привет, ${name}!`);
// });

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

type TGetRequiremenstResponse = {
    requirements: TRequirementStats[]
}
