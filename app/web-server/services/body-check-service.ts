import { Request, Response } from 'express'

export interface IBodyValidatorService {
    execute(req: Request, res: Response): any
}

export class AddRequirementsBodyValidator implements IBodyValidatorService {
    execute(req: Request, res: Response) {
        const body = req.body

        if (body === undefined) {
            return 1
        }

        const {
            cashFlowDirectionCode,
            dateToExecute,
            description,
            isExecuted,
            title,
            value,
        } = body

        if (
            cashFlowDirectionCode == undefined ||
            dateToExecute == undefined ||
            description == undefined ||
            isExecuted == undefined ||
            title == undefined ||
            value == undefined
        ) {
            return 2
        }

        return 0
    }
}
