import { Request, Response } from 'express'
import { app, dataBaseDriver } from '..'
import {
    addPersonIntoFireStore,
    checkRecordExistsByField,
} from '../db/firebase'
import { TDatabaseResultStatus } from '../db/core'

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

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    // new OrdinaryPerson('Nobody Person', 0);

    const body = req

    // console.log({ body })

    const docRef = await dataBaseDriver.addPerson(
        'hello' + Date.now(),
        'world' + Date.now()
    )
    // new DataBaseDriver();

    console.log('requested')
    res.send('Привет, мир!' + ' ' + docRef.id)
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

    const documentData = await checkRecordExistsByField(username, password)

    if (!documentData.length) {
        return res.status(400).json({
            details: 'user is not exists',
        })
    }

    documentData.forEach((e) => console.log(e.id))

    // console.log({ body, documentData, login, pass })
    res.status(200).json({
        details: 'authorized',
        username: 'login',
        userId: 'id',
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

    console.log({ body })

    return app.addPerson(
        username,
        password,
        (databaseResulStatus: TDatabaseResultStatus) => {
            if (databaseResulStatus.status) {
                res.status(200).json({
                    status: databaseResulStatus.statusCode,
                    details: databaseResulStatus.details,
                    userId: databaseResulStatus.userId,
                })
            } else {
                res.status(400).json({
                    status: databaseResulStatus.statusCode,
                    details: databaseResulStatus.details,
                })
            }
        }
    )
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

// class

export default webApp
