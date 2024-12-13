import { Request, Response } from 'express'

import { DocumentData } from 'firebase/firestore'
import { authService, myApplication } from '..'
import { TDataBaseUser } from '../db/app'
import { TRequirementStats } from '../core/src/RequirementCommand'

const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const webApp = express()
const port = 3030

// Middleware для парсинга JSON
webApp.use(cors())
webApp.use(bodyParser())
webApp.use(express.json())

type TAuthUserData = {
    userId: string
}

type TUserData = {
    userName: string
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
    username: string
    password: string
}

// dev: user id ; prod: jwt
type TAuthRequestHeaders = {
    'x-auth': string
}

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webApp.post('/auth', async (req: Request, res: Response) => {
    const { body }: { body: TRequestBodyType | undefined } = req

    if (!body) {
        return res.status(400).json({
            details: 'no body',
        })
    }

    const { username, password } = body

    if (username === undefined || password === undefined) {
        console.log({ body })
        return res.status(400).json({
            details: 'no username or no password',
        })
    }

    /* ============= */

    const { userData } = await authService.authUser(username, password)

    if (!userData) {
        return res.status(400).json({
            details: 'user is not exists',
        })
    }

    const data = await myApplication.getPersonByIdAsync(userData.id)

    if (!data) {
        return res.status(400).json({
            details: 'user is not exists , sorry',
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

    const { username, password } = body

    if (username === undefined || password === undefined) {
        console.log({ body })
        return res.status(400).json({
            details: 'no username or no password',
        })
    }

    const {
        status,
        message: details,
        userData,
    } = await myApplication.addUserAsync(username, password)

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

    const userDocument: DocumentData | null =
        await myApplication.getPersonByIdAsync(token)

    if (userDocument === null) {
        const responseData: TResponseJSONData<TUserData> = {
            status: {
                code: 2,
                details: 'no user',
            },
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const responseData: TResponseJSONData<TUserData> = {
        status: {
            code: 0,
            details: 'user data',
        },
        payload: {
            userName: userDocument.username,
        },
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

        const { 'x-auth': authHeader } = headers

        const { body } = req

        console.log({ authHeader, body })

        // if (body === undefined) {
        //     res.status(500).json({
        //         foo: 'bar',
        //         details: 'server error',
        //     })
        // }

        try {
            const requirements = await myApplication.getPersonRequirementsAsync(
                authHeader as string
            )
            console.log({ requirements })

            const response: TResponseJSONData<TRequirementStats[]> = {
                status: {
                    code: 0,
                    details: 'requirements',
                },
                payload: requirements,
            }

            res.status(200).json(response)
        } catch (e) {
            const response: TResponseJSONData<TRequirementStats[]> = {
                status: {
                    code: 1,
                    details: 'internal error',
                },
                payload: null,
            }

            res.status(500).json(response)
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
