export interface IExpressRouteHandler {}

export interface IExpressRouteManager {
    getHandlers(): IExpressRouteHandler[]
}

export class ExpressRouteManager implements IExpressRouteManager {
    private handlers: IExpressRouteHandler[]

    getHandlers(): IExpressRouteHandler[] {
        return []
    }

    constructor() {
        this.handlers = []
    }
}
