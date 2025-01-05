import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../../core/src/ApplicationFacade'
import {
    IOrdinaryResponse,
    IUserStats,
} from '../../../../core/src/types/commonTypes'

export async function getUserByUserNameAndPasswordHandler(
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) {
    console.log('get user by password and username')

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
            } as IOrdinaryResponse<null>)
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
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    const responsedUserStatsData = await app.loginUser(
        requesBodyData.userName,
        requesBodyData.password
    )

    console.log(responsedUserStatsData, requesBodyData)

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
            } as IOrdinaryResponse<null>)
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
        } as IOrdinaryResponse<{
            userStats: IUserStats
            authToken: string
        }>)
        resolve('')
    })
}
