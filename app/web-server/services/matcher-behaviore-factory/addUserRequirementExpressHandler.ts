import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../../core/src/ApplicationFacade'
import {
    IOrginaryResponse,
    TAuthUserData,
    TRequestBodyType,
} from '../../express'
import { SimpleLogger } from '../../../utils/SimpleLogger'
import { IPerson, IUserStats } from '../../../core/src/person/Person'

export const addUserRequirementsExpressHandler = async (
    app: ApplicationSingletoneFacade,
    req: Request,
    res: Response
) => {
    const log = new SimpleLogger('ADD USER REQUIREMENT MATCHER').createLogger()
    log('matcher start...')
    // const addRequirementService: IAddUserRequirementService =
    //     new AddUserRequirementService()

    // addRequirementsBodyValidatorService.execute(req, res)

    const body = req.body

    if (body === undefined) {
        log('body ::: Fail')
        return new Promise((resolve) => {
            res.status(200).json({
                payload: null,
                status: {
                    code: 1,
                    details: 'internal error , no body',
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }

    log('body ::: OK')
    // check headers the x-auth

    const xAuth = req.headers['x-auth']

    if (typeof xAuth !== 'string') {
        log('xAuth type ::: Fail')
        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 2,
                    details: 'auth header data error',
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }

    log('xAuth type ::: OK')

    try {
        log('Adding user requirement...')
        const response = await app.addUserRequirement({
            ...body,
            authToken: xAuth,
        })

        if (response.payload === null) {
            log('adding user requiremtn ::: FAIL')
            return new Promise((resolve) => {
                res.status(response.status.code).json({
                    payload: null,
                    status: {
                        code: response.status.code,
                        details: response.status.details,
                    },
                } as IOrginaryResponse<null>)
                resolve('')
            })
        }

        const responsedPerson: IPerson = response.payload

        return new Promise((resolve) => {
            res.status(200).json({
                payload: responsedPerson.getStats(),
                status: {
                    code: 0,
                    details: 'updated user data',
                },
            } as IOrginaryResponse<IUserStats>)
            resolve('')
        })
    } catch (error) {
        log('adding user requirement ERROR')

        return new Promise((resolve) => {
            res.status(500).json({
                payload: null,
                status: {
                    code: 5,
                    details: error,
                },
            } as IOrginaryResponse<null>)
            resolve('')
        })
    }
}
