import { IDataBaseConnector, TDatabaseResultStatus } from '../../../db/app'

export interface IAuthService {
    authUser(username: string, password: string): Promise<TDatabaseResultStatus>
}

export class AuthService implements IAuthService {
    dataBaseConnector: IDataBaseConnector
    async authUser(username: string, password: string) {
        const { message, status, userData } =
            await this.dataBaseConnector.getPersonByFields(username, password)

        return {
            message,
            status,
            userData,
        }
    }

    constructor(dBConnector: IDataBaseConnector) {
        this.dataBaseConnector = dBConnector
    }
}
