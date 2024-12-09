console.log('starting the server...')

let isRunning = true

async function runContinuousTask() {
    console.log('looper started')

    while (isRunning) {
        console.log('Задача выполняется...')
        // Здесь можно выполнить асинхронные операции, например, запросы к базе данных
        await new Promise((resolve) => setTimeout(resolve, 1000 / 60)) // Задержка в 60 милисекунд
    }

    console.log('loop stoped')
}

runContinuousTask()
