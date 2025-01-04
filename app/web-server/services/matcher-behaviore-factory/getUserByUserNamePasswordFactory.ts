import { Request, Response } from 'express'
import { IOrginaryResponse } from '../../express'
import { IUserStats } from '../../../core/src/person/Person'
import { ApplicationSingletoneFacade } from '../../../core/src/ApplicationFacade'

export async function getUserByUserNameAndPasswordHandler(
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) {
    const requesBodyData = req.body as
        | { userName: string; password: string }
        | null
        | undefined

    if (typeof requesBodyData !== 'object') {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'no body object or smth wrong',
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }

    if (requesBodyData === null) {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 2,
                    details: 'no body object , body object is null',
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }

    const responsedUserStatsData = await app.loginUser(
        requesBodyData.userName,
        requesBodyData.password
    )

    const responsePayload = responsedUserStatsData.payload
    const responseStatus = responsedUserStatsData.status

    if (responsePayload === null) {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: responseStatus.code,
                    details: responseStatus.details,
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }

    return new Promise((resolve) => {
        res.status(200).json({
            payload: {
                authToken: responsePayload.authToken,
                userStats: responsePayload.userStats,
            },
            status: {
                code: responseStatus.code,
                details: responseStatus.details,
            },
        } as IOrginaryResponse<{
            userStats: IUserStats
            authToken: string
        }>)
        resolve('')
    })
}
