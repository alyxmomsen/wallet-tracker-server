const express = require('express');
const app = express();
const port = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Простой маршрут по умолчанию
app.get('/', (req, res) => {
    res.send('Привет, мир!');
});

// Пример маршрута с параметрами
app.get('/hello/:name', (req, res) => {
    const name = req.params.name;
    res.send(`Привет, ${name}!`);
});

// Пример маршрута для обработки POST-запроса
app.post('/data', (req, res) => {
    const data = req.body;
    res.json({
        message: 'Данные получены!',
        receivedData: data
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
