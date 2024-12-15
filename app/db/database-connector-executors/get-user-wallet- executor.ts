import { IDataBaseConnector } from '../app'

export interface IDataBaseConnectorExecutor {
    executeAsync(dbConnector: IDataBaseConnector): Promise<number>
    execute(): any
}

export class GetUserWalletExecutor implements IDataBaseConnectorExecutor {
    execute() {
        return
    }

    executeAsync(dbConnector: IDataBaseConnector): Promise<number> {
        dbConnector.getDataAsync()
        // const data:T =

        return Promise.resolve(0)
    }
}
