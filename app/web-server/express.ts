import { Request, Response } from 'express'
import { app, dataBaseDriver } from '..'

const express = require('express')

const cors = require('cors')
const webApp = express()
const port = 3030

// Middleware для парсинга JSON
webApp.use(express.json())
webApp.use(cors())

// Простой маршрут по умолчанию
webApp.get('/', async (req: Request, res: Response) => {
    // new OrdinaryPerson('Nobody Person', 0);

    const body = req

    console.log({ body })

    const docRef = await dataBaseDriver.addPerson(
        'hello' + Date.now(),
        'world' + Date.now()
    )
    // new DataBaseDriver();

    console.log('requested')
    res.send('Привет, мир!' + ' ' + docRef.id)
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
