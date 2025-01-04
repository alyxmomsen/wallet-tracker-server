export interface IMatcherBehaviorFactory {
    create(): (req: Request, res: Response) => Promise<any>
}
