import { IDataBaseConnector } from '../../../../db/app'
import { IUserStats, TAuthServiceCheckTokenResponse, TDatabaseResultStatus } from '../../types/commonTypes'

export interface IAuthService {
    authUser(
        username: string,
        password: string
    ): Promise<TDatabaseResultStatus<Pick<IUserStats, 'id'>>>
    checkToken(token: string): TAuthServiceCheckTokenResponse
}



export class AuthService implements IAuthService {
    dataBaseConnector: IDataBaseConnector
    checkToken(token: string): TAuthServiceCheckTokenResponse {
        return {
            payload: {
                updatedToken: token,
            },
            status: {
                code: 0,
                description: 'token is valid',
            },
        }
    }
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
