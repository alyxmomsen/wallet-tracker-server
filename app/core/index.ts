import { fork } from 'child_process'
import { ApplicationSingletoneFacade } from './src/ApplicationFacade'
import {
    IPersonFactory,
    UserPersonFactory,
} from './src/factories/PersonFactory'
import { AuthService } from './src/services/auth-service/AuthService'
import { FirebaseConnector, IDataBaseConnector } from '../db/app'

class AppCore {
    private myApp: ApplicationSingletoneFacade
    private dataBaseConnector: IDataBaseConnector
    private userFactory: IPersonFactory

    constructor() {
        this.dataBaseConnector = new FirebaseConnector()
        this.userFactory = new UserPersonFactory()
        this.myApp = ApplicationSingletoneFacade.Instance(
            this.dataBaseConnector,
            this.userFactory,
            new AuthService(this.dataBaseConnector)
        )
    }
}

const app = new AppCore()


// const child = fork('../web-server/express.ts')

// child.on('message', (msg) => {
//   console.log('Received from child:', msg);
// });

// Отправка сообщения в дочерний процесс
// child.send('Hello, child!');

// child.js
// process.on('message', (msg) => {
//   console.log('Received from parent:', msg);
//   process.send('Hello, parent!');
// });

async function startLoop() {
    let run = true
    let i = 0
    let lastTImeStamp = Date.now()
    setTimeout(() => (run = false), 3000)
    while (run) {
        const now = Date.now()

        const diff = now - lastTImeStamp

        // console.log('iteration' + ++i, diff)

        lastTImeStamp = now

        await new Promise((res) => {
            setTimeout(res, 1000 / 60)
        })
    }
}

startLoop()
