const bodyParser = require('body-parser')
const cors = require('cors')

import express, { Express, Request, RequestHandler, Response } from 'express'
import { Server } from 'http'
import { getUserByUserNameAndPasswordHandler } from './services/matcher-behaviore-factory/express-handlers/getUserByUserNamePasswordFactory'
import { ApplicationSingletoneFacade } from '../core/src/ApplicationFacade'
import { updateUserExpressHandler } from './services/matcher-behaviore-factory/express-handlers/updateUserExpressHandler'
import { deleeteUserRequirementExpressHandler } from './services/matcher-behaviore-factory/express-handlers/deleteUserRequirementExpressHandler'
import { chckIfUserAuthExpressHandler as checkIfUserAuthExpressHandler } from './services/matcher-behaviore-factory/express-handlers/checkIfUserAuthExpressHandler'
import { getUserWithToken } from './services/matcher-behaviore-factory/express-handlers/getUserWithTokenHandler'
import { registrationExpressHandler } from './services/matcher-behaviore-factory/express-handlers/registrationHandler'
import { addUserRequirementsExpressHandler } from './services/matcher-behaviore-factory/express-handlers/addUserRequirementExpressHandler'

const webServerExpress: Express = express()

export class WebServerDriver {
    start() {
        const port: number = 3030

        this.httpServer = webServerExpress.listen(port, () => {
            console.log('http server started on port : ' + port)
        })
    }

    stop() {
        this.httpServer?.close()
    }

    private expressServer: Express
    private httpServer: Server | null

    constructor(app: ApplicationSingletoneFacade) {
        this.httpServer = null

        // Middleware для парсинга JSON
        webServerExpress.use(cors())
        webServerExpress.use(bodyParser())
        webServerExpress.use(express.json())

        this.expressServer = webServerExpress

        this.expressServer.post(
            '/get-user-with-username-and-password',
            (req: Request, res: Response) => {
                getUserByUserNameAndPasswordHandler(app, req, res)
            }
        )
        this.expressServer.post(
            '/update-user',
            (req: Request, res: Response) => {
                updateUserExpressHandler(app, req, res)
            }
        )
        this.expressServer.post(
            '/delete-requirement-protected-ep',
            (req: Request, res: Response) => {
                deleeteUserRequirementExpressHandler(app, req, res)
            }
        )
        this.expressServer.post(
            '/check-user-auth-protected-ep',
            (req: Request, res: Response) => {
                checkIfUserAuthExpressHandler(app, req, res)
            }
        )
        this.expressServer.post(
            '/get-user-with-token',
            (req: Request, res: Response) => {
                getUserWithToken(app, req, res)
            }
        )
        this.expressServer.post(
            '/registration',
            (req: Request, res: Response) => {
                registrationExpressHandler(app, req, res)
            }
        )
        this.expressServer.post(
            '/add-user-requirements-protected',
            (req: Request, res: Response) => {
                addUserRequirementsExpressHandler(app, req, res)
            }
        )
        // this.expressServer.post('/update-user' , () => {});
    }
}
