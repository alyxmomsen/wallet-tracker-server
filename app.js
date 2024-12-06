console.log('privet mir');


let started = 0;

let average = 0;

const values = [];

let iterations = 0;

async function runContinuousTask() {
    while (true) {

        const now = Date.now();

        const diff = now - started;

        if (diff > 1000) {
            // console.log(diff);

            if (iterations !== 0) {
                
                values.push(diff);
                const summ = values.reduce((prev , curr , i) => {
                    return prev + curr ;
                })
    
                console.log(summ / values.length);
            }
            
            
            
            started = now;
            iterations++;
            

        }
        
        // console.log('Задача выполняется...');
        // Здесь можно выполнить асинхронные операции, например, запросы к базе данных
        await new Promise(resolve => setTimeout(resolve, 1000 / 60)); // Задержка в 5 секунд
    }
}

runContinuousTask();