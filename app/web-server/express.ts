import { Request, Response } from 'express'

import { DocumentData } from 'firebase/firestore'
import { authService, myApplication } from '..'
import { TDataBaseUser } from '../db/app'

const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const webApp = express()
const port = 3030

// Middleware для парсинга JSON
webApp.use(cors())
webApp.use(bodyParser())
webApp.use(express.json())

export interface IBody {
    username: string
    password: string
}

type TUserData = {
    userId: string
}

type TResponseJSONData = {
    status: boolean
    details: string
    payload: TUserData | null
}

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webApp.post('/auth', async (req: Request, res: Response) => {
    const { body }: { body: IBody | undefined } = req

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

    const { username: name } = data as TDataBaseUser

    res.status(200).json({
        details: 'authorized',
        username: name,
        userId: userData.id,
    })
})

webApp.post('/registration', async (req: Request, res: Response) => {
    const { body }: { body: IBody | undefined } = req

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
        status: code,
        message: details,
        userData,
    } = await myApplication.addUserAsync(username, password)

    return res.status(code ? 200 : 400).json({
        status: code,
        details,
        payload: {
            userId: userData?.id,
        },
    } as TResponseJSONData)
})

webApp.post('/get-user', async (req: Request, res: Response) => {
    console.log('get user')

    const token = req.headers['x-auth']

    if (typeof token !== 'string') {
        const responseData: TResponseJSONData = {
            status: false,
            details: 'no token',
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const userDocument: DocumentData | null =
        await myApplication.getPersonByIdAsync(token)

    if (userDocument === null) {
        const responseData: TResponseJSONData = {
            status: false,
            details: 'no user',
            payload: null,
        }

        return res.status(300).json(responseData)
    }

    const responseData: TResponseJSONData & { userId: string } = {
        status: true,
        details: 'user data',
        payload: userDocument.username,
        userId: token,
    }

    res.status(200).json(responseData)
})

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
