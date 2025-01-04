import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../../core/src/ApplicationFacade'

import { IOrdinaryResponse, IUserStats } from '../../../../core/src/types/commonTypes'

export const getUserWithToken = async (
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) => {
    const headers = req.headers

    const AUTHtOKEN = headers['x-auth']

    if (typeof AUTHtOKEN !== 'string') {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'details bla bla',
                },
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    const userDataResponse = await app.getUserWithAuthToken(AUTHtOKEN)

    if (userDataResponse === null) {
        return new Promise((resolve) => {
            res.status(401).json({
                payload: null,
                status: {
                    code: 401,
                    details: 'Unauthorized',
                },
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    return new Promise((resolve) => {
        res.status(200).json({
            payload: userDataResponse,
            status: {
                code: 0,
                details: 'user data and auth token',
            },
        } as IOrdinaryResponse<{
            userStats: IUserStats
            authToken: string
        }>)
        resolve('')
    })
}
