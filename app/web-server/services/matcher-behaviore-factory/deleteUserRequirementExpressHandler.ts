import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../core/src/ApplicationFacade'
import { IOrginaryResponse, TCheckUserAuthResponseData } from '../../express'
import { SimpleLogger } from '../../../utils/SimpleLogger'

export async function deleeteUserRequirementExpressHandler(
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) {
    {
        const log = new SimpleLogger(
            'delete requirement route',
            false
        ).createLogger()

        log('Route /delete-requirement-protected-ep')

        // const response = () => responseDataFactory<null>(null , 12))
        /* xAuth check */

        const xAuth = req.headers['x-auth']

        // const xAuthType = typeof xAuth;

        if (typeof xAuth === 'object') {
            log('xAuth data type FAILED: ' + typeof xAuth)

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 15))
                resolve('')
            })
        }

        if (typeof xAuth === 'undefined') {
            log('xAuth data type FAILED: ' + typeof xAuth)

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 16))
                resolve('')
            })
        }

        log('xAuth data SUCCESS')

        /* body check */

        if (req.body === undefined || req.body === null) {
            log('body FAILED')

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 12))
                resolve('')
            })
        }

        const bodyData = req.body as
            | { requirementId: string }
            | null
            | undefined

        const requirementId = bodyData?.requirementId

        if (requirementId === undefined) {
            log('no requirement id data')

            return new Promise((resolve) => {
                res.status(500).json(responseDataFactory<null>(null, 13))
                resolve('')
            })
        }

        log('BODY data is SUCCESS')

        log('tying to delete user requirement...')

        const response = await app.deleteUserRequirement(requirementId, xAuth)

        const responseData: IOrginaryResponse<{ requirementId: string }> = {
            payload: {
                requirementId: 'test string',
            },
            status: {
                code: 0,
                details: 'successfully',
            },
        }

        return new Promise((resolve) => {
            res.status(200).json(responseData)
            resolve('')
        })
    }
}

function responseDataFactory<T>(
    responseData: T,
    statusCode: number,
    details: string = 'no details'
): IOrginaryResponse<T> {
    return {
        payload: responseData,
        status: {
            code: statusCode,
            details,
        },
    }
}
