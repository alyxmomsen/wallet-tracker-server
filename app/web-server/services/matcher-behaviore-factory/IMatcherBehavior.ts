import { Request, Response } from 'express'

export interface IMatcherBehaviorFactory {
    create(): (req: Request, res: Response) => Promise<any>
}
