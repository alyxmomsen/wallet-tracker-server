import { Request, Response } from 'express'
import { authService, myApplication } from '..'
import { TWalletData } from '../db/app'
import { TRequirementStats } from '../core/src/requirement-command/RequirementCommand'
import { AddRequirementsBodyValidator } from './services/body-check-service'

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

type TAuthUserData = {
    userId: string
}

export type TUserData = {
    userName: string
    wallet: number
    id: string
    requirements:TRequirementStats[]
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

// dev: user id ; prod: jwt
type TAuthRequestHeaders = {
    'x-auth': string
}

type TCheckUserAuthResponseData = {
    token: string
}

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
    const token = req.headers['x-auth']

    if (typeof token !== 'string') {
        const responseData: TResponseJSONData<TUserData> = {
            status: {
                code: 1,
                details: 'no token',
            },
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const userDataResponse = await myApplication.getPersonDataByIdAsync(token)

    // console.log({userDataResponse});

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

    const responseData: TResponseJSONData<Omit<TUserData, 'id'>> = {
        status: {
            code: 0,
            details: 'user data',
        },
        payload: userData
            ? {
                  userName: userData.userName,
                wallet: userData.wallet,
                requirements: [
                    {
                        date: 1231231231,
                        description: 'no nononono',
                        isExecuted: false,
                        title: 'tilte',
                        transactionTypeCode: 0,
                        value:200000
                    }
                ]
              }
            : null,
    }

    res.status(200).json(responseData)
})

type TGetRequirementsRequestBody = {}

// const v: TAuthRequestHeaders = {
//     "x-auth":''
// }

type TGetRequiremenstResponse = {
    requirements: TRequirementStats[]
}

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
            } as TResponseJSONData<TRequirementStats[]>)
        } catch (e) {
            console.log({e});
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

export interface IRequirementFields {
    cashFlowDirectionCode: number
    dateToExecute: number
    description: string
    isExecuted: boolean
    title: string
    userId: string
    value: number
}

webApp.post(
    '/add-user-requirements-protected',
    async (req: Request, res: Response) => {

        console.log({body:'body body body'});

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


            const updatedUser = await myApplication.addUserRequirement({ ...body , userId:xAuth });
            
            return res.status(200).json({
                payload: {
                    id: updatedUser.getId(),
                    userName: updatedUser.getUserName(),
                    wallet: updatedUser.getWalletBalance(),
                    requirements: [
                        
                    ]
                },
                status: {
                    code: 0,
                    details: 'details',
                },
            } as TResponseJSONData<TUserData>)
        }
        catch (error) {
            console.log({error});
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

// Пример маршрута для обработки POST-запроса
// app.post('/data', (req, res) => {
//     const data = req.body;
//     res.json({
//         message: 'Данные получены!',
//         receivedData: data
//     });
// });

// Запуск сервера
webApp.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`)
})

export default webApp

function bodyValidator(req: Request) {
    // const { body }: { body: IBody | undefined } = req

    // if (!body) {
    //     return res.status(400).json({
    //         details: 'no body',
    //     })
    // }

    // const { username, password } = body

    // if (username === undefined || password === undefined) {
    //     console.log({ body })
    //     return res.status(400).json({
    //         details: 'no username or no password',
    //     })
    // }

    return false
}
