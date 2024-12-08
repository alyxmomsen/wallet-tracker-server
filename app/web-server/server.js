'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3030
// Middleware для парсинга JSON
app.use(express.json())
app.use(cors())
// Простой маршрут по умолчанию
app.get('/', (req, res) => {
    console.log('requested')
    res.send('Привет, мир!')
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
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`)
})
