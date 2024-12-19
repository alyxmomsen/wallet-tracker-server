import { Request, Response } from 'express'
import { ApplicationSingletoneFacade } from '../../core/src/ApplicationFacade'

export async function registration(
    req: Request,
    res: Response,
    application: ApplicationSingletoneFacade
) {
    // const { body }: { body: IBody | undefined } = req
    //     if (!body) {
    //         return res.status(400).json({
    //             details: 'no body',
    //         })
    //     }
    //     const { username, password } = body
    //     if (username === undefined || password === undefined) {
    //         return res.status(400).json({
    //             details: 'no username or no password',
    //         })
    //     }
    //     const {
    //         status: code,
    //         message: details,
    //         userData,
    //     } = await application.addUserAsync(username, password)
    //     return res.status(code ? 200 : 400).json({
    //         status: {
    //             code: 0,
    //             details:'user registrated successfully',
    //         },
    //         payload: {
    //             userId:userData?.id
    //         }
    //     } as TResponseJSONData)
}
