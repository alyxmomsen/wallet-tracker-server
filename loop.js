'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const ApplicationServerFacade_1 = require('./app/core/ApplicationServerFacade')
console.log('starting the server...')
const application = new ApplicationServerFacade_1.ApplicationSingletoneFacade()
const persons = application.getPersons()
console.log({ persons })
let isRunning = true
async function runContinuousTask() {
    console.log('starting loop...')
    const started = Date.now()
    console.log('started in ' + started)
    while (isRunning) {
        const now = Date.now()
        if (now - started > 3000) {
            isRunning = false
            break
        }
        // console.log('Задача выполняется...');
        // Здесь можно выполнить асинхронные операции, например, запросы к базе данных
        await new Promise((resolve) => setTimeout(resolve, 1000 / 60)) // Задержка в 5 секунд
    }
    console.log('loop stoped')
}
runContinuousTask()
