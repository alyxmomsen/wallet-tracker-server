import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../core/src/ApplicationFacade'
import { IOrginaryResponse, TCheckUserAuthResponseData } from '../../express'

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
            } as IOrginaryResponse<null>)
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
            } as IOrginaryResponse<null>)
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
            } as IOrginaryResponse<null>)
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
        } as IOrginaryResponse<TCheckUserAuthResponseData>)
        resolve('')
    })
}
