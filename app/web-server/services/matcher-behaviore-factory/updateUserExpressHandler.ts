import { Request, Response } from 'express'
import {
    IOrginaryResponse,
    TUserStatsOmitPasswordOrdinaryResponse,
} from '../../express'
import { IUserStats } from '../../../core/src/person/Person'
import { ApplicationSingletoneFacade } from '../../../core/src/ApplicationFacade'
import { SimpleLogger } from '../../../utils/SimpleLogger'

export async function updateUserExpressHandler(
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) {
    const token = req.headers['x-auth']
    const body = req.body as Omit<IUserStats, 'password'>

    const log = new SimpleLogger('UPDATE USER MATCHER').createLogger()

    log('matcher started')

    // validate req data and headers

    if (typeof token !== 'string') {
        log('token type ::: FALSE')

        return new Promise((resolve) => {
            res.status(403).json({
                payload: null,
                status: {
                    code: 403,
                    details: 'forbidden , wrong token data type',
                },
            } as IOrginaryResponse<{ foo: 'bar' }>)

            resolve('')
        })
    }

    log('token type ::: OK')

    // --------------------------

    log('starting APP::REPLICATEUSER...')

    const response = await app.replicateUser({ ...body, token })

    log('APP::REPLICATEUSER response :')
    console.log(response.payload?.getAllReauirementCommands())

    const updatedUser = response.payload

    if (updatedUser === null) {
        log('APP::REPLICATEUSER response ::: FAIL')

        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or smth else',
                },
            } as TUserStatsOmitPasswordOrdinaryResponse)

            resolve('')
        })
    }

    const userStats = await app.getPersonStatsByIdAsync(updatedUser.getId())

    if (userStats.userData === null)
        return new Promise((resolve) => {
            res.status(501).json({
                payload: null,
                status: {
                    code: 501,
                    details: 'internal error , or i dont know',
                },
            } as TUserStatsOmitPasswordOrdinaryResponse)

            resolve('')
        })

    return new Promise((resolve) => {
        res.status(200).json({
            payload: userStats.userData,
            status: {
                code: 200,
                details: 'OK , user is updated',
            },
        } as TUserStatsOmitPasswordOrdinaryResponse)

        resolve('')
    })
}
