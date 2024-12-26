import { IDataBaseConnector } from '../../../db/app'
import { IPerson, OrdinaryPerson } from '../person/Person'

export interface IPersonFactory {
    createAsync(
        username: string,
        password: string,
        objectsPull: IPerson[],
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null>
}

export abstract class PersonFactory implements IPersonFactory {
    async createAsync(
        username: string,
        password: string,
        objectsPull: IPerson[],
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null> {
        // middleware

        const result = await dBConnector.addPersonAsync(username, password)

        if (!result.status) {
            return null
        }

        const userId = result.userData?.id

        if (userId === undefined) {
            return null
        }

        if (result.userData === null) {
            return null
        }

        const user = new OrdinaryPerson(
            username,
            0,
            userId,
            result.userData.updatedTimeStamp,
            result.userData.createdTimeStamp
        )

        return user
    }
}

export class UserPersonFactory extends PersonFactory {
    constructor() {
        super()
    }
}
