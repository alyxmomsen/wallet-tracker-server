import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../../core/src/ApplicationFacade'
import {
    IOrdinaryResponse,
    TAuthUserData,
    TRequestBodyType,
} from '../../../../core/src/types/commonTypes'

export const registrationExpressHandler = async (
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) => {
    const { body }: { body: TRequestBodyType | undefined } = req

    if (!body) {
        return new Promise((resolve) => {
            res.status(400).json({
                details: 'no body',
            })
            resolve('')
        })
    }

    const { userName, password } = body

    if (userName === undefined || password === undefined) {
        return new Promise((resolve) => {
            res.status(400).json({
                details: 'no username or no password',
            })
            resolve('')
        })
    }

    const {
        status,
        message: details,
        userData,
    } = await app.addUserAsync(userName, password)

    if (!status) {
        return new Promise((resolve) => {
            res.status(400).json({
                status: {
                    code: 2,
                    details: 'user alredy exists',
                },
                payload: null,
            } as IOrdinaryResponse<TAuthUserData>)
            resolve('')
        })
    }

    return new Promise((resolve) => {
        res.status(200).json({
            status: {
                code: 0,
                details: 'user registrated successfully',
            },
            payload: {
                userId: userData?.id,
            },
        } as IOrdinaryResponse<TAuthUserData>)
        resolve('')
    })
}
