import { IDataBaseConnector } from '../../../db/core'
import { checkRecordExistsByField } from '../../../db/firebase'
import { IPerson, OrdinaryPerson } from '../person/Person'

export interface IPersonFactory {
    createAsync(
        username: string,
        password: string,
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null>
    // create(username:string , password);
}

export abstract class PersonFactory implements IPersonFactory {
    async createAsync(
        username: string,
        password: string,
        dBConnector: IDataBaseConnector
    ): Promise<IPerson | null> {
        const { status, id } = await dBConnector.addPersonAsync(
            username,
            password
        )

        if (!status) {
            return null
        }

        return new OrdinaryPerson(username, 0, id)
    }
}

export class UserPersonFactory extends PersonFactory {
    constructor() {
        super()
    }
}
