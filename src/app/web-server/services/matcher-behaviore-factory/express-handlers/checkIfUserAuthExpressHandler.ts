import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../../core/src/ApplicationFacade'
import {
    IOrdinaryResponse,
    TCheckUserAuthResponseData,
} from '../../../../core/src/types/commonTypes'

export const chckIfUserAuthExpressHandler = async (
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) => {
    const headers = req.headers

    const xAuth = headers['x-auth']

    if (typeof xAuth !== 'string') {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'internal error',
                },
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    const authServiceResponse = app.checkUserAuth(xAuth)

    const { status, payload } = authServiceResponse

    if (status.code !== 0) {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 2,
                    details: 'invalid token , probably',
                },
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    if (payload === null) {
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'internal error',
                },
            } as IOrdinaryResponse<null>)
            resolve('')
        })
    }

    return new Promise((resolve) => {
        res.status(201).json({
            status: {
                code: 0,
                details: 'token updated',
            },
            payload: {
                token: payload.updatedToken,
            },
        } as IOrdinaryResponse<TCheckUserAuthResponseData>)
        resolve('')
    })
}
