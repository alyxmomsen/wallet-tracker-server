import { myApplication } from '..'
import { IUserStats } from '../core/src/person/Person'

const bodyParser = require('body-parser')
const cors = require('cors')

import express, { Express, Request, Response } from 'express'
import { getUserByUserNameAndPasswordHandler } from './services/matcher-behaviore-factory/getUserByUserNamePasswordFactory'
import { registrationExpressHandler } from './services/matcher-behaviore-factory/registrationHandler'
import { addUserRequirementsExpressHandler } from './services/matcher-behaviore-factory/addUserRequirementExpressHandler'
import { getUserWithToken } from './services/matcher-behaviore-factory/getUserWithTokenHandler'
import { chckIfUserAuthExpressHandler } from './services/matcher-behaviore-factory/checkIfUserAuthExpressHandler'
import { updateUserExpressHandler } from './services/matcher-behaviore-factory/updateUserExpressHandler'

const webServerExpress: Express = express()

webServerExpress.use(cors())
webServerExpress.use(bodyParser())
webServerExpress.use(express.json())

export type TUserStatsOmitPasswordOrdinaryResponse = IOrginaryResponse<
    Omit<IUserStats, 'password'>
>

export type TCheckUserAuthResponseData = {
    token: string
}

webServerExpress.post('/update-user', async (req: Request, res: Response) => {
    updateUserExpressHandler(myApplication, req, res)
})

webServerExpress.post(
    '/delete-requirement-protected-ep',
    async (req: Request, res: Response) => {}
)

webServerExpress.post(
    '/check-user-auth-protected-ep',
    async (req: Request, res: Response) => {
        chckIfUserAuthExpressHandler(myApplication, req, res)
    }
)

webServerExpress.get('/', async (req: Request, res: Response) => {
    res.send('Привет, мир!')
})

webServerExpress.post(
    '/get-user-with-token',
    async (req: Request, res: Response) => {
        getUserWithToken(myApplication, req, res)
    }
)

webServerExpress.post(
    '/get-user-with-username-and-password',
    (req: Request, res: Response) => {
        getUserByUserNameAndPasswordHandler(myApplication, req, res)
    }
)

webServerExpress.post('/registration', async (req: Request, res: Response) => {
    registrationExpressHandler(myApplication, req, res)
})

webServerExpress.post(
    '/add-user-requirements-protected',
    async (req: Request, res: Response) => {
        addUserRequirementsExpressHandler(myApplication, req, res)
    }
)

const port: number = 3030

webServerExpress.listen(port, () => {})

export default webServerExpress

export type TAuthUserData = {
    userId: string
}

export type TUserData = {
    name: string
    wallet: number
    createdTimeStamp: number
    updatedTimeStamp: number
    id: string
}

export type TDBUserData = {
    username: string
}

// p - payload
export type IOrginaryResponse<P> = {
    status: {
        code: number
        details: string
    }
    payload: P | null
}

//
export type TRequestBodyType = {
    userName: string
    password: string
}
