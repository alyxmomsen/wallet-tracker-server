'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const __1 = require('..')
const firebase_1 = require('../db/firebase')
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const webApp = express()
const port = 3030
// Middleware для парсинга JSON
webApp.use(cors())
webApp.use(bodyParser())
webApp.use(express.json())
// Простой маршрут по умолчанию
webApp.get('/', async (req, res) => {
    // new OrdinaryPerson('Nobody Person', 0);
    const body = req
    console.log({ body })
    const docRef = await __1.dataBaseDriver.addPerson(
        'hello' + Date.now(),
        'world' + Date.now()
    )
    // new DataBaseDriver();
    console.log('requested')
    res.send('Привет, мир!' + ' ' + docRef.id)
})
webApp.post('/auth', async (req, res) => {
    const { body } = req
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
    const documentData = await (0, firebase_1.checkRecordExistsByField)(
        username,
        password
    )
    if (documentData === null) {
        return res.status(400).json({
            details: 'user is not exists',
        })
    }
    console.log({ body })
    res.status(200).json({
        details: 'authorized',
        username,
    })
})
webApp.post('/registration', async (req, res) => {
    const { body } = req
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
    const result = await (0, firebase_1.checkRecordExistsByField)(
        username,
        password
    )
    if (result) {
        return res.status(400).json({
            details: 'user exists',
        })
    }
    const docRef = await (0, firebase_1.addPerson)(username, password)
    const { id } = docRef
    res.status(200).json({
        details: 'OK',
        result,
        id,
    })
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
exports.default = webApp
